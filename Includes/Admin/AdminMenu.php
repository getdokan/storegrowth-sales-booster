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
class AdminMenu {

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

		add_submenu_page(
			'sales-booster-for-woocommerce',
			__( 'Documentation', 'storegrowth-sales-booster' ),
			__( 'Documentation', 'storegrowth-sales-booster' ),
			'manage_options',
			'go-sgsb-docs',
			array( $this, 'handle_external_redirects' )
		);

		add_submenu_page(
			'sales-booster-for-woocommerce',
			__( 'Initial Setup - StoreGrowth', 'storegrowth-sales-booster' ),
			__( 'Initial Setup', 'storegrowth-sales-booster' ),
			'manage_options',
			'sgsb-modules#/ini-setup',
			array( $this, 'initial_setup_page_callback' )
		);

		if ( ! SGSB_PRO_ACTIVE ) {
			add_submenu_page(
				'sales-booster-for-woocommerce',
				__( 'Upgrade to Pro', 'storegrowth-sales-booster' ),
				'<span class="dashicons dashicons-star-filled" style="font-size: 17px"></span> ' . esc_html__( 'Upgrade to Pro', 'storegrowth-sales-booster' ),
				'manage_options',
				'go-sgsb-pro',
				array( $this, 'handle_external_redirects' )
			);
		}

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

	/**
	 * Display Initail Setup page content.
	 */
	public function initial_setup_page_callback() {
		$redirect_url = admin_url( 'admin.php?page=sgsb-modules#/ini-setup' );
		wp_safe_redirect( $redirect_url );
		exit;
	}

	/**
	 * Redirect to a specific URL.
	 *
	 * @param string $url The URL to redirect to.
	 */
	private function redirect_to_url( $url ) {
		if ( ! empty( $url ) ) {
			wp_redirect( $url );
			exit;
		}
	}

	/**
	 * Handle external redirects based on the requested page.
	 */
	public function handle_external_redirects() {
		$redirect_pages = array(
			'go-sgsb-pro'  => 'https://www.storegrowth.io/pricing',
			'go-sgsb-docs' => 'https://storegrowth.io/docs/',
		);

		if ( ! empty( $_GET['page'] ) && isset( $redirect_pages[ $_GET['page'] ] ) ) {
			$redirect_url = $redirect_pages[ $_GET['page'] ];
			$this->redirect_to_url( $redirect_url );
		}
	}
}
