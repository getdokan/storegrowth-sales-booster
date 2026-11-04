<?php
/**
 * Daily counts (ADR-012).
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Test\Analytics;

use StorePulse\StoreGrowth\Analytics\Counter;
use StorePulse\StoreGrowth\Analytics\Schema;
use StorePulse\StoreGrowth\Test\StoreGrowthTestCase;

/**
 * Counts add up per day, module, metric and object.
 *
 * @group analytics
 */
class CounterTest extends StoreGrowthTestCase {

	/**
	 * An empty counts table.
	 *
	 * @return void
	 */
	public function setUp(): void {
		parent::setUp();

		global $wpdb;
		$wpdb->query( "TRUNCATE TABLE {$wpdb->prefix}" . Schema::DAILY ); // phpcs:ignore WordPress.DB
	}

	/**
	 * Rows of the counts table.
	 *
	 * @return array[]
	 */
	private function rows(): array {
		global $wpdb;

		return $wpdb->get_results( "SELECT module, metric, object_type, object_id, count, day FROM {$wpdb->prefix}" . Schema::DAILY . ' ORDER BY metric', ARRAY_A ); // phpcs:ignore WordPress.DB
	}

	/**
	 * The same key adds up in one row; another metric gets its own.
	 *
	 * @return void
	 */
	public function test_counts_add_up_per_key() {
		Counter::bump( 'upsell-order-bump', 'view', Counter::CAMPAIGN, 3 );
		Counter::bump( 'upsell-order-bump', 'view', Counter::CAMPAIGN, 3, 2 );
		Counter::bump( 'upsell-order-bump', 'accept', Counter::CAMPAIGN, 3 );

		$rows = $this->rows();

		$this->assertCount( 2, $rows );
		$this->assertSame( 'accept', $rows[0]['metric'] );
		$this->assertSame( '1', $rows[0]['count'] );
		$this->assertSame( '3', $rows[1]['count'] );
		$this->assertSame( wp_date( 'Y-m-d' ), $rows[1]['day'] );
	}

	/**
	 * Nothing is written before the upgrade has created the tables.
	 *
	 * @return void
	 */
	public function test_nothing_is_counted_before_the_upgrade() {
		delete_option( Schema::VERSION_OPTION );

		Counter::bump( 'upsell-order-bump', 'view', Counter::CAMPAIGN, 3 );

		$this->assertSame( [], $this->rows() );
	}
}
