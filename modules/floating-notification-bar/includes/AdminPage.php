<?php
/**
 * Floating Bar settings page assets.
 *
 * @package StorePulse\StoreGrowth\Modules\FloatingNotificationBar
 */

namespace StorePulse\StoreGrowth\Modules\FloatingNotificationBar;

use StorePulse\StoreGrowth\Admin\ModuleAdminPage;

defined( 'ABSPATH' ) || exit;

/**
 * Loads the Floating Bar page into the admin app, with the bar's storefront
 * stylesheets for its preview and the store's coupons for the coupon field.
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
		return FloatingNotificationBarModule::get_id();
	}

	/**
	 * The bar's stylesheets.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return array<string, string>
	 */
	protected function stylesheets(): array {
		return [
			'spsg-storefront-bar'                  => 'assets/css/storefront-bar.css',
			'spsg-floating-notification-bar-style' => 'modules/floating-notification-bar/assets/css/floating-notification-bar.css',
		];
	}

	/**
	 * The custom icon upload (pro).
	 *
	 * @since SPSG_VERSION
	 *
	 * @return bool
	 */
	protected function uses_media(): bool {
		return sp_store_growth()->has_pro();
	}

	/**
	 * The store's coupons (`spsg_fnb_coupon_data`, as the old admin had it).
	 *
	 * @since SPSG_VERSION
	 *
	 * @return array<string, array>
	 */
	protected function data(): array {
		return [ 'spsg_fnb_coupon_data' => Helper::available_coupon_codes() ];
	}
}
