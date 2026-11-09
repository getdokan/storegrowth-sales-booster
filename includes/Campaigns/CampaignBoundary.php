<?php
/**
 * Fresh prices when a campaign starts or ends (ADR-016).
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Campaigns;

use DateTimeImmutable;
use StorePulse\StoreGrowth\Interfaces\HookRegistry;
use StorePulse\StoreGrowth\Offers\CampaignRepository;
use StorePulse\StoreGrowth\Support\SiteTime;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Clears cached prices after a campaign boundary: on the first request past
 * it, or from a scheduled action when no request comes.
 *
 * @since SPSG_VERSION
 */
class CampaignBoundary implements HookRegistry {

	/**
	 * Action Scheduler hook.
	 *
	 * @since SPSG_VERSION
	 *
	 * @var string
	 */
	const ACTION = 'spsg_promotion_boundary';

	/**
	 * Action Scheduler group.
	 *
	 * @since SPSG_VERSION
	 *
	 * @var string
	 */
	const GROUP = 'storegrowth';

	/**
	 * Register hooks.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return void
	 */
	public function register_hooks(): void {
		add_action( 'wp_loaded', [ $this, 'handle' ] );
		add_action( self::ACTION, [ $this, 'handle' ] );
	}

	/**
	 * Hook callback for `run()`.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return void
	 */
	public function handle(): void {
		self::run();
	}

	/**
	 * Do the work of a passed boundary, once. A campaign still runs during
	 * its last second, so a boundary is passed only strictly after it.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param DateTimeImmutable|null $now Moment to check, the current one by default.
	 *
	 * @return bool Whether this call did the work.
	 */
	public static function run( ?DateTimeImmutable $now = null ): bool {
		$now = $now ?? SiteTime::now();

		// Read from the autoloaded options: without a boundary ahead the option
		// doesn't exist, and get_option() would query for it on every request.
		$boundary = (int) ( wp_load_alloptions()[ CampaignRepository::BOUNDARY_OPTION ] ?? 0 );

		if ( ! $boundary || $boundary >= $now->getTimestamp() || ! self::claim( $boundary ) ) {
			return false;
		}

		// First, so a request that dies below can't leave the option claimed.
		CampaignRepository::recompute_boundary( $now );

		$product_ids = self::product_ids( self::crossed( $boundary, $now ) );

		foreach ( $product_ids as $product_id ) {
			wc_delete_product_transients( $product_id );
		}

		self::purge_page_caches( $product_ids );

		return true;
	}

	/**
	 * Keep one scheduled action, just past the next boundary.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param int|null $boundary Next boundary, null when none is ahead.
	 *
	 * @return void
	 */
	public static function schedule( ?int $boundary ): void {
		if ( ! function_exists( 'as_schedule_single_action' ) ) {
			return;
		}

		$at = $boundary ? $boundary + 1 : 0;

		if ( (int) as_next_scheduled_action( self::ACTION, [], self::GROUP ) === $at ) {
			return;
		}

		as_unschedule_all_actions( self::ACTION, [], self::GROUP );

		if ( $at ) {
			as_schedule_single_action( $at, self::ACTION, [], self::GROUP );
		}
	}

	/**
	 * Take a boundary for this request. One conditional write on the option
	 * row: of any number of concurrent requests, exactly one changes it.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param int $boundary Boundary as read from the option.
	 *
	 * @return bool
	 */
	private static function claim( int $boundary ): bool {
		global $wpdb;

		return 1 === $wpdb->update( // phpcs:ignore WordPress.DB.DirectDatabaseQuery
			$wpdb->options,
			[ 'option_value' => '0' ],
			[
				'option_name'  => CampaignRepository::BOUNDARY_OPTION,
				'option_value' => (string) $boundary,
			]
		);
	}

	/**
	 * The published campaigns that started or ended since a boundary. Several
	 * can have passed between two requests.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param int               $boundary Boundary being handled.
	 * @param DateTimeImmutable $now      Moment to check.
	 *
	 * @return array[]
	 */
	private static function crossed( int $boundary, DateTimeImmutable $now ): array {
		return array_filter(
			CampaignRepository::all(),
			static function ( array $campaign ) use ( $boundary, $now ): bool {
				if ( CampaignRepository::STATUS_SCHEDULED !== $campaign['status'] ) {
					return false;
				}

				foreach ( [ SiteTime::parse( $campaign['starts_at'] ), SiteTime::parse( $campaign['ends_at'], true ) ] as $moment ) {
					if ( $moment && $moment->getTimestamp() >= $boundary && $moment <= $now ) {
						return true;
					}
				}

				return false;
			}
		);
	}

	/**
	 * The products whose price campaigns set, as WooCommerce caches them:
	 * a variation's range is stored under its parent.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array[] $campaigns Campaigns.
	 *
	 * @return int[]
	 */
	private static function product_ids( array $campaigns ): array {
		$ids = [];

		foreach ( $campaigns as $campaign ) {
			$price = (array) ( $campaign['settings']['campaign_price'] ?? [] );

			if ( empty( $price['percent'] ) ) {
				continue;
			}

			$ids = array_merge( $ids, (array) ( $price['products'] ?? [] ) );

			if ( ! empty( $price['categories'] ) ) {
				$ids = array_merge( $ids, (array) get_objects_in_term( array_map( 'intval', (array) $price['categories'] ), 'product_cat' ) );
			}
		}

		$parents = [];

		foreach ( array_map( 'intval', $ids ) as $id ) {
			$parent    = wp_get_post_parent_id( $id );
			$parents[] = $parent ? $parent : $id;
		}

		return array_values( array_unique( $parents ) );
	}

	/**
	 * Ask the common page cache plugins to purge, best effort.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param int[] $product_ids Products whose price changed.
	 *
	 * @return void
	 */
	private static function purge_page_caches( array $product_ids ): void {
		/**
		 * Purge LiteSpeed Cache's pages, which it exposes only as this action.
		 *
		 * @since SPSG_VERSION
		 */
		do_action( 'litespeed_purge_all' );

		/**
		 * Filters the functions called to purge page caches after a campaign
		 * starts or ends. Each is called with no arguments, if it exists.
		 *
		 * @since SPSG_VERSION
		 *
		 * @param callable[] $purgers     Purge functions: WP Rocket, W3 Total Cache, WP Super Cache and WP Fastest Cache.
		 * @param int[]      $product_ids Products whose price changed.
		 */
		$purgers = apply_filters( 'spsg_page_cache_purgers', [ 'rocket_clean_domain', 'w3tc_flush_all', 'wp_cache_clear_cache', 'wpfc_clear_all_cache' ], $product_ids );

		foreach ( (array) $purgers as $purger ) {
			if ( is_callable( $purger ) ) {
				call_user_func( $purger );
			}
		}
	}
}
