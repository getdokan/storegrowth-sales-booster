<?php
/**
 * Order-line keys written at checkout for module analytics (ADR-012).
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Test\Attribution;

use StorePulse\StoreGrowth\Attribution\OfferAttribution;
use StorePulse\StoreGrowth\Modules\CountdownTimer\CommonHooks;
use StorePulse\StoreGrowth\Modules\CountdownTimer\OrderAttribution;
use StorePulse\StoreGrowth\Test\StoreGrowthTestCase;
use WC_Order;
use WC_Order_Item_Product;
use WC_Product;

/**
 * Keys on order lines built from a real cart.
 *
 * @group attribution
 */
class OfferAttributionTest extends StoreGrowthTestCase {

	/**
	 * An empty cart and the attribution hooks in place.
	 *
	 * @return void
	 */
	public function setUp(): void {
		parent::setUp();

		wc_load_cart();
		WC()->cart->empty_cart();

		// Registered again whether or not boot did: the keys are written with
		// unique = true, so a second writer changes nothing.
		( new OfferAttribution() )->register_hooks();
	}

	/**
	 * Empty the cart.
	 *
	 * @return void
	 */
	public function tearDown(): void {
		WC()->cart->empty_cart();

		parent::tearDown();
	}

	/**
	 * Build order lines from the current cart, as both checkouts do.
	 *
	 * @return WC_Order_Item_Product[] Items keyed by product id.
	 */
	private function checkout_lines(): array {
		$order = new WC_Order();
		WC()->checkout->create_order_line_items( $order, WC()->cart );

		$lines = [];
		foreach ( $order->get_items() as $item ) {
			$lines[ $item->get_variation_id() ? $item->get_variation_id() : $item->get_product_id() ] = $item;
		}

		return $lines;
	}

	/**
	 * A reward stamp, as BOGO and Order Bump add it to cart item data.
	 *
	 * @param string $campaign_id Campaign id, e.g. "bogo:7".
	 *
	 * @return array<string, string>
	 */
	private function stamp( string $campaign_id = 'order_bump:3' ): array {
		list( $type, $id ) = explode( ':', $campaign_id );

		return OfferAttribution::stamp( $type, (int) $id, 'discount', 5.0 );
	}

	/**
	 * A live countdown timer on a product.
	 *
	 * @param WC_Product $product Product.
	 * @param string     $pct     Stored discount percentage.
	 * @param string     $end     Timer end, relative to now.
	 *
	 * @return void
	 */
	private function add_timer( WC_Product $product, string $pct, string $end = '+1 day' ): void {
		update_post_meta( $product->get_id(), '_spsg_countdown_timer_discount_amount', $pct );
		update_post_meta( $product->get_id(), '_spsg_countdown_timer_discount_start', gmdate( 'Y-m-d H:i:s', strtotime( '-1 day' ) ) );
		update_post_meta( $product->get_id(), '_spsg_countdown_timer_discount_end', gmdate( 'Y-m-d H:i:s', strtotime( $end ) ) );
	}

	/**
	 * The countdown module's hooks, as when the module is active.
	 *
	 * @return void
	 */
	private function activate_countdown_hooks(): void {
		( new CommonHooks() )->register_hooks();
		( new OrderAttribution() )->register_hooks();
	}

	/**
	 * A reward line keeps its 2.2.0 stamp and gets the price before the
	 * offer, read from a fresh product, not the cart's offer-priced one.
	 *
	 * @return void
	 */
	public function test_reward_line_keeps_the_stamp_and_gets_the_price_before_the_offer() {
		$product = $this->create_product( 20.0 );
		WC()->cart->add_to_cart( $product->get_id(), 2, 0, [], $this->stamp() );

		// The offer price is set on the cart's product object, as BOGO and bumps do.
		foreach ( WC()->cart->get_cart() as $cart_item ) {
			$cart_item['data']->set_price( 15 );
		}

		$line = $this->checkout_lines()[ $product->get_id() ];

		$this->assertSame( 'order_bump:3', $line->get_meta( OfferAttribution::CAMPAIGN_ID ) );
		$this->assertSame( '5', $line->get_meta( OfferAttribution::DISCOUNT_VALUE ) );
		$this->assertSame( '20', $line->get_meta( OfferAttribution::REFERENCE_PRICE ) );
	}

	/**
	 * An ordinary line gets no StoreGrowth keys.
	 *
	 * @return void
	 */
	public function test_line_without_an_offer_gets_no_keys() {
		$product = $this->create_product( 20.0 );
		WC()->cart->add_to_cart( $product->get_id() );

		$line = $this->checkout_lines()[ $product->get_id() ];

		$this->assertSame( '', $line->get_meta( OfferAttribution::CAMPAIGN_ID ) );
		$this->assertSame( '', $line->get_meta( OfferAttribution::REFERENCE_PRICE ) );
		$this->assertSame( '', $line->get_meta( OfferAttribution::TRIGGER_CAMPAIGN_ID ) );
	}

	/**
	 * The line that triggered a BOGO gift gets the gift's campaign under its
	 * own key, so a trigger that is also a bump keeps its bump campaign.
	 *
	 * @return void
	 */
	public function test_trigger_line_gets_the_gift_campaign_under_its_own_key() {
		$trigger     = $this->create_product( 30.0 );
		$gift        = $this->create_product( 10.0 );
		$trigger_key = WC()->cart->add_to_cart( $trigger->get_id(), 1, 0, [], $this->stamp( 'order_bump:3' ) );

		WC()->cart->add_to_cart(
			$gift->get_id(),
			1,
			0,
			[],
			array_merge(
				[
					'bogo_offer'            => true,
					'linked_to_product_key' => $trigger_key,
				],
				$this->stamp( 'bogo:7' )
			)
		);

		$lines = $this->checkout_lines();

		// The trigger is also a bump here: both campaigns are kept.
		$this->assertSame( 'bogo:7', $lines[ $trigger->get_id() ]->get_meta( OfferAttribution::TRIGGER_CAMPAIGN_ID ) );
		$this->assertSame( 'order_bump:3', $lines[ $trigger->get_id() ]->get_meta( OfferAttribution::CAMPAIGN_ID ) );
		$this->assertSame( 'bogo:7', $lines[ $gift->get_id() ]->get_meta( OfferAttribution::CAMPAIGN_ID ) );
		$this->assertSame( '', $lines[ $gift->get_id() ]->get_meta( OfferAttribution::TRIGGER_CAMPAIGN_ID ) );
	}

	/**
	 * A gift added by the BOGO popup has no `bogo_offer` flag; its trigger
	 * still gets the campaign.
	 *
	 * @return void
	 */
	public function test_popup_gift_without_the_offer_flag_still_marks_its_trigger() {
		$trigger     = $this->create_product( 30.0 );
		$gift        = $this->create_product( 10.0 );
		$trigger_key = WC()->cart->add_to_cart( $trigger->get_id() );

		WC()->cart->add_to_cart(
			$gift->get_id(),
			1,
			0,
			[],
			array_merge(
				[
					'bogo_offer_price'      => 0,
					'linked_to_product_key' => $trigger_key,
				],
				$this->stamp( 'bogo:7' )
			)
		);

		$this->assertSame( 'bogo:7', $this->checkout_lines()[ $trigger->get_id() ]->get_meta( OfferAttribution::TRIGGER_CAMPAIGN_ID ) );
	}

	/**
	 * Nothing is written to a subscription's items, so renewals copy nothing.
	 *
	 * @return void
	 */
	public function test_nothing_is_written_to_a_subscription() {
		$product = $this->create_product( 20.0 );
		$key     = WC()->cart->add_to_cart( $product->get_id(), 1, 0, [], $this->stamp() );
		$values  = WC()->cart->get_cart_item( $key );

		$subscription = new class() extends WC_Order {
			/**
			 * Stand-in for WC_Subscription.
			 *
			 * @return string
			 */
			public function get_type() {
				return 'shop_subscription';
			}
		};

		$item = new WC_Order_Item_Product();
		( new OfferAttribution() )->copy_stamp_to_order_item( $item, $key, $values, $subscription );

		$this->assertSame( [], $item->get_meta_data() );
	}

	/**
	 * Keys a 2.2.0 subscription carries are stripped from the items a
	 * renewal copies; other plugins' meta stays.
	 *
	 * @return void
	 */
	public function test_keys_are_stripped_from_items_copied_off_a_subscription() {
		$item = new WC_Order_Item_Product();
		$item->add_meta_data( OfferAttribution::CAMPAIGN_ID, 'bogo:7', true );
		$item->add_meta_data( OfferAttribution::REFERENCE_PRICE, '20', true );
		$item->add_meta_data( OfferAttribution::COUNTDOWN_PCT, '10', true );
		$item->add_meta_data( '_other_plugin', 'kept', true );

		( new OfferAttribution() )->strip_from_subscription_items( [ $item ] );

		$this->assertSame( '', $item->get_meta( OfferAttribution::CAMPAIGN_ID ) );
		$this->assertSame( '', $item->get_meta( OfferAttribution::REFERENCE_PRICE ) );
		$this->assertSame( '', $item->get_meta( OfferAttribution::COUNTDOWN_PCT ) );
		$this->assertSame( 'kept', $item->get_meta( '_other_plugin' ) );
	}

	/**
	 * A line sold while a timer is live gets the percentage, and is charged
	 * the timer price.
	 *
	 * @return void
	 */
	public function test_line_sold_during_a_timer_gets_the_percentage() {
		$product = $this->create_product( 20.0 );
		$this->add_timer( $product, '25' );
		$this->activate_countdown_hooks();
		WC()->cart->add_to_cart( $product->get_id() );

		$line = $this->checkout_lines()[ $product->get_id() ];

		$this->assertSame( '25', $line->get_meta( OfferAttribution::COUNTDOWN_PCT ) );
		$this->assertSame( '', $line->get_meta( OfferAttribution::REFERENCE_PRICE ) );
		$this->assertEquals( 15, $line->get_subtotal() );
	}

	/**
	 * At 100% the line is charged 0, so the price is recorded too.
	 *
	 * @return void
	 */
	public function test_full_timer_discount_also_records_the_price() {
		$product = $this->create_product( 20.0 );
		$this->add_timer( $product, '100' );
		$this->activate_countdown_hooks();
		WC()->cart->add_to_cart( $product->get_id() );

		$line = $this->checkout_lines()[ $product->get_id() ];

		$this->assertSame( '100', $line->get_meta( OfferAttribution::COUNTDOWN_PCT ) );
		$this->assertSame( '20', $line->get_meta( OfferAttribution::REFERENCE_PRICE ) );
	}

	/**
	 * A reward with a live timer stays a reward (no percentage), and its
	 * reference price is the price before the timer, so the whole discount
	 * goes to the reward.
	 *
	 * @return void
	 */
	public function test_reward_line_with_a_live_timer_stays_a_reward_with_the_price_before_the_timer() {
		$product = $this->create_product( 20.0 );
		$this->add_timer( $product, '25' );
		$this->activate_countdown_hooks();
		WC()->cart->add_to_cart( $product->get_id(), 1, 0, [], $this->stamp() );

		$line = $this->checkout_lines()[ $product->get_id() ];

		$this->assertSame( 'order_bump:3', $line->get_meta( OfferAttribution::CAMPAIGN_ID ) );
		$this->assertSame( '', $line->get_meta( OfferAttribution::COUNTDOWN_PCT ) );
		$this->assertSame( '20', $line->get_meta( OfferAttribution::REFERENCE_PRICE ) );
	}

	/**
	 * A stored percentage over 100, or an ended timer, counts as no timer.
	 *
	 * @return void
	 */
	public function test_timer_out_of_range_or_ended_records_nothing() {
		$too_big = $this->create_product( 20.0 );
		$this->add_timer( $too_big, '150' );
		$ended = $this->create_product( 20.0 );
		$this->add_timer( $ended, '25', '-1 hour' );
		$this->activate_countdown_hooks();
		WC()->cart->add_to_cart( $too_big->get_id() );
		WC()->cart->add_to_cart( $ended->get_id() );

		$lines = $this->checkout_lines();

		$this->assertSame( '', $lines[ $too_big->get_id() ]->get_meta( OfferAttribution::COUNTDOWN_PCT ) );
		$this->assertSame( '', $lines[ $ended->get_id() ]->get_meta( OfferAttribution::COUNTDOWN_PCT ) );
	}

	/**
	 * With the Countdown Timer module off its price isn't charged, so the
	 * timer meta on the product is ignored.
	 *
	 * @return void
	 */
	public function test_inactive_countdown_module_records_nothing() {
		$product = $this->create_product( 20.0 );
		$this->add_timer( $product, '25' );
		WC()->cart->add_to_cart( $product->get_id() );

		$line = $this->checkout_lines()[ $product->get_id() ];

		$this->assertSame( '', $line->get_meta( OfferAttribution::COUNTDOWN_PCT ) );
	}
}
