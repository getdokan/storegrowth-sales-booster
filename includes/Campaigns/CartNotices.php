<?php
/**
 * Cart notices when a campaign changes a cart's prices (ADR-016).
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Campaigns;

use StorePulse\StoreGrowth\Analytics\Counter;
use StorePulse\StoreGrowth\Interfaces\HookRegistry;
use StorePulse\StoreGrowth\Offers\CampaignRepository;
use StorePulse\StoreGrowth\Pricing\CartLine;
use StorePulse\StoreGrowth\Pricing\Decision;
use StorePulse\StoreGrowth\Support\SiteTime;
use WC_Cart;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Compares the campaigns behind a cart's prices with the last calculation and
 * tells the shopper what changed. Goes through `CartLine`'s notices, which
 * the block cart reads from the Store API extension (#307).
 *
 * @since SPSG_VERSION
 */
class CartNotices implements HookRegistry {

	/**
	 * Session key: the campaigns behind the last prices, id => name, and when.
	 *
	 * @since SPSG_VERSION
	 */
	const SESSION_KEY = 'spsg_cart_promotions';

	/**
	 * Register hooks.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return void
	 */
	public function register_hooks(): void {
		add_action( 'spsg_referee_decided', [ $this, 'notify' ], 10, 2 );
	}

	/**
	 * Tell the shopper what changed since this cart was last priced.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param Decision $decision The cart's decision.
	 * @param WC_Cart  $cart     Cart.
	 *
	 * @return void
	 */
	public function notify( $decision, $cart ): void {
		if ( ! WC()->session || ! $cart instanceof WC_Cart ) {
			return;
		}

		$now      = SiteTime::now();
		$current  = [];
		$previous = (array) WC()->session->get( self::SESSION_KEY, [] );
		$seen     = (array) ( $previous['promotions'] ?? [] );
		$last     = (int) ( $previous['at'] ?? 0 );

		foreach ( array_keys( $decision->promotions() ) as $id ) {
			$campaign       = CampaignRepository::get( (int) $id );
			$current[ $id ] = $campaign ? (string) $campaign['name'] : (string) ( $seen[ $id ] ?? '' );

			if ( Counter::first_in_session( 'spsg_promotion_qualified', (int) $id ) ) {
				Counter::bump( 'campaigns', 'qualified', 'promotion', (int) $id );
			}

			if ( $last && $campaign && ! isset( $seen[ $id ] ) && self::started_since( $campaign, $last ) ) {
				/* translators: %s: campaign name. */
				CartLine::notice( sprintf( __( '%s price applied.', 'storegrowth-sales-booster' ), $campaign['name'] ) );
				self::drop_generic_notice();
			}
		}

		foreach ( array_diff_key( $seen, $current ) as $id => $name ) {
			$message = self::dropped_message( (int) $id, (string) $name, $now );

			if ( '' !== $message ) {
				CartLine::notice( $message );
				self::drop_generic_notice();
			}
		}

		WC()->session->set(
			self::SESSION_KEY,
			[
				'promotions' => $current,
				'at'         => $now->getTimestamp(),
			]
		);
	}

	/**
	 * Whether a campaign started after a moment.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array $campaign Campaign.
	 * @param int   $last     Timestamp of the last calculation.
	 *
	 * @return bool
	 */
	private static function started_since( array $campaign, int $last ): bool {
		$start = SiteTime::parse( $campaign['starts_at'] ?? null );

		return $start && $start->getTimestamp() > $last;
	}

	/**
	 * The notice for a campaign that no longer prices this cart, if it stopped
	 * rather than the shopper changing the cart.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param int                $id   Campaign id.
	 * @param string             $name Name last seen (a deleted campaign has none now).
	 * @param \DateTimeImmutable $now  Moment.
	 *
	 * @return string
	 */
	private static function dropped_message( int $id, string $name, $now ): string {
		$campaign = CampaignRepository::get( $id );
		$name     = $campaign ? (string) $campaign['name'] : $name;
		$status   = $campaign ? CampaignRepository::status_at( $campaign, $now ) : '';

		if ( ! $campaign || ! sp_store_growth()->has_pro() || CampaignRepository::STATUS_PAUSED === $status ) {
			/* translators: %s: campaign name. */
			return sprintf( __( '%s deal is no longer available. Prices updated.', 'storegrowth-sales-booster' ), $name );
		}

		if ( CampaignRepository::STATUS_ENDED === $status ) {
			/* translators: %s: campaign name. */
			return sprintf( __( '%s ended. Prices updated.', 'storegrowth-sales-booster' ), $name );
		}

		return '';
	}

	/**
	 * Take the plain "Prices updated." out of the queue: the campaign notice
	 * already says it.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return void
	 */
	private static function drop_generic_notice(): void {
		$notices = (array) WC()->session->get( 'wc_notices', [] );
		$generic = __( 'Prices updated.', 'storegrowth-sales-booster' );

		foreach ( (array) ( $notices['notice'] ?? [] ) as $index => $notice ) {
			if ( ( $notice['notice'] ?? '' ) === $generic ) {
				unset( $notices['notice'][ $index ] );
			}
		}

		if ( isset( $notices['notice'] ) ) {
			$notices['notice'] = array_values( $notices['notice'] );

			WC()->session->set( 'wc_notices', $notices );
		}
	}
}
