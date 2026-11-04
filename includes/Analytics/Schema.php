<?php
/**
 * Analytics tables (ADR-012).
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Analytics;

use StorePulse\StoreGrowth\Interfaces\HookRegistry;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Creates the analytics tables.
 *
 * A fresh install creates them on activation. An update creates them when
 * the admin runs the upgrade from the upgrade notice (`Migrations\V_3_0_0`).
 * Until then nothing writes or reads them (`is_installed()`).
 *
 * @since 3.0.0
 */
class Schema implements HookRegistry {

	/**
	 * Option holding the installed table version (not autoloaded).
	 */
	const VERSION_OPTION = 'spsg_analytics_db_version';

	/**
	 * Current table version.
	 */
	const VERSION = '1';

	/**
	 * Unprefixed name of the offer lookup table.
	 */
	const OFFER_LOOKUP = 'spsg_offer_lookup';

	/**
	 * Unprefixed name of the daily counts table (views, clicks, …).
	 */
	const DAILY = 'spsg_analytics_daily';

	/**
	 * Register hooks.
	 *
	 * @since 3.0.0
	 *
	 * @return void
	 */
	public function register_hooks(): void {
		add_filter( 'wpmu_drop_tables', [ $this, 'drop_tables_with_site' ] );
	}

	/**
	 * Whether the tables have been created.
	 *
	 * @since 3.0.0
	 *
	 * @return bool
	 */
	public static function is_installed(): bool {
		return false !== get_option( self::VERSION_OPTION, false );
	}

	/**
	 * Create or upgrade the tables.
	 *
	 * @since 3.0.0
	 *
	 * @return void
	 */
	public static function install(): void {
		global $wpdb;

		require_once ABSPATH . 'wp-admin/includes/upgrade.php';

		$table   = $wpdb->prefix . self::OFFER_LOOKUP;
		$daily   = $wpdb->prefix . self::DAILY;
		$collate = $wpdb->get_charset_collate();

		// One row per row of WooCommerce's wc_order_product_lookup (same key),
		// for lines a StoreGrowth module touched. dbDelta needs two spaces
		// before PRIMARY KEY and KEY, not INDEX.
		dbDelta(
			"CREATE TABLE {$table} (
	order_item_id bigint(20) unsigned NOT NULL,
	order_id bigint(20) unsigned NOT NULL,
	root_item_id bigint(20) unsigned NOT NULL,
	module varchar(40) NOT NULL DEFAULT '',
	role varchar(16) NOT NULL DEFAULT '',
	campaign_id varchar(64) NOT NULL DEFAULT '',
	trigger_campaign_id varchar(64) NOT NULL DEFAULT '',
	unit_discount double NOT NULL DEFAULT 0,
	approximate tinyint(1) NOT NULL DEFAULT 0,
	PRIMARY KEY  (order_item_id, order_id),
	KEY order_id (order_id),
	KEY module_role (module, role),
	KEY campaign_id (campaign_id),
	KEY trigger_campaign_id (trigger_campaign_id)
) {$collate};"
		);

		// Counts per store day: views, clicks, accepts, … of a campaign or product.
		dbDelta(
			"CREATE TABLE {$daily} (
	day date NOT NULL,
	module varchar(40) NOT NULL,
	metric varchar(40) NOT NULL,
	object_type varchar(20) NOT NULL,
	object_id bigint(20) unsigned NOT NULL DEFAULT 0,
	count int(10) unsigned NOT NULL DEFAULT 0,
	PRIMARY KEY  (day, module, metric, object_type, object_id),
	KEY module_day (module, day)
) {$collate};"
		);

		// Marked installed only once the tables are really there, so a failed
		// CREATE leaves writers off instead of erroring on every import.
		foreach ( [ $table, $daily ] as $name ) {
			if ( $name !== $wpdb->get_var( $wpdb->prepare( 'SHOW TABLES LIKE %s', $wpdb->esc_like( $name ) ) ) ) { // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
				return;
			}
		}

		update_option( self::VERSION_OPTION, self::VERSION, false );
	}

	/**
	 * Drop the analytics tables with a deleted multisite site.
	 *
	 * @since 3.0.0
	 *
	 * @param string[] $tables Prefixed table names to drop.
	 *
	 * @return string[]
	 */
	public function drop_tables_with_site( $tables ) {
		global $wpdb;

		$tables[] = $wpdb->prefix . self::OFFER_LOOKUP;
		$tables[] = $wpdb->prefix . self::DAILY;

		return $tables;
	}
}
