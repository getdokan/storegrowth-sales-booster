<?php
/**
 * Common_Hooks class for `Countdown Timer` module.
 *
 * @package SBFW
 */

namespace STOREGROWTH\SPSB\Modules\CountdownTimer\Includes;

use STOREGROWTH\SPSB\Traits\Singleton;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Miscellaneous hooks implementation.
 */
class CommonHooks {

	use Singleton;

	/**
	 * Constructor of Common_Hooks class.
	 */
	private function __construct() {
		add_action( 'woocommerce_before_add_to_cart_form', array( $this, 'show_countdown_timer_template' ) );

		add_filter( 'woocommerce_product_data_tabs', array( $this, 'woocommerce_product_data_tabs' ), 10, 1 );
		add_action( 'woocommerce_product_data_panels', array( $this, 'woocommerce_product_data_panels' ) );
		add_action( 'woocommerce_admin_process_product_object', array( $this, 'woocommerce_admin_process_product_object' ) );

		add_filter( 'woocommerce_product_get_price', array( $this, 'woocommerce_product_get_price' ), 10, 2 );

		add_filter( 'woocommerce_product_is_on_sale', array( $this, 'woocommerce_product_is_on_sale' ), 10, 2 );
	}

	/**
	 * Hook for WooCommerce before add-to-cart form.
	 */
	public function show_countdown_timer_template() {
		global $product;
		$stock_status = $product->get_stock_status();
		if ( $product->is_type( 'simple' ) && 'outofstock' !== $stock_status ) {
			include __DIR__ . '/../templates/countdown-timer.php';
		}
	}


	/**
	 * Add a custom product data tab.
	 *
	 * @param array $tabs WooCommerce product data tabs.
	 */
	public function woocommerce_product_data_tabs( $tabs ) {
		if ( ! $this->is_external_product() ) {
			// Adds the new tab.
			$tabs['countdown_timer_tab'] = array(
				'label'  => __( 'Countdown Timer', 'storegrowth-sales-booster' ),
				'target' => 'sgsb-countdown-timer-tab',
			);
		}
		return $tabs;
	}

	/**
	 * Output HTML of tab content.
	 */
	public function woocommerce_product_data_panels() {
		if ( ! $this->is_external_product() ) {
			include __DIR__ . '/../templates/wc-product-data-panels.php';
		}
	}

	/**
	 * Save `Countdown Timer` tab data.
	 *
	 * @param \WC_Product $product WooCommerce product object.
	 */
	public function woocommerce_admin_process_product_object( $product ) {
		$discount_start_date = '';
		$discount_end_date   = '';

		// phpcs:disable WordPress.Security.NonceVerification.Missing
		if ( isset( $_POST['_sgsb_countdown_timer_discount_start'] ) ) {
			$discount_start_date = wc_clean( wp_unslash( $_POST['_sgsb_countdown_timer_discount_start'] ) ); //phpcs:ignore

			if ( $discount_start_date ) {
				$discount_start_date = gmdate( 'Y-m-d 00:00:00', strtotime( $discount_start_date ) );
			}
		}

		if ( isset( $_POST['_sgsb_countdown_timer_discount_end'] ) ) {
			$discount_end_date = wc_clean( wp_unslash( $_POST['_sgsb_countdown_timer_discount_end'] ) ); // phpcs:ignore

			if ( $discount_end_date ) {
				$discount_end_date = gmdate( 'Y-m-d 23:59:59', strtotime( $discount_end_date ) );
			}
		}

		$stock_discount_amount = isset( $_POST['_sgsb_countdown_timer_discount_amount'] ) ? wc_clean( wp_unslash( $_POST['_sgsb_countdown_timer_discount_amount'] ) ) : null; // phpcs:ignore

		update_post_meta( $product->get_id(), '_sgsb_countdown_timer_discount_start', $discount_start_date );
		update_post_meta( $product->get_id(), '_sgsb_countdown_timer_discount_end', $discount_end_date );
		update_post_meta( $product->get_id(), '_sgsb_countdown_timer_discount_amount', $stock_discount_amount );
		// phpcs:enable WordPress.Security.NonceVerification.Missing
	}

	/**
	 * Update product price according to stock discount.
	 *
	 * @param float       $price Product price.
	 * @param \WC_Product $product WooCommerce product object.
	 */
	public function woocommerce_product_get_price( $price, $product ) {
		// Check countdown discount is set.
		if ( Helper::sgsb_stock_cd_is_product_discountable( $product->get_id() ) ) {
			$float_price     = floatval( $product->get_regular_price() );
			$discount_amount = get_post_meta( $product->get_id(), '_sgsb_countdown_timer_discount_amount', true );
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
		if ( Helper::sgsb_stock_cd_is_product_discountable( $product->get_id() ) ) {
			return true;
		}

		return $is_on_sale;
	}

	/**
	 * Check if the product is an external type.
	 *
	 * @return bool Whether the product is an external type.
	 */
	public function is_external_product() {
		global $post;
		$product = wc_get_product( $post->ID );

		if ( $product && $product->is_type( 'external' ) ) {
			return true;
		}

		return false;
	}
}
