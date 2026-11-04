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
use WC_Product;

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
	 * Order-item meta key: campaign id of the BOGO gift this line triggered (e.g. "bogo:12").
	 *
	 * Its own key, so a line that is both a reward (an order bump) and a
	 * BOGO trigger keeps its `_spsg_campaign_id`.
	 *
	 * @since 3.0.0
	 */
	const TRIGGER_CAMPAIGN_ID = '_spsg_trigger_campaign_id';

	/**
	 * Order-item meta key: unit price the shopper would have paid without any
	 * StoreGrowth discount, excluding tax, taken at checkout.
	 *
	 * @since 3.0.0
	 */
	const REFERENCE_PRICE = '_spsg_reference_price';

	/**
	 * Order-item meta key: countdown timer discount percentage in force at
	 * checkout (written by the Countdown Timer module).
	 *
	 * @since 3.0.0
	 */
	const COUNTDOWN_PCT = '_spsg_countdown_pct';

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
		add_action( 'woocommerce_checkout_create_order_line_item', array( $this, 'copy_stamp_to_order_item' ), 10, 4 );

		// Aggregate record. Classic checkout fires woocommerce_checkout_create_order;
		// the blocks Store API builds the order itself and fires its own action instead.
		add_action( 'woocommerce_checkout_create_order', array( $this, 'record_influencing_offers' ), 10, 1 );
		add_action( 'woocommerce_store_api_checkout_update_order_from_request', array( $this, 'record_influencing_offers' ), 10, 1 );

		// Subscriptions created before keys were kept off them carry the 2.2.0
		// keys; renewal and resubscribe orders copy them from the subscription.
		add_filter( 'wcs_new_order_items', array( $this, 'strip_from_subscription_items' ), 10, 1 );
	}

	/**
	 * Whether an order is a WooCommerce Subscriptions subscription.
	 *
	 * Keys are never written to subscriptions: every renewal path copies a
	 * subscription's item meta onto the new order, which would count the
	 * offer again on each renewal.
	 *
	 * @since 3.0.0
	 *
	 * @param mixed $order Order being built.
	 *
	 * @return bool
	 */
	public static function is_subscription( $order ): bool {
		return $order instanceof WC_Order && 'shop_subscription' === $order->get_type();
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
	 * Also writes the reference price on reward lines and the trigger key on
	 * the line that triggered a BOGO gift (since 3.0.0). Nothing is
	 * written to a subscription.
	 *
	 * @since 2.2.0
	 *
	 * @param WC_Order_Item $item          Order line item being created.
	 * @param string        $cart_item_key Cart item key.
	 * @param array         $values        Cart item data.
	 * @param WC_Order|null $order         Order being built (since 3.0.0).
	 *
	 * @return void
	 */
	public function copy_stamp_to_order_item( $item, $cart_item_key, $values, $order = null ): void {
		if ( ! $item instanceof WC_Order_Item || self::is_subscription( $order ) ) {
			return;
		}

		$trigger_campaign_id = self::find_triggered_campaign( (string) $cart_item_key );
		if ( '' !== $trigger_campaign_id ) {
			$item->add_meta_data( self::TRIGGER_CAMPAIGN_ID, $trigger_campaign_id, true );
		}

		if ( empty( $values[ self::CAMPAIGN_ID ] ) ) {
			return;
		}

		foreach ( self::STAMP_KEYS as $key ) {
			if ( isset( $values[ $key ] ) && '' !== $values[ $key ] ) {
				$item->add_meta_data( $key, $values[ $key ], true );
			}
		}

		$reference_price = isset( $values['data'] ) ? self::reference_price( $values['data'] ) : '';
		if ( '' !== $reference_price ) {
			$item->add_meta_data( self::REFERENCE_PRICE, $reference_price, true );
		}
	}

	/**
	 * Campaign id of the BOGO gift a cart line triggered.
	 *
	 * A gift line points at its trigger with `linked_to_product_key` (only
	 * BOGO sets it; the popup's gift has no `bogo_offer` flag); the first
	 * gift found wins.
	 *
	 * @since 3.0.0
	 *
	 * @param string $cart_item_key Cart item key of the possible trigger line.
	 *
	 * @return string Campaign id, or '' when the line triggered no gift.
	 */
	private static function find_triggered_campaign( string $cart_item_key ): string {
		if ( '' === $cart_item_key || ! function_exists( 'WC' ) || is_null( WC()->cart ) ) {
			return '';
		}

		foreach ( WC()->cart->get_cart() as $cart_item ) {
			if (
				! empty( $cart_item[ self::CAMPAIGN_ID ] )
				&& isset( $cart_item['linked_to_product_key'] )
				&& $cart_item['linked_to_product_key'] === $cart_item_key
			) {
				return (string) $cart_item[ self::CAMPAIGN_ID ];
			}
		}

		return '';
	}

	/**
	 * Unit price, excluding tax, the shopper would pay without the offer.
	 *
	 * Read from a fresh product: the cart's own product object already
	 * carries the offer price (`set_price()`). In the view context other
	 * price filters (currency, role pricing) stay in; the Countdown Timer
	 * module asks for the edit context, which skips its own filter, when its
	 * timer is live on the product.
	 *
	 * @since 3.0.0
	 *
	 * @param WC_Product $cart_product Product object from the cart item.
	 * @param string     $context      `view` or `edit` (price without getter filters).
	 *
	 * @return string Decimal price, or '' when the product can't be read.
	 */
	public static function reference_price( $cart_product, string $context = 'view' ): string {
		if ( ! $cart_product instanceof WC_Product ) {
			return '';
		}

		$product = wc_get_product( $cart_product->get_id() );
		if ( ! $product ) {
			return '';
		}

		return (string) wc_format_decimal( wc_get_price_excluding_tax( $product, array( 'price' => $product->get_price( $context ) ) ) );
	}

	/**
	 * Remove StoreGrowth keys from items copied off a subscription.
	 *
	 * Runs for renewal and resubscribe orders. The items are the
	 * subscription's own, which is saved afterwards, so the subscription is
	 * cleaned for good.
	 *
	 * @since 3.0.0
	 *
	 * @param array $items Order items being copied.
	 *
	 * @return array
	 */
	public function strip_from_subscription_items( $items ) {
		if ( ! is_array( $items ) ) {
			return $items;
		}

		$keys = array_merge( self::STAMP_KEYS, array( self::TRIGGER_CAMPAIGN_ID, self::REFERENCE_PRICE, self::COUNTDOWN_PCT ) );

		foreach ( $items as $item ) {
			if ( ! $item instanceof WC_Order_Item ) {
				continue;
			}

			foreach ( $keys as $key ) {
				$item->delete_meta_data( $key );
			}
		}

		return $items;
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
