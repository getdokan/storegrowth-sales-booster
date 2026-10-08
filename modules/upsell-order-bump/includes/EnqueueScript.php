<?php
/**
 * Enqueue_Script class for `Upsell Order Bump`.
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Modules\UpsellOrderBump;

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
		// The admin app draws the bumps (`AdminPage`): the old antd admin and
		// its stylesheets are gone.
		add_action( 'wp_enqueue_scripts', array( $this, 'front_styles' ) );
		add_action( 'wp_enqueue_scripts', array( $this, 'front_scripts' ) );
	}

	/**
	 * Loaded the old antd admin bundle.
	 *
	 * @deprecated SPSG_VERSION The admin app draws the bumps (`AdminPage`); does nothing.
	 *
	 * @param string $hook Screen name.
	 *
	 * @return void
	 */
	public function admin_enqueue_scripts( $hook ) {}

	/**
	 * Loaded the old admin's stylesheets.
	 *
	 * @deprecated SPSG_VERSION The stylesheets are removed; does nothing.
	 *
	 * @param string $hook Admin page hook.
	 *
	 * @return void
	 */
	public function admin_enqueue_styles( $hook = '' ) {}

	/**
	 * Whether the order bump frontend assets are needed on the current request.
	 *
	 * The bump only renders on checkout, so neither the script nor its nonce
	 * needs to be emitted anywhere else. Filterable because the WooCommerce
	 * checkout block can be placed on a page `is_checkout()` does not match.
	 *
	 * @since 2.1.1
	 *
	 * @return bool
	 */
	protected function needs_front_assets(): bool {
		/**
		 * Filters whether the order bump frontend assets are enqueued.
		 *
		 * @since 2.1.1
		 *
		 * @param bool $needed Whether the current request renders the order bump.
		 */
		return (bool) apply_filters( 'spsg_order_bump_needs_front_assets', is_checkout() );
	}

	/**
	 * Style for frontend.
	 */
	public function front_styles() {
		if ( ! $this->needs_front_assets() ) {
			return;
		}

		$ftime = filemtime( PluginHelper::get_modules_path( 'upsell-order-bump/assets/css/order-bump-front.css' ) );

		wp_enqueue_style(
			'spsg-order-bump-front-css',
			PluginHelper::get_modules_url( 'upsell-order-bump/assets/css/order-bump-front.css' ),
			null,
			$ftime
		);
	}

	/**
	 * Script for frontend.
	 */
	public function front_scripts() {
		if ( ! $this->needs_front_assets() ) {
			return;
		}

		$ftime = filemtime( PluginHelper::get_modules_path( 'upsell-order-bump/assets/js/order-bump-custom.js' ) );

		wp_enqueue_script(
			'spsg-order-bump-front-js',
			PluginHelper::get_modules_url( 'upsell-order-bump/assets/js/order-bump-custom.js' ),
			'jquery',
			$ftime,
			true
		);

		// Frontend-only nonce for the public order-bump add-to-cart action.
		$action    = 'spsg_frontend_ajax_nonce';
		$ajd_nonce = wp_create_nonce( $action );
		wp_localize_script(
			'spsg-order-bump-front-js',
			'bump_save_url',
			array(
				'ajax_url_for_front' => admin_url( 'admin-ajax.php' ),
				'ajd_nonce'          => $ajd_nonce,
			)
		);
	}

	/**
	 * Product list.
	 *
	 * @deprecated SPSG_VERSION Only the old Order Bump admin read it; kept for extensions.
	 */
	public function prodcut_list() {
		$args = array(
			'post_type'      => 'product',
			'posts_per_page' => -1,
			'tax_query'      => array(
				array(
					'taxonomy' => 'product_type',
					'field'    => 'slug',
					'terms'    => 'external',
					'operator' => 'NOT IN',
				),
			),
		);

		$products = get_posts( $args );

		$product_list_for_select  = array();
		$product_title_by_id      = array();
		$simple_product_for_offer = array();

		foreach ( $products as $product ) {
			// Get the product category IDs.
			$category_ids              = wp_get_post_terms( $product->ID, 'product_cat', array( 'fields' => 'ids' ) );
			$product_list_for_select[] = array(
				'value'  => $product->ID,
				'label'  => $product->post_title,
				'catIds' => $category_ids,
			);

			$_product      = wc_get_product( $product->ID );
			$current_price = $_product->get_price();
			$regular_price = $_product->get_regular_price();

			// Prepare woocommerce price data.
			$price = esc_html( $current_price );
			$price = wp_strip_all_tags( html_entity_decode( wc_price( $price ) ) );

			// Render woocommerce price with currency symbol.
			$_product_price  = ' (' . $price . ')';
			$currency_symbol = wp_strip_all_tags( html_entity_decode( get_woocommerce_currency_symbol() ) );

			// Offer product categories.
			// Collect offer product categories.
			$product_categories = wp_get_post_terms( $product->ID, 'product_cat' );

			$category_names = array();
			foreach ( $product_categories as $category ) {
				$category_names[] = $category->name;
			}

			// Get categories csv.
			$category_names = implode( ', ', $category_names );

			if ( $_product->is_type( 'simple' ) && $current_price ) {
				$simple_product_for_offer[] = array(
					'price'            => $price,
					'value'            => $product->ID,
					'currency'         => $currency_symbol,
					'offer_categories' => $category_names,
					'label'            => $product->post_title . $_product_price,
				);
			}
			if ( $_product->is_type( 'variable' ) ) {
				$variations = $_product->get_available_variations();

				foreach ( $variations as $variation ) {
						$variation_id         = $variation['variation_id'];
						$variation_attributes = $variation['attributes'];
						$regular_price        = number_format( $variation['display_regular_price'], 2 ) . $currency_symbol;
						$variation_root_name  = $_product->get_title();
						$variation_name       = $variation_root_name . '(' . implode( ', ', $variation_attributes ) . ') (' . $regular_price . ')';

						$simple_product_for_offer[] = array(
							'price'            => $regular_price,
							'value'            => $variation_id,
							'currency'         => $currency_symbol,
							'offer_categories' => $category_names,
							'label'            => $variation_name,
						);
				}
			}

			$product_title_by_id[ $product->ID ] = $product->post_title;
		}

		$product_info['productListForSelect']  = $product_list_for_select;
		$product_info['simpleProductForOffer'] = $simple_product_for_offer;
		$product_info['productTitleById']      = $product_title_by_id;
		return $product_info;
	}

	/**
	 * Product list for view.
	 *
	 * @deprecated SPSG_VERSION Only the old Order Bump admin read it; kept for extensions.
	 */
	public function prodcut_list_for_view() {
		$args     = array(
			'post_type'      => 'product',
			'posts_per_page' => -1,
		);
		$products = get_posts( $args );

		$product_list_for_view = array();
		foreach ( $products as $product ) {
			$_product = wc_get_product( $product->ID );

			if ( $_product->is_type( 'simple' ) ) {
				// Use get_price() method directly since it gives the current price
				$current_price = $_product->get_price();
				$regular_price = $_product->get_regular_price();
				
				// Ensure we have valid numeric values for number_format
				$current_price = is_numeric( $current_price ) ? (float) $current_price : 0.00;
				$regular_price = is_numeric( $regular_price ) ? (float) $regular_price : $current_price;
				
				$product_list_for_view[ $product->ID ] = array(
					'ID'            => $product->ID,
					'post_title'    => $_product->get_title(),
					'image_url'     => wp_get_attachment_url( get_post_thumbnail_id( $product->ID ), 'thumbnail' ),
					'regular_price' => number_format( $regular_price, 2 ),
					'current_price' => number_format( $current_price, 2 ),
				);
			}
			if ( $_product->is_type( 'variable' ) ) {
				$variations = $_product->get_available_variations();

				foreach ( $variations as $variation ) {
						$variation_id         = $variation['variation_id'];
						$variation_attributes = $variation['attributes'];
						$variation_product = wc_get_product( $variation_id );
						
						// Ensure we have a valid variation product
						if ( ! $variation_product ) {
							continue;
						}
						
						$current_variation_price = $variation_product->get_price();
						$variation_regular_price = $variation_product->get_regular_price();
						
						// Ensure we have valid numeric values for number_format
						$current_variation_price = is_numeric( $current_variation_price ) ? (float) $current_variation_price : 0.00;
						$variation_regular_price = is_numeric( $variation_regular_price ) ? (float) $variation_regular_price : $current_variation_price;
						
						$formatted_price      = number_format( $current_variation_price, 2 );
						$variation_root_name  = $_product->get_title();
						$variation_name       = $variation_root_name . '(' . implode( ', ', $variation_attributes ) . ')';
						$image_url            = $variation['image']['url'];

						$product_list_for_view[ $variation_id ] = array(
							'ID'            => $variation_id,
							'post_title'    => $variation_name,
							'image_url'     => $image_url,
							'regular_price' => number_format( $variation_regular_price, 2 ),
							'current_price' => $formatted_price,
						);
				}
			}
		}
		return $product_list_for_view;
	}

	/**
	 * Category list.
	 *
	 * @deprecated SPSG_VERSION Only the old Order Bump admin read it; kept for extensions.
	 */
	public function category_list() {
		$orderby    = 'name';
		$order      = 'asc';
		$hide_empty = false;
		$cat_args   = array(
			'orderby'    => $orderby,
			'order'      => $order,
			'hide_empty' => $hide_empty,
		);

		$product_categories = get_terms( 'product_cat', $cat_args );
		$category_list      = array();
		$cat_name_by_bd     = array();

		foreach ( $product_categories as $key => $category ) {
			$category_list[] = array(
				'value' => $category->term_id,
				'label' => $category->name,
			);

			$cat_name_by_id[ $category->term_id ] = $category->name;
		}

		$catergory_info['catForSelect'] = $category_list;
		$catergory_info['catNameById']  = $cat_name_by_id;

		return $catergory_info;
	}

	/**
	 * Order bump list.
	 *
	 * @deprecated SPSG_VERSION Only the old Order Bump admin read it; kept for
	 *             extensions. Always empty: bumps live in the
	 *             `spsg_order_bumps` table, not `spsg_order_bump` posts.
	 */
	public function order_bump_list() {
		$args_bump = array(
			'post_type'      => 'spsg_order_bump',
			'posts_per_page' => -1,
		);
		$bump_list = get_posts( $args_bump );
		$bumps     = array();

		foreach ( $bump_list as $bump ) {
			if ( 'object' === gettype( json_decode( $bump->post_excerpt ) ) ) {
				$bumps[ $bump->ID ] = json_decode( $bump->post_excerpt );
			}
		}

		return $bumps;
	}
}
