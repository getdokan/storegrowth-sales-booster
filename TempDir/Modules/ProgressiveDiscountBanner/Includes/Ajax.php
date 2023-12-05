<?php
/**
 * Ajax class for Progressive Discount Banner.
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
 * Add ajax actions inside this class.
 */
class Ajax {

	use Singleton;

	/**
	 * Constructor of Ajax class.
	 */
	private function __construct() {
		add_action( 'wp_ajax_sgsb_pd_banner_save_settings', array( $this, 'save_settings' ) );
		add_action( 'wp_ajax_sgsb_pd_banner_get_settings', array( $this, 'get_settings' ) );
	}

	/**
	 * Ajax action for save settings
	 */
	public function save_settings() {
		check_ajax_referer( 'sgsb_ajax_nonce' );

		$form_data = isset( $_POST['form_data'] ) ? json_decode( wp_unslash( $_POST['form_data'] ), true ) : array();

		$bar_data = isset( $form_data['shipping_bar_data'] ) ? $form_data['shipping_bar_data'] : array();

		$icon_validator = array(
			'default_banner_icon_html',
			'progressive_banner_icon_html',
		);

		update_option( 'sgsb_progressive_discount_banner_settings', $bar_data );

		wp_send_json_success( maybe_unserialize( get_option( 'sgsb_progressive_discount_banner_settings' ) ) );
	}

	/**
	 * Ajax action for get settings.
	 */
	public function get_settings() {
		check_ajax_referer( 'sgsb_ajax_nonce' );

		wp_send_json_success( Helper::sgsb_pd_banner_get_settings() );
	}
}
