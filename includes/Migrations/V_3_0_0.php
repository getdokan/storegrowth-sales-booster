<?php
/**
 * File for V_3_0_0 migration class.
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Migrations;

use StorePulse\StoreGrowth\Analytics\Backfill;
use StorePulse\StoreGrowth\Analytics\Schema;

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
 * @since SPSG_VERSION
 */
class V_3_0_0 extends BaseMigration {

	/**
	 * Create the analytics tables.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return void
	 */
	public static function create_analytics_tables(): void {
		Schema::install();
	}

	/**
	 * Fill the offer lookup for orders imported before the table existed.
	 *
	 * Queued in the background (Action Scheduler); the upgrade doesn't wait.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return void
	 */
	public static function queue_offer_backfill(): void {
		Backfill::queue();
	}
}
