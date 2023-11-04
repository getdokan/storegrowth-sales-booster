<?php
/**
 * Create admin setting menu for sales boster for woocommerce.
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
 * Add admin menus inside this class.
 */
class Admin_Menu {

	use Singleton;

	/**
	 * Constructor of Admin_Menu class.
	 */
	private function __construct() {
		add_action( 'admin_menu', array( $this, 'register_admin_menu' ) );
		add_filter( 'submenu_file', array( $this, 'highlight_admin_submenu' ) );
	}

	/**
	 * Highlight the proper top level submenu.
	 *
	 * @global obj $current_screen
	 *
	 * @param string $submenu_file Specify sub menu uri.
	 *
	 * @return string
	 */
	public function highlight_admin_submenu( $submenu_file ) {
		global $current_screen;

		if ( 'storegrowth_page_sgsb-dashboard' === $current_screen->id ) {
			$submenu_file = 'admin.php?page=sgsb-settings#/dashboard/overview';
		}

		return $submenu_file;
	}


	/**
	 * Register a custom menu page.
	 */
	public function register_admin_menu() {
		add_menu_page(
			__( 'StoreGrowth', 'storegrowth-sales-booster' ),
			__( 'StoreGrowth', 'storegrowth-sales-booster' ),
			'manage_options',
			'sales-booster-for-woocommerce',
			array( $this, 'modules_callback' ),
			STOREGROWTH_PLUGIN_DIR_URL . 'assets/images/storegrowth.svg',
			58
		);

		add_submenu_page(
			'sales-booster-for-woocommerce',
			__( 'Dashboard - StoreGrowth', 'storegrowth-sales-booster' ),
			__( 'Dashboard', 'storegrowth-sales-booster' ),
			'manage_options',
			'sgsb-settings#/dashboard/overview',
			array( $this, 'dashboard_callback' )
		);

		add_submenu_page(
			'sales-booster-for-woocommerce',
			__( 'Modules - StoreGrowth', 'storegrowth-sales-booster' ),
			__( 'Modules', 'storegrowth-sales-booster' ),
			'manage_options',
			'sgsb-modules',
			array( $this, 'modules_callback' )
		);

		add_submenu_page(
			'sales-booster-for-woocommerce',
			__( 'Settings - StoreGrowth', 'storegrowth-sales-booster' ),
			__( 'Settings', 'storegrowth-sales-booster' ),
			'manage_options',
			'sgsb-settings',
			array( $this, 'settings_callback' )
		);

		// Remove own submenu of `StoreGrowth`.
		remove_submenu_page( 'sales-booster-for-woocommerce', 'sales-booster-for-woocommerce' );
	}

	/**
	 * Display module page content.
	 */
	public function modules_callback() {
		echo '<div class="wrap"><div id="sbooster-modules-page"></div></div>';
	}

	/**
	 * Display settings page content.
	 */
	public function settings_callback() {
		echo '<div class="wrap"><div id="sbooster-settings-page"></div></div>';
	}

	/**
	 * Display Dashboard page content.
	 */
	public function dashboard_callback() {
		$redirect_url = admin_url( 'admin.php?page=sgsb-settings#/dashboard/overview' );
		wp_safe_redirect( $redirect_url );
		exit;
	}
}
