<?php
/**
 * StoreGrowth inside WooCommerce Analytics (ADR-012).
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Test\Analytics;

use Automattic\WooCommerce\Admin\API\Reports\Cache as ReportsCache;
use Automattic\WooCommerce\Admin\API\Reports\Orders\Query as OrdersQuery;
use Automattic\WooCommerce\Admin\API\Reports\Orders\Stats\Query as OrdersStatsQuery;
use Automattic\WooCommerce\Admin\API\Reports\GenericQuery;
use Automattic\WooCommerce\Internal\Admin\Schedulers\OrdersScheduler;
use StorePulse\StoreGrowth\Analytics\OfferLookup;
use StorePulse\StoreGrowth\Analytics\OffersStatsController;
use StorePulse\StoreGrowth\Analytics\Schema;
use StorePulse\StoreGrowth\Analytics\WcAnalytics;
use StorePulse\StoreGrowth\Attribution\OfferAttribution;
use StorePulse\StoreGrowth\Test\StoreGrowthTestCase;
use ReflectionProperty;
use WC_Order;
use WC_Order_Item_Product;
use WP_REST_Request;

/**
 * The offer filter narrows WooCommerce's reports; the column and the
 * Overview indicator read the same lookup.
 *
 * @group analytics
 */
class WcAnalyticsTest extends StoreGrowthTestCase {

	/**
	 * Empty lookup, the hooks and the stats route registered.
	 *
	 * @return void
	 */
	public function setUp(): void {
		parent::setUp();

		global $wpdb, $wp_rest_server;
		$wpdb->query( "TRUNCATE TABLE {$wpdb->prefix}" . Schema::OFFER_LOOKUP ); // phpcs:ignore WordPress.DB

		( new OfferLookup() )->register_hooks();
		( new WcAnalytics() )->register_hooks();

		$wp_rest_server = null; // phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited
		add_action( 'rest_api_init', [ new OffersStatsController(), 'register_routes' ] );
		rest_get_server();

		wp_set_current_user( self::factory()->user->create( [ 'role' => 'administrator' ] ) );
		ReportsCache::invalidate();
	}

	/**
	 * No filter left behind for the next test.
	 *
	 * @return void
	 */
	public function tearDown(): void {
		unset( $_GET[ WcAnalytics::PARAM ] );

		$export = new ReflectionProperty( WcAnalytics::class, 'export_offer' );
		$export->setAccessible( true );
		$export->setValue( null, null );

		parent::tearDown();
	}

	/**
	 * A completed, imported order with one line per entry: [ total, meta ].
	 *
	 * @param array $lines Lines.
	 *
	 * @return int Order id.
	 */
	private function create_order( array $lines ): int {
		$order = new WC_Order();
		foreach ( $lines as list( $total, $meta ) ) {
			$item = new WC_Order_Item_Product();
			$item->set_product( $this->create_product( 20.0 ) );
			$item->set_quantity( 1 );
			$item->set_subtotal( $total );
			$item->set_total( $total );
			foreach ( $meta as $key => $value ) {
				$item->add_meta_data( $key, $value, true );
			}
			$order->add_item( $item );
		}
		$order->calculate_totals( false );
		$order->set_status( 'completed' );
		$order->save();

		OrdersScheduler::import( $order->get_id() );

		return $order->get_id();
	}

	/**
	 * Three orders: a bump with a plain line (15 + 20), a countdown line (15),
	 * no offer (40).
	 *
	 * @return int[] Bump order id, countdown order id, plain order id.
	 */
	private function create_orders(): array {
		return [
			$this->create_order(
				[
					[
						15,
						[
							OfferAttribution::CAMPAIGN_ID => 'order_bump:3',
							OfferAttribution::REFERENCE_PRICE => '20',
						],
					],
					[ 20, [] ],
				]
			),
			$this->create_order( [ [ 15, [ OfferAttribution::COUNTDOWN_PCT => '25' ] ] ] ),
			$this->create_order( [ [ 40, [] ] ] ),
		];
	}

	/**
	 * Report args for today.
	 *
	 * @return array
	 */
	private function args(): array {
		$today = current_datetime()->format( 'Y-m-d' );

		return [
			'after'    => "{$today} 00:00:00",
			'before'   => "{$today} 23:59:59",
			'interval' => 'day',
		];
	}

	/**
	 * Orders stats: whole orders with an offer, per filter value; nothing
	 * changes without the filter or with an unknown value.
	 *
	 * @return void
	 */
	public function test_orders_stats_filter() {
		$this->create_orders();

		$totals = function ( string $offer ) {
			$_GET[ WcAnalytics::PARAM ] = $offer;
			$data                       = ( new OrdersStatsQuery( $this->args() ) )->get_data();

			return [ (int) $data->totals->orders_count, (float) $data->totals->net_revenue ];
		};

		$this->assertSame( [ 3, 90.0 ], $totals( '' ) );
		$this->assertSame( [ 3, 90.0 ], $totals( 'nope' ), 'an unknown value is ignored' );
		$this->assertSame( [ 2, 50.0 ], $totals( WcAnalytics::ANY ) );
		$this->assertSame( [ 1, 35.0 ], $totals( 'upsell-order-bump' ), 'the whole order, not just the bump line' );
		$this->assertSame( [ 1, 15.0 ], $totals( 'countdown-timer' ) );
	}

	/**
	 * A refund of an offer order's plain line stays in the filtered report.
	 *
	 * @return void
	 */
	public function test_orders_filter_keeps_refunds_of_offer_orders() {
		list( $bump ) = $this->create_orders();

		$order = wc_get_order( $bump );
		$plain = null;
		foreach ( $order->get_items() as $item ) {
			if ( ! $item->get_meta( OfferAttribution::CAMPAIGN_ID ) ) {
				$plain = $item;
			}
		}

		$refund = wc_create_refund(
			[
				'order_id'   => $bump,
				'amount'     => 20,
				'line_items' => [
					$plain->get_id() => [
						'qty'          => 1,
						'refund_total' => 20,
					],
				],
			]
		);
		OrdersScheduler::import( $refund->get_id() );
		ReportsCache::invalidate();

		$_GET[ WcAnalytics::PARAM ] = 'upsell-order-bump';
		$data                       = ( new OrdersStatsQuery( $this->args() ) )->get_data();

		$this->assertEquals( 15, $data->totals->net_revenue, 'the order (35) less its refund (20)' );
	}

	/**
	 * A CSV export has no URL params: the filter comes from its args, and
	 * the Offer column names the modules.
	 *
	 * @return void
	 */
	public function test_export_reads_the_filter_and_adds_the_column() {
		list( $bump ) = $this->create_orders();

		( new WcAnalytics() )->read_export_batch( 1, 'x', 'orders', [ WcAnalytics::PARAM => 'upsell-order-bump' ] );
		$rows = ( new OrdersQuery( $this->args() ) )->get_data()->data;

		$this->assertSame( [ $bump ], array_map( 'intval', wp_list_pluck( $rows, 'order_id' ) ) );

		$analytics = new WcAnalytics();
		$this->assertArrayHasKey( WcAnalytics::PARAM, $analytics->add_export_column( [] ) );
		$this->assertSame(
			WcAnalytics::modules()['upsell-order-bump'],
			$analytics->add_export_value( [], $rows[0] )[ WcAnalytics::PARAM ]
		);
	}

	/**
	 * Products stats: only the offer lines.
	 *
	 * @return void
	 */
	public function test_products_stats_filter() {
		$this->create_orders();

		$_GET[ WcAnalytics::PARAM ] = WcAnalytics::ANY;
		$data                       = ( new GenericQuery( $this->args(), 'products-stats' ) )->get_data();

		$this->assertSame( 2, (int) $data->totals->items_sold );
		$this->assertEquals( 30, $data->totals->net_revenue );
	}

	/**
	 * Orders table rows carry their offers' modules.
	 *
	 * @return void
	 */
	public function test_orders_table_offers() {
		list( $bump, $countdown, $plain ) = $this->create_orders();

		$rows = wp_list_pluck( ( new OrdersQuery( $this->args() ) )->get_data()->data, WcAnalytics::PARAM, 'order_id' );

		$this->assertSame( [ 'upsell-order-bump' ], $rows[ $bump ] );
		$this->assertSame( [ 'countdown-timer' ], $rows[ $countdown ] );
		$this->assertSame( [], $rows[ $plain ] );
	}

	/**
	 * The Overview indicator: listed as a currency stat, totals of offer lines.
	 *
	 * @return void
	 */
	public function test_offer_stats_endpoint() {
		$this->create_orders();

		$schema = ( new OffersStatsController() )->get_item_schema()['properties']['totals']['properties']['net_revenue'];
		$this->assertTrue( $schema['indicator'] );
		$this->assertSame( 'currency', $schema['format'] );

		$slugs = wp_list_pluck( ( new WcAnalytics() )->add_report( [] ), 'slug' );
		$this->assertSame( [ OffersStatsController::SLUG ], $slugs );

		$request = new WP_REST_Request( 'GET', '/wc-analytics/reports/' . OffersStatsController::SLUG );
		$request->set_query_params( array_intersect_key( $this->args(), array_flip( [ 'after', 'before' ] ) ) );
		$response = rest_do_request( $request );

		$this->assertSame( 200, $response->get_status() );
		$this->assertEquals( 30, $response->get_data()['totals']['net_revenue'] );
	}

	/**
	 * Customers can't read the offer stats.
	 *
	 * @return void
	 */
	public function test_offer_stats_needs_report_access() {
		wp_set_current_user( self::factory()->user->create( [ 'role' => 'customer' ] ) );

		$response = rest_do_request( new WP_REST_Request( 'GET', '/wc-analytics/reports/' . OffersStatsController::SLUG ) );

		$this->assertSame( 403, $response->get_status() );
	}
}
