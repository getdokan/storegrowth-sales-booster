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
 * @since SPSG_VERSION
 */
class AdminPage extends ModuleAdminPage {

	/**
	 * Module id.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return string
	 */
	protected function module_id(): string {
		return UpsellOrderBumpModule::get_id();
	}

	/**
	 * The checkout box's own stylesheet, for the editor's checkout preview
	 * (ADR-005 S10), under the storefront's handle. The block editor's
	 * `order-bump-template.css` stays out: it restyles the same classes.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return array<string, string>
	 */
	protected function stylesheets(): array {
		return [
			'spsg-order-bump-front-css' => 'modules/upsell-order-bump/assets/css/order-bump-front.css',
		];
	}
}
