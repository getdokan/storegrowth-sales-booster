<?php
/**
 * StoreGrowth inside WooCommerce Analytics (ADR-012).
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Analytics;

use Automattic\WooCommerce\Admin\PageController;
use StorePulse\StoreGrowth\Helper;
use StorePulse\StoreGrowth\Interfaces\HookRegistry;
use StorePulse\StoreGrowth\ModuleManager;
use StorePulse\StoreGrowth\Modules\BoGo\BoGoModule;
use StorePulse\StoreGrowth\Modules\CountdownTimer\CountdownTimerModule;
use StorePulse\StoreGrowth\Modules\UpsellOrderBump\UpsellOrderBumpModule;
use WP_REST_Request;
use WP_REST_Response;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Adds StoreGrowth to WooCommerce's own reports:
 * - a "StoreGrowth offer" filter on the Orders and Products reports
 *   (`?spsg_offer=any|<module id>`), which narrows their tables and charts;
 * - an "Offer" column on the Orders report;
 * - the offer revenue indicator for the Overview (`OffersStatsController`).
 *
 * The filter keeps orders (Orders report) or lines (Products report) that
 * have a row in `spsg_offer_lookup` for the module: reward and discounted
 * lines, not BOGO trigger lines (the BOGO card reports those apart).
 *
 * @since 3.0.0
 */
class WcAnalytics implements HookRegistry {

	/**
	 * Request param of the filter.
	 */
	const PARAM = 'spsg_offer';

	/**
	 * Filter value for any StoreGrowth offer.
	 */
	const ANY = 'any';

	/**
	 * WooCommerce report queries the filter applies to.
	 */
	const QUERIES = [ 'orders', 'orders_stats', 'products', 'products_stats' ];

	/**
	 * SQL contexts over `wc_order_stats` (one row per order).
	 */
	const ORDER_CONTEXTS = [ 'orders_subquery', 'orders_stats_total', 'orders_stats_interval' ];

	/**
	 * SQL contexts over `wc_order_product_lookup` (one row per line).
	 */
	const PRODUCT_CONTEXTS = [ 'products_subquery', 'products_stats_total', 'products_stats_interval' ];

	/**
	 * The filter of a report export in this request (it has no URL params).
	 *
	 * @var string|null
	 */
	protected static $export_offer = null;

	/**
	 * Register hooks.
	 *
	 * @since 3.0.0
	 *
	 * @return void
	 */
	public function register_hooks(): void {
		foreach ( self::QUERIES as $query ) {
			add_filter( "woocommerce_analytics_{$query}_query_args", [ $this, 'add_query_arg' ] );
		}

		foreach ( self::ORDER_CONTEXTS as $context ) {
			add_filter( "woocommerce_analytics_clauses_where_{$context}", [ $this, 'where_orders' ] );
		}

		foreach ( self::PRODUCT_CONTEXTS as $context ) {
			add_filter( "woocommerce_analytics_clauses_where_{$context}", [ $this, 'where_lines' ] );
		}

		add_filter( 'woocommerce_analytics_orders_select_query', [ $this, 'add_order_offers' ] );
		add_filter( 'woocommerce_rest_prepare_report_orders', [ $this, 'prepare_order' ], 10, 2 );

		// CSV exports: the filter from the export's args, and the Offer column.
		add_filter( 'rest_request_before_callbacks', [ $this, 'read_export_request' ], 10, 3 );
		add_action( 'woocommerce_admin_report_export', [ $this, 'read_export_batch' ], 1, 4 );
		add_filter( 'woocommerce_report_orders_export_columns', [ $this, 'add_export_column' ] );
		add_filter( 'woocommerce_report_orders_prepare_export_item', [ $this, 'add_export_value' ], 10, 2 );
		add_filter( 'woocommerce_admin_reports', [ $this, 'add_report' ] );
		add_action( 'admin_enqueue_scripts', [ $this, 'enqueue' ] );
	}

	/**
	 * Modules the filter offers, id => name.
	 *
	 * @since 3.0.0
	 *
	 * @return array<string, string>
	 */
	public static function modules(): array {
		$manager = storegrowth_get_container()->get( ModuleManager::class );
		$modules = [];

		foreach ( [ UpsellOrderBumpModule::get_id(), BoGoModule::get_id(), CountdownTimerModule::get_id() ] as $id ) {
			$module         = $manager->get( $id );
			$modules[ $id ] = $module ? $module->get_name() : $id;
		}

		return $modules;
	}

	/**
	 * The filter's value in this request: `any`, a module id, or '' for none.
	 *
	 * WooCommerce's report controllers keep only the params they know, so
	 * it's read from the request URL, as Dokan's vendor filter does.
	 *
	 * @since 3.0.0
	 *
	 * @return string
	 */
	public static function selected(): string {
		if ( null !== self::$export_offer ) {
			$value = self::$export_offer;
		} else {
			// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- a read-only report filter, checked against a fixed list.
			$value = isset( $_GET[ self::PARAM ] ) && is_string( $_GET[ self::PARAM ] ) ? sanitize_key( wp_unslash( $_GET[ self::PARAM ] ) ) : '';
		}

		return ( self::ANY === $value || isset( self::modules()[ $value ] ) ) && Schema::is_installed() ? $value : '';
	}

	/**
	 * Add the filter to the query args, so WooCommerce caches filtered and
	 * unfiltered results apart.
	 *
	 * @since 3.0.0
	 *
	 * @param array $args Query args.
	 *
	 * @return array
	 */
	public function add_query_arg( $args ) {
		$selected = self::selected();
		if ( '' !== $selected && is_array( $args ) ) {
			$args[ self::PARAM ] = $selected;
		}

		return $args;
	}

	/**
	 * Lookup rows for the selected filter, as SQL.
	 *
	 * @since 3.0.0
	 *
	 * @param string $columns Columns to select.
	 *
	 * @return string
	 */
	protected function lookup_subquery( string $columns ): string {
		global $wpdb;

		$table    = $wpdb->prefix . Schema::OFFER_LOOKUP;
		$selected = self::selected();

		// The table name is a constant; the module is a placeholder.
		// phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		return self::ANY === $selected
			? "SELECT {$columns} FROM {$table} WHERE module <> ''"
			: $wpdb->prepare( "SELECT {$columns} FROM {$table} WHERE module = %s", $selected );
		// phpcs:enable
	}

	/**
	 * The filter of an export, from its report args.
	 *
	 * @since 3.0.0
	 *
	 * @param mixed $args Report args.
	 *
	 * @return void
	 */
	protected static function set_export_offer( $args ): void {
		$value = is_array( $args ) && isset( $args[ self::PARAM ] ) && is_string( $args[ self::PARAM ] ) ? $args[ self::PARAM ] : '';

		self::$export_offer = sanitize_key( $value );
	}

	/**
	 * A report export request (`POST wc-analytics/reports/<type>/export`)
	 * counts its rows right away: read the filter from its `report_args`.
	 *
	 * @since 3.0.0
	 *
	 * @param mixed           $response Response so far.
	 * @param array           $handler  Route handler.
	 * @param WP_REST_Request $request  Request.
	 *
	 * @return mixed
	 */
	public function read_export_request( $response, $handler, $request ) {
		if ( $request instanceof WP_REST_Request && preg_match( '#^/wc-analytics/reports/[a-z0-9_/-]+/export$#', $request->get_route() ) ) {
			self::set_export_offer( $request->get_param( 'report_args' ) );
		}

		return $response;
	}

	/**
	 * A report export batch (Action Scheduler) runs with its args only.
	 *
	 * @since 3.0.0
	 *
	 * @param int    $page_number Batch.
	 * @param string $export_id   Export id.
	 * @param string $report_type Report type.
	 * @param array  $report_args Report args.
	 *
	 * @return void
	 */
	public function read_export_batch( $page_number, $export_id, $report_type, $report_args ): void {
		self::set_export_offer( $report_args );
	}

	/**
	 * The Offer column in the Orders report's CSV.
	 *
	 * @since 3.0.0
	 *
	 * @param array $columns Column id => label.
	 *
	 * @return array
	 */
	public function add_export_column( $columns ) {
		if ( is_array( $columns ) && Schema::is_installed() ) {
			$columns[ self::PARAM ] = __( 'Offer', 'storegrowth-sales-booster' );
		}

		return $columns;
	}

	/**
	 * An order's offers in the CSV, by module name.
	 *
	 * @since 3.0.0
	 *
	 * @param array $row  Export row.
	 * @param array $item Report row.
	 *
	 * @return array
	 */
	public function add_export_value( $row, $item ) {
		if ( ! is_array( $row ) || ! Schema::is_installed() ) {
			return $row;
		}

		$modules            = self::modules();
		$row[ self::PARAM ] = implode(
			', ',
			array_map(
				function ( $id ) use ( $modules ) {
					return $modules[ $id ] ?? $id;
				},
				(array) ( $item[ self::PARAM ] ?? [] )
			)
		);

		return $row;
	}

	/**
	 * Orders reports: keep orders with an offer line, and the refunds of
	 * those orders (a refund row has its own id; its `parent_id` is the
	 * order, and Dokan sub-orders, which also have a parent, are never
	 * negative).
	 *
	 * A subquery, not a join, so an order with several offer lines still
	 * counts once.
	 *
	 * @since 3.0.0
	 *
	 * @param array $clauses Where clauses.
	 *
	 * @return array
	 */
	public function where_orders( $clauses ) {
		global $wpdb;

		if ( '' === self::selected() || ! is_array( $clauses ) ) {
			return $clauses;
		}

		$stats     = "{$wpdb->prefix}wc_order_stats";
		$orders    = $this->lookup_subquery( 'order_id' );
		$clauses[] = "AND ( {$stats}.order_id IN ( {$orders} ) OR ( {$stats}.parent_id IN ( {$orders} ) AND {$stats}.total_sales < 0 ) )";

		return $clauses;
	}

	/**
	 * Products reports: keep offer lines (and their refund rows).
	 *
	 * @since 3.0.0
	 *
	 * @param array $clauses Where clauses.
	 *
	 * @return array
	 */
	public function where_lines( $clauses ) {
		global $wpdb;

		if ( '' === self::selected() || ! is_array( $clauses ) ) {
			return $clauses;
		}

		$lookup    = "{$wpdb->prefix}wc_order_product_lookup";
		$clauses[] = "AND ( {$lookup}.order_item_id, {$lookup}.order_id ) IN ( " . $this->lookup_subquery( 'order_item_id, order_id' ) . ' )';

		return $clauses;
	}

	/**
	 * The modules each order of an Orders report page had offers from, in
	 * one query for the page.
	 *
	 * @since 3.0.0
	 *
	 * @param object|array $results Report results (`data`: rows with `order_id`).
	 *
	 * @return object|array
	 */
	public function add_order_offers( $results ) {
		global $wpdb;

		if ( ! is_object( $results ) || empty( $results->data ) || ! is_array( $results->data ) || ! Schema::is_installed() ) {
			return $results;
		}

		$ids = array_filter( array_map( 'intval', wp_list_pluck( $results->data, 'order_id' ) ) );
		if ( ! $ids ) {
			return $results;
		}

		$table = $wpdb->prefix . Schema::OFFER_LOOKUP;
		$in    = implode( ', ', array_fill( 0, count( $ids ), '%d' ) );

		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.PreparedSQLPlaceholders.UnfinishedPrepare, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- the table name is a constant, the IN list is placeholders.
		$rows = $wpdb->get_results( $wpdb->prepare( "SELECT DISTINCT order_id, module FROM {$table} WHERE module <> '' AND order_id IN ( {$in} )", $ids ), ARRAY_A );

		$offers = [];
		foreach ( (array) $rows as $row ) {
			$offers[ (int) $row['order_id'] ][] = $row['module'];
		}

		foreach ( $results->data as $index => $order ) {
			$results->data[ $index ][ self::PARAM ] = $offers[ (int) ( $order['order_id'] ?? 0 ) ] ?? [];
		}

		return $results;
	}

	/**
	 * Keep the order's offers in the Orders report response.
	 *
	 * @since 3.0.0
	 *
	 * @param WP_REST_Response $response Response.
	 * @param array            $report   Report row.
	 *
	 * @return WP_REST_Response
	 */
	public function prepare_order( $response, $report ) {
		if ( $response instanceof WP_REST_Response && is_array( $report ) && Schema::is_installed() ) {
			$data                = $response->get_data();
			$data[ self::PARAM ] = $report[ self::PARAM ] ?? [];
			$response->set_data( $data );
		}

		return $response;
	}

	/**
	 * List the offer stats endpoint among WooCommerce's reports, so the
	 * Overview can show its revenue as a performance indicator.
	 *
	 * @since 3.0.0
	 *
	 * @param array $reports Reports.
	 *
	 * @return array
	 */
	public function add_report( $reports ) {
		if ( ! is_array( $reports ) || ! Schema::is_installed() ) {
			return $reports;
		}

		$reports[] = [
			'slug'        => OffersStatsController::SLUG,
			'description' => __( 'StoreGrowth offer revenue.', 'storegrowth-sales-booster' ),
			// No WooCommerce report page: the indicator links nowhere.
			'url'         => '',
		];

		return $reports;
	}

	/**
	 * The filter and column bundle, on WooCommerce Analytics pages only.
	 *
	 * @since 3.0.0
	 *
	 * @return void
	 */
	public function enqueue(): void {
		$asset_file = Helper::get_plugin_path( 'build/wc-analytics.asset.php' );

		if ( ! Schema::is_installed() || ! file_exists( $asset_file ) || ! class_exists( PageController::class ) || ! PageController::is_admin_page() ) {
			return;
		}

		$asset = require $asset_file;

		wp_enqueue_script(
			'spsg-wc-analytics',
			Helper::get_plugin_url( 'build/wc-analytics.js' ),
			$asset['dependencies'],
			$asset['version'],
			true
		);
		wp_set_script_translations( 'spsg-wc-analytics', 'storegrowth-sales-booster', Helper::get_plugin_path( 'languages' ) );
		wp_localize_script( 'spsg-wc-analytics', 'spsgWcAnalytics', [ 'modules' => self::modules() ] );
	}
}
