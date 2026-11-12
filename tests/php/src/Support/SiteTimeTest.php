<?php
/**
 * Tests for the site clock.
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Test\Support;

use DateTimeImmutable;
use StorePulse\StoreGrowth\Modules\CountdownTimer\Helper as CountdownHelper;
use StorePulse\StoreGrowth\Support\SiteTime;
use WP_UnitTestCase;

/**
 * A New York store: a window set for Nov 27 starts at New York's midnight.
 */
class SiteTimeTest extends WP_UnitTestCase {

	/**
	 * Run every test in a store five hours behind UTC in November.
	 *
	 * @return void
	 */
	public function setUp(): void {
		parent::setUp();

		update_option( 'timezone_string', 'America/New_York' );
	}

	/**
	 * A moment in the site timezone.
	 *
	 * @param string $value Date and time.
	 *
	 * @return DateTimeImmutable
	 */
	private function moment( string $value ): DateTimeImmutable {
		return new DateTimeImmutable( $value, wp_timezone() );
	}

	/**
	 * The window opens at the site's midnight, not UTC's.
	 *
	 * @return void
	 */
	public function test_window_opens_at_site_midnight(): void {
		$this->assertFalse( SiteTime::is_within( '2026-11-27 00:00:00', '', $this->moment( '2026-11-26 19:00:00' ) ) );
		$this->assertFalse( SiteTime::is_within( '2026-11-27 00:00:00', '', $this->moment( '2026-11-26 23:59:59' ) ) );
		$this->assertTrue( SiteTime::is_within( '2026-11-27 00:00:00', '', $this->moment( '2026-11-27 00:00:00' ) ) );
	}

	/**
	 * A date without a time runs through the end of that day.
	 *
	 * @return void
	 */
	public function test_date_only_end_runs_through_that_day(): void {
		$this->assertTrue( SiteTime::is_within( '', '2026-12-01', $this->moment( '2026-12-01 23:59:59' ) ) );
		$this->assertFalse( SiteTime::is_within( '', '2026-12-01', $this->moment( '2026-12-02 00:00:00' ) ) );
	}

	/**
	 * Empty and zero dates leave that side of the window open.
	 *
	 * @return void
	 */
	public function test_empty_ends_are_open(): void {
		$now = $this->moment( '2026-11-27 12:00:00' );

		$this->assertTrue( SiteTime::is_within( '', '', $now ) );
		$this->assertTrue( SiteTime::is_within( '0000-00-00', null, $now ) );
	}

	/**
	 * The weekday is the site's, in English, near a UTC day change.
	 *
	 * @return void
	 */
	public function test_weekday_follows_site_timezone(): void {
		// Friday 21:00 in New York is already Saturday in UTC.
		$this->assertSame( 'friday', SiteTime::weekday( $this->moment( '2026-11-27 21:00:00' ) ) );
	}

	/**
	 * The storefront timer ends at the same moment as the price.
	 *
	 * @return void
	 */
	public function test_timer_end_is_the_site_moment(): void {
		$this->assertSame(
			$this->moment( '2026-12-01 23:59:59' )->getTimestamp() * 1000,
			CountdownHelper::timer_end( '2026-12-01 23:59:59' )
		);
		$this->assertSame( 0, CountdownHelper::timer_end( '' ) );
	}
}
