<?php

namespace StorePulse\StoreGrowth\Integrations\Dokan;

use StorePulse\StoreGrowth\Helper;
use StorePulse\StoreGrowth\Integrations\Dokan\Settings\BogoVendorSettings;
use StorePulse\StoreGrowth\Settings\SettingsService;
use StorePulse\StoreGrowth\Traits\Singleton;

defined( 'ABSPATH' ) || exit;

/**
 * Ajax Class.
 *
 * @package SBFW
 */
class Ajax {

	use Singleton;

	/**
	 * Constructor of Ajax Class.
	 *
	 * @since 1.12.0
	 */
	private function __construct() {
		add_action( 'wp_ajax_spsg_bogo_vendors_get_settings', [ $this, 'get_settings' ] );
		add_action( 'wp_ajax_spsg_bogo_vendors_save_settings', [ $this, 'save_settings' ] );
	}

	/**
	 * Initialize Classes.
	 *
	 * @since 1.12.0
	 *
	 * @return void
	 */
	public function save_settings() {
		check_ajax_referer( 'spsg_ajax_nonce' );

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( __( 'You are not allowed to perform this action.', 'storegrowth-sales-booster' ), 403 );
		}

		if ( ! isset( $_POST['data'] ) ) {
			wp_send_json_error();
		}

		// Decode the JSON data.
		$data = isset( $_POST['data'] ) ? json_decode( wp_unslash( $_POST['data'] ), true ) : []; // phpcs: ignore.

		if ( isset( $data['spsg_bogo_dokan_vendors_settings_data'] ) ) {
			// Through the settings engine (it replaced the option unsanitized):
			// validates the schema's keys and merges, so other stored keys stay.
			$saved = storegrowth_get_container()->get( SettingsService::class )->save( BogoVendorSettings::ID, (array) $data['spsg_bogo_dokan_vendors_settings_data'] );

			if ( is_wp_error( $saved ) ) {
				wp_send_json_error( $saved->get_error_message(), 400 );
			}

			wp_send_json_success( Helper::get_settings( BogoVendorRules::OPTION ) );
		}
	}

	/**
	 * Initialize Classes.
	 *
	 * @since 1.12.0
	 *
	 * @return void
	 */
	public function get_settings() {
		check_ajax_referer( 'spsg_ajax_nonce' );

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( __( 'You are not allowed to perform this action.', 'storegrowth-sales-booster' ), 403 );
		}

		$form_data = Helper::get_settings( BogoVendorRules::OPTION, [] );

		wp_send_json_success( $form_data );
	}
}
