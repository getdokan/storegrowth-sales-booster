<?php
/**
 * File for custom functions.
 *
 * @package SBFW
 */

/**
 * Get Settings for this module.
 */
function sgsb_floating_notification_bar_get_settings() {
	return get_option( 'sgsb_floating_notification_bar_settings', array() );
}

/**
 * Get banner text.
 *
 * @param array $settings Admin settings.
 * @return string
 */
function sgsb_floating_notification_bar_get_banner_text( $settings ) {
		$banner_text = 'Shop More Than $100 to get Free Shipping';
		return sgsb_find_option_setting( $settings, 'default_banner_text', $banner_text );
}

/**
 * Get bar template.
 *
 * @param bool $is_echo Set print or return.
 * @return string
 */
function sgsb_floating_notification_bar_get_bar_content( $is_echo = true ) {
	$path = __DIR__ . '/../templates/bar.php';

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
 * @param array $settings Admin settings.
 */
function sgsb_floating_notification_bar_get_banner_icon( $settings ) {
		return sgsb_find_option_setting( $settings, 'default_banner_icon_html' );
}
