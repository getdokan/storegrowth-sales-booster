<?php
/**
 * Campaigns admin and attribution (ADR-016).
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Test\Campaigns;

use DateTimeImmutable;
use StorePulse\StoreGrowth\Analytics\OfferLookup;
use StorePulse\StoreGrowth\Attribution\OfferAttribution;
use StorePulse\StoreGrowth\Campaigns\CampaignAttribution;
use StorePulse\StoreGrowth\Campaigns\CampaignPrice;
use StorePulse\StoreGrowth\Campaigns\CampaignReport;
use StorePulse\StoreGrowth\Campaigns\CampaignService;
use StorePulse\StoreGrowth\Campaigns\CampaignSurfaces;
use StorePulse\StoreGrowth\Campaigns\CartNotices;
use StorePulse\StoreGrowth\Campaigns\Readiness;
use StorePulse\StoreGrowth\Modules\CountdownTimer\CommonHooks;
use StorePulse\StoreGrowth\Offers\CampaignRepository;
use StorePulse\StoreGrowth\Offers\OfferVersions;
use StorePulse\StoreGrowth\Pricing\Decision;
use StorePulse\StoreGrowth\Pricing\SmartCoupon;
use StorePulse\StoreGrowth\Support\SiteTime;
use StorePulse\StoreGrowth\Test\StoreGrowthTestCase;
use WC_Order;
use WP_REST_Request;

/**
 * Status by clock, readiness, delete, attribution, cart notices and licence
 * states.
 *
 * @group campaigns
 */
class CampaignsTest extends StoreGrowthTestCase {

	/**
	 * Set up.
	 *
	 * @return void
	 */
	public function setUp(): void {
		parent::setUp();

		global $wpdb;

		foreach ( [ CampaignRepository::CAMPAIGNS, CampaignRepository::OFFERS ] as $table ) {
			$wpdb->query( "TRUNCATE TABLE {$wpdb->prefix}{$table}" ); // phpcs:ignore WordPress.DB
		}

		CampaignRepository::install();
		CampaignRepository::flush();
		add_filter( 'storegrowth_pro_is_active', '__return_true' );
		$_COOKIE = [];
	}

	/**
	 * Tear down.
	 *
	 * @return void
	 */
	public function tearDown(): void {
		remove_all_filters( 'storegrowth_pro_is_active' );
		remove_all_filters( 'spsg_admin_header_info' );
		$_COOKIE = [];
		CampaignRepository::flush();
		parent::tearDown();
	}

	/**
	 * Create a campaign and return its id.
	 *
	 * @param array $data Values.
	 *
	 * @return int
	 */
	private function campaign( array $data = [] ): int {
		$id = CampaignRepository::save( array_merge( [ 'name' => 'Black Friday' ], $data ) );

		$this->assertIsInt( $id );

		return $id;
	}

	/**
	 * A campaign's status at a moment.
	 *
	 * @param int    $id  Campaign.
	 * @param string $now Local time.
	 *
	 * @return string
	 */
	private function status_at( int $id, string $now ): string {
		return CampaignRepository::status_at( CampaignRepository::get( $id ), new DateTimeImmutable( $now, wp_timezone() ) );
	}

	/**
	 * Draft -> Scheduled -> Running -> Ended by the clock in the site timezone.
	 *
	 * @return void
	 */
	public function test_status_follows_the_clock_in_the_site_timezone(): void {
		update_option( 'timezone_string', 'America/New_York' );

		$id = $this->campaign(
			[
				'starts_at' => '2026-11-27 00:00',
				'ends_at'   => '2026-12-01 23:59',
			]
		);

		$this->assertSame( 'draft', $this->status_at( $id, '2026-11-20 10:00' ) );

		CampaignRepository::save( [ 'status' => CampaignRepository::STATUS_SCHEDULED ], $id );

		$this->assertSame( 'scheduled', $this->status_at( $id, '2026-11-26 23:59' ) );
		$this->assertSame( 'running', $this->status_at( $id, '2026-11-27 00:01' ) );
		$this->assertSame( 'running', $this->status_at( $id, '2026-12-01 23:59' ) );
		$this->assertSame( 'ended', $this->status_at( $id, '2026-12-02 00:00' ) );

		update_option( 'timezone_string', '' );
	}

	/**
	 * Blocking readiness checks stop Publish.
	 *
	 * @return void
	 */
	public function test_readiness_blocks_without_a_start_or_with_nothing_attached(): void {
		$id    = $this->campaign();
		$codes = wp_list_pluck( Readiness::check( CampaignRepository::get( $id ) ), 'code' );

		$this->assertContains( 'no_start', $codes );
		$this->assertFalse( Readiness::can_publish( CampaignRepository::get( $id ) ) );

		$dated = $this->campaign(
			[
				'starts_at' => '2026-11-27 00:00',
				'ends_at'   => '2026-11-20 00:00',
			]
		);
		$this->assertContains( 'end_before_start', wp_list_pluck( Readiness::check( CampaignRepository::get( $dated ) ), 'code' ) );

		$empty = $this->campaign( [ 'starts_at' => '2026-11-27 00:00' ] );
		$this->assertContains( 'nothing_attached', wp_list_pluck( Readiness::check( CampaignRepository::get( $empty ) ), 'code' ) );
	}

	/**
	 * Publishing runs the readiness checks on the server and freezes the baseline.
	 *
	 * @return void
	 */
	public function test_publish_is_refused_when_blocked_and_freezes_baseline(): void {
		$id = $this->campaign();

		$this->assertTrue( is_wp_error( CampaignService::publish( $id ) ) );

		CampaignRepository::save(
			[
				'starts_at' => '2030-01-01 00:00',
				'settings'  => [ 'surfaces' => [ 'badge' => [ 'enabled' => true ] ] ],
			],
			$id
		);

		$this->assertSame( $id, CampaignService::publish( $id ) );

		$stored = CampaignRepository::get( $id );

		$this->assertSame( 'scheduled', $stored['status'] );
		$this->assertArrayHasKey( 'baseline', $stored['settings'] );
	}

	/**
	 * Overlap lines inform and warn; neither blocks saving.
	 *
	 * @return void
	 */
	public function test_overlap_warnings_never_block_saving(): void {
		$product  = $this->create_product();
		$scope    = [
			'settings' => [
				'campaign_price' => [
					'percent'  => 20,
					'products' => [ $product->get_id() ],
				],
			],
		];
		$one      = $this->campaign(
			array_merge(
				$scope,
				[
					'name'      => 'One',
					'starts_at' => '2030-01-01 00:00',
					'ends_at'   => '2030-01-10 00:00',
					'status'    => CampaignRepository::STATUS_SCHEDULED,
				]
			)
		);
		$two      = $this->campaign(
			array_merge(
				$scope,
				[
					'name'      => 'Two',
					'starts_at' => '2030-01-05 00:00',
					'ends_at'   => '2030-01-12 00:00',
				]
			)
		);
		$warnings = Readiness::overlaps( CampaignRepository::get( $two ) );

		$this->assertSame( 'price_overlap', $warnings[0]['code'] );
		$this->assertStringContainsString( 'One also discounts 1 products', $warnings[0]['message'] );
		$this->assertTrue( Readiness::can_publish( CampaignRepository::get( $one ) ) );
		$this->assertIsInt( CampaignRepository::save( [ 'name' => 'Two again' ], $two ) );

		$info = $this->campaign(
			[
				'name'      => 'Three',
				'starts_at' => '2030-01-02 00:00',
				'ends_at'   => '2030-01-03 00:00',
				'settings'  => [ 'products' => [ $product->get_id() ] ],
			]
		);
		$this->assertSame( 'shared_products', Readiness::overlaps( CampaignRepository::get( $info ) )[0]['code'] );
	}

	/**
	 * The overlap error names the offer, its campaign and the dates.
	 *
	 * @return void
	 */
	public function test_attach_overlap_is_blocked_with_the_message(): void {
		$bogo  = $this->create_global_offer( [ 'name_of_order_bogo' => 'Boots deal' ] );
		$first = $this->campaign(
			[
				'name'      => 'First',
				'starts_at' => '2030-01-01 00:00',
				'ends_at'   => '2030-01-10 00:00',
				'status'    => CampaignRepository::STATUS_SCHEDULED,
			]
		);
		CampaignRepository::attach( $first, OfferVersions::BOGO, $bogo );

		$second = $this->campaign(
			[
				'starts_at' => '2030-01-05 00:00',
				'ends_at'   => '2030-01-06 00:00',
			]
		);
		$result = CampaignRepository::attach( $second, OfferVersions::BOGO, $bogo );

		$this->assertTrue( is_wp_error( $result ) );
		$this->assertStringContainsString( 'Boots deal is already in First', $result->get_error_message() );
		$this->assertStringContainsString( "Campaign dates can't overlap for the same offer.", $result->get_error_message() );
	}

	/**
	 * Delete lists campaign-only offers and removes their coupon; everyday offers stay.
	 *
	 * @return void
	 */
	public function test_delete_removes_campaign_only_coupons_and_lists_them(): void {
		$bogo = $this->create_global_offer( [ 'name_of_order_bogo' => 'Keep me' ] );
		$id   = $this->campaign( [ 'starts_at' => '2030-01-01 00:00' ] );

		CampaignRepository::attach( $id, OfferVersions::BOGO, $bogo );
		CampaignRepository::add_campaign_only( $id, OfferVersions::ORDER_BUMP, [ 'name' => 'Bump only' ] );

		$coupon = $this->create_smart_coupon(
			'bf30',
			[
				'method' => 'automatic',
				'title'  => 'BF 30%',
			]
		);
		CampaignService::link_campaign_coupon( $coupon->get_id(), $id, 'BF 30%' );

		$this->assertEqualsCanonicalizing( [ 'Bump only', 'BF 30%' ], CampaignService::campaign_only_names( $id ) );

		$this->assertTrue( CampaignRepository::delete( $id ) );
		$this->assertSame( [], CampaignRepository::get_offers( $id ) );
		$this->assertFalse( get_post( $coupon->get_id() ) instanceof \WP_Post && 'shop_coupon' === get_post_type( $coupon->get_id() ) && 'publish' === get_post_status( $coupon->get_id() ) );
		$this->assertNotEmpty( \StorePulse\StoreGrowth\Modules\BoGo\BogoDataManager::get_bogo_offer( $bogo ), 'everyday offer stays' );
	}

	/**
	 * Clone copies a campaign-only coupon rather than sharing it.
	 *
	 * @return void
	 */
	public function test_clone_copies_campaign_only_coupon(): void {
		$id     = $this->campaign( [ 'starts_at' => '2030-01-01 00:00' ] );
		$coupon = $this->create_smart_coupon(
			'bf40',
			[
				'method' => 'automatic',
				'title'  => 'BF 40%',
			]
		);

		CampaignService::link_campaign_coupon( $coupon->get_id(), $id, 'BF 40%' );

		$clone = CampaignRepository::duplicate( $id );

		$this->assertIsInt( $clone );
		$this->assertNull( CampaignRepository::get( $clone )['starts_at'] );
		$rows = CampaignRepository::get_offers( $clone );

		$this->assertNotSame( $coupon->get_id(), (int) $rows[0]['overrides']['coupon_id'] );
	}

	/**
	 * A running campaign price credits the order and stamps it (referee first).
	 *
	 * @return void
	 */
	public function test_attribution_prefers_a_campaign_deal_and_stamps_the_order(): void {
		( new CommonHooks() )->register_hooks();

		$product = $this->create_product( 100 );
		$id      = $this->running_campaign_with_price( $product->get_id(), 20 );

		$this->assertSame( 20, CampaignPrice::for_product( $product->get_id() )['percent'] );
		$this->assertSame( $id, CampaignPrice::for_product( $product->get_id() )['promotion_id'] );

		WC()->cart->empty_cart();
		WC()->cart->add_to_cart( $product->get_id(), 1 );
		WC()->cart->calculate_totals();

		$credit = CampaignAttribution::credit_for_cart( WC()->cart );

		$this->assertSame( $id, $credit['promotion_id'] );
		$this->assertSame( 'offer', $credit['source'] );

		$order = new WC_Order();
		( new CampaignAttribution() )->stamp_order( $order );

		$this->assertSame( (string) $id, (string) $order->get_meta( OfferAttribution::PROMOTION_ID ) );
		$this->assertSame( 'offer', $order->get_meta( OfferAttribution::PROMOTION_SOURCE ) );

		WC()->cart->empty_cart();
	}

	/**
	 * One order, one campaign: the largest saving wins.
	 *
	 * @return void
	 */
	public function test_one_order_is_credited_to_one_campaign(): void {
		$credits = [
			9 => 30.0,
			4 => 10.0,
		];

		$decision = new Decision( [], [], [], [], [], $credits );

		$this->assertSame( 9, array_key_first( $decision->promotions() ) );
	}

	/**
	 * With a link cookie inside the window and a campaign product, the order is credited.
	 *
	 * @return void
	 */
	public function test_link_cookie_credits_within_the_window_only(): void {
		$product = $this->create_product( 50 );
		$id      = $this->campaign(
			[
				'starts_at' => SiteTime::now()->modify( '-1 hour' )->format( 'Y-m-d H:i:s' ),
				'status'    => CampaignRepository::STATUS_SCHEDULED,
				'settings'  => [ 'products' => [ $product->get_id() ] ],
			]
		);
		$slug    = CampaignRepository::get( $id )['slug'];

		WC()->cart->empty_cart();
		WC()->cart->add_to_cart( $product->get_id(), 1 );

		$_COOKIE[ CampaignAttribution::LINK_COOKIE ] = $slug . ':' . time() . ':badge';

		$credit = CampaignAttribution::credit_for_cart( WC()->cart );

		$this->assertSame( $id, $credit['promotion_id'] );
		$this->assertSame( 'link', $credit['source'] );

		$_COOKIE[ CampaignAttribution::LINK_COOKIE ] = $slug . ':' . ( time() - 8 * DAY_IN_SECONDS ) . ':badge';
		$this->assertNull( CampaignAttribution::credit_for_cart( WC()->cart ) );

		$_COOKIE = [];
		$this->assertNull( CampaignAttribution::credit_for_cart( WC()->cart ), 'no deal, no link: no stamp' );

		WC()->cart->empty_cart();
	}

	/**
	 * An order with no deal and no link isn't stamped.
	 *
	 * @return void
	 */
	public function test_no_deal_and_no_link_leaves_no_stamp(): void {
		WC()->cart->empty_cart();
		WC()->cart->add_to_cart( $this->create_product( 10 )->get_id(), 1 );

		$order = new WC_Order();
		( new CampaignAttribution() )->stamp_order( $order );

		$this->assertSame( '', $order->get_meta( OfferAttribution::PROMOTION_ID ) );

		WC()->cart->empty_cart();
	}

	/**
	 * The lookup row of a line takes the stamp from the parent order under Dokan.
	 *
	 * @return void
	 */
	public function test_lookup_reads_the_stamp_from_the_parent_order(): void {
		$parent = new WC_Order();
		$parent->update_meta_data( OfferAttribution::PROMOTION_ID, 7 );
		$parent->save();

		$child = new WC_Order();
		$child->set_parent_id( $parent->get_id() );
		$child->save();

		$this->assertSame( 7, OfferLookup::promotion_of( $child->get_id() )['promotion_id'] );
	}

	/**
	 * "Store during campaign" is hidden for always-on, draft and scheduled.
	 *
	 * @return void
	 */
	public function test_store_during_is_hidden_for_always_on_and_scheduled(): void {
		$start = SiteTime::now()->modify( '-2 days' );
		$now   = SiteTime::now();

		$this->assertNull( CampaignReport::store_during( [], 'running', $start, null, $now ), 'always on' );
		$this->assertNull( CampaignReport::store_during( [], 'draft', $start, $now, $now ) );
		$this->assertNull( CampaignReport::store_during( [], 'scheduled', $start, $now, $now ) );

		$numbers = CampaignReport::store_during( [ 'settings' => [ 'baseline' => [ 'revenue_per_day' => 0 ] ] ], 'running', $start, $now, $now );

		$this->assertArrayHasKey( 'revenue', $numbers );
		$this->assertNull( $numbers['change'], 'no baseline, no change figure' );
	}

	/**
	 * Reads work without Pro; writes don't.
	 *
	 * @return void
	 */
	public function test_licence_states_on_rest_routes(): void {
		wp_set_current_user( self::factory()->user->create( [ 'role' => 'administrator' ] ) );
		$id = $this->campaign( [ 'starts_at' => '2030-01-01 00:00' ] );

		remove_all_filters( 'storegrowth_pro_is_active' );
		add_filter(
			'spsg_admin_header_info',
			static function ( $info ) {
				return array_merge( (array) $info, [ 'license_state' => 'expired' ] );
			}
		);

		$server = rest_get_server();

		$read = $server->dispatch( new WP_REST_Request( 'GET', '/sales-booster/v1/campaigns' ) );
		$this->assertSame( 200, $read->get_status() );
		$this->assertTrue( $read->get_data()['expired'] );

		$write = $server->dispatch( new WP_REST_Request( 'POST', "/sales-booster/v1/campaigns/{$id}/publish" ) );
		$this->assertSame( 403, $write->get_status() );

		$this->assertEmpty( CampaignRepository::running(), 'no effect without pro' );
	}

	/**
	 * Cart notices per event, dropped once the cart was shown differently.
	 *
	 * @return void
	 */
	public function test_cart_notices_per_event(): void {
		$product = $this->create_product( 60 );
		$cart    = WC()->cart;
		$cart->empty_cart();
		$cart->add_to_cart( $product->get_id(), 1 );

		$notices = new CartNotices();

		$ended = $this->campaign(
			[
				'name'      => 'Ended one',
				'starts_at' => SiteTime::now()->modify( '-3 days' )->format( 'Y-m-d H:i:s' ),
				'ends_at'   => SiteTime::now()->modify( '-1 hour' )->format( 'Y-m-d H:i:s' ),
				'status'    => CampaignRepository::STATUS_SCHEDULED,
			]
		);
		$this->remember_cart( [ $ended => 'Ended one' ], time() - 7200 );
		wc_clear_notices();

		$notices->notify( new Decision(), $cart );
		$this->assertContains( 'Ended one ended. Prices updated.', wc_get_notices( 'notice' ) ? wp_list_pluck( wc_get_notices( 'notice' ), 'notice' ) : [] );

		wc_clear_notices();
		$paused = $this->campaign(
			[
				'name'      => 'Paused one',
				'starts_at' => SiteTime::now()->modify( '-1 day' )->format( 'Y-m-d H:i:s' ),
				'status'    => CampaignRepository::STATUS_PAUSED,
			]
		);
		$this->remember_cart( [ $paused => 'Paused one' ], time() - 3600 );
		$notices->notify( new Decision(), $cart );
		$this->assertContains( 'Paused one deal is no longer available. Prices updated.', wp_list_pluck( wc_get_notices( 'notice' ), 'notice' ) );

		wc_clear_notices();
		$this->remember_cart( [ 999 => 'Gone one' ], time() - 3600 );
		$notices->notify( new Decision(), $cart );
		$this->assertContains( 'Gone one deal is no longer available. Prices updated.', wp_list_pluck( wc_get_notices( 'notice' ), 'notice' ) );

		wc_clear_notices();
		$started = $this->campaign(
			[
				'name'      => 'Started one',
				'starts_at' => SiteTime::now()->modify( '-30 minutes' )->format( 'Y-m-d H:i:s' ),
				'status'    => CampaignRepository::STATUS_SCHEDULED,
			]
		);
		$this->remember_cart( [], time() - 7200 );
		$notices->notify( new Decision( [], [], [], [], [], [ $started => 5.0 ] ), $cart );
		$this->assertContains( 'Started one price applied.', wp_list_pluck( wc_get_notices( 'notice' ), 'notice' ) );

		wc_clear_notices();
		WC()->session->set( CartNotices::SESSION_KEY, null );
		$cart->empty_cart();
	}

	/**
	 * The Product Badge shows for a running campaign's products only.
	 *
	 * @return void
	 */
	public function test_badge_surface_shows_on_campaign_products(): void {
		wp_set_current_user( 0 );

		$product = $this->create_product();
		$other   = $this->create_product();

		$this->campaign(
			[
				'starts_at' => SiteTime::now()->modify( '-1 hour' )->format( 'Y-m-d H:i:s' ),
				'status'    => CampaignRepository::STATUS_SCHEDULED,
				'settings'  => [
					'surfaces' => [ CampaignSurfaces::BADGE => [ 'enabled' => true ] ],
					'products' => [ $product->get_id() ],
				],
			]
		);

		$this->assertNotNull( CampaignSurfaces::active( CampaignSurfaces::BADGE, [], $product->get_id() ) );
		$this->assertNull( CampaignSurfaces::active( CampaignSurfaces::BADGE, [], $other->get_id() ) );
	}

	/**
	 * A campaign deal wins over a link to another campaign.
	 *
	 * @return void
	 */
	public function test_attribution_prefers_the_deal_over_a_link(): void {
		( new CommonHooks() )->register_hooks();

		$product = $this->create_product( 100 );
		$deal    = $this->running_campaign_with_price( $product->get_id(), 20 );
		$linked  = $this->campaign(
			[
				'name'      => 'Linked',
				'starts_at' => SiteTime::now()->modify( '-1 hour' )->format( 'Y-m-d H:i:s' ),
				'status'    => CampaignRepository::STATUS_SCHEDULED,
				'settings'  => [ 'products' => [ $product->get_id() ] ],
			]
		);

		$_COOKIE[ CampaignAttribution::LINK_COOKIE ] = CampaignRepository::get( $linked )['slug'] . ':' . time() . ':';

		WC()->cart->empty_cart();
		WC()->cart->add_to_cart( $product->get_id(), 1 );
		WC()->cart->calculate_totals();

		$credit = CampaignAttribution::credit_for_cart( WC()->cart );

		$this->assertSame( $deal, $credit['promotion_id'] );
		$this->assertSame( 'offer', $credit['source'] );

		WC()->cart->empty_cart();
	}

	/**
	 * Attach, override through the record route, read the campaign version.
	 *
	 * @return void
	 */
	public function test_customising_an_attached_offer_applies_while_running(): void {
		wp_set_current_user( self::factory()->user->create( [ 'role' => 'administrator' ] ) );

		$bogo = $this->create_global_offer( [ 'name_of_order_bogo' => 'Boots deal' ] );
		$id   = $this->campaign(
			[
				'starts_at' => SiteTime::now()->modify( '-1 hour' )->format( 'Y-m-d H:i:s' ),
				'status'    => CampaignRepository::STATUS_SCHEDULED,
			]
		);
		$row  = CampaignRepository::attach( $id, OfferVersions::BOGO, $bogo );

		$request = new WP_REST_Request( 'POST', "/sales-booster/v1/campaigns/{$id}/records/bogo/{$row}" );
		$request->set_header( 'content-type', 'application/json' );
		$request->set_body( wp_json_encode( [ 'discount_amount' => 40 ] ) );

		$this->assertSame( 200, rest_get_server()->dispatch( $request )->get_status() );

		$effective = OfferVersions::effective_offer(
			array_merge(
				$this->bogo_settings( [ 'id' => $bogo ] ),
				[ 'offer_kind' => OfferVersions::BOGO ]
			)
		);

		$this->assertSame( OfferVersions::CAMPAIGN, $effective['version'] );
		$this->assertSame( 40, (int) $effective['values']['discount_amount'] );

		$wrong = new WP_REST_Request( 'GET', '/sales-booster/v1/campaigns/999999/records/bogo/' . $row );
		$this->assertSame( 404, rest_get_server()->dispatch( $wrong )->get_status() );
	}

	/**
	 * A stopped licence tells the cart the deal is gone.
	 *
	 * @return void
	 */
	public function test_cart_notice_when_the_licence_stops_a_campaign(): void {
		$cart = WC()->cart;
		$cart->empty_cart();
		$cart->add_to_cart( $this->create_product( 30 )->get_id(), 1 );

		$running = $this->campaign(
			[
				'name'      => 'Licensed one',
				'starts_at' => SiteTime::now()->modify( '-1 day' )->format( 'Y-m-d H:i:s' ),
				'status'    => CampaignRepository::STATUS_SCHEDULED,
			]
		);

		remove_all_filters( 'storegrowth_pro_is_active' );
		wc_clear_notices();
		$this->remember_cart( [ $running => 'Licensed one' ], time() - 3600 );

		( new CartNotices() )->notify( new Decision(), $cart );

		$this->assertContains( 'Licensed one deal is no longer available. Prices updated.', wp_list_pluck( wc_get_notices( 'notice' ), 'notice' ) );

		wc_clear_notices();
		WC()->session->set( CartNotices::SESSION_KEY, null );
		$cart->empty_cart();
	}

	/**
	 * The licence warning shows when the campaign outlasts the licence.
	 *
	 * @return void
	 */
	public function test_licence_warning_when_the_campaign_ends_after_expiry(): void {
		add_filter(
			'spsg_admin_header_info',
			static function ( $info ) {
				return array_merge( (array) $info, [ 'license_expires_at' => '2030-01-05' ] );
			}
		);

		$id = $this->campaign(
			[
				'starts_at' => '2030-01-01 00:00',
				'ends_at'   => '2030-02-01 00:00',
			]
		);

		$this->assertSame( 'licence_expiry', Readiness::licence( CampaignRepository::get( $id ) )[0]['code'] );

		$fits = $this->campaign(
			[
				'starts_at' => '2030-01-01 00:00',
				'ends_at'   => '2030-01-03 00:00',
			]
		);

		$this->assertSame( [], Readiness::licence( CampaignRepository::get( $fits ) ) );
	}

	/**
	 * A campaign-only offer is attributed through its campaign row.
	 *
	 * @return void
	 */
	public function test_campaign_only_offers_have_an_attribution_id(): void {
		$stamp = OfferAttribution::campaign_only_stamp( 'bogo', 12, 'free', 5.0 );

		$this->assertSame( 'bogo:co12', $stamp[ OfferAttribution::CAMPAIGN_ID ] );
		$this->assertSame( 'bogo', OfferLookup::module_of( $stamp[ OfferAttribution::CAMPAIGN_ID ] ) );
	}

	/**
	 * The Black Friday template creates a linked campaign-only coupon.
	 *
	 * @return void
	 */
	public function test_black_friday_template_creates_a_linked_coupon(): void {
		$id   = CampaignService::create_from_template( 'black-friday', 'BF' );
		$rows = CampaignRepository::get_offers( $id );

		$this->assertCount( 1, $rows );
		$this->assertSame( OfferVersions::SMART_COUPON, $rows[0]['offer_kind'] );

		$coupon = new \WC_Coupon( (int) $rows[0]['overrides']['coupon_id'] );

		$this->assertSame( $rows[0]['id'], (string) $coupon->get_meta( SmartCoupon::CAMPAIGN_OFFER ) );
	}

	/**
	 * Set the campaigns the cart was last priced with.
	 *
	 * @param array $promotions Campaign id => name.
	 * @param int   $at         When it was priced.
	 *
	 * @return void
	 */
	private function remember_cart( array $promotions, int $at ): void {
		WC()->session->set(
			CartNotices::SESSION_KEY,
			[
				'promotions' => $promotions,
				'at'         => $at,
			]
		);
	}

	/**
	 * A running campaign setting a price on one product.
	 *
	 * @param int $product_id Product.
	 * @param int $percent    Percent.
	 *
	 * @return int
	 */
	private function running_campaign_with_price( int $product_id, int $percent ): int {
		return $this->campaign(
			[
				'starts_at' => SiteTime::now()->modify( '-1 hour' )->format( 'Y-m-d H:i:s' ),
				'status'    => CampaignRepository::STATUS_SCHEDULED,
				'settings'  => [
					'campaign_price' => [
						'percent'  => $percent,
						'products' => [ $product_id ],
					],
				],
			]
		);
	}
}
