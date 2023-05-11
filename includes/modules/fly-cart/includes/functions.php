<?php
/**
 * File for custom functions.
 *
 * @package SBFW
 */

/**
 * Get query string for http ajax referer.
 *
 * @param bool $url_only Set return format.
 */
function storepulse_sales_booster_fast_cart_get_query_string_for_http_ajax_referer( $url_only = false ) {
	$nonce = wp_create_nonce( 'storepulse_sales_booster_frontend_ajax' );

	$ajax_referer = sprintf(
		'%1$s?action=storepulse_sales_booster_fly_cart_frontend&method=get_cart_contents&_ajax_nonce=%2$s',
		admin_url( 'admin-ajax.php' ),
		$nonce
	);

	if ( $url_only ) {
		return $ajax_referer;
	}

	return '_wp_http_referer=' . rawurlencode( $ajax_referer );
}
