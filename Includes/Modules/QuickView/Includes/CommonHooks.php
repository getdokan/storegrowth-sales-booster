<?php
/**
 * Common_Hooks class for `Stock Bar` module.
 *
 * @package SBFW
 */

namespace STOREGROWTH\SPSB\Modules\QuickView\Includes;

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
		$this->button_positon_hooks();

		add_action( 'sgsbqcv_product_summary', 'woocommerce_template_single_title', 5 );
		add_action( 'sgsbqcv_product_summary', 'woocommerce_template_single_rating' );
		add_action( 'sgsbqcv_product_summary', 'woocommerce_template_single_price', 15 );
		add_action( 'sgsbqcv_product_summary', 'woocommerce_template_single_excerpt', 20 );
		add_action( 'sgsbqcv_product_summary', array( $this, 'add_to_cart' ), 25 );
		add_action( 'sgsbqcv_product_summary', 'woocommerce_template_single_meta', 30 );
	}

		/**
		 * Hook for WooCommerce loop add to cart link.
		 *
		 * @since 1.0.0
		 */
	public function show_quick_view_button_shop() {
		echo esc_html( $this->display_buy_now_button() );
	}
		/**
		 * Hook for button postion.
		 *
		 * @since 1.1.3
		 */
	public function button_positon_hooks() {
		$settings        = get_option( 'sgsb_quick_view_settings' );
		$button_position = sgsb_find_option_setting( $settings, 'button_position', 'after_add_to_cart' );
		$hook            = 'woocommerce_after_shop_loop_item';
		$priority        = ( 'after_add_to_cart' === $button_position ) ? 15 : 10;

		add_action( $hook, array( $this, 'show_quick_view_button_shop' ), $priority );
	}

		/**
		 * Function to display the Buy Now button.
		 */
	private function display_buy_now_button() {
		global $product;

		$product_id                    = get_the_ID();
		$direct_checkout_button_layout = get_post_meta( $product_id, '_sgsb_direct_checkout_button_layout', true );
		$settings                      = get_option( 'sgsb_quick_view_settings' );

		include __DIR__ . '/../templates/quick-view-button.php';
	}

	/**
	 * Hook for WooCommerce loop add to cart link.
	 *
	 * @since 1.1.3
	 *
	 * @param string $_product Add to cart link.
	 */
	public function add_to_cart( $_product ) {
		global $product;
		$product    = $_product;
		$product_id = get_the_ID();
		// include __DIR__ . '/../templates/add-to-cart.php';
		woocommerce_template_single_add_to_cart();
	}
}
