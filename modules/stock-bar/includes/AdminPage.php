<?php
/**
 * Stock Bar settings page assets.
 *
 * @package StorePulse\StoreGrowth\Modules\StockBar
 */

namespace StorePulse\StoreGrowth\Modules\StockBar;

use StorePulse\StoreGrowth\Admin\ModuleAdminPage;

defined( 'ABSPATH' ) || exit;

/**
 * Loads the Stock Bar settings page into the admin app, with the storefront
 * stylesheet its preview renders with (ADR-005 S10). Fonts load on demand
 * from the preview.
 *
 * @since 3.0.0
 */
class AdminPage extends ModuleAdminPage {

	/**
	 * Module id.
	 *
	 * @since 3.0.0
	 *
	 * @return string
	 */
	protected function module_id(): string {
		return StockBarModule::get_id();
	}

	/**
	 * The bar's stylesheets.
	 *
	 * @since 3.0.0
	 *
	 * @return array<string, string>
	 */
	protected function stylesheets(): array {
		return [
			'spsg-storefront-base'       => 'assets/css/storefront-base.css',
			'spsg-stock-cd-custom-style' => 'modules/stock-bar/assets/scripts/spsg-stockbar-style.css',
		];
	}
}
