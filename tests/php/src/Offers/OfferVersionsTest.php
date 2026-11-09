<?php
/**
 * Tests for offer versions, campaigns and Free limits.
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Test\Offers;

use DateTimeImmutable;
use StorePulse\StoreGrowth\Modules\BoGo\BogoDataManager;
use StorePulse\StoreGrowth\Modules\BoGo\BogoValidator;
use StorePulse\StoreGrowth\Modules\BoGo\Helper as BogoHelper;
use StorePulse\StoreGrowth\Modules\BoGo\OrderBogo;
use StorePulse\StoreGrowth\Modules\CountdownTimer\CommonHooks;
use StorePulse\StoreGrowth\Modules\UpsellOrderBump\Database\OrderBumpData;
use StorePulse\StoreGrowth\Modules\UpsellOrderBump\OrderBump;
use StorePulse\StoreGrowth\Offers\CampaignRepository;
use StorePulse\StoreGrowth\Offers\OfferLimits;
use StorePulse\StoreGrowth\Offers\OfferVersions;
use StorePulse\StoreGrowth\REST\OfferLimitsController;
use StorePulse\StoreGrowth\Test\StoreGrowthTestCase;
use WP_REST_Request;
use WP_REST_Server;

/**
 * Which version of an offer applies, and what a campaign leaves behind.
 */
class OfferVersionsTest extends StoreGrowthTestCase {

	/**
	 * Black Friday's window, site-local.
	 */
	const START = '2026-11-27 00:00';
	const END   = '2026-12-01 23:59';

	/**
	 * Before, during and after the window.
	 */
	const TIMES = [ '2026-11-26 10:00', '2026-11-28 10:00', '2026-12-02 10:00' ];

	/**
	 * Whether the store has a valid licence.
	 *
	 * @var bool
	 */
	private $pro = true;

	/**
	 * Clean tables and a licensed store.
	 *
	 * @return void
	 */
	public function setUp(): void {
		parent::setUp();

		global $wpdb;

		foreach ( [ CampaignRepository::CAMPAIGNS, CampaignRepository::OFFERS, 'spsg_order_bumps' ] as $table ) {
			$wpdb->query( "TRUNCATE TABLE {$wpdb->prefix}{$table}" ); // phpcs:ignore WordPress.DB
		}

		$this->pro = true;
		add_filter(
			'storegrowth_pro_is_active',
			function () {
				return $this->pro;
			}
		);

		delete_option( OfferLimits::CHOICES_OPTION );
		CampaignRepository::flush();
		OfferLimits::flush();
	}

	/**
	 * Leave the cart and price hooks as they were.
	 *
	 * @return void
	 */
	public function tearDown(): void {
		remove_all_filters( 'storegrowth_pro_is_active' );
		remove_all_filters( 'woocommerce_product_get_price' );
		remove_all_actions( 'woocommerce_before_calculate_totals' );
		CampaignRepository::flush();
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
	 * Store a campaign.
	 *
	 * @param string      $status Stored status.
	 * @param string|null $start  Start.
	 * @param string|null $end    End.
	 *
	 * @return int
	 */
	private function campaign( string $status = 'scheduled', ?string $start = self::START, ?string $end = self::END ): int {
		return (int) CampaignRepository::save(
			[
				'name'      => 'Black Friday',
				'status'    => $status,
				'starts_at' => $start,
				'ends_at'   => $end,
			]
		);
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
	 * Draft and scheduled campaigns leave the everyday version running.
	 *
	 * @return void
	 */
	public function test_draft_and_scheduled_keep_the_everyday_version(): void {
		$bump = $this->bump();

		CampaignRepository::attach( $this->campaign( 'draft' ), OfferVersions::ORDER_BUMP, $bump, [ 'offer_amount' => 40 ] );

		foreach ( self::TIMES as $time ) {
			$result = $this->effective_bump( $bump, $time );
			$this->assertSame( OfferVersions::EVERYDAY, $result['version'], $time );
			$this->assertSame( 0, $result['promotion_id'], $time );
			$this->assertEquals( 25, $result['values']['offer_amount'], $time );
			$this->assertTrue( $result['live'], $time );
		}

		$scheduled = $this->bump();
		CampaignRepository::attach( $this->campaign(), OfferVersions::ORDER_BUMP, $scheduled, [ 'offer_amount' => 40 ] );

		$before = $this->effective_bump( $scheduled, '2026-11-26 10:00' );
		$this->assertSame( OfferVersions::EVERYDAY, $before['version'] );
		$this->assertEquals( 25, $before['values']['offer_amount'] );
	}

	/**
	 * The campaign's version applies inside the window only.
	 *
	 * @return void
	 */
	public function test_campaign_version_applies_only_during_its_window(): void {
		$bump     = $this->bump();
		$campaign = $this->campaign();

		CampaignRepository::attach( $campaign, OfferVersions::ORDER_BUMP, $bump, [ 'offer_amount' => 40 ] );

		$during = $this->effective_bump( $bump, '2026-11-28 10:00' );
		$this->assertSame( OfferVersions::CAMPAIGN, $during['version'] );
		$this->assertSame( $campaign, $during['promotion_id'] );
		$this->assertEquals( 40, $during['values']['offer_amount'] );
		$this->assertTrue( $during['live'] );

		$this->assertSame( OfferVersions::CAMPAIGN, $this->effective_bump( $bump, '2026-12-01 23:59:30' )['version'] );
		$this->assertSame( OfferVersions::EVERYDAY, $this->effective_bump( $bump, '2026-12-02 00:00:00' )['version'] );
		$this->assertEquals( 25, $this->effective_bump( $bump, '2026-12-02 10:00' )['values']['offer_amount'] );
	}

	/**
	 * Pausing, or going back to draft, brings the everyday version back.
	 *
	 * @return void
	 */
	public function test_paused_or_draft_campaign_hands_back(): void {
		$bump     = $this->bump();
		$campaign = $this->campaign();

		CampaignRepository::attach( $campaign, OfferVersions::ORDER_BUMP, $bump, [ 'offer_amount' => 40 ] );

		foreach ( [ 'paused', 'draft' ] as $status ) {
			CampaignRepository::save( [ 'status' => $status ], $campaign );

			foreach ( self::TIMES as $time ) {
				$this->assertSame( OfferVersions::EVERYDAY, $this->effective_bump( $bump, $time )['version'], $status . ' ' . $time );
			}
		}
	}

	/**
	 * Attached to two campaigns that don't overlap: each applies in its own window.
	 *
	 * @return void
	 */
	public function test_each_of_several_campaigns_applies_in_its_own_window(): void {
		$bump         = $this->bump();
		$black_friday = $this->campaign();
		$christmas    = $this->campaign( 'scheduled', '2026-12-20 00:00', '2026-12-26 23:59' );

		CampaignRepository::attach( $black_friday, OfferVersions::ORDER_BUMP, $bump, [ 'offer_amount' => 40 ] );
		CampaignRepository::attach( $christmas, OfferVersions::ORDER_BUMP, $bump, [ 'offer_amount' => 50 ] );

		$this->assertSame( $black_friday, $this->effective_bump( $bump, '2026-11-28 10:00' )['promotion_id'] );
		$this->assertSame( 0, $this->effective_bump( $bump, '2026-12-10 10:00' )['promotion_id'] );

		$christmas_day = $this->effective_bump( $bump, '2026-12-25 10:00' );
		$this->assertSame( $christmas, $christmas_day['promotion_id'] );
		$this->assertEquals( 50, $christmas_day['values']['offer_amount'] );
	}

	/**
	 * Status follows the clock.
	 *
	 * @return void
	 */
	public function test_status_follows_the_clock(): void {
		$campaign = CampaignRepository::get( $this->campaign() );

		$this->assertSame( 'scheduled', CampaignRepository::status_at( $campaign, $this->moment( '2026-11-26 10:00' ) ) );
		$this->assertSame( 'running', CampaignRepository::status_at( $campaign, $this->moment( '2026-11-28 10:00' ) ) );
		$this->assertSame( 'ended', CampaignRepository::status_at( $campaign, $this->moment( '2026-12-02 10:00' ) ) );

		$no_start = CampaignRepository::get( $this->campaign( 'scheduled', null, null ) );
		$this->assertSame( 'scheduled', CampaignRepository::status_at( $no_start, $this->moment( '2026-11-28 10:00' ) ) );

		$paused = CampaignRepository::get( $this->campaign( 'paused' ) );
		$this->assertSame( 'paused', CampaignRepository::status_at( $paused, $this->moment( '2026-11-28 10:00' ) ) );
		$this->assertSame( 'ended', CampaignRepository::status_at( $paused, $this->moment( '2026-12-02 10:00' ) ) );
	}

	/**
	 * Deleting a campaign removes its versions and campaign-only offers.
	 *
	 * @return void
	 */
	public function test_delete_removes_versions_and_campaign_only_offers(): void {
		$bump     = $this->bump();
		$campaign = $this->campaign();

		CampaignRepository::attach( $campaign, OfferVersions::ORDER_BUMP, $bump, [ 'offer_amount' => 40 ] );
		$only = CampaignRepository::add_campaign_only( $campaign, OfferVersions::ORDER_BUMP, [ 'name' => 'Only' ] );

		$this->assertTrue( CampaignRepository::delete( $campaign ) );

		$this->assertSame( [], CampaignRepository::get_offers( $campaign ) );
		$this->assertNull( CampaignRepository::find_offer_row( $only ) );

		foreach ( self::TIMES as $time ) {
			$this->assertSame( OfferVersions::EVERYDAY, $this->effective_bump( $bump, $time )['version'], $time );
		}
	}

	/**
	 * An offer that's off runs only inside its campaign's window.
	 *
	 * @return void
	 */
	public function test_campaign_switches_on_an_offer_that_is_off(): void {
		$bump = $this->bump( [ 'status' => 'inactive' ] );

		CampaignRepository::attach( $this->campaign(), OfferVersions::ORDER_BUMP, $bump );

		$this->assertFalse( $this->effective_bump( $bump, '2026-11-26 10:00' )['live'] );

		$during = $this->effective_bump( $bump, '2026-11-28 10:00' );
		$this->assertTrue( $during['live'] );
		$this->assertSame( 'active', $during['values']['status'] );

		$this->assertFalse( $this->effective_bump( $bump, '2026-12-02 10:00' )['live'] );
	}

	/**
	 * The campaign's window replaces the offer's own weekdays.
	 *
	 * @return void
	 */
	public function test_campaign_window_replaces_the_offer_schedule(): void {
		// 2026-11-28 is a Saturday.
		$bump = $this->bump( [ 'design_settings' => [ 'bump_schedule' => [ 'monday' ] ] ] );

		$this->assertFalse( $this->effective_bump( $bump, '2026-11-28 10:00' )['live'] );

		CampaignRepository::attach( $this->campaign(), OfferVersions::ORDER_BUMP, $bump );

		$this->assertTrue( $this->effective_bump( $bump, '2026-11-28 10:00' )['live'] );
	}

	/**
	 * Free or expired: no campaign applies, before, during or after.
	 *
	 * @return void
	 */
	public function test_without_a_licence_no_campaign_takes_effect(): void {
		$this->pro = false;

		$bump     = $this->bump();
		$campaign = $this->campaign();

		CampaignRepository::attach( $campaign, OfferVersions::ORDER_BUMP, $bump, [ 'offer_amount' => 40 ] );
		$only = CampaignRepository::add_campaign_only( $campaign, OfferVersions::ORDER_BUMP, [ 'status' => 'active' ] );

		foreach ( self::TIMES as $time ) {
			$result = $this->effective_bump( $bump, $time );
			$this->assertSame( OfferVersions::EVERYDAY, $result['version'], $time );
			$this->assertEquals( 25, $result['values']['offer_amount'], $time );

			$offline = OfferVersions::effective_offer(
				array_merge( CampaignRepository::find_offer_row( $only )['values'], [ 'offer_kind' => OfferVersions::ORDER_BUMP ] ),
				$this->moment( $time )
			);
			$this->assertFalse( $offline['live'], $time );
		}
	}

	/**
	 * A campaign-only offer is live only during its campaign.
	 *
	 * @return void
	 */
	public function test_campaign_only_offer_is_offline_outside_its_window(): void {
		$campaign = $this->campaign();
		$row      = CampaignRepository::add_campaign_only( $campaign, OfferVersions::ORDER_BUMP, [ 'status' => 'active' ] );
		$offer    = array_merge( CampaignRepository::find_offer_row( $row )['values'], [ 'offer_kind' => OfferVersions::ORDER_BUMP ] );

		$this->assertFalse( OfferVersions::effective_offer( $offer, $this->moment( '2026-11-26 10:00' ) )['live'] );

		$during = OfferVersions::effective_offer( $offer, $this->moment( '2026-11-28 10:00' ) );
		$this->assertTrue( $during['live'] );
		$this->assertSame( OfferVersions::CAMPAIGN, $during['version'] );
		$this->assertSame( $campaign, $during['promotion_id'] );

		$this->assertFalse( OfferVersions::effective_offer( $offer, $this->moment( '2026-12-02 10:00' ) )['live'] );
	}

	/**
	 * The overlap rule: ended campaigns and campaigns without dates don't count.
	 *
	 * @return void
	 */
	public function test_overlap_rule(): void {
		$bump  = $this->bump();
		$first = $this->campaign( 'scheduled', '2099-11-27 00:00', '2099-12-01 23:59' );

		CampaignRepository::attach( $first, OfferVersions::ORDER_BUMP, $bump );

		$overlapping = $this->campaign( 'draft', '2099-12-01 00:00', '2099-12-05 00:00' );
		$this->assertSame( 'spsg_campaign_overlap', CampaignRepository::attach( $overlapping, OfferVersions::ORDER_BUMP, $bump )->get_error_code() );

		$later = $this->campaign( 'draft', '2099-12-02 00:00', '2099-12-05 00:00' );
		$this->assertIsInt( CampaignRepository::attach( $later, OfferVersions::ORDER_BUMP, $bump ) );

		$no_dates = $this->campaign( 'draft', null, null );
		$this->assertIsInt( CampaignRepository::attach( $no_dates, OfferVersions::ORDER_BUMP, $bump ) );
		$this->assertSame( 'spsg_campaign_overlap', CampaignRepository::save( [ 'starts_at' => '2099-11-28 00:00' ], $no_dates )->get_error_code() );

		$ended_bump = $this->bump();
		CampaignRepository::attach( $this->campaign( 'scheduled', '2020-01-01 00:00', '2020-01-02 00:00' ), OfferVersions::ORDER_BUMP, $ended_bump );
		$this->assertNull( CampaignRepository::find_overlap( OfferVersions::ORDER_BUMP, $ended_bump, '2020-01-01 12:00', '2020-01-03 00:00' ) );
	}

	/**
	 * A campaign with no end overlaps everything starting after it begins.
	 *
	 * @return void
	 */
	public function test_campaign_with_no_end_overlaps_later_campaigns(): void {
		$bump = $this->bump();

		CampaignRepository::attach( $this->campaign( 'scheduled', '2030-01-01 00:00', null ), OfferVersions::ORDER_BUMP, $bump );

		$this->assertNotNull( CampaignRepository::find_overlap( OfferVersions::ORDER_BUMP, $bump, '2031-06-01 00:00', '2031-06-02 00:00' ) );
		$this->assertNull( CampaignRepository::find_overlap( OfferVersions::ORDER_BUMP, $bump, '2029-06-01 00:00', '2029-06-02 00:00' ) );
	}

	/**
	 * The gloves example: $24, $19.20, $24, and $22.40 after the edit.
	 *
	 * @return void
	 */
	public function test_gloves_example(): void {
		$bump = $this->bump();

		CampaignRepository::attach( $this->campaign(), OfferVersions::ORDER_BUMP, $bump, [ 'offer_amount' => 40 ] );

		$price = function ( string $time ) use ( $bump ): float {
			$values = $this->effective_bump( $bump, $time )['values'];

			return OrderBump::calculate_offer_price( $values['offer_type'], 32, $values['offer_amount'] );
		};

		$this->assertSame( 24.0, $price( '2026-11-26 10:00' ) );
		$this->assertSame( 19.2, $price( '2026-11-28 10:00' ) );
		$this->assertSame( 24.0, $price( '2026-12-02 10:00' ) );

		( new OrderBumpData() )->update( $bump, [ 'offer_amount' => 30 ] );

		$this->assertSame( 19.2, $price( '2026-11-28 10:00' ) );
		$this->assertSame( 22.4, $price( '2026-12-02 10:00' ) );
	}

	/**
	 * The gloves through a real cart, with the product's own Countdown.
	 *
	 * @return void
	 */
	public function test_gloves_through_the_cart(): void {
		WC()->cart->empty_cart();
		add_filter( 'woocommerce_product_get_price', [ new CommonHooks(), 'get_product_price' ], 10, 2 );
		add_action( 'woocommerce_before_calculate_totals', [ new OrderBump(), 'woocommerce_custom_price_to_cart_item' ] );

		$jacket = $this->create_product( 120 );
		$gloves = $this->create_product( 40 );

		update_post_meta( $gloves->get_id(), '_spsg_countdown_timer_discount_amount', 20 );
		update_post_meta( $gloves->get_id(), '_spsg_countdown_timer_discount_start', gmdate( 'Y-m-d', time() - 30 * DAY_IN_SECONDS ) );
		update_post_meta( $gloves->get_id(), '_spsg_countdown_timer_discount_end', gmdate( 'Y-m-d', time() + 30 * DAY_IN_SECONDS ) );

		$bump = $this->bump(
			[
				'offer_product_id' => $gloves->get_id(),
				'target_products'  => [ $jacket->get_id() ],
			]
		);

		WC()->cart->add_to_cart( $jacket->get_id() );
		$key = WC()->cart->add_to_cart( $gloves->get_id(), 1, 0, [], [ '_spsg_order_bump_product' => true ] );

		$line_total = static function () use ( $key ): float {
			WC()->cart->calculate_totals();

			return (float) WC()->cart->get_cart_item( $key )['line_total'];
		};

		$campaign = $this->campaign( 'scheduled', gmdate( 'Y-m-d H:i', time() + 2 * DAY_IN_SECONDS ), gmdate( 'Y-m-d H:i', time() + 4 * DAY_IN_SECONDS ) );
		CampaignRepository::attach( $campaign, OfferVersions::ORDER_BUMP, $bump, [ 'offer_amount' => 40 ] );
		$this->assertSame( 24.0, $line_total(), 'before' );

		CampaignRepository::save(
			[
				'starts_at' => gmdate( 'Y-m-d H:i', time() - 2 * DAY_IN_SECONDS ),
				'ends_at'   => gmdate( 'Y-m-d H:i', time() + 2 * DAY_IN_SECONDS ),
			],
			$campaign
		);
		$this->assertSame( 19.2, $line_total(), 'during' );
		$this->assertSame( 19.2, $line_total(), 'repeat calculation' );

		( new OrderBumpData() )->update( $bump, [ 'offer_amount' => 30 ] );
		$this->assertSame( 19.2, $line_total(), 'everyday edit during' );

		CampaignRepository::save(
			[
				'starts_at' => gmdate( 'Y-m-d H:i', time() - 4 * DAY_IN_SECONDS ),
				'ends_at'   => gmdate( 'Y-m-d H:i', time() - 2 * DAY_IN_SECONDS ),
			],
			$campaign
		);
		$this->assertSame( 22.4, $line_total(), 'after' );
	}

	/**
	 * A bump that's off reaches the checkout only during its campaign.
	 *
	 * @return void
	 */
	public function test_matching_bumps_include_a_switched_off_bump_during_its_campaign(): void {
		$data = new OrderBumpData();
		$bump = $this->bump(
			[
				'status'          => 'inactive',
				'target_products' => [ 7 ],
			]
		);

		$this->assertSame( [], $data->get_matching_bumps( [ 7 ], [] ) );

		CampaignRepository::attach(
			$this->campaign( 'scheduled', gmdate( 'Y-m-d H:i', time() - DAY_IN_SECONDS ), gmdate( 'Y-m-d H:i', time() + DAY_IN_SECONDS ) ),
			OfferVersions::ORDER_BUMP,
			$bump,
			[ 'offer_amount' => 40 ]
		);

		$matching = $data->get_matching_bumps( [ 7 ], [] );

		$this->assertCount( 1, $matching );
		$this->assertEquals( 40, $matching[0]['offer_amount'] );
	}

	/**
	 * A campaign-only bump stored with few values can't break the checkout.
	 *
	 * @return void
	 */
	public function test_sparse_campaign_only_bump_is_safe(): void {
		CampaignRepository::add_campaign_only( $this->running_campaign(), OfferVersions::ORDER_BUMP, [ 'name' => 'Sparse' ] );

		$this->assertSame( [], ( new OrderBumpData() )->get_matching_bumps( [ 7 ], [ 3 ] ) );
	}

	/**
	 * The stored offer is exactly the same after a campaign's whole life.
	 *
	 * @return void
	 */
	public function test_everyday_row_is_unchanged_by_a_campaign(): void {
		$bump     = $this->bump();
		$before   = $this->bump_row( $bump );
		$campaign = $this->campaign( 'scheduled', gmdate( 'Y-m-d H:i', time() - DAY_IN_SECONDS ), gmdate( 'Y-m-d H:i', time() + DAY_IN_SECONDS ) );

		CampaignRepository::attach( $campaign, OfferVersions::ORDER_BUMP, $bump, [ 'offer_amount' => 40 ] );
		$this->effective_bump( $bump, 'now' );
		$this->assertSame( $before, $this->bump_row( $bump ), 'running' );

		CampaignRepository::save( [ 'status' => 'paused' ], $campaign );
		$this->assertSame( $before, $this->bump_row( $bump ), 'paused' );

		CampaignRepository::save(
			[
				'status'    => 'scheduled',
				'starts_at' => gmdate( 'Y-m-d H:i', time() - 2 * DAY_IN_SECONDS ),
				'ends_at'   => gmdate( 'Y-m-d H:i', time() - DAY_IN_SECONDS ),
			],
			$campaign
		);
		$this->effective_bump( $bump, 'now' );
		$this->assertSame( $before, $this->bump_row( $bump ), 'ended' );

		CampaignRepository::delete( $campaign );
		$this->assertSame( $before, $this->bump_row( $bump ), 'deleted' );
	}

	/**
	 * Rows are read once per request.
	 *
	 * @return void
	 */
	public function test_campaign_rows_are_cached_per_request(): void {
		global $wpdb;

		$bump = $this->bump();
		CampaignRepository::attach( $this->campaign(), OfferVersions::ORDER_BUMP, $bump );
		$this->effective_bump( $bump, '2026-11-28 10:00' );

		$offer   = array_merge( ( new OrderBumpData() )->get_by_id( $bump ), [ 'offer_kind' => OfferVersions::ORDER_BUMP ] );
		$queries = $wpdb->num_queries;

		for ( $i = 0; $i < 5; $i++ ) {
			OfferVersions::effective_offer( $offer, $this->moment( '2026-11-28 10:00' ) );
		}

		$this->assertSame( $queries, $wpdb->num_queries );
	}

	/**
	 * Before the update runs there are no campaigns, and nothing breaks.
	 *
	 * @return void
	 */
	public function test_works_before_the_tables_exist(): void {
		$version = get_option( CampaignRepository::VERSION_OPTION );

		delete_option( CampaignRepository::VERSION_OPTION );
		CampaignRepository::flush();

		global $wpdb;
		$errors = $wpdb->suppress_errors( false );

		$bump   = $this->bump();
		$result = $this->effective_bump( $bump, '2026-11-28 10:00' );

		$this->assertSame( OfferVersions::EVERYDAY, $result['version'] );
		$this->assertTrue( $result['live'] );
		$this->assertNull( CampaignRepository::get( 1 ) );
		$this->assertSame( [], CampaignRepository::running_offers( OfferVersions::BOGO, $this->moment( '2026-11-28 10:00' ) ) );

		$wpdb->suppress_errors( $errors );
		update_option( CampaignRepository::VERSION_OPTION, $version, false );
	}

	/**
	 * Clone: a draft with empty dates, every offer copied.
	 *
	 * @return void
	 */
	public function test_clone_copies_offers_into_a_dateless_draft(): void {
		$bump     = $this->bump();
		$campaign = $this->campaign();

		CampaignRepository::attach( $campaign, OfferVersions::ORDER_BUMP, $bump, [ 'offer_amount' => 40 ] );
		$original_only = CampaignRepository::add_campaign_only(
			$campaign,
			OfferVersions::BOGO,
			[
				'type'       => 'product',
				'product_id' => 5,
			]
		);

		$copy_id = CampaignRepository::duplicate( $campaign );
		$copy    = CampaignRepository::get( $copy_id );

		$this->assertSame( 'draft', $copy['status'] );
		$this->assertNull( $copy['starts_at'] );
		$this->assertNull( $copy['ends_at'] );

		$offers = CampaignRepository::get_offers( $copy_id );

		$this->assertCount( 2, $offers );
		$this->assertSame( $bump, $offers[0]['offer_id'] );
		$this->assertEquals( [ 'offer_amount' => 40 ], $offers[0]['overrides'] );
		$this->assertSame( 0, $offers[1]['offer_id'] );
		$this->assertNotEquals( $original_only, $offers[1]['id'] );
		$this->assertSame( 5, $offers[1]['overrides']['product_id'] );
	}

	/**
	 * Boundary recompute saves the next start or end.
	 *
	 * @return void
	 */
	public function test_next_boundary(): void {
		$this->campaign();
		$this->campaign( 'draft', '2026-11-20 00:00', null );

		$now = $this->moment( '2026-11-26 10:00' );

		$this->assertSame( $this->moment( '2026-11-27 00:00' )->getTimestamp(), CampaignRepository::next_boundary( $now )->getTimestamp() );
		$this->assertSame( $this->moment( '2026-12-01 23:59:59' )->getTimestamp(), CampaignRepository::next_boundary( $this->moment( '2026-11-28 10:00' ) )->getTimestamp() );
		$this->assertNull( CampaignRepository::next_boundary( $this->moment( '2026-12-02 10:00' ) ) );

		$this->assertSame( $this->moment( '2026-11-27 00:00' )->getTimestamp(), CampaignRepository::recompute_boundary( $now ) );
		$this->assertSame( $this->moment( '2026-11-27 00:00' )->getTimestamp(), (int) get_option( CampaignRepository::BOUNDARY_OPTION ) );

		$this->assertNull( CampaignRepository::recompute_boundary( $this->moment( '2026-12-02 10:00' ) ) );
		$this->assertFalse( get_option( CampaignRepository::BOUNDARY_OPTION ) );
	}

	/**
	 * A window around today, for code that reads the real clock.
	 *
	 * @return int Campaign id.
	 */
	private function running_campaign(): int {
		return $this->campaign( 'scheduled', gmdate( 'Y-m-d H:i', time() - DAY_IN_SECONDS ), gmdate( 'Y-m-d H:i', time() + DAY_IN_SECONDS ) );
	}

	/**
	 * A campaign-only product rule goes on a product that already has an
	 * everyday rule, and wins only during its campaign.
	 *
	 * @return void
	 */
	public function test_campaign_only_product_rule_beside_an_everyday_rule(): void {
		BogoDataManager::save_product_bogo_settings(
			55,
			0,
			[
				'get_different_product_field' => 66,
				'discount_amount'             => 10,
				'offer_type'                  => 'discount',
			]
		);

		$rule = [
			'type'             => 'product',
			'product_id'       => 55,
			'offer_type'       => 'discount',
			'discount_amount'  => 50,
			'offer_product_id' => 77,
		];

		$scheduled = $this->campaign( 'scheduled', gmdate( 'Y-m-d H:i', time() + DAY_IN_SECONDS ), gmdate( 'Y-m-d H:i', time() + 2 * DAY_IN_SECONDS ) );
		$this->assertIsInt( CampaignRepository::add_campaign_only( $scheduled, OfferVersions::BOGO, $rule ) );

		$this->assertEquals( 10, BogoHelper::get_product_bogo_settings_for_cart( 55 )['discount_amount'] );

		CampaignRepository::add_campaign_only( $this->running_campaign(), OfferVersions::BOGO, $rule );

		$running = BogoHelper::get_product_bogo_settings_for_cart( 55 );

		$this->assertEquals( 50, $running['discount_amount'] );
		$this->assertSame( 77, (int) $running['get_different_product_field'] );
		$this->assertSame( 0, $running['id'] );
		$this->assertSame( 50.0, (float) BogoValidator::get_product_bogo_settings( 55 )['discount_amount'] );
		$this->assertTrue( BogoValidator::is_offer_live( $running ) );
	}

	/**
	 * The product-tab reader stays on the everyday values during a campaign.
	 *
	 * @return void
	 */
	public function test_admin_reader_never_sees_campaign_values(): void {
		BogoDataManager::save_product_bogo_settings(
			56,
			0,
			[
				'get_different_product_field' => 66,
				'discount_amount'             => 10,
				'offer_type'                  => 'discount',
			]
		);

		$rule = BogoHelper::get_product_bogo_settings( 56, 0, [ 'status' => false ] );

		CampaignRepository::attach( $this->running_campaign(), OfferVersions::BOGO, (int) $rule['id'], [ 'discount_amount' => 50 ] );

		$this->assertEquals( 50, BogoHelper::get_product_bogo_settings_for_cart( 56 )['discount_amount'] );
		$this->assertEquals( 10, BogoHelper::get_product_bogo_settings( 56, 0, [ 'status' => false ] )['discount_amount'] );
	}

	/**
	 * An "only with coupon" rule never applies by itself, campaign or not,
	 * and the mark survives a product tab save.
	 *
	 * @return void
	 */
	public function test_only_with_coupon_rule_is_held_back(): void {
		$settings = [
			'get_different_product_field' => 66,
			'offer_type'                  => 'free',
		];

		BogoDataManager::save_product_bogo_settings( 57, 0, $settings );

		$rule = BogoHelper::get_product_bogo_settings_for_cart( 57 );
		$this->assertTrue( BogoValidator::is_offer_live( $rule ) );

		BogoDataManager::set_only_with_coupon( (int) $rule['id'], true );
		BogoDataManager::save_product_bogo_settings( 57, 0, $settings );

		$rule = BogoHelper::get_product_bogo_settings_for_cart( 57 );
		$this->assertTrue( $rule[ BogoDataManager::ONLY_WITH_COUPON ] );
		$this->assertFalse( BogoValidator::is_offer_live( $rule ) );

		$effective = OfferVersions::effective_offer( array_merge( $rule, [ 'offer_kind' => OfferVersions::BOGO ] ) );
		$this->assertFalse( $effective['live'] );
		$this->assertSame( 'Paused: needs Smart Coupons', $effective['chip'] );

		CampaignRepository::attach( $this->running_campaign(), OfferVersions::BOGO, (int) $rule['id'] );
		$this->assertFalse( BogoValidator::is_offer_live( BogoHelper::get_product_bogo_settings_for_cart( 57 ) ) );

		$unlock = static function () {
			return true;
		};
		add_filter( 'spsg_bogo_coupon_unlocks_rule', $unlock );
		$this->assertTrue( BogoValidator::is_offer_live( $rule ) );
		remove_filter( 'spsg_bogo_coupon_unlocks_rule', $unlock );
	}

	/**
	 * Keeping a campaign-only offer makes it an everyday offer that's off;
	 * a product with a rule of its own can't take another.
	 *
	 * @return void
	 */
	public function test_keep_as_everyday(): void {
		$campaign = $this->campaign();
		$row      = CampaignRepository::add_campaign_only(
			$campaign,
			OfferVersions::ORDER_BUMP,
			[
				'name'             => 'Kept',
				'offer_product_id' => 12,
				'status'           => 'active',
			]
		);

		$this->assertTrue( CampaignRepository::remove_offer( $row, true ) );
		$this->assertNull( CampaignRepository::find_offer_row( $row ) );

		$kept = ( new OrderBumpData() )->get_all( [ 'status' => 'inactive' ] );
		$this->assertCount( 1, $kept );
		$this->assertSame( 'Kept', $kept[0]['name'] );

		BogoDataManager::save_product_bogo_settings( 58, 0, [ 'offer_type' => 'free' ] );

		$conflict = CampaignRepository::add_campaign_only(
			$campaign,
			OfferVersions::BOGO,
			[
				'type'       => 'product',
				'product_id' => 58,
			]
		);

		$this->assertSame( 'spsg_campaign_offer_keep_conflict', CampaignRepository::remove_offer( $conflict, true )->get_error_code() );
		$this->assertNotNull( CampaignRepository::find_offer_row( $conflict ) );

		$this->assertTrue( CampaignRepository::remove_offer( $conflict ) );
		$this->assertNull( CampaignRepository::find_offer_row( $conflict ) );
	}

	/**
	 * Free: only active bumps count when creating.
	 *
	 * @return void
	 */
	public function test_switched_off_bumps_do_not_count_towards_the_limit(): void {
		$this->pro = false;
		$data      = new OrderBumpData();

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
		$this->pro = false;

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
		$this->pro = false;

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
		$this->pro = false;

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

	/**
	 * A gift from a rule that's off lasts through its campaign: added, kept
	 * and priced over repeated totals, gone when the campaign is paused.
	 *
	 * @return void
	 */
	public function test_campaign_gift_is_added_kept_and_removed(): void {
		WC()->cart->empty_cart();
		wc_clear_notices();
		add_action( 'woocommerce_before_calculate_totals', [ OrderBogo::instance(), 'woocommerce_custom_price_to_cart_item' ] );

		$trigger = $this->create_product( 95 );
		$gift    = $this->create_product( 40 );
		$offer   = $this->create_global_offer(
			[
				'name_of_order_bogo'          => 'Gift',
				'status'                      => 'inactive',
				'offered_products'            => [ $trigger->get_id() ],
				'get_different_product_field' => $gift->get_id(),
				'offer_product_id'            => $gift->get_id(),
			]
		);

		$campaign = $this->running_campaign();
		CampaignRepository::attach(
			$campaign,
			OfferVersions::BOGO,
			$offer,
			[
				'offer_type'      => 'discount',
				'discount_amount' => 50,
			]
		);

		$trigger_key = WC()->cart->add_to_cart( $trigger->get_id() );
		$settings    = BogoHelper::prepare_bogo_settings( $trigger->get_id(), $trigger->get_id(), 0 );

		$this->assertEquals( 50, $settings['discount_amount'] );

		OrderBogo::instance()->apply_bogo_product( $settings, $trigger->get_id(), $trigger_key, 1 );

		WC()->cart->calculate_totals();
		WC()->cart->calculate_totals();

		$this->assertCount( 2, WC()->cart->get_cart() );
		$this->assertSame( 115.0, (float) WC()->cart->get_cart_contents_total() );

		CampaignRepository::save( [ 'status' => 'paused' ], $campaign );
		WC()->cart->calculate_totals();

		$this->assertCount( 1, WC()->cart->get_cart() );
		$this->assertSame( 95.0, (float) WC()->cart->get_cart_contents_total() );
		wc_clear_notices();
	}
}
