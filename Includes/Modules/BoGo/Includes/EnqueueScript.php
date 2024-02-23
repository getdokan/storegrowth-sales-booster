<?php
/**
 * Enqueue_Script class for `Bogo`.
 *
 * @package SBFW
 */

namespace STOREGROWTH\SPSB\Modules\BoGo\Includes;

use STOREGROWTH\SPSB\Traits\Singleton;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Add styles and scripts files of `Upsell Order Bogo` Modules inside this class.
 */
class EnqueueScript {


	use Singleton;

	/**
	 * Constructor of Enqueue class.
	 */
	private function __construct() {
		add_action( 'init', array( $this, 'register_enqueue_scripts' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'admin_enqueue_scripts' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'admin_enqueue_styles' ) );
		add_action( 'wp_enqueue_scripts', array( $this, 'front_styles' ) );
		add_action( 'wp_enqueue_scripts', array( $this, 'front_scripts' ) );
	}

	/**
	 * Register module assets.
	 *
	 * @since 1.0.2
	 *
	 * @return void
	 */
	public function register_enqueue_scripts() {
		wp_register_style(
			'sgsb-bogo-admin-style',
			sgsb_modules_url( 'BoGo/assets/css/product-bogo-settings.css' ),
			null,
			filemtime( sgsb_modules_path( 'BoGo/assets/css/product-bogo-settings.css' ) )
		);

		wp_register_script(
			'sgsb-bogo-admin-script',
			sgsb_modules_url( 'BoGo/assets/js/product-bogo-settings.js' ),
			array( 'jquery', 'jquery-ui-datepicker' ),
			filemtime( sgsb_modules_path( 'BoGo/assets/js/product-bogo-settings.js' ) ),
			true
		);
	}

	/**
	 * Add JS scripts to admin.
	 *
	 * @param string $hook screen name.
	 *
	 * @return void
	 */
	public function admin_enqueue_scripts( $hook ) {
		global $post;

        wp_enqueue_media();
		if ( ( $hook == 'post-new.php' || $hook == 'post.php' ) && 'product' === $post->post_type ) {
			wp_enqueue_style( 'sgsb-bogo-admin-style' );

			wp_enqueue_script( 'select2' );
			wp_enqueue_script( 'sgsb-bogo-admin-script' );
		}

		if ( 'storegrowth_page_sgsb-settings' === $hook ) {
			$settings_file                   = require sgsb_modules_path( 'BoGo/assets/build/settings.asset.php' );
			$settings_file['dependencies'][] = 'jquery';

			wp_enqueue_script(
				'sgsb-bogo-settings',
				sgsb_modules_url( 'BoGo/assets/build/settings.js' ),
				$settings_file['dependencies'],
				$settings_file['version'],
				true
			);

			$action    = 'ajd_protected';
			$ajd_nonce = wp_create_nonce( $action );

			wp_localize_script(
				'sgsb-bogo-settings',
				'bogo_products_and_categories',
				array(
					'product_list'          => $this->prodcut_list(),
					'product_list_for_view' => $this->prodcut_list_for_view(),
					'category_list'         => $this->category_list(),
					'order_bogo_list'       => $this->order_bogo_list(),
				)
			);

			wp_localize_script(
				'sgsb-bogo-settings',
				'bogo_save_url',
				array(
					'ajax_url'     => admin_url( 'admin-ajax.php' ),
					'ajd_nonce'    => $ajd_nonce,
					'image_folder' => sgsb_modules_url( 'BoGo/assets/images' ),
				)
			);
		}
	}

	/**
	 * Add CSS scripts to admin.
	 */
	public function admin_enqueue_styles() {
		$ftime          = filemtime( sgsb_modules_path( 'BoGo/assets/css/order-bogo-custom-admin.css' ) );
		$ftime_template = filemtime( sgsb_modules_path( 'BoGo/assets/css/order-bogo-template.css' ) );

		wp_enqueue_style(
			'sgsb-bogo-custom-admin-css',
			sgsb_modules_url( 'BoGo/assets/css/order-bogo-custom-admin.css' ),
			null,
			$ftime
		);

		wp_enqueue_style(
			'sgsb-bogo-template-css',
			sgsb_modules_url( 'BoGo/assets/css/order-bogo-template.css' ),
			null,
			$ftime_template
		);
	}

	/**
	 * Style for frontend.
	 */
	public function front_styles() {
		$ftime = filemtime( sgsb_modules_path( 'BoGo/assets/css/order-bogo-front.css' ) );

		wp_enqueue_style(
			'sgsb-bogo-front-css',
			sgsb_modules_url( 'BoGo/assets/css/order-bogo-front.css' ),
			null,
			$ftime
		);
	}

	/**
	 * Script for frontend.
	 */
	public function front_scripts() {
		$ftime = filemtime( sgsb_modules_path( 'BoGo/assets/js/order-bogo-custom.js' ) );

		wp_enqueue_script(
			'sgsb-bogo-front-js',
			sgsb_modules_url( 'BoGo/assets/js/order-bogo-custom.js' ),
			'jquery',
			$ftime,
			true
		);

		$action    = 'ajd_protected';
		$ajd_nonce = wp_create_nonce( $action );
		wp_localize_script(
			'sgsb-bogo-front-js',
			'bogo_save_url',
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

			$_product      = wc_get_product( $product->ID );
			$sale_price    = $_product->get_sale_price();
			$regular_price = $_product->get_regular_price();

			// Prepare woocommerce price data.
			$price = ! empty( $sale_price ) ? esc_html( $sale_price ) : esc_html( $regular_price );
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

			// Get the product list.
			if ( $_product->is_type( 'simple' ) ) {
				$product_list_for_select[] = array(
					'value' => $product->ID,
					'label' => $product->post_title,
				);
			}
			// Get categories csv.
			$category_names = implode( ', ', $category_names );

			if ( $regular_price ) {
				$simple_product_for_offer[] = array(
					'price'            => $price,
					'value'            => $product->ID,
					'currency'         => $currency_symbol,
					'offer_categories' => $category_names,
					'label'            => $product->post_title . $_product_price,
				);
			}

			$product_title_by_id[ $product->ID ] = $product->post_title;
		}

		$product_info['productListForSelect']  = apply_filters( 'sgsb_bogo_select_product_list', $product_list_for_select, $products );
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
	 * Order bogo list.
	 */
	public function order_bogo_list() {
		$args_bogo = array(
			'post_type'      => 'sgsb_bogo',
			'posts_per_page' => -1,
		);
		$bogo_list = get_posts( $args_bogo );
		$bogos     = array();

		foreach ( $bogo_list as $bogo ) {
			if ( 'object' === gettype( json_decode( $bogo->post_excerpt ) ) ) {
				$bogos[ $bogo->ID ] = json_decode( $bogo->post_excerpt );
			}
		}

		return $bogos;
	}
}
