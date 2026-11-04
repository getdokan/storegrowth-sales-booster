<?php
/**
 * Offer lookup and offer stats on WooCommerce Analytics (ADR-012).
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Test\Analytics;

use Automattic\WooCommerce\Internal\Admin\Schedulers\OrdersScheduler;
use StorePulse\StoreGrowth\Analytics\OfferLookup;
use StorePulse\StoreGrowth\Analytics\Reports\Offers\DataStore as RowsDataStore;
use StorePulse\StoreGrowth\Analytics\Reports\Offers\Stats\DataStore;
use StorePulse\StoreGrowth\Analytics\Schema;
use StorePulse\StoreGrowth\Attribution\OfferAttribution;
use StorePulse\StoreGrowth\Test\StoreGrowthTestCase;
use WC_Order;
use WC_Order_Item_Product;

/**
 * The discount per unit of a line, and real orders imported into
 * WooCommerce Analytics, mirrored and read back as stats.
 *
 * @group analytics
 */
class OfferReportTest extends StoreGrowthTestCase {

	/**
	 * An empty lookup, and the sync hooked (boot may have hooked it already;
	 * a second sync writes the same row).
	 *
	 * @return void
	 */
	public function setUp(): void {
		parent::setUp();

		global $wpdb;
		$wpdb->query( "TRUNCATE TABLE {$wpdb->prefix}" . Schema::OFFER_LOOKUP ); // phpcs:ignore WordPress.DB

		( new OfferLookup() )->register_hooks();
	}

	/**
	 * A line's `qty`, `subtotal` and keys, as `line_figures()` takes them.
	 *
	 * @param array $overrides Fields to change.
	 *
	 * @return array
	 */
	private function line( array $overrides ): array {
		return array_merge(
			[
				'qty'                 => 2,
				'subtotal'            => 30,
				'campaign_id'         => '',
				'trigger_campaign_id' => '',
				'reference'           => '',
				'pct'                 => '',
				'legacy_discount'     => '',
			],
			$overrides
		);
	}

	/**
	 * A reward's discount per unit is the reference price minus the unit
	 * price charged before coupons.
	 *
	 * @return void
	 */
	public function test_reward_unit_discount() {
		$figures = OfferLookup::line_figures(
			$this->line(
				[
					'campaign_id' => 'order_bump:3',
					'reference'   => '20',
				]
			)
		);

		$this->assertSame( 'reward', $figures['role'] );
		$this->assertSame( 'upsell-order-bump', $figures['module'] );
		$this->assertEquals( 5, $figures['unit_discount'] );
		$this->assertSame( 0, $figures['approximate'] );
	}

	/**
	 * A line from before the reference price uses the 2.2.0 stamp, marked approximate.
	 *
	 * @return void
	 */
	public function test_line_from_before_the_reference_price_is_approximate() {
		$figures = OfferLookup::line_figures(
			$this->line(
				[
					'campaign_id'     => 'bogo:7',
					'legacy_discount' => '6',
				]
			)
		);

		$this->assertSame( 'bogo', $figures['module'] );
		$this->assertEquals( 6, $figures['unit_discount'] );
		$this->assertSame( 1, $figures['approximate'] );
	}

	/**
	 * Countdown: from the unit price charged and the percentage; at 100% the recorded price.
	 *
	 * @return void
	 */
	public function test_countdown_unit_discount() {
		$quarter = OfferLookup::line_figures(
			$this->line(
				[
					'qty'      => 1,
					'subtotal' => 15,
					'pct'      => '25',
				]
			)
		);
		$full    = OfferLookup::line_figures(
			$this->line(
				[
					'subtotal'  => 0,
					'pct'       => '100',
					'reference' => '20',
				]
			)
		);

		$this->assertSame( 'discounted', $quarter['role'] );
		$this->assertSame( 'countdown-timer', $quarter['module'] );
		$this->assertEquals( 5, $quarter['unit_discount'] );
		$this->assertEquals( 20, $full['unit_discount'] );
	}

	/**
	 * A trigger-only line has no role; a line without keys has no row.
	 *
	 * @return void
	 */
	public function test_trigger_line_and_plain_line() {
		$trigger = OfferLookup::line_figures( $this->line( [ 'trigger_campaign_id' => 'bogo:7' ] ) );

		$this->assertSame( '', $trigger['role'] );
		$this->assertSame( 'bogo:7', $trigger['trigger_campaign_id'] );
		$this->assertNull( OfferLookup::line_figures( $this->line( [] ) ) );
	}

	/**
	 * Add a line with keys to an order.
	 *
	 * @param WC_Order $order Order.
	 * @param float    $price Product price.
	 * @param int      $qty   Quantity.
	 * @param float    $total    Line total charged (after coupons).
	 * @param array    $meta     Item meta.
	 * @param float    $subtotal Line subtotal before coupons; the total when null.
	 *
	 * @return WC_Order_Item_Product
	 */
	private function add_line( WC_Order $order, float $price, int $qty, float $total, array $meta = [], ?float $subtotal = null ): WC_Order_Item_Product {
		$item = new WC_Order_Item_Product();
		$item->set_product( $this->create_product( $price ) );
		$item->set_quantity( $qty );
		$item->set_subtotal( null === $subtotal ? $total : $subtotal );
		$item->set_total( $total );
		foreach ( $meta as $key => $value ) {
			$item->add_meta_data( $key, $value, true );
		}
		$order->add_item( $item );

		return $item;
	}

	/**
	 * An order with a bump (2 × 15, worth 20 each), a countdown line
	 * (15 at 25% off), a BOGO trigger (40) and an ordinary line (50),
	 * imported into WooCommerce Analytics.
	 *
	 * @param string $status Order status.
	 *
	 * @return array{order: WC_Order, bump: WC_Order_Item_Product}
	 */
	private function create_order( string $status = 'completed' ): array {
		$order = new WC_Order();
		$bump  = $this->add_line(
			$order,
			20,
			2,
			30,
			[
				OfferAttribution::CAMPAIGN_ID     => 'order_bump:3',
				OfferAttribution::REFERENCE_PRICE => '20',
			]
		);
		$this->add_line( $order, 20, 1, 15, [ OfferAttribution::COUNTDOWN_PCT => '25' ] );
		$this->add_line( $order, 40, 1, 40, [ OfferAttribution::TRIGGER_CAMPAIGN_ID => 'bogo:7' ] );
		$this->add_line( $order, 50, 1, 50 );

		$order->set_status( $status );
		$order->calculate_totals( false );
		$order->save();

		$this->import( $order->get_id() );

		return [
			'order' => $order,
			'bump'  => $bump,
		];
	}

	/**
	 * Import an order and its refunds, as WooCommerce's scheduler does.
	 *
	 * @param int $order_id Order id.
	 *
	 * @return void
	 */
	private function import( int $order_id ): void {
		OrdersScheduler::import( $order_id );

		foreach ( wc_get_order( $order_id )->get_refunds() as $refund ) {
			OrdersScheduler::import( $refund->get_id() );
		}
	}

	/**
	 * Stats totals from yesterday to tomorrow.
	 *
	 * @param array $args Extra query args.
	 *
	 * @return object
	 */
	private function totals( array $args = [] ) {
		$data = ( new DataStore() )->get_data(
			array_merge(
				[
					'after'               => gmdate( 'Y-m-d 00:00:00', strtotime( '-1 day' ) ),
					'before'              => gmdate( 'Y-m-d 23:59:59', strtotime( '+1 day' ) ),
					'interval'            => 'day',
					'force_cache_refresh' => true,
				],
				$args
			)
		);

		return $data->totals;
	}

	/**
	 * The StoreGrowth total counts reward and countdown lines; triggers apart.
	 *
	 * @return void
	 */
	public function test_totals_of_a_paid_order() {
		$this->create_order();

		$totals = $this->totals();
		$this->assertEquals( 45, $totals->net_revenue );
		$this->assertEquals( 15, $totals->discount );
		$this->assertSame( 1, $totals->orders_count );

		$bump = $this->totals( [ 'spsg_module' => 'upsell-order-bump' ] );
		$this->assertEquals( 30, $bump->net_revenue );
		$this->assertEquals( 10, $bump->discount );

		$trigger = $this->totals(
			[
				'spsg_role'     => [ 'trigger' ],
				'spsg_campaign' => 'bogo:7',
			]
		);
		$this->assertEquals( 40, $trigger->net_revenue );
	}

	/**
	 * A line refund subtracts its revenue and its share of the discount.
	 *
	 * @return void
	 */
	public function test_line_refund_nets_out() {
		$created = $this->create_order();

		wc_create_refund(
			[
				'order_id'   => $created['order']->get_id(),
				'amount'     => 15,
				'line_items' => [
					$created['bump']->get_id() => [
						'qty'          => 1,
						'refund_total' => 15,
					],
				],
			]
		);
		$this->import( $created['order']->get_id() );

		$bump = $this->totals( [ 'spsg_module' => 'upsell-order-bump' ] );
		$this->assertEquals( 15, $bump->net_revenue );
		$this->assertEquals( 5, $bump->discount );
	}

	/**
	 * Pending and fully refunded orders aren't counted.
	 *
	 * @return void
	 */
	public function test_excluded_and_refunded_orders_are_not_counted() {
		$this->create_order( 'pending' );
		$this->create_order( 'refunded' );

		$totals = $this->totals();
		$this->assertEquals( 0, $totals->net_revenue );
		$this->assertEquals( 0, $totals->discount );
	}

	/**
	 * Before the upgrade has run, nothing is written and the report says so.
	 *
	 * @return void
	 */
	public function test_nothing_happens_before_the_upgrade() {
		global $wpdb;

		delete_option( Schema::VERSION_OPTION );
		$this->create_order();

		$this->assertSame( '0', $wpdb->get_var( "SELECT COUNT(*) FROM {$wpdb->prefix}" . Schema::OFFER_LOOKUP ) ); // phpcs:ignore WordPress.DB
		$this->assertWPError( ( new DataStore() )->get_data( [] ) );
	}

	/**
	 * Rows go with the order when WooCommerce removes its analytics.
	 *
	 * @return void
	 */
	public function test_rows_are_removed_with_the_order() {
		global $wpdb;

		$created = $this->create_order();
		$table   = $wpdb->prefix . Schema::OFFER_LOOKUP;

		$this->assertSame( '3', $wpdb->get_var( "SELECT COUNT(*) FROM {$table}" ) ); // phpcs:ignore WordPress.DB

		// WooCommerce's own delete path fires woocommerce_analytics_delete_product.
		$created['order']->delete( true );

		$this->assertSame( '0', $wpdb->get_var( "SELECT COUNT(*) FROM {$table}" ) ); // phpcs:ignore WordPress.DB
	}

	/**
	 * A coupon on a reward line lowers its revenue, not the offer's discount.
	 *
	 * @return void
	 */
	public function test_coupon_on_a_reward_line_is_not_the_offers_discount() {
		$order = new WC_Order();
		$this->add_line(
			$order,
			20,
			2,
			27,
			[
				OfferAttribution::CAMPAIGN_ID     => 'bogo:7',
				OfferAttribution::REFERENCE_PRICE => '20',
			],
			30
		);
		$order->set_status( 'completed' );
		$order->save();
		$this->import( $order->get_id() );

		$totals = $this->totals();
		$this->assertEquals( 27, $totals->net_revenue );
		$this->assertEquals( 10, $totals->discount );
	}

	/**
	 * A refund of an amount only (quantity 0) lowers revenue and keeps the discount.
	 *
	 * @return void
	 */
	public function test_amount_only_refund_keeps_the_discount() {
		$created = $this->create_order();

		wc_create_refund(
			[
				'order_id'   => $created['order']->get_id(),
				'amount'     => 5,
				'line_items' => [
					$created['bump']->get_id() => [
						'qty'          => 0,
						'refund_total' => 5,
					],
				],
			]
		);
		$this->import( $created['order']->get_id() );

		$bump = $this->totals( [ 'spsg_module' => 'upsell-order-bump' ] );
		$this->assertEquals( 25, $bump->net_revenue );
		$this->assertEquals( 10, $bump->discount );
	}

	/**
	 * A partial line refund, then WooCommerce's full refund: the order is
	 * refunded and nothing is counted.
	 *
	 * @return void
	 */
	public function test_partial_then_full_refund_counts_nothing() {
		$created  = $this->create_order();
		$order_id = $created['order']->get_id();

		wc_create_refund(
			[
				'order_id'   => $order_id,
				'amount'     => 15,
				'line_items' => [
					$created['bump']->get_id() => [
						'qty'          => 1,
						'refund_total' => 15,
					],
				],
			]
		);
		wc_create_refund(
			[
				'order_id' => $order_id,
				'amount'   => wc_get_order( $order_id )->get_remaining_refund_amount(),
			]
		);
		$this->import( $order_id );

		$this->assertSame( 'refunded', wc_get_order( $order_id )->get_status() );
		$totals = $this->totals();
		$this->assertEquals( 0, $totals->net_revenue );
		$this->assertEquals( 0, $totals->discount );
	}

	/**
	 * Rows of the current range, one per campaign or product.
	 *
	 * @param array $args Extra query args.
	 *
	 * @return array[]
	 */
	private function rows( array $args = [] ): array {
		$data = ( new RowsDataStore() )->get_data(
			array_merge(
				[
					'after'               => gmdate( 'Y-m-d 00:00:00', strtotime( '-1 day' ) ),
					'before'              => gmdate( 'Y-m-d 23:59:59', strtotime( '+1 day' ) ),
					'force_cache_refresh' => true,
				],
				$args
			)
		);

		return array_column( $data->data, null, 'group_key' );
	}

	/**
	 * Rows per campaign: revenue and discount of each; the countdown line
	 * has no campaign; triggers by their gift's campaign.
	 *
	 * @return void
	 */
	public function test_rows_per_campaign() {
		$this->create_order();
		$this->create_order();

		$rows = $this->rows();
		$this->assertEquals( 60, $rows['order_bump:3']['net_revenue'] );
		$this->assertEquals( 20, $rows['order_bump:3']['discount'] );
		$this->assertSame( 2, $rows['order_bump:3']['orders_count'] );
		$this->assertSame( 'upsell-order-bump', $rows['order_bump:3']['module'] );
		$this->assertEquals( 30, $rows['']['net_revenue'] );

		$triggers = $this->rows( [ 'spsg_role' => [ 'trigger' ] ] );
		$this->assertEquals( 80, $triggers['bogo:7']['net_revenue'] );
	}

	/**
	 * Rows per product, sorted by revenue.
	 *
	 * @return void
	 */
	public function test_rows_per_product() {
		$this->create_order();

		$data = ( new RowsDataStore() )->get_data(
			[
				'after'               => gmdate( 'Y-m-d 00:00:00', strtotime( '-1 day' ) ),
				'before'              => gmdate( 'Y-m-d 23:59:59', strtotime( '+1 day' ) ),
				'spsg_group'          => 'product',
				'force_cache_refresh' => true,
			]
		);

		$this->assertSame( 2, $data->total );
		$this->assertEquals( [ 30, 15 ], wp_list_pluck( $data->data, 'net_revenue' ) );

		// Page 2 keeps the total (the count ignores the page's LIMIT).
		$page_two = ( new RowsDataStore() )->get_data(
			[
				'after'               => gmdate( 'Y-m-d 00:00:00', strtotime( '-1 day' ) ),
				'before'              => gmdate( 'Y-m-d 23:59:59', strtotime( '+1 day' ) ),
				'spsg_group'          => 'product',
				'per_page'            => 1,
				'page'                => 2,
				'force_cache_refresh' => true,
			]
		);

		$this->assertSame( 2, $page_two->total );
		$this->assertSame( 2, $page_two->pages );
		$this->assertEquals( [ 15 ], wp_list_pluck( $page_two->data, 'net_revenue' ) );
	}

	/**
	 * Intervals carry the discount too.
	 *
	 * @return void
	 */
	public function test_intervals_carry_the_discount() {
		$this->create_order();

		$data = ( new DataStore() )->get_data(
			[
				'after'               => gmdate( 'Y-m-d 00:00:00', strtotime( '-1 day' ) ),
				'before'              => gmdate( 'Y-m-d 23:59:59', strtotime( '+1 day' ) ),
				'interval'            => 'day',
				'force_cache_refresh' => true,
			]
		);

		$this->assertEquals( 15, array_sum( wp_list_pluck( wp_list_pluck( $data->intervals, 'subtotals' ), 'discount' ) ) );
	}
}
