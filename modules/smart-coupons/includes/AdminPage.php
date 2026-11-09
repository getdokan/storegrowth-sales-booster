<?php
/**
 * Smart Coupons admin page assets.
 *
 * @package StorePulse\StoreGrowth\Modules\SmartCoupons
 */

namespace StorePulse\StoreGrowth\Modules\SmartCoupons;

use StorePulse\StoreGrowth\Admin\ModuleAdminPage;

defined( 'ABSPATH' ) || exit;

/**
 * Loads the Smart Coupons admin bundle (the coupon list and editor) into the
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
		return SmartCouponsModule::get_id();
	}

	/**
	 * What the pages read from PHP: whether WooCommerce's coupons are on,
	 * since automatic coupons need them.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return array<string, array>
	 */
	protected function data(): array {
		return [
			'spsgSmartCoupons' => [
				'couponsEnabled' => wc_coupons_enabled(),
			],
		];
	}
}
