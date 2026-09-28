<?php
/**
 * BOGO admin page assets.
 *
 * @package StorePulse\StoreGrowth\Modules\BoGo
 */

namespace StorePulse\StoreGrowth\Modules\BoGo;

use StorePulse\StoreGrowth\Admin\ModuleAdminPage;

defined( 'ABSPATH' ) || exit;

/**
 * Loads the BOGO admin bundle into the admin app, with the media library for
 * the custom badge upload.
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
		return BoGoModule::get_id();
	}

	/**
	 * The badge upload opens the media library.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return bool
	 */
	protected function uses_media(): bool {
		return true;
	}
}
