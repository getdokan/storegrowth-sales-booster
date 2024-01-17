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
		add_filter( 'woocommerce_loop_add_to_cart_link', array( $this, 'show_quick_view_button_shop' ), 15 );
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
	public function show_quick_view_button_shop( $add_to_cart ) {
			ob_start();
			$this->display_buy_now_button();
			$buy_now_button = ob_get_contents();
			ob_end_clean();

			$add_to_cart .= $buy_now_button;

		return $add_to_cart;
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

		include __DIR__ . '/../templates/quick-view-button.php';
	}
}
