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
 * @return void
 */
function sgsb_floating_notification_bar_get_bar_content( $is_echo = true ) {

	$path = apply_filters( 'sgsb_floating_bar_content_pro', __DIR__ . '/../templates/bar.php' );
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
 * @param array $settings Admin settings.
 */
function sgsb_floating_notification_bar_get_banner_icon( $settings ) {
		return sgsb_find_option_setting( $settings, 'default_banner_icon_html' );
}

/**
 * Get the all cuopon codes
 */
function available_coupon_codes() {
	global $wpdb;

	$coupon_codes = $wpdb->get_col( "SELECT post_name FROM $wpdb->posts WHERE post_type = 'shop_coupon' AND post_status = 'publish' ORDER BY post_name ASC" );

	$formatted_coupon_codes = array();
	foreach ( $coupon_codes as $coupon_code ) {
		$formatted_coupon_codes[] = array(
			'value' => $coupon_code,
			'label' => strtoupper( $coupon_code ),
		);
	}

	return $formatted_coupon_codes;

	// Display available coupon codes.
}
