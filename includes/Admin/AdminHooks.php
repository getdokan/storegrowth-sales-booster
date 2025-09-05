<?php
/**
 * Implement admin related common hooks.
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Admin;

use StorePulse\StoreGrowth\Traits\Singleton;

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
		add_filter( 'plugin_action_links_' . STOREGROWTH_BASENAME, array( $this, 'plugin_action_links' ) );
		add_action( 'admin_init', array( $this, 'spsg_redirect_initial_setup' ) );
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
			'dashboard' => '<a href="' . admin_url( 'admin.php?page=spsg-settings#/dashboard/overview' ) . '">' . esc_html__( 'Dashboard', 'storegrowth-sales-booster' ) . '</a>',
			'modules'   => '<a href="' . admin_url( 'admin.php?page=spsg-modules' ) . '">' . esc_html__( 'Modules', 'storegrowth-sales-booster' ) . '</a>',
			'settings'  => '<a href="' . admin_url( 'admin.php?page=spsg-settings' ) . '">' . esc_html__( 'Settings', 'storegrowth-sales-booster' ) . '</a>',
		);

		return array_merge( $action_links, $links );
	}

	/**
	 * Redirect to Welcome Page when plugin is activated.
	 */

	public function spsg_redirect_initial_setup() {
		$ini_setup_completion = \StorePulse\StoreGrowth\Helper::get_settings( 'spsg_ini_completion' );
		if ( $ini_setup_completion ) {
			return;}

		if ( get_option( 'storegrowth_activation_redirect', false ) ) {
			delete_option( 'storegrowth_activation_redirect' );
			if ( wp_safe_redirect( admin_url( 'admin.php?page=spsg-modules#/ini-setup' ) ) ) {
				exit();
			}
		}
	}
}
