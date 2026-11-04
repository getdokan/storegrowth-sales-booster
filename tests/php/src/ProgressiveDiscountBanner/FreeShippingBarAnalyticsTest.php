<?php
/**
 * Free Shipping Bar analytics (ADR-012): fee tag, threshold order key,
 * counts and the report.
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Test\ProgressiveDiscountBanner;

use Automattic\WooCommerce\Internal\Admin\Schedulers\OrdersScheduler;
use StorePulse\StoreGrowth\Analytics\AnalyticsController;
use StorePulse\StoreGrowth\Analytics\Counter;
use StorePulse\StoreGrowth\Analytics\Schema;
use StorePulse\StoreGrowth\Analytics\TrackController;
use StorePulse\StoreGrowth\Attribution\OfferAttribution;
use StorePulse\StoreGrowth\Modules\ProgressiveDiscountBanner\OrderAttribution;
use StorePulse\StoreGrowth\Modules\ProgressiveDiscountBanner\WoocommerceDiscount;
use StorePulse\StoreGrowth\Test\StoreGrowthTestCase;
use WC_Order;
use WC_Order_Item_Fee;
use WP_REST_Request;

/**
 * What the bar did for an order, and how the report reads it.
 *
 * @group analytics
 */
class FreeShippingBarAnalyticsTest extends StoreGrowthTestCase {

	/**
	 * Module settings option.
	 */
	const OPTION = 'spsg_progressive_discount_banner_settings';

	/**
	 * An empty cart and counts table, a fresh session, the bar's hooks and
	 * the routes in place.
	 *
	 * @return void
	 */
	public function setUp(): void {
		parent::setUp();

		global $wpdb, $wp_rest_server;
		$wpdb->query( "TRUNCATE TABLE {$wpdb->prefix}" . Schema::DAILY ); // phpcs:ignore WordPress.DB

		wc_load_cart();
		WC()->cart->empty_cart();
		WC()->session->set( WoocommerceDiscount::REACHED_SESSION_KEY, null );

		// Registered again whether or not boot did: a second fee with the same
		// id is refused, and the tags are written with unique = true.
		WoocommerceDiscount::instance()->register_hooks();
		( new OrderAttribution() )->register_hooks();

		$this->set_settings( [] );

		// A fresh REST server fires rest_api_init, with the routes hooked.
		$wp_rest_server = null; // phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited
		add_action( 'rest_api_init', [ new AnalyticsController(), 'register_routes' ] );
		add_action( 'rest_api_init', [ new TrackController(), 'register_routes' ] );
		rest_get_server();
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
	 * Saved bar settings: discount mode, $5 off from $20, unless overridden.
	 *
	 * @param array $overrides Keys to replace.
	 *
	 * @return void
	 */
	private function set_settings( array $overrides ): void {
		update_option(
			self::OPTION,
			array_merge(
				[
					'discount_type'         => 'discount-amount',
					'discount_amount_mode'  => 'fixed-amount',
					'discount_amount_value' => '5',
					'cart_minimum_amount'   => '20',
					'banner_device_view'    => [ 'banner-show-desktop' ],
				],
				$overrides
			)
		);
	}

	/**
	 * A cart with one product, its totals worked out (fees included).
	 *
	 * @param float $price Product price.
	 *
	 * @return void
	 */
	private function fill_cart( float $price ): void {
		WC()->cart->empty_cart();
		WC()->cart->add_to_cart( $this->create_product( $price )->get_id() );
		WC()->cart->calculate_totals();
	}

	/**
	 * Count rows, by module, metric and object.
	 *
	 * @return array<string, int>
	 */
	private function counts(): array {
		global $wpdb;

		$counts = [];
		foreach ( $wpdb->get_results( "SELECT * FROM {$wpdb->prefix}" . Schema::DAILY, ARRAY_A ) as $row ) { // phpcs:ignore WordPress.DB
			$counts[ "{$row['module']}|{$row['metric']}|{$row['object_type']}|{$row['object_id']}" ] = (int) $row['count'];
		}

		return $counts;
	}

	/**
	 * The bar's discount fee line carries its source and rule, as both
	 * checkouts build it.
	 *
	 * @return void
	 */
	public function test_discount_fee_line_is_tagged() {
		$this->fill_cart( 30.0 );

		$order = new WC_Order();
		WC()->checkout->create_order_fee_lines( $order, WC()->cart );

		$fees = array_values( $order->get_fees() );

		$this->assertCount( 1, $fees );
		$this->assertSame( -5.0, (float) $fees[0]->get_total() );
		$this->assertSame( OrderAttribution::CAMPAIGN_TYPE, $fees[0]->get_meta( OfferAttribution::CAMPAIGN_TYPE ) );
		$this->assertSame( '20', $fees[0]->get_meta( OrderAttribution::THRESHOLD ) );
		$this->assertSame( 'fixed-amount', $fees[0]->get_meta( OrderAttribution::MODE ) );
		$this->assertSame( '5', $fees[0]->get_meta( OrderAttribution::VALUE ) );
		$this->assertSame( '30', $fees[0]->get_meta( OrderAttribution::SUBTOTAL ) );
	}

	/**
	 * Another plugin's fee and a subscription's fee line stay untagged.
	 *
	 * @return void
	 */
	public function test_other_fees_and_subscriptions_are_not_tagged() {
		$this->fill_cart( 30.0 );

		$other = new WC_Order_Item_Fee();
		( new OrderAttribution() )->tag_fee( $other, 'someone-elses-fee', (object) [], new WC_Order() );

		$subscription = new class() extends WC_Order {
			/**
			 * Order type.
			 *
			 * @return string
			 */
			public function get_type() {
				return 'shop_subscription';
			}
		};
		$renewing     = new WC_Order_Item_Fee();
		( new OrderAttribution() )->tag_fee( $renewing, WoocommerceDiscount::FEE_ID, (object) [], $subscription );

		$this->assertSame( [], $other->get_meta_data() );
		$this->assertSame( [], $renewing->get_meta_data() );
	}

	/**
	 * Free-shipping mode: the order key is set while the cart meets the
	 * threshold and deleted on a later pass that doesn't.
	 *
	 * @return void
	 */
	public function test_free_shipping_threshold_is_set_and_deleted() {
		$this->set_settings( [ 'discount_type' => 'free-shipping' ] );
		$attribution = new OrderAttribution();
		$order       = new WC_Order();

		$this->fill_cart( 30.0 );
		$attribution->record_order( $order );
		$this->assertSame( '20', $order->get_meta( OrderAttribution::THRESHOLD ) );

		$this->fill_cart( 10.0 );
		$attribution->record_order( $order );
		$this->assertSame( '', $order->get_meta( OrderAttribution::THRESHOLD ) );

		// Discount mode has its fee line instead.
		$this->set_settings( [] );
		$this->fill_cart( 30.0 );
		$attribution->record_order( $order );
		$this->assertSame( '', $order->get_meta( OrderAttribution::THRESHOLD ) );
	}

	/**
	 * A later pass refreshes the subtotal on a fee line the checkout kept.
	 *
	 * @return void
	 */
	public function test_order_pass_refreshes_the_fee_line_subtotal() {
		$this->fill_cart( 30.0 );
		$order = new WC_Order();
		WC()->checkout->create_order_fee_lines( $order, WC()->cart );

		WC()->cart->add_to_cart( $this->create_product( 12.0 )->get_id() );
		WC()->cart->calculate_totals();
		( new OrderAttribution() )->record_order( $order );

		$fees = array_values( $order->get_fees() );
		$this->assertSame( '42', $fees[0]->get_meta( OrderAttribution::SUBTOTAL ) );
	}

	/**
	 * Reaching the threshold is counted once per session, however often
	 * the cart is worked out; a cart below it isn't counted.
	 *
	 * @return void
	 */
	public function test_threshold_reached_is_counted_once_per_session() {
		$this->fill_cart( 10.0 );
		$this->assertSame( [], $this->counts() );

		$this->fill_cart( 30.0 );
		WC()->cart->calculate_totals();
		$this->fill_cart( 40.0 );

		$this->assertSame( [ 'progressive-discount-banner|reached|module|0' => 1 ], $this->counts() );
	}

	/**
	 * The bar's views, clicks and dismissals come in for the module (id 0);
	 * other ids and server-only metrics are dropped.
	 *
	 * @return void
	 */
	public function test_bar_events_are_tracked_for_the_module() {
		$event = [
			'module'      => 'progressive-discount-banner',
			'object_type' => Counter::MODULE,
			'object_id'   => 0,
		];

		$request = new WP_REST_Request( 'POST', '/' . TrackController::NAMESPACE . '/' . TrackController::ROUTE );
		$request->set_header( 'content-type', 'application/json' );
		$request->set_body(
			wp_json_encode(
				[
					'events' => [
						array_merge( $event, [ 'metric' => 'view' ] ),
						array_merge( $event, [ 'metric' => 'click' ] ),
						array_merge( $event, [ 'metric' => 'dismiss' ] ),
						array_merge( $event, [ 'metric' => 'reached' ] ),
						array_merge( $event, [ 'metric' => 'view' ], [ 'object_id' => 3 ] ),
						array_merge( $event, [ 'metric' => 'view' ], [ 'object_type' => Counter::CAMPAIGN ] ),
					],
				]
			)
		);
		rest_do_request( $request );

		$counts = $this->counts();
		ksort( $counts );

		$this->assertSame(
			[
				'progressive-discount-banner|click|module|0'   => 1,
				'progressive-discount-banner|dismiss|module|0' => 1,
				'progressive-discount-banner|view|module|0'    => 1,
			],
			$counts
		);
	}

	/**
	 * An order in WooCommerce Analytics' tables.
	 *
	 * @param string   $status    Status.
	 * @param float    $discount  Bar discount fee (0 for none).
	 * @param int      $parent_id Parent order (a Dokan sub-order).
	 * @param string[] $meta      Order meta.
	 *
	 * @return WC_Order
	 */
	private function create_order( string $status, float $discount, int $parent_id = 0, array $meta = [] ): WC_Order {
		$order = new WC_Order();
		$order->set_parent_id( $parent_id );

		if ( $discount ) {
			$fee = new WC_Order_Item_Fee();
			$fee->set_name( 'Discount' );
			$fee->set_total( -$discount );
			$fee->add_meta_data( OfferAttribution::CAMPAIGN_TYPE, OrderAttribution::CAMPAIGN_TYPE, true );
			$order->add_item( $fee );
		}

		foreach ( $meta as $key => $value ) {
			$order->update_meta_data( $key, $value );
		}

		$order->set_status( $status );
		$order->save();

		OrdersScheduler::import( $order->get_id() );

		return $order;
	}

	/**
	 * The report: orders with the discount and the discount given (parent
	 * orders only, WooCommerce Analytics' statuses), orders over the
	 * threshold in either mode, and views; nothing in the offer totals.
	 *
	 * @return void
	 */
	public function test_report_reads_tagged_fees_and_threshold_orders() {
		$helped = $this->create_order( 'completed', 5.0 );
		$this->create_order( 'processing', 7.5 );
		$this->create_order( 'completed', 0, 0, [ OrderAttribution::THRESHOLD => '20' ] );

		// Left out: an excluded status, a fully refunded order, a sub-order.
		$this->create_order( 'pending', 9.0 );
		$this->create_order( 'refunded', 9.0 );
		$this->create_order( 'completed', 9.0, $helped->get_id(), [ OrderAttribution::THRESHOLD => '20' ] );

		Counter::bump( 'progressive-discount-banner', 'view', Counter::MODULE, 0, 4 );

		wp_set_current_user( self::factory()->user->create( [ 'role' => 'administrator' ] ) );
		$report = rest_do_request( new WP_REST_Request( 'GET', '/sales-booster/v1/analytics' ) )->get_data();
		$bar    = $report['modules']['progressive-discount-banner'];

		$this->assertSame( 2, $bar['orders'] );
		$this->assertSame( 12.5, $bar['discount'] );
		$this->assertSame( 3, $bar['threshold_orders'] );
		$this->assertSame( [ 'view' => 4 ], (array) $bar['counts'] );
		$this->assertSame( 0.0, $report['totals']['discount'] );
	}
}
