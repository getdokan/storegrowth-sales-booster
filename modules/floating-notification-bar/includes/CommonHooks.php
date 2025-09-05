<?php
/**
 * Common_Hooks class for Progressive Discount Banner.
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Modules\FloatingNotificationBar;

use StorePulse\StoreGrowth\Interfaces\HookRegistry;
use StorePulse\StoreGrowth\helper as PluginHelper;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Miscellaneous hooks implementation.
 */
class CommonHooks implements HookRegistry {

	/**
	 * Register Hooks.
	 *
	 * @since 2.0.0
	 *
	 * @return void
	 */
	public function register_hooks(): void {
		// Don't load banner on 'order received' cart.

		if ( $this->is_order_received_page() ) {
			return;
		}
        // phpcs:disable
		// Don't load banner on fast fly cart.
		if ( ! isset( $_GET['spsg-checkout'] ) ) {
			add_action( 'wp_footer', array( $this, 'wp_footer' ) );

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
        if ( ! PluginHelper::is_current_user_allowed_to_view_promotions() ) {
            return;
        }

		$settings            = Helper::get_settings();
		$default_device_view = array( 'banner-show-desktop' );
		$device_view         = PluginHelper::find_option_settings( $settings, 'banner_device_view', $default_device_view );
		if ( empty( $device_view ) ) {
			return;
		} else {
			Helper::get_bar_content();
		}
	}
}
