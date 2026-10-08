<?php
/**
 * Helper functions for fly cart module.
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Modules\ProgressiveDiscountBanner;

use StorePulse\StoreGrowth\Helper as PluginHelper;
use StorePulse\StoreGrowth\Modules\ProgressiveDiscountBanner\Settings\ProgressiveDiscountBannerSettings;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class Helper.
 */
class Helper {

	/**
	 * Get settings for this module.
	 *
	 * @since 1.0.2
	 *
	 * @return array
	 */
	public static function get_settings() {
		// Saves write only changed keys: the rest come from the defaults (not
		// for a store that never saved, so its bar stays off as before).
		return storegrowth_get_container()->get( ProgressiveDiscountBannerSettings::class )->storefront_settings(
			PluginHelper::get_settings( 'spsg_progressive_discount_banner_settings', array() )
		);
	}

	/**
	 * Get banner text.
	 *
	 * @since 1.0.2
	 *
	 * @param array $settings Admin settings.
	 *
	 * @return string
	 */
	public static function get_banner_text( $settings ) {
		$settings       = self::with_defaults( $settings );
		$minimum_amount = PluginHelper::find_option_settings( $settings, 'cart_minimum_amount', 0 );
		$cart_amount    = wc()->cart->get_subtotal();

		// If customer already added enough to cart.
		if ( $cart_amount >= $minimum_amount ) {
			return PluginHelper::find_option_settings( $settings, 'goal_completion_text' );
		}

		$pbanner_text = PluginHelper::find_option_settings( $settings, 'progressive_banner_text' );

		return str_replace( '[amount]', wc_price( $minimum_amount - $cart_amount ), $pbanner_text );
	}

	/**
	 * Get bar template content.
	 *
	 * @since 1.0.2
	 *
	 * @param bool $is_echo Set print or return.
	 *
	 * @return false|string|void
	 */
	public static function get_bar_content( $is_echo = true ) {
		$path = apply_filters( 'free_shipping_bar_content_pro', __DIR__ . '/../templates/bar.php' );

		if ( ! $path ) {
			return;
		}

		if ( ! $is_echo ) {
			ob_start();
		}

		include $path;

		if ( ! $is_echo ) {
			return ob_get_clean();
		}
	}


	/**
	 * Get banner icon.
	 *
	 * @since 1.0.2
	 *
	 * @param array $settings Admin settings.
	 *
	 * @return string
	 */
	public static function get_banner_icon( $settings ) {
		return PluginHelper::find_option_settings( self::with_defaults( $settings ), 'progressive_banner_icon_name' );
	}

	/**
	 * Settings with the defaults of the keys never saved (and of numbers
	 * that aren't one). Pro 2.2.0's template passes the raw option to the
	 * getters above; a missing minimum would read as 0 (goal reached) and a
	 * missing icon as none.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param mixed $settings Settings, raw or already filled.
	 *
	 * @return array
	 */
	private static function with_defaults( $settings ): array {
		return storegrowth_get_container()->get( ProgressiveDiscountBannerSettings::class )->storefront_settings( $settings );
	}

	/**
	 * Get banner custom icon source.
	 *
	 * @since 1.0.2
	 *
	 * @param array $settings Admin settings.
	 *
	 * @return string
	 */
	public static function get_banner_custom_icon( $settings ) {
		return PluginHelper::find_option_settings( $settings, 'progressive_banner_custom_icon' );
	}
}
