<?php
/**
 * Common_Hooks class for `Stock Countdown` module.
 *
 * @package SBFW
 */

namespace STOREGROWTH\SPSB\Modules\Stock_Countdown;

use STOREGROWTH\SPSB\Traits\Singleton;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Miscellaneous hooks implementation.
 */
class Common_Hooks {

	use Singleton;

	/**
	 * Constructor of Common_Hooks class.
	 */
	private function __construct() {
		add_action( 'woocommerce_before_add_to_cart_form', array( $this, 'show_stock_status_template' ) );
		add_action( 'woocommerce_shop_loop_item_title', array( $this, 'show_stock_status_template' ) );

		add_filter( 'woocommerce_get_stock_html', array( $this, 'woocommerce_get_stock_html' ), 10, 2 );

		add_filter( 'woocommerce_product_data_tabs', array( $this, 'woocommerce_product_data_tabs' ), 10, 1 );
		add_action( 'woocommerce_product_data_panels', array( $this, 'woocommerce_product_data_panels' ) );
		add_action( 'woocommerce_admin_process_product_object', array( $this, 'woocommerce_admin_process_product_object' ) );

		add_filter( 'woocommerce_product_get_price', array( $this, 'woocommerce_product_get_price' ), 10, 2 );

		add_filter( 'woocommerce_product_is_on_sale', array( $this, 'woocommerce_product_is_on_sale' ), 10, 2 );
	}

	/**
	 * Hook for WooCommerce before add-to-cart form.
	 */
	public function show_stock_status_template() {
		global $product;
		$stock_status = $product->get_stock_status();
		if ( $product->is_type( 'simple' ) && 'outofstock' !== $stock_status ) {
			include __DIR__ . '/../templates/simple-stock-status.php';
		}
	}

	/**
	 * WooCommerce get stock html.
	 *
	 * @param string     $html HTML string.
	 * @param WC_Product $product Product Object.
	 */
	public function woocommerce_get_stock_html( $html, $product ) {
		$stock_status = $product->get_stock_status();
		if ( 'outofstock' === $stock_status ) {
			return $html;
		} else {
			return '';
		}
	}

	/**
	 * Add a custom product data tab.
	 *
	 * @param array $tabs WooCommerce product data tabs.
	 */
	public function woocommerce_product_data_tabs( $tabs ) {
		// Adds the new tab.
		$tabs['stock_countdown_tab'] = array(
			'label'  => __( 'Stock Countdown', 'storegrowth-sales-booster' ),
			'target' => 'sgsb-stock-countdown-tab',
		);

		return $tabs;
	}

	/**
	 * Output HTML of tab content.
	 */
	public function woocommerce_product_data_panels() {
		include __DIR__ . '/../templates/wc-product-data-panels.php';
	}

	/**
	 * Save `Stock Countdown` tab data.
	 *
	 * @param \WC_Product $product WooCommerce product object.
	 */
	public function woocommerce_admin_process_product_object( $product ) {
		$discount_start_date = '';
		$discount_end_date   = '';

		// phpcs:disable WordPress.Security.NonceVerification.Missing
		if ( isset( $_POST['_sgsb_stock_countdown_discount_start'] ) ) {
			$discount_start_date = wc_clean( wp_unslash( $_POST['_sgsb_stock_countdown_discount_start'] ) ); //phpcs:ignore

			if ( $discount_start_date ) {
				$discount_start_date = gmdate( 'Y-m-d 00:00:00', strtotime( $discount_start_date ) );
			}
		}

		if ( isset( $_POST['_sgsb_stock_countdown_discount_end'] ) ) {
			$discount_end_date = wc_clean( wp_unslash( $_POST['_sgsb_stock_countdown_discount_end'] ) ); // phpcs:ignore

			if ( $discount_end_date ) {
				$discount_end_date = gmdate( 'Y-m-d 23:59:59', strtotime( $discount_end_date ) );
			}
		}

		$stock_discount_amount = isset( $_POST['_sgsb_stock_countdown_discount_amount'] ) ? wc_clean( wp_unslash( $_POST['_sgsb_stock_countdown_discount_amount'] ) ) : null; // phpcs:ignore

		update_post_meta( $product->get_id(), '_sgsb_stock_countdown_discount_start', $discount_start_date );
		update_post_meta( $product->get_id(), '_sgsb_stock_countdown_discount_end', $discount_end_date );
		update_post_meta( $product->get_id(), '_sgsb_stock_countdown_discount_amount', $stock_discount_amount );
		// phpcs:enable WordPress.Security.NonceVerification.Missing
	}

	/**
	 * Update product sale price according to stock discount.
	 *
	 * @param float       $sale_price Sale price.
	 * @param \WC_Product $product WooCommerce product object.
	 */
	public function woocommerce_product_get_sale_price( $sale_price, $product ) {
		if ( $sale_price ) {
			return $sale_price;
		}

		// Check countdown discount is set.
		if ( ! sgsb_stock_cd_is_product_discountable( $product->get_id() ) ) {
			return $sale_price;
		}

		return $sale_price;
	}

	/**
	 * Update product price according to stock discount.
	 *
	 * @param float       $price Product price.
	 * @param \WC_Product $product WooCommerce product object.
	 */
	public function woocommerce_product_get_price( $price, $product ) {
		// Check countdown discount is set.
		if ( sgsb_stock_cd_is_product_discountable( $product->get_id() ) ) {
			$float_price     = floatval( $product->get_regular_price() );
			$discount_amount = get_post_meta( $product->get_id(), '_sgsb_stock_countdown_discount_amount', true );
			$discount_amount = 100 - intval( $discount_amount );

			return ( $float_price * $discount_amount ) / 100;
		}

		return $price;
	}

	/**
	 * Set product is on sale.
	 *
	 * @param bool        $is_on_sale Check product is on sale.
	 * @param \WC_Product $product WooCommerce product object.
	 */
	public function woocommerce_product_is_on_sale( $is_on_sale, $product ) {
		// Check countdown discount is set.
		if ( sgsb_stock_cd_is_product_discountable( $product->get_id() ) ) {
			return true;
		}

		return $is_on_sale;
	}
}
