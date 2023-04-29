<?php
/**
 * Enqueue_Script class for `Upsell Order Bump`.
 *
 * @package SBFW
 */

namespace WPCodal\SBFW\Modules\Order_Bump;

use WPCodal\SBFW\Traits\Singleton;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Add styles and scripts files of `Fly Cart` modules inside this class.
 */
class Enqueue_Script {


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

		if ( 'sales-booster_page_sbfw-settings' === $hook ) {

			$settings_file                   = require sbfw_modules_path( 'upsell-order-bump/assets/build/settings.asset.php' );
			$settings_file['dependencies'][] = 'jquery';

			wp_enqueue_script(
				'sbfw-order-bump-settings',
				sbfw_modules_url( 'upsell-order-bump/assets/build/settings.js' ),
				$settings_file['dependencies'],
				$settings_file['version'],
				true
			);

			$action    = 'ajd_protected';
			$ajd_nonce = wp_create_nonce( $action );

			wp_localize_script(
				'sbfw-order-bump-settings',
				'products_and_categories',
				array(
					'product_list'          => $this->prodcut_list(),
					'product_list_for_view' => $this->prodcut_list_for_view(),
					'category_list'         => $this->category_list(),
					'order_bump_list'       => $this->order_bump_list(),
				)
			);

			wp_localize_script(
				'sbfw-order-bump-settings',
				'bump_save_url',
				array(
					'ajax_url'     => admin_url( 'admin-ajax.php' ),
					'ajd_nonce'    => $ajd_nonce,
					'image_folder' => sbfw_modules_url( 'upsell-order-bump/assets/images' ),
				)
			);
		}
	}

	/**
	 * Add CSS scripts to admin.
	 */
	public function admin_enqueue_styles() {
		$ftime          = filemtime( sbfw_modules_path( 'upsell-order-bump/assets/css/order-bump-custom-admin.css' ) );
		$ftime_template = filemtime( sbfw_modules_path( 'upsell-order-bump/assets/css/order-bump-template.css' ) );

		wp_enqueue_style(
			'sbfw-order-bump-custom-admin-css',
			sbfw_modules_url( 'upsell-order-bump/assets/css/order-bump-custom-admin.css' ),
			null,
			$ftime
		);

		wp_enqueue_style(
			'sbfw-order-bump-template-css',
			sbfw_modules_url( 'upsell-order-bump/assets/css/order-bump-template.css' ),
			null,
			$ftime_template
		);
	}

	/**
	 * Style for frontend.
	 */
	public function front_styles() {
		$ftime = filemtime( sbfw_modules_path( 'upsell-order-bump/assets/css/order-bump-front.css' ) );

		wp_enqueue_style(
			'sbfw-order-bump-front-css',
			sbfw_modules_url( 'upsell-order-bump/assets/css/order-bump-front.css' ),
			null,
			$ftime
		);
	}

	/**
	 * Script for frontend.
	 */
	public function front_scripts() {
		$ftime = filemtime( sbfw_modules_path( 'upsell-order-bump/assets/js/order-bump-custom.js' ) );

		wp_enqueue_script(
			'sbfw-order-bump-front-js',
			sbfw_modules_url( 'upsell-order-bump/assets/js/order-bump-custom.js' ),
			'jquery',
			$ftime,
			true
		);

		$action    = 'ajd_protected';
		$ajd_nonce = wp_create_nonce( $action );
		wp_localize_script(
			'sbfw-order-bump-front-js',
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
		);

		$products                  = get_posts( $args );
		
		$product_list_for_select   = array();
		$product_title_by_id       = array();
		$simple_product_for_offer  = array();

		foreach ( $products as $product ) {
			$product_list_for_select[] = array(
				'value' => $product->ID,
				'label' => $product->post_title,
			);

			$_product      = wc_get_product( $product->ID );
			$regular_price = $_product->get_regular_price();

			if ( $regular_price ) {
				$simple_product_for_offer[] = array(
					'value' => $product->ID,
					'label' => $product->post_title,
				);
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
		$args                  = array(
			'post_type'      => 'product',
			'posts_per_page' => -1,
		);
		$products              = get_posts( $args );
		$product_list_for_view = array();

		foreach ( $products as $product ) {
			$_product                              = wc_get_product( $product->ID );
			$product->regular_price                = $_product->get_regular_price();
			$product->image_url                    = wp_get_attachment_url( get_post_thumbnail_id( $product->ID ), 'thumbnail' );
			$product_list_for_view[ $product->ID ] = $product;
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
			'post_type'      => 'sbfw_order_bump',
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
