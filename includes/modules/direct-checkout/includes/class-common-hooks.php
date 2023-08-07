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
		add_filter( 'woocommerce_product_data_tabs', array( $this, 'direct_checkout_product_tab' ) );
		add_action( 'woocommerce_product_data_panels', array( $this, 'direct_checkout_custom_radio_metabox' ) );

		$this->direct_checkout_hooks_init();
	}

	/**
	 * Conditionally run the hooks
	 */
	public function direct_checkout_hooks_init() {
		$settings               = get_option( 'sgsb_direct_checkout_settings' );
		$buy_now_button_setting = sgsb_find_option_setting( $settings, 'buy_now_button_setting', 'cart-with-buy-now' );

		if ( 'cart-with-buy-now' === $buy_now_button_setting ) {
			add_action( 'woocommerce_after_shop_loop_item', array( $this, 'show_direct_checkout_button_shop' ), 15 );
			add_action( 'woocommerce_after_add_to_cart_button', array( $this, 'show_direct_checkout_button_product' ) );
		} elseif ( 'cart-to-buy-now' === $buy_now_button_setting ) {
			add_filter( 'wc_get_template', array( $this, 'set_cart_to_checkout_button_template' ), 10, 5 );
			add_filter( 'woocommerce_locate_template', array( $this, 'set_template_path' ), 10, 3 );
		} else {
			return;
		}
	}
	/**
	 * Hook for WooCommerce after shop loop item.
	 */
	public function show_direct_checkout_button_shop() {
		if ( $this->should_display_buy_now_button( 'shop_page_checkout_enable' ) ) {
			$this->display_buy_now_button();
		}
	}

	/**
	 * Hook for WooCommerce after add-to-cart button in the single product page.
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

		/**
		 * Add a tab to the woocommerce product meta field.
		 *
		 * @param array $tabs The option key to check for.
		 */
	public function direct_checkout_product_tab( $tabs ) {
		// Adds the new tab.
		$tabs['direct_checkout_tab'] = array(
			'label'  => __( 'Direct Checkout', 'storegrowth-sales-booster' ),
			'target' => 'sgsb-direct-checkout-data',
		);
		return $tabs;
	}

	/**
	 * Hook for WooCommerce to add the fields in the products settings tab.
	 */
	public function direct_checkout_custom_radio_metabox() {
		global $post;
		include __DIR__ . '/../templates/direct-checkout-woo-setting.php';
	}

		/**
		 * Check if the Buy Now button should be displayed in the specific template path.
		 *
		 * @param string $template The option key to check for.
		 * @param string $template_name The option key to check for.
		 * @param array  $args The option key to check for.
		 * @param string $template_path The option key to check for.
		 * @param string $default_path The option key to check for.
		 */
	public function set_cart_to_checkout_button_template( $template, $template_name, $args, $template_path, $default_path ) { //phpcs:ignore.
		if ( in_array( $template_name, array( 'single-product/add-to-cart/simple.php', 'loop/add-to-cart.php' ), true ) ) {
			$template = __DIR__ . '/../templates/add-cart-buy-now.php';
		}
		return $template;
	}

			/**
			 * Check if the Buy Now button should be displayed.
			 *
			 * @param string $template The option key to check for.
			 * @param string $template_name The option key to check for.
			 * @return string $template Buy Now button should be displayed or not.
			 */
	public function set_template_path( $template, $template_name ) {
		// Override template path.
		if ( in_array( $template_name, array( 'single-product/add-to-cart/simple.php', 'loop/add-to-cart.php' ), true ) ) {
			$template = __DIR__ . '/../templates/add-cart-buy-now.php';
		}
		return $template;
	}

	/**
	 * Function to display the Buy Now button.
	 */
	private function display_buy_now_button() {
		global $product;
		if ( 'simple' !== $product->get_type() || ! $product->is_purchasable() || ! $product->is_in_stock() ) {
			return;
		}
		include __DIR__ . '/../templates/add-cart-with-buy-now.php';
	}
}
