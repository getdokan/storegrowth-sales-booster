<?php
/**
 * Plugin uninstall cleanup.
 *
 * @package StorePulse\StoreGrowth
 */

namespace StorePulse\StoreGrowth;

use StorePulse\StoreGrowth\Modules\BoGo\BogoDataManager;
use StorePulse\StoreGrowth\Modules\UpsellOrderBump\Database\Migration;

defined( 'ABSPATH' ) || exit;

/**
 * Removes the plugin's persisted data on uninstall — but only when the
 * merchant has opted in.
 *
 * The removal is gated behind {@see Uninstaller::DATA_REMOVAL_OPTION}, which
 * defaults to preserving data so that removing the plugin to troubleshoot a
 * conflict never destroys configuration silently.
 *
 * Option and post-meta keys are matched by the plugin's `spsg_` naming
 * convention rather than a hand-maintained list, so options added later are
 * cleaned up without touching this class. Table names are read from the
 * constants on their owning classes, so the two can never drift.
 *
 * @since SPSG_VERSION
 */
class Uninstaller {

	/**
	 * Option that opts a merchant in to data removal on uninstall.
	 *
	 * @since SPSG_VERSION
	 *
	 * @var string
	 */
	const DATA_REMOVAL_OPTION = 'spsg_remove_data_on_uninstall';

	/**
	 * Prefix every plugin option name shares.
	 *
	 * @since SPSG_VERSION
	 *
	 * @var string
	 */
	const OPTION_PREFIX = 'spsg_';

	/**
	 * Prefixes the plugin's post-meta keys use.
	 *
	 * Some keys are underscore-hidden (`_spsg_…`) and some are not (`spsg_…`),
	 * so both are matched.
	 *
	 * @since SPSG_VERSION
	 *
	 * @var string[]
	 */
	const META_PREFIXES = array( 'spsg_', '_spsg_' );

	/**
	 * Run the uninstall cleanup, multisite-aware.
	 *
	 * On multisite the cleanup runs once per site; the opt-in option is read
	 * per site, so a network can preserve on some sites and remove on others.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return void
	 */
	public static function run(): void {
		if ( is_multisite() ) {
			$site_ids = get_sites(
				array(
					'fields' => 'ids',
					'number' => 0,
				)
			);

			foreach ( $site_ids as $site_id ) {
				switch_to_blog( (int) $site_id );
				self::clean_current_site();
				restore_current_blog();
			}

			return;
		}

		self::clean_current_site();
	}

	/**
	 * Whether the current site has opted in to data removal.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return bool
	 */
	public static function should_remove_data(): bool {
		return (bool) get_option( self::DATA_REMOVAL_OPTION, false );
	}

	/**
	 * Unprefixed custom table names, read from their owning classes.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return string[]
	 */
	public static function tables(): array {
		$tables = array();

		if ( class_exists( BogoDataManager::class ) ) {
			$tables[] = BogoDataManager::TABLE_NAME;
		}

		if ( class_exists( Migration::class ) ) {
			$tables[] = Migration::TABLE_NAME;
		}

		return $tables;
	}

	/**
	 * Clean the current site if — and only if — it opted in.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return void
	 */
	private static function clean_current_site(): void {
		if ( ! self::should_remove_data() ) {
			return;
		}

		self::drop_tables();
		self::delete_options();
		self::delete_post_meta();
		self::delete_transients();
		self::clear_scheduled_events();
	}

	/**
	 * Drop the plugin's custom tables. No-ops when a table is already gone.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return void
	 */
	private static function drop_tables(): void {
		global $wpdb;

		foreach ( self::tables() as $table ) {
			$full_table = $wpdb->prefix . $table;

			// Table identifiers cannot be passed through prepare(); these names
			// are class constants, never user input.
			$wpdb->query( "DROP TABLE IF EXISTS `{$full_table}`" ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.DirectDatabaseQuery.SchemaChange
		}
	}

	/**
	 * Delete every option whose name starts with the plugin prefix.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return void
	 */
	private static function delete_options(): void {
		global $wpdb;

		$like = $wpdb->esc_like( self::OPTION_PREFIX ) . '%';

		$wpdb->query( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
			$wpdb->prepare( "DELETE FROM {$wpdb->options} WHERE option_name LIKE %s", $like )
		);
	}

	/**
	 * Delete every post-meta row whose key starts with a plugin prefix.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return void
	 */
	private static function delete_post_meta(): void {
		global $wpdb;

		foreach ( self::META_PREFIXES as $prefix ) {
			$like = $wpdb->esc_like( $prefix ) . '%';

			$wpdb->query( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
				$wpdb->prepare( "DELETE FROM {$wpdb->postmeta} WHERE meta_key LIKE %s", $like )
			);
		}
	}

	/**
	 * Delete the plugin's transients (and their timeout rows).
	 *
	 * @since SPSG_VERSION
	 *
	 * @return void
	 */
	private static function delete_transients(): void {
		global $wpdb;

		$patterns = array(
			'_transient_' . self::OPTION_PREFIX,
			'_transient_timeout_' . self::OPTION_PREFIX,
			'_site_transient_' . self::OPTION_PREFIX,
			'_site_transient_timeout_' . self::OPTION_PREFIX,
		);

		foreach ( $patterns as $pattern ) {
			$like = $wpdb->esc_like( $pattern ) . '%';

			$wpdb->query( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
				$wpdb->prepare( "DELETE FROM {$wpdb->options} WHERE option_name LIKE %s", $like )
			);
		}
	}

	/**
	 * Clear any scheduled events the plugin registered.
	 *
	 * The free build schedules nothing today; the filter lets modules and the
	 * Pro build contribute their own cron hooks without editing this class.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return void
	 */
	private static function clear_scheduled_events(): void {
		/**
		 * Cron hook names to clear on uninstall.
		 *
		 * @since SPSG_VERSION
		 *
		 * @param string[] $hooks Scheduled hook names.
		 */
		$hooks = apply_filters( 'spsg_uninstall_scheduled_hooks', array() );

		foreach ( (array) $hooks as $hook ) {
			wp_clear_scheduled_hook( $hook );
		}
	}
}
