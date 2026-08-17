<?php
/**
 * Characterisation tests for BOGO offer eligibility.
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Test\Bogo;

use StorePulse\StoreGrowth\Modules\BoGo\BogoValidator;
use StorePulse\StoreGrowth\Test\StoreGrowthTestCase;

/**
 * These are CHARACTERISATION tests: they record what the code does today so a
 * behavioural change in 2.2 or 3.0 shows up as a failing test. They do not
 * assert that the behaviour is correct. Where an assertion encodes something
 * known to be wrong it says so inline and names the issue that will change it.
 *
 * @group bogo
 * @group eligibility
 */
class BogoEligibilityTest extends StoreGrowthTestCase {

	/**
	 * An active offer with no date or schedule limits is applicable.
	 *
	 * @return void
	 */
	public function test_active_offer_is_applicable() {
		$this->assertTrue(
			BogoValidator::is_bogo_applicable( 1, $this->bogo_settings() )
		);
	}

	/**
	 * An inactive offer is not applicable.
	 *
	 * @return void
	 */
	public function test_inactive_offer_is_not_applicable() {
		$this->assertFalse(
			BogoValidator::is_bogo_applicable( 1, $this->bogo_settings( array( 'status' => 'inactive' ) ) )
		);
	}

	/**
	 * A settings array with no status key at all is not applicable.
	 *
	 * `is_bogo_enabled()` requires the key to be set, while the very next check,
	 * `is_offer_status_active()`, defaults a missing status to 'active'. The
	 * first check therefore decides the outcome and the second is unreachable
	 * for this input. Recorded as current behaviour.
	 *
	 * @return void
	 */
	public function test_offer_without_status_key_is_not_applicable() {
		$settings = $this->bogo_settings();
		unset( $settings['status'] );

		$this->assertFalse( BogoValidator::is_bogo_applicable( 1, $settings ) );
	}

	/**
	 * An offer whose window has not opened yet is not applicable.
	 *
	 * @return void
	 */
	public function test_offer_before_start_date_is_not_applicable() {
		$settings = $this->bogo_settings(
			array(
				'offer_start' => gmdate( 'Y-m-d', strtotime( '+2 days' ) ),
				'offer_end'   => gmdate( 'Y-m-d', strtotime( '+9 days' ) ),
			)
		);

		$this->assertFalse( BogoValidator::is_bogo_applicable( 1, $settings ) );
	}

	/**
	 * An offer whose window has closed is not applicable.
	 *
	 * @return void
	 */
	public function test_offer_after_end_date_is_not_applicable() {
		$settings = $this->bogo_settings(
			array(
				'offer_start' => gmdate( 'Y-m-d', strtotime( '-9 days' ) ),
				'offer_end'   => gmdate( 'Y-m-d', strtotime( '-2 days' ) ),
			)
		);

		$this->assertFalse( BogoValidator::is_bogo_applicable( 1, $settings ) );
	}

	/**
	 * An offer inside its window is applicable.
	 *
	 * @return void
	 */
	public function test_offer_inside_date_range_is_applicable() {
		$settings = $this->bogo_settings(
			array(
				'offer_start' => gmdate( 'Y-m-d', strtotime( '-1 day' ) ),
				'offer_end'   => gmdate( 'Y-m-d', strtotime( '+1 day' ) ),
			)
		);

		$this->assertTrue( BogoValidator::is_bogo_applicable( 1, $settings ) );
	}

	/**
	 * The date window is inclusive of both endpoints.
	 *
	 * @return void
	 */
	public function test_offer_on_its_boundary_dates_is_applicable() {
		$today = current_time( 'Y-m-d' );

		$this->assertTrue(
			BogoValidator::is_bogo_applicable(
				1,
				$this->bogo_settings( array( 'offer_start' => $today, 'offer_end' => $today ) )
			),
			'start and end both equal to today must still be applicable'
		);
	}

	/**
	 * The zero date is treated as "unset" rather than as a real date.
	 *
	 * @return void
	 */
	public function test_zero_dates_are_ignored() {
		$settings = $this->bogo_settings(
			array(
				'offer_start' => '0000-00-00',
				'offer_end'   => '0000-00-00',
			)
		);

		$this->assertTrue( BogoValidator::is_bogo_applicable( 1, $settings ) );
	}

	/**
	 * The date range is compared as site-local dates at day granularity.
	 *
	 * `is_date_range_valid()` uses `current_time( 'Y-m-d' )` and string-compares
	 * it, so the window flips at the store's midnight and a time of day is never
	 * considered. Countdown Timer, by contrast, compares UTC timestamps at
	 * second granularity. That asymmetry is deliberate here and is recorded, not
	 * corrected.
	 *
	 * @return void
	 */
	public function test_date_range_uses_site_local_day_granularity() {
		update_option( 'timezone_string', 'Pacific/Kiritimati' ); // UTC+14.

		$site_today = current_time( 'Y-m-d' );
		$utc_today  = gmdate( 'Y-m-d' );

		$settings = $this->bogo_settings(
			array(
				'offer_start' => $site_today,
				'offer_end'   => $site_today,
			)
		);

		$this->assertTrue(
			BogoValidator::is_bogo_applicable( 1, $settings ),
			'the window is evaluated against the site-local date'
		);

		// On a far-forward timezone the site date can already be tomorrow in UTC
		// terms. When the two differ, a UTC-dated window is already closed.
		if ( $site_today !== $utc_today ) {
			$this->assertFalse(
				BogoValidator::is_bogo_applicable(
					1,
					$this->bogo_settings( array( 'offer_start' => $utc_today, 'offer_end' => $utc_today ) )
				),
				'a UTC-dated window does not line up with the site-local comparison'
			);
		}

		update_option( 'timezone_string', '' );
	}

	/**
	 * Schedules are a Pro feature, so the free build never restricts by day.
	 *
	 * `is_schedule_valid()` returns true unconditionally when Pro is inactive,
	 * before it ever looks at `offer_schedule`. Asserted through the public
	 * `is_bogo_applicable()` because the method itself is private.
	 *
	 * @return void
	 */
	public function test_schedule_is_ignored_when_pro_is_inactive() {
		if ( sp_store_growth()->has_pro() ) {
			$this->markTestSkipped( 'Pro is active in this environment; this case records free-build behaviour.' );
		}

		$never_today = array( 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday' );
		$key         = array_search( strtolower( gmdate( 'l' ) ), $never_today, true );
		unset( $never_today[ $key ] );

		$settings = $this->bogo_settings( array( 'offer_schedule' => array_values( $never_today ) ) );

		$this->assertTrue(
			BogoValidator::is_bogo_applicable( 1, $settings ),
			'a schedule excluding today is still applicable on the free build'
		);
	}

	/**
	 * `is_schedule_active()` treats an empty schedule and 'daily' as always on.
	 *
	 * @return void
	 */
	public function test_schedule_active_defaults_to_always_on() {
		$this->assertTrue( BogoValidator::is_schedule_active( array() ) );
		$this->assertTrue( BogoValidator::is_schedule_active( array( 'daily' ) ) );
	}

	/**
	 * `is_schedule_active()` matches the current day case-insensitively.
	 *
	 * It reads the day with `date()`, not `current_time()`, so it follows PHP's
	 * configured timezone rather than the site's. Recorded as current behaviour.
	 *
	 * @return void
	 */
	public function test_schedule_active_matches_current_day() {
		$today = strtolower( gmdate( 'l' ) );

		$this->assertTrue( BogoValidator::is_schedule_active( array( ucfirst( $today ) ) ) );
		$this->assertFalse( BogoValidator::is_schedule_active( array( 'not-a-day' ) ) );
	}

	/**
	 * A product listed in the offer matches.
	 *
	 * @return void
	 */
	public function test_product_in_offer_is_offered() {
		$this->assertTrue( BogoValidator::is_product_offered( 42, array( 42, 43 ) ) );
	}

	/**
	 * A product absent from the offer does not match.
	 *
	 * @return void
	 */
	public function test_product_not_in_offer_is_not_offered() {
		$this->assertFalse( BogoValidator::is_product_offered( 99, array( 42, 43 ) ) );
		$this->assertFalse( BogoValidator::is_product_offered( 42, array() ) );
	}

	/**
	 * Product matching is type-strict.
	 *
	 * `is_product_offered()` uses `in_array( ..., true )`, so a stored list of
	 * string IDs never matches an integer product ID. Offer IDs arrive through
	 * `json_decode()` of the stored column, so the stored JSON's element type
	 * decides whether an offer fires at all.
	 *
	 * Recorded as current behaviour, not corrected here.
	 *
	 * @return void
	 */
	public function test_product_matching_is_type_strict() {
		$this->assertFalse(
			BogoValidator::is_product_offered( 42, array( '42' ) ),
			'an integer product id does not match a string entry'
		);

		$this->assertFalse(
			BogoValidator::is_product_offered( '42', array( 42 ) ),
			'and the reverse does not match either'
		);
	}

	/**
	 * A scalar rather than an array is compared loosely by cast.
	 *
	 * @return void
	 */
	public function test_scalar_offered_products_is_cast() {
		$this->assertTrue( BogoValidator::is_product_offered( 42, '42' ) );
	}

	/**
	 * Category matching intersects the product's terms with the offer's.
	 *
	 * @return void
	 */
	public function test_category_in_offer_is_offered() {
		$this->assertTrue( BogoValidator::is_category_offered( array( 7, 8 ), array( 8, 9 ) ) );
	}

	/**
	 * A product sharing no category with the offer does not match.
	 *
	 * @return void
	 */
	public function test_category_not_in_offer_is_not_offered() {
		$this->assertFalse( BogoValidator::is_category_offered( array( 7 ), array( 8, 9 ) ) );
		$this->assertFalse( BogoValidator::is_category_offered( array(), array( 8 ) ) );
		$this->assertFalse( BogoValidator::is_category_offered( array( 7 ), array() ) );
	}

	/**
	 * `should_display_offer()` needs eligibility plus a product or category hit.
	 *
	 * The product and category checks live here rather than in
	 * `is_bogo_applicable()`, which only covers status, dates and schedule.
	 *
	 * @return void
	 */
	public function test_should_display_offer_requires_a_product_or_category_match() {
		$settings = $this->bogo_settings(
			array(
				'offered_products'   => array( 42 ),
				'offered_categories' => array( 8 ),
			)
		);

		$this->assertTrue(
			BogoValidator::should_display_offer( $settings, 42, array() ),
			'a product match alone is enough'
		);

		$this->assertTrue(
			BogoValidator::should_display_offer( $settings, 99, array( 8 ) ),
			'a category match alone is enough'
		);

		$this->assertFalse(
			BogoValidator::should_display_offer( $settings, 99, array( 7 ) ),
			'neither matching means no offer'
		);
	}

	/**
	 * An ineligible offer is not displayed even when the product matches.
	 *
	 * @return void
	 */
	public function test_should_display_offer_respects_eligibility() {
		$settings = $this->bogo_settings(
			array(
				'status'           => 'inactive',
				'offered_products' => array( 42 ),
			)
		);

		$this->assertFalse( BogoValidator::should_display_offer( $settings, 42, array() ) );
	}
}
