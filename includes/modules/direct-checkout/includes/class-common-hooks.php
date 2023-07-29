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
		add_action( 'woocommerce_after_shop_loop_item', array( $this, 'show_direct_checkout_button' ), 15 );
		add_action( 'woocommerce_after_add_to_cart_button', array( $this, 'show_direct_checkout_button' ) );
	}

		/**
		 * Hook for WooCommerce before add-to-cart form.
		 */
	public function show_direct_checkout_button() {
		global $product;

		if ( 'simple' !== $product->get_type()
		|| ! $product->is_purchasable()
		|| ! $product->is_in_stock() ) {
			return;
		}

		$product_id = $product->get_ID();

		ob_start();

		include __DIR__ . '/../templates/direct-checkout-button.php';
		$output = ob_get_clean();

		// Escape the output before echoing it.
		echo wp_kses_post( $output );
	}
}
