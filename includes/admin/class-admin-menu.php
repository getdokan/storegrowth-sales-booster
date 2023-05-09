<?php
/**
 * Create admin setting menu for sales boster for woocommerce.
 *
 * @package SBFW
 */

namespace WPCodal\SBFW\Admin;

use WPCodal\SBFW\Traits\Singleton;

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
	}

	/**
	 * Register a custom menu page.
	 */
	public function register_admin_menu() {
		// $icon = sbfw_get_file_content( 'assets/images/rocket-icon.svg' );

		add_menu_page(
			__( 'Sales Booster', 'sbfw' ),
			__( 'Sales Booster', 'sbfw' ),
			'manage_options',
			'sales-booster-for-woocommerce',
			array( $this, 'modules_callback' ),
			// 'data:image/svg+xml;base64,' . base64_encode( $icon ), // phpcs:ignore
			'dashicons-admin-customizer',
			58
		);

		add_submenu_page(
			'sales-booster-for-woocommerce',
			__( 'Modules - Sales Booster', 'sbfw' ),
			__( 'Modules', 'sbfw' ),
			'manage_options',
			'sbfw-modules',
			array( $this, 'modules_callback' )
		);

		add_submenu_page(
			'sales-booster-for-woocommerce',
			__( 'Settings - Sales Booster', 'sbfw' ),
			__( 'Settings', 'sbfw' ),
			'manage_options',
			'sbfw-settings',
			array( $this, 'settings_callback' )
		);

		// Remove own submenu of `Sales Booster`.
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
}
