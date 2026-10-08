<?php
/**
 * Clauses shared by the offer report data stores (ADR-012).
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Analytics\Reports\Offers;

use StorePulse\StoreGrowth\Analytics\OfferLookup;
use StorePulse\StoreGrowth\Analytics\Schema;
use WeDevs\Dokan\Analytics\Reports\OrderType;
use WeDevs\Dokan\Analytics\Reports\Stock\QueryFilter as DokanQueryFilter;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Narrows a query on WooCommerce's `wc_order_product_lookup` to the lines
 * StoreGrowth modules touched. The using class defines `ALIAS` (the
 * `spsg_offer_lookup` alias) and is a WooCommerce report data store.
 *
 * Query args:
 * - `spsg_module`   Module id ('' for all).
 * - `spsg_campaign` Campaign id ('' for all), e.g. `bogo:12`.
 * - `spsg_role`     Roles to count: `reward`, `discounted` (default both, the
 *                   StoreGrowth total) or `trigger` (BOGO trigger lines).
 * - `spsg_vendor`   Dokan vendor id (0 for all). Filled from Dokan's own rule
 *                   by `scoped_args()`: a vendor reads only their orders, an
 *                   admin the vendor they picked (`sellers`).
 *
 * @since SPSG_VERSION
 */
trait OfferQuery {

	/**
	 * The StoreGrowth query args and their defaults.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return array
	 */
	protected function offer_query_vars(): array {
		return [
			'spsg_module'   => '',
			'spsg_campaign' => '',
			'spsg_role'     => [ OfferLookup::ROLE_REWARD, OfferLookup::ROLE_DISCOUNTED ],
			'spsg_vendor'   => 0,
		];
	}

	/**
	 * The query args with the Dokan vendor the current user may read, set
	 * before WooCommerce builds the cache key, so vendors' figures are
	 * cached apart.
	 *
	 * Dokan's reports scope by vendor in their own SQL contexts; these data
	 * stores have their own, so they apply Dokan's rule themselves.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array $query_args Query args.
	 *
	 * @return array
	 */
	protected function scoped_args( $query_args ): array {
		$query_args = (array) $query_args;

		if ( empty( $query_args['spsg_vendor'] ) && function_exists( 'dokan' ) && class_exists( DokanQueryFilter::class ) ) {
			$query_args['spsg_vendor'] = (int) dokan()->get_container()->get( DokanQueryFilter::class )->get_vendor_id();
		}

		return $query_args;
	}

	/**
	 * The error a report returns until the upgrade has created the tables.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return \WP_Error
	 */
	protected function not_installed_error(): \WP_Error {
		return new \WP_Error(
			'spsg_analytics_not_installed',
			__( 'Run the StoreGrowth database upgrade to see offer reports.', 'storegrowth-sales-booster' ),
			[ 'status' => 503 ]
		);
	}

	/**
	 * Joins: the lookup table, order stats unless already joined, and
	 * Dokan's order types when Dokan is active.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param bool $order_stats_joined Whether the query already joins wc_order_stats.
	 *
	 * @return string
	 */
	protected function offer_join( bool $order_stats_joined ): string {
		global $wpdb;

		$table = self::get_db_table_name();
		$alias = self::ALIAS;
		$join  = " JOIN {$wpdb->prefix}" . Schema::OFFER_LOOKUP . " AS {$alias}
			ON {$alias}.order_item_id = {$table}.order_item_id AND {$alias}.order_id = {$table}.order_id";

		if ( ! $order_stats_joined ) {
			$join .= " JOIN {$wpdb->prefix}wc_order_stats ON {$table}.order_id = {$wpdb->prefix}wc_order_stats.order_id";
		}

		// Dokan copies lines to sub-orders: count the rows Dokan's own
		// Products report counts, never the parent and its copy both.
		if ( function_exists( 'dokan' ) && class_exists( OrderType::class ) ) {
			$types = implode( ',', array_map( 'intval', ( new OrderType() )->get_vendor_order_types() ) );
			$join .= " JOIN {$wpdb->prefix}dokan_order_stats AS spsg_dokan
				ON spsg_dokan.order_id = {$table}.order_id AND spsg_dokan.order_type IN ( {$types} )";
		}

		return $join;
	}

	/**
	 * Where: module, campaign and role, and never a fully refunded order.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array $query_args Query args.
	 *
	 * @return string
	 */
	protected function offer_where( array $query_args ): string {
		global $wpdb;

		$alias = self::ALIAS;
		$roles = array_values( array_filter( (array) ( $query_args['spsg_role'] ?? [] ) ) );

		// Fully refunded orders are left out, unless asked for by status:
		// WooCommerce's full-refund rows skip free gifts, so their cost would
		// stay behind.
		$where = in_array( 'refunded', (array) ( $query_args['status_is'] ?? [] ), true )
			? ''
			: " AND {$wpdb->prefix}wc_order_stats.status <> 'wc-refunded'";

		// One vendor's orders (the Dokan join is there whenever Dokan is).
		if ( ! empty( $query_args['spsg_vendor'] ) && function_exists( 'dokan' ) && class_exists( OrderType::class ) ) {
			$where .= $wpdb->prepare( ' AND spsg_dokan.vendor_id = %d', (int) $query_args['spsg_vendor'] );
		}

		if ( in_array( 'trigger', $roles, true ) ) {
			$where .= " AND {$alias}.trigger_campaign_id <> ''";
			if ( ! empty( $query_args['spsg_campaign'] ) ) {
				$where .= $wpdb->prepare( " AND {$alias}.trigger_campaign_id = %s", $query_args['spsg_campaign'] ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
			}

			return $where;
		}

		if ( $roles ) {
			$where .= " AND {$alias}.role IN ( '" . implode( "','", array_map( 'esc_sql', $roles ) ) . "' )";
		}

		if ( ! empty( $query_args['spsg_module'] ) ) {
			$where .= $wpdb->prepare( " AND {$alias}.module = %s", $query_args['spsg_module'] ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		}

		if ( ! empty( $query_args['spsg_campaign'] ) ) {
			$where .= $wpdb->prepare( " AND {$alias}.campaign_id = %s", $query_args['spsg_campaign'] ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		}

		return $where;
	}
}
