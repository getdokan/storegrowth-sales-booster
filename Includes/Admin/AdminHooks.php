<?php
/**
 * Implement admin related common hooks.
 *
 * @package SBFW
 */

namespace STOREGROWTH\SPSB\Admin;

use STOREGROWTH\SPSB\Traits\Singleton;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Add misc dashbaord end hooks inside this class.
 */
class AdminHooks {


	use Singleton;

	/**
	 * Constructor of Admin_Hooks class.
	 */
	private function __construct() {
		add_filter( 'plugin_action_links_' . STOREGROWTH_PLUGIN_BASENAME, array( $this, 'plugin_action_links' ) );
		add_action( 'admin_init', array( $this, 'sgsb_redirect_initial_setup' ) );
	}

	/**
	 * Show action links on the plugin screen.
	 *
	 * @param mixed $links Plugin Action links.
	 *
	 * @return array
	 */
	public function plugin_action_links( $links ) {
		$action_links = array(
			'dashboard' => '<a href="' . admin_url( 'admin.php?page=sgsb-settings#/dashboard/overview' ) . '">' . esc_html__( 'Dashboard', 'storegrowth-sales-booster' ) . '</a>',
			'modules'   => '<a href="' . admin_url( 'admin.php?page=sgsb-modules' ) . '">' . esc_html__( 'Modules', 'storegrowth-sales-booster' ) . '</a>',
			'settings'  => '<a href="' . admin_url( 'admin.php?page=sgsb-settings' ) . '">' . esc_html__( 'Settings', 'storegrowth-sales-booster' ) . '</a>',
		);

		return array_merge( $action_links, $links );
	}

	/**
	 * Redirect to Welcome Page when plugin is activated.
	 */

	public function sgsb_redirect_initial_setup() {
		$ini_setup_completion = get_option( 'sgsb_ini_completion' );
		if ( $ini_setup_completion ) {
			return;}

		if ( get_option( 'storegrowth_activation_redirect', false ) ) {
			delete_option( 'storegrowth_activation_redirect' );
			if ( wp_safe_redirect( admin_url( 'admin.php?page=sgsb-modules#/ini-setup' ) ) ) {
				exit();
			}
		}
	}
}
