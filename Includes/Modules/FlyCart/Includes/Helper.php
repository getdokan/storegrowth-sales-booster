<?php
/**
 * Helper functions for fly cart module.
 *
 * @package SBFW
 */

namespace STOREGROWTH\SPSB\Modules\FlyCart\Includes;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class Helper.
 */
class Helper {

	/**
	 * Get query string for http ajax referer.
	 *
	 * @since 1.0.2
	 *
	 * @param bool $url_only Set return format.
	 *
	 * @return string
	 */
	public static function sgsb_fast_cart_get_query_string_for_http_ajax_referer( $url_only = false ) {
		$nonce = wp_create_nonce( 'sgsb_frontend_ajax' );

		$ajax_referer = sprintf(
			'%1$s?action=sgsb_fly_cart_frontend&method=get_cart_contents&_ajax_nonce=%2$s',
			admin_url( 'admin-ajax.php' ),
			$nonce
		);

		if ( $url_only ) {
			return $ajax_referer;
		}

		return '_wp_http_referer=' . rawurlencode( $ajax_referer );
	}
}
