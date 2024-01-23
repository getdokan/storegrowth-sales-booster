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
		// add_action( 'woosq_product_summary', array( $this, 'before_title' ), 4 );
		add_action( 'woosq_product_summary', 'woocommerce_template_single_title', 5 );
		// add_action( 'woosq_product_summary', array( $this, 'after_title' ), 6 );

		// add_action( 'woosq_product_summary', array( $this, 'before_rating' ), 9 );
		add_action( 'woosq_product_summary', 'woocommerce_template_single_rating' );
		// add_action( 'woosq_product_summary', array( $this, 'after_rating' ), 11 );

		// add_action( 'woosq_product_summary', array( $this, 'before_price' ), 14 );
		add_action( 'woosq_product_summary', 'woocommerce_template_single_price', 15 );
		// add_action( 'woosq_product_summary', array( $this, 'after_price' ), 16 );

		// add_action( 'woosq_product_summary', array( $this, 'before_excerpt' ), 19 );
		add_action( 'woosq_product_summary', 'woocommerce_template_single_excerpt', 20 );
		// add_action( 'woosq_product_summary', array( $this, 'after_excerpt' ), 21 );

		add_action( 'woosq_product_summary', array( $this, 'add_to_cart' ), 25 );

		// add_action( 'woosq_product_summary', array( $this, 'before_meta' ), 29 );
		add_action( 'woosq_product_summary', 'woocommerce_template_single_meta', 30 );
		// add_action( 'woosq_product_summary', array( $this, 'after_meta' ), 31 );
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
