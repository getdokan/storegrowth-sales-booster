<?php
/**
 * Ajax class for `Stock Countdown` module.
 *
 * @package SBFW
 */

namespace STOREGROWTH\SPSB\Modules\Stock_Countdown;

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
		add_action( 'wp_ajax_storepulse_sales_booster_stock_countdown_save_settings', array( $this, 'save_settings' ) );
		add_action( 'wp_ajax_storepulse_sales_booster_stock_countdown_get_settings', array( $this, 'get_settings' ) );
	}

	/**
	 * Ajax action for save settings
	 */
	public function save_settings() {
		check_ajax_referer( 'storepulse_sales_booster_ajax_nonce' );

		if ( ! isset( $_POST['form_data'] ) ) {
			wp_send_json_error();
		}

		// phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- Sanitizing via `storepulse_sales_booster_sanitize_form_fields`.
		$form_data = array_map( 'storepulse_sales_booster_sanitize_form_fields', wp_unslash( $_POST['form_data'] ) );

		update_option( 'storepulse_sales_booster_stock_countdown_settings', $form_data );

		wp_send_json_success();
	}

	/**
	 * Ajax action for get settings.
	 */
	public function get_settings() {
		check_ajax_referer( 'storepulse_sales_booster_ajax_nonce' );

		$form_data = get_option( 'storepulse_sales_booster_stock_countdown_settings', array() );

		wp_send_json_success( $form_data );
	}

}
