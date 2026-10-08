<?php
/**
 * Free Shipping Bar figures (ADR-012).
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Analytics\Reports;

use Automattic\WooCommerce\Utilities\OrderUtil;
use StorePulse\StoreGrowth\Analytics\Reports\Offers\Stats\DataStore as OffersStatsDataStore;
use StorePulse\StoreGrowth\Attribution\OfferAttribution;
use StorePulse\StoreGrowth\Modules\ProgressiveDiscountBanner\OrderAttribution as BarAttribution;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Orders the bar helped in a date range: its discount (tagged fee lines) and
 * the orders that met its threshold in free-shipping mode (order key).
 *
 * The bar's discount is a fee, so it isn't in WooCommerce's product lookup
 * the offer data stores read. It's read from the fee lines, with
 * WooCommerce Analytics' rules from `wc_order_stats`: the order's
 * `date_created`, the excluded statuses, and never a fully refunded order.
 *
 * Only orders with no parent are read (`parent_id = 0`): the fee line and the
 * order key are written on the order the checkout created. Dokan builds its
 * sub-orders after checkout and copies neither fees nor order meta to them,
 * and a refund is its own row with a parent. So, unlike the offer reports
 * (which follow Dokan's sub-order types), there is no Dokan join and nothing
 * is counted twice.
 *
 * @since SPSG_VERSION
 */
class FreeShippingBar {

	/**
	 * Figures for a range.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param string $after  First day, `Y-m-d`.
	 * @param string $before Last day, `Y-m-d`.
	 *
	 * @return array{orders: int, discount: float, free_shipping_orders: int}
	 */
	public function get_data( string $after, string $before ): array {
		global $wpdb;

		$where = $this->order_where( $after, $before );

		// phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- table names are WordPress's and WooCommerce's; values are placeholders in $where and below.
		$discount = $wpdb->get_row(
			$wpdb->prepare(
				"SELECT COUNT( DISTINCT fee.order_id ) AS orders, SUM( ABS( total.meta_value ) ) AS discount
				FROM {$wpdb->prefix}woocommerce_order_items AS fee
				JOIN {$wpdb->prefix}woocommerce_order_itemmeta AS tag
					ON tag.order_item_id = fee.order_item_id AND tag.meta_key = %s AND tag.meta_value = %s
				JOIN {$wpdb->prefix}woocommerce_order_itemmeta AS total
					ON total.order_item_id = fee.order_item_id AND total.meta_key = '_line_total'
				JOIN {$wpdb->prefix}wc_order_stats AS stats ON stats.order_id = fee.order_id
				WHERE fee.order_item_type = 'fee' AND {$where}",
				OfferAttribution::CAMPAIGN_TYPE,
				BarAttribution::CAMPAIGN_TYPE
			)
		);

		// Order meta: the HPOS table or post meta, whichever WooCommerce reads.
		$meta_table = OrderUtil::get_table_for_order_meta();
		$meta_id    = OrderUtil::custom_orders_table_usage_is_enabled() ? 'order_id' : 'post_id';

		$free_shipping_orders = $wpdb->get_var(
			$wpdb->prepare(
				"SELECT COUNT( DISTINCT stats.order_id )
				FROM {$wpdb->prefix}wc_order_stats AS stats
				JOIN {$meta_table} AS meta ON meta.{$meta_id} = stats.order_id AND meta.meta_key = %s
				WHERE {$where}",
				BarAttribution::THRESHOLD
			)
		);
		// phpcs:enable

		return [
			'orders'               => (int) ( $discount->orders ?? 0 ),
			'discount'             => round( (float) ( $discount->discount ?? 0 ), 2 ),
			'free_shipping_orders' => (int) $free_shipping_orders,
		];
	}

	/**
	 * Conditions on `wc_order_stats` (alias `stats`), prepared.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param string $after  First day, `Y-m-d`.
	 * @param string $before Last day, `Y-m-d`.
	 *
	 * @return string
	 */
	protected function order_where( string $after, string $before ): string {
		global $wpdb;

		// Fully refunded orders are left out, as in the offer reports.
		$statuses = array_merge( OffersStatsDataStore::excluded_statuses(), [ 'wc-refunded' ] );
		$in       = implode( ', ', array_fill( 0, count( $statuses ), '%s' ) );

		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.PreparedSQLPlaceholders.UnfinishedPrepare, WordPress.DB.PreparedSQLPlaceholders.ReplacementsWrongNumber -- the IN list is placeholders, the values one array.
		return $wpdb->prepare( "stats.parent_id = 0 AND stats.date_created BETWEEN %s AND %s AND stats.status NOT IN ( {$in} )", array_merge( [ $after . ' 00:00:00', $before . ' 23:59:59' ], $statuses ) );
	}
}
