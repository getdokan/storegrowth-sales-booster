<?php
/**
 * Storefront tracker endpoint (ADR-012).
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Test\Analytics;

use StorePulse\StoreGrowth\Analytics\Schema;
use StorePulse\StoreGrowth\Analytics\TrackController;
use StorePulse\StoreGrowth\Modules\UpsellOrderBump\Database\OrderBumpData;
use StorePulse\StoreGrowth\Test\StoreGrowthTestCase;
use WP_REST_Request;

/**
 * Visitors' counts go in only for known metrics of existing objects.
 *
 * @group analytics
 */
class TrackControllerTest extends StoreGrowthTestCase {

	/**
	 * An empty counts table and bump table, the route registered, a guest.
	 *
	 * @return void
	 */
	public function setUp(): void {
		parent::setUp();

		global $wpdb;
		$wpdb->query( "TRUNCATE TABLE {$wpdb->prefix}" . Schema::DAILY ); // phpcs:ignore WordPress.DB
		$wpdb->query( "TRUNCATE TABLE {$wpdb->prefix}spsg_order_bumps" ); // phpcs:ignore WordPress.DB

		wp_set_current_user( 0 );
		// A fresh REST server fires rest_api_init, with the route hooked.
		global $wp_rest_server;
		$wp_rest_server = null; // phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited
		add_action( 'rest_api_init', [ new TrackController(), 'register_routes' ] );
		rest_get_server();
	}

	/**
	 * Post events as the tracker does.
	 *
	 * @param array $events Events.
	 *
	 * @return \WP_REST_Response
	 */
	private function post( array $events ) {
		$request = new WP_REST_Request( 'POST', '/' . TrackController::NAMESPACE . '/' . TrackController::ROUTE );
		$request->set_header( 'content-type', 'application/json' );
		$request->set_body( wp_json_encode( [ 'events' => $events ] ) );

		return rest_do_request( $request );
	}

	/**
	 * A bump view event.
	 *
	 * @param int $bump_id Bump id.
	 * @param int $count   Count.
	 *
	 * @return array
	 */
	private function bump_view( int $bump_id, int $count = 1 ): array {
		return [
			'module'      => 'upsell-order-bump',
			'metric'      => 'view',
			'object_type' => 'campaign',
			'object_id'   => $bump_id,
			'count'       => $count,
		];
	}

	/**
	 * Counts in the table, by metric and object.
	 *
	 * @return array<string, int>
	 */
	private function counts(): array {
		global $wpdb;

		$counts = [];
		foreach ( $wpdb->get_results( "SELECT * FROM {$wpdb->prefix}" . Schema::DAILY, ARRAY_A ) as $row ) { // phpcs:ignore WordPress.DB
			$counts[ "{$row['module']}|{$row['metric']}|{$row['object_id']}" ] = (int) $row['count'];
		}

		return $counts;
	}

	/**
	 * A bump.
	 *
	 * @return int Bump id.
	 */
	private function create_bump(): int {
		return (int) ( new OrderBumpData() )->create(
			[
				'name'             => 'Bump',
				'offer_type'       => 'discount',
				'offer_amount'     => 10,
				'offer_product_id' => $this->create_product( 20.0 )->get_id(),
				'target_products'  => [ $this->create_product( 10.0 )->get_id() ],
			]
		);
	}

	/**
	 * A guest's view of an existing bump is counted.
	 *
	 * @return void
	 */
	public function test_view_of_an_existing_bump_is_counted() {
		$bump_id  = $this->create_bump();
		$response = $this->post( [ $this->bump_view( $bump_id ) ] );

		$this->assertSame( 200, $response->get_status() );
		$this->assertSame( [ "upsell-order-bump|view|{$bump_id}" => 1 ], $this->counts() );
	}

	/**
	 * A view of an existing BOGO offer is counted; a missing offer is dropped.
	 *
	 * @return void
	 */
	public function test_view_of_an_existing_bogo_offer_is_counted() {
		$offer_id = $this->create_global_offer( [ 'name_of_order_bogo' => 'Gift' ] );
		$view     = array_merge( $this->bump_view( $offer_id ), [ 'module' => 'bogo' ] );

		$this->post( [ $view, array_merge( $view, [ 'object_id' => $offer_id + 999 ] ) ] );

		$this->assertSame( [ "bogo|view|{$offer_id}" => 1 ], $this->counts() );
	}

	/**
	 * Countdown Timer: views and add-to-carts of a published product count;
	 * other metrics, campaigns and unpublished products don't.
	 *
	 * @return void
	 */
	public function test_countdown_views_and_add_to_carts_of_products() {
		$product_id = $this->create_product()->get_id();
		$draft      = $this->create_product();
		$draft->set_status( 'draft' );
		$draft->save();

		$event = [
			'module'      => 'countdown-timer',
			'metric'      => 'view',
			'object_type' => 'product',
			'object_id'   => $product_id,
		];

		$this->post(
			[
				$event,
				array_merge( $event, [ 'metric' => 'add_to_cart' ] ),
				array_merge( $event, [ 'metric' => 'click' ] ),
				array_merge( $event, [ 'object_type' => 'campaign' ] ),
				array_merge( $event, [ 'object_id' => $draft->get_id() ] ),
			]
		);

		$this->assertSame(
			[
				"countdown-timer|add_to_cart|{$product_id}" => 1,
				"countdown-timer|view|{$product_id}" => 1,
			],
			$this->counts()
		);
	}

	/**
	 * Unknown modules or metrics, a wrong object type and missing objects are dropped.
	 *
	 * @return void
	 */
	public function test_unknown_events_and_missing_objects_are_dropped() {
		$bump_id = $this->create_bump();
		$bad     = $this->bump_view( $bump_id );

		$this->post(
			[
				array_merge( $bad, [ 'module' => 'nope' ] ),
				array_merge( $bad, [ 'metric' => 'purchase' ] ),
				array_merge( $bad, [ 'object_type' => 'product' ] ),
				$this->bump_view( $bump_id + 999 ),
				'not an event',
			]
		);

		$this->assertSame( [], $this->counts() );
	}

	/**
	 * One key adds at most five per request, however it's sent.
	 *
	 * @return void
	 */
	public function test_counts_are_capped_per_request() {
		$bump_id = $this->create_bump();

		$this->post( [ $this->bump_view( $bump_id, 100 ), $this->bump_view( $bump_id, 3 ) ] );

		$this->assertSame( 5, $this->counts()[ "upsell-order-bump|view|{$bump_id}" ] );
	}

	/**
	 * A negative count adds one, and array fields drop the event.
	 *
	 * @return void
	 */
	public function test_negative_counts_and_array_fields() {
		$bump_id = $this->create_bump();

		$this->post(
			[
				$this->bump_view( $bump_id, -50 ),
				array_merge( $this->bump_view( $bump_id ), [ 'module' => [ 'x' ] ] ),
				array_merge( $this->bump_view( $bump_id ), [ 'object_id' => [ $bump_id ] ] ),
			]
		);

		$this->assertSame( [ "upsell-order-bump|view|{$bump_id}" => 1 ], $this->counts() );
	}

	/**
	 * Before the database update nothing is accepted.
	 *
	 * @return void
	 */
	public function test_nothing_accepted_before_the_update() {
		$bump_id = $this->create_bump();
		delete_option( Schema::VERSION_OPTION );

		$this->assertSame( 0, $this->post( [ $this->bump_view( $bump_id ) ] )->get_data()['accepted'] );
	}

	/**
	 * A batch over the limit is refused.
	 *
	 * @return void
	 */
	public function test_too_many_events_are_refused() {
		$bump_id = $this->create_bump();

		$response = $this->post( array_fill( 0, TrackController::MAX_EVENTS + 1, $this->bump_view( $bump_id ) ) );

		$this->assertSame( 400, $response->get_status() );
		$this->assertSame( [], $this->counts() );
	}
}
