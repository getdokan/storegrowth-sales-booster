<?php
/**
 * Ajax class for Fly cart.
 *
 * @package SBFW
 */

namespace STOREPULSE\SPSB\Modules\Fly_Cart;

use STOREPULSE\SPSB\Traits\Singleton;

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
		add_action( 'wp_ajax_storepulse_sales_booster_fly_cart_save_settings', array( $this, 'save_settings' ) );
		add_action( 'wp_ajax_storepulse_sales_booster_fly_cart_get_settings', array( $this, 'get_settings' ) );

		add_action( 'wp_ajax_nopriv_storepulse_sales_booster_fly_cart_frontend', array( $this, 'fly_cart_frontend' ) );
		add_action( 'wp_ajax_storepulse_sales_booster_fly_cart_frontend', array( $this, 'fly_cart_frontend' ) );
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

		$get_form_data = get_option( 'storepulse_sales_booster_fly_cart_settings', array() );
		$merged_data   = array_merge( $get_form_data, $form_data );

		update_option( 'storepulse_sales_booster_fly_cart_settings', $merged_data );

		wp_send_json_success();
	}

	/**
	 * Ajax action for get settings.
	 */
	public function get_settings() {
		check_ajax_referer( 'storepulse_sales_booster_ajax_nonce' );

		$form_data = get_option( 'storepulse_sales_booster_fly_cart_settings', array() );

		wp_send_json_success( $form_data );
	}

	/**
	 * Frontend ajax.
	 *
	 * @uses get_cart_contents
	 */
	public function fly_cart_frontend() {
		check_ajax_referer( 'storepulse_sales_booster_frontend_ajax' );

		if ( ! isset( $_REQUEST['method'] ) ) {
			wp_die();
		}

		$method = sanitize_text_field( wp_unslash( $_REQUEST['method'] ) );

		if ( method_exists( $this, $method ) ) {
			// Ignoring phpcs as we are sanitize data later.
			// phpcs:ignore
			$data = isset( $_REQUEST['data'] ) ? $_REQUEST['data'] : array();

			call_user_func( array( $this, $method ), $data );
		}

		wp_die();
	}

	/**
	 * Get cart contents
	 */
	private function get_cart_contents() {

		include __DIR__ . '/../templates/cart-contents.php';
	}
}
