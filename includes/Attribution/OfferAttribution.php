<?php
/**
 * Offer attribution — stamps campaign identity onto orders.
 *
 * Cart items injected by an offer (BOGO gift, Order Bump) carry a set of
 * underscore-prefixed campaign keys. This class copies those keys onto the
 * order line item at checkout and writes an aggregate record of the offers
 * that influenced the order. It reads stamps that the modules add; it never
 * adds them itself, so it is a no-op for any order that carries no stamp.
 *
 * All writes use the WooCommerce CRUD API, so they are HPOS-safe, and every
 * key is underscore-prefixed so WooCommerce treats it as internal (it does not
 * appear on the customer's order confirmation, emails or invoice).
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Attribution;

use StorePulse\StoreGrowth\Interfaces\HookRegistry;
use WC_Order;
use WC_Order_Item;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Persists offer attribution data captured on cart items.
 *
 * @since 2.2.0
 */
class OfferAttribution implements HookRegistry {

	/**
	 * Cart-item / order-item meta key: namespaced campaign identifier (e.g. "bogo:12").
	 */
	const CAMPAIGN_ID = '_spsg_campaign_id';

	/**
	 * Cart-item / order-item meta key: campaign type ("bogo" | "order_bump").
	 */
	const CAMPAIGN_TYPE = '_spsg_campaign_type';

	/**
	 * Cart-item / order-item meta key: reward type ("free" | "discount" | "fixed").
	 */
	const REWARD_TYPE = '_spsg_reward_type';

	/**
	 * Cart-item / order-item meta key: per-unit discount value applied, in store currency.
	 */
	const DISCOUNT_VALUE = '_spsg_discount_value';

	/**
	 * Order meta key: aggregate JSON record of the offers that influenced the order.
	 */
	const ORDER_OFFERS = '_spsg_influencing_offers';

	/**
	 * Cart-item keys copied verbatim onto the order line item.
	 *
	 * @var string[]
	 */
	const STAMP_KEYS = array(
		self::CAMPAIGN_ID,
		self::CAMPAIGN_TYPE,
		self::REWARD_TYPE,
		self::DISCOUNT_VALUE,
	);

	/**
	 * Register hooks.
	 *
	 * @since 2.2.0
	 *
	 * @return void
	 */
	public function register_hooks(): void {
		// Fires for both classic checkout and the blocks Store API checkout
		// (Store API OrderController calls wc()->checkout->create_order_line_items()).
		add_action( 'woocommerce_checkout_create_order_line_item', array( $this, 'copy_stamp_to_order_item' ), 10, 3 );

		// Aggregate record. Classic checkout fires woocommerce_checkout_create_order;
		// the blocks Store API builds the order itself and fires its own action instead.
		add_action( 'woocommerce_checkout_create_order', array( $this, 'record_influencing_offers' ), 10, 1 );
		add_action( 'woocommerce_store_api_checkout_update_order_from_request', array( $this, 'record_influencing_offers' ), 10, 1 );
	}

	/**
	 * Build a namespaced campaign identifier.
	 *
	 * Namespacing by type keeps a BOGO offer and an Order Bump with the same
	 * numeric database id from colliding.
	 *
	 * @since 2.2.0
	 *
	 * @param string $type Campaign type ("bogo" | "order_bump").
	 * @param int    $id   Database row id of the offer.
	 *
	 * @return string
	 */
	public static function campaign_id( string $type, int $id ): string {
		return $type . ':' . $id;
	}

	/**
	 * Build the cart-item stamp for an offer.
	 *
	 * Returned array is merged into the cart item data at an injection site.
	 * Keys are additive; they never replace an existing pricing/marker key.
	 *
	 * @since 2.2.0
	 *
	 * @param string $type           Campaign type ("bogo" | "order_bump").
	 * @param int    $id             Database row id of the offer.
	 * @param string $reward_type    Reward type ("free" | "discount" | "fixed").
	 * @param float  $discount_value Per-unit discount value applied, in store currency.
	 *
	 * @return array<string, string>
	 */
	public static function stamp( string $type, int $id, string $reward_type, float $discount_value ): array {
		return array(
			self::CAMPAIGN_ID    => self::campaign_id( $type, $id ),
			self::CAMPAIGN_TYPE  => $type,
			self::REWARD_TYPE    => $reward_type,
			self::DISCOUNT_VALUE => (string) wc_format_decimal( $discount_value ),
		);
	}

	/**
	 * Copy the campaign stamp from a cart item onto its order line item.
	 *
	 * @since 2.2.0
	 *
	 * @param WC_Order_Item $item          Order line item being created.
	 * @param string        $cart_item_key Cart item key.
	 * @param array         $values        Cart item data.
	 *
	 * @return void
	 */
	public function copy_stamp_to_order_item( $item, $cart_item_key, $values ): void {
		if ( ! $item instanceof WC_Order_Item || empty( $values[ self::CAMPAIGN_ID ] ) ) {
			return;
		}

		foreach ( self::STAMP_KEYS as $key ) {
			if ( isset( $values[ $key ] ) && '' !== $values[ $key ] ) {
				$item->add_meta_data( $key, $values[ $key ], true );
			}
		}
	}

	/**
	 * Write an aggregate record of the offers that influenced the order.
	 *
	 * Reads the stamps off the current cart (available in both the classic and
	 * blocks checkout contexts) and sums the per-unit discount by quantity so
	 * each campaign's total contribution to the order is recorded.
	 *
	 * @since 2.2.0
	 *
	 * @param WC_Order $order Order being created.
	 *
	 * @return void
	 */
	public function record_influencing_offers( $order ): void {
		if ( ! $order instanceof WC_Order || is_null( WC()->cart ) ) {
			return;
		}

		$offers = array();

		foreach ( WC()->cart->get_cart() as $cart_item ) {
			if ( empty( $cart_item[ self::CAMPAIGN_ID ] ) ) {
				continue;
			}

			$campaign_id    = $cart_item[ self::CAMPAIGN_ID ];
			$quantity       = isset( $cart_item['quantity'] ) ? (int) $cart_item['quantity'] : 1;
			$discount_total = (float) ( $cart_item[ self::DISCOUNT_VALUE ] ?? 0 ) * $quantity;

			if ( isset( $offers[ $campaign_id ] ) ) {
				$offers[ $campaign_id ]['discount_value'] += $discount_total;
				continue;
			}

			$offers[ $campaign_id ] = array(
				'campaign_id'    => $campaign_id,
				'type'           => $cart_item[ self::CAMPAIGN_TYPE ] ?? '',
				'reward_type'    => $cart_item[ self::REWARD_TYPE ] ?? '',
				'discount_value' => $discount_total,
			);
		}

		if ( empty( $offers ) ) {
			return;
		}

		$order->update_meta_data( self::ORDER_OFFERS, wp_json_encode( array_values( $offers ) ) );
	}
}
