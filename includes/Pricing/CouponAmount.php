<?php
/**
 * A Smart Coupon's amount while a cart is priced (ADR-014).
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Pricing;

use StorePulse\StoreGrowth\Interfaces\HookRegistry;
use WC_Coupon;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Reports a campaign's amount, or a tier's percent, for a Smart Coupon. Only
 * while a cart is priced: the saved coupon is never written, and admin lists
 * and the REST API keep reading its saved amount.
 *
 * @since SPSG_VERSION
 */
class CouponAmount implements HookRegistry {

	/**
	 * How many cart pricings are running: adding a gift prices the cart
	 * inside a pricing, and the inner one must not end the outer.
	 *
	 * @var int
	 */
	private static int $pricing = 0;

	/**
	 * Register hooks.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return void
	 */
	public function register_hooks(): void {
		add_action( 'woocommerce_before_calculate_totals', [ $this, 'start_pricing' ], 1 );
		add_action( 'woocommerce_after_calculate_totals', [ $this, 'stop_pricing' ], PHP_INT_MAX );
		add_filter( 'woocommerce_coupon_get_amount', [ $this, 'live_amount' ], 10, 2 );
	}

	/**
	 * Totals are about to be worked out.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return void
	 */
	public function start_pricing(): void {
		++self::$pricing;
	}

	/**
	 * Totals are done.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return void
	 */
	public function stop_pricing(): void {
		self::$pricing = max( 0, self::$pricing - 1 );
	}

	/**
	 * Run something that reads coupon amounts for a cart, outside totals.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param callable $read What to run.
	 *
	 * @return mixed What it returns.
	 */
	public static function while_pricing( callable $read ) {
		++self::$pricing;

		try {
			return $read();
		} finally {
			--self::$pricing;
		}
	}

	/**
	 * The amount a Smart Coupon gives right now.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param mixed     $amount Saved amount.
	 * @param WC_Coupon $coupon Coupon.
	 *
	 * @return mixed
	 */
	public function live_amount( $amount, $coupon ) {
		if ( 0 === self::$pricing || ! $coupon instanceof WC_Coupon || ! SmartCoupon::is_smart( $coupon ) ) {
			return $amount;
		}

		$values = SmartCoupon::effective( $coupon )['values'];

		if ( SmartCoupon::TYPE_TIERS === $coupon->get_meta( SmartCoupon::TYPE ) ) {
			return self::tier_percent( (array) ( $values['tiers'] ?? [] ), $coupon );
		}

		return $values['amount'] ?? $amount;
	}

	/**
	 * The percent a tiers coupon has reached in the cart: the largest tier
	 * its eligible items meet, 0 below the first. Needs Pro.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array     $tiers  Rows of `qty` and `percent`.
	 * @param WC_Coupon $coupon Coupon.
	 *
	 * @return float
	 */
	public static function tier_percent( array $tiers, WC_Coupon $coupon ): float {
		if ( ! sp_store_growth()->has_pro() || ! WC()->cart ) {
			return 0.0;
		}

		$quantity = 0;

		foreach ( WC()->cart->get_cart() as $item ) {
			if ( ! CartLine::is_gift( $item ) && $coupon->is_valid_for_product( $item['data'], $item ) ) {
				$quantity += (int) $item['quantity'];
			}
		}

		$percent = 0.0;
		$reached = 0;

		foreach ( $tiers as $tier ) {
			if ( (int) $tier['qty'] <= $quantity && (int) $tier['qty'] > $reached ) {
				$reached = (int) $tier['qty'];
				$percent = (float) $tier['percent'];
			}
		}

		return $percent;
	}
}
