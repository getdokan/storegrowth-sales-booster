<?php
/**
 * Ajax class for Progressive Discount Banner.
 *
 * @package SBFW
 */

namespace WPCodal\SBFW\Modules\PD_Banner;

use WPCodal\SBFW\Traits\Singleton;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Add ajax actions inside this class.
 */
class Ajax {

	use Singleton;

	/**
	 * Constructor of Ajax class.
	 */
	private function __construct() {
		add_action( 'wp_ajax_sbfw_pd_banner_save_settings', array( $this, 'save_settings' ) );
		add_action( 'wp_ajax_sbfw_pd_banner_get_settings', array( $this, 'get_settings' ) );
	}

	/**
	 * Ajax action for save settings
	 */
	public function save_settings() {
		check_ajax_referer( 'sbfw_ajax_nonce' );

		if ( ! isset( $_POST['form_data'] ) ) {
			wp_send_json_error();
		}

		if ( ! is_array( $_POST['form_data'] ) ) {
			wp_send_json_error();
		}

		$form_data      = array();
		$icon_validator = array(
			'default_banner_icon_html',
			'progressive_banner_icon_html',
		);

		// phpcs:ignore WordPress.Security.ValidatedSanitizedInput.MissingUnslash,WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
		foreach ( $_POST['form_data'] as $form_key => $form_value ) {
			if ( in_array( $form_key, $icon_validator, true ) ) {
				$form_data[ $form_key ] = sbfw_sanitize_svg_icon_fields( $form_value );
			} else {
				$form_data[ $form_key ] = sbfw_sanitize_form_fields( $form_value );
			}
		}

		$get_form_data = sbfw_pd_banner_get_settings();
		$merged_data   = array_merge( $get_form_data, $form_data );

		update_option( 'sbfw_progressive_discount_banner_settings', $merged_data );

		wp_send_json_success( $merged_data );
	}

	/**
	 * Ajax action for get settings.
	 */
	public function get_settings() {
		check_ajax_referer( 'sbfw_ajax_nonce' );

		wp_send_json_success( sbfw_pd_banner_get_settings() );
	}

}
