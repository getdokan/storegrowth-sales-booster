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
		return QuickViewModule::get_id();
	}
}
