<?php
/**
 * Keeps Dokan's coupon data in step with StoreGrowth's deals.
 *
 * @package StorePulse\StoreGrowth\Integrations\Dokan
 */

namespace StorePulse\StoreGrowth\Integrations\Dokan;

use StorePulse\StoreGrowth\Pricing\CartLine;
use StorePulse\StoreGrowth\Pricing\SmartCoupon;
use WC_Cart;
use WC_Coupon;
use WC_Discounts;

defined( 'ABSPATH' ) || exit;

/**
 * Dokan keeps its own record of what each coupon took from each cart line,
 * pays vendors from it, and checks minimum spend per vendor. This class only
 * tells Dokan what the referee already decided.
 *
 * @since SPSG_VERSION
 */
class DealCompatibility {

	/**
	 * Cart line key Dokan records a coupon's discount under.
	 *
	 * @since SPSG_VERSION
	 *
	 * @var string
	 */
	const COUPON_INFO = '_dokan_coupon_info';

	/**
	 * Coupon meta of a Dokan Pro vendor order discount.
	 *
	 * @since SPSG_VERSION
	 *
	 * @var string
	 */
	const ORDER_DISCOUNT_PERCENT = 'setting_order_percentage';

	/**
	 * Coupon meta of a Dokan Pro vendor quantity discount.
	 *
	 * @since SPSG_VERSION
	 *
	 * @var string
	 */
	const QUANTITY_DISCOUNT_PERCENT = '_lot_discount_amount';

	/**
	 * Register the hooks.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return void
	 */
	public function register_hooks(): void {
		// After the coupon gate at 10, which takes the lines a coupon lost.
		add_filter( 'woocommerce_coupon_get_items_to_apply', [ $this, 'forget_lost_lines' ], 20, 3 );
		add_filter( 'dokan_coupon_line_item_total_for_vendor', [ $this, 'leave_gifts_out_of_spend' ], 10, 3 );
		add_filter( 'spsg_referee_ignores_coupon', [ $this, 'ignore_vendor_discount' ], 10, 2 );
	}

	/**
	 * Clear Dokan's record of a coupon on lines it no longer reaches. Dokan
	 * clears it only when the coupon leaves the cart, so the vendor of such
	 * a line would be paid as if the discount were still there.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array        $items     Items the coupon applies to.
	 * @param WC_Coupon    $coupon    Coupon.
	 * @param WC_Discounts $discounts Discounts.
	 *
	 * @return array
	 */
	public function forget_lost_lines( $items, $coupon, $discounts ) {
		$cart = $discounts->get_object();

		if ( ! $cart instanceof WC_Cart ) {
			return $items;
		}

		$reached = wp_list_pluck( $items, 'key' );
		$code    = $coupon->get_code();

		foreach ( $cart->cart_contents as $key => $line ) {
			if ( isset( $line[ self::COUPON_INFO ][ $code ] ) && ! in_array( $key, $reached, true ) ) {
				unset( $cart->cart_contents[ $key ][ self::COUPON_INFO ][ $code ] );
			}
		}

		return $items;
	}

	/**
	 * Leave gift lines out of a Smart Coupon's spend per vendor, as
	 * `CouponGate::check_minimum_spend()` does without Dokan Pro, which
	 * overrides that check.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array        $totals    Subtotals by vendor id.
	 * @param WC_Discounts $discounts Discounts.
	 * @param WC_Coupon    $coupon    Coupon.
	 *
	 * @return array
	 */
	public function leave_gifts_out_of_spend( $totals, $discounts, $coupon ) {
		if ( ! $discounts->get_object() instanceof WC_Cart || ! SmartCoupon::is_smart( $coupon ) ) {
			return $totals;
		}

		foreach ( $discounts->get_items() as $item ) {
			if ( ! CartLine::is_gift( $item->object ) ) {
				continue;
			}

			$vendor = BogoVendorRules::product_vendor( $item->product->get_id() );

			if ( isset( $totals[ $vendor ] ) ) {
				$totals[ $vendor ]['subtotal']     -= (float) ( $item->object['line_subtotal'] ?? 0 );
				$totals[ $vendor ]['subtotal_tax'] -= (float) ( $item->object['line_subtotal_tax'] ?? 0 );
			}
		}

		return $totals;
	}

	/**
	 * Dokan Pro generates a coupon for a vendor's own order or quantity
	 * discount and adds it back on every cart load: it stacks with deals, as
	 * the vendor's price cut it stands for would. Known by the settings Dokan
	 * copies onto it; its `Helper::is_vendor_discount_coupon()` reads a key
	 * that isn't saved on the coupon.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param bool      $ignored Whether the referee leaves the coupon out.
	 * @param WC_Coupon $coupon  Coupon.
	 *
	 * @return bool
	 */
	public function ignore_vendor_discount( $ignored, $coupon ) {
		return $ignored || $coupon->get_meta( self::ORDER_DISCOUNT_PERCENT ) || $coupon->get_meta( self::QUANTITY_DISCOUNT_PERCENT );
	}
}
