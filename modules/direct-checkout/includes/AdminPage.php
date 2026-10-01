<?php
/**
 * Direct Checkout settings page assets.
 *
 * @package StorePulse\StoreGrowth\Modules\DirectCheckout
 */

namespace StorePulse\StoreGrowth\Modules\DirectCheckout;

use StorePulse\StoreGrowth\Admin\ModuleAdminPage;

defined( 'ABSPATH' ) || exit;

/**
 * Loads the Direct Checkout admin bundle (the settings page's preview and
 * its multi-key controls) into the admin app.
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
		return DirectCheckoutModule::get_id();
	}
}
