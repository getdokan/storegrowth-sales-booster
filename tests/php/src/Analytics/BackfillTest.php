<?php
/**
 * Offer lookup backfill (ADR-012).
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Test\Analytics;

use StorePulse\StoreGrowth\Analytics\Backfill;
use StorePulse\StoreGrowth\Analytics\OfferLookup;
use StorePulse\StoreGrowth\Analytics\Schema;
use StorePulse\StoreGrowth\Attribution\OfferAttribution;
use StorePulse\StoreGrowth\Test\StoreGrowthTestCase;
use WC_Order;
use WC_Order_Item_Product;

/**
 * Orders imported before the lookup table existed get their rows.
 *
 * @group analytics
 */
class BackfillTest extends StoreGrowthTestCase {

	/**
	 * The sync hooked, as at boot.
	 *
	 * @return void
	 */
	public function setUp(): void {
		parent::setUp();

		( new OfferLookup() )->register_hooks();
	}

	/**
	 * A completed order, with or without a StoreGrowth line.
	 *
	 * @param bool $with_keys Whether its line carries a campaign.
	 *
	 * @return int Order id.
	 */
	private function create_order( bool $with_keys ): int {
		$item = new WC_Order_Item_Product();
		$item->set_product( $this->create_product( 20.0 ) );
		$item->set_quantity( 1 );
		$item->set_subtotal( 15 );
		$item->set_total( 15 );
		if ( $with_keys ) {
			$item->add_meta_data( OfferAttribution::CAMPAIGN_ID, 'order_bump:3', true );
			$item->add_meta_data( OfferAttribution::REFERENCE_PRICE, '20', true );
		}

		$order = new WC_Order();
		$order->add_item( $item );
		$order->set_status( 'completed' );
		$order->save();

		return $order->get_id();
	}

	/**
	 * Rows of the lookup table.
	 *
	 * @return array[]
	 */
	private function lookup_rows(): array {
		global $wpdb;

		return $wpdb->get_results( "SELECT * FROM {$wpdb->prefix}" . Schema::OFFER_LOOKUP, ARRAY_A ); // phpcs:ignore WordPress.DB
	}

	/**
	 * Only orders with keys are picked, in id order, after the given id.
	 *
	 * @return void
	 */
	public function test_order_ids_are_the_orders_with_keys() {
		$first = $this->create_order( true );
		$this->create_order( false );
		$third = $this->create_order( true );

		$this->assertSame( [ $first, $third ], Backfill::order_ids( $first - 1, 10 ) );
		$this->assertSame( [ $third ], Backfill::order_ids( $first, 10 ) );
		$this->assertSame( [ $first ], Backfill::order_ids( $first - 1, 1 ) );
	}

	/**
	 * A batch writes the rows of orders that have none.
	 *
	 * @return void
	 */
	public function test_batch_fills_the_lookup() {
		global $wpdb;

		$order_id = $this->create_order( true );
		$wpdb->query( "TRUNCATE TABLE {$wpdb->prefix}" . Schema::OFFER_LOOKUP ); // phpcs:ignore WordPress.DB

		$done = ( new Backfill() )->run_batch( $order_id - 1 );

		$this->assertSame( [ $order_id ], $done );
		$rows = $this->lookup_rows();
		$this->assertCount( 1, $rows );
		$this->assertSame( 'order_bump:3', $rows[0]['campaign_id'] );
		$this->assertEquals( 5, $rows[0]['unit_discount'] );
	}
}
