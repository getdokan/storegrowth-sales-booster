<?php
/**
 * File for _Ajax class.
 *
 * @package SBFW
 */

namespace STOREGROWTH\SPSB;

use WP_Error;

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
	 * Invizo Insights Version
	 */
	const INVZ_VERSION = '1.0.0';

	/**
	 * API URL
	 */
	const API_URL = 'https://invizo.io/wp-json/invizo-insights/v1/save-data';

	/**
	 * Installed Plugin File
	 *
	 * @var string
	 */
	private $plugin_file = null;

	/**
	 * Installed Plugin Name
	 *
	 * @var string
	 */
	private $plugin_name = null;
	/**
	 * Constructor of _Ajax class.
	 */
	private function __construct() {
		$this->plugin_file = plugin_dir_path( __FILE__ ) . '../storegrowth-sales-booster.php';
		$this->plugin_name = basename( $this->plugin_file, '.php' );
		add_action( 'wp_ajax_sgsb_admin_ajax', array( $this, 'admin_ajax' ) );
		/**
		 * Register ajax callback
		*/
		add_action( 'wp_ajax_sgsb_process_user_concent_data', array( $this, 'sgsb_process_user_concent_data' ) );
		add_action( 'wp_ajax_sgsb_inisetup_flag_update', array( $this, 'sgsb_inisetup_flag_update' ) );
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
	 * Collect plugin data,
	 * Retrieve current plugin information
	 *
	 * @since 3.0.0
	 */
	public function plugin_data() {
		if ( ! function_exists( 'get_plugin_data' ) ) {
			include ABSPATH . '/wp-admin/includes/plugin.php';
		}
		$plugin = get_plugin_data( $this->plugin_file );
		return $plugin;
	}
	public function sgsb_collect_non_sensitive_data() {
		$body = array(
			'plugin_slug'   => sanitize_text_field( $this->plugin_name ),
			'url'           => get_bloginfo( 'url' ),
			'site_name'     => get_bloginfo( 'name' ),
			'site_version'  => get_bloginfo( 'version' ),
			'site_language' => get_bloginfo( 'language' ),
			'charset'       => get_bloginfo( 'charset' ),
			'wpins_version' => self::INVZ_VERSION,
			'php_version'   => phpversion(),
			'multisite'     => is_multisite(),
			'file_location' => __FILE__,
		);

			// Collect the email if the correct option has been set

		if ( ! function_exists( 'wp_get_current_user' ) ) {
			include ABSPATH . 'wp-includes/pluggable.php';
		}
			$current_user = wp_get_current_user();
			$email        = $current_user->user_email;
		if ( is_email( $email ) ) {
			$body['email'] = $email;
		}
			$body['server'] = isset( $_SERVER['SERVER_SOFTWARE'] ) ? $_SERVER['SERVER_SOFTWARE'] : '';

			/**
			 * Collect all active and inactive plugins
			 */
		if ( ! function_exists( 'get_plugins' ) ) {
			include ABSPATH . '/wp-admin/includes/plugin.php';
		}
			$plugins        = array_keys( get_plugins() );
			$active_plugins = is_network_admin() ? array_keys( get_site_option( 'active_sitewide_plugins', array() ) ) : get_option( 'active_plugins', array() );
		foreach ( $plugins as $key => $plugin ) {
			if ( in_array( $plugin, $active_plugins ) ) {
				unset( $plugins[ $key ] );
			}
		}
			$body['active_plugins']   = $active_plugins;
			$body['inactive_plugins'] = $plugins;

			/**
			 * Text Direction.
			 */
			$body['text_direction'] = ( function_exists( 'is_rtl' ) ? ( is_rtl() ? 'RTL' : 'LTR' ) : 'NOT SET' );
			/**
			 * Get Our Plugin Data.
			 *
			 * @since 3.0.0
			 */
			$plugin = $this->plugin_data();
		if ( empty( $plugin ) ) {
			$body['message'] .= __( 'We can\'t detect any plugin information. This is most probably because you have not included the code in the plugin main file.', 'plugin-usage-tracker' );
			$body['status']   = 'NOT FOUND';
		} else {
			if ( isset( $plugin['Name'] ) ) {
				$body['plugin'] = sanitize_text_field( $plugin['Name'] );
			}
			if ( isset( $plugin['Version'] ) ) {
				$body['version'] = sanitize_text_field( $plugin['Version'] );
			}
			$body['status'] = 'Active';
		}

			/**
			 * Get active theme name and version
			 *
			 * @since 3.0.0
			 */
			$theme = wp_get_theme();
		if ( $theme->Name ) {
			$body['theme'] = sanitize_text_field( $theme->Name );
		}
		if ( $theme->Version ) {
			$body['theme_version'] = sanitize_text_field( $theme->Version );
		}
			return $body;
	}
	/**
	 * Process Consent Data
	 */
	public function sgsb_process_user_concent_data() {
		check_ajax_referer( 'sgsb_ajax_nonce', '_ajax_nonce' );
		$post_data = json_decode( wp_unslash( stripslashes( $_POST['data'] ) ) );

		$update_news  = $post_data->update_news;
		$user_details = $post_data->user_details;

		if ( ! $update_news && ! $user_details ) {
					return;
		}

		$data_to_send = $this->sgsb_collect_non_sensitive_data();

		$request_args = array(
			'body'        => wp_json_encode( $data_to_send ),
			'headers'     => array(
				'Content-Type' => 'application/json',
			),
			'timeout'     => 30,
			'redirection' => 5,
			'blocking'    => true,
			'httpversion' => '1.0',
			'sslverify'   => true,
			'data_format' => 'body',
		);

		$response = wp_remote_post( self::API_URL, $request_args );

		if ( is_wp_error( $response ) ) {
			$error_message = $response->get_error_message();
			return new WP_Error( 'api_error', $error_message );
		} else {
			$response_code = wp_remote_retrieve_response_code( $response );
			if ( $response_code === 200 ) {
				$response_body = wp_remote_retrieve_body( $response );
				return $response_body;
			} else {
				return new WP_Error( 'api_error', 'API returned unexpected response code: ' . $response_code );
			}
		}

		wp_send_json_success( array( 'message' => 'Success message' ) );
		wp_die();
	}
	/**
	 * Process Consent Data
	 */
	public function sgsb_inisetup_flag_update() {
		check_ajax_referer( 'sgsb_ajax_nonce', '_ajax_nonce' );
		$flag_data = isset( $_POST['sgsb_ini_completion'] );
		update_option( 'sgsb_ini_completion', $flag_data );
		wp_send_json_success( array( 'message' => 'Success message' ) );
		wp_die();
	}
}
