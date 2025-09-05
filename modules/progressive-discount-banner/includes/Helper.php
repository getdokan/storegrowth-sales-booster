<?php
/**
 * Helper functions for fly cart module.
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Modules\ProgressiveDiscountBanner;

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
		return \StorePulse\StoreGrowth\Helper::get_settings( 'spsg_progressive_discount_banner_settings', array() );
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
		$minimum_amount = \StorePulse\StoreGrowth\Helper::find_option_settings( $settings, 'cart_minimum_amount', 0 );
		$cart_amount    = wc()->cart->get_subtotal();

		// If customer already added enough to cart.
		if ( $cart_amount >= $minimum_amount ) {
			return \StorePulse\StoreGrowth\Helper::find_option_settings( $settings, 'goal_completion_text' );
		}

		$pbanner_text = \StorePulse\StoreGrowth\Helper::find_option_settings( $settings, 'progressive_banner_text' );

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
		return \StorePulse\StoreGrowth\Helper::find_option_settings( $settings, 'progressive_banner_icon_name' );
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
		return \StorePulse\StoreGrowth\Helper::find_option_settings( $settings, 'progressive_banner_custom_icon' );
	}
}
