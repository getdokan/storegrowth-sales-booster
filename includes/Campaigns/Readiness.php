<?php
/**
 * A draft campaign's checks before publishing (ADR-016).
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Campaigns;

use StorePulse\StoreGrowth\Helper;
use StorePulse\StoreGrowth\Modules\BoGo\BogoDataManager;
use StorePulse\StoreGrowth\Modules\SmartCoupons\SmartCouponRepository;
use StorePulse\StoreGrowth\Offers\CampaignRepository;
use StorePulse\StoreGrowth\Offers\OfferVersions;
use StorePulse\StoreGrowth\Pricing\SmartCoupon;
use StorePulse\StoreGrowth\Support\SiteTime;
use WC_Coupon;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Works out each readiness line. Blocking checks stop Publish; warnings have
 * a fix; info lines don't. Overlap lines never block.
 *
 * @since SPSG_VERSION
 */
class Readiness {

	/**
	 * Every check for a campaign.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array $campaign Campaign.
	 *
	 * @return array[] `kind` (blocking, warning, info), `code`, `message`, `fix`.
	 */
	public static function check( array $campaign ): array {
		return array_merge( self::dates( $campaign ), self::attachments( $campaign ), self::prices( $campaign ), self::overlaps( $campaign ), self::licence( $campaign ) );
	}

	/**
	 * Whether a campaign can be published.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array $campaign Campaign.
	 *
	 * @return bool
	 */
	public static function can_publish( array $campaign ): bool {
		foreach ( self::check( $campaign ) as $line ) {
			if ( 'blocking' === $line['kind'] ) {
				return false;
			}
		}

		return true;
	}

	/**
	 * One check's line.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param string $kind    Kind.
	 * @param string $code    Code.
	 * @param string $message Message.
	 * @param string $fix     Fix button, empty for none.
	 *
	 * @return array
	 */
	private static function line( string $kind, string $code, string $message, string $fix = '' ): array {
		return [
			'kind'    => $kind,
			'code'    => $code,
			'message' => $message,
			'fix'     => $fix,
		];
	}

	/**
	 * Date checks.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array $campaign Campaign.
	 *
	 * @return array[]
	 */
	private static function dates( array $campaign ): array {
		$start = SiteTime::parse( $campaign['starts_at'] ?? null );
		$end   = SiteTime::parse( $campaign['ends_at'] ?? null, true );

		if ( ! $start ) {
			return [ self::line( 'blocking', 'no_start', __( 'Set a start date before publishing.', 'storegrowth-sales-booster' ), 'dates' ) ];
		}

		if ( $end && $end <= $start ) {
			return [ self::line( 'blocking', 'end_before_start', __( 'The end is before the start.', 'storegrowth-sales-booster' ), 'dates' ) ];
		}

		return [];
	}

	/**
	 * What's attached and whether it can run.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array $campaign Campaign.
	 *
	 * @return array[]
	 */
	private static function attachments( array $campaign ): array {
		$settings = (array) ( $campaign['settings'] ?? [] );
		$offers   = CampaignRepository::get_offers( (int) $campaign['id'] );
		$percent  = (int) ( $settings['campaign_price']['percent'] ?? 0 );
		$surfaces = array_filter(
			(array) ( $settings['surfaces'] ?? [] ),
			static function ( $surface ): bool {
				return ! empty( $surface['enabled'] );
			}
		);

		if ( ! $offers && ! $percent && ! $surfaces ) {
			return [ self::line( 'blocking', 'nothing_attached', __( 'Attach an offer, a campaign price or a surface.', 'storegrowth-sales-booster' ) ) ];
		}

		$lines = [];

		if ( ! $offers && ! $percent ) {
			$lines[] = self::line( 'warning', 'no_discount', __( 'No discount attached. Attribution will use the link and surface clicks only.', 'storegrowth-sales-booster' ), 'attach_offer' );
		}

		foreach ( array_keys( $surfaces ) as $surface ) {
			$module = CampaignSurfaces::modules()[ $surface ] ?? '';

			if ( '' !== $module && ! Helper::is_module_active( $module ) ) {
				$lines[] = self::line( 'warning', 'surface_module_off', sprintf( /* translators: %s: module id. */ __( 'A surface is on but its module (%s) is off.', 'storegrowth-sales-booster' ), $module ), 'enable_module:' . $module );
			}
		}

		$coupons = array_filter(
			$offers,
			static function ( array $row ): bool {
				return OfferVersions::SMART_COUPON === $row['offer_kind'];
			}
		);

		if ( $coupons && array_filter( $offers, [ self::class, 'is_bogo' ] ) ) {
			$lines = array_merge( $lines, self::bogo_coupon_clash( $offers, $coupons ) );
		}

		return $lines;
	}

	/**
	 * Whether an offer row is a BOGO rule.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array $row Offer row.
	 *
	 * @return bool
	 */
	public static function is_bogo( array $row ): bool {
		return OfferVersions::BOGO === $row['offer_kind'];
	}

	/**
	 * A BOGO rule and a Buy X Get Y coupon on the same products.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array[] $offers  Offer rows.
	 * @param array[] $coupons Coupon rows.
	 *
	 * @return array[]
	 */
	private static function bogo_coupon_clash( array $offers, array $coupons ): array {
		foreach ( $coupons as $coupon_row ) {
			$coupon = new WC_Coupon( (int) ( $coupon_row['offer_id'] ? $coupon_row['offer_id'] : ( $coupon_row['overrides']['coupon_id'] ?? 0 ) ) );

			if ( ! $coupon->get_id() || ! SmartCoupon::is_buy_x_get_y( $coupon ) ) {
				continue;
			}

			foreach ( array_filter( $offers, [ self::class, 'is_bogo' ] ) as $bogo ) {
				$rule = $bogo['offer_id'] ? (array) BogoDataManager::get_bogo_offer( $bogo['offer_id'] ) : $bogo['overrides'];

				if ( array_intersect( array_map( 'intval', (array) ( $rule['offered_products'] ?? [] ) ), array_map( 'intval', $coupon->get_product_ids() ) ) ) {
					return [ self::line( 'warning', 'bogo_coupon_clash', __( 'A BOGO rule and a Buy X get Y coupon target the same product. The larger one wins.', 'storegrowth-sales-booster' ), 'bogo_coupon' ) ];
				}
			}
		}

		return [];
	}

	/**
	 * Products already on sale and products with their own Countdown.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array $campaign Campaign.
	 *
	 * @return array[]
	 */
	private static function prices( array $campaign ): array {
		$scope = CampaignProducts::scope( $campaign );
		$lines = [];

		if ( ! empty( $campaign['settings']['campaign_price']['percent'] ) ) {
			$count = 0;

			foreach ( array_map( 'intval', (array) ( $campaign['settings']['campaign_price']['products'] ?? [] ) ) as $product_id ) {
				$count += (int) get_post_meta( $product_id, '_spsg_countdown_timer_discount_amount', true ) > 0 ? 1 : 0;
			}

			if ( $count ) {
				$lines[] = self::line(
					'warning',
					'own_countdown',
					sprintf(
						/* translators: %d: number of products. */
						_n( '%d product already has its own Countdown discount. The campaign price replaces it while the campaign runs.', '%d products already have their own Countdown discount. The campaign price replaces it while the campaign runs.', $count, 'storegrowth-sales-booster' ),
						$count
					),
					'review_products'
				);
			}
		}

		$on_sale = 0;

		foreach ( array_slice( $scope['products'], 0, 200 ) as $product_id ) {
			$product  = wc_get_product( $product_id );
			$on_sale += $product && $product->is_on_sale() ? 1 : 0;
		}

		if ( $on_sale ) {
			$lines[] = self::line(
				'warning',
				'on_sale',
				sprintf(
					/* translators: %d: number of products. */
					_n( '%d product is already on sale in scope.', '%d products are already on sale in scope.', $on_sale, 'storegrowth-sales-booster' ),
					$on_sale
				),
				'on_sale'
			);
		}

		return $lines;
	}

	/**
	 * Lines about other campaigns on the same products. Never block saving.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array $campaign Campaign.
	 *
	 * @return array[]
	 */
	public static function overlaps( array $campaign ): array {
		$now    = SiteTime::now();
		$scope  = CampaignProducts::scope( $campaign );
		$lines  = [];
		$change = self::changes_prices( $campaign );

		foreach ( CampaignRepository::all() as $other ) {
			if ( (int) $other['id'] === (int) $campaign['id'] || CampaignRepository::STATUS_ENDED === CampaignRepository::status_at( $other, $now ) || ! self::windows_overlap( $campaign, $other ) ) {
				continue;
			}

			$shared = self::shared_count( $scope, CampaignProducts::scope( $other ) );

			if ( ! $shared ) {
				continue;
			}

			if ( $change && self::changes_prices( $other ) ) {
				$lines[] = self::line(
					'warning',
					'price_overlap',
					sprintf(
						/* translators: 1: campaign name, 2: number of products. */
						__( '%1$s also discounts %2$d products in this campaign. The larger deal applies.', 'storegrowth-sales-booster' ),
						$other['name'],
						$shared
					),
					'see_products'
				);
			} else {
				$lines[] = self::line(
					'info',
					'shared_products',
					/* translators: %s: campaign name. */
					sprintf( __( 'Also running: %s', 'storegrowth-sales-booster' ), $other['name'] )
				);
			}
		}

		return $lines;
	}

	/**
	 * Whether a campaign changes any price (offers or a campaign price; Cart
	 * Rewards and surfaces don't).
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array $campaign Campaign.
	 *
	 * @return bool
	 */
	public static function changes_prices( array $campaign ): bool {
		return ! empty( $campaign['settings']['campaign_price']['percent'] ) || ! empty( CampaignRepository::get_offers( (int) $campaign['id'] ) );
	}

	/**
	 * Whether two campaigns' windows overlap. An open end never closes.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array $first  Campaign.
	 * @param array $second Campaign.
	 *
	 * @return bool
	 */
	private static function windows_overlap( array $first, array $second ): bool {
		$start       = SiteTime::parse( $first['starts_at'] ?? null );
		$end         = SiteTime::parse( $first['ends_at'] ?? null, true );
		$other_start = SiteTime::parse( $second['starts_at'] ?? null );
		$other_end   = SiteTime::parse( $second['ends_at'] ?? null, true );

		if ( ! $start || ! $other_start ) {
			return false;
		}

		return ( ! $other_end || $start <= $other_end ) && ( ! $end || $other_start <= $end );
	}

	/**
	 * How many products two scopes share (a shared category counts as one).
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array $first  Scope.
	 * @param array $second Scope.
	 *
	 * @return int
	 */
	private static function shared_count( array $first, array $second ): int {
		if ( $first['all'] || $second['all'] ) {
			return max( count( $first['products'] ), count( $second['products'] ), 1 );
		}

		return count( array_intersect( $first['products'], $second['products'] ) ) + count( array_intersect( $first['categories'], $second['categories'] ) );
	}

	/**
	 * The licence warning, when the campaign ends after expiry.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array $campaign Campaign.
	 *
	 * @return array[]
	 */
	public static function licence( array $campaign ): array {
		/**
		 * Filters the admin header data; Pro adds the licence expiry to it.
		 *
		 * @since 3.0.0
		 *
		 * @param array $header_info Header data.
		 */
		$info    = (array) apply_filters( 'spsg_admin_header_info', [] );
		$expires = SiteTime::parse( $info['license_expires_at'] ?? null );
		$end     = SiteTime::parse( $campaign['ends_at'] ?? null, true );

		if ( ! $expires || ! $end || $end <= $expires ) {
			return [];
		}

		return [
			self::line(
				'warning',
				'licence_expiry',
				sprintf(
					/* translators: %s: expiry date. */
					__( 'Your licence expires on %s, before this campaign ends. It will stop then.', 'storegrowth-sales-booster' ),
					wp_date( get_option( 'date_format' ), $expires->getTimestamp() )
				),
				'renew'
			),
		];
	}
}
