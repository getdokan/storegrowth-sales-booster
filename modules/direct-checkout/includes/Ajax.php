<?php
/**
 * Ajax class for `Stock Bar` module.
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Modules\DirectCheckout;

use StorePulse\StoreGrowth\Interfaces\HookRegistry;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Add ajax actions inside this class.
 */
class Ajax implements HookRegistry {

	/**
	 * Register Hooks.
	 *
	 * @since 2.0.0
	 *
	 * @return void
	 */
	public function register_hooks(): void {
		add_action( 'wp_ajax_spsg_direct_checkout_save_settings', array( $this, 'save_settings' ) );
		add_action( 'wp_ajax_spsg_direct_checkout_get_settings', array( $this, 'get_settings' ) );
	}

	/**
	 * Ajax action for save settings
	 */
	public function save_settings() {
		check_ajax_referer( 'spsg_ajax_nonce' );

		if ( ! isset( $_POST['data'] ) ) {
			wp_send_json_error();
		}

		// Decode the JSON data.
		$data = isset( $_POST['data'] ) ? json_decode( wp_unslash( $_POST['data'] ), true ) : array(); // phpcs: ignore.

		if ( isset( $data['direct_checkout_data'] ) ) {
			$direct_checkout_data = $data['direct_checkout_data'];

			update_option( 'spsg_direct_checkout_settings', $direct_checkout_data );
			wp_send_json_success( maybe_unserialize( \StorePulse\StoreGrowth\Helper::get_settings( 'spsg_direct_checkout_settings' ) ) );
		}
	}


	/**
	 * Ajax action for get settings.
	 */
	public function get_settings() {
		check_ajax_referer( 'spsg_ajax_nonce' );

		$form_data = \StorePulse\StoreGrowth\Helper::get_settings( 'spsg_direct_checkout_settings', array() );

		wp_send_json_success( $form_data );
	}
}
