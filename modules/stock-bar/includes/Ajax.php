<?php
/**
 * Ajax class for `Stock Bar` module.
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Modules\StockBar;

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
		add_action( 'wp_ajax_spsg_stock_bar_save_settings', array( $this, 'save_settings' ) );
		add_action( 'wp_ajax_spsg_stock_bar_get_settings', array( $this, 'get_settings' ) );
	}

	/**
	 * Ajax action for save settings
	 */
	public function save_settings() {
		check_ajax_referer( 'spsg_ajax_nonce' );

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( __( 'You are not allowed to perform this action.', 'storegrowth-sales-booster' ), 403 );
		}

		// array_map() over a non-array returns null on PHP 7.4 (and throws on
		// PHP 8), so an unvalidated payload would overwrite the stored settings
		// with nothing. Reject it instead.
		if ( ! isset( $_POST['form_data'] ) || ! is_array( $_POST['form_data'] ) ) {
			wp_send_json_error( __( 'Invalid settings payload.', 'storegrowth-sales-booster' ), 400 );
		}

		// Kept for back-compat (ADR-004): the same settings service as
		// `POST sales-booster/v1/settings/stock-bar`, which validates every key
		// and merges into the stored option instead of replacing it.
		// phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- Each value is validated by the settings service.
		$form_data = array_map( array( Helper::class, 'sanitize_form_fields' ), wp_unslash( $_POST['form_data'] ) );
		$saved     = storegrowth_get_container()->get( SettingsService::class )->save( 'stock-bar', $form_data );

		if ( is_wp_error( $saved ) ) {
			wp_send_json_error( $saved->get_error_message(), 400 );
		}

		wp_send_json_success();
	}

	/**
	 * Ajax action for get settings.
	 */
	public function get_settings() {
		check_ajax_referer( 'spsg_ajax_nonce' );

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( __( 'You are not allowed to perform this action.', 'storegrowth-sales-booster' ), 403 );
		}

		$form_data = Helper::get_settings( 'spsg_stock_bar_settings', array() );

		wp_send_json_success( $form_data );
	}

}
