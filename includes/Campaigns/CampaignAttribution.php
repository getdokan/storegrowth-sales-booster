<?php
/**
 * Credits an order to one campaign (ADR-016).
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Campaigns;

use StorePulse\StoreGrowth\Attribution\OfferAttribution;
use StorePulse\StoreGrowth\Helper;
use StorePulse\StoreGrowth\Interfaces\HookRegistry;
use StorePulse\StoreGrowth\Offers\CampaignRepository;
use StorePulse\StoreGrowth\Pricing\Referee;
use StorePulse\StoreGrowth\Support\SiteTime;
use WC_Cart;
use WC_Order;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Stamps new orders from the referee's decision, or the campaign link when no
 * campaign deal applied. Written through the WooCommerce CRUD API (HPOS safe)
 * on the order being created: under Dokan that is the parent order.
 *
 * @since SPSG_VERSION
 */
class CampaignAttribution implements HookRegistry {

	/**
	 * Browser cookie holding the campaign link visit, set by the tracker.
	 *
	 * @since SPSG_VERSION
	 */
	const LINK_COOKIE = 'spsg_promo';

	/**
	 * Option holding the attribution window, in days.
	 *
	 * @since SPSG_VERSION
	 */
	const WINDOW_OPTION = 'spsg_campaign_attribution_days';

	/**
	 * Default attribution window, in days.
	 *
	 * @since SPSG_VERSION
	 */
	const DEFAULT_WINDOW = 7;

	/**
	 * Session key: the surface that led the shopper to a campaign product.
	 *
	 * @since SPSG_VERSION
	 */
	const SURFACE_SESSION = 'spsg_promotion_surface';

	/**
	 * Register hooks.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return void
	 */
	public function register_hooks(): void {
		add_action( 'woocommerce_checkout_create_order', [ $this, 'stamp_order' ] );
		add_action( 'woocommerce_store_api_checkout_update_order_from_request', [ $this, 'stamp_order' ] );
		add_action( 'woocommerce_add_to_cart', [ $this, 'remember_surface' ], 10, 2 );
	}

	/**
	 * The attribution window in days.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return int
	 */
	public static function window_days(): int {
		return max( 1, (int) get_option( self::WINDOW_OPTION, self::DEFAULT_WINDOW ) );
	}

	/**
	 * Keep the campaign surface the shopper last clicked, when they add a
	 * campaign product: that is the surface credited with the sale.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param string $cart_item_key Cart item key.
	 * @param int    $product_id    Product id.
	 *
	 * @return void
	 */
	public function remember_surface( $cart_item_key, $product_id ): void {
		$visit = self::read_link_cookie();

		if ( ! $visit || '' === $visit['surface'] || ! WC()->session ) {
			return;
		}

		foreach ( CampaignRepository::running() as $campaign ) {
			if ( CampaignProducts::contains( CampaignProducts::scope( $campaign ), (int) $product_id ) ) {
				WC()->session->set( self::SURFACE_SESSION, $visit['surface'] );

				return;
			}
		}
	}

	/**
	 * Stamp a new order.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param WC_Order $order Order being created.
	 *
	 * @return void
	 */
	public function stamp_order( $order ): void {
		if ( ! $order instanceof WC_Order || OfferAttribution::is_subscription( $order ) || ! WC()->cart || ! sp_store_growth()->has_pro() || Referee::is_observing() ) {
			return;
		}

		$credit = self::credit_for_cart( WC()->cart );

		if ( ! $credit ) {
			return;
		}

		$surface = (string) ( WC()->session ? WC()->session->get( self::SURFACE_SESSION, '' ) : '' );

		$order->update_meta_data( OfferAttribution::PROMOTION_ID, $credit['promotion_id'] );
		$order->update_meta_data( OfferAttribution::PROMOTION_SOURCE, $credit['source'] );
		$order->update_meta_data( OfferAttribution::PROMOTION_SURFACE, $surface );
	}

	/**
	 * Which campaign a cart credits, in order: a campaign deal that applied
	 * (one order, one campaign: the largest saving wins), then the link.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param WC_Cart $cart Cart.
	 *
	 * @return array{promotion_id: int, source: string}|null
	 */
	public static function credit_for_cart( WC_Cart $cart ): ?array {
		$promotions = Referee::for_cart( $cart )->promotions();

		if ( $promotions ) {
			return [
				'promotion_id' => (int) array_key_first( $promotions ),
				'source'       => 'offer',
			];
		}

		$campaign = self::linked_campaign( $cart );

		return $campaign ? [
			'promotion_id' => (int) $campaign['id'],
			'source'       => 'link',
		] : null;
	}

	/**
	 * The campaign a link visit credits: a valid slug, inside the window, and
	 * a campaign product in the cart. The cookie is the visitor's own, so
	 * everything in it is checked here.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param WC_Cart $cart Cart.
	 *
	 * @return array|null
	 */
	private static function linked_campaign( WC_Cart $cart ): ?array {
		$visit    = self::read_link_cookie();
		$campaign = $visit ? CampaignRepository::find_by_slug( $visit['slug'] ) : null;

		if ( ! $campaign ) {
			return null;
		}

		// Only while the campaign runs, so the stamp and the report's window agree.
		if ( CampaignRepository::STATUS_RUNNING !== CampaignRepository::status_at( $campaign, SiteTime::now() ) ) {
			return null;
		}

		if ( ! empty( $visit['at'] ) && time() - $visit['at'] > self::window_days() * DAY_IN_SECONDS ) {
			return null;
		}

		$scope = CampaignProducts::scope( $campaign );

		foreach ( $cart->get_cart() as $item ) {
			if ( CampaignProducts::contains( $scope, (int) $item['data']->get_id() ) ) {
				return $campaign;
			}
		}

		return null;
	}

	/**
	 * The campaign link visit in the cookie, every part cleaned.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return array{slug: string, at: int, surface: string}|null
	 */
	public static function read_link_cookie(): ?array {
		// phpcs:ignore WordPressVIPMinimum.Variables.RestrictedVariables.cache_constraints___COOKIE -- Read at checkout, never on cached output.
		$raw = isset( $_COOKIE[ self::LINK_COOKIE ] ) ? sanitize_text_field( wp_unslash( $_COOKIE[ self::LINK_COOKIE ] ) ) : '';

		if ( '' === $raw ) {
			return null;
		}

		$parts = array_pad( explode( ':', $raw, 3 ), 3, '' );

		return [
			'slug'    => sanitize_title( $parts[0] ),
			'at'      => absint( $parts[1] ),
			'surface' => in_array( $parts[2], array_keys( CampaignSurfaces::modules() ), true ) ? $parts[2] : '',
		];
	}
}
