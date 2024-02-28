<?php
/**
 * File for _Ajax class.
 *
 * @package SBFW
 */

namespace STOREGROWTH\SPSB;

use STOREGROWTH\SPSB\Traits\Singleton;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Load admin ajax functionality inside this class.
 */
class Ajax {

	use Singleton;

	/**
	 * Constructor of _Ajax class.
	 */
	private function __construct() {
		add_action( 'wp_ajax_sgsb_admin_ajax', array( $this, 'admin_ajax' ) );
		/**
		 * Register ajax callback
		*/
		add_action('wp_ajax_sgsb_get_user_concent_data',  array( $this,'sgsb_get_user_concent_data'));
	}

	/**
	 * Callback for admin ajax.
	 *
	 * @uses get_all_modules
	 * @uses update_module_status
	 */
	public function admin_ajax() {
		check_ajax_referer( 'sgsb_ajax_nonce' );

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
	 * Get all Modules.
	 */
	private function get_all_modules() {
		$modules = Modules::instance();

		wp_send_json( $modules->list_all_modules() );
	}

	/**
	 * Make a module active/disable.
	 */
	private function update_module_status() {

		// phpcs:disable WordPress.Security.NonceVerification.Missing
		if ( ! isset( $_POST['data'] ) ) {
			wp_die();
		}

		$modules        = Modules::instance();
		$active_modules = $modules->get_active_module_ids();

		$module_id = isset( $_POST['data']['module_id'] ) ? sanitize_text_field( wp_unslash( $_POST['data']['module_id'] ) ) : null;
		$status    = isset( $_POST['data']['status'] ) ? sanitize_text_field( wp_unslash( $_POST['data']['status'] ) ) : null;

		// phpcs:enable

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
	/**
	 * Get User Concent Data
	 */
	public function sgsb_get_user_concent_data() {
		error_log('called');
		check_ajax_referer('sgsb_ajax_nonce', '_ajax_nonce');
		error_log('true');
		print_r($_POST);
		wp_send_json_success(array('message' => 'Success message'));
	}
}
