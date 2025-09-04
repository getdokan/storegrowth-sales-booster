<?php
/**
 * Ajax class for `Stock Bar` module.
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Modules\StockBar;

use StorePulse\StoreGrowth\Helper;
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
		add_action( 'wp_ajax_spsg_stock_bar_save_settings', array( $this, 'save_settings' ) );
		add_action( 'wp_ajax_spsg_stock_bar_get_settings', array( $this, 'get_settings' ) );
	}

	/**
	 * Ajax action for save settings
	 */
	public function save_settings() {
		check_ajax_referer( 'spsg_ajax_nonce' );

		if ( ! isset( $_POST['form_data'] ) ) {
			wp_send_json_error();
		}

		// phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- Sanitizing via ` Helper::class, 'sanitize_form_fields'`.
		$form_data = array_map( array( Helper::class, 'sanitize_form_fields' ), wp_unslash( $_POST['form_data'] ) );

		update_option( 'spsg_stock_bar_settings', $form_data );

		wp_send_json_success();
	}

	/**
	 * Ajax action for get settings.
	 */
	public function get_settings() {
		check_ajax_referer( 'spsg_ajax_nonce' );

		$form_data = \StorePulse\StoreGrowth\Helper::get_settings( 'spsg_stock_bar_settings', array() );

		wp_send_json_success( $form_data );
	}

}
