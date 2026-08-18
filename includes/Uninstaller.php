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
 * constants on their owning classes, so the two can never drift. The only
 * hand-maintained list is {@see Uninstaller::extra_options()}, for the handful
 * of keys that predate the convention or belong to a bundled third party.
 *
 * @since 2.2.0
 */
class Uninstaller {

	/**
	 * Option that opts a merchant in to data removal on uninstall.
	 *
	 * @since 2.2.0
	 *
	 * @var string
	 */
	const DATA_REMOVAL_OPTION = 'spsg_remove_data_on_uninstall';

	/**
	 * Prefix every plugin option name shares.
	 *
	 * @since 2.2.0
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
	 * @since 2.2.0
	 *
	 * @var string[]
	 */
	const META_PREFIXES = array( 'spsg_', '_spsg_' );

	/**
	 * Slug Appsero keys its telemetry options on.
	 *
	 * Appsero takes it from the plugin's directory name, which is fixed for a
	 * WordPress.org install.
	 *
	 * @since 2.2.0
	 *
	 * @var string
	 */
	const APPSERO_SLUG = 'storegrowth-sales-booster';

	/**
	 * Run the uninstall cleanup, multisite-aware.
	 *
	 * On multisite the cleanup runs once per site; the opt-in option is read
	 * per site, so a network can preserve on some sites and remove on others.
	 *
	 * @since 2.2.0
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
	 * @since 2.2.0
	 *
	 * @return bool
	 */
	public static function should_remove_data(): bool {
		return (bool) get_option( self::DATA_REMOVAL_OPTION, false );
	}

	/**
	 * Unprefixed custom table names, read from their owning classes.
	 *
	 * @since 2.2.0
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
	 * Option names the `spsg_` prefix does not match.
	 *
	 * Two sources predate or sit outside the naming convention:
	 *
	 * - `storegrowth_activation_redirect`, written on activation and normally
	 *   deleted on the first admin load, so it only survives when the plugin is
	 *   deleted before wp-admin is ever opened.
	 * - Appsero's telemetry options, keyed on {@see Uninstaller::APPSERO_SLUG}.
	 *   Its deactivation hook clears its cron and `_tracking_notice`, but for a
	 *   plugin it leaves the remaining keys behind; `_tracking_notice` is listed
	 *   anyway so the cleanup does not depend on that hook having run.
	 *
	 * @since 2.2.0
	 *
	 * @return string[]
	 */
	public static function extra_options(): array {
		return array(
			'storegrowth_activation_redirect',
			self::APPSERO_SLUG . '_allow_tracking',
			self::APPSERO_SLUG . '_tracking_last_send',
			self::APPSERO_SLUG . '_tracking_skipped',
			self::APPSERO_SLUG . '_tracking_notice',
		);
	}

	/**
	 * Clean the current site if — and only if — it opted in.
	 *
	 * @since 2.2.0
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
		self::delete_order_meta();
		self::delete_transients();
		self::clear_scheduled_events();
	}

	/**
	 * Drop the plugin's custom tables. No-ops when a table is already gone.
	 *
	 * @since 2.2.0
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
	 * @since 2.2.0
	 *
	 * @return void
	 */
	private static function delete_options(): void {
		global $wpdb;

		$like = $wpdb->esc_like( self::OPTION_PREFIX ) . '%';

		$wpdb->query( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
			$wpdb->prepare( "DELETE FROM {$wpdb->options} WHERE option_name LIKE %s", $like )
		);

		foreach ( self::extra_options() as $option ) {
			delete_option( $option );
		}
	}

	/**
	 * Delete every post-meta row whose key starts with a plugin prefix.
	 *
	 * @since 2.2.0
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
	 * Delete the plugin's meta rows from WooCommerce's own order tables.
	 *
	 * Campaign attribution stamps the offer that produced a line onto the order
	 * line item, and an aggregate record onto the order. Line-item meta always
	 * lives in `woocommerce_order_itemmeta`, and order meta lives in
	 * `wc_orders_meta` whenever HPOS is the active storage. Neither is
	 * `$wpdb->postmeta`, so `delete_post_meta()` never reaches them.
	 *
	 * @since 2.2.0
	 *
	 * @return void
	 */
	private static function delete_order_meta(): void {
		global $wpdb;

		$tables = array(
			$wpdb->prefix . 'woocommerce_order_itemmeta',
			$wpdb->prefix . 'wc_orders_meta',
		);

		foreach ( $tables as $table ) {
			// WooCommerce may already be gone, and `wc_orders_meta` only exists
			// on WooCommerce versions that ship HPOS.
			if ( ! Helper::table_exists( $table ) ) {
				continue;
			}

			foreach ( self::META_PREFIXES as $prefix ) {
				$like = $wpdb->esc_like( $prefix ) . '%';

				// Table identifiers cannot be passed through prepare(); these
				// names are built from the WordPress table prefix, never input.
				$wpdb->query( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
					$wpdb->prepare( "DELETE FROM `{$table}` WHERE meta_key LIKE %s", $like ) // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
				);
			}
		}
	}

	/**
	 * Delete the plugin's transients (and their timeout rows).
	 *
	 * @since 2.2.0
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
	 * @since 2.2.0
	 *
	 * @return void
	 */
	private static function clear_scheduled_events(): void {
		/**
		 * Cron hook names to clear on uninstall.
		 *
		 * @since 2.2.0
		 *
		 * @param string[] $hooks Scheduled hook names.
		 */
		$hooks = apply_filters( 'spsg_uninstall_scheduled_hooks', array() );

		foreach ( (array) $hooks as $hook ) {
			wp_clear_scheduled_hook( $hook );
		}
	}
}
