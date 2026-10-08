<?php
/**
 * Offer revenue stats on WooCommerce Analytics' Products stats (ADR-012).
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Analytics\Reports\Offers\Stats;

use Automattic\WooCommerce\Admin\API\Reports\Products\Stats\DataStore as ProductsStatsDataStore;
use StorePulse\StoreGrowth\Analytics\Reports\Offers\OfferQuery;
use StorePulse\StoreGrowth\Analytics\Schema;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Totals and intervals of the order lines StoreGrowth modules touched.
 *
 * WooCommerce's Products stats store, narrowed to rows in `spsg_offer_lookup`
 * (`OfferQuery`, with its query args) and given a discount column.
 * WooCommerce supplies the rest: date ranges and intervals, the merchant's
 * excluded statuses, refund rows and the report cache. Like WooCommerce's
 * Products report, dates are the order's `date_created`.
 *
 * @since SPSG_VERSION
 */
class DataStore extends ProductsStatsDataStore {

	use OfferQuery;

	/**
	 * Lookup table alias.
	 */
	const ALIAS = 'spsg_offer';

	/**
	 * Cache key.
	 *
	 * @var string
	 */
	protected $cache_key = 'spsg_offers_stats';

	/**
	 * Data store context, used in WooCommerce's clause filters.
	 *
	 * @var string
	 */
	protected $context = 'spsg_offers_stats';

	/**
	 * Mapping columns to data type to return correct response types.
	 *
	 * @var array
	 */
	protected $column_types = [
		'date_start'       => 'strval',
		'date_end'         => 'strval',
		'product_id'       => 'intval',
		'items_sold'       => 'intval',
		'net_revenue'      => 'floatval',
		'discount'         => 'floatval',
		'orders_count'     => 'intval',
		'products_count'   => 'intval',
		'variations_count' => 'intval',
	];

	/**
	 * Report columns: WooCommerce's, plus the discount.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return void
	 */
	protected function assign_report_columns() {
		parent::assign_report_columns();

		$this->report_columns['discount'] = 'SUM( ' . self::ALIAS . '.unit_discount * product_qty ) AS discount';
	}

	/**
	 * Stats, or an error until the upgrade has created the lookup table.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array $query_args Query args.
	 *
	 * @return \stdClass|\WP_Error
	 */
	public function get_data( $query_args ) {
		if ( ! Schema::is_installed() ) {
			return $this->not_installed_error();
		}

		return parent::get_data( $this->scoped_args( $query_args ) );
	}

	/**
	 * The order statuses WooCommerce Analytics leaves out, as stored in
	 * `wc_order_stats.status` (`wc-` prefixed): the merchant's setting,
	 * `auto-draft`, `trash` and the `woocommerce_analytics_excluded_order_statuses`
	 * filter. For reports read outside a data store (the bar's fee lines).
	 *
	 * @since SPSG_VERSION
	 *
	 * @return string[]
	 */
	public static function excluded_statuses(): array {
		return array_map( [ static::class, 'normalize_order_status' ], (array) self::get_excluded_report_order_statuses() );
	}

	/**
	 * Default query args, with the StoreGrowth ones.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return array
	 */
	public function get_default_query_vars() {
		return array_merge( parent::get_default_query_vars(), $this->offer_query_vars() );
	}

	/**
	 * WooCommerce's clauses, narrowed to StoreGrowth lines.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array $query_args Query args.
	 *
	 * @return void
	 */
	protected function update_sql_query_params( $query_args ) {
		parent::update_sql_query_params( $query_args );

		// WooCommerce joins wc_order_stats only when there's a status filter
		// (there is unless every status is allowed).
		$join  = $this->offer_join( '' !== $this->get_status_subquery( $query_args ) );
		$where = $this->offer_where( $query_args );

		foreach ( [ $this->total_query, $this->interval_query ] as $query ) {
			$query->add_sql_clause( 'join', $join );
			$query->add_sql_clause( 'where', $where );
		}
	}
}
