<?php
/**
 * The deals on a cart's lines (ADR-014).
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Pricing;

use StorePulse\StoreGrowth\Modules\BoGo\Helper as BogoHelper;
use StorePulse\StoreGrowth\Support\Money;
use WC_Cart;
use WC_Coupon;
use WC_Product;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * What every module would give each cart line, before any of it is decided.
 * Prices are read from fresh products and the lines' own quantities, never
 * from cart totals or a line's product object: totals are zeroed before
 * `woocommerce_before_calculate_totals` and aren't worked out at all for
 * cart fragments. Everything is on WooCommerce's price-entry basis
 * (`get_price()`), so a tax setting can't change a comparison.
 *
 * @since SPSG_VERSION
 */
class DealList {

	/**
	 * Deal kind: the starting price (Countdown). Never competes.
	 *
	 * @since SPSG_VERSION
	 */
	const BASE = 'base';

	/**
	 * Deal kind: a BOGO deal, reported on the bought line.
	 *
	 * @since SPSG_VERSION
	 */
	const BOGO = 'bogo';

	/**
	 * Deal kind: an order bump. Never competes.
	 *
	 * @since SPSG_VERSION
	 */
	const BUMP = 'bump';

	/**
	 * Deal kind: a WooCommerce coupon, Smart or from outside StoreGrowth.
	 *
	 * @since SPSG_VERSION
	 */
	const COUPON = 'coupon';

	/**
	 * The non-gift lines of a cart with their deals.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param WC_Cart     $cart    Cart.
	 * @param WC_Coupon[] $coupons Coupons to report, keyed by code.
	 *
	 * @return array<string, array{product: WC_Product, item: array, quantity: int, start: float, unit: float, deals: array[]}>
	 */
	public static function for_cart( WC_Cart $cart, array $coupons ): array {
		$lines = self::lines( $cart );

		/**
		 * Filters the deals a cart's lines would get. Each deal is an array:
		 * `line` (cart item key), `kind` (a `DealList` constant), `name` and
		 * `amount` (the line's whole discount on the price-entry basis).
		 * `price` is the unit price a base or bump deal sets, `from` the unit
		 * price before it, and `promotion_id` the running campaign behind the
		 * deal, 0 for none.
		 *
		 * @since SPSG_VERSION
		 *
		 * @param array[] $deals Deals.
		 * @param WC_Cart $cart  Cart.
		 */
		$deals = (array) apply_filters( 'spsg_cart_deals', [], $cart );

		foreach ( $deals as $deal ) {
			if ( ! isset( $lines[ $deal['line'] ] ) ) {
				continue;
			}

			$lines[ $deal['line'] ]['deals'][] = $deal;

			if ( self::BASE === $deal['kind'] && isset( $deal['from'] ) ) {
				$lines[ $deal['line'] ]['start'] = (float) $deal['from'];
			}

			if ( self::BUMP === $deal['kind'] && isset( $deal['price'] ) ) {
				$lines[ $deal['line'] ]['unit'] = (float) $deal['price'];
			}
		}

		foreach ( $coupons as $coupon ) {
			$lines = self::add_coupon( $lines, $coupon );
		}

		return $lines;
	}

	/**
	 * A cart's subtotal without its gift lines, in the store's cart display
	 * (incl. or excl. tax), as WooCommerce measures a coupon's minimum spend.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param WC_Cart $cart Cart.
	 *
	 * @return float
	 */
	public static function subtotal_without_gifts( WC_Cart $cart ): float {
		$subtotal = 0.0;

		foreach ( self::lines( $cart ) as $line ) {
			$subtotal += Money::display_amount( $line['product'], $line['unit'] * $line['quantity'], 'cart' );
		}

		return $subtotal;
	}

	/**
	 * A cart's non-gift lines at their fresh prices.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param WC_Cart $cart Cart.
	 *
	 * @return array[]
	 */
	private static function lines( WC_Cart $cart ): array {
		$lines = [];

		foreach ( $cart->get_cart() as $key => $item ) {
			$product = wc_get_product( $item['data']->get_id() );

			if ( ! $product || BogoHelper::is_gift_line( $item ) ) {
				continue;
			}

			$lines[ $key ] = [
				'product'  => $product,
				'item'     => $item,
				'quantity' => (int) $item['quantity'],
				'start'    => (float) $product->get_price(),
				'unit'     => (float) $product->get_price(),
				'deals'    => [],
			];
		}

		return $lines;
	}

	/**
	 * Report a coupon on every line it applies to.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array[]   $lines  Lines.
	 * @param WC_Coupon $coupon Coupon.
	 *
	 * @return array[]
	 */
	private static function add_coupon( array $lines, WC_Coupon $coupon ): array {
		// It gives no discount of its own: its BOGO rule competes as itself.
		if ( SmartCoupon::is_buy_x_get_y( $coupon ) ) {
			return $lines;
		}

		$eligible = [];

		foreach ( $lines as $key => $line ) {
			if ( self::coupon_applies( $coupon, $line['product'], $line['item'] ) ) {
				$eligible[ $key ] = $line['unit'] * $line['quantity'];
			}
		}

		$cart_value = array_sum( $eligible );
		$is_smart   = SmartCoupon::is_smart( $coupon );

		foreach ( $eligible as $key => $line_value ) {
			$lines[ $key ]['deals'][] = [
				'line'     => $key,
				'kind'     => self::COUPON,
				'name'     => SmartCoupon::name( $coupon ),
				'shown'    => SmartCoupon::shown_code( $coupon ),
				'amount'   => self::coupon_amount( $coupon, $line_value, $cart_value, $lines[ $key ]['quantity'] ),
				'code'     => $coupon->get_code(),
				'smart'    => $is_smart,
				'combines' => $is_smart && SmartCoupon::combines( $coupon ),
				'others'   => $is_smart && SmartCoupon::allows_others( $coupon ),
				'split'    => $coupon->is_type( 'fixed_cart' ) ? (float) $coupon->get_amount() : null,
			];
		}

		return $lines;
	}

	/**
	 * Whether a coupon reaches a line. WooCommerce applies a fixed-cart coupon
	 * to every line, so a Smart fixed amount with "Applies to" restrictions is
	 * checked with the coupon read as a percentage, which honours them.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param WC_Coupon  $coupon  Coupon.
	 * @param WC_Product $product Line's product.
	 * @param array      $item    Cart item.
	 *
	 * @return bool
	 */
	public static function coupon_applies( WC_Coupon $coupon, WC_Product $product, array $item ): bool {
		if ( $coupon->is_type( 'fixed_cart' ) && SmartCoupon::is_smart( $coupon ) ) {
			$coupon = clone $coupon;
			$coupon->set_discount_type( 'percent' );
		}

		return $coupon->is_valid_for_product( $product, $item ) || $coupon->is_valid_for_cart();
	}

	/**
	 * A coupon's discount on one line. A fixed-cart coupon is split by line
	 * price over the lines it applies to.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param WC_Coupon $coupon     Coupon.
	 * @param float     $line_value The line's price times its quantity.
	 * @param float     $cart_value The same for every line the coupon applies to.
	 * @param int       $quantity   The line's quantity.
	 *
	 * @return float
	 */
	private static function coupon_amount( WC_Coupon $coupon, float $line_value, float $cart_value, int $quantity ): float {
		$amount = (float) $coupon->get_amount();

		if ( $coupon->is_type( 'percent' ) ) {
			return min( $line_value, $line_value * $amount / 100 );
		}

		if ( $coupon->is_type( 'fixed_cart' ) ) {
			return $cart_value > 0 ? min( $line_value, $amount * $line_value / $cart_value ) : 0.0;
		}

		if ( $coupon->is_type( 'fixed_product' ) ) {
			return min( $line_value, $amount * $quantity );
		}

		return min( $line_value, (float) $coupon->get_discount_amount( $line_value ) );
	}
}
