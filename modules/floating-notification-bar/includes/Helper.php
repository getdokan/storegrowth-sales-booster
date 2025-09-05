<?php
/**
 * Helper functions for floating notification bar module.
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Modules\FloatingNotificationBar;

// If this file is called directly, abort.
use PHP_CodeSniffer\Generators\HTML;

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
		return \StorePulse\StoreGrowth\Helper::get_settings( 'spsg_floating_notification_bar_settings', array() );
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
		$banner_text = __( 'Shop More Than $100 to get Free Shipping', 'storegrowth-sales-booster' );
		return \StorePulse\StoreGrowth\Helper::find_option_settings( $settings, 'default_banner_text', $banner_text );
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
		$path = apply_filters( 'spsg_floating_bar_content_pro', __DIR__ . '/../templates/bar.php' );

		if ( ! $path ) {
			return;
		}

		if ( ! $is_echo ) {
			ob_start();

			include $path;

			return ob_get_clean();
		}

		include $path;
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
		return \StorePulse\StoreGrowth\Helper::find_option_settings( $settings, 'default_banner_icon_name' );
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
	public static function get_custom_banner_icon( $settings ) {
		return \StorePulse\StoreGrowth\Helper::find_option_settings( $settings, 'default_banner_custom_icon' );
	}

	/**
	 * Get the all coupon codes.
	 *
	 * @since 1.0.2
	 *
	 * @return array
	 */
	public static function available_coupon_codes() {
		global $wpdb;

		$coupon_codes = $wpdb->get_col( "SELECT post_name FROM $wpdb->posts WHERE post_type = 'shop_coupon' AND post_status = 'publish' ORDER BY post_name ASC" );

		$formatted_coupon_codes = array();
		foreach ( $coupon_codes as $coupon_code ) {
			$formatted_coupon_codes[] = array(
				'value' => $coupon_code,
				'label' => strtoupper( $coupon_code ),
			);
		}

		// Display available formatted coupon codes.
		return $formatted_coupon_codes;
	}
}
