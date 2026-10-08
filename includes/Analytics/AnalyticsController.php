<?php
/**
 * Analytics report endpoint and dashboard revenue (ADR-012).
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Analytics;

use DateTime;
use StorePulse\StoreGrowth\Analytics\Reports\FreeShippingBar;
use StorePulse\StoreGrowth\Analytics\Reports\Offers\DataStore as OffersDataStore;
use StorePulse\StoreGrowth\Analytics\Reports\Offers\Stats\DataStore as OffersStatsDataStore;
use StorePulse\StoreGrowth\Interfaces\HookRegistry;
use StorePulse\StoreGrowth\Modules\BoGo\BogoDataManager;
use StorePulse\StoreGrowth\Modules\BoGo\BoGoModule;
use StorePulse\StoreGrowth\Modules\CountdownTimer\CountdownTimerModule;
use StorePulse\StoreGrowth\Modules\CountdownTimer\Helper as CountdownHelper;
use StorePulse\StoreGrowth\Modules\ProgressiveDiscountBanner\ProgressiveDiscountBannerModule;
use StorePulse\StoreGrowth\Modules\UpsellOrderBump\Database\Migration as OrderBumpTable;
use StorePulse\StoreGrowth\Modules\UpsellOrderBump\UpsellOrderBumpModule;
use WP_Error;
use WP_REST_Controller;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * `GET sales-booster/v1/analytics`: the analytics overview, per module and
 * per campaign, for a date range. Fills the dashboard's revenue figure too.
 *
 * Money comes from the offer report data stores (WooCommerce Analytics),
 * counts from `spsg_analytics_daily`. Lite reads the last 30 days and the
 * top campaigns; Pro lifts both (`spsg_analytics_report` filter and the
 * `storegrowth_pro_is_active` check).
 *
 * @since SPSG_VERSION
 */
class AnalyticsController extends WP_REST_Controller implements HookRegistry {

	/**
	 * Route namespace.
	 *
	 * @var string
	 */
	protected $namespace = 'sales-booster/v1';

	/**
	 * Route base.
	 *
	 * @var string
	 */
	protected $rest_base = 'analytics';

	/**
	 * Days Lite can look back.
	 */
	const LITE_DAYS = 30;

	/**
	 * Campaign rows Lite shows.
	 */
	const LITE_CAMPAIGNS = 3;

	/**
	 * Register hooks.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return void
	 */
	public function register_hooks(): void {
		add_filter( 'spsg_dashboard_overview', [ $this, 'add_dashboard_revenue' ] );
	}

	/**
	 * Register the route.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return void
	 */
	public function register_routes(): void {
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base,
			[
				[
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => [ $this, 'get_report' ],
					'permission_callback' => [ $this, 'permissions_check' ],
					'args'                => [
						'days'   => [
							'description' => __( 'The last N days up to today (store time). Ignored when after or before is given.', 'storegrowth-sales-booster' ),
							'type'        => 'integer',
							'minimum'     => 1,
							'maximum'     => 366,
						],
						'after'  => [
							'description'       => __( 'First day, Y-m-d.', 'storegrowth-sales-booster' ),
							'type'              => 'string',
							'validate_callback' => [ $this, 'validate_day' ],
						],
						'before' => [
							'description'       => __( 'Last day, Y-m-d.', 'storegrowth-sales-booster' ),
							'type'              => 'string',
							'validate_callback' => [ $this, 'validate_day' ],
						],
					],
				],
			]
		);
	}

	/**
	 * Whether a value is a real `Y-m-d` day.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param mixed $value Value.
	 *
	 * @return bool
	 */
	public function validate_day( $value ): bool {
		$day = is_string( $value ) ? DateTime::createFromFormat( '!Y-m-d', $value ) : false;

		return $day && $day->format( 'Y-m-d' ) === $value;
	}

	/**
	 * Shop managers and administrators.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return bool
	 */
	public function permissions_check(): bool {
		return current_user_can( 'manage_woocommerce' );
	}

	/**
	 * Whether StoreGrowth Pro is active.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return bool
	 */
	protected function is_pro(): bool {
		return function_exists( 'sp_store_growth' ) && sp_store_growth()->has_pro();
	}

	/**
	 * The report.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param WP_REST_Request $request Request.
	 *
	 * @return WP_REST_Response|WP_Error
	 */
	public function get_report( $request ) {
		list( $after, $before, $limited ) = $this->range(
			(string) $request->get_param( 'after' ),
			(string) $request->get_param( 'before' ),
			(int) $request->get_param( 'days' )
		);

		$report = [
			'status' => [
				'installed'         => Schema::is_installed(),
				'analytics_enabled' => self::analytics_enabled(),
				'pro'               => $this->is_pro(),
				'currency'          => get_woocommerce_currency(),
				'price_format'      => [
					'symbol'             => html_entity_decode( get_woocommerce_currency_symbol(), ENT_QUOTES, get_bloginfo( 'charset' ) ),
					'format'             => get_woocommerce_price_format(),
					'decimals'           => wc_get_price_decimals(),
					'decimal_separator'  => wc_get_price_decimal_separator(),
					'thousand_separator' => wc_get_price_thousand_separator(),
				],
				'after'             => $after,
				'before'            => $before,
				'range_limited'     => $limited,
			],
		];

		if ( ! $report['status']['installed'] ) {
			return rest_ensure_response( $report );
		}

		$counts    = $this->counts( $after, $before );
		$countdown = CountdownTimerModule::get_id();

		// Without WooCommerce Analytics there is no money to read; counts still show.
		if ( ! $report['status']['analytics_enabled'] ) {
			$report['modules'] = [];
			foreach ( self::module_ids() as $module ) {
				$report['modules'][ $module ] = array_merge( $this->figures( [] ), [ 'counts' => (object) ( $counts[ $module ]['all'] ?? [] ) ] );
			}
			$report['modules'][ $countdown ]['add_to_cart_rate'] = self::add_to_cart_rate( $counts[ $countdown ]['all'] ?? [] );

			$report['modules'][ ProgressiveDiscountBannerModule::get_id() ] = $this->free_shipping_bar( $after, $before, $counts, false );

			return $this->respond( $report, $request );
		}

		$args = [
			'after'    => $after . ' 00:00:00',
			'before'   => $before . ' 23:59:59',
			'interval' => 'day',
			// One interval per day of the range, all on one page.
			'per_page' => (int) ( new DateTime( $after ) )->diff( new DateTime( $before ) )->days + 1,
		];

		$stats = ( new OffersStatsDataStore() )->get_data( $args );
		if ( is_wp_error( $stats ) ) {
			return $stats;
		}

		$report['totals']    = $this->figures( $stats->totals );
		$report['intervals'] = array_map(
			function ( $interval ) {
				$subtotals = (object) $interval['subtotals'];

				return [
					'date'     => substr( (string) $interval['date_start'], 0, 10 ),
					'revenue'  => (float) $subtotals->net_revenue,
					'discount' => (float) $subtotals->discount,
				];
			},
			(array) $stats->intervals
		);

		// Oldest first, for the chart (WooCommerce returns the newest first).
		usort(
			$report['intervals'],
			function ( $a, $b ) {
				return strcmp( $a['date'], $b['date'] );
			}
		);

		$report['modules'] = $this->modules( $args, $counts );

		$report['modules'][ $countdown ]['add_to_cart_rate'] = self::add_to_cart_rate( $counts[ $countdown ]['all'] ?? [] );

		// Each day's revenue per module, for the chart's lines.
		foreach ( $report['intervals'] as $index => $interval ) {
			$report['intervals'][ $index ]['modules'] = (object) array_map(
				function ( $module ) use ( $interval ) {
					return $module['daily'][ $interval['date'] ] ?? 0.0;
				},
				$report['modules']
			);
		}
		foreach ( array_keys( $report['modules'] ) as $module ) {
			unset( $report['modules'][ $module ]['daily'] );
		}

		// The bar's discount is a fee: on its own card, not in the totals or the chart.
		$report['modules'][ ProgressiveDiscountBannerModule::get_id() ] = $this->free_shipping_bar( $after, $before, $counts, true );

		list( $campaigns, $total )   = $this->campaigns( $args, $counts );
		$report['campaigns_total']   = $total;
		$report['campaigns_limited'] = ! $this->is_pro() && $total > self::LITE_CAMPAIGNS;
		$report['campaigns']         = $report['campaigns_limited'] ? array_slice( $campaigns, 0, self::LITE_CAMPAIGNS ) : $campaigns;

		// Countdown Timer: per product; Lite shows as many as campaigns.
		list( $products, $total )   = $this->countdown_products( $args, $counts, $this->is_pro() ? 0 : self::LITE_CAMPAIGNS );
		$report['products']         = $products;
		$report['products_total']   = $total;
		$report['products_limited'] = count( $products ) < $total;

		return $this->respond( $report, $request );
	}

	/**
	 * The filtered report as a response.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array           $report  Report.
	 * @param WP_REST_Request $request Request.
	 *
	 * @return WP_REST_Response
	 */
	protected function respond( array $report, $request ) {
		/**
		 * Filters the analytics report.
		 *
		 * Pro adds what Lite leaves out (longer ranges, every campaign rows,
		 * period comparison, per-vendor figures).
		 *
		 * @since SPSG_VERSION
		 *
		 * @param array           $report  Report.
		 * @param WP_REST_Request $request Request.
		 */
		return rest_ensure_response( apply_filters( 'spsg_analytics_report', $report, $request ) );
	}

	/**
	 * The date range: the request's, the last `$days` days, or the last 30
	 * days, never past today (store time). Lite reads no earlier than 30
	 * days ago.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param string $after  First day, `Y-m-d`, or ''.
	 * @param string $before Last day, `Y-m-d`, or ''.
	 * @param int    $days   The last N days, when neither day is given; 0 for none.
	 *
	 * @return array{0: string, 1: string, 2: bool} First day, last day, whether Lite shortened it.
	 */
	protected function range( string $after, string $before, int $days = 0 ): array {
		$today    = current_datetime();
		$earliest = $today->modify( '-' . ( self::LITE_DAYS - 1 ) . ' days' )->format( 'Y-m-d' );
		$limited  = false;

		// The last N days, in store time, unless the request names the days.
		if ( $days > 0 && '' === $after && '' === $before ) {
			$after = $today->modify( '-' . ( $days - 1 ) . ' days' )->format( 'Y-m-d' );
		}

		// Never past today; a range that runs backwards becomes one day.
		$before = min( $before ? $before : $today->format( 'Y-m-d' ), $today->format( 'Y-m-d' ) );
		$after  = min( $after ? $after : $earliest, $before );

		// Lite reads the last 30 days only, whatever the request asks.
		if ( ! $this->is_pro() && $after < $earliest ) {
			$after   = $earliest;
			$before  = max( $before, $earliest );
			$limited = true;
		}

		return [ $after, $before, $limited ];
	}

	/**
	 * Whether WooCommerce Analytics is on (the money comes from it).
	 *
	 * @since SPSG_VERSION
	 *
	 * @return bool
	 */
	public static function analytics_enabled(): bool {
		return 'yes' === get_option( 'woocommerce_analytics_enabled', 'yes' );
	}

	/**
	 * Modules with a report.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return string[]
	 */
	protected static function module_ids(): array {
		return [ UpsellOrderBumpModule::get_id(), BoGoModule::get_id(), CountdownTimerModule::get_id() ];
	}

	/**
	 * Money figures from a stats or rows entry.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param object|array $row Totals or a row.
	 *
	 * @return array{revenue: float, discount: float, orders: int, items: int}
	 */
	protected function figures( $row ): array {
		$row = (object) $row;

		return [
			'revenue'  => round( (float) ( $row->net_revenue ?? 0 ), 2 ),
			'discount' => round( (float) ( $row->discount ?? 0 ), 2 ),
			'orders'   => (int) ( $row->orders_count ?? 0 ),
			'items'    => (int) ( $row->items_sold ?? 0 ),
		];
	}

	/**
	 * Per module: money, counts, and the Order Bump and BOGO take rates.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array $args   Data store args.
	 * @param array $counts Counts from `counts()`.
	 *
	 * @return array<string, array>
	 */
	protected function modules( array $args, array $counts ): array {
		$stats   = new OffersStatsDataStore();
		$modules = [];

		foreach ( self::module_ids() as $module ) {
			$totals = $stats->get_data( array_merge( $args, [ 'spsg_module' => $module ] ) );

			$modules[ $module ] = array_merge(
				$this->figures( is_wp_error( $totals ) ? [] : $totals->totals ),
				[
					'counts' => (object) ( $counts[ $module ]['all'] ?? [] ),
					'daily'  => self::daily_revenue( is_wp_error( $totals ) ? [] : (array) $totals->intervals ),
				]
			);
		}

		// BOGO trigger lines: revenue the offer drew, not in the total.
		$triggers = $stats->get_data( array_merge( $args, [ 'spsg_role' => [ 'trigger' ] ] ) );
		$bogo     = BoGoModule::get_id();

		$modules[ $bogo ]['trigger_revenue'] = is_wp_error( $triggers ) ? 0.0 : round( (float) $triggers->totals->net_revenue, 2 );

		// The chart's BOGO line: gifts plus the products that unlocked them.
		foreach ( self::daily_revenue( is_wp_error( $triggers ) ? [] : (array) $triggers->intervals ) as $day => $revenue ) {
			$modules[ $bogo ]['daily'][ $day ] = round( ( $modules[ $bogo ]['daily'][ $day ] ?? 0 ) + $revenue, 2 );
		}

		// Take rate: orders with the bump (or a gift) per bump (or offer) view.
		foreach ( [ UpsellOrderBumpModule::get_id(), $bogo ] as $module ) {
			$modules[ $module ]['take_rate'] = self::rate( $modules[ $module ]['orders'], $counts[ $module ]['all']['view'] ?? 0 );
		}

		return $modules;
	}

	/**
	 * Revenue per day from stats intervals.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array $intervals WooCommerce stats intervals.
	 *
	 * @return array<string, float> `Y-m-d` => revenue.
	 */
	protected static function daily_revenue( array $intervals ): array {
		$daily = [];
		foreach ( $intervals as $interval ) {
			$daily[ substr( (string) $interval['date_start'], 0, 10 ) ] = round( (float) ( (object) $interval['subtotals'] )->net_revenue, 2 );
		}

		return $daily;
	}

	/**
	 * Per campaign: money, name, counts and take rate, by revenue.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array $args   Data store args.
	 * @param array $counts Counts from `counts()`.
	 *
	 * @return array{0: array[], 1: int} Campaigns (up to 100), and how many there are.
	 */
	protected function campaigns( array $args, array $counts ): array {
		$rows = ( new OffersDataStore() )->get_data( array_merge( $args, [ 'per_page' => 100 ] ) );
		if ( is_wp_error( $rows ) ) {
			return [ [], 0 ];
		}

		$names     = $this->campaign_names( wp_list_pluck( $rows->data, 'group_key' ) );
		$campaigns = [];
		$total     = (int) $rows->total;

		foreach ( $rows->data as $row ) {
			$campaign_id = (string) $row['group_key'];
			if ( '' === $campaign_id ) {
				// Countdown lines: per product, not per campaign.
				--$total;
				continue;
			}

			list( , $id )    = array_pad( explode( ':', $campaign_id, 2 ), 2, '0' );
			$module          = (string) $row['module'];
			$campaign_counts = $counts[ $module ][ Counter::CAMPAIGN ][ (int) $id ] ?? [];

			$campaigns[] = array_merge(
				[
					'id'     => $campaign_id,
					'module' => $module,
					'name'   => $names[ $campaign_id ] ?? '',
				],
				$this->figures( $row ),
				[
					'counts'    => (object) $campaign_counts,
					// Orders per view (bump, BOGO offer); null without views.
					'take_rate' => self::rate( (int) $row['orders_count'], $campaign_counts['view'] ?? 0 ),
				]
			);
		}

		return [ $campaigns, max( 0, $total ) ];
	}

	/**
	 * Countdown Timer products: money from lines sold during a timer, and
	 * the timer's views and add-to-carts, by revenue, then views.
	 *
	 * A product seen or added with no sale at a timer price and no valid
	 * timer discount now (`intval` outside 1–100) is "timer only".
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array $args   Data store args.
	 * @param array $counts Counts from `counts()`.
	 * @param int   $limit  Most rows to return; 0 for all.
	 *
	 * @return array{0: array[], 1: int} Products, and how many there are.
	 */
	protected function countdown_products( array $args, array $counts, int $limit ): array {
		$module = CountdownTimerModule::get_id();
		$rows   = ( new OffersDataStore() )->get_data(
			array_merge(
				$args,
				[
					'spsg_module' => $module,
					'spsg_group'  => 'product',
					'per_page'    => 100,
				]
			)
		);
		$sold   = is_wp_error( $rows ) ? [] : array_column( $rows->data, null, 'group_key' );
		$seen   = $counts[ $module ][ Counter::PRODUCT ] ?? [];

		$products = [];
		foreach ( array_unique( array_merge( array_keys( $sold ), array_keys( $seen ) ) ) as $id ) {
			$product_counts = $seen[ $id ] ?? [];

			$products[] = array_merge(
				[ 'id' => (int) $id ],
				$this->figures( $sold[ $id ] ?? [] ),
				[
					'counts'           => (object) $product_counts,
					'add_to_cart_rate' => self::add_to_cart_rate( $product_counts ),
					'timer_only'       => ! isset( $sold[ $id ] ) && ! CountdownHelper::discount_percentage( (int) $id ),
				]
			);
		}

		usort(
			$products,
			function ( $a, $b ) {
				return [ $b['revenue'], $b['counts']->view ?? 0, $a['id'] ] <=> [ $a['revenue'], $a['counts']->view ?? 0, $b['id'] ];
			}
		);

		$total = count( $products );
		if ( $limit ) {
			$products = array_slice( $products, 0, $limit );
		}

		// Names of the rows shown only, as text (titles can be stored with entities).
		foreach ( $products as $index => $row ) {
			$product = wc_get_product( $row['id'] );

			$products[ $index ]['name'] = $product ? html_entity_decode( $product->get_name(), ENT_QUOTES, get_bloginfo( 'charset' ) ) : '';
		}

		return [ $products, $total ];
	}

	/**
	 * Names of BOGO offers and order bumps, by campaign id.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param string[] $campaign_ids Campaign ids.
	 *
	 * @return array<string, string>
	 */
	protected function campaign_names( array $campaign_ids ): array {
		global $wpdb;

		$ids = [
			'bogo'       => [],
			'order_bump' => [],
		];
		foreach ( $campaign_ids as $campaign_id ) {
			list( $type, $id ) = array_pad( explode( ':', (string) $campaign_id, 2 ), 2, '0' );
			if ( isset( $ids[ $type ] ) && (int) $id ) {
				$ids[ $type ][] = (int) $id;
			}
		}

		$tables = [
			'bogo'       => $wpdb->prefix . BogoDataManager::TABLE_NAME,
			'order_bump' => $wpdb->prefix . OrderBumpTable::TABLE_NAME,
		];
		$names  = [];

		foreach ( $ids as $type => $type_ids ) {
			if ( ! $type_ids ) {
				continue;
			}

			$in = implode( ', ', array_fill( 0, count( $type_ids ), '%d' ) );

			// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.PreparedSQLPlaceholders.UnfinishedPrepare, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- table names are constants, the IN list is placeholders.
			$rows = $wpdb->get_results( $wpdb->prepare( "SELECT id, name FROM {$tables[ $type ]} WHERE id IN ( {$in} )", $type_ids ), ARRAY_A );

			foreach ( (array) $rows as $row ) {
				$names[ $type . ':' . $row['id'] ] = (string) $row['name'];
			}
		}

		return $names;
	}

	/**
	 * Counts in a range, by module and object, plus each module's sum.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param string $after  First day, `Y-m-d`.
	 * @param string $before Last day, `Y-m-d`.
	 *
	 * @return array<string, array> Module id => [ object type => [ object id => [ metric => count ] ], 'all' => [ metric => count ] ].
	 */
	protected function counts( string $after, string $before ): array {
		global $wpdb;

		$table = $wpdb->prefix . Schema::DAILY;

		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- the table name is a constant.
		$rows = $wpdb->get_results( $wpdb->prepare( "SELECT module, metric, object_type, object_id, SUM( count ) AS total FROM {$table} WHERE day BETWEEN %s AND %s GROUP BY module, metric, object_type, object_id", $after, $before ), ARRAY_A );

		$counts = [];
		foreach ( (array) $rows as $row ) {
			$module = $row['module'];
			$metric = $row['metric'];
			$total  = (int) $row['total'];

			$counts[ $module ][ $row['object_type'] ][ (int) $row['object_id'] ][ $metric ] = $total;

			$counts[ $module ]['all'][ $metric ] = ( $counts[ $module ]['all'][ $metric ] ?? 0 ) + $total;
		}

		return $counts;
	}

	/**
	 * Free Shipping Bar: orders that used its discount, the discount given,
	 * orders that met its threshold, and its counts (views, clicks,
	 * dismissals, sessions that reached the threshold).
	 *
	 * The discount is a fee, not offer revenue, so it isn't in the totals.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param string $after      First day, `Y-m-d`.
	 * @param string $before     Last day, `Y-m-d`.
	 * @param array  $counts     Counts from `counts()`.
	 * @param bool   $with_money Whether to read orders (WooCommerce Analytics is on).
	 *
	 * @return array
	 */
	protected function free_shipping_bar( string $after, string $before, array $counts, bool $with_money ): array {
		$figures = $with_money ? ( new FreeShippingBar() )->get_data( $after, $before ) : [
			'orders'               => 0,
			'discount'             => 0.0,
			'free_shipping_orders' => 0,
		];

		return array_merge(
			$this->figures( [] ),
			[
				'orders'           => $figures['orders'],
				'discount'         => $figures['discount'],
				'threshold_orders' => $figures['orders'] + $figures['free_shipping_orders'],
				'counts'           => (object) ( $counts[ ProgressiveDiscountBannerModule::get_id() ]['all'] ?? [] ),
			]
		);
	}

	/**
	 * A share as a percentage, or null without a base.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param int $part Part.
	 * @param int $base Base.
	 *
	 * @return float|null
	 */
	protected static function rate( int $part, int $base ): ?float {
		return $base > 0 ? round( 100 * $part / $base, 1 ) : null;
	}

	/**
	 * Add-to-carts per view, from a metric => count map (Countdown Timer).
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array<string, int> $counts Counts by metric.
	 *
	 * @return float|null
	 */
	protected static function add_to_cart_rate( array $counts ): ?float {
		return self::rate( $counts['add_to_cart'] ?? 0, $counts['view'] ?? 0 );
	}

	/**
	 * The dashboard's revenue figure: StoreGrowth revenue of the last 30 days.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array $overview Dashboard figures.
	 *
	 * @return array
	 */
	public function add_dashboard_revenue( $overview ) {
		// Without the tables or WooCommerce Analytics the tile keeps its "—".
		if ( ! is_array( $overview ) || null !== ( $overview['revenue'] ?? null ) || ! Schema::is_installed() || ! self::analytics_enabled() ) {
			return $overview;
		}

		list( $after, $before ) = $this->range( '', '' );

		$stats = ( new OffersStatsDataStore() )->get_data(
			[
				'after'    => $after . ' 00:00:00',
				'before'   => $before . ' 23:59:59',
				'interval' => 'day',
			]
		);

		if ( is_wp_error( $stats ) ) {
			return $overview;
		}

		$amount              = round( (float) $stats->totals->net_revenue, 2 );
		$overview['revenue'] = [
			'amount'    => $amount,
			'formatted' => html_entity_decode( wp_strip_all_tags( wc_price( $amount ) ), ENT_QUOTES, get_bloginfo( 'charset' ) ),
		];

		return $overview;
	}
}
