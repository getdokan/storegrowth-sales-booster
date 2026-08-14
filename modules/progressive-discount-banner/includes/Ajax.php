<?php
/**
 * Ajax class for Progressive Discount Banner.
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Modules\ProgressiveDiscountBanner;

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
		add_action( 'wp_ajax_spsg_pd_banner_save_settings', array( $this, 'save_settings' ) );
		add_action( 'wp_ajax_spsg_pd_banner_get_settings', array( $this, 'get_settings' ) );
	}

	/**
	 * Ajax action for save settings
	 */
	public function save_settings() {
		check_ajax_referer( 'spsg_ajax_nonce' );

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( __( 'You are not allowed to perform this action.', 'storegrowth-sales-booster' ), 403 );
		}

		// json_decode() takes a string. An array here decodes to null on PHP 7.4
		// and throws on PHP 8, and a string that is valid JSON can still be
		// missing the key. Every one of those used to fall through to an
		// unconditional update_option() and wipe the stored settings, so the
		// payload is validated before anything is written.
		// phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- JSON payload; decoded and validated below.
		$raw_form_data = isset( $_POST['form_data'] ) && is_string( $_POST['form_data'] ) ? wp_unslash( $_POST['form_data'] ) : '';

		$form_data = json_decode( $raw_form_data, true );

		if ( ! is_array( $form_data ) || ! isset( $form_data['shipping_bar_data'] ) || ! is_array( $form_data['shipping_bar_data'] ) ) {
			wp_send_json_error( __( 'Invalid settings payload.', 'storegrowth-sales-booster' ), 400 );
		}

		$bar_data = $form_data['shipping_bar_data'];

		$icon_validator = array(
			'default_banner_icon_html',
			'progressive_banner_icon_html',
		);

		update_option( 'spsg_progressive_discount_banner_settings', $bar_data );

		wp_send_json_success( maybe_unserialize( get_option( 'spsg_progressive_discount_banner_settings' ) ) );
	}

	/**
	 * Ajax action for get settings.
	 */
	public function get_settings() {
		check_ajax_referer( 'spsg_ajax_nonce' );

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( __( 'You are not allowed to perform this action.', 'storegrowth-sales-booster' ), 403 );
		}

		wp_send_json_success( Helper::get_settings() );
	}
}
