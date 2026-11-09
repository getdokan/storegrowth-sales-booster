<?php
/**
 * What a module's offer screens say about campaigns (ADR-016, #304 section 7).
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
 * Worked out once, here, for the BOGO, Order Bump and Smart Coupons screens.
 *
 * @since SPSG_VERSION
 */
class OfferTimeline {

	/**
	 * An offer's timeline chip and module-page banner.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param string                 $kind      Offer kind.
	 * @param int                    $offer_id  Offer id.
	 * @param bool                   $is_on     Whether the everyday version is on.
	 * @param string                 $offer     Offer name, for the banner.
	 * @param DateTimeImmutable|null $now       Moment to check, the current one by default.
	 *
	 * @return array{chip: string, tooltip: string, banner: array|null}
	 */
	public static function for_offer( string $kind, int $offer_id, bool $is_on, string $offer = '', ?DateTimeImmutable $now = null ): array {
		$now       = $now ?? SiteTime::now();
		$campaigns = CampaignRepository::campaigns_of_offer( $kind, $offer_id );
		$empty     = [
			'chip'    => '',
			'tooltip' => '',
			'banner'  => null,
		];

		if ( ! $campaigns ) {
			return $empty;
		}

		$running = array_values(
			array_filter(
				$campaigns,
				static function ( array $campaign ) use ( $now ): bool {
					return CampaignRepository::STATUS_RUNNING === CampaignRepository::status_at( $campaign, $now );
				}
			)
		);

		$tooltip = implode(
			"\n",
			array_map(
				static function ( array $campaign ): string {
					return $campaign['name'] . ': ' . trim( $campaign['starts_at'] . ' - ' . (string) $campaign['ends_at'], ' -' );
				},
				$campaigns
			)
		);

		if ( $running ) {
			$campaign = $running[0];
			$until    = self::date_label( $campaign['ends_at'] ?? null );

			return [
				/* translators: 1: campaign name, 2: end date. */
				'chip'    => sprintf( __( '%1$s version · until %2$s', 'storegrowth-sales-booster' ), $campaign['name'], $until ),
				'tooltip' => $tooltip,
				'banner'  => [
					'campaign_id' => (int) $campaign['id'],
					/* translators: 1: campaign name, 2: offer name, 3: end date. */
					'text'        => sprintf( __( '%1$s is controlling %2$s until %3$s. Changes here apply after it ends.', 'storegrowth-sales-booster' ), $campaign['name'], $offer, $until ),
					/* translators: %s: campaign name. */
					'button'      => sprintf( __( 'Edit %s version', 'storegrowth-sales-booster' ), $campaign['name'] ),
				],
			];
		}

		$next  = $campaigns[0];
		$more  = count( $campaigns ) - 1;
		$state = $is_on ? __( 'Live now', 'storegrowth-sales-booster' ) : __( 'Off now', 'storegrowth-sales-booster' );
		$chip  = sprintf(
			/* translators: 1: "Live now" or "Off now", 2: campaign name, 3: start date, 4: end date. */
			__( '%1$s · %2$s takes over %3$s to %4$s · back to everyday after', 'storegrowth-sales-booster' ),
			$state,
			$next['name'],
			self::date_label( $next['starts_at'] ?? null ),
			self::date_label( $next['ends_at'] ?? null )
		);

		if ( $more > 0 ) {
			/* translators: %d: number of other campaigns. */
			$chip .= ' ' . sprintf( __( '+%d more', 'storegrowth-sales-booster' ), $more );
		}

		return [
			'chip'    => $chip,
			'tooltip' => $tooltip,
			'banner'  => null,
		];
	}

	/**
	 * A date as a chip reads it.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param mixed $date Stored date.
	 *
	 * @return string
	 */
	private static function date_label( $date ): string {
		$parsed = SiteTime::parse( $date );

		return $parsed ? wp_date( 'M j', $parsed->getTimestamp() ) : '';
	}
}
