<?php
/**
 * Stock Bar settings page assets.
 *
 * @package StorePulse\StoreGrowth\Modules\StockBar
 */

namespace StorePulse\StoreGrowth\Modules\StockBar;

use StorePulse\StoreGrowth\Helper;
use StorePulse\StoreGrowth\Interfaces\HookRegistry;

defined( 'ABSPATH' ) || exit;

/**
 * Loads the Stock Bar settings page into the admin app, with the storefront
 * stylesheet its preview renders with (ADR-005 S10). Fonts load on demand
 * from the preview.
 *
 * Registered from the always-loaded ServiceProvider, so the page is there
 * right after the module is switched on in the app, without a reload.
 *
 * @since SPSG_VERSION
 */
class AdminPage implements HookRegistry {

	/**
	 * Register the hooks.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return void
	 */
	public function register_hooks(): void {
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue' ) );
	}

	/**
	 * Enqueue on the two app pages (the route is reachable from either).
	 *
	 * @since SPSG_VERSION
	 *
	 * @param string $hook Admin page hook.
	 *
	 * @return void
	 */
	public function enqueue( $hook ): void {
		$asset_file = Helper::get_modules_path( 'stock-bar/assets/js/admin.asset.php' );

		if ( ! in_array( $hook, array( 'storegrowth_page_spsg-settings', 'storegrowth_page_spsg-modules' ), true ) || ! file_exists( $asset_file ) ) {
			return;
		}

		$asset = require $asset_file;

		wp_enqueue_script( 'spsg-stock-bar-admin', Helper::get_modules_url( 'stock-bar/assets/js/admin.js' ), $asset['dependencies'], $asset['version'], true );

		wp_enqueue_style(
			'spsg-stock-cd-custom-style',
			Helper::get_modules_url( 'stock-bar/assets/scripts/spsg-stockbar-style.css' ),
			array( 'spsg-storefront-base' ),
			filemtime( Helper::get_modules_path( 'stock-bar/assets/scripts/spsg-stockbar-style.css' ) )
		);
	}
}
