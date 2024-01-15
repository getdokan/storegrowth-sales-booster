<?php
/**
 * Common_Hooks class for Progressive Discount Banner.
 *
 * @package SBFW
 */

namespace STOREGROWTH\SPSB\Modules\ProgressiveDiscountBanner\Includes;

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
		// Don't load banner on 'order received' cart.
		if ( $this->is_order_received_page() ) {
			return;
		}
        // phpcs:disable
		// Don't load banner on fast fly cart.
		if ( ! isset( $_GET['sgsb-checkout'] ) ) {
			add_action( 'wp_footer', array( $this, 'wp_footer' ) );

			add_filter( 'woocommerce_add_to_cart_fragments', array( $this, 'woocommerce_add_to_cart_fragments' ) );
		}
		// phpcs:enable
	}

	/**
	 * Check if the current page is the WooCommerce order received page.
	 *
	 * @return bool True if on the order received page, false otherwise.
	 */
	private function is_order_received_page() {
        // phpcs:disable
		if ( isset( $_GET['order-received'] ) || isset( $_GET['key'] ) ) {
			return true;
		}
		return false;
        // phpcs:enable
	}

	/**
	 * Output bar html
	 */
	public function wp_footer() {
		$settings             = Helper::sgsb_pd_banner_get_settings();
		$deafault_device_view = array( 'banner-show-desktop' );
		$device_view          = sgsb_find_option_setting( $settings, 'banner_device_view', $deafault_device_view );

		if ( empty( $device_view ) ) {
			return;} else {
				Helper::sgsb_pd_banner_get_bar_content();
			}
	}

	/**
	 * Add content to cart fragment.
	 *
	 * @param array $fragments WooCommerce fragments.
	 */
	public function woocommerce_add_to_cart_fragments( $fragments ) {

		$fragments['div.sgsb-pd-banner-bar-wrapper'] = Helper::sgsb_pd_banner_get_bar_content( false );

		return $fragments;
	}
}
