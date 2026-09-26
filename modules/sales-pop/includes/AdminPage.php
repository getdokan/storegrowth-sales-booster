<?php
/**
 * Sales Notification settings page assets.
 *
 * @package StorePulse\StoreGrowth\Modules\SalesPop
 */

namespace StorePulse\StoreGrowth\Modules\SalesPop;

use StorePulse\StoreGrowth\Helper as PluginHelper;
use StorePulse\StoreGrowth\Interfaces\HookRegistry;
use StorePulse\StoreGrowth\Modules\SalesPop\Settings\SalesPopSettings;

defined( 'ABSPATH' ) || exit;

/**
 * Loads the Sales Notification settings page into the admin app, with the
 * storefront stylesheet its preview renders with (ADR-005 S10), and keeps
 * the storefront cache fresh when the settings change.
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
		add_action( 'admin_enqueue_scripts', [ $this, 'enqueue' ] );

		// The settings save while the module is off too, and EnqueueScript (which
		// flushes the storefront cache on save) runs only while it's on.
		add_action( 'update_option_spsg_popup_products', [ $this, 'flush_storefront_cache' ] );
		add_action( 'spsg_module_activated', [ $this, 'flush_storefront_cache' ] );
	}

	/**
	 * Drop the cached storefront popup data.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return void
	 */
	public function flush_storefront_cache(): void {
		delete_transient( EnqueueScript::POPUP_CACHE_KEY );
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
		$id         = SalesPopModule::get_id();
		$asset_file = PluginHelper::get_modules_path( "{$id}/assets/js/admin.asset.php" );

		if ( ! in_array( $hook, [ 'storegrowth_page_spsg-settings', 'storegrowth_page_spsg-modules' ], true ) || ! file_exists( $asset_file ) ) {
			return;
		}

		$asset = require $asset_file;

		wp_enqueue_script( "spsg-{$id}-admin", PluginHelper::get_modules_url( "{$id}/assets/js/admin.js" ), $asset['dependencies'], $asset['version'], true );

		// The old admin's `ajax_url` / `ajd_nonce` (callers of the `create_popup`
		// adapter use them), plus what the preview draws with.
		wp_localize_script(
			"spsg-{$id}-admin",
			'sales_pop_data',
			[
				'ajax_url'       => admin_url( 'admin-ajax.php' ),
				'ajd_nonce'      => wp_create_nonce( 'spsg_admin_ajax_nonce' ),
				'fallback_image' => PluginHelper::get_modules_url( "{$id}/assets/images/sale_product.png" ),
				'template_radii' => SalesPopSettings::TEMPLATE_RADII,
			]
		);

		wp_enqueue_style(
			'popup-custom-css',
			PluginHelper::get_modules_url( "{$id}/assets/css/popup-custom.css" ),
			[],
			filemtime( PluginHelper::get_modules_path( "{$id}/assets/css/popup-custom.css" ) )
		);
	}
}
