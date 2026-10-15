<?php
/**
 * Daily counts: views, clicks, accepts, … (ADR-012).
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Analytics;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Adds to `spsg_analytics_daily`, one row per store day, module, metric and
 * campaign or product.
 *
 * @since 3.0.0
 */
class Counter {

	/**
	 * Object type: an offer row (BOGO offer, order bump).
	 */
	const CAMPAIGN = 'campaign';

	/**
	 * Object type: a product or variation.
	 */
	const PRODUCT = 'product';

	/**
	 * Object type: the module itself (id 0), for widgets with no campaign
	 * (Free Shipping Bar).
	 *
	 * @since 3.0.0
	 */
	const MODULE = 'module';

	/**
	 * Add to a count for today (store time).
	 *
	 * @since 3.0.0
	 *
	 * @param string $module      Module id.
	 * @param string $metric      Metric, e.g. `view`, `accept`, `remove`.
	 * @param string $object_type `campaign` or `product`.
	 * @param int    $object_id   Offer row id or product id; 0 for the module.
	 * @param int    $count       How many to add.
	 *
	 * @return void
	 */
	public static function bump( string $module, string $metric, string $object_type, int $object_id, int $count = 1 ): void {
		global $wpdb;

		if ( $count < 1 || ! Schema::is_installed() ) {
			return;
		}

		$table = $wpdb->prefix . Schema::DAILY;

		// The table name is a constant; every value is a placeholder.
		// phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$wpdb->query(
			$wpdb->prepare(
				"INSERT INTO {$table} ( day, module, metric, object_type, object_id, count ) VALUES ( %s, %s, %s, %s, %d, %d )
				ON DUPLICATE KEY UPDATE count = count + VALUES( count )",
				wp_date( 'Y-m-d' ),
				$module,
				$metric,
				$object_type,
				$object_id,
				$count
			)
		);
		// phpcs:enable
	}

	/**
	 * Whether a WooCommerce session has already counted this object today.
	 *
	 * Marks it counted, so a view is counted once per session and object
	 * however often the page re-renders.
	 *
	 * @since 3.0.0
	 *
	 * @param string $key       Session list key, e.g. `spsg_bump_seen`.
	 * @param int    $object_id Object id.
	 *
	 * @return bool True the first time in the session.
	 */
	public static function first_in_session( string $key, int $object_id ): bool {
		if ( ! function_exists( 'WC' ) || ! WC()->session ) {
			return false;
		}

		$seen = (array) WC()->session->get( $key, [] );
		if ( in_array( $object_id, $seen, true ) ) {
			return false;
		}

		$seen[] = $object_id;
		WC()->session->set( $key, $seen );

		return true;
	}
}
