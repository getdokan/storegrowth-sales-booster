<?php
/**
 * Campaign versions and campaign-only offers, through each module's rules (ADR-016).
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Campaigns;

use StorePulse\StoreGrowth\Modules\BoGo\BogoDataManager;
use StorePulse\StoreGrowth\Modules\BoGo\REST\BogoController;
use StorePulse\StoreGrowth\Modules\SmartCoupons\SmartCouponRepository;
use StorePulse\StoreGrowth\Modules\UpsellOrderBump\Database\OrderBumpData;
use StorePulse\StoreGrowth\Modules\UpsellOrderBump\RestApi\OrderBumpController;
use StorePulse\StoreGrowth\Offers\CampaignRepository;
use StorePulse\StoreGrowth\Offers\OfferVersions;
use WC_Coupon;
use WP_Error;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * What the record editors load and save for a campaign. Values arrive in the
 * shape a module's editor sends, pass that module's validation and are stored
 * in the shape its offers have, so `effective_offer` can use them as they are.
 *
 * @since SPSG_VERSION
 */
class CampaignRecords {

	/**
	 * Keys a campaign version never changes.
	 *
	 * @since SPSG_VERSION
	 */
	const OWN_KEYS = [ 'id', 'status', 'type', 'created_by', 'updated_by', 'created_at', 'updated_at' ];

	/**
	 * Create a campaign-only offer.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param int    $promotion_id Campaign id.
	 * @param string $kind         Offer kind.
	 * @param array  $sent         What the editor sent.
	 *
	 * @return int|WP_Error Offer row id.
	 */
	public static function create( int $promotion_id, string $kind, array $sent ) {
		if ( OfferVersions::SMART_COUPON === $kind ) {
			$coupon = SmartCouponRepository::save( $sent );

			return is_wp_error( $coupon ) ? $coupon : CampaignService::link_campaign_coupon( $coupon->get_id(), $promotion_id, (string) ( $sent['title'] ?? $coupon->get_code() ) );
		}

		$values = OfferVersions::BOGO === $kind ? ( new BogoController() )->campaign_values( [], $sent ) : ( new OrderBumpController() )->campaign_values( [], $sent );

		return is_wp_error( $values ) ? $values : CampaignRepository::add_campaign_only( $promotion_id, $kind, $values );
	}

	/**
	 * Save what the editor changed on a campaign version or campaign-only offer.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array $row  Offer row.
	 * @param array $sent What the editor sent.
	 *
	 * @return true|WP_Error
	 */
	public static function update( array $row, array $sent ) {
		$kind = $row['offer_kind'];

		if ( OfferVersions::SMART_COUPON === $kind ) {
			return self::update_coupon( $row, $sent );
		}

		$everyday = $row['offer_id'] ? self::everyday( $kind, $row['offer_id'] ) : [];
		$base     = self::with_overrides( $everyday, $row['overrides'] );
		$values   = OfferVersions::BOGO === $kind ? ( new BogoController() )->campaign_values( $base, $sent ) : ( new OrderBumpController() )->campaign_values( $base, $sent );

		if ( is_wp_error( $values ) ) {
			return $values;
		}

		return CampaignRepository::update_offer_values( (int) $row['id'], $row['offer_id'] ? self::changes( $values, $everyday ) : $values );
	}

	/**
	 * Save a Smart Coupon's version, or a campaign-only coupon itself.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array $row  Offer row.
	 * @param array $sent What the editor sent.
	 *
	 * @return true|WP_Error
	 */
	private static function update_coupon( array $row, array $sent ) {
		if ( ! $row['offer_id'] ) {
			$saved = SmartCouponRepository::save( $sent, new WC_Coupon( (int) ( $row['overrides']['coupon_id'] ?? 0 ) ) );

			return is_wp_error( $saved ) ? $saved : true;
		}

		$overrides = SmartCouponRepository::campaign_values( new WC_Coupon( $row['offer_id'] ), $row['overrides'], $sent );

		return is_wp_error( $overrides ) ? $overrides : CampaignRepository::update_offer_values( (int) $row['id'], $overrides );
	}

	/**
	 * A row as its module's editor reads it.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array $row Offer row.
	 *
	 * @return array
	 */
	public static function to_record( array $row ): array {
		$kind = $row['offer_kind'];

		if ( OfferVersions::SMART_COUPON === $kind ) {
			$record = SmartCouponRepository::campaign_record( new WC_Coupon( $row['offer_id'] ? $row['offer_id'] : (int) ( $row['overrides']['coupon_id'] ?? 0 ) ), $row['offer_id'] ? $row['overrides'] : [] );
		} else {
			$values = $row['offer_id'] ? self::with_overrides( self::everyday( $kind, $row['offer_id'] ), $row['overrides'] ) : $row['overrides'];
			$record = OfferVersions::BOGO === $kind ? ( new BogoController() )->campaign_record( $values ) : ( new OrderBumpController() )->campaign_record( $values );
		}

		return array_merge( $record, [ 'id' => (int) $row['id'] ] );
	}

	/**
	 * An everyday offer as stored.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param string $kind     Offer kind.
	 * @param int    $offer_id Offer id.
	 *
	 * @return array
	 */
	private static function everyday( string $kind, int $offer_id ): array {
		return OfferVersions::BOGO === $kind ? (array) BogoDataManager::get_bogo_offer( $offer_id ) : (array) ( new OrderBumpData() )->get_by_id( $offer_id );
	}

	/**
	 * Everyday values with a campaign's changes on top.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array $everyday  Everyday values.
	 * @param array $overrides The campaign's changes.
	 *
	 * @return array
	 */
	private static function with_overrides( array $everyday, array $overrides ): array {
		$merged = array_merge( $everyday, $overrides );

		if ( is_array( $everyday['design_settings'] ?? null ) && is_array( $overrides['design_settings'] ?? null ) ) {
			$merged['design_settings'] = array_merge( $everyday['design_settings'], $overrides['design_settings'] );
		}

		return $merged;
	}

	/**
	 * Only what a version changes, so an everyday edit still reaches the
	 * values the campaign left alone.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array $values   Validated values.
	 * @param array $everyday Everyday values.
	 *
	 * @return array
	 */
	private static function changes( array $values, array $everyday ): array {
		$changes = [];

		foreach ( array_diff_key( $values, array_flip( self::OWN_KEYS ) ) as $key => $value ) {
			if ( 'design_settings' === $key && is_array( $value ) ) {
				$value = self::changes( $value, (array) ( $everyday[ $key ] ?? [] ) );

				if ( $value ) {
					$changes[ $key ] = $value;
				}

				continue;
			}

			if ( ! self::same( $value, $everyday[ $key ] ?? null ) ) {
				$changes[ $key ] = $value;
			}
		}

		return $changes;
	}

	/**
	 * Whether two stored values are the same: the database returns numbers
	 * as strings.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param mixed $first  Value.
	 * @param mixed $second Value.
	 *
	 * @return bool
	 */
	private static function same( $first, $second ): bool {
		if ( is_numeric( $first ) && is_numeric( $second ) ) {
			return abs( (float) $first - (float) $second ) < 0.000001;
		}

		return wp_json_encode( $first ) === wp_json_encode( $second );
	}
}
