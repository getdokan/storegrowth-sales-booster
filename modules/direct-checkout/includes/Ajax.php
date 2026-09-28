<?php
/**
 * Ajax class for `Stock Bar` module.
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Modules\DirectCheckout;

use StorePulse\StoreGrowth\Helper;
use StorePulse\StoreGrowth\Interfaces\HookRegistry;
use StorePulse\StoreGrowth\Settings\SettingsService;

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

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( __( 'You are not allowed to perform this action.', 'storegrowth-sales-booster' ), 403 );
		}

		if ( ! isset( $_POST['data'] ) ) {
			wp_send_json_error();
		}

		// The old admin's payload: JSON `{ direct_checkout_data: { … } }`.
		// phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- Decoded, then sanitized per field by the settings service.
		$data = json_decode( wp_unslash( $_POST['data'] ), true );

		if ( ! is_array( $data ) || ! isset( $data['direct_checkout_data'] ) || ! is_array( $data['direct_checkout_data'] ) ) {
			wp_send_json_error( __( 'Invalid settings payload.', 'storegrowth-sales-booster' ), 400 );
		}

		// Sanitized per field and merged into the stored option (it used to
		// replace the option unsanitized).
		$saved = storegrowth_get_container()->get( SettingsService::class )->save( DirectCheckoutModule::get_id(), $data['direct_checkout_data'] );

		if ( is_wp_error( $saved ) ) {
			wp_send_json_error( $saved->get_error_message(), 400 );
		}

		wp_send_json_success( Helper::get_settings( 'spsg_direct_checkout_settings' ) );
	}


	/**
	 * Ajax action for get settings.
	 */
	public function get_settings() {
		check_ajax_referer( 'spsg_ajax_nonce' );

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( __( 'You are not allowed to perform this action.', 'storegrowth-sales-booster' ), 403 );
		}

		$form_data = Helper::get_settings( 'spsg_direct_checkout_settings', [] );

		wp_send_json_success( $form_data );
	}
}
