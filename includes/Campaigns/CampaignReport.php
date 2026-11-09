<?php
/**
 * What campaigns earned (ADR-012, ADR-016).
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Campaigns;

use Automattic\WooCommerce\Admin\API\Reports\Orders\Stats\DataStore as OrdersStatsDataStore;
use DateTimeImmutable;
use StorePulse\StoreGrowth\Analytics\AnalyticsController;
use StorePulse\StoreGrowth\Analytics\Reports\Offers\DataStore as OffersDataStore;
use StorePulse\StoreGrowth\Analytics\Reports\Offers\Stats\DataStore as OffersStatsDataStore;
use StorePulse\StoreGrowth\Analytics\Schema;
use StorePulse\StoreGrowth\Offers\CampaignRepository;
use StorePulse\StoreGrowth\Support\SiteTime;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Reads campaign figures from the offer report data stores (WooCommerce
 * Analytics). Campaign revenue is the product net revenue of every line of a
 * stamped order; shipping and tax aren't counted.
 *
 * @since SPSG_VERSION
 */
class CampaignReport {

	/**
	 * Whether reports can be read yet.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return bool
	 */
	private static function ready(): bool {
		return Schema::has_promotions() && AnalyticsController::analytics_enabled();
	}

	/**
	 * A window as the data stores want it.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param DateTimeImmutable $start First moment.
	 * @param DateTimeImmutable $end   Last moment.
	 *
	 * @return array
	 */
	private static function range( DateTimeImmutable $start, DateTimeImmutable $end ): array {
		return [
			'after'  => $start->format( 'Y-m-d H:i:s' ),
			'before' => $end->format( 'Y-m-d H:i:s' ),
		];
	}

	/**
	 * One campaign's figures.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array $campaign Campaign.
	 *
	 * @return array
	 */
	public static function for_campaign( array $campaign ): array {
		$now      = SiteTime::now();
		$start    = SiteTime::parse( $campaign['starts_at'] ?? null );
		$end      = SiteTime::parse( $campaign['ends_at'] ?? null, true );
		$status   = CampaignRepository::status_at( $campaign, $now );
		$baseline = (array) ( $campaign['settings']['baseline'] ?? [] );
		$empty    = [
			'revenue'    => 0.0,
			'orders'     => 0,
			'aov'        => 0.0,
			'aov_change' => null,
			'acceptance' => null,
			'daily'      => [],
			'surfaces'   => [],
			'store'      => null,
		];

		if ( ! $start || ! self::ready() || $start > $now ) {
			return $empty;
		}

		$window = self::range( $start, $end && $end < $now ? $end : $now );
		$args   = array_merge(
			$window,
			[
				'spsg_role'      => [],
				'spsg_promotion' => (int) $campaign['id'],
				'interval'       => 'day',
				'per_page'       => (int) $start->diff( $end && $end < $now ? $end : $now )->days + 1,
			]
		);
		$stats  = ( new OffersStatsDataStore() )->get_data( $args );

		if ( is_wp_error( $stats ) ) {
			return $empty;
		}

		$revenue = (float) $stats->totals->net_revenue;
		$orders  = (int) $stats->totals->orders_count;
		$aov     = $orders ? $revenue / $orders : 0.0;
		$daily   = [];

		foreach ( (array) $stats->intervals as $interval ) {
			$daily[ substr( (string) $interval['date_start'], 0, 10 ) ] = round( (float) $interval['subtotals']->net_revenue, 2 );
		}

		ksort( $daily );

		return array_merge(
			$empty,
			[
				'revenue'    => round( $revenue, 2 ),
				'orders'     => $orders,
				'aov'        => round( $aov, 2 ),
				'aov_change' => ! empty( $baseline['aov'] ) && $orders ? round( ( $aov - (float) $baseline['aov'] ) / (float) $baseline['aov'] * 100, 1 ) : null,
				'acceptance' => self::acceptance( $campaign, $orders ),
				'daily'      => $daily,
				'surfaces'   => self::surfaces( $window, (int) $campaign['id'] ),
				'store'      => self::store_during( $campaign, $status, $start, $end, $now ),
			]
		);
	}

	/**
	 * Revenue, orders and best surface over a period, with each campaign's
	 * figures (the list page).
	 *
	 * @since SPSG_VERSION
	 *
	 * @param DateTimeImmutable $start First moment.
	 * @param DateTimeImmutable $end   Last moment.
	 *
	 * @return array
	 */
	public static function summary( DateTimeImmutable $start, DateTimeImmutable $end ): array {
		$empty = [
			'revenue'     => 0.0,
			'orders'      => 0,
			'store_share' => 0.0,
			'aov_lift'    => null,
			'best'        => [
				'surface' => '',
				'share'   => 0.0,
			],
			'weekly'      => [],
			'campaigns'   => [],
		];

		if ( ! self::ready() ) {
			return $empty;
		}

		$range  = self::range( $start, $end );
		$weeks  = max( 1, (int) ceil( ( $end->getTimestamp() - $start->getTimestamp() ) / WEEK_IN_SECONDS ) + 1 );
		$totals = ( new OffersStatsDataStore() )->get_data(
			array_merge(
				$range,
				[
					'spsg_role'      => [],
					'spsg_promotion' => 'any',
					'interval'       => 'week',
					'per_page'       => $weeks,
				]
			)
		);

		if ( is_wp_error( $totals ) ) {
			return $empty;
		}

		$revenue = (float) $totals->totals->net_revenue;
		$orders  = (int) $totals->totals->orders_count;
		$store   = self::store_totals( $range );
		$weekly  = [];

		foreach ( (array) $totals->intervals as $interval ) {
			$weekly[] = [
				'date'    => substr( (string) $interval['date_start'], 0, 10 ),
				'revenue' => round( (float) $interval['subtotals']->net_revenue, 2 ),
			];
		}

		usort(
			$weekly,
			static function ( array $first, array $second ): int {
				return strcmp( $first['date'], $second['date'] );
			}
		);

		$surfaces  = self::surfaces( $range, 'any' );
		$campaigns = ( new OffersDataStore() )->get_data(
			array_merge(
				$range,
				[
					'spsg_role'      => [],
					'spsg_promotion' => 'any',
					'spsg_group'     => 'promotion',
					'per_page'       => 100,
				]
			)
		);

		$per_campaign = [];

		foreach ( is_wp_error( $campaigns ) ? [] : $campaigns->data as $row ) {
			$per_campaign[ (int) $row['group_key'] ] = [
				'revenue' => (float) $row['net_revenue'],
				'orders'  => (int) $row['orders_count'],
			];
		}

		return [
			'revenue'     => round( $revenue, 2 ),
			'orders'      => $orders,
			'store_share' => $store['revenue'] > 0 ? round( $revenue / $store['revenue'] * 100, 1 ) : 0.0,
			'aov_lift'    => self::lift( $revenue, $orders, $store['revenue'], $store['orders'] ),
			'best'        => $surfaces ? self::best_surface( $surfaces ) : $empty['best'],
			'weekly'      => $weekly,
			'campaigns'   => $per_campaign,
		];
	}

	/**
	 * Percent change in AOV between campaign orders and the store's others.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param float $revenue       Campaign revenue.
	 * @param int   $orders        Campaign orders.
	 * @param float $store_revenue Store revenue.
	 * @param int   $store_orders  Store orders.
	 *
	 * @return float|null
	 */
	private static function lift( float $revenue, int $orders, float $store_revenue, int $store_orders ): ?float {
		$other_orders  = $store_orders - $orders;
		$other_revenue = $store_revenue - $revenue;

		if ( ! $orders || $other_orders <= 0 || $other_revenue <= 0 ) {
			return null;
		}

		$other_aov = $other_revenue / $other_orders;

		return round( ( $revenue / $orders - $other_aov ) / $other_aov * 100, 1 );
	}

	/**
	 * Share of orders led by each surface.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array      $range     Window.
	 * @param int|string $promotion Campaign id, or `any`.
	 *
	 * @return array<string, int> Surface => orders; `direct` for no surface.
	 */
	private static function surfaces( array $range, $promotion ): array {
		$rows = ( new OffersDataStore() )->get_data(
			array_merge(
				$range,
				[
					'spsg_role'      => [],
					'spsg_promotion' => $promotion,
					'spsg_group'     => 'surface',
					'per_page'       => 20,
				]
			)
		);

		if ( is_wp_error( $rows ) ) {
			return [];
		}

		$surfaces = [];

		foreach ( $rows->data as $row ) {
			$surfaces[ '' !== $row['group_key'] ? (string) $row['group_key'] : 'direct' ] = (int) $row['orders_count'];
		}

		return $surfaces;
	}

	/**
	 * The surface with the most orders and its share.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array<string, int> $surfaces Surface => orders.
	 *
	 * @return array{surface: string, share: float}
	 */
	private static function best_surface( array $surfaces ): array {
		arsort( $surfaces );
		$total = (int) array_sum( $surfaces );

		return [
			'surface' => (string) array_key_first( $surfaces ),
			'share'   => $total ? round( reset( $surfaces ) / $total * 100, 1 ) : 0.0,
		];
	}

	/**
	 * Share of carts that qualified and checked out.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array $campaign Campaign.
	 * @param int   $orders   Campaign orders.
	 *
	 * @return float|null
	 */
	private static function acceptance( array $campaign, int $orders ): ?float {
		global $wpdb;

		$table = $wpdb->prefix . Schema::DAILY;
		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- the table name is a constant.
		$carts = (int) $wpdb->get_var( $wpdb->prepare( "SELECT SUM( count ) FROM {$table} WHERE module = %s AND metric = %s AND object_type = %s AND object_id = %d", 'campaigns', 'qualified', 'promotion', (int) $campaign['id'] ) );

		return $carts ? min( 100.0, round( $orders / $carts * 100, 1 ) ) : null;
	}

	/**
	 * The store's revenue and orders in a window (context, not credit).
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array $range Window.
	 *
	 * @return array{revenue: float, orders: int}
	 */
	private static function store_totals( array $range ): array {
		$stats = ( new OrdersStatsDataStore() )->get_data( array_merge( $range, [ 'fields' => [ 'net_revenue', 'orders_count' ] ] ) );

		if ( is_wp_error( $stats ) || ! isset( $stats->totals ) ) {
			return [
				'revenue' => 0.0,
				'orders'  => 0,
			];
		}

		return [
			'revenue' => (float) $stats->totals->net_revenue,
			'orders'  => (int) $stats->totals->orders_count,
		];
	}

	/**
	 * "Store during campaign": revenue in the window and the per-day change
	 * against the 30 days before. Not shown for always-on, draft or scheduled.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array                  $campaign Campaign.
	 * @param string                 $status   Status now.
	 * @param DateTimeImmutable      $start    Start.
	 * @param DateTimeImmutable|null $end      End.
	 * @param DateTimeImmutable      $now      Moment.
	 *
	 * @return array|null `revenue` and `change`.
	 */
	public static function store_during( array $campaign, string $status, DateTimeImmutable $start, ?DateTimeImmutable $end, DateTimeImmutable $now ): ?array {
		if ( ! $end || in_array( $status, [ CampaignRepository::STATUS_DRAFT, CampaignRepository::STATUS_SCHEDULED ], true ) ) {
			return null;
		}

		$until    = $end < $now ? $end : $now;
		$days     = max( 1, (int) ceil( ( $until->getTimestamp() - $start->getTimestamp() ) / DAY_IN_SECONDS ) );
		$store    = self::store_totals( self::range( $start, $until ) );
		$baseline = (array) ( $campaign['settings']['baseline'] ?? [] );
		$before   = (float) ( $baseline['revenue_per_day'] ?? 0 );
		$per_day  = $store['revenue'] / $days;

		return [
			'revenue' => round( $store['revenue'], 2 ),
			'change'  => $before > 0 ? round( ( $per_day - $before ) / $before * 100, 1 ) : null,
		];
	}

	/**
	 * The 30 days before a campaign's start, frozen when it is published.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param DateTimeImmutable $start Campaign start.
	 *
	 * @return array{revenue_per_day: float, aov: float}
	 */
	public static function baseline( DateTimeImmutable $start ): array {
		if ( ! self::ready() ) {
			return [
				'revenue_per_day' => 0.0,
				'aov'             => 0.0,
			];
		}

		$store = self::store_totals( self::range( $start->modify( '-30 days' ), $start ) );

		return [
			'revenue_per_day' => round( $store['revenue'] / 30, 2 ),
			'aov'             => $store['orders'] ? round( $store['revenue'] / $store['orders'], 2 ) : 0.0,
		];
	}
}
