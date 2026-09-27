<?php
/**
 * Sales Notification settings page assets.
 *
 * @package StorePulse\StoreGrowth\Modules\SalesPop
 */

namespace StorePulse\StoreGrowth\Modules\SalesPop;

use StorePulse\StoreGrowth\Admin\ModuleAdminPage;
use StorePulse\StoreGrowth\Helper as PluginHelper;
use StorePulse\StoreGrowth\Modules\SalesPop\Settings\SalesPopSettings;

defined( 'ABSPATH' ) || exit;

/**
 * Loads the Sales Notification settings page into the admin app, with the
 * storefront stylesheet its preview renders with (ADR-005 S10), and keeps
 * the storefront cache fresh when the settings change.
 *
 * @since SPSG_VERSION
 */
class AdminPage extends ModuleAdminPage {

	/**
	 * Register the hooks.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return void
	 */
	public function register_hooks(): void {
		parent::register_hooks();

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
	 * Module id.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return string
	 */
	protected function module_id(): string {
		return SalesPopModule::get_id();
	}

	/**
	 * The popup's stylesheet.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return array<string, string>
	 */
	protected function stylesheets(): array {
		return [
			'popup-custom-css' => 'modules/sales-pop/assets/css/popup-custom.css',
		];
	}

	/**
	 * The old admin's `ajax_url` / `ajd_nonce` (callers of the `create_popup`
	 * adapter use them), plus what the preview draws with.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return array<string, array>
	 */
	protected function data(): array {
		return [
			'sales_pop_data' => [
				'ajax_url'       => admin_url( 'admin-ajax.php' ),
				'ajd_nonce'      => wp_create_nonce( 'spsg_admin_ajax_nonce' ),
				'fallback_image' => PluginHelper::get_modules_url( SalesPopModule::get_id() . '/assets/images/sale_product.png' ),
				'template_radii' => SalesPopSettings::TEMPLATE_RADII,
			],
		];
	}
}
