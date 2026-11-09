<?php
/**
 * Cart Rewards free gift lines.
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Modules\ProgressiveDiscountBanner;

use StorePulse\StoreGrowth\Interfaces\HookRegistry;
use StorePulse\StoreGrowth\Pricing\CartLine;
use StorePulse\StoreGrowth\Pricing\Referee;
use WC_Cart;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * A gift milestone is a $0 line. Whether a line exists is worked out on each
 * cart calculation: added when its milestone is reached, gone when it isn't.
 *
 * @since SPSG_VERSION
 */
class RewardGifts implements HookRegistry {

	/**
	 * Whether the gifts are being worked out: removing a line recalculates
	 * totals.
	 *
	 * @var bool
	 */
	private static bool $syncing = false;

	/**
	 * Register hooks.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return void
	 */
	public function register_hooks(): void {
		// After the referee, which applies automatic coupons and prices the deals.
		add_action( 'woocommerce_before_calculate_totals', [ $this, 'sync_gifts' ], Referee::PRIORITY + 10 );
		add_filter( 'woocommerce_get_item_data', [ $this, 'label_gift' ], 10, 2 );
		add_filter( 'woocommerce_cart_item_remove_link', [ $this, 'hide_remove_link' ], 10, 2 );
		add_filter( 'woocommerce_cart_item_quantity', [ $this, 'fix_quantity_field' ], 10, 3 );
		add_filter( 'woocommerce_store_api_product_quantity_editable', [ $this, 'lock_block_quantity' ], 10, 3 );
	}

	/**
	 * Make the cart's gift lines match the milestones it has reached.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param WC_Cart $cart Cart.
	 *
	 * @return void
	 */
	public function sync_gifts( WC_Cart $cart ): void {
		if ( self::$syncing ) {
			return;
		}

		self::$syncing = true;

		try {
			// Priced first, so the subtotal below counts them at $0.
			foreach ( $this->gift_lines( $cart ) as $key => $item ) {
				$cart->cart_contents[ $key ]['quantity'] = 1;
				CartLine::set_price( $cart, $key, 0.0 );
			}

			$earned = [];

			foreach ( Milestones::reached( $cart ) as $row ) {
				if ( Milestones::GIFT === $row['reward'] ) {
					$earned[ $row['id'] ] = $row;
				}
			}

			foreach ( $this->gift_lines( $cart ) as $key => $item ) {
				if ( isset( $earned[ $item[ CartLine::REWARD_GIFT ] ] ) ) {
					unset( $earned[ $item[ CartLine::REWARD_GIFT ] ] );
				} else {
					CartLine::remove( $cart, $key );
				}
			}

			foreach ( $earned as $row ) {
				$this->add_gift( $cart, $row );
			}
		} finally {
			self::$syncing = false;
		}
	}

	/**
	 * The cart's reward gift lines.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param WC_Cart $cart Cart.
	 *
	 * @return array[]
	 */
	private function gift_lines( WC_Cart $cart ): array {
		return array_filter(
			$cart->cart_contents,
			static function ( array $item ): bool {
				return ! empty( $item[ CartLine::REWARD_GIFT ] );
			}
		);
	}

	/**
	 * Add a gift line. Written to the cart directly: `add_to_cart()` would
	 * calculate totals again and fire `woocommerce_add_to_cart`, which BOGO
	 * and the analytics counters listen to.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param WC_Cart $cart Cart.
	 * @param array   $row  Gift milestone.
	 *
	 * @return void
	 */
	private function add_gift( WC_Cart $cart, array $row ): void {
		$product = wc_get_product( $row['gift_product_id'] );

		// A variable product can't go in the cart without its options.
		if ( ! $product || $product->is_type( 'variable' ) || ! $product->is_purchasable() || ! $product->is_in_stock() ) {
			return;
		}

		$is_variation = $product->is_type( 'variation' );
		$product_id   = $is_variation ? $product->get_parent_id() : $product->get_id();
		$variation_id = $is_variation ? $product->get_id() : 0;
		$variation    = $is_variation ? $product->get_variation_attributes() : [];
		$item_data    = [ CartLine::REWARD_GIFT => $row['id'] ];
		$key          = $cart->generate_cart_id( $product_id, $variation_id, $variation, $item_data );

		$cart->cart_contents[ $key ] = array_merge(
			$item_data,
			[
				'key'          => $key,
				'product_id'   => $product_id,
				'variation_id' => $variation_id,
				'variation'    => $variation,
				'quantity'     => 1,
				'data'         => $product,
				'data_hash'    => wc_get_cart_item_data_hash( $product ),
			]
		);

		CartLine::set_price( $cart, $key, 0.0 );
	}

	/**
	 * Label a gift line.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array $item_data Item data.
	 * @param array $cart_item Cart item.
	 *
	 * @return array
	 */
	public function label_gift( $item_data, $cart_item ) {
		if ( ! empty( $cart_item[ CartLine::REWARD_GIFT ] ) ) {
			$item_data   = (array) $item_data;
			$item_data[] = [
				'key'   => __( 'Reward', 'storegrowth-sales-booster' ),
				'value' => __( 'Free gift', 'storegrowth-sales-booster' ),
			];
		}

		return $item_data;
	}

	/**
	 * Take the remove link off a gift line.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param string $link Remove link.
	 * @param string $key  Cart item key.
	 *
	 * @return string
	 */
	public function hide_remove_link( $link, $key ) {
		return $this->is_gift_key( (string) $key ) ? '' : $link;
	}

	/**
	 * Show a gift line's quantity as a plain 1.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param string $field     Quantity field.
	 * @param string $key       Cart item key.
	 * @param array  $cart_item Cart item.
	 *
	 * @return string
	 */
	public function fix_quantity_field( $field, $key, $cart_item ) {
		return ! empty( $cart_item[ CartLine::REWARD_GIFT ] ) ? '1' : $field;
	}

	/**
	 * Keep a block cart from changing a gift line's quantity.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param bool        $editable  Whether the quantity can be edited.
	 * @param \WC_Product $product   Product.
	 * @param array       $cart_item Cart item.
	 *
	 * @return bool
	 */
	public function lock_block_quantity( $editable, $product, $cart_item ) {
		return empty( $cart_item[ CartLine::REWARD_GIFT ] ) && $editable;
	}

	/**
	 * Whether a cart key is a gift line.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param string $key Cart item key.
	 *
	 * @return bool
	 */
	private function is_gift_key( string $key ): bool {
		return WC()->cart && ! empty( WC()->cart->cart_contents[ $key ][ CartLine::REWARD_GIFT ] );
	}
}
