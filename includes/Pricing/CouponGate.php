<?php
/**
 * Holds WooCommerce coupons to the referee's decision (ADR-014).
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Pricing;

use Exception;
use StorePulse\StoreGrowth\Interfaces\HookRegistry;
use WC_Cart;
use WC_Coupon;
use WC_Discounts;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * WooCommerce still applies and splits every coupon; this class only tells it
 * which coupons stand and which lines they reach, through its own filters.
 * Nothing here acts on orders.
 *
 * @since 3.1.0
 */
class CouponGate implements HookRegistry {

	/**
	 * Register hooks.
	 *
	 * @since 3.1.0
	 *
	 * @return void
	 */
	public function register_hooks(): void {
		// After Dokan's check at 10, so its message comes first.
		add_filter( 'woocommerce_coupon_is_valid', [ $this, 'reject_losing_coupon' ], 20, 3 );
		add_filter( 'woocommerce_coupon_get_items_to_apply', [ $this, 'drop_lost_lines' ], 10, 3 );
		add_filter( 'woocommerce_coupon_validate_minimum_amount', [ $this, 'check_minimum_spend' ], 10, 2 );
		add_filter( 'woocommerce_coupon_error', [ $this, 'explain_removed_coupon' ], 10, 3 );
	}

	/**
	 * Reject a coupon the referee gave no line. An automatic coupon never
	 * shows a message: the referee applies and removes those itself.
	 *
	 * @since 3.1.0
	 *
	 * @param bool         $valid     Whether the coupon is valid.
	 * @param WC_Coupon    $coupon    Coupon.
	 * @param WC_Discounts $discounts Discounts.
	 *
	 * @return bool
	 *
	 * @throws Exception The shopper's message when the coupon loses.
	 */
	public function reject_losing_coupon( $valid, $coupon, $discounts ) {
		$cart = $discounts->get_object();

		if ( ! $valid || ! $cart instanceof WC_Cart || Referee::is_resolving() || Referee::is_observing() || SmartCoupon::is_automatic( $coupon ) ) {
			return $valid;
		}

		$message = Referee::for_cart( $cart, $coupon )->rejection( $coupon->get_code() );

		if ( '' !== $message ) {
			throw new Exception( esc_html( $message ) );
		}

		return $valid;
	}

	/**
	 * Keep a coupon off lines it lost, so WooCommerce splits it over the
	 * rest. Gift lines stay out of a Smart Coupon's reach and shares, and a
	 * Smart fixed amount stays on the products it applies to: WooCommerce
	 * would spread it over the whole cart.
	 *
	 * @since 3.1.0
	 *
	 * @param array        $items     Items the coupon would apply to.
	 * @param WC_Coupon    $coupon    Coupon.
	 * @param WC_Discounts $discounts Discounts.
	 *
	 * @return array
	 */
	public function drop_lost_lines( $items, $coupon, $discounts ) {
		$cart = $discounts->get_object();

		if ( ! $cart instanceof WC_Cart || Referee::is_observing() ) {
			return $items;
		}

		$decision = Referee::for_cart( $cart, $coupon );
		$code     = $coupon->get_code();
		$is_smart = SmartCoupon::is_smart( $coupon );

		return array_values(
			array_filter(
				$items,
				static function ( $item ) use ( $decision, $code, $is_smart, $coupon ): bool {
					return ! $decision->lost_line( $code, $item->key ) && ! ( $is_smart && ( CartLine::is_gift( $item->object ) || ! DealList::coupon_applies( $coupon, $item->product, $item->object ) ) );
				}
			)
		);
	}

	/**
	 * Measure a Smart Coupon's minimum spend without gift lines, so a
	 * discounted gift can't lift a cart over the minimum or drop it under.
	 * WooCommerce gives no order or cart here; order screens are all admin.
	 *
	 * @since 3.1.0
	 *
	 * @param bool      $not_met Whether the minimum isn't met.
	 * @param WC_Coupon $coupon  Coupon.
	 *
	 * @return bool
	 */
	public function check_minimum_spend( $not_met, $coupon ) {
		if ( is_admin() || ! WC()->cart || Referee::is_observing() || ! SmartCoupon::is_smart( $coupon ) ) {
			return $not_met;
		}

		return (float) $coupon->get_minimum_amount() > DealList::subtotal_without_gifts( WC()->cart );
	}

	/**
	 * Give a coupon that WooCommerce removes because it now loses the same
	 * message a shopper entering it would see.
	 *
	 * @since 3.1.0
	 *
	 * @param string    $message Error message.
	 * @param int       $code    Error code.
	 * @param WC_Coupon $coupon  Coupon.
	 *
	 * @return string
	 */
	public function explain_removed_coupon( $message, $code, $coupon ) {
		if ( WC_Coupon::E_WC_COUPON_INVALID_REMOVED !== (int) $code || ! $coupon instanceof WC_Coupon || ! WC()->cart || Referee::is_observing() ) {
			return $message;
		}

		$reason = Referee::for_cart( WC()->cart, $coupon )->rejection( $coupon->get_code() );

		return '' !== $reason ? esc_html( $reason ) : $message;
	}
}
