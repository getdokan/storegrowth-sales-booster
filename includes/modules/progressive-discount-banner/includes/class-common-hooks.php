<?php
/**
 * Common_Hooks class for Progressive Discount Banner.
 *
 * @package SBFW
 */

namespace STOREGROWTH\SPSB\Modules\PD_Banner;

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
		//phpcs:disable
		// Don't load banner on fast fly cart.
		if ( ! isset( $_GET['sgsb-checkout'] ) ) {
			add_action( 'wp_footer', array( $this, 'wp_footer' ) );

			add_filter( 'woocommerce_add_to_cart_fragments', array( $this, 'woocommerce_add_to_cart_fragments' ) );
		}
		// phpcs:enable
	}

	/**
	 * Output bar html
	 */
	public function wp_footer() {
		sgsb_pd_banner_get_bar_content();
	}

	/**
	 * Add content to cart fragment.
	 *
	 * @param array $fragments WooCommerce fragments.
	 */
	public function woocommerce_add_to_cart_fragments( $fragments ) {

		$fragments['div.sgsb-pd-banner-bar-wrapper'] = sgsb_pd_banner_get_bar_content( false );

		return $fragments;
	}

}
