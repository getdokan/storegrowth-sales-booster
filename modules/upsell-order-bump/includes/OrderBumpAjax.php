<?php
/**
 * AJAX handler for Order Bump frontend operations using REST API.
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Modules\UpsellOrderBump;

use StorePulse\StoreGrowth\Attribution\OfferAttribution;
use StorePulse\StoreGrowth\Interfaces\HookRegistry;
use StorePulse\StoreGrowth\Modules\UpsellOrderBump\Database\OrderBumpData;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * AJAX handler for Order Bump frontend operations.
 */
class OrderBumpAjax implements HookRegistry {

	/**
	 * Register hooks.
	 */
	public function register_hooks(): void {
		add_action( 'wp_ajax_upsell_offer_product_add_to_cart', array( $this, 'upsell_offer_product_add_to_cart' ) );
		add_action( 'wp_ajax_nopriv_upsell_offer_product_add_to_cart', array( $this, 'upsell_offer_product_add_to_cart' ) );
	}

	/**
	 * Bump product add to cart.
	 */
	public function upsell_offer_product_add_to_cart() {
		check_ajax_referer( 'spsg_frontend_ajax_nonce' );

		global $woocommerce;

		$checked            = isset( $_POST['data']['checked'] ) ? boolval( wp_unslash( $_POST['data']['checked'] ) ) : null;
		$offer_product_id   = isset( $_POST['data']['offer_product_id'] ) ? intval( wp_unslash( $_POST['data']['offer_product_id'] ) ) : null;
		$offer_variation_id = isset( $_POST['data']['offer_variation_id'] ) ? intval( wp_unslash( $_POST['data']['offer_variation_id'] ) ) : null;

		// Any `bump_price` in the request is ignored; the price is derived
		// server-side from the bump configuration.

		// A bump stores the product it offers: a variation's own id, else the
		// product's. The storefront sends a variation's parent and the
		// variation, so the offer is the variation when there is one.
		$offer_id = $offer_variation_id ? $offer_variation_id : (int) $offer_product_id;

		if ( $checked ) {
			foreach ( WC()->cart->get_cart() as $cart_item_key => $cart_item ) {
				$cart_item_id = ! empty( $cart_item['variation_id'] ) ? (int) $cart_item['variation_id'] : (int) $cart_item['product_id'];
				if ( $cart_item_id === $offer_id ) {
					WC()->cart->remove_cart_item( $cart_item_key );
				}
			}

			wp_send_json_success( $offer_variation_id );
		}

		if ( ! $offer_id ) {
			wp_send_json_error( array( 'message' => __( 'Invalid product.', 'storegrowth-sales-booster' ) ), 400 );
		}

		$offer = $this->find_offer( $offer_id );
		if ( null === $offer ) {
			wp_send_json_error( array( 'message' => __( 'This offer is not available.', 'storegrowth-sales-booster' ) ), 403 );
		}

		// `custom_price` is the Order Bump price key applied by
		// OrderBump::woocommerce_custom_price_to_cart_item().
		$cart_item_data = array(
			'custom_price'             => $offer['price'],
			'_spsg_order_bump_product' => true,
		);

		// Attribution stamp — additive campaign identity keys for revenue reporting.
		$cart_item_data = array_merge( $cart_item_data, $offer['stamp'] );

		// The parent and the variation from the product, not the request.
		$product = $offer['product'];
		if ( $product->is_type( 'variation' ) ) {
			$woocommerce->cart->add_to_cart( $product->get_parent_id(), 1, $product->get_id(), array(), $cart_item_data );
		} else {
			$woocommerce->cart->add_to_cart( $product->get_id(), 1, 0, array(), $cart_item_data );
		}
		$woocommerce->cart->calculate_totals();
		$woocommerce->cart->set_session();
		$woocommerce->cart->maybe_set_cart_cookies();

		wp_send_json_success( $offer_variation_id );
		die();
	}

	/**
	 * The active bump the current cart qualifies for that offers this product,
	 * with the price it may be added at and its attribution stamp, both
	 * derived here rather than trusted from the client.
	 *
	 * One matcher for the price and the stamp (they used to build the cart's
	 * ids differently, and compared a variation offer with its parent's id,
	 * so a variation offer was refused with a 403).
	 *
	 * @since SPSG_VERSION
	 *
	 * @param int $offer_id The offered product: a variation's own id, else the product's.
	 *
	 * @return array{bump: array, product: \WC_Product, price: float, stamp: array<string, string>}|null
	 *         Null when no such bump applies, so the caller adds nothing.
	 */
	public function find_offer( int $offer_id ) {
		if ( ! $offer_id || ! function_exists( 'WC' ) || ! WC()->cart ) {
			return null;
		}

		list( $cart_product_ids, $cart_category_ids ) = OrderBump::get_cart_targets();

		foreach ( ( new OrderBumpData() )->get_matching_bumps( $cart_product_ids, $cart_category_ids ) as $bump ) {
			if ( (int) $bump['offer_product_id'] !== $offer_id ) {
				continue;
			}

			$product = wc_get_product( $offer_id );
			if ( ! $product ) {
				return null;
			}

			// Price derived from the bump, as the checkout box shows it.
			$current_price = OrderBump::get_current_price( $product );
			$price         = OrderBump::calculate_offer_price( $bump['offer_type'], $current_price, $bump['offer_amount'] ?? 0 );
			$reward_types  = [
				'discount' => 'discount',
				'free'     => 'free',
			];

			return [
				'bump'    => $bump,
				'product' => $product,
				'price'   => $price,
				'stamp'   => OfferAttribution::stamp(
					'order_bump',
					(int) $bump['id'],
					$reward_types[ $bump['offer_type'] ] ?? 'fixed',
					max( $current_price - $price, 0 )
				),
			];
		}

		return null;
	}
}
