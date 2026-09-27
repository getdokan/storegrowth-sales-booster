<?php
/**
 * Free Shipping Rules settings page assets.
 *
 * @package StorePulse\StoreGrowth\Modules\ProgressiveDiscountBanner
 */

namespace StorePulse\StoreGrowth\Modules\ProgressiveDiscountBanner;

use StorePulse\StoreGrowth\Admin\ModuleAdminPage;

defined( 'ABSPATH' ) || exit;

/**
 * Loads the Free Shipping Rules page into the admin app, with the bar's
 * storefront stylesheets for its preview.
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
		return ProgressiveDiscountBannerModule::get_id();
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
			'spsg-storefront-bar'  => 'assets/css/storefront-bar.css',
			'spsg-pd-banner-style' => 'modules/progressive-discount-banner/assets/css/progressive-discount-banner.css',
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
	 * What the preview reads: the store's price format, to show `[amount]`
	 * as `wc_price()` does, and the cart address.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return array<string, array>
	 */
	protected function data(): array {
		return [
			'spsgFreeShippingData' => [
				'currency'          => html_entity_decode( get_woocommerce_currency_symbol(), ENT_QUOTES ),
				'currency_pos'      => get_option( 'woocommerce_currency_pos', 'left' ),
				'decimals'          => wc_get_price_decimals(),
				'decimal_separator' => wc_get_price_decimal_separator(),
				'cart_url'          => wc_get_cart_url(),
			],
		];
	}
}
