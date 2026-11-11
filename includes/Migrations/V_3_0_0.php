<?php
/**
 * File for V_3_0_0 migration class.
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Migrations;

use StorePulse\StoreGrowth\Analytics\Backfill;
use StorePulse\StoreGrowth\Analytics\Schema;
use RuntimeException;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Migration shipped with 3.0.0 (module analytics, ADR-012).
 *
 * The class name carries the version: WPKit stamps it as the database
 * version once every method has run.
 *
 * @since 3.0.0
 */
class V_3_0_0 extends BaseMigration {

	/**
	 * Create the analytics tables.
	 *
	 * @since 3.0.0
	 * @since SPSG_VERSION Throws when the tables aren't there afterwards, so
	 *                     the version isn't stamped and the update can be retried.
	 *
	 * @throws RuntimeException When the tables could not be created.
	 *
	 * @return void
	 */
	public static function create_analytics_tables(): void {
		Schema::install();

		if ( ! Schema::is_installed() ) {
			throw new RuntimeException( esc_html__( 'The analytics tables could not be created.', 'storegrowth-sales-booster' ) );
		}
	}

	/**
	 * Fill the offer lookup for orders imported before the table existed.
	 *
	 * Queued in the background (Action Scheduler); the upgrade doesn't wait.
	 *
	 * @since 3.0.0
	 *
	 * @return void
	 */
	public static function queue_offer_backfill(): void {
		Backfill::queue();
	}
}
