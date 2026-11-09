<?php
/**
 * Which version of an offer applies right now (ADR-013).
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Offers;

use DateTimeImmutable;
use StorePulse\StoreGrowth\Helper;
use StorePulse\StoreGrowth\Modules\BoGo\BogoDataManager;
use StorePulse\StoreGrowth\Modules\BoGo\BogoValidator;
use StorePulse\StoreGrowth\Modules\SmartCoupons\SmartCouponsModule;
use StorePulse\StoreGrowth\Modules\UpsellOrderBump\OrderBumpDesign;
use StorePulse\StoreGrowth\Support\SiteTime;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * The one answer to "what applies to this offer now": its everyday version,
 * or the version of the campaign running over it. Worked out live; nothing
 * is written back to the offer.
 *
 * @since SPSG_VERSION
 */
class OfferVersions {

	/**
	 * Offer kind of a BOGO rule.
	 *
	 * @since SPSG_VERSION
	 */
	const BOGO = 'bogo';

	/**
	 * Offer kind of an order bump.
	 *
	 * @since SPSG_VERSION
	 */
	const ORDER_BUMP = 'order_bump';

	/**
	 * Offer kind of a Smart Coupon.
	 *
	 * @since SPSG_VERSION
	 */
	const SMART_COUPON = 'smart_coupon';

	/**
	 * Offer kind of a Cart Rewards milestone (a surface in campaigns, never
	 * an offer they take over).
	 *
	 * @since SPSG_VERSION
	 */
	const CART_REWARD = 'cart_reward';

	/**
	 * The offer's own settings apply.
	 *
	 * @since SPSG_VERSION
	 */
	const EVERYDAY = 'everyday';

	/**
	 * A campaign's version applies.
	 *
	 * @since SPSG_VERSION
	 */
	const CAMPAIGN = 'campaign';

	/**
	 * Whether a Dokan vendor made an offer. Dokan gives every administrator
	 * the `dokandar` capability too, so an administrator's offer is checked
	 * for first: it is never a vendor deal.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array $offer Stored offer, with `created_by`.
	 *
	 * @return bool
	 */
	public static function is_vendor_deal( array $offer ): bool {
		$author = (int) ( $offer['created_by'] ?? 0 );

		return $author && ! user_can( $author, 'manage_options' ) && function_exists( 'dokan_is_user_seller' ) && dokan_is_user_seller( $author );
	}

	/**
	 * What applies to an offer at a moment.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array                  $offer The offer's stored values, plus `offer_kind`
	 *                                      (`self::BOGO`, `self::ORDER_BUMP`, …).
	 * @param DateTimeImmutable|null $now   Moment to check, the current one by default.
	 *
	 * @return array{version: string, values: array, promotion_id: int, live: bool, chip: string}
	 */
	public static function effective_offer( array $offer, ?DateTimeImmutable $now = null ): array {
		$now  = $now ?? SiteTime::now();
		$kind = (string) ( $offer['offer_kind'] ?? '' );

		unset( $offer['offer_kind'] );

		if ( ! empty( $offer['campaign_offer_id'] ) ) {
			return self::campaign_only( $kind, $offer, $now );
		}

		$row = CampaignRepository::running_row( $kind, (int) ( $offer['id'] ?? 0 ), $now );

		if ( $row ) {
			$values = self::switch_on( $kind, self::apply_overrides( $offer, $row['overrides'] ) );

			return self::result( self::CAMPAIGN, $kind, $values, (int) $row['promotion_id'], self::is_live( $kind, $values, $now ) );
		}

		$over_limit = OfferLimits::is_paused( $kind, (int) ( $offer['id'] ?? 0 ) );
		$result     = self::result( self::EVERYDAY, $kind, $offer, 0, ! $over_limit && self::is_live( $kind, $offer, $now ) );

		if ( $over_limit ) {
			$result['chip'] = OfferLimits::chip_text();
		}

		return $result;
	}

	/**
	 * What applies to an offer that exists only inside a campaign: its own
	 * values while the campaign runs, offline otherwise.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param string            $kind  Offer kind.
	 * @param array             $offer Campaign-only offer.
	 * @param DateTimeImmutable $now   Moment to check.
	 *
	 * @return array
	 */
	private static function campaign_only( string $kind, array $offer, DateTimeImmutable $now ): array {
		$row     = CampaignRepository::find_offer_row( (int) $offer['campaign_offer_id'] );
		$running = $row && sp_store_growth()->has_pro() && CampaignRepository::STATUS_RUNNING === CampaignRepository::status_at( $row, $now );
		$values  = $running ? self::switch_on( $kind, $offer ) : $offer;

		return self::result( self::CAMPAIGN, $kind, $values, $row ? (int) $row['promotion_id'] : 0, $running && self::is_live( $kind, $values, $now ) );
	}

	/**
	 * Put a campaign's changes on top of the everyday values.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array $offer     Everyday values.
	 * @param array $overrides The values the campaign changes; empty for "Use as is".
	 *
	 * @return array
	 */
	private static function apply_overrides( array $offer, array $overrides ): array {
		unset( $overrides['id'] );

		if ( isset( $overrides['design_settings'], $offer['design_settings'] ) && is_array( $overrides['design_settings'] ) && is_array( $offer['design_settings'] ) ) {
			$overrides['design_settings'] = array_merge( $offer['design_settings'], $overrides['design_settings'] );
		}

		return array_merge( $offer, $overrides );
	}

	/**
	 * Values of an offer a campaign is running: switched on, with the
	 * campaign's window in place of the offer's own schedule.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param string $kind   Offer kind.
	 * @param array  $values Offer values.
	 *
	 * @return array
	 */
	private static function switch_on( string $kind, array $values ): array {
		$values['status'] = 'active';

		if ( self::BOGO === $kind ) {
			$values['offer_start']    = null;
			$values['offer_end']      = null;
			$values['offer_schedule'] = [ 'daily' ];
		}

		if ( self::ORDER_BUMP === $kind ) {
			unset( $values['design_settings']['bump_schedule'] );
		}

		if ( self::SMART_COUPON === $kind ) {
			$values['date_start']          = '';
			$values['date_end']            = '';
			$values['dates_from_campaign'] = true;
		}

		return $values;
	}

	/**
	 * Whether these values make the offer live at a moment.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param string            $kind   Offer kind.
	 * @param array             $values Offer values.
	 * @param DateTimeImmutable $now    Moment to check.
	 *
	 * @return bool
	 */
	private static function is_live( string $kind, array $values, DateTimeImmutable $now ): bool {
		$live = 'active' === ( $values['status'] ?? '' );

		if ( self::BOGO === $kind ) {
			$live = BogoValidator::is_offer_live( $values, $now );
		}

		if ( self::ORDER_BUMP === $kind ) {
			$live = $live && OrderBumpDesign::runs_on( (array) ( $values['design_settings'] ?? [] ), SiteTime::weekday( $now ) );
		}

		/**
		 * Filters whether an offer's values make it live, for offer kinds
		 * StoreGrowth doesn't check itself.
		 *
		 * @since SPSG_VERSION
		 *
		 * @param bool              $live   Whether the offer is live.
		 * @param string            $kind   Offer kind.
		 * @param array             $values Offer values.
		 * @param DateTimeImmutable $now    Moment checked.
		 */
		return (bool) apply_filters( 'spsg_offer_is_live', $live, $kind, $values, $now );
	}

	/**
	 * The answer's shape, with the chip of a rule held back for its coupon.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param string $version      Version that applies.
	 * @param string $kind         Offer kind.
	 * @param array  $values       Values to use.
	 * @param int    $promotion_id Campaign controlling the offer; 0 for none.
	 * @param bool   $live         Whether the offer is live.
	 *
	 * @return array{version: string, values: array, promotion_id: int, live: bool, chip: string}
	 */
	private static function result( string $version, string $kind, array $values, int $promotion_id, bool $live ): array {
		$needs_coupons = self::BOGO === $kind && ! empty( $values[ BogoDataManager::ONLY_WITH_COUPON ] ) && ! Helper::is_module_active( SmartCouponsModule::get_id() );

		return [
			'version'      => $version,
			'values'       => $values,
			'promotion_id' => $promotion_id,
			'live'         => $live,
			'chip'         => $needs_coupons ? __( 'Paused: needs Smart Coupons', 'storegrowth-sales-booster' ) : '',
		];
	}
}
