<?php
/**
 * Enqueue_Script class for `Upsell Order Bump`.
 *
 * @package SBFW
 */

namespace STOREGROWTH\SPSB\Modules\UpsellOrderBump\Includes;

use STOREGROWTH\SPSB\Traits\Singleton;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Add styles and scripts files of `Upsell Order Bump` Modules inside this class.
 */
class EnqueueScript {


	use Singleton;

	/**
	 * Constructor of Enqueue class.
	 */
	private function __construct() {
		add_action( 'admin_enqueue_scripts', array( $this, 'admin_enqueue_scripts' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'admin_enqueue_styles' ) );
		add_action( 'wp_enqueue_scripts', array( $this, 'front_styles' ) );
		add_action( 'wp_enqueue_scripts', array( $this, 'front_scripts' ) );
	}


	/**
	 * Add JS scripts to admin.
	 *
	 * @param string $hook screen name.
	 */
	public function admin_enqueue_scripts( $hook ) {

		if ( 'storegrowth_page_sgsb-settings' === $hook ) {

			$settings_file                   = require sgsb_modules_path( 'UpsellOrderBump/assets/build/settings.asset.php' );
			$settings_file['dependencies'][] = 'jquery';

			wp_enqueue_script(
				'sgsb-order-bump-settings',
				sgsb_modules_url( 'UpsellOrderBump/assets/build/settings.js' ),
				$settings_file['dependencies'],
				$settings_file['version'],
				true
			);

			$action    = 'ajd_protected';
			$ajd_nonce = wp_create_nonce( $action );

			wp_localize_script(
				'sgsb-order-bump-settings',
				'products_and_categories',
				array(
					'product_list'          => $this->prodcut_list(),
					'product_list_for_view' => $this->prodcut_list_for_view(),
					'category_list'         => $this->category_list(),
					'order_bump_list'       => $this->order_bump_list(),
				)
			);

			wp_localize_script(
				'sgsb-order-bump-settings',
				'bump_save_url',
				array(
					'ajax_url'     => admin_url( 'admin-ajax.php' ),
					'ajd_nonce'    => $ajd_nonce,
					'image_folder' => sgsb_modules_url( 'UpsellOrderBump/assets/images' ),
				)
			);
		}
	}

	/**
	 * Add CSS scripts to admin.
	 */
	public function admin_enqueue_styles() {
		$ftime          = filemtime( sgsb_modules_path( 'UpsellOrderBump/assets/css/order-bump-custom-admin.css' ) );
		$ftime_template = filemtime( sgsb_modules_path( 'UpsellOrderBump/assets/css/order-bump-template.css' ) );

		wp_enqueue_style(
			'sgsb-order-bump-custom-admin-css',
			sgsb_modules_url( 'UpsellOrderBump/assets/css/order-bump-custom-admin.css' ),
			null,
			$ftime
		);

		wp_enqueue_style(
			'sgsb-order-bump-template-css',
			sgsb_modules_url( 'UpsellOrderBump/assets/css/order-bump-template.css' ),
			null,
			$ftime_template
		);
	}

	/**
	 * Style for frontend.
	 */
	public function front_styles() {
		if ( ! is_checkout() ) {
			return;
		}

		$ftime = filemtime( sgsb_modules_path( 'UpsellOrderBump/assets/css/order-bump-front.css' ) );

		wp_enqueue_style(
			'sgsb-order-bump-front-css',
			sgsb_modules_url( 'UpsellOrderBump/assets/css/order-bump-front.css' ),
			null,
			$ftime
		);
	}

	/**
	 * Script for frontend.
	 */
	public function front_scripts() {
		$ftime = filemtime( sgsb_modules_path( 'UpsellOrderBump/assets/js/order-bump-custom.js' ) );

		wp_enqueue_script(
			'sgsb-order-bump-front-js',
			sgsb_modules_url( 'UpsellOrderBump/assets/js/order-bump-custom.js' ),
			'jquery',
			$ftime,
			true
		);

		$action    = 'ajd_protected';
		$ajd_nonce = wp_create_nonce( $action );
		wp_localize_script(
			'sgsb-order-bump-front-js',
			'bump_save_url',
			array(
				'ajax_url_for_front' => admin_url( 'admin-ajax.php' ),
				'ajd_nonce'          => $ajd_nonce,
			)
		);
	}

	/**
	 * Product list.
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
			$sale_price    = $_product->get_sale_price();
			$regular_price = $_product->get_regular_price();

			// Prepare woocommerce price data.
			$price = esc_html( $regular_price );
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

			if ( $_product->is_type( 'simple' ) && $regular_price ) {
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
				$product_list_for_view[ $product->ID ] = array(
					'ID'            => $product->ID,
					'post_title'    => $_product->get_title(),
					'image_url'     => wp_get_attachment_url( get_post_thumbnail_id( $product->ID ), 'thumbnail' ),
					'regular_price' => number_format( (int) $_product->get_regular_price(), 2 ),
				);
			}
			if ( $_product->is_type( 'variable' ) ) {
				$variations = $_product->get_available_variations();

				foreach ( $variations as $variation ) {
						$variation_id         = $variation['variation_id'];
						$variation_attributes = $variation['attributes'];
						$regular_price        = number_format( $variation['display_regular_price'], 2 );
						$variation_root_name  = $_product->get_title();
						$variation_name       = $variation_root_name . '(' . implode( ', ', $variation_attributes ) . ')';
						$image_url            = $variation['image']['url'];

						$product_list_for_view[ $variation_id ] = array(
							'ID'            => $variation_id,
							'post_title'    => $variation_name,
							'image_url'     => $image_url,
							'regular_price' => $regular_price,
						);
				}
			}
		}
		return $product_list_for_view;
	}

	/**
	 * Category list.
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
	 */
	public function order_bump_list() {
		$args_bump = array(
			'post_type'      => 'sgsb_order_bump',
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
