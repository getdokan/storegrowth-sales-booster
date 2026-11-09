<?php
/**
 * Free plan offer limits (ADR-013).
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Offers;

use StorePulse\StoreGrowth\Modules\ProgressiveDiscountBanner\Milestones;
use StorePulse\StoreGrowth\Modules\UpsellOrderBump\Database\OrderBumpData;
use WP_Error;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Which active everyday offers stay on while the licence is Free or expired.
 * Worked out live: the offers themselves are never changed, so a renewed
 * licence brings every one back.
 *
 * @since SPSG_VERSION
 */
class OfferLimits {

	/**
	 * Option holding the offers the merchant chose to keep, by kind.
	 *
	 * @since SPSG_VERSION
	 */
	const CHOICES_OPTION = 'spsg_offer_limit_choices';

	/**
	 * Paused offer ids by kind, for this request.
	 *
	 * @since SPSG_VERSION
	 *
	 * @var array<string, int[]>
	 */
	private static array $paused = [];

	/**
	 * The offer kinds with a Free limit.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return array<string, array{limit: int, offers: callable}>
	 */
	public static function limits(): array {
		/**
		 * Filters the offer kinds with a Free limit.
		 *
		 * @since SPSG_VERSION
		 *
		 * @param array $limits Kind => `limit` and `offers`, a callable returning the
		 *                      active everyday offers (`id`, `name`), oldest first.
		 */
		return apply_filters(
			'spsg_offer_limits',
			[
				OfferVersions::ORDER_BUMP  => [
					'limit'  => OrderBumpData::LITE_BUMP_LIMIT,
					'offers' => [ new OrderBumpData(), 'get_active_oldest_first' ],
				],
				OfferVersions::CART_REWARD => [
					'limit'  => Milestones::FREE_LIMIT,
					'offers' => [ Milestones::class, 'active_oldest_first' ],
				],
			]
		);
	}

	/**
	 * Forget this request's answers, after an offer or a choice changed.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return void
	 */
	public static function flush(): void {
		self::$paused = [];
	}

	/**
	 * Whether an offer is paused for being over the Free limit.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param string $kind Offer kind.
	 * @param int    $id   Offer id.
	 *
	 * @return bool
	 */
	public static function is_paused( string $kind, int $id ): bool {
		return in_array( $id, self::paused_ids( $kind ), true );
	}

	/**
	 * The offers over the Free limit, newest first: the merchant's choices
	 * stay on, then the oldest offers fill what's left of the limit.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param string $kind Offer kind.
	 *
	 * @return int[]
	 */
	public static function paused_ids( string $kind ): array {
		if ( sp_store_growth()->has_pro() ) {
			return [];
		}

		if ( ! isset( self::$paused[ $kind ] ) ) {
			$limits = self::limits();

			self::$paused[ $kind ] = isset( $limits[ $kind ] ) ? self::work_out_paused( $kind, $limits[ $kind ] ) : [];
		}

		return self::$paused[ $kind ];
	}

	/**
	 * Work out one kind's paused offers.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param string $kind   Offer kind.
	 * @param array  $config The kind's `limit` and `offers`.
	 *
	 * @return int[]
	 */
	private static function work_out_paused( string $kind, array $config ): array {
		$active = array_map( 'intval', wp_list_pluck( call_user_func( $config['offers'] ), 'id' ) );
		$limit  = (int) $config['limit'];

		if ( count( $active ) <= $limit ) {
			return [];
		}

		$choices = (array) get_option( self::CHOICES_OPTION, [] );
		$chosen  = array_map( 'intval', (array) ( $choices[ $kind ] ?? [] ) );
		$keep    = array_slice( array_values( array_intersect( $chosen, $active ) ), 0, $limit );

		foreach ( $active as $id ) {
			if ( count( $keep ) < $limit && ! in_array( $id, $keep, true ) ) {
				$keep[] = $id;
			}
		}

		return array_values( array_reverse( array_diff( $active, $keep ) ) );
	}

	/**
	 * The chip of an offer over the Free limit.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return string
	 */
	public static function chip_text(): string {
		return __( 'Paused: over Free limit', 'storegrowth-sales-booster' );
	}

	/**
	 * Each limited kind as the "Choose offers" notice needs it: the limit,
	 * and the active offers with the paused ones (newest first) on top.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return array[]
	 */
	public static function overview(): array {
		$overview = [];

		foreach ( self::limits() as $kind => $config ) {
			$paused = self::paused_ids( $kind );
			$offers = [];

			foreach ( call_user_func( $config['offers'] ) as $offer ) {
				$is_paused = in_array( (int) $offer['id'], $paused, true );

				$offers[ (int) $offer['id'] ] = [
					'id'     => (int) $offer['id'],
					'name'   => (string) $offer['name'],
					'paused' => $is_paused,
					'chip'   => $is_paused ? self::chip_text() : '',
				];
			}

			$paused_offers = [];

			foreach ( $paused as $id ) {
				$paused_offers[] = $offers[ $id ];
				unset( $offers[ $id ] );
			}

			$overview[] = [
				'kind'       => $kind,
				'limit'      => (int) $config['limit'],
				'over_limit' => ! empty( $paused ),
				'offers'     => array_merge( $paused_offers, array_values( $offers ) ),
			];
		}

		return $overview;
	}

	/**
	 * Save which offers of a kind stay on.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param string $kind Offer kind.
	 * @param int[]  $keep Offer ids to keep on.
	 *
	 * @return true|WP_Error
	 */
	public static function choose( string $kind, array $keep ) {
		$limits = self::limits();

		if ( ! isset( $limits[ $kind ] ) ) {
			return new WP_Error( 'spsg_offer_limit_unknown_kind', __( 'This kind of offer has no limit.', 'storegrowth-sales-booster' ), [ 'status' => 404 ] );
		}

		$keep   = array_values( array_unique( array_map( 'absint', $keep ) ) );
		$active = array_map( 'intval', wp_list_pluck( call_user_func( $limits[ $kind ]['offers'] ), 'id' ) );

		if ( count( $keep ) > (int) $limits[ $kind ]['limit'] || array_diff( $keep, $active ) ) {
			return new WP_Error( 'spsg_offer_limit_invalid_choice', __( 'Choose active offers, no more than the Free plan allows.', 'storegrowth-sales-booster' ), [ 'status' => 400 ] );
		}

		$choices          = (array) get_option( self::CHOICES_OPTION, [] );
		$choices[ $kind ] = $keep;

		update_option( self::CHOICES_OPTION, $choices, false );
		self::flush();

		return true;
	}
}
