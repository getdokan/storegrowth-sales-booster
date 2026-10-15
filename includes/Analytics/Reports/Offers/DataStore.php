<?php
/**
 * Offer revenue per campaign or product (ADR-012).
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Analytics\Reports\Offers;

use Automattic\WooCommerce\Admin\API\Reports\DataStore as ReportsDataStore;
use Automattic\WooCommerce\Admin\API\Reports\DataStoreInterface;
use StorePulse\StoreGrowth\Analytics\Schema;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Rows of the order lines StoreGrowth modules touched, one per campaign (or
 * per product), with items, revenue, discount and orders.
 *
 * A WooCommerce report data store on `wc_order_product_lookup`, like Dokan's
 * stats store: WooCommerce supplies the date range, the merchant's excluded
 * statuses, the clause filters of its context and the report cache.
 *
 * Query args, besides `OfferQuery`'s and WooCommerce's (`after`, `before`,
 * `page`, `per_page`, `order`, `orderby`):
 * - `spsg_group` `campaign` (default; the trigger campaign for the
 *                `trigger` role) or `product`.
 *
 * @since 3.0.0
 */
class DataStore extends ReportsDataStore implements DataStoreInterface {

	use OfferQuery;

	/**
	 * Lookup table alias.
	 */
	const ALIAS = 'spsg_offer';

	/**
	 * Table the rows come from.
	 *
	 * @var string
	 */
	protected static $table_name = 'wc_order_product_lookup';

	/**
	 * Cache key.
	 *
	 * @var string
	 */
	protected $cache_key = 'spsg_offers';

	/**
	 * Data store context, used in WooCommerce's clause filters.
	 *
	 * @var string
	 */
	protected $context = 'spsg_offers';

	/**
	 * Mapping columns to data type to return correct response types.
	 *
	 * @var array
	 */
	protected $column_types = [
		'group_key'    => 'strval',
		'module'       => 'strval',
		'items_sold'   => 'intval',
		'net_revenue'  => 'floatval',
		'discount'     => 'floatval',
		'orders_count' => 'intval',
	];

	/**
	 * Columns a request may sort by.
	 */
	const SORTABLE = [ 'net_revenue', 'discount', 'items_sold', 'orders_count' ];

	/**
	 * Rows, or an error until the upgrade has created the lookup table.
	 *
	 * @since 3.0.0
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
	 * Default query args.
	 *
	 * @since 3.0.0
	 *
	 * @return array
	 */
	public function get_default_query_vars() {
		return array_merge(
			parent::get_default_query_vars(),
			$this->offer_query_vars(),
			[
				'spsg_group' => 'campaign',
				'orderby'    => 'net_revenue',
				'per_page'   => 25,
			]
		);
	}

	/**
	 * The rows.
	 *
	 * @since 3.0.0
	 *
	 * @param array $query_args Query args.
	 *
	 * @return \stdClass
	 */
	public function get_noncached_data( $query_args ) {
		global $wpdb;

		$table   = self::get_db_table_name();
		$alias   = self::ALIAS;
		$trigger = in_array( 'trigger', (array) $query_args['spsg_role'], true );
		$group   = 'product' === $query_args['spsg_group']
			? "{$table}.product_id"
			: ( $trigger ? "{$alias}.trigger_campaign_id" : "{$alias}.campaign_id" );

		$this->clear_all_clauses();

		// The date range goes in `where_time`, which WooCommerce adds to the where.
		$this->add_time_period_sql_params( $query_args, $table );

		$status = $this->get_status_subquery( $query_args );
		$where  = $this->offer_where( $query_args ) . ( $status ? " AND ( {$status} )" : '' );

		$this->add_sql_clause( 'from', $table );
		$this->add_sql_clause( 'join', $this->offer_join( false ) );
		$this->add_sql_clause( 'where', $where );

		// How many groups, for paging: counted before the page's LIMIT is added.
		$this->add_sql_clause( 'select', "COUNT( DISTINCT {$group} )" );
		$total = (int) $wpdb->get_var( $this->get_query_statement() ); // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching

		$params  = $this->get_limit_sql_params( $query_args );
		$orderby = in_array( $query_args['orderby'], self::SORTABLE, true ) ? $query_args['orderby'] : 'net_revenue';
		$order   = 'ASC' === strtoupper( (string) $query_args['order'] ) ? 'ASC' : 'DESC';

		$this->clear_sql_clause( 'select' );
		$this->add_sql_clause(
			'select',
			"{$group} AS group_key,
			MAX( {$alias}.module ) AS module,
			SUM( product_qty ) AS items_sold,
			SUM( product_net_revenue ) AS net_revenue,
			SUM( {$alias}.unit_discount * product_qty ) AS discount,
			COUNT( DISTINCT ( CASE WHEN product_gross_revenue >= 0 THEN {$table}.order_id END ) ) AS orders_count"
		);
		$this->add_sql_clause( 'group_by', $group );
		// The group as a tie-breaker, so equal rows keep their page.
		$this->add_sql_clause( 'order_by', "{$orderby} {$order}, group_key ASC" );

		$rows = $wpdb->get_results( $this->get_query_statement(), ARRAY_A ); // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching

		return (object) [
			'data'    => array_map( [ $this, 'cast_numbers' ], (array) $rows ),
			'total'   => $total,
			'pages'   => $params['per_page'] ? (int) ceil( $total / $params['per_page'] ) : 1,
			'page_no' => (int) $query_args['page'],
		];
	}
}
