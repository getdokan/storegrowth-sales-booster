<?php
/**
 * Quick View settings page assets.
 *
 * @package StorePulse\StoreGrowth\Modules\QuickView
 */

namespace StorePulse\StoreGrowth\Modules\QuickView;

use StorePulse\StoreGrowth\Admin\ModuleAdminPage;

defined( 'ABSPATH' ) || exit;

/**
 * Loads the Quick View settings page into the admin app. The preview is a
 * mock of the modal (spec §9), so it needs no storefront stylesheet.
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
		return QuickViewModule::get_id();
	}
}
