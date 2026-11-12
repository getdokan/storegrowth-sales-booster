<?php
/**
 * Tests for the Free offer limits and the campaign filters' defaults.
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Test\Offers;

use DateTimeImmutable;
use StorePulse\StoreGrowth\Modules\UpsellOrderBump\Database\OrderBumpData;
use StorePulse\StoreGrowth\Offers\OfferLimits;
use StorePulse\StoreGrowth\Offers\OfferVersions;
use StorePulse\StoreGrowth\REST\OfferLimitsController;
use StorePulse\StoreGrowth\Test\StoreGrowthTestCase;
use WP_REST_Request;
use WP_REST_Server;

/**
 * Free limits pause the newest offers live (ADR-013); without StoreGrowth
 * Pro there are no campaigns, so every offer is its everyday version.
 * Campaigns are tested in StoreGrowth Pro.
 */
class OfferLimitsTest extends StoreGrowthTestCase {

	/**
	 * Whether the store has a valid licence.
	 *
	 * @var bool
	 */
	private $pro = false;

	/**
	 * Clean bumps and a Free store.
	 *
	 * @return void
	 */
	public function setUp(): void {
		parent::setUp();

		global $wpdb;

		$wpdb->query( "TRUNCATE TABLE {$wpdb->prefix}spsg_order_bumps" ); // phpcs:ignore WordPress.DB

		$this->pro = false;
		add_filter(
			'storegrowth_pro_is_active',
			function () {
				return $this->pro;
			}
		);

		delete_option( OfferLimits::CHOICES_OPTION );
		OfferLimits::flush();
	}

	/**
	 * Leave the hooks as they were.
	 *
	 * @return void
	 */
	public function tearDown(): void {
		remove_all_filters( 'storegrowth_pro_is_active' );
		remove_all_filters( 'spsg_offer_campaign_row' );
		OfferLimits::flush();

		parent::tearDown();
	}

	/**
	 * A moment in the site timezone.
	 *
	 * @param string $time Date and time.
	 *
	 * @return DateTimeImmutable
	 */
	private function moment( string $time ): DateTimeImmutable {
		return new DateTimeImmutable( $time, wp_timezone() );
	}

	/**
	 * Store a bump.
	 *
	 * @param array $data Bump values.
	 *
	 * @return int
	 */
	private function bump( array $data = [] ): int {
		return (int) ( new OrderBumpData() )->create(
			array_merge(
				[
					'name'             => 'Gloves',
					'offer_product_id' => 99,
					'offer_type'       => 'discount',
					'offer_amount'     => 25,
				],
				$data
			)
		);
	}

	/**
	 * What applies to a stored bump at a moment.
	 *
	 * @param int    $id   Bump id.
	 * @param string $time Moment.
	 *
	 * @return array
	 */
	private function effective_bump( int $id, string $time ): array {
		return OfferVersions::effective_offer(
			array_merge( ( new OrderBumpData() )->get_by_id( $id ), [ 'offer_kind' => OfferVersions::ORDER_BUMP ] ),
			$this->moment( $time )
		);
	}

	/**
	 * A bump's stored row.
	 *
	 * @param int $id Bump id.
	 *
	 * @return array
	 */
	private function bump_row( int $id ): array {
		global $wpdb;

		return $wpdb->get_row( $wpdb->prepare( "SELECT * FROM {$wpdb->prefix}spsg_order_bumps WHERE id = %d", $id ), ARRAY_A ); // phpcs:ignore WordPress.DB
	}

	/**
	 * Without Pro nothing answers the campaign filters: every offer is its
	 * everyday version, no campaign offers run, and the timeline is empty.
	 *
	 * @return void
	 */
	public function test_without_campaigns_every_offer_is_everyday(): void {
		$id        = $this->bump();
		$effective = $this->effective_bump( $id, '2026-11-28 10:00' );

		$this->assertSame( OfferVersions::EVERYDAY, $effective['version'] );
		$this->assertSame( 0, $effective['promotion_id'] );
		$this->assertTrue( $effective['live'] );
		$this->assertSame( [], OfferVersions::running_campaign_offers( OfferVersions::ORDER_BUMP, $this->moment( '2026-11-28 10:00' ) ) );
		$this->assertSame(
			[
				'chip'    => '',
				'tooltip' => '',
				'banner'  => null,
			],
			OfferVersions::timeline( OfferVersions::ORDER_BUMP, $id, true, 'Gloves' )
		);

		$campaign_only = OfferVersions::effective_offer(
			[
				'offer_kind'        => OfferVersions::ORDER_BUMP,
				'campaign_offer_id' => 5,
				'status'            => 'active',
			]
		);
		$this->assertSame( OfferVersions::CAMPAIGN, $campaign_only['version'] );
		$this->assertFalse( $campaign_only['live'], 'A campaign-only offer stays offline without its campaign.' );
	}

	/**
	 * A campaign version from the filter is switched on, merged over the
	 * everyday values, and never written back.
	 *
	 * @return void
	 */
	public function test_a_campaign_version_from_the_filter_applies(): void {
		$id = $this->bump( [ 'status' => 'inactive' ] );

		add_filter(
			'spsg_offer_campaign_row',
			static function ( $row, string $kind, int $offer_id ) use ( $id ) {
				return OfferVersions::ORDER_BUMP === $kind && $id === $offer_id
					? [
						'promotion_id' => 7,
						'overrides'    => [ 'offer_amount' => 40 ],
					]
					: $row;
			},
			10,
			3
		);

		$effective = $this->effective_bump( $id, '2026-11-28 10:00' );

		$this->assertSame( OfferVersions::CAMPAIGN, $effective['version'] );
		$this->assertSame( 7, $effective['promotion_id'] );
		$this->assertTrue( $effective['live'] );
		$this->assertSame( 'active', $effective['values']['status'] );
		$this->assertEquals( 40, $effective['values']['offer_amount'] );
		$this->assertSame( 'inactive', $this->bump_row( $id )['status'] );
	}

	/**
	 * Free: only active bumps count when creating.
	 *
	 * @return void
	 */
	public function test_switched_off_bumps_do_not_count_towards_the_limit(): void {
		$data = new OrderBumpData();

		$this->bump( [ 'status' => 'inactive' ] );
		$this->bump();

		$this->assertTrue( $data->can_create() );

		$this->bump();

		$this->assertFalse( $data->can_create() );
	}

	/**
	 * Over the limit the newest pause, live, with the chip; the stored
	 * status isn't touched and a licence brings them back.
	 *
	 * @return void
	 */
	public function test_offers_over_the_limit_pause_newest_first(): void {
		$first  = $this->bump();
		$second = $this->bump();
		$third  = $this->bump();
		$fourth = $this->bump();

		$this->assertSame( [ $fourth, $third ], OfferLimits::paused_ids( OfferVersions::ORDER_BUMP ) );

		$paused = $this->effective_bump( $fourth, '2026-11-28 10:00' );
		$this->assertFalse( $paused['live'] );
		$this->assertSame( 'Paused: over Free limit', $paused['chip'] );
		$this->assertSame( 'active', $this->bump_row( $fourth )['status'] );
		$this->assertTrue( $this->effective_bump( $first, '2026-11-28 10:00' )['live'] );
		$this->assertTrue( $this->effective_bump( $second, '2026-11-28 10:00' )['live'] );

		$this->pro = true;
		$this->assertSame( [], OfferLimits::paused_ids( OfferVersions::ORDER_BUMP ) );
		$this->assertTrue( $this->effective_bump( $fourth, '2026-11-28 10:00' )['live'] );
	}

	/**
	 * Paused bumps don't reach the checkout.
	 *
	 * @return void
	 */
	public function test_paused_bumps_do_not_match_the_cart(): void {
		foreach ( [ 1, 2, 3 ] as $number ) {
			$this->bump(
				[
					'name'            => 'Bump ' . $number,
					'target_products' => [ 7 ],
				]
			);
		}

		$names = wp_list_pluck( ( new OrderBumpData() )->get_matching_bumps( [ 7 ], [] ), 'name' );

		$this->assertSame( [ 'Bump 1', 'Bump 2' ], $names );
	}

	/**
	 * "Choose offers" over REST: the merchant picks who stays on.
	 *
	 * @return void
	 */
	public function test_choose_offers_route(): void {
		wp_set_current_user( self::factory()->user->create( [ 'role' => 'administrator' ] ) );

		$first  = $this->bump();
		$second = $this->bump();
		$third  = $this->bump();

		global $wp_rest_server;
		$wp_rest_server = new WP_REST_Server(); // phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited
		add_action( 'rest_api_init', [ new OfferLimitsController(), 'register_routes' ] );
		do_action( 'rest_api_init', $wp_rest_server ); // phpcs:ignore WooCommerce.Commenting.CommentHooks.MissingHookComment

		$request = new WP_REST_Request( 'POST', '/sales-booster/v1/offer-limits/order_bump' );
		$request->set_body_params( [ 'keep' => [ $third, $first ] ] );
		$response = rest_do_request( $request );

		$this->assertSame( 200, $response->get_status() );
		$this->assertSame( [ $second ], OfferLimits::paused_ids( OfferVersions::ORDER_BUMP ) );

		$overview = $response->get_data()[0];
		$this->assertTrue( $overview['over_limit'] );
		$this->assertSame( $second, $overview['offers'][0]['id'] );
		$this->assertSame( 'Paused: over Free limit', $overview['offers'][0]['chip'] );

		$request = new WP_REST_Request( 'POST', '/sales-booster/v1/offer-limits/order_bump' );
		$request->set_body_params( [ 'keep' => [ $first, $second, $third ] ] );
		$this->assertSame( 400, rest_do_request( $request )->get_status() );

		wp_set_current_user( 0 );
		$request = new WP_REST_Request( 'POST', '/sales-booster/v1/offer-limits/order_bump' );
		$request->set_body_params( [ 'keep' => [ $first ] ] );
		$this->assertSame( 401, rest_do_request( $request )->get_status() );

		$wp_rest_server = null; // phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited
	}
}
