<?php
/**
 * File for custom functions.
 *
 * @package SBFW
 */

/**
 * Get Settings for this module.
 */
function sgsb_pd_banner_get_settings() {
	return get_option( 'sgsb_progressive_discount_banner_settings', array() );
}



/**
 * Get banner text.
 *
 * @param array $settings Admin settings.
 * @return string
 */
function sgsb_pd_banner_get_banner_text( $settings ) {

	$minimum_amount = sgsb_find_option_setting( $settings, 'cart_minimum_amount', 0 );
	$cart_amount    = wc()->cart->get_subtotal();

	// If customer already added enough to cart.
	if ( $cart_amount >= $minimum_amount ) {
		return sgsb_find_option_setting( $settings, 'goal_completion_text' );
	}

	$pbanner_text = sgsb_find_option_setting( $settings, 'progressive_banner_text' );

	return str_replace( '[amount]', wc_price( $minimum_amount - $cart_amount ), $pbanner_text );
}

/**
 * Get bar template.
 *
 * @param bool $is_echo Set print or return.
 * @return string
 */
function sgsb_pd_banner_get_bar_content( $is_echo = true ) {

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
function sgsb_pd_banner_get_banner_icon( $settings ) {
	return sgsb_find_option_setting( $settings, 'progressive_banner_icon_html' );
}
