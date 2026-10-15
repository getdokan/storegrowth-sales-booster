<?php
/**
 * Order Bump admin page assets.
 *
 * @package StorePulse\StoreGrowth\Modules\UpsellOrderBump
 */

namespace StorePulse\StoreGrowth\Modules\UpsellOrderBump;

use StorePulse\StoreGrowth\Admin\ModuleAdminPage;

defined( 'ABSPATH' ) || exit;

/**
 * Loads the Order Bump admin bundle (the bump list and editor) into the
 * admin app.
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
		return UpsellOrderBumpModule::get_id();
	}

	/**
	 * The checkout box's own stylesheet, for the editor's checkout preview
	 * (ADR-005 S10), under the storefront's handle.
	 *
	 * @since 3.0.0
	 *
	 * @return array<string, string>
	 */
	protected function stylesheets(): array {
		return [
			'spsg-order-bump-front-css' => 'modules/upsell-order-bump/assets/css/order-bump-front.css',
		];
	}
}
