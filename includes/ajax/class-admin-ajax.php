<?php
/**
 * File for Admin_Ajax class.
 *
 * @package SBFW
 */

namespace WPCodal\SBFW\Ajax;

use WPCodal\SBFW\Modules;
use WPCodal\SBFW\Traits\Singleton;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Load admin ajax functionality inside this class.
 */
class Admin_Ajax {

	use Singleton;

	/**
	 * Constructor of Admin_Ajax class.
	 */
	private function __construct() {
		add_action( 'wp_ajax_sbfw_admin_ajax', array( $this, 'admin_ajax' ) );
	}

	/**
	 * Callback for admin ajax.
	 *
	 * @uses get_all_modules
	 * @uses update_module_status
	 */
	public function admin_ajax() {
		check_ajax_referer( 'sbfw_ajax_nonce' );

		if ( ! isset( $_POST['method'] ) ) {
			wp_die();
		}

		$method = sanitize_text_field( wp_unslash( $_POST['method'] ) );

		if ( method_exists( $this, $method ) ) {
			call_user_func( array( $this, $method ) );
		}

		wp_die();
	}

	/**
	 * Get all modules.
	 */
	private function get_all_modules() {
		$modules = Modules::instance();

		wp_send_json( $modules->list_all_modules() );
	}

	/**
	 * Make a module active/disable.
	 */
	private function update_module_status() {
		if ( ! isset( $_POST['data'] ) ) {
			wp_die();
		}

		$modules        = Modules::instance();
		$active_modules = $modules->get_active_module_ids();

		$module_id = sanitize_text_field( wp_unslash( $_POST['data']['module_id'] ) );
		$status    = sanitize_text_field( wp_unslash( $_POST['data']['status'] ) );

		$selected_module = $modules->get_module_by_id( $module_id );

		if ( 'true' === $status ) { // Activate.
			$active_modules[ $selected_module->get_id() ] = $selected_module->get_id();
			// Call module activate function.
			$selected_module->activate();
		} else { // Deactivate.
			unset( $active_modules[ $selected_module->get_id() ] );
			// Call module deactivate function.
			$selected_module->deactivate();
		}

		// Update to DB.
		$modules->update_active_module_ids( $active_modules );

		wp_send_json_success();
	}
}
