<?php
/**
 * Tests for what StoreGrowth tells Dokan about deals.
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Test\Pricing;

use StorePulse\StoreGrowth\Integrations\Dokan\DealCompatibility;
use StorePulse\StoreGrowth\Pricing\CartLine;
use StorePulse\StoreGrowth\Test\StoreGrowthTestCase;
use WC_Coupon;
use WC_Discounts;

/**
 * Dokan isn't loaded in the suite: its records are written by hand.
 *
 * @group dokan
 */
class DokanDealCompatibilityTest extends StoreGrowthTestCase {

	/**
	 * A vendor is paid from Dokan's record, so a line the coupon no longer
	 * reaches loses that coupon's record and keeps the others'.
	 *
	 * @return void
	 */
	public function test_a_lost_line_forgets_only_that_coupon(): void {
		WC()->cart->empty_cart();

		$kept = WC()->cart->add_to_cart( $this->create_product( 100 )->get_id() );
		$lost = WC()->cart->add_to_cart( $this->create_product( 50 )->get_id() );

		$record = [
			'sale'  => [ 'discount' => 5 ],
			'other' => [ 'discount' => 1 ],
		];

		WC()->cart->cart_contents[ $kept ][ DealCompatibility::COUPON_INFO ] = $record;
		WC()->cart->cart_contents[ $lost ][ DealCompatibility::COUPON_INFO ] = $record;

		$coupon = new WC_Coupon();
		$coupon->set_code( 'sale' );

		$items = [ (object) [ 'key' => $kept ] ];

		$this->assertSame( $items, ( new DealCompatibility() )->forget_lost_lines( $items, $coupon, new WC_Discounts( WC()->cart ) ) );
		$this->assertSame( $record, WC()->cart->cart_contents[ $kept ][ DealCompatibility::COUPON_INFO ] );
		$this->assertSame( [ 'other' => [ 'discount' => 1 ] ], WC()->cart->cart_contents[ $lost ][ DealCompatibility::COUPON_INFO ] );
	}

	/**
	 * Dokan's vendor discount coupons are left out of the referee's decision,
	 * known by the settings Dokan copies onto them.
	 *
	 * @return void
	 */
	public function test_vendor_discount_coupons_are_ignored(): void {
		$filter = new DealCompatibility();
		$order  = new WC_Coupon();
		$lot    = new WC_Coupon();

		$this->assertFalse( (bool) $filter->ignore_vendor_discount( false, new WC_Coupon() ) );

		$order->update_meta_data( DealCompatibility::ORDER_DISCOUNT_PERCENT, '5' );
		$lot->update_meta_data( DealCompatibility::QUANTITY_DISCOUNT_PERCENT, '5' );

		$this->assertTrue( (bool) $filter->ignore_vendor_discount( false, $order ) );
		$this->assertTrue( (bool) $filter->ignore_vendor_discount( false, $lot ) );
	}

	/**
	 * Gift lines leave a Smart Coupon's spend per vendor, not a plain coupon's.
	 *
	 * @return void
	 */
	public function test_gift_lines_leave_a_smart_coupons_spend(): void {
		$vendor  = self::factory()->user->create();
		$gift_id = $this->create_product( 40 )->get_id();

		wp_update_post(
			[
				'ID'          => $gift_id,
				'post_author' => $vendor,
			]
		);

		WC()->cart->empty_cart();

		$gift = WC()->cart->add_to_cart( $gift_id, 1, 0, [], [ CartLine::REWARD_GIFT => 1 ] );

		WC()->cart->cart_contents[ $gift ]['line_subtotal']     = 40.0;
		WC()->cart->cart_contents[ $gift ]['line_subtotal_tax'] = 4.0;

		$totals = [
			$vendor => [
				'subtotal'     => 140.0,
				'subtotal_tax' => 14.0,
			],
		];

		$discounts = new WC_Discounts( WC()->cart );
		$filter    = new DealCompatibility();
		$after     = $filter->leave_gifts_out_of_spend( $totals, $discounts, $this->create_smart_coupon( 'smart' ) );

		$this->assertSame( 100.0, $after[ $vendor ]['subtotal'] );
		$this->assertSame( 10.0, $after[ $vendor ]['subtotal_tax'] );

		$plain = new WC_Coupon();
		$plain->set_code( 'plain' );

		$this->assertSame( $totals, $filter->leave_gifts_out_of_spend( $totals, $discounts, $plain ) );
	}
}
