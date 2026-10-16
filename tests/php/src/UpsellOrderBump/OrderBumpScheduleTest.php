<?php
/**
 * Order Bump Offer Days (`bump_schedule`, step 11f).
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Test\UpsellOrderBump;

use DateTime;
use DateTimeZone;
use StorePulse\StoreGrowth\Modules\UpsellOrderBump\Database\OrderBumpData;
use StorePulse\StoreGrowth\Modules\UpsellOrderBump\OrderBump;
use StorePulse\StoreGrowth\Modules\UpsellOrderBump\OrderBumpAjax;
use StorePulse\StoreGrowth\Modules\UpsellOrderBump\OrderBumpDesign;
use StorePulse\StoreGrowth\Modules\UpsellOrderBump\RestApi\OrderBumpController;
use StorePulse\StoreGrowth\Modules\UpsellOrderBump\Settings\OrderBumpFields;
use StorePulse\StoreGrowth\Test\StoreGrowthTestCase;
use WP_REST_Request;
use WP_REST_Server;

/**
 * A bump shows, and can be added, only on its Offer Days in the site's
 * timezone.
 *
 * @group upsell-order-bump
 */
class OrderBumpScheduleTest extends StoreGrowthTestCase {

	/**
	 * An empty bump table and cart.
	 *
	 * @return void
	 */
	public function setUp(): void {
		parent::setUp();

		global $wpdb;
		$wpdb->query( "TRUNCATE TABLE {$wpdb->prefix}spsg_order_bumps" ); // phpcs:ignore WordPress.DB

		wc_load_cart();
		WC()->cart->empty_cart();
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
	 * Set the site's timezone to a UTC offset.
	 *
	 * @param int $hours Offset in hours.
	 *
	 * @return string The site's day at that offset, worked out without the plugin.
	 */
	private function set_site_offset( int $hours ): string {
		update_option( 'timezone_string', '' );
		update_option( 'gmt_offset', $hours );

		$zone = new DateTimeZone( sprintf( '%+03d:00', $hours ) );

		return strtolower( ( new DateTime( 'now', $zone ) )->format( 'l' ) );
	}

	/**
	 * A cart with a target product and a bump on it with this design.
	 *
	 * @param array $design The bump's `design_settings`.
	 *
	 * @return int The offer product's id.
	 */
	private function bump_in_cart( array $design ): int {
		$target = $this->create_product();
		$offer  = $this->create_product( 20 );

		( new OrderBumpData() )->create(
			[
				'name'             => 'Bump',
				'offer_type'       => 'discount',
				'offer_amount'     => 10,
				'target_products'  => [ $target->get_id() ],
				'offer_product_id' => $offer->get_id(),
				'design_settings'  => $design,
			]
		);

		WC()->cart->add_to_cart( $target->get_id() );

		return $offer->get_id();
	}

	/**
	 * A bump scheduled for the site's day shows and can be added; one for
	 * another day neither shows (classic and block share the offers) nor can
	 * be added by the ajax. +14 and −12 hours are always different days.
	 *
	 * @return void
	 */
	public function test_schedule_filters_bumps_by_the_sites_day() {
		$ahead  = $this->set_site_offset( 14 );
		$behind = strtolower( ( new DateTime( 'now', new DateTimeZone( '-12:00' ) ) )->format( 'l' ) );
		$this->assertNotSame( $ahead, $behind );
		$this->assertSame( $ahead, OrderBumpDesign::today(), 'today is the site timezone’s day' );

		$offer_id = $this->bump_in_cart( [ 'bump_schedule' => [ $ahead ] ] );

		$this->assertCount( 1, OrderBump::get_checkout_offers(), 'shown on its day' );
		$this->assertNotNull( ( new OrderBumpAjax() )->find_offer( $offer_id ) );

		$this->set_site_offset( -12 );

		$this->assertSame( [], OrderBump::get_checkout_offers(), 'hidden on another day' );
		$this->assertNull( ( new OrderBumpAjax() )->find_offer( $offer_id ), 'can’t be added on another day' );
	}

	/**
	 * A bump without a schedule (saved before 11f), or with `daily`, runs
	 * every day.
	 *
	 * @return void
	 */
	public function test_missing_or_daily_schedule_runs_every_day() {
		foreach ( OrderBumpDesign::SCHEDULE as $day ) {
			$this->assertTrue( OrderBumpDesign::runs_on( [], $day ), "no schedule: $day" );
			$this->assertTrue( OrderBumpDesign::runs_on( [ 'bump_schedule' => [ 'daily' ] ], $day ), "daily: $day" );
			$this->assertTrue( OrderBumpDesign::runs_on( [ 'bump_schedule' => [ 'daily', 'monday' ] ], $day ), "daily and a day: $day" );
		}

		$this->assertTrue( OrderBumpDesign::runs_on( [ 'bump_schedule' => [ 'monday', 'friday' ] ], 'friday' ) );
		$this->assertFalse( OrderBumpDesign::runs_on( [ 'bump_schedule' => [ 'monday', 'friday' ] ], 'sunday' ) );

		$offer_id = $this->bump_in_cart( [] );
		$this->assertCount( 1, OrderBump::get_checkout_offers() );
		$this->assertNotNull( ( new OrderBumpAjax() )->find_offer( $offer_id ) );
	}

	/**
	 * Sanitizing: only known days, `daily` alone when it's there or nothing
	 * is left, a comma-separated string read as a list.
	 *
	 * @return void
	 */
	public function test_schedule_is_sanitized() {
		$this->assertSame( [ 'monday', 'friday' ], OrderBumpDesign::sanitize_schedule( [ 'friday', 'Monday', 'funday', '<b>' ] ) );
		$this->assertSame( [ 'daily' ], OrderBumpDesign::sanitize_schedule( [ 'monday', 'daily' ] ) );
		$this->assertSame( [ 'daily' ], OrderBumpDesign::sanitize_schedule( [] ) );
		$this->assertSame( [ 'daily' ], OrderBumpDesign::sanitize_schedule( [ 'funday' ] ) );
		$this->assertSame( [ 'daily' ], OrderBumpDesign::sanitize_schedule( null ) );
		$this->assertSame( [ 'tuesday', 'sunday' ], OrderBumpDesign::sanitize_schedule( 'tuesday,sunday' ) );
		$this->assertSame( [ 'daily' ], OrderBumpDesign::sanitize_schedule( [ [ 'monday' ] ] ) );

		$design = OrderBumpDesign::sanitize( [ 'bump_schedule' => [ 'saturday', 'nope' ] ] );
		$this->assertSame( [ 'saturday' ], $design['bump_schedule'] );
	}

	/**
	 * The REST save stores the schedule sanitized in `design_settings`, and
	 * the editor draws it in Basic Information › Advanced.
	 *
	 * @return void
	 */
	public function test_rest_saves_the_schedule() {
		global $wp_rest_server;
		$wp_rest_server = new WP_REST_Server(); // phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited
		add_action(
			'rest_api_init',
			static function () {
				( new OrderBumpController() )->register_routes();
			}
		);
		// phpcs:ignore WooCommerce.Commenting.CommentHooks -- WordPress core's hook.
		do_action( 'rest_api_init', $wp_rest_server );
		wp_set_current_user( self::factory()->user->create( [ 'role' => 'administrator' ] ) );

		$request = new WP_REST_Request( 'POST', '/sales-booster/v1/order-bumps' );
		$request->set_header( 'Content-Type', 'application/json' );
		$request->set_body(
			wp_json_encode(
				[
					'name'             => 'Bump',
					'target_type'      => 'products',
					'target_products'  => [ $this->create_product()->get_id() ],
					'offer_product_id' => $this->create_product( 20 )->get_id(),
					'offer_type'       => 'discount',
					'offer_amount'     => 10,
					'design_settings'  => [ 'bump_schedule' => [ 'sunday', 'monday', 'x' ] ],
				]
			)
		);
		$response = rest_get_server()->dispatch( $request );
		$this->assertSame( 201, $response->get_status() );

		$bump = ( new OrderBumpData() )->get_by_id( (int) $response->get_data()['id'] );
		$this->assertSame( [ 'monday', 'sunday' ], $bump['design_settings']['bump_schedule'] );

		$field = ( new OrderBumpFields() )->get_fields()['bump_schedule'];
		$this->assertSame( [ 'basic', 'advanced', [ 'daily' ] ], [ $field['tab'], $field['section'], $field['default'] ] );
		$this->assertArrayHasKey( 'advanced', ( new OrderBumpFields() )->get_page()['tabs']['basic']['sections'] );

		$wp_rest_server = null; // phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited
	}
}
