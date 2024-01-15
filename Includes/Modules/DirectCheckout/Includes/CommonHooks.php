<?php
/**
 * Common_Hooks class for `Stock Bar` module.
 *
 * @package SBFW
 */

namespace STOREGROWTH\SPSB\Modules\DirectCheckout\Includes;

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

		$this->direct_checkout_hooks_init();
	}

	/**
	 * Conditionally run the hooks
	 */
	public function direct_checkout_hooks_init() {
		$settings               = get_option( 'sgsb_direct_checkout_settings' );
		$buy_now_button_setting = sgsb_find_option_setting( $settings, 'buy_now_button_setting', 'cart-with-buy-now' );
		if ( 'cart-with-buy-now' === $buy_now_button_setting || 'specific-buy-now' === $buy_now_button_setting ) {
			// Show direct checkout button on shop loop item and product page.
			add_filter( 'woocommerce_loop_add_to_cart_link', array( $this, 'show_direct_checkout_button_shop' ), 15 );
			add_action( 'woocommerce_after_add_to_cart_button', array( $this, 'show_direct_checkout_button_product' ) );

			if ( 'specific-buy-now' === $buy_now_button_setting ) {
				// Woocommerce product data settings meta.
				add_filter( 'woocommerce_product_data_tabs', array( $this, 'direct_checkout_product_tab' ) );
				add_action( 'woocommerce_product_data_panels', array( $this, 'direct_checkout_custom_data' ) );
				add_action( 'woocommerce_process_product_meta', array( $this, 'save_direct_checkout_data' ) );

				// Cart button as buy now button.
				add_filter( 'woocommerce_loop_add_to_cart_link', array( $this, 'show_signle_direct_checkout_button_shop' ), 15 );
				add_filter( 'wc_get_template', array( $this, 'set_cart_to_checkout_button_template' ), 10, 5 );
				add_filter( 'woocommerce_locate_template', array( $this, 'set_template_path' ), 10, 3 );
			}
		} elseif ( 'cart-to-buy-now' === $buy_now_button_setting ) {
			// Modify cart to checkout button template.
			add_filter( 'woocommerce_loop_add_to_cart_link', array( $this, 'show_signle_direct_checkout_button_shop' ), 15 );
			add_filter( 'wc_get_template', array( $this, 'set_cart_to_checkout_button_template' ), 10, 5 );
			add_filter( 'woocommerce_locate_template', array( $this, 'set_template_path' ), 10, 3 );
		} else {
			return;
		}
	}

	/**
	 * Hook for WooCommerce loop add to cart link.
	 *
	 * @since 1.0.0
	 *
	 * @param string $add_to_cart Add to cart link.
	 *
	 * @return string
	 */
	public function show_signle_direct_checkout_button_shop( $add_to_cart ) {

		if ( $this->should_display_buy_now_button( 'shop_page_checkout_enable' ) ) {
			ob_start();
			global $product;
			$product_id                    = get_the_ID();
			$direct_checkout_button_layout = get_post_meta( $product_id, '_sgsb_direct_checkout_button_layout', true );
			$settings                      = get_option( 'sgsb_direct_checkout_settings' );
			$buy_now_button_setting        = sgsb_find_option_setting( $settings, 'buy_now_button_setting', 'cart-to-buy-now' );
			if (
				( 'cart-to-buy-now' === $direct_checkout_button_layout && 'specific-buy-now' === $buy_now_button_setting )
				|| 'cart-to-buy-now' === $buy_now_button_setting
				) {
				if ( 'simple' === $product->get_type() && $product->is_purchasable() && $product->is_in_stock() ) {
					include __DIR__ . '/../templates/buy-now-button-template.php';
					$buy_now_button = ob_get_contents();
					ob_end_clean();

					$add_to_cart = $buy_now_button;

					return $add_to_cart;
				}
			}
		}
		return $add_to_cart;
	}

	/**
	 * Hook for WooCommerce loop add to cart link.
	 *
	 * @since 1.0.0
	 *
	 * @param string $add_to_cart Add to cart link.
	 *
	 * @return string
	 */
	public function show_direct_checkout_button_shop( $add_to_cart ) {
		if ( $this->should_display_buy_now_button( 'shop_page_checkout_enable' ) ) {
			ob_start();
			$this->display_buy_now_button();
			$buy_now_button = ob_get_contents();
			ob_end_clean();

			$add_to_cart .= $buy_now_button;
		}

		return $add_to_cart;
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

		$product_id = get_the_ID();
		$product    = wc_get_product( $product_id );

		// Adds the new tab.
		if ( $product->is_type( 'simple' ) ) {
			// Adds the new tab.
			$tabs['direct_checkout_tab'] = array(
				'label'  => __( 'Direct Checkout', 'storegrowth-sales-booster' ),
				'target' => 'sgsb-direct-checkout-data',
			);
		}

		return $tabs;
	}

	/**
	 * Hook for WooCommerce to add the fields in the products settings tab.
	 */
	public function direct_checkout_custom_data() {
		global $post;
		include __DIR__ . '/../templates/direct-checkout-woo-setting.php';
	}

	/**
	 * Hook for WooCommerce to save the data of the custom field.
	 *
	 * @param int $post_id is used to pass the post id param.
	 */
	public function save_direct_checkout_data( $post_id ) {

		// phpcs:disable WordPress.Security.NonceVerification.Missing
		if ( isset( $_POST['_sgsb_direct_checkout_button_layout'] ) ) {
			$layout_value = wc_clean( wp_unslash( $_POST['_sgsb_direct_checkout_button_layout'] ) ); //phpcs:ignore
			update_post_meta( $post_id, '_sgsb_direct_checkout_button_layout', $layout_value );
		}
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
		$product_id                    = get_the_ID();
		$direct_checkout_button_layout = get_post_meta( $product_id, '_sgsb_direct_checkout_button_layout', true );
		$settings                      = get_option( 'sgsb_direct_checkout_settings' );
		$buy_now_button_setting        = sgsb_find_option_setting( $settings, 'buy_now_button_setting', 'cart-with-buy-now' );

		if (
		( 'cart-to-buy-now' === $direct_checkout_button_layout && 'specific-buy-now' === $buy_now_button_setting )
		|| 'cart-to-buy-now' === $buy_now_button_setting
		) {
			if ( in_array( $template_name, array( 'single-product/add-to-cart/simple.php', 'loop/add-to-cart.php' ), true ) ) {
				$template = __DIR__ . '/../templates/add-cart-buy-now.php';
			}
			return $template;
		}
		return $template;
	}

	/**
	 * Check if the Buy Now button should be displayed.
	 *
	 * @param string $template The option key to check for.
	 * @param string $template_name The option key to check for.
	 *
	 * @return string $template Buy Now button should be displayed or not.
	 */
	public function set_template_path( $template, $template_name ) {
		$settings               = get_option( 'sgsb_direct_checkout_settings' );
		$buy_now_button_setting = sgsb_find_option_setting( $settings, 'buy_now_button_setting', 'cart-with-buy-now' );
		// Override template path .
		if ( 'cart-to-buy-now' === $buy_now_button_setting ) {
			if ( in_array( $template_name, array( 'single-product/add-to-cart/simple.php', 'loop/add-to-cart.php' ), true ) ) {
				$template = __DIR__ . '/../templates/add-cart-buy-now.php';
			}
			return $template;
		}
		return $template;
	}

	/**
	 * Function to display the Buy Now button.
	 */
	private function display_buy_now_button() {
		global $product;

		$product_id                    = get_the_ID();
		$direct_checkout_button_layout = get_post_meta( $product_id, '_sgsb_direct_checkout_button_layout', true );
		$settings                      = get_option( 'sgsb_direct_checkout_settings' );
		$buy_now_button_setting        = sgsb_find_option_setting( $settings, 'buy_now_button_setting', 'cart-with-buy-now' );

		if (
		( 'cart-with-buy-now' === $direct_checkout_button_layout && 'specific-buy-now' === $buy_now_button_setting )
		|| 'cart-with-buy-now' === $buy_now_button_setting
		) {
			if ( 'simple' === $product->get_type() && $product->is_purchasable() && $product->is_in_stock() ) {
				include __DIR__ . '/../templates/buy-now-button-template.php';
			}
		}
	}
}
