<?php
/**
 * Free Shipping Rules settings page assets.
 *
 * @package StorePulse\StoreGrowth\Modules\ProgressiveDiscountBanner
 */

namespace StorePulse\StoreGrowth\Modules\ProgressiveDiscountBanner;

use StorePulse\StoreGrowth\Admin\ModuleAdminPage;
use StorePulse\StoreGrowth\Modules\ProgressiveDiscountBanner\Settings\ProgressiveDiscountBannerSettings;

defined( 'ABSPATH' ) || exit;

/**
 * Loads the Free Shipping Rules page into the admin app, with the bar's
 * storefront stylesheets for its preview.
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
		return ProgressiveDiscountBannerModule::get_id();
	}

	/**
	 * The bar's stylesheets.
	 *
	 * @since 3.0.0
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
	 * @since 3.0.0
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
	 * @since 3.0.0
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
				'shipping_zones'    => Milestones::shipping_zones(),
				'shipping_url'      => admin_url( 'admin.php?page=wc-settings&tab=shipping' ),
				'migrated'          => $this->is_migrated(),
			],
		];
	}

	/**
	 * Whether a store from before 3.1 had a rule that became milestone 1.
	 *
	 * @since 3.1.0
	 *
	 * @return bool
	 */
	private function is_migrated(): bool {
		$stored = (array) get_option( 'spsg_progressive_discount_banner_settings', [] );

		return false !== get_option( ProgressiveDiscountBannerSettings::BACKUP_OPTION, false )
			|| ( empty( $stored['milestones'] ) && storegrowth_get_container()->get( ProgressiveDiscountBannerSettings::class )->is_saved( $stored ) );
	}
}
