<?php
/**
 * Common_Hooks class for Progressive Discount Banner.
 *
 * @package SBFW
 */

namespace WPCodal\SBFW\Modules\PD_Banner;

use WPCodal\SBFW\Traits\Singleton;

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
		// Don't load banner on fast fly cart.
		if ( ! isset( $_GET['sbfw-checkout'] ) ) {
			add_action( 'wp_footer', array( $this, 'wp_footer' ) );

			add_filter( 'woocommerce_add_to_cart_fragments', array( $this, 'woocommerce_add_to_cart_fragments' ) );
		}
	}

	/**
	 * Output bar html
	 */
	public function wp_footer() {
		sbfw_pd_banner_get_bar_content();
	}

	/**
	 * Add content to cart fragment.
	 *
	 * @param array $fragments WooCommerce fragments.
	 */
	public function woocommerce_add_to_cart_fragments( $fragments ) {

		$fragments['div.sbfw-pd-banner-bar-wrapper'] = sbfw_pd_banner_get_bar_content( false );

		return $fragments;
	}

}
