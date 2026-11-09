<?php
/**
 * A campaign's price on products (ADR-016).
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Campaigns;

use DateTimeImmutable;
use StorePulse\StoreGrowth\Offers\CampaignRepository;
use StorePulse\StoreGrowth\Support\SiteTime;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * The "% off these products" a running campaign sets through the Countdown
 * module. It replaces a product's own Countdown discount while the campaign
 * runs; nothing is written to the product, so its own setting returns after.
 *
 * @since SPSG_VERSION
 */
class CampaignPrice {

	/**
	 * Whether a running campaign sets a campaign price.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param DateTimeImmutable|null $now Moment to check.
	 *
	 * @return bool
	 */
	public static function any_running( ?DateTimeImmutable $now = null ): bool {
		foreach ( CampaignRepository::running( $now ) as $campaign ) {
			if ( ! empty( $campaign['settings']['campaign_price']['percent'] ) ) {
				return true;
			}
		}

		return false;
	}

	/**
	 * The campaign price on a product.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param int                    $product_id Product or variation id.
	 * @param DateTimeImmutable|null $now        Moment to check, the current one by default.
	 *
	 * @return array{percent: int, promotion_id: int}|null
	 */
	public static function for_product( int $product_id, ?DateTimeImmutable $now = null ): ?array {
		$now = $now ?? SiteTime::now();

		foreach ( CampaignRepository::running( $now ) as $campaign ) {
			$price   = (array) ( $campaign['settings']['campaign_price'] ?? [] );
			$percent = (int) ( $price['percent'] ?? 0 );

			if ( $percent <= 0 || $percent > 100 ) {
				continue;
			}

			$scope = [
				'all'        => false,
				'products'   => array_map( 'intval', (array) ( $price['products'] ?? [] ) ),
				'categories' => array_map( 'intval', (array) ( $price['categories'] ?? [] ) ),
			];

			if ( CampaignProducts::contains( $scope, $product_id ) ) {
				return [
					'percent'      => $percent,
					'promotion_id' => (int) $campaign['id'],
				];
			}
		}

		return null;
	}
}
