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
		return BoGoModule::get_id();
	}

	/**
	 * The badge upload opens the media library.
	 *
	 * @since 3.0.0
	 *
	 * @return bool
	 */
	protected function uses_media(): bool {
		return true;
	}
}
