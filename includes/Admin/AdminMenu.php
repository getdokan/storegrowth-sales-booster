<?php
/**
 * Create admin setting menu for sales boster for woocommerce.
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

		// Capture admin notices so the plugin header renders first on our pages.
		add_action( 'admin_notices', array( $this, 'inject_before_notices' ), -9999 );
		add_action( 'admin_notices', array( $this, 'inject_after_notices' ), PHP_INT_MAX );
	}

	/**
	 * Whether the current admin screen is a StoreGrowth app page.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return bool
	 */
	private function is_storegrowth_page(): bool {
		$screen = function_exists( 'get_current_screen' ) ? get_current_screen() : null;

		return $screen && in_array( $screen->id, array( 'storegrowth_page_spsg-settings', 'storegrowth_page_spsg-modules' ), true );
	}

	/**
	 * Open a hidden wrapper before admin notices render.
	 *
	 * WordPress core moves `.notice` elements to just after the first
	 * `.wp-header-end`. Opening the wrapper (with that catcher inside) before
	 * any notice prints collects them all in a hidden container, which the
	 * header script moves under the header.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return void
	 */
	public function inject_before_notices(): void {
		if ( ! $this->is_storegrowth_page() ) {
			return;
		}

		echo '<div class="spsg-notice-list-hide" id="spsg__notice-list">';
		echo '<div class="wp-header-end" id="spsg__notice-catcher"></div>';
	}

	/**
	 * Close the wrapper opened in inject_before_notices().
	 *
	 * @since SPSG_VERSION
	 *
	 * @return void
	 */
	public function inject_after_notices(): void {
		if ( ! $this->is_storegrowth_page() ) {
			return;
		}

		echo '</div>';
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

		if ( 'storegrowth_page_spsg-dashboard' === $current_screen->id ) {
			$submenu_file = 'admin.php?page=spsg-settings#/dashboard';
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
			STOREGROWTH_DIR_URL . 'assets/images/storegrowth.svg',
			58
		);

		add_submenu_page(
			'sales-booster-for-woocommerce',
			__( 'Dashboard - StoreGrowth', 'storegrowth-sales-booster' ),
			__( 'Dashboard', 'storegrowth-sales-booster' ),
			'manage_options',
			'spsg-settings#/dashboard',
			array( $this, 'dashboard_callback' )
		);

		add_submenu_page(
			'sales-booster-for-woocommerce',
			__( 'Features - StoreGrowth', 'storegrowth-sales-booster' ),
			__( 'Features', 'storegrowth-sales-booster' ),
			'manage_options',
			'spsg-settings#/features',
			array( $this, 'settings_callback' )
		);

		add_submenu_page(
			'sales-booster-for-woocommerce',
			__( 'Modules - StoreGrowth', 'storegrowth-sales-booster' ),
			__( 'Modules', 'storegrowth-sales-booster' ),
			'manage_options',
			'spsg-modules',
			array( $this, 'modules_callback' )
		);

		add_submenu_page(
			'sales-booster-for-woocommerce',
			__( 'Settings - StoreGrowth', 'storegrowth-sales-booster' ),
			__( 'Settings', 'storegrowth-sales-booster' ),
			'manage_options',
			'spsg-settings',
			array( $this, 'settings_callback' )
		);

		add_submenu_page(
			'sales-booster-for-woocommerce',
			__( 'Documentation', 'storegrowth-sales-booster' ),
			__( 'Documentation', 'storegrowth-sales-booster' ),
			'manage_options',
			'go-spsg-docs',
			array( $this, 'handle_external_redirects' )
		);

		add_submenu_page(
			'sales-booster-for-woocommerce',
			__( 'Initial Setup - StoreGrowth', 'storegrowth-sales-booster' ),
			__( 'Initial Setup', 'storegrowth-sales-booster' ),
			'manage_options',
			'spsg-modules#/ini-setup',
			array( $this, 'initial_setup_page_callback' )
		);

		if ( ! sp_store_growth()->has_pro() && ! defined( 'STOREGROWTH_PRO_FILE' ) ) {
			add_submenu_page(
				'sales-booster-for-woocommerce',
				__( 'Upgrade to Pro', 'storegrowth-sales-booster' ),
				'<span class="dashicons dashicons-star-filled" style="font-size: 17px"></span> ' . esc_html__( 'Upgrade to Pro', 'storegrowth-sales-booster' ),
				'manage_options',
				'go-spsg-pro',
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
		$this->render_app( '/modules' );
	}

	/**
	 * Display settings page content.
	 */
	public function settings_callback() {
		$this->render_app( '/dashboard' );
	}

	/**
	 * Mount points of a StoreGrowth page: header → notices → app.
	 *
	 * The header mounts in its own root so it paints without waiting for the
	 * app. The notice slot has no `.spsg-layout` class on purpose: that scope's
	 * Tailwind preflight would strip core notice styling. Captured notices are
	 * moved into it by the header script.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param string $default_route Route to open when the URL has no hash.
	 *
	 * @return void
	 */
	private function render_app( string $default_route ): void {
		echo '<div id="spsg-admin-header"></div>';
		echo '<div id="spsg-admin-notices"></div>';
		printf(
			'<div id="spsg-admin-app" data-default-route="%s"></div>',
			esc_attr( $default_route )
		);
	}

	/**
	 * Display Dashboard page content.
	 */
	public function dashboard_callback() {
		$redirect_url = admin_url( 'admin.php?page=spsg-settings#/dashboard' );
		wp_safe_redirect( $redirect_url );
		exit;
	}

	/**
	 * Display Initail Setup page content.
	 */
	public function initial_setup_page_callback() {
		$redirect_url = admin_url( 'admin.php?page=spsg-modules#/ini-setup' );
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
			// Deliberate off-site redirect to storegrowth.io; wp_safe_redirect() would
			// reject the external host and bounce back to wp-admin.
			wp_redirect( $url ); // phpcs:ignore WordPress.Security.SafeRedirect.wp_redirect_wp_redirect
			exit;
		}
	}

	/**
	 * Handle external redirects based on the requested page.
	 */
	public function handle_external_redirects() {
		$redirect_pages = array(
			'go-spsg-pro'  => 'https://storegrowth.io/pricing',
			'go-spsg-docs' => 'https://storegrowth.io/docs/',
		);

		// Reads the admin menu slug only; no form data is processed, so there is
		// no nonce to verify. The value is matched against a fixed whitelist below.
		$page = isset( $_GET['page'] ) ? sanitize_text_field( wp_unslash( $_GET['page'] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Recommended

		if ( isset( $redirect_pages[ $page ] ) ) {
			$this->redirect_to_url( $redirect_pages[ $page ] );
		}
	}
}
