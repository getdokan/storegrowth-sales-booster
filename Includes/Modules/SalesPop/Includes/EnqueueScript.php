<?php
/**
 * Enqueue class.
 *
 * @package SBFW
 */

namespace STOREGROWTH\SPSB\Modules\SalesPop\Includes;

use STOREGROWTH\SPSB\Traits\Singleton;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Add styles of scripts files inside this class.
 */
class EnqueueScript {

	use Singleton;

	/**
	 * Constructor of Bootstrap class.
	 */
	private function __construct() {
		// Assets for frontend.
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_scripts' ) );
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_styles' ) );

		// Assets for Admin Panel.
		add_action( 'admin_enqueue_scripts', array( $this, 'admin_enqueue_scripts' ) );
	}

	/**
	 * Add JS scripts.
	 */
	public function enqueue_scripts() {
		wp_enqueue_script( 'popup-custom-js', sgsb_modules_url( 'SalesPop/assets/js/popup-custom.js' ), array( 'jquery' ), time(), true );
		$args             = array(
			'post_type'      => 'product',
			'posts_per_page' => -1,
		);
		$products         = get_posts( $args );
		$popup_properties = get_option( 'sgsb_popup_products', false );

		if ( false !== $popup_properties ) {
			$popup_properties  = maybe_unserialize( $popup_properties );
			$popup_products    = $popup_properties['popup_products'];
			$product_list      = array();
			$product_url       = array();
			$product_image_url = array();
			if ( $popup_products ) {
				foreach ( $products as $product ) {
					if ( ! in_array( $product->ID, $popup_products, true ) ) {
						continue;
					}
					if ( $popup_properties['external_link'] || ( ! $popup_properties['external_link'] && ! wc_get_product( $product->ID )->is_type( 'external' ) ) ) {
						$product_list[]      = $product->post_title;
						$image_url           = wp_get_attachment_image_src( get_post_thumbnail_id( $product->ID ), 'single-post-thumbnail' );
						$product_image_url[] = isset( $image_url[0] ) ? $image_url[0] : false;
						$product_url[]       = get_permalink( $product->ID );

					}
				}
			}
		} else {
			return;
		}

		$virtual_name = array();

		if ( isset( $popup_properties['virtual_name'] ) ) {
			if ( is_string( $popup_properties['virtual_name'] ) ) {
				$virtual_name = explode( ',', $popup_properties['virtual_name'] );
			}

			if ( is_array( $popup_properties['virtual_name'] ) ) {
				$virtual_name = $popup_properties['virtual_name'];
			}
		}

		$virtual_locations = isset( $popup_properties['virtual_locations'] ) ? $popup_properties['virtual_locations'] : '';
		$virtual_locations = explode( "\n", $virtual_locations );

		$popup_info = array(
			'product_list'         => $product_list,
			'product_url'          => $product_url,
			'product_image_url'    => $product_image_url,
			'virtual_locations'    => $virtual_locations,
			'virtual_name'         => $virtual_name,
			'popup_all_properties' => $popup_properties,
			'fallback_image_url'   => $default_product_image_url = plugin_dir_url( __DIR__ ) . 'assets/images/sale_product.png',
		);

		wp_localize_script( 'popup-custom-js', 'popup_info', $popup_info );
	}

	/**
	 * Add CSS files.
	 */
	public function enqueue_styles() {
		$ftime = filemtime( sgsb_modules_path( 'SalesPop/assets/css/popup-custom.css' ) );
		wp_enqueue_style(
			'popup-custom-css',
			sgsb_modules_url( 'SalesPop/assets/css/popup-custom.css' ),
			null,
			$ftime
		);
		wp_enqueue_style( 'font-awesome-css', '//stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css', null, '1.0' );
	}

	/**
	 * Add Admin JS scripts.
	 *
	 * @param string $screen name of screen.
	 */
	public function admin_enqueue_scripts( $screen ) {
		$popup_properties = maybe_unserialize( get_option( 'sgsb_popup_products', true ) );

		if ( 'storegrowth_page_sgsb-settings' === $screen ) {
			add_action( 'admin_head', array( $this, 'admin_css' ) );
			$settings_file = require sgsb_modules_path( 'SalesPop/assets/build/settings.asset.php' );

			wp_enqueue_script(
				'sgsb-sales-pop-settings',
				sgsb_modules_url( 'SalesPop/assets/build/settings.js' ),
				$settings_file['dependencies'],
				$settings_file['version'],
				false
			);

			wp_localize_script(
				'sgsb-sales-pop-settings',
				'sales_pop_data',
				array(
					'ajax_url'     => admin_url( 'admin-ajax.php' ),
					'ajd_nonce'    => wp_create_nonce( 'ajd_protected' ),
					'image_folder' => sgsb_modules_url( 'UpsellOrderBump/assets/images' ),
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
		// Get all orders.
		$orders = wc_get_orders(
			array(
				'limit'  => -1,
				'status' => array( 'processing', 'completed', 'on-hold' ),
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
				'posts_per_page' => -1,
				'post_type'      => 'product',
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
		$args = array(
			'post_type'      => 'product',
			'posts_per_page' => -1,
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
				'posts_per_page' => -1,
				'post_type'      => 'product',
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
		// Get all product categories.
		$categories = $this->category_list();

		// Create an empty array to store the category name as the key and products as the value.
		$category_products = array();

		// Loop through the categories.
		foreach ( $categories as $category_id => $category_name ) {
			// Get the products in the current category.
			$args = array(
				'post_type'      => 'product',
				'posts_per_page' => -1,
				'fields'         => 'ids',
				'tax_query'      => array(
					array(
						'taxonomy' => 'product_cat',
						'field'    => 'term_id',
						'terms'    => $category_id,
					),
				),
			);

			$products = get_posts( $args );
			// Assign products to the category id.
			$category_products[ $category_id ] = $products;
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
