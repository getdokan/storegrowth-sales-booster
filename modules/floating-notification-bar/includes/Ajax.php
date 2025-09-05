<?php
/**
 * Ajax class for Progressive Discount Banner.
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Modules\FloatingNotificationBar;

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
		add_action( 'wp_ajax_spsg_floating_notification_bar_save_settings', array( $this, 'save_settings' ) );
		add_action( 'wp_ajax_spsg_floating_notification_bar_get_settings', array( $this, 'get_settings' ) );
	}

	/**
	 * Ajax action for save settings
	 */
	public function save_settings() {
		check_ajax_referer( 'spsg_ajax_nonce' );

		$form_data = isset( $_POST['form_data'] ) ? json_decode( wp_unslash( $_POST['form_data'] ), true ) : array(); 

		$bar_data = isset( $form_data['shipping_bar_data'] ) ? $form_data['shipping_bar_data'] : array();

		$icon_validator = array(
			'default_banner_icon_html',
			'progressive_banner_icon_html',
		);

		update_option( 'spsg_floating_notification_bar_settings', $bar_data );

		wp_send_json_success( maybe_unserialize( get_option( 'spsg_floating_notification_bar_settings' ) ) );
	}

	/**
	 * Ajax action for get settings.
	 */
	public function get_settings() {
		check_ajax_referer( 'spsg_ajax_nonce' );

		wp_send_json_success( Helper::get_settings() );
	}
}
