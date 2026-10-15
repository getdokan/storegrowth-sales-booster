<?php
/**
 * Offer lookup backfill (ADR-012).
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Analytics;

use Automattic\WooCommerce\Admin\API\Reports\Cache as ReportsCache;
use Automattic\WooCommerce\Admin\API\Reports\Products\DataStore as ProductsDataStore;
use StorePulse\StoreGrowth\Attribution\OfferAttribution;
use StorePulse\StoreGrowth\Interfaces\HookRegistry;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Fills `spsg_offer_lookup` for orders WooCommerce imported before the table
 * existed: orders from 2.2.0 on, and orders placed before the admin ran the
 * upgrade.
 *
 * Runs in Action Scheduler batches. Each batch re-syncs WooCommerce's
 * product lookup rows of the orders whose lines carry StoreGrowth keys (and
 * their refunds), which fires the hook `OfferLookup` mirrors.
 *
 * @since 3.0.0
 */
class Backfill implements HookRegistry {

	/**
	 * Action Scheduler hook.
	 */
	const ACTION = 'storegrowth_analytics_backfill';

	/**
	 * Action Scheduler group.
	 */
	const GROUP = 'storegrowth';

	/**
	 * Orders per batch.
	 */
	const BATCH_SIZE = 50;

	/**
	 * Register hooks.
	 *
	 * @since 3.0.0
	 *
	 * @return void
	 */
	public function register_hooks(): void {
		add_action( self::ACTION, [ $this, 'run_batch' ] );
	}

	/**
	 * Queue the first batch.
	 *
	 * @since 3.0.0
	 *
	 * @return void
	 */
	public static function queue(): void {
		if ( ! function_exists( 'as_enqueue_async_action' ) ) {
			return;
		}

		as_enqueue_async_action( self::ACTION, [ 0 ], self::GROUP );
	}

	/**
	 * Re-sync one batch of orders, then queue the next.
	 *
	 * @since 3.0.0
	 *
	 * @param int $after_order_id Last order id of the previous batch.
	 *
	 * @return int[] Order ids re-synced.
	 */
	public function run_batch( $after_order_id = 0 ): array {
		if ( ! Schema::is_installed() || ! class_exists( ProductsDataStore::class ) ) {
			return [];
		}

		$order_ids = self::order_ids( (int) $after_order_id, self::BATCH_SIZE );

		foreach ( $order_ids as $order_id ) {
			$order = wc_get_order( $order_id );
			if ( ! $order || 'shop_order' !== $order->get_type() ) {
				continue;
			}

			ProductsDataStore::sync_order_products( $order_id );

			foreach ( $order->get_refunds() as $refund ) {
				ProductsDataStore::sync_order_products( $refund->get_id() );
			}
		}

		// sync_order_products() doesn't clear WooCommerce's report cache, which
		// would keep showing figures from before the backfill.
		if ( $order_ids ) {
			ReportsCache::invalidate();
		}

		if ( count( $order_ids ) === self::BATCH_SIZE && function_exists( 'as_enqueue_async_action' ) ) {
			as_enqueue_async_action( self::ACTION, [ (int) end( $order_ids ) ], self::GROUP );
		}

		return $order_ids;
	}

	/**
	 * Ids of orders whose lines carry StoreGrowth keys, in id order.
	 *
	 * The order-item tables are the same under HPOS and posts storage.
	 *
	 * @since 3.0.0
	 *
	 * @param int $after_order_id Only orders after this id.
	 * @param int $limit          Most ids to return.
	 *
	 * @return int[]
	 */
	public static function order_ids( int $after_order_id, int $limit ): array {
		global $wpdb;

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$ids = $wpdb->get_col(
			$wpdb->prepare(
				"SELECT DISTINCT oi.order_id FROM {$wpdb->prefix}woocommerce_order_items oi
				JOIN {$wpdb->prefix}woocommerce_order_itemmeta m ON m.order_item_id = oi.order_item_id
				WHERE m.meta_key IN ( %s, %s, %s ) AND oi.order_id > %d
				ORDER BY oi.order_id
				LIMIT %d",
				OfferAttribution::CAMPAIGN_ID,
				OfferAttribution::TRIGGER_CAMPAIGN_ID,
				OfferAttribution::COUNTDOWN_PCT,
				$after_order_id,
				$limit
			)
		);

		return array_map( 'intval', (array) $ids );
	}
}
