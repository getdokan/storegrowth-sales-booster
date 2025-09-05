<?php
/**
 * Ajax class for Fly cart.
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Modules\FlyCart;

use StorePulse\StoreGrowth\Interfaces\HookRegistry;
use StorePulse\StoreGrowth\Helper;

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
		add_action( 'wp_ajax_spsg_fly_cart_save_settings', array( $this, 'save_settings' ) );
		add_action( 'wp_ajax_spsg_fly_cart_get_settings', array( $this, 'get_settings' ) );

		add_action( 'wp_ajax_nopriv_spsg_fly_cart_frontend', array( $this, 'fly_cart_frontend' ) );
		add_action( 'wp_ajax_spsg_fly_cart_frontend', array( $this, 'fly_cart_frontend' ) );
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

		$get_form_data = Helper::get_settings( 'spsg_fly_cart_settings', array() );
		$merged_data   = array_merge( $get_form_data, $form_data );

		update_option( 'spsg_fly_cart_settings', $merged_data );

		wp_send_json_success();
	}

	/**
	 * Ajax action for get settings.
	 */
	public function get_settings() {
		check_ajax_referer( 'spsg_ajax_nonce' );

		$form_data = Helper::get_settings( 'spsg_fly_cart_settings', array() );

		wp_send_json_success( $form_data );
	}

	/**
	 * Frontend ajax.
	 *
	 * @uses get_cart_contents
	 */
	public function fly_cart_frontend() {
		check_ajax_referer( 'spsg_frontend_ajax' );
		if ( ! isset( $_REQUEST['method'] ) ) {
			wp_send_json_error( array( 'message' => __( 'Method Not Found', 'storegrowth-sales-booster' ) ) );
		}
		$method = isset( $_REQUEST['method'] ) ? sanitize_key( $_REQUEST['method'] ) : '';
		if ( method_exists( $this, $method ) ) {
			$data = isset( $_REQUEST['data'] ) ? wp_unslash( $_REQUEST['data'] ) : array(); //phpcs:ignore
			$data = wp_unslash( $data );
			$data = array_map( 'sanitize_text_field', $data );
			wp_send_json_success(
				array(
					'cartCountLocation' => esc_html( wc()->cart->get_cart_contents_count() ),
					'htmlResponse'      => call_user_func( array( $this, $method ), $data ),
				)
			);
		}
		wp_die();
	}

	/**
	 * Get cart contents
	 */
	private function get_cart_contents() {
		ob_start();
		include __DIR__ . '/../templates/cart-contents.php';

		return ob_get_clean();
	}
}
