<?php
/**
 * Applies a coupon from a link (Pro).
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Modules\SmartCoupons;

use StorePulse\StoreGrowth\Interfaces\HookRegistry;
use StorePulse\StoreGrowth\Pricing\SmartCoupon;
use WC_Coupon;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Opening `?spsg_coupon=<code>` applies a link coupon. The cart may still be
 * empty then, so the coupon waits in the session for the first product.
 *
 * @since 3.1.0
 */
class LinkCoupons implements HookRegistry {

	/**
	 * The link's query argument.
	 *
	 * @since 3.1.0
	 */
	const QUERY_ARG = 'spsg_coupon';

	/**
	 * Session key of a coupon waiting for the cart.
	 *
	 * @since 3.1.0
	 */
	const SESSION_KEY = 'spsg_pending_coupon';

	/**
	 * Register hooks.
	 *
	 * @since 3.1.0
	 *
	 * @return void
	 */
	public function register_hooks(): void {
		add_action( 'wp_loaded', [ $this, 'read_link' ], 20 );
		add_action( 'woocommerce_add_to_cart', [ $this, 'apply_pending_coupon' ], 30, 0 );
	}

	/**
	 * A coupon's link.
	 *
	 * @since 3.1.0
	 *
	 * @param WC_Coupon $coupon Coupon.
	 *
	 * @return string
	 */
	public static function url( WC_Coupon $coupon ): string {
		return add_query_arg( self::QUERY_ARG, rawurlencode( $coupon->get_code() ), home_url( '/' ) );
	}

	/**
	 * Remember a link coupon opened in this request and apply it if it can be.
	 *
	 * @since 3.1.0
	 *
	 * @return void
	 */
	public function read_link(): void {
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- A public link; only an existing link coupon is applied.
		$code = isset( $_GET[ self::QUERY_ARG ] ) ? wc_format_coupon_code( sanitize_text_field( wp_unslash( $_GET[ self::QUERY_ARG ] ) ) ) : '';

		if ( '' === $code || ! sp_store_growth()->has_pro() || ! WC()->session ) {
			return;
		}

		$coupon = new WC_Coupon( $code );

		if ( ! SmartCoupon::is_smart( $coupon ) || SmartCoupon::LINK !== $coupon->get_meta( SmartCoupon::METHOD ) ) {
			return;
		}

		WC()->session->set_customer_session_cookie( true );
		WC()->session->set( self::SESSION_KEY, $code );

		$this->apply_pending_coupon();
	}

	/**
	 * Apply the waiting coupon once the cart has something in it.
	 *
	 * @since 3.1.0
	 *
	 * @return void
	 */
	public function apply_pending_coupon(): void {
		$code = WC()->session ? (string) WC()->session->get( self::SESSION_KEY, '' ) : '';

		if ( '' === $code || ! WC()->cart || WC()->cart->is_empty() ) {
			return;
		}

		WC()->session->set( self::SESSION_KEY, null );
		WC()->cart->apply_coupon( $code );
	}
}
