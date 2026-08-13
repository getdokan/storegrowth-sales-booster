<?php
/**
 * Enqueue class.
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Modules\SalesPop;

use StorePulse\StoreGrowth\Interfaces\HookRegistry;
use StorePulse\StoreGrowth\Traits\Singleton;
use StorePulse\StoreGrowth\Helper as PluginHelper;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Add styles and scripts files of `Countdown Timer` module inside this class.
 */
class EnqueueScript implements HookRegistry {
    use Singleton;

    /**
     * Register Hooks.
     *
     * @since 2.0.0
     *
     * @return void
     */
    public function register_hooks(): void {
		// Assets for frontend.
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_scripts' ) );
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_styles' ) );

		// Assets for Admin Panel.
		add_action( 'admin_enqueue_scripts', array( $this, 'admin_enqueue_scripts' ) );

		// Invalidate the cached storefront popup payload when the popup config
		// or any product changes.
		add_action( 'update_option_spsg_popup_products', array( $this, 'flush_popup_cache' ) );
		add_action( 'save_post_product', array( $this, 'flush_popup_cache' ) );
		add_action( 'woocommerce_update_product', array( $this, 'flush_popup_cache' ) );
		add_action( 'woocommerce_new_product', array( $this, 'flush_popup_cache' ) );
		add_action( 'woocommerce_delete_product', array( $this, 'flush_popup_cache' ) );
		add_action( 'woocommerce_trash_product', array( $this, 'flush_popup_cache' ) );
	}

	/**
	 * Transient key for the resolved storefront popup payload.
	 *
	 * @since SPSG_VERSION
	 *
	 * @var string
	 */
	const POPUP_CACHE_KEY = 'spsg_sales_pop_popup_info';

	/**
	 * Per-request memo for the resolved popup payload. `false` = not resolved
	 * yet; `null` = resolved to "nothing to show".
	 *
	 * @var array|null|false
	 */
	private $popup_info_memo = false;

	/**
	 * Delete the cached storefront popup payload.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return void
	 */
	public function flush_popup_cache(): void {
		$this->popup_info_memo = false;
		delete_transient( self::POPUP_CACHE_KEY );
	}

	/**
	 * Add JS scripts.
	 *
	 * Only enqueues when the popup will actually display, and localizes a
	 * payload resolved from the configured products alone.
	 */
	public function enqueue_scripts() {
		$popup_info = $this->get_storefront_popup_info();

		if ( null === $popup_info ) {
			return;
		}

		wp_enqueue_script(
			'popup-custom-js',
			PluginHelper::get_modules_url( 'sales-pop/assets/js/popup-custom.js' ),
			array( 'jquery' ),
			STOREGROWTH_VERSION,
			true
		);

		wp_localize_script( 'popup-custom-js', 'popup_info', $popup_info );
	}

	/**
	 * Add CSS files.
	 */
	public function enqueue_styles() {
		if ( null === $this->get_storefront_popup_info() ) {
			return;
		}

		wp_enqueue_style(
			'popup-custom-css',
			PluginHelper::get_modules_url( 'sales-pop/assets/css/popup-custom.css' ),
			array(),
			STOREGROWTH_VERSION
		);

		// The Font Awesome CDN enqueue was removed: this module renders no
		// FontAwesome icons and the stackpath CDN it pointed at is retired, so
		// it was a guaranteed failed, unconsented third-party request per page.
	}

	/**
	 * Resolve the storefront popup payload, querying only the configured
	 * products instead of the whole catalogue.
	 *
	 * Returns null when there is nothing to display, so callers can skip
	 * enqueuing assets entirely. The result is memoized per request and cached
	 * in a transient that is flushed on popup or product changes.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return array|null
	 */
	private function get_storefront_popup_info(): ?array {
		if ( false !== $this->popup_info_memo ) {
			return $this->popup_info_memo;
		}

		$cached = get_transient( self::POPUP_CACHE_KEY );
		if ( is_array( $cached ) ) {
			$this->popup_info_memo = $cached;
			return $cached;
		}

		$popup_properties = \StorePulse\StoreGrowth\Helper::get_settings( 'spsg_popup_products', false );

		if ( false === $popup_properties || empty( $popup_properties ) ) {
			$this->popup_info_memo = null;
			return null;
		}

		$popup_properties = maybe_unserialize( $popup_properties );

		// Neutralize any HTML/script that may already be stored (e.g. from a
		// payload saved before the create_popup handler was hardened).
		$popup_properties = Ajax::sanitize_popup_data( $popup_properties );

		$popup_products = $popup_properties['popup_products'] ?? array();
		$popup_products = array_values( array_filter( array_map( 'absint', (array) $popup_products ) ) );

		if ( empty( $popup_products ) ) {
			$this->popup_info_memo = null;
			return null;
		}

		// Query ONLY the configured products (bounded by their count),
		// preserving the date-DESC order the previous full-catalogue scan
		// produced.
		$products = get_posts(
			array(
				'post_type'      => 'product',
				'post__in'       => $popup_products,
				'posts_per_page' => count( $popup_products ),
				'orderby'        => 'date',
				'order'          => 'DESC',
				'post_status'    => 'publish',
			)
		);

		$external_link     = ! empty( $popup_properties['external_link'] );
		$product_list      = array();
		$product_url       = array();
		$product_image_url = array();

		foreach ( $products as $product ) {
			$wc_product = wc_get_product( $product->ID );

			if ( ! $wc_product ) {
				continue;
			}

			if ( ! $external_link && $wc_product->is_type( 'external' ) ) {
				continue;
			}

			$image_url = wp_get_attachment_image_src( get_post_thumbnail_id( $product->ID ), 'single-post-thumbnail' );

			$product_list[]      = $product->post_title;
			$product_image_url[] = isset( $image_url[0] ) ? $image_url[0] : false;
			$product_url[]       = get_permalink( $product->ID );
		}

		$virtual_name = array();

		if ( isset( $popup_properties['virtual_name'] ) ) {
			if ( is_string( $popup_properties['virtual_name'] ) ) {
				$virtual_name = explode( ',', $popup_properties['virtual_name'] );
			} elseif ( is_array( $popup_properties['virtual_name'] ) ) {
				$virtual_name = $popup_properties['virtual_name'];
			}
		}

		$virtual_locations = array();

		if ( isset( $popup_properties['virtual_locations'] ) ) {
			if ( is_string( $popup_properties['virtual_locations'] ) ) {
				$virtual_locations = explode( "\n", $popup_properties['virtual_locations'] );
			} elseif ( is_array( $popup_properties['virtual_locations'] ) ) {
				$virtual_locations = $popup_properties['virtual_locations'];
			}
		}

		$popup_info = array(
			'product_list'         => $product_list,
			'product_url'          => $product_url,
			'product_image_url'    => $product_image_url,
			'virtual_locations'    => $virtual_locations,
			'virtual_name'         => $virtual_name,
			'popup_all_properties' => $popup_properties,
			'fallback_image_url'   => plugin_dir_url( __DIR__ ) . 'assets/images/sale_product.png',
		);

		set_transient( self::POPUP_CACHE_KEY, $popup_info, DAY_IN_SECONDS );
		$this->popup_info_memo = $popup_info;

		return $popup_info;
	}

	/**
	 * Add Admin JS scripts.
	 *
	 * @param string $screen name of screen.
	 */
	public function admin_enqueue_scripts( $screen ) {
		$popup_properties = \StorePulse\StoreGrowth\Helper::get_settings( 'spsg_popup_products', true );

		if ( 'storegrowth_page_spsg-settings' === $screen ) {
			add_action( 'admin_head', array( $this, 'admin_css' ) );
			$settings_file = require PluginHelper::get_modules_path( 'sales-pop/assets/build/settings.asset.php' );

			wp_enqueue_script(
				'spsg-sales-pop-settings',
				PluginHelper::get_modules_url( 'sales-pop/assets/build/settings.js' ),
				$settings_file['dependencies'],
				$settings_file['version'],
				false
			);

			wp_localize_script(
				'spsg-sales-pop-settings',
				'sales_pop_data',
				array(
					'ajax_url'     => admin_url( 'admin-ajax.php' ),
					'ajd_nonce'    => wp_create_nonce( 'spsg_admin_ajax_nonce' ),
					'image_folder' => PluginHelper::get_modules_url( 'upsell-order-bump/assets/images' ),
					'product_list' => $this->product_list(),
				)
			);
		}
	}

	/**
	 * Add css for admin panel.
	 */
	public function admin_css() {
		?>
		<style type="text/css">
			.ant-tabs-tabpane-hidden{
				display: none;
			}
		</style>
		<?php
	}

	/**
	 * Product list for pop up selection.
	 */
	public function product_list() {
		// Set product list from sources.
		$billing_products   = $this->get_billing_product_list();
		$selection_products = $this->get_selection_product_list();

		// Make products array for select popup products from product source.
		$products_array = array(
			$billing_products,
			$selection_products,
		);

		$product_info            = array();
		$product_list_for_select = array();
		$product_title_by_id     = array();
		$external_products_ids   = array();

		for ( $index = 0; $index < 3; $index++ ) {
			// Set current source products.
			$products = ! empty( $products_array[ $index ] ) ? $products_array[ $index ] : array();
			if ( empty( $products ) ) {
				$product_list_for_select[ $index ][] = $products;
				continue;
			}

			foreach ( $products as $product ) {
				$product_id                          = $product->ID;
				$product_list_for_select[ $index ][] = array(
					'value' => $product_id,
					'label' => $product->post_title,
				);

				$product_obj = wc_get_product( $product_id );
				if ( ! array_key_exists( $product_id, $product_title_by_id ) ) {
					$product_title_by_id[ $product_id ] = $product->post_title;
				}

				if (
					$product_obj &&
					$product_obj->is_type( 'external' ) &&
					! in_array( $product_id, $external_products_ids, true )
				) {
					$external_products_ids[] = $product_id;
				}
			}
		}

		// Set upsell product information & passed in frontend.
		$product_info['productTitleById']     = $product_title_by_id;
		$product_info['externalProductsIds']  = $external_products_ids;
		$product_info['productListForSelect'] = $product_list_for_select;
        $product_info['categoryListForSelect']       = $this->category_list();
        $product_info['categoryProductIdsForSelect'] = $this->get_category_product_list();

		return $product_info;
	}

	/**
	 * Retrieve billing product list.
	 *
	 * @since 1.0.0
	 *
	 * @return array|int[]|\WP_Post[]
	 */
	public function get_billing_product_list() {
		/**
		 * How many recent orders the "Latest Orders" source scans.
		 *
		 * Bounded so the query no longer grows with total order history. The
		 * products this source offers are derived from these most-recent
		 * orders rather than every order ever placed.
		 *
		 * @since SPSG_VERSION
		 *
		 * @param int $limit Number of recent orders to scan.
		 */
		$orders_limit = (int) apply_filters( 'spsg_sales_pop_billing_orders_limit', 100 );

		$orders = wc_get_orders(
			array(
				'limit'   => $orders_limit,
				'orderby' => 'date',
				'order'   => 'DESC',
				'status'  => array( 'processing', 'completed', 'on-hold' ),
			)
		);

		if ( empty( $orders ) ) {
			return array();
		}

		// Initialize an empty array to store the billing product list IDs.
		$ordered_product_ids = array();

		// Loop through each order.
		foreach ( $orders as $order ) {
			foreach ( $order->get_items() as $item ) {
				$product_id = $item->get_product_id();

				// Check if the product ID is already in the list.
				if ( ! in_array( $product_id, $ordered_product_ids, true ) ) {
					$ordered_product_ids[] = $product_id;
				}
			}
		}

		$ordered_products = array();
		if ( ! empty( $ordered_product_ids ) ) {
			$args = array(
				'posts_per_page' => count( $ordered_product_ids ), // Bounded by the ids already gathered.
				'post_type'      => 'product',
				'post_status'    => 'publish',
				'post__in'       => $ordered_product_ids, // Limit posts to ordered product IDs.
			);

			$ordered_products = get_posts( $args );
		}

		// Return billing products.
		return $ordered_products;
	}

	/**
	 * Retrieve select product list.
	 *
	 * @since 1.0.0
	 *
	 * @return int[]|\WP_Post[]
	 */
	public function get_selection_product_list() {
		/**
		 * How many recent products seed the selection list.
		 *
		 * The lite "Select Products" source searches the full catalogue live
		 * through the REST products endpoint, so this bounded seed is only a
		 * fallback (and the source list the Pro category filter reads). It no
		 * longer loads the whole catalogue.
		 *
		 * @since SPSG_VERSION
		 *
		 * @param int $limit Number of recent products to seed with.
		 */
		$product_limit = (int) apply_filters( 'spsg_sales_pop_selection_products_limit', 200 );

		$args = array(
			'post_type'      => 'product',
			'post_status'    => 'publish',
			'posts_per_page' => $product_limit,
			'orderby'        => 'date',
			'order'          => 'DESC',
		);

		return get_posts( $args );
	}

	/**
	 * Retrieve latest product list.
	 *
	 * @since 1.0.0
	 *
	 * @return int[]|\WP_Post[]
	 */
	public function get_latest_product_list() {
		$args = array(
			'post_type'      => 'product',
			'posts_per_page' => 10, // Adjust the number of products to display as needed.
			'orderby'        => 'date', // Sort by date.
			'order'          => 'DESC', // Show the latest products first.
		);

		return get_posts( $args );
	}

	/**
	 * Retrieve recently viewed product list.
	 *
	 * @since 1.0.0
	 *
	 * @return array|int[]|\WP_Post[]
	 */
	public function get_recently_viewed_product_list() {
		if ( isset( $_COOKIE['woocommerce_recently_viewed'] ) ) {
			$recently_viewed = sanitize_text_field( wp_unslash( $_COOKIE['woocommerce_recently_viewed'] ) );
			$product_ids     = array_reverse( explode( '|', $recently_viewed ) );

			// Remove duplicates.
			$product_ids = array_unique( $product_ids );

			// Limit the number of products.
			$product_ids = array_slice( $product_ids, 0, 10 );

			if ( empty( $product_ids ) ) {
				return array(); // No products found.
			}

			// Fetch product objects.
			$args = array(
				'posts_per_page' => count( $product_ids ), // Already capped to 10 ids above.
				'post_type'      => 'product',
				'post_status'    => 'publish',
				'post__in'       => $product_ids, // Limit posts to ordered product IDs.
			);

			return get_posts( $args );
		}

		return array(); // Return an empty array if no products are found.
	}

	/**
	 * Retrieve category product list.
	 *
	 * @since 1.0.0
	 *
	 * @return array
	 */
	public function get_category_product_list() {
		/**
		 * Product cap when grouping products by category.
		 *
		 * Replaces the previous per-category query loop, which ran one
		 * unbounded query per category and scaled with the number of
		 * categories. This scans a bounded set of recent products once.
		 *
		 * @since SPSG_VERSION
		 *
		 * @param int $limit Maximum products scanned across all categories.
		 */
		$product_limit = (int) apply_filters( 'spsg_sales_pop_category_products_limit', 200 );

		$product_ids = get_posts(
			array(
				'post_type'      => 'product',
				'post_status'    => 'publish',
				'posts_per_page' => $product_limit,
				'orderby'        => 'date',
				'order'          => 'DESC',
				'fields'         => 'ids',
			)
		);

		$category_products = array();

		if ( empty( $product_ids ) ) {
			return $category_products;
		}

		// One term query for every scanned product, grouped by category id.
		$terms = wp_get_object_terms( $product_ids, 'product_cat', array( 'fields' => 'all_with_object_id' ) );

		if ( is_wp_error( $terms ) ) {
			return $category_products;
		}

		foreach ( $terms as $term ) {
			$category_products[ $term->term_id ][] = $term->object_id;
		}

		return $category_products;
	}

	/**
	 * Get category list data.
	 *
	 * @since 1.0.0
	 *
	 * @return array
	 */
	public function category_list() {
		$cat_args = array(
			'order'      => 'asc',
			'orderby'    => 'name',
			'hide_empty' => false,
		);

		$category_data      = array();
		$product_categories = get_terms( 'product_cat', $cat_args );
		// Retrieve category lists as id, name pair.
		foreach ( $product_categories as $category ) {
			$category_data[ $category->term_id ] = $category->name;
		}

		return $category_data;
	}
}
