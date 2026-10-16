<?php
/**
 * Analytics report endpoint and dashboard revenue (ADR-012).
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Test\Analytics;

use Automattic\WooCommerce\Internal\Admin\Schedulers\OrdersScheduler;
use StorePulse\StoreGrowth\Analytics\AnalyticsController;
use StorePulse\StoreGrowth\Analytics\Counter;
use StorePulse\StoreGrowth\Analytics\OfferLookup;
use StorePulse\StoreGrowth\Analytics\Schema;
use StorePulse\StoreGrowth\Attribution\OfferAttribution;
use StorePulse\StoreGrowth\Modules\UpsellOrderBump\Database\OrderBumpData;
use StorePulse\StoreGrowth\Test\StoreGrowthTestCase;
use WC_Order;
use WC_Order_Item_Product;
use WP_REST_Request;

/**
 * The report a shop manager reads, and who may read it.
 *
 * @group analytics
 */
class AnalyticsControllerTest extends StoreGrowthTestCase {

	/**
	 * Empty tables, the sync and the route hooked.
	 *
	 * @return void
	 */
	public function setUp(): void {
		parent::setUp();

		global $wpdb, $wp_rest_server;
		foreach ( [ Schema::OFFER_LOOKUP, Schema::DAILY, 'spsg_order_bumps' ] as $table ) {
			$wpdb->query( "TRUNCATE TABLE {$wpdb->prefix}{$table}" ); // phpcs:ignore WordPress.DB
		}

		( new OfferLookup() )->register_hooks();

		// A fresh REST server fires rest_api_init, with the route hooked.
		$wp_rest_server = null; // phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited
		add_action( 'rest_api_init', [ new AnalyticsController(), 'register_routes' ] );
		rest_get_server();

		wp_set_current_user( self::factory()->user->create( [ 'role' => 'administrator' ] ) );
	}

	/**
	 * Get the report.
	 *
	 * @param array $params Query params.
	 *
	 * @return \WP_REST_Response
	 */
	private function get_report( array $params = [] ) {
		$request = new WP_REST_Request( 'GET', '/sales-booster/v1/analytics' );
		$request->set_query_params( $params );

		return rest_do_request( $request );
	}

	/**
	 * A line with keys.
	 *
	 * @param WC_Order $order Order.
	 * @param int      $qty   Quantity.
	 * @param float    $total Line total.
	 * @param array    $meta  Item meta.
	 *
	 * @return void
	 */
	private function add_line( WC_Order $order, int $qty, float $total, array $meta ): void {
		$item = new WC_Order_Item_Product();
		$item->set_product( $this->create_product( 20.0 ) );
		$item->set_quantity( $qty );
		$item->set_subtotal( $total );
		$item->set_total( $total );
		foreach ( $meta as $key => $value ) {
			$item->add_meta_data( $key, $value, true );
		}
		$order->add_item( $item );
	}

	/**
	 * A named bump and a completed order with its line (2 × 15, worth 20),
	 * a countdown line (15 at 25%) and a BOGO trigger (40).
	 *
	 * @return int Bump id.
	 */
	private function create_order(): int {
		$bump_id = (int) ( new OrderBumpData() )->create(
			[
				'name'             => 'Socks bump',
				'offer_type'       => 'discount',
				'offer_amount'     => 25,
				'offer_product_id' => $this->create_product( 20.0 )->get_id(),
				'target_products'  => [ $this->create_product( 10.0 )->get_id() ],
			]
		);

		$order = new WC_Order();
		$this->add_line(
			$order,
			2,
			30,
			[
				OfferAttribution::CAMPAIGN_ID     => "order_bump:{$bump_id}",
				OfferAttribution::REFERENCE_PRICE => '20',
			]
		);
		$this->add_line( $order, 1, 15, [ OfferAttribution::COUNTDOWN_PCT => '25' ] );
		$this->add_line( $order, 1, 40, [ OfferAttribution::TRIGGER_CAMPAIGN_ID => 'bogo:7' ] );
		$order->set_status( 'completed' );
		$order->save();

		OrdersScheduler::import( $order->get_id() );

		return $bump_id;
	}

	/**
	 * The report: totals, per module with the take rate, per campaign by name.
	 *
	 * @return void
	 */
	public function test_report_totals_modules_and_campaigns() {
		$bump_id = $this->create_order();
		Counter::bump( 'upsell-order-bump', 'view', Counter::CAMPAIGN, $bump_id, 4 );

		$data = $this->get_report()->get_data();

		$this->assertTrue( $data['status']['installed'] );
		$this->assertEquals( 45, $data['totals']['revenue'] );
		$this->assertEquals( 15, $data['totals']['discount'] );
		$this->assertSame( 1, $data['totals']['orders'] );

		$bump = $data['modules']['upsell-order-bump'];
		$this->assertEquals( 30, $bump['revenue'] );
		$this->assertSame( 4, $bump['counts']->view );
		$this->assertEquals( 25.0, $bump['take_rate'] );
		$this->assertEquals( 40, $data['modules']['bogo']['trigger_revenue'] );
		$this->assertEquals( 5, $data['modules']['countdown-timer']['discount'] );

		$this->assertCount( 1, $data['campaigns'] );
		$this->assertSame( "order_bump:{$bump_id}", $data['campaigns'][0]['id'] );
		$this->assertSame( 'Socks bump', $data['campaigns'][0]['name'] );
		$this->assertEquals( 25.0, $data['campaigns'][0]['take_rate'] );

		$this->assertEquals( 45, array_sum( wp_list_pluck( $data['intervals'], 'revenue' ) ) );

		// Each day per module; BOGO's line counts the trigger too.
		$today = end( $data['intervals'] )['modules'];
		$this->assertEquals( 30, $today->{'upsell-order-bump'} );
		$this->assertEquals( 40, $today->bogo );
		$this->assertEquals( 15, $today->{'countdown-timer'} );
		$this->assertArrayNotHasKey( 'daily', $bump );

		$dates = wp_list_pluck( $data['intervals'], 'date' );
		$this->assertSame( $data['status']['after'], reset( $dates ), 'oldest day first' );
		$this->assertSame( $data['status']['before'], end( $dates ) );
	}

	/**
	 * BOGO: orders with a gift per offer view, on the card and the offer's row.
	 *
	 * @return void
	 */
	public function test_bogo_take_rate() {
		$offer_id = $this->create_global_offer( [ 'name_of_order_bogo' => 'Half-price gift' ] );

		$order = new WC_Order();
		$this->add_line(
			$order,
			1,
			10,
			[
				OfferAttribution::CAMPAIGN_ID     => "bogo:{$offer_id}",
				OfferAttribution::REFERENCE_PRICE => '20',
			]
		);
		$order->set_status( 'completed' );
		$order->save();
		OrdersScheduler::import( $order->get_id() );

		Counter::bump( 'bogo', 'view', Counter::CAMPAIGN, $offer_id, 4 );

		$data = $this->get_report()->get_data();

		$this->assertSame( 4, $data['modules']['bogo']['counts']->view );
		$this->assertEquals( 25.0, $data['modules']['bogo']['take_rate'] );

		$this->assertCount( 1, $data['campaigns'] );
		$this->assertSame( "bogo:{$offer_id}", $data['campaigns'][0]['id'] );
		$this->assertSame( 'Half-price gift', $data['campaigns'][0]['name'] );
		$this->assertEquals( 25.0, $data['campaigns'][0]['take_rate'] );
	}

	/**
	 * Countdown Timer: add-to-cart rate on the card (with WooCommerce
	 * Analytics on and off) and per product, sold or not, "timer only"
	 * without a valid discount.
	 *
	 * @return void
	 */
	public function test_countdown_rate_and_products() {
		$sold       = $this->create_product( 20.0 );
		$no_sale    = $this->create_product( 20.0 );
		$timer_only = $this->create_product( 20.0 );
		update_post_meta( $sold->get_id(), '_spsg_countdown_timer_discount_amount', '25' );
		update_post_meta( $no_sale->get_id(), '_spsg_countdown_timer_discount_amount', '10' );
		update_post_meta( $timer_only->get_id(), '_spsg_countdown_timer_discount_amount', 'soon' );

		// 2 × 15, the timer's 25% off 20.
		$item = new WC_Order_Item_Product();
		$item->set_product( $sold );
		$item->set_quantity( 2 );
		$item->set_subtotal( 30 );
		$item->set_total( 30 );
		$item->add_meta_data( OfferAttribution::COUNTDOWN_PCT, '25', true );
		$order = new WC_Order();
		$order->add_item( $item );
		$order->set_status( 'completed' );
		$order->save();
		OrdersScheduler::import( $order->get_id() );

		Counter::bump( 'countdown-timer', 'view', Counter::PRODUCT, $sold->get_id(), 4 );
		Counter::bump( 'countdown-timer', 'add_to_cart', Counter::PRODUCT, $sold->get_id() );
		Counter::bump( 'countdown-timer', 'view', Counter::PRODUCT, $no_sale->get_id(), 2 );
		Counter::bump( 'countdown-timer', 'view', Counter::PRODUCT, $timer_only->get_id() );

		$data = $this->get_report()->get_data();

		$this->assertSame( 7, $data['modules']['countdown-timer']['counts']->view );
		$this->assertEquals( 14.3, $data['modules']['countdown-timer']['add_to_cart_rate'] );

		$this->assertSame( [ $sold->get_id(), $no_sale->get_id(), $timer_only->get_id() ], wp_list_pluck( $data['products'], 'id' ) );
		$this->assertSame( 3, $data['products_total'] );
		$this->assertFalse( $data['products_limited'] );

		list( $first, $second, $third ) = $data['products'];
		$this->assertSame( 'Test product', $first['name'] );
		$this->assertEquals( 30, $first['revenue'] );
		$this->assertEquals( 10, $first['discount'] );
		$this->assertSame( 1, $first['orders'] );
		$this->assertEquals( 25.0, $first['add_to_cart_rate'] );
		$this->assertFalse( $first['timer_only'] );
		$this->assertEquals( 0, $second['revenue'] );
		$this->assertEquals( 0.0, $second['add_to_cart_rate'] );
		$this->assertFalse( $second['timer_only'] );
		$this->assertTrue( $third['timer_only'] );

		// The rate is a count: it stays with WooCommerce Analytics off.
		update_option( 'woocommerce_analytics_enabled', 'no' );
		$this->assertEquals( 14.3, $this->get_report()->get_data()['modules']['countdown-timer']['add_to_cart_rate'] );
	}

	/**
	 * Lite shows the top three timer products.
	 *
	 * @return void
	 */
	public function test_lite_shows_three_timer_products() {
		foreach ( [ 1, 2, 3, 4 ] as $views ) {
			Counter::bump( 'countdown-timer', 'view', Counter::PRODUCT, $this->create_product()->get_id(), $views );
		}

		$data = $this->get_report()->get_data();

		$this->assertCount( 3, $data['products'] );
		$this->assertSame( 4, $data['products_total'] );
		$this->assertTrue( $data['products_limited'] );
		$views = array_map(
			function ( $product ) {
				return $product['counts']->view;
			},
			$data['products']
		);
		$this->assertSame( [ 4, 3, 2 ], $views );
	}

	/**
	 * Lite reads at most the last 30 days.
	 *
	 * @return void
	 */
	public function test_lite_range_is_limited_to_30_days() {
		$data = $this->get_report( [ 'after' => '2020-01-01' ] )->get_data();

		$this->assertTrue( $data['status']['range_limited'] );
		$this->assertSame( current_datetime()->modify( '-29 days' )->format( 'Y-m-d' ), $data['status']['after'] );
	}

	/**
	 * Lite can't read an older day through `before` either, nor a future one.
	 *
	 * @return void
	 */
	public function test_lite_range_limit_holds_for_before() {
		$earliest = current_datetime()->modify( '-29 days' )->format( 'Y-m-d' );
		$today    = current_datetime()->format( 'Y-m-d' );

		$old = $this->get_report( [ 'before' => '2020-01-01' ] )->get_data()['status'];
		$this->assertSame( [ $earliest, $earliest ], [ $old['after'], $old['before'] ] );
		$this->assertTrue( $old['range_limited'] );

		$future = $this->get_report( [ 'before' => '2099-01-01' ] )->get_data()['status'];
		$this->assertSame( $today, $future['before'] );
	}

	/**
	 * `days` is worked out in store time.
	 *
	 * @return void
	 */
	public function test_days_range() {
		$status = $this->get_report( [ 'days' => 7 ] )->get_data()['status'];

		$this->assertSame( current_datetime()->modify( '-6 days' )->format( 'Y-m-d' ), $status['after'] );
		$this->assertSame( current_datetime()->format( 'Y-m-d' ), $status['before'] );
	}

	/**
	 * A day that isn't a real `Y-m-d` date is refused, not a fatal error.
	 *
	 * @return void
	 */
	public function test_bad_dates_are_refused() {
		$this->assertSame( 400, $this->get_report( [ 'after' => '2020-13-45' ] )->get_status() );
		$this->assertSame( 400, $this->get_report( [ 'before' => 'foo' ] )->get_status() );
	}

	/**
	 * With WooCommerce Analytics off the report keeps the counts only.
	 *
	 * @return void
	 */
	public function test_report_with_analytics_off_keeps_counts() {
		Counter::bump( 'upsell-order-bump', 'view', Counter::CAMPAIGN, 9, 2 );
		update_option( 'woocommerce_analytics_enabled', 'no' );

		$data = $this->get_report()->get_data();

		$this->assertFalse( $data['status']['analytics_enabled'] );
		$this->assertArrayNotHasKey( 'totals', $data );
		$this->assertSame( 2, $data['modules']['upsell-order-bump']['counts']->view );
		$this->assertNull( ( new AnalyticsController() )->add_dashboard_revenue( [ 'revenue' => null ] )['revenue'] );
	}

	/**
	 * Before the upgrade the report only says so.
	 *
	 * @return void
	 */
	public function test_report_before_the_upgrade() {
		delete_option( Schema::VERSION_OPTION );

		$data = $this->get_report()->get_data();

		$this->assertFalse( $data['status']['installed'] );
		$this->assertArrayNotHasKey( 'totals', $data );
	}

	/**
	 * Customers can't read it.
	 *
	 * @return void
	 */
	public function test_customers_are_refused() {
		wp_set_current_user( self::factory()->user->create( [ 'role' => 'customer' ] ) );

		$this->assertSame( 403, $this->get_report()->get_status() );
	}

	/**
	 * The dashboard shows the last 30 days' StoreGrowth revenue.
	 *
	 * @return void
	 */
	public function test_dashboard_revenue() {
		$this->create_order();

		$overview = ( new AnalyticsController() )->add_dashboard_revenue( [ 'revenue' => null ] );

		$this->assertEquals( 45, $overview['revenue']['amount'] );
		$this->assertStringContainsString( '45', $overview['revenue']['formatted'] );
	}
}
