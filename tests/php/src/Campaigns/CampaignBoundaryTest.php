<?php
/**
 * Variation price ranges and campaign boundaries (#309).
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Test\Campaigns;

use DateTimeImmutable;
use StorePulse\StoreGrowth\Campaigns\CampaignBoundary;
use StorePulse\StoreGrowth\Campaigns\CampaignPrice;
use StorePulse\StoreGrowth\Modules\CountdownTimer\CommonHooks;
use StorePulse\StoreGrowth\Offers\CampaignRepository;
use StorePulse\StoreGrowth\Test\StoreGrowthTestCase;
use WC_Product_Variable;
use WC_Product_Variation;

/**
 * Ranges carry Countdown and campaign prices; a boundary clears caches once.
 *
 * @group campaigns
 */
class CampaignBoundaryTest extends StoreGrowthTestCase {

	/**
	 * Times the purge callback ran.
	 *
	 * @var int
	 */
	private int $purges = 0;

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
		delete_option( CampaignRepository::BOUNDARY_OPTION );
		as_unschedule_all_actions( CampaignBoundary::ACTION );
		WC()->cart->empty_cart();

		add_filter( 'storegrowth_pro_is_active', '__return_true' );
		add_filter(
			'spsg_page_cache_purgers',
			function ( array $purgers ): array {
				$purgers[] = function (): void {
					++$this->purges;
				};
				$purgers[] = 'spsg_no_such_cache_plugin';

				return $purgers;
			}
		);

		( new CommonHooks() )->register_hooks();
	}

	/**
	 * Clean up what the tests scheduled.
	 *
	 * @return void
	 */
	public function tearDown(): void {
		as_unschedule_all_actions( CampaignBoundary::ACTION );
		WC()->cart->empty_cart();
		CampaignRepository::flush();

		parent::tearDown();
	}

	/**
	 * A published variable product.
	 *
	 * @param array<int, array{0: string, 1?: string}> $prices Regular price, and sale price, of each variation.
	 *
	 * @return int[] Parent id, then variation ids.
	 */
	private function variable_product( array $prices ): array {
		$parent = new WC_Product_Variable();
		$parent->set_name( 'Shirt' );
		$parent->set_status( 'publish' );
		$parent->save();

		$ids = [ $parent->get_id() ];

		foreach ( $prices as $price ) {
			$variation = new WC_Product_Variation();
			$variation->set_parent_id( $parent->get_id() );
			$variation->set_status( 'publish' );
			$variation->set_regular_price( $price[0] );

			if ( isset( $price[1] ) ) {
				$variation->set_sale_price( $price[1] );
			}

			$variation->save();
			$ids[] = $variation->get_id();
		}

		WC_Product_Variable::sync( $parent->get_id() );

		return $ids;
	}

	/**
	 * Give products a Countdown discount.
	 *
	 * @param int[]  $ids     Product ids.
	 * @param int    $percent Discount percent.
	 * @param string $end     End date-time, a day ahead by default.
	 *
	 * @return void
	 */
	private function countdown( array $ids, int $percent = 20, string $end = '' ): void {
		foreach ( $ids as $id ) {
			update_post_meta( $id, '_spsg_countdown_timer_discount_amount', (string) $percent );
			update_post_meta( $id, '_spsg_countdown_timer_discount_start', '' );
			update_post_meta( $id, '_spsg_countdown_timer_discount_end', $end ? $end : wp_date( 'Y-m-d H:i:s', time() + DAY_IN_SECONDS ) );
		}
	}

	/**
	 * Save a published campaign setting a price on products.
	 *
	 * @param int[]  $products Product ids.
	 * @param int    $percent  Percent off.
	 * @param string $start    Local start.
	 * @param string $end      Local end.
	 * @param array  $settings Other settings.
	 *
	 * @return int
	 */
	private function campaign( array $products, int $percent, string $start, string $end, array $settings = [] ): int {
		$id = CampaignRepository::save(
			[
				'name'      => 'Black Friday',
				'status'    => CampaignRepository::STATUS_SCHEDULED,
				'starts_at' => $start,
				'ends_at'   => $end,
				'settings'  => array_merge(
					[
						'campaign_price' => [
							'percent'  => $percent,
							'products' => $products,
						],
					],
					$settings
				),
			]
		);

		$this->assertIsInt( $id );

		return $id;
	}

	/**
	 * Local date-time some seconds from now.
	 *
	 * @param int $seconds Offset.
	 *
	 * @return string
	 */
	private function local_time( int $seconds ): string {
		return wp_date( 'Y-m-d H:i:s', time() + $seconds );
	}

	/**
	 * A moment from a timestamp.
	 *
	 * @param int $timestamp Timestamp.
	 *
	 * @return DateTimeImmutable
	 */
	private function moment( int $timestamp ): DateTimeImmutable {
		return ( new DateTimeImmutable( '@' . $timestamp ) )->setTimezone( wp_timezone() );
	}

	/**
	 * A product's range, as a page would read it.
	 *
	 * @param int $id Parent id.
	 *
	 * @return array<string, string[]>
	 */
	private function range( int $id ): array {
		$prices = wc_get_product( $id )->get_variation_prices( true );

		return [
			'price'         => array_values( $prices['price'] ),
			'regular_price' => array_values( $prices['regular_price'] ),
			'sale_price'    => array_values( $prices['sale_price'] ),
		];
	}

	/**
	 * The cache key factors of a product.
	 *
	 * @param int $id Parent id.
	 *
	 * @return string
	 */
	private function hash( int $id ): string {
		/**
		 * Filters the variation prices cache key, as WooCommerce does.
		 *
		 * @since SPSG_VERSION
		 *
		 * @param array       $hash        Factors of the cache key.
		 * @param \WC_Product $product     Variable product.
		 * @param bool        $for_display Whether prices are for display.
		 */
		$hash = apply_filters( 'woocommerce_get_variation_prices_hash', [], wc_get_product( $id ), true );

		return (string) wp_json_encode( $hash );
	}

	/**
	 * Save the boundary option as the repository would.
	 *
	 * @param int $timestamp Boundary.
	 *
	 * @return void
	 */
	private function set_boundary( int $timestamp ): void {
		update_option( CampaignRepository::BOUNDARY_OPTION, $timestamp );
	}

	/**
	 * $50 and $80 at 20% Countdown read $40 to $64, with the regular prices
	 * left for the strike-through.
	 *
	 * @return void
	 */
	public function test_countdown_discounts_the_range(): void {
		$ids = $this->variable_product( [ [ '50' ], [ '80' ] ] );
		$this->countdown( $ids );

		$range = $this->range( $ids[0] );

		$this->assertSame( [ '40.00', '64.00' ], $range['price'] );
		$this->assertSame( [ '40.00', '64.00' ], $range['sale_price'] );
		$this->assertSame( [ '50.00', '80.00' ], $range['regular_price'] );

		$html = wp_strip_all_tags( wc_get_product( $ids[0] )->get_price_html() );

		$this->assertStringContainsString( '40.00', $html );
		$this->assertStringContainsString( '64.00', $html );
		$this->assertStringNotContainsString( '80.00', $html );
	}

	/**
	 * Variations at one price show the strike-through.
	 *
	 * @return void
	 */
	public function test_single_price_range_shows_the_strike_through(): void {
		$ids = $this->variable_product( [ [ '50' ], [ '50' ] ] );
		$this->countdown( $ids );

		$html = wc_get_product( $ids[0] )->get_price_html();

		$this->assertStringContainsString( '<del', $html );
		$this->assertStringContainsString( '40.00', $html );
	}

	/**
	 * A sale price is discounted like the cart does, and stays a sale.
	 *
	 * @return void
	 */
	public function test_countdown_stacks_on_a_sale_price_like_the_cart(): void {
		$ids = $this->variable_product( [ [ '100', '80' ] ] );
		$this->countdown( $ids );

		$range = $this->range( $ids[0] );

		$this->assertSame( [ '64.00' ], $range['price'] );
		$this->assertSame( [ '64.00' ], $range['sale_price'] );
		$this->assertSame( [ '100.00' ], $range['regular_price'] );
		$this->assertEqualsWithDelta( 64.0, (float) wc_get_product( $ids[1] )->get_price(), 0.001 );
	}

	/**
	 * A variation with no price stays out of the range, rather than at $0.
	 *
	 * @return void
	 */
	public function test_variation_without_a_price_stays_out_of_the_range(): void {
		$ids = $this->variable_product( [ [ '50' ], [ '' ] ] );
		$this->countdown( $ids );

		$hooks = new CommonHooks();

		$this->assertSame( '', $hooks->get_variation_range_price( '', wc_get_product( $ids[2] ) ) );
		$this->assertSame( [ '40.00' ], $this->range( $ids[0] )['price'] );
	}

	/**
	 * Not discounted: both filters hand back what WooCommerce gave them.
	 *
	 * @return void
	 */
	public function test_range_is_untouched_without_a_discount(): void {
		$ids = $this->variable_product( [ [ '100', '80' ], [ '50' ] ] );

		$range = $this->range( $ids[0] );

		$this->assertSame( [ '50.00', '80.00' ], $range['price'] );
		$this->assertSame( [ '50.00', '100.00' ], $range['regular_price'] );
		$this->assertSame( [ '50.00', '80.00' ], $range['sale_price'] );
	}

	/**
	 * The range and the variation's own price apply one discount, in either
	 * order and on repeat.
	 *
	 * @return void
	 */
	public function test_no_double_discount(): void {
		$ids = $this->variable_product( [ [ '50' ], [ '80' ] ] );
		$this->countdown( $ids );

		$variation = wc_get_product( $ids[1] );

		$this->assertEqualsWithDelta( 40.0, (float) $variation->get_price(), 0.001 );
		$this->assertSame( '50', $variation->get_price( 'edit' ) );

		$this->range( $ids[0] );

		$this->assertSame( [ '40.00', '64.00' ], $this->range( $ids[0] )['price'] );
		$this->assertEqualsWithDelta( 40.0, (float) wc_get_product( $ids[1] )->get_price(), 0.001 );
	}

	/**
	 * A campaign price shows in the range during its window and the normal
	 * range returns after, replacing the product's own Countdown meanwhile.
	 *
	 * @return void
	 */
	public function test_campaign_price_range_during_the_window_and_normal_after(): void {
		$ids = $this->variable_product( [ [ '50' ], [ '80' ] ] );
		$this->countdown( $ids, 10 );

		$campaign = $this->campaign( [ $ids[0] ], 25, $this->local_time( -HOUR_IN_SECONDS ), $this->local_time( HOUR_IN_SECONDS ) );

		$range = $this->range( $ids[0] );

		$this->assertSame( [ '37.50', '60.00' ], $range['price'] );
		$this->assertSame( [ '50.00', '80.00' ], $range['regular_price'] );

		CampaignRepository::save(
			[
				'starts_at' => $this->local_time( -2 * HOUR_IN_SECONDS ),
				'ends_at'   => $this->local_time( -HOUR_IN_SECONDS ),
			],
			$campaign
		);

		$this->assertSame( [ '45.00', '72.00' ], $this->range( $ids[0] )['price'] );
	}

	/**
	 * A variation listed on its own in a campaign is priced in the range.
	 *
	 * @return void
	 */
	public function test_campaign_on_one_variation_prices_only_it(): void {
		$ids = $this->variable_product( [ [ '50' ], [ '80' ] ] );

		$this->campaign( [ $ids[2] ], 50, $this->local_time( -HOUR_IN_SECONDS ), $this->local_time( HOUR_IN_SECONDS ) );

		$this->assertSame( [ '40.00', '50.00' ], $this->range( $ids[0] )['price'] );
	}

	/**
	 * The range's own campaign price doesn't make the variable product look
	 * on sale of its own accord to an exclude-on-sale campaign.
	 *
	 * @return void
	 */
	public function test_exclude_on_sale_ignores_the_campaigns_own_price_in_the_range(): void {
		$ids = $this->variable_product( [ [ '50' ], [ '80' ] ] );

		$this->campaign( [ $ids[0] ], 20, $this->local_time( -HOUR_IN_SECONDS ), $this->local_time( HOUR_IN_SECONDS ), [ 'exclude_on_sale' => true ] );

		$this->assertSame( [ '40.00', '64.00' ], $this->range( $ids[0] )['price'] );
		$this->assertNotNull( CampaignPrice::for_product( $ids[0] ) );
	}

	/**
	 * An exclude-on-sale campaign skips a variable product with a variation
	 * on sale.
	 *
	 * @return void
	 */
	public function test_exclude_on_sale_skips_a_variable_product_with_a_sale(): void {
		$ids = $this->variable_product( [ [ '50', '40' ], [ '80' ] ] );

		$this->campaign( [ $ids[0] ], 20, $this->local_time( -HOUR_IN_SECONDS ), $this->local_time( HOUR_IN_SECONDS ), [ 'exclude_on_sale' => true ] );

		$this->assertNull( CampaignPrice::for_product( $ids[0] ) );
	}

	/**
	 * A vendor's Countdown is stored on the parent only; it still counts as
	 * on sale for an exclude-on-sale campaign.
	 *
	 * @return void
	 */
	public function test_exclude_on_sale_skips_a_parent_only_countdown(): void {
		$ids = $this->variable_product( [ [ '50' ] ] );

		$this->countdown( [ $ids[0] ] );
		$this->campaign( [ $ids[0] ], 20, $this->local_time( -HOUR_IN_SECONDS ), $this->local_time( HOUR_IN_SECONDS ), [ 'exclude_on_sale' => true ] );

		$this->assertNull( CampaignPrice::for_product( $ids[0] ) );
	}

	/**
	 * The cache key moves by itself when a Countdown window ends: nothing
	 * stored changes, only the clock.
	 *
	 * @return void
	 */
	public function test_hash_moves_when_a_countdown_window_ends(): void {
		$ids = $this->variable_product( [ [ '50' ], [ '80' ] ] );
		$this->countdown( $ids, 20, wp_date( 'Y-m-d H:i:s', time() + 3 ) );

		$running = $this->hash( $ids[0] );

		$this->assertSame( [ '40.00', '64.00' ], $this->range( $ids[0] )['price'] );

		sleep( 4 );

		$this->assertNotSame( $running, $this->hash( $ids[0] ) );
		$this->assertSame( [ '50.00', '80.00' ], $this->range( $ids[0] )['price'] );
	}

	/**
	 * The cache key moves when a Countdown percent or a campaign changes.
	 *
	 * @return void
	 */
	public function test_hash_moves_with_discount_and_campaign(): void {
		$ids = $this->variable_product( [ [ '50' ] ] );

		$none = $this->hash( $ids[0] );

		$this->countdown( $ids, 20 );

		$countdown = $this->hash( $ids[0] );

		$this->assertNotSame( $none, $countdown );

		$this->countdown( $ids, 30 );

		$this->assertNotSame( $countdown, $this->hash( $ids[0] ) );

		$before = $this->hash( $ids[0] );

		$campaign = $this->campaign( [ $ids[0] ], 25, $this->local_time( -HOUR_IN_SECONDS ), $this->local_time( HOUR_IN_SECONDS ) );

		$running = $this->hash( $ids[0] );

		$this->assertNotSame( $before, $running );

		CampaignRepository::save(
			[
				'settings' => [
					'campaign_price' => [
						'percent'  => 40,
						'products' => [ $ids[0] ],
					],
				],
			],
			$campaign
		);

		$this->assertNotSame( $running, $this->hash( $ids[0] ) );
	}

	/**
	 * A passed boundary clears the product's range and purges once, whoever
	 * calls first; a later call does nothing.
	 *
	 * @return void
	 */
	public function test_boundary_runs_once(): void {
		$ids  = $this->variable_product( [ [ '50' ] ] );
		$end  = time() - 30;
		$next = time() + DAY_IN_SECONDS;

		$this->campaign( [ $ids[1] ], 20, $this->local_time( -HOUR_IN_SECONDS ), wp_date( 'Y-m-d H:i:s', $end ) );
		$this->campaign( [ $ids[0] ], 10, wp_date( 'Y-m-d H:i:s', $next ), wp_date( 'Y-m-d H:i:s', $next + HOUR_IN_SECONDS ) );

		$this->set_boundary( $end );
		set_transient( 'wc_var_prices_' . $ids[0], 'stale' );

		$this->assertTrue( CampaignBoundary::run() );
		$this->assertFalse( get_transient( 'wc_var_prices_' . $ids[0] ) );
		$this->assertSame( 1, $this->purges );
		$this->assertSame( $next, (int) get_option( CampaignRepository::BOUNDARY_OPTION ) );

		$this->assertFalse( CampaignBoundary::run() );
		$this->assertSame( 1, $this->purges );
	}

	/**
	 * A request that read the old boundary before another claimed it does
	 * no work: the claim fails on the changed row.
	 *
	 * @return void
	 */
	public function test_concurrent_request_loses_the_claim(): void {
		$end = time() - 30;

		$this->set_boundary( $end );

		$this->assertTrue( CampaignBoundary::run() );
		$this->assertSame( 1, $this->purges );

		// What a request that loaded its options before the claim still sees.
		$stale = wp_load_alloptions();

		$stale[ CampaignRepository::BOUNDARY_OPTION ] = (string) $end;

		wp_cache_set( 'alloptions', $stale, 'options' );

		$this->assertFalse( CampaignBoundary::run() );
		$this->assertSame( 1, $this->purges );
	}

	/**
	 * The second a campaign ends is still inside it: nothing happens yet.
	 *
	 * @return void
	 */
	public function test_boundary_runs_only_after_its_second(): void {
		$boundary = time() + HOUR_IN_SECONDS;

		$this->set_boundary( $boundary );

		$this->assertFalse( CampaignBoundary::run( $this->moment( $boundary ) ) );
		$this->assertSame( 0, $this->purges );

		$this->assertTrue( CampaignBoundary::run( $this->moment( $boundary + 1 ) ) );
		$this->assertSame( 1, $this->purges );
	}

	/**
	 * Boundaries passed together are all cleared, each product under its
	 * parent id and from categories.
	 *
	 * @return void
	 */
	public function test_every_boundary_passed_clears_its_products(): void {
		$one      = $this->variable_product( [ [ '50' ] ] );
		$two      = $this->variable_product( [ [ '60' ] ] );
		$three    = $this->variable_product( [ [ '70' ] ] );
		$category = self::factory()->term->create( [ 'taxonomy' => 'product_cat' ] );
		$first    = time() - 200;
		$second   = time() - 100;

		wp_set_object_terms( $three[0], [ $category ], 'product_cat' );

		// A variation id in the scope is cached under its parent.
		$this->campaign( [ $one[1] ], 20, $this->local_time( -2 * HOUR_IN_SECONDS ), wp_date( 'Y-m-d H:i:s', $first ) );
		$this->campaign( [ $two[0] ], 20, $this->local_time( -HOUR_IN_SECONDS ), wp_date( 'Y-m-d H:i:s', $second ) );
		$category_campaign = $this->campaign( [], 20, $this->local_time( -HOUR_IN_SECONDS ), wp_date( 'Y-m-d H:i:s', $second ) );

		CampaignRepository::save(
			[
				'settings' => [
					'campaign_price' => [
						'percent'    => 20,
						'categories' => [ $category ],
					],
				],
			],
			$category_campaign
		);

		$this->set_boundary( $first );

		foreach ( [ $one[0], $two[0], $three[0] ] as $id ) {
			set_transient( 'wc_var_prices_' . $id, 'stale' );
		}

		$this->assertTrue( CampaignBoundary::run() );

		foreach ( [ $one[0], $two[0], $three[0] ] as $id ) {
			$this->assertFalse( get_transient( 'wc_var_prices_' . $id ), "Product {$id}" );
		}

		$this->assertSame( 1, $this->purges );
	}

	/**
	 * The hook WordPress loads runs the boundary, and a boundary ahead does
	 * nothing.
	 *
	 * @return void
	 */
	public function test_request_hook_handles_a_passed_boundary_only(): void {
		( new CampaignBoundary() )->register_hooks();

		$this->set_boundary( time() + HOUR_IN_SECONDS );

		/**
		 * WordPress finished loading: a request, before the boundary.
		 *
		 * @since SPSG_VERSION
		 */
		do_action( 'wp_loaded' );

		$this->assertSame( 0, $this->purges );

		$this->set_boundary( time() - 5 );

		/**
		 * WordPress finished loading: the first request past the boundary.
		 *
		 * @since SPSG_VERSION
		 */
		do_action( 'wp_loaded' );

		$this->assertSame( 1, $this->purges );
	}

	/**
	 * The scheduled action calls the same work, once.
	 *
	 * @return void
	 */
	public function test_scheduled_action_runs_the_same_work(): void {
		( new CampaignBoundary() )->register_hooks();

		$this->set_boundary( time() - 5 );

		/**
		 * Action Scheduler runs the boundary action.
		 *
		 * @since SPSG_VERSION
		 */
		do_action( CampaignBoundary::ACTION );

		/**
		 * Action Scheduler runs it again, for the same boundary.
		 *
		 * @since SPSG_VERSION
		 */
		do_action( CampaignBoundary::ACTION );

		$this->assertSame( 1, $this->purges );
	}

	/**
	 * The action follows the next boundary, just past it, and goes away with
	 * the last one.
	 *
	 * @return void
	 */
	public function test_action_is_scheduled_past_the_next_boundary(): void {
		$start    = time() + DAY_IN_SECONDS;
		$campaign = $this->campaign( [ 1 ], 20, wp_date( 'Y-m-d H:i:s', $start ), wp_date( 'Y-m-d H:i:s', $start + HOUR_IN_SECONDS ) );

		$this->assertSame( $start + 1, as_next_scheduled_action( CampaignBoundary::ACTION, [], CampaignBoundary::GROUP ) );

		$earlier = $start - HOUR_IN_SECONDS;

		CampaignRepository::save( [ 'starts_at' => wp_date( 'Y-m-d H:i:s', $earlier ) ], $campaign );

		$this->assertSame( $earlier + 1, as_next_scheduled_action( CampaignBoundary::ACTION, [], CampaignBoundary::GROUP ) );

		CampaignRepository::delete( $campaign );

		$this->assertFalse( as_next_scheduled_action( CampaignBoundary::ACTION, [], CampaignBoundary::GROUP ) );
		$this->assertFalse( get_option( CampaignRepository::BOUNDARY_OPTION ) );
	}

	/**
	 * Reading ranges and clearing caches leave the cart's totals alone.
	 *
	 * @return void
	 */
	public function test_cart_totals_are_unchanged(): void {
		$ids = $this->variable_product( [ [ '50' ], [ '80' ] ] );
		$this->countdown( $ids );

		WC()->cart->add_to_cart( $ids[0], 1, $ids[2] );
		WC()->cart->calculate_totals();

		$this->assertEqualsWithDelta( 64.0, (float) WC()->cart->get_cart_contents_total(), 0.001 );

		$this->range( $ids[0] );
		$this->set_boundary( time() - 5 );
		CampaignBoundary::run();

		WC()->cart->calculate_totals();

		$this->assertEqualsWithDelta( 64.0, (float) WC()->cart->get_cart_contents_total(), 0.001 );
	}
}
