<?php
/**
 * File for _Ajax class.
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth;

use StorePulse\StoreGrowth\Traits\Singleton;

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
	public function __construct() {
		add_action( 'wp_ajax_spsg_admin_ajax', array( $this, 'admin_ajax' ) );
		/**
		 * Register ajax callback
		*/
		add_action( 'wp_ajax_spsg_inisetup_flag_update', array( $this, 'spsg_inisetup_flag_update' ) );
	}

	/**
	 * Callback for admin ajax.
	 *
	 * @uses get_all_modules
	 * @uses update_module_status
	 */
	public function admin_ajax() {
		check_ajax_referer( 'spsg_ajax_nonce' );

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( __( 'You are not allowed to perform this action.', 'storegrowth-sales-booster' ), 403 );
		}

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
		$modules = new ModuleManager();

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

		$modules        = storegrowth_get_container()->get( \StorePulse\StoreGrowth\ModuleManager::class );
		$active_modules = $modules->get_active_modules();

		$module_id = isset( $_POST['data']['module_id'] ) ? sanitize_text_field( wp_unslash( $_POST['data']['module_id'] ) ) : null;
		$status    = isset( $_POST['data']['status'] ) ? sanitize_text_field( wp_unslash( $_POST['data']['status'] ) ) : null;

		// phpcs:enable

		$selected_module = $modules->get( $module_id );

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
//		$modules->update_active_module_ids( $active_modules );

		wp_send_json_success();
	}
	/**
	 * Flag the initial setup wizard as completed.
	 */
	public function spsg_inisetup_flag_update() {
		check_ajax_referer( 'spsg_ajax_nonce', '_ajax_nonce' );

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( __( 'You are not allowed to perform this action.', 'storegrowth-sales-booster' ), 403 );
		}

		$flag_data = isset( $_POST['spsg_ini_completion'] );
		update_option( 'spsg_ini_completion', $flag_data );
		wp_send_json_success( array( 'message' => 'Success message' ) );
		wp_die();
	}
}
