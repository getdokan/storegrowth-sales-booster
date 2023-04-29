<?php
/**
 * File for custom functions.
 *
 * @package SBFW
 */

/**
 * Get Settings for this module.
 */
function sbfw_pd_banner_get_settings() {
	return get_option( 'sbfw_progressive_discount_banner_settings', array() );
}

/**
 * Check we need to show the banner
 *
 * @return null|string
 */
function sbfw_pd_banner_get_banner_type_to_show() {
	$settings = sbfw_pd_banner_get_settings();

	$default_banner  = sbfw_find_option_setting( $settings, 'default_banner', false );
	$discount_banner = sbfw_find_option_setting( $settings, 'discount_banner', false );

	$is_cart_empty = wc()->cart->is_empty();

	// If cart is not empty and discount banner is enable.
	if ( ! $is_cart_empty && $discount_banner ) {
		return 'discount_banner';
	}

	// If default banner is enable.
	if ( $default_banner ) {
		return 'default_banner';
	}

	return null;
}

/**
 * Get banner text.
 *
 * @param array $settings Admin settings.
 * @return string
 */
function sbfw_pd_banner_get_banner_text( $settings ) {
	$banner_type_to_show = sbfw_pd_banner_get_banner_type_to_show();

	// Return default banner text.
	if ( 'discount_banner' !== $banner_type_to_show ) {
		return sbfw_find_option_setting( $settings, 'default_banner_text' );
	}

	$minimum_amount = sbfw_find_option_setting( $settings, 'cart_minimum_amount', 0 );
	$cart_amount    = wc()->cart->get_subtotal();

	// If customer already added enough to cart.
	if ( $cart_amount >= $minimum_amount ) {
		return sbfw_find_option_setting( $settings, 'goal_completion_text' );
	}

	$pbanner_text = sbfw_find_option_setting( $settings, 'progressive_banner_text' );

	return str_replace( '[amount]', wc_price( $minimum_amount - $cart_amount ), $pbanner_text );
}

/**
 * Get bar template.
 *
 * @param bool $is_echo Set print or return.
 * @return string
 */
function sbfw_pd_banner_get_bar_content( $is_echo = true ) {
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
function sbfw_pd_banner_get_banner_icon( $settings ) {
	$banner_type_to_show = sbfw_pd_banner_get_banner_type_to_show();

	// Return default banner text.
	if ( 'discount_banner' !== $banner_type_to_show ) {
		return sbfw_find_option_setting( $settings, 'default_banner_icon_html' );
	}

	return sbfw_find_option_setting( $settings, 'progressive_banner_icon_html' );
}
