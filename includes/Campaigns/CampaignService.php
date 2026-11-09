<?php
/**
 * Campaign actions: publish, pause, templates (ADR-016).
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Campaigns;

use StorePulse\StoreGrowth\Modules\SmartCoupons\SmartCouponRepository;
use StorePulse\StoreGrowth\Offers\CampaignRepository;
use StorePulse\StoreGrowth\Offers\OfferVersions;
use StorePulse\StoreGrowth\Pricing\SmartCoupon;
use StorePulse\StoreGrowth\Support\SiteTime;
use WP_Error;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Moves a campaign between statuses and builds drafts from templates. Status
 * itself follows the clock (`CampaignRepository::status_at`).
 *
 * @since SPSG_VERSION
 */
class CampaignService {

	/**
	 * Publish a draft: scheduled by the clock, or running now.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param int $id Campaign id.
	 *
	 * @return int|WP_Error
	 */
	public static function publish( int $id ) {
		$campaign = CampaignRepository::get( $id );

		if ( ! $campaign ) {
			return new WP_Error( 'spsg_campaign_not_found', __( 'Campaign not found.', 'storegrowth-sales-booster' ), [ 'status' => 404 ] );
		}

		foreach ( Readiness::check( $campaign ) as $line ) {
			if ( 'blocking' === $line['kind'] ) {
				return new WP_Error( 'spsg_campaign_not_ready', $line['message'], [ 'status' => 400 ] );
			}
		}

		$start = SiteTime::parse( $campaign['starts_at'] );

		return CampaignRepository::save(
			[
				'status'   => CampaignRepository::STATUS_SCHEDULED,
				'settings' => [ 'baseline' => CampaignReport::baseline( $start ) ],
			],
			$id
		);
	}

	/**
	 * Back to draft.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param int $id Campaign id.
	 *
	 * @return int|WP_Error
	 */
	public static function unpublish( int $id ) {
		return CampaignRepository::save( [ 'status' => CampaignRepository::STATUS_DRAFT ], $id );
	}

	/**
	 * Pause: offers go back to everyday and surfaces turn off.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param int $id Campaign id.
	 *
	 * @return int|WP_Error
	 */
	public static function pause( int $id ) {
		return CampaignRepository::save(
			[
				'status'    => CampaignRepository::STATUS_PAUSED,
				'paused_at' => SiteTime::now()->format( 'Y-m-d H:i:s' ),
			],
			$id
		);
	}

	/**
	 * Resume a paused campaign.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param int $id Campaign id.
	 *
	 * @return int|WP_Error
	 */
	public static function resume( int $id ) {
		return CampaignRepository::save(
			[
				'status'    => CampaignRepository::STATUS_SCHEDULED,
				'paused_at' => null,
			],
			$id
		);
	}

	/**
	 * End a campaign now.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param int $id Campaign id.
	 *
	 * @return int|WP_Error
	 */
	public static function end_now( int $id ) {
		return CampaignRepository::save( [ 'ends_at' => SiteTime::now()->modify( '-1 second' )->format( 'Y-m-d H:i:s' ) ], $id );
	}

	/**
	 * The campaign-only offers a delete removes, by name.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param int $id Campaign id.
	 *
	 * @return string[]
	 */
	public static function campaign_only_names( int $id ): array {
		$names = [];

		foreach ( CampaignRepository::get_offers( $id ) as $row ) {
			if ( $row['offer_id'] ) {
				continue;
			}

			$names[] = OfferVersions::SMART_COUPON === $row['offer_kind']
				? CampaignRepository::offer_name( OfferVersions::SMART_COUPON, (int) ( $row['overrides']['coupon_id'] ?? 0 ) )
				: (string) ( $row['overrides']['name'] ?? $row['overrides']['name_of_order_bogo'] ?? '' );
		}

		return array_values( array_filter( $names ) );
	}

	/**
	 * The templates, as the New campaign dialog lists them.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return array<string, array>
	 */
	public static function templates(): array {
		return [
			'flash-sale'    => [
				'name'     => __( 'Flash sale', 'storegrowth-sales-booster' ),
				'percent'  => 20,
				'coupon'   => false,
				'surfaces' => [ 'countdown', 'floating_bar', 'badge', 'fly_cart' ],
			],
			'black-friday'  => [
				'name'     => __( 'Black Friday', 'storegrowth-sales-booster' ),
				'percent'  => 0,
				'coupon'   => true,
				'surfaces' => [ 'countdown', 'floating_bar', 'badge', 'sales_pop', 'fly_cart', 'cart_rewards' ],
			],
			'clearance'     => [
				'name'     => __( 'Clearance', 'storegrowth-sales-booster' ),
				'percent'  => 0,
				'coupon'   => true,
				'surfaces' => [ 'badge', 'stock_bar', 'fly_cart' ],
			],
			'launch-week'   => [
				'name'     => __( 'Launch week', 'storegrowth-sales-booster' ),
				'percent'  => 0,
				'coupon'   => false,
				'surfaces' => [ 'countdown', 'floating_bar', 'badge', 'sales_pop' ],
			],
			'free-shipping' => [
				'name'     => __( 'Always-on free shipping', 'storegrowth-sales-booster' ),
				'percent'  => 0,
				'coupon'   => false,
				'surfaces' => [ 'cart_rewards', 'fly_cart' ],
			],
			'blank'         => [
				'name'     => __( 'Blank', 'storegrowth-sales-booster' ),
				'percent'  => 0,
				'coupon'   => false,
				'surfaces' => [],
			],
		];
	}

	/**
	 * Create a draft from a template, with its campaign-only offers.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param string $template Template id.
	 * @param string $name     Campaign name.
	 *
	 * @return int|WP_Error
	 */
	public static function create_from_template( string $template, string $name ) {
		$templates = self::templates();

		if ( ! isset( $templates[ $template ] ) ) {
			return new WP_Error( 'spsg_campaign_template', __( 'Unknown template.', 'storegrowth-sales-booster' ), [ 'status' => 400 ] );
		}

		$config = $templates[ $template ];

		$surfaces = [];
		foreach ( $config['surfaces'] as $surface ) {
			$surfaces[ $surface ] = [
				'enabled' => true,
				'copy'    => '',
			];
		}

		$settings = [ 'surfaces' => $surfaces ];

		if ( $config['percent'] ) {
			$settings['campaign_price'] = [ 'percent' => $config['percent'] ];
		}

		$id = CampaignRepository::save(
			[
				'name'     => '' !== $name ? $name : $config['name'],
				'settings' => $settings,
			]
		);

		if ( is_wp_error( $id ) ) {
			return $id;
		}

		if ( $config['coupon'] ) {
			$coupon = SmartCouponRepository::save(
				[
					'title'         => $config['name'],
					'method'        => SmartCoupon::AUTOMATIC,
					'discount_type' => SmartCoupon::TYPE_PERCENTAGE,
					'amount'        => 20,
					'code'          => $template . '-' . $id,
				]
			);

			if ( ! is_wp_error( $coupon ) ) {
				self::link_campaign_coupon( $coupon->get_id(), $id, $config['name'] );
			}
		}

		return $id;
	}

	/**
	 * Make a saved coupon a campaign-only offer of a campaign.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param int    $coupon_id Coupon id.
	 * @param int    $id        Campaign id.
	 * @param string $name      Offer name.
	 *
	 * @return int|WP_Error Row id.
	 */
	public static function link_campaign_coupon( int $coupon_id, int $id, string $name ) {
		$row_id = CampaignRepository::add_campaign_only(
			$id,
			OfferVersions::SMART_COUPON,
			[
				'coupon_id' => $coupon_id,
				'name'      => $name,
			]
		);

		if ( ! is_wp_error( $row_id ) ) {
			$coupon = new \WC_Coupon( $coupon_id );
			$coupon->update_meta_data( SmartCoupon::CAMPAIGN_OFFER, $row_id );
			$coupon->save();
		}

		return $row_id;
	}
}
