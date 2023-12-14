<?php
/**
 * WoocommerceDiscount class for Progressive Discount Banner.
 *
 * @package SBFW
 */

namespace STOREGROWTH\SPSB\Modules\ProgressiveDiscountBanner\Includes;

use STOREGROWTH\SPSB\Traits\Singleton;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Add or Remove discount when product add/remove to cart.
 */
class WoocommerceDiscount {

	use Singleton;

	/**
	 * Constructor of Woocommerce_Discount class.
	 */
	private function __construct() {
		add_action( 'woocommerce_add_to_cart', array( $this, 'woocommerce_added_to_cart' ), 22 );
		add_action( 'woocommerce_cart_item_restored', array( $this, 'woocommerce_added_to_cart' ), 22 );

		add_action( 'woocommerce_cart_calculate_fees', array( $this, 'woocommerce_cart_calculate_fees' ), 22 );
	}

	/**
	 * Fired after cart item added.
	 */
	public function woocommerce_added_to_cart() {
		$packages = WC()->shipping()->get_packages();

		// Check package data is available.
		if ( ! isset( $packages[0] ) ) {
			return;
		}

		$settings      = Helper::sgsb_pd_banner_get_settings();
		$discount_type = sgsb_find_option_setting( $settings, 'discount_type', false );

		if ( ! $discount_type ) {
			return;
		}

		$minimum_amount = sgsb_find_option_setting( $settings, 'cart_minimum_amount', 0 );
		$cart_amount    = wc()->cart->get_subtotal();

		// Check customer is not eligible for discount.
		if ( $cart_amount < $minimum_amount ) {
			return;
		}

		if ( 'free-shipping' === $discount_type ) {
			$this->set_free_shipping( $packages );
		}
	}

	/**
	 * Get session key for
	 *
	 * @param array $package Package data as array.
	 */
	private function get_free_shipping_key( $package ) {
		foreach ( $package['rates'] as $rate ) {
			if ( 'free_shipping' === $rate->method_id ) {
				return $rate->id;
			}
		}

		return '';
	}

	/**
	 * Set free shipping.
	 *
	 * @param array $packages WooCommerce packages.
	 */
	private function set_free_shipping( $packages ) {
		$chosen_shipping_methods = WC()->session->get( 'chosen_shipping_methods' );

		foreach ( $packages as $i => $package ) {
			$chosen_shipping_methods[ $i ] = $this->get_free_shipping_key( $package );
		}

		WC()->session->set( 'chosen_shipping_methods', $chosen_shipping_methods );
	}

	/**
	 * Calculate discount amount.
	 */
	public function woocommerce_cart_calculate_fees() {
		$settings      = Helper::sgsb_pd_banner_get_settings();
		$discount_type = sgsb_find_option_setting( $settings, 'discount_type', false );

		if ( ! $discount_type ) {
			return;
		}

		$minimum_amount = sgsb_find_option_setting( $settings, 'cart_minimum_amount', 0 );
		$cart_amount    = wc()->cart->get_subtotal();

		// Check customer is not eligible for discount.
		if ( $cart_amount < $minimum_amount ) {
			return;
		}

		if ( 'discount-amount' === $discount_type ) {
			$this->set_discount_amount( $settings, $cart_amount );
		}
	}

	/**
	 * Set discount amount.
	 *
	 * @param array $settings PD Banner settings.
	 * @param float $cart_amount Cart amount.
	 */
	private function set_discount_amount( $settings, $cart_amount ) {
		$discount_amount = 0;

		$discount_amount_value = floatval( sgsb_find_option_setting( $settings, 'discount_amount_value', 0 ) );

		if ( 'fixed-amount' === $settings['discount_amount_mode'] ) {
			$discount_amount = $discount_amount_value;
		} elseif ( 'percentage' === $settings['discount_amount_mode'] ) {
			// Calculate discount.
			$discount_amount = floatval(
				( $cart_amount * $discount_amount_value ) / 100
			);
		}

		if ( ! $discount_amount ) {
			return;
		}

		$fees_api = wc()->cart->fees_api();

		// Add discount as fee.
		$fees_api->add_fee(
			array(
				'id'     => 'sgsb-pd-banner-discount',
				'name'   => 'Discount',
				'amount' => - $discount_amount, // Negative value to decrease the total.
			)
		);
	}
}
