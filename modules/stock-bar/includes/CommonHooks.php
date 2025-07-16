<?php
/**
 * Common_Hooks class for `Stock Bar` module.
 *
 * @package SBFW
 */

namespace STOREGROWTH\SPSB\Modules\StockBar\Includes;

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
		add_action( 'woocommerce_before_add_to_cart_form', array( $this, 'show_stock_status_template' ) );

		add_filter( 'woocommerce_get_stock_html', array( $this, 'woocommerce_get_stock_html' ), 10, 2 );
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
}
