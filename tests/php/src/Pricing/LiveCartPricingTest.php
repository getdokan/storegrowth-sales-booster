<?php
/**
 * Tests for live gift and bump pricing.
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Test\Pricing;

use StorePulse\StoreGrowth\Modules\BoGo\BogoDataManager;
use StorePulse\StoreGrowth\Modules\BoGo\OrderBogo;
use StorePulse\StoreGrowth\Modules\UpsellOrderBump\Database\OrderBumpData;
use StorePulse\StoreGrowth\Modules\UpsellOrderBump\OrderBump;
use StorePulse\StoreGrowth\Modules\UpsellOrderBump\OrderBumpAjax;
use StorePulse\StoreGrowth\Pricing\CartLine;
use StorePulse\StoreGrowth\Test\StoreGrowthTestCase;

/**
 * A cart line stores the deal; its price follows the deal's current state.
 */
class LiveCartPricingTest extends StoreGrowthTestCase {

	/**
	 * Run the module pricing hooks on an empty cart.
	 *
	 * @return void
	 */
	public function setUp(): void {
		parent::setUp();

		WC()->cart->empty_cart();
		wc_clear_notices();
		add_action( 'woocommerce_before_calculate_totals', [ OrderBogo::instance(), 'woocommerce_custom_price_to_cart_item' ] );
		add_action( 'woocommerce_before_calculate_totals', [ new OrderBump(), 'woocommerce_custom_price_to_cart_item' ] );
	}

	/**
	 * Remove the hooks, so other test classes keep their own setup.
	 *
	 * @return void
	 */
	public function tearDown(): void {
		remove_all_actions( 'woocommerce_before_calculate_totals' );

		parent::tearDown();
	}

	/**
	 * A cart with a trigger and its gift from a global offer.
	 *
	 * @param array $overrides Offer settings.
	 *
	 * @return array{offer: int, gift: string, trigger: string}
	 */
	private function cart_with_gift( array $overrides = [] ): array {
		$trigger  = $this->create_product( 95 );
		$gift     = $this->create_product( 40 );
		$offer_id = $this->create_global_offer(
			array_merge(
				[
					'name_of_order_bogo'          => 'Buy one get a gift',
					'offered_products'            => [ $trigger->get_id() ],
					'get_different_product_field' => $gift->get_id(),
					'offer_product_id'            => $gift->get_id(),
				],
				$overrides
			)
		);

		$trigger_key = WC()->cart->add_to_cart( $trigger->get_id(), $overrides['minimum_quantity_required'] ?? 1 );
		$settings    = BogoDataManager::get_bogo_offer( $offer_id );

		OrderBogo::instance()->apply_bogo_product( $settings, $trigger->get_id(), $trigger_key, 1 );

		foreach ( WC()->cart->get_cart() as $key => $item ) {
			if ( ! empty( $item['bogo_offer'] ) ) {
				return [
					'offer'   => $offer_id,
					'gift'    => $key,
					'trigger' => $trigger_key,
				];
			}
		}

		$this->fail( 'The gift was not added.' );
	}

	/**
	 * Gift lines store no price and cost nothing while the offer is live,
	 * however many times totals run.
	 *
	 * @return void
	 */
	public function test_gift_stores_the_deal_and_is_priced_live(): void {
		$cart = $this->cart_with_gift();

		WC()->cart->calculate_totals();
		WC()->cart->calculate_totals();

		$line = WC()->cart->get_cart_item( $cart['gift'] );

		$this->assertArrayNotHasKey( 'bogo_offer_price', $line );
		$this->assertSame( 0.0, (float) $line['line_total'] );
		$this->assertSame( 95.0, (float) WC()->cart->get_cart_contents_total() );
	}

	/**
	 * A gift leaves the cart once its offer is switched off.
	 *
	 * @return void
	 */
	public function test_gift_is_removed_with_a_notice_when_the_offer_ends(): void {
		$cart = $this->cart_with_gift();

		global $wpdb;
		$wpdb->update( $wpdb->prefix . 'spsg_bogo_settings', [ 'status' => 'inactive' ], [ 'id' => $cart['offer'] ] );
		wp_cache_flush();

		WC()->cart->calculate_totals();

		$this->assertEmpty( WC()->cart->get_cart_item( $cart['gift'] ) );
		$this->assertTrue( wc_has_notice( 'Buy one get a gift ended. Your free item was removed.', 'notice' ) );
		$this->assertArrayNotHasKey( $cart['gift'], WC()->cart->removed_cart_contents );
	}

	/**
	 * Lowering the quantity below the minimum removes the gift.
	 *
	 * @return void
	 */
	public function test_gift_is_removed_when_the_cart_stops_qualifying(): void {
		$cart = $this->cart_with_gift( [ 'minimum_quantity_required' => 2 ] );

		WC()->cart->calculate_totals();
		$this->assertNotEmpty( WC()->cart->get_cart_item( $cart['gift'] ) );

		WC()->cart->cart_contents[ $cart['trigger'] ]['quantity'] = 1;
		WC()->cart->calculate_totals();
		$this->assertEmpty( WC()->cart->get_cart_item( $cart['gift'] ) );
	}

	/**
	 * A line from a cart saved by 3.0 is priced live: the saved price is
	 * ignored, and the line is neither double-discounted nor left full price.
	 *
	 * @return void
	 */
	public function test_saved_price_from_an_old_cart_is_ignored(): void {
		$cart = $this->cart_with_gift(
			[
				'offer_type'      => 'discount',
				'discount_amount' => 50,
			]
		);

		WC()->cart->cart_contents[ $cart['gift'] ]['bogo_offer_price'] = 5;
		WC()->cart->calculate_totals();

		$this->assertSame( 20.0, (float) WC()->cart->get_cart_item( $cart['gift'] )['line_total'] );
	}

	/**
	 * A bump's cart price follows its current discount, with a notice.
	 *
	 * @return void
	 */
	public function test_bump_price_follows_the_bump(): void {
		$target = $this->create_product( 120 );
		$offer  = $this->create_product( 40 );
		$data   = new OrderBumpData();
		$id     = (int) $data->create(
			[
				'name'             => 'Gloves',
				'target_products'  => [ $target->get_id() ],
				'offer_product_id' => $offer->get_id(),
				'offer_type'       => 'discount',
				'offer_amount'     => 25,
			]
		);

		WC()->cart->add_to_cart( $target->get_id() );

		$ajax = new OrderBumpAjax();
		$key  = $ajax->add_offer_to_cart( $ajax->find_offer( $offer->get_id() ) );

		WC()->cart->calculate_totals();

		$line = WC()->cart->get_cart_item( $key );
		$this->assertArrayNotHasKey( 'custom_price', $line );
		$this->assertSame( 30.0, (float) $line['line_total'] );

		$data->update( $id, [ 'offer_amount' => 40 ] );
		WC()->cart->calculate_totals();

		$line = WC()->cart->get_cart_item( $key );
		$this->assertSame( 24.0, (float) $line['line_total'] );
		$this->assertSame( 24.0, (float) $line[ CartLine::PRICED_WITH ] );
		$this->assertTrue( wc_has_notice( 'Prices updated.', 'notice' ) );
	}
}
