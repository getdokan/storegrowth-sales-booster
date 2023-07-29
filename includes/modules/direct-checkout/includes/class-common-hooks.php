<?php
/**
 * Common_Hooks class for `Stock Bar` module.
 *
 * @package SBFW
 */

namespace STOREGROWTH\SPSB\Modules\Direct_Checkout;

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
		// add_action( 'woocommerce_after_shop_loop_item', array( $this, 'show_direct_checkout_button_shop' ), 15 );
		add_action( 'woocommerce_after_add_to_cart_button', array( $this, 'show_direct_checkout_button_product' ) );
		// add_filter( 'woocommerce_product_single_add_to_cart_text', 'woocommerce_custom_add_to_cart_text' );
		add_filter( 'wc_get_template', array( $this, 'test_function' ), 10, 5 );
		add_filter( 'woocommerce_locate_template', array( $this, 'set_template_path' ), 10, 3 );
	}

	/**
	 * Hook for WooCommerce after shop loop item.
	 */
	public function show_direct_checkout_button_shop() {
		if ( $this->should_display_buy_now_button( 'shop_page_checkout_enable' ) ) {
			$this->display_buy_now_button();
		}
	}

	public function woocommerce_custom_add_to_cart_text() {
		var_dump( 'runnig' );
		return __( 'Add to the basket', 'woocommerce' );
	}
	/**
	 * Hook for WooCommerce after add-to-cart button.
	 */
	public function show_direct_checkout_button_product() {
		if ( $this->should_display_buy_now_button( 'product_page_checkout_enable' ) ) {
			$this->display_buy_now_button();
		}
	}

	/**
	 * Check if the Buy Now button should be displayed.
	 *
	 * @param string $option_key The option key to check for.
	 * @return bool Whether the Buy Now button should be displayed or not.
	 */
	private function should_display_buy_now_button( $option_key ) {
		$settings = get_option( 'sgsb_direct_checkout_settings' );
		return sgsb_find_option_setting( $settings, $option_key, true );
	}

	public function test_function( $template, $template_name, $args, $template_path, $default_path ) {
		if ( $template_name == 'loop/add-to-cart.php' ) {
			$template = __DIR__ . '/../templates/direct-checkout-button.php';
		}
		return $template;
	}

	public function set_template_path( $template, $template_name, $template_path ) {
		if ( $template_name == 'loop/add-to-cart.php' ) {
			$template = __DIR__ . '/../templates/direct-checkout-button.php';
		}
		return $template;
	}
	/**
	 * Function to display the Buy Now button.
	 */
	private function display_buy_now_button() {
		// global $product;

		// if ( 'simple' !== $product->get_type() || ! $product->is_purchasable() || ! $product->is_in_stock() ) {
		// return;
		// }

		include __DIR__ . '/../templates/direct-checkout-button.php';
	}
}
