<?php
/**
 * Fly Cart settings page assets.
 *
 * @package StorePulse\StoreGrowth\Modules\FlyCart
 */

namespace StorePulse\StoreGrowth\Modules\FlyCart;

use StorePulse\StoreGrowth\Admin\ModuleAdminPage;

defined( 'ABSPATH' ) || exit;

/**
 * Loads the Fly Cart settings page into the admin app. The preview is a mock
 * of the cart panel (spec §9), so it needs no storefront stylesheet.
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
		return FlyCartModule::get_id();
	}
}
