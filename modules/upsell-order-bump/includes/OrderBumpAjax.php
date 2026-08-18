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

		if ( $checked ) {
			foreach ( WC()->cart->get_cart() as $cart_item_key => $cart_item ) {
				if ( $cart_item['product_id'] === $offer_product_id ) {
					WC()->cart->remove_cart_item( $cart_item_key );
				}
			}

			wp_send_json_success( $offer_variation_id );
		}

		if ( ! $offer_product_id ) {
			wp_send_json_error( array( 'message' => __( 'Invalid product.', 'storegrowth-sales-booster' ) ), 400 );
		}

		$bump_price = $this->resolve_authorized_bump_price( $offer_product_id );
		if ( null === $bump_price ) {
			wp_send_json_error( array( 'message' => __( 'This offer is not available.', 'storegrowth-sales-booster' ) ), 403 );
		}

		// `custom_price` is the Order Bump price key applied by
		// OrderBump::woocommerce_custom_price_to_cart_item().
		$cart_item_data = array(
			'custom_price'             => $bump_price,
			'_spsg_order_bump_product' => true,
		);

		// Attribution stamp — additive campaign identity keys for revenue reporting.
		$cart_item_data = array_merge( $cart_item_data, $this->resolve_bump_stamp( $offer_product_id, $offer_variation_id ) );

		$woocommerce->cart->add_to_cart( $offer_product_id, 1, $offer_variation_id, array(), $cart_item_data );
		$woocommerce->cart->calculate_totals();
		$woocommerce->cart->set_session();
		$woocommerce->cart->maybe_set_cart_cookies();

		wp_send_json_success( $offer_variation_id );
		die();
	}

	/**
	 * Resolve the campaign attribution stamp for an accepted order bump.
	 *
	 * Re-derives the matching bump server-side from the cart contents so the
	 * campaign identity is trustworthy, then computes the per-unit discount the
	 * bump applied. Returns an empty array when no active bump offers the
	 * product, so the caller adds nothing rather than a broken stamp.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param int $offer_product_id   Offer (parent) product id being added.
	 * @param int $offer_variation_id Offer variation id, or 0 for a simple product.
	 *
	 * @return array<string, string>
	 */
	private function resolve_bump_stamp( $offer_product_id, $offer_variation_id = 0 ) {
		$offer_product_id = (int) $offer_product_id;
		if ( ! $offer_product_id || is_null( WC()->cart ) ) {
			return array();
		}

		$cart_product_ids  = array();
		$cart_category_ids = array();

		foreach ( WC()->cart->get_cart() as $cart_item ) {
			if ( empty( $cart_item['data'] ) ) {
				continue;
			}
			$cart_product_ids[] = (int) $cart_item['product_id'];
			foreach ( $cart_item['data']->get_category_ids() as $cat_id ) {
				$cart_category_ids[] = (int) $cat_id;
			}
		}

		$matching_bumps = ( new OrderBumpData() )->get_matching_bumps( $cart_product_ids, $cart_category_ids );

		foreach ( $matching_bumps as $bump ) {
			if ( (int) $bump['offer_product_id'] !== $offer_product_id ) {
				continue;
			}

			$priced_product = wc_get_product( $offer_variation_id ? (int) $offer_variation_id : $offer_product_id );
			if ( ! $priced_product ) {
				return array();
			}

			$current_price = (float) ( $priced_product->get_sale_price() ? $priced_product->get_sale_price() : $priced_product->get_regular_price() );
			$offer_amount  = isset( $bump['offer_amount'] ) ? (float) $bump['offer_amount'] : 0;

			if ( isset( $bump['offer_type'] ) && 'discount' === $bump['offer_type'] ) {
				$reward_type    = 'discount';
				$discount_value = $current_price * ( $offer_amount / 100 );
			} else {
				$reward_type    = 'fixed';
				$discount_value = max( $current_price - $offer_amount, 0 );
			}

			return OfferAttribution::stamp( 'order_bump', (int) $bump['id'], $reward_type, $discount_value );
		}

		return array();
	}

	/**
	 * Resolve the price an order-bump product may be added at, deriving it from
	 * the bump configuration instead of trusting the client.
	 *
	 * Returns null when no bump the current cart qualifies for offers this
	 * product, so callers add nothing.
	 *
	 * @since 2.1.2
	 *
	 * @param int $offer_product_id Requested bump product id.
	 *
	 * @return float|null Authorised price, or null when unauthorised.
	 */
	private function resolve_authorized_bump_price( int $offer_product_id ) {
		if ( ! function_exists( 'WC' ) || ! WC()->cart ) {
			return null;
		}

		$cart_product_ids  = array();
		$cart_category_ids = array();

		foreach ( WC()->cart->get_cart() as $cart_item ) {
			$cart_product_ids[] = (int) $cart_item['product_id'];

			if ( isset( $cart_item['variation_id'] ) && $cart_item['variation_id'] > 0 ) {
				$cart_product_ids[] = (int) $cart_item['variation_id'];
			}

			if ( $cart_item['data'] instanceof \WC_Product ) {
				foreach ( $cart_item['data']->get_category_ids() as $cat_id ) {
					$cart_category_ids[] = (int) $cat_id;
				}
			}
		}

		$cart_category_ids = array_unique( $cart_category_ids );

		$order_bump_data = new OrderBumpData();
		$matching_bumps  = $order_bump_data->get_matching_bumps( $cart_product_ids, $cart_category_ids );

		foreach ( $matching_bumps as $bump ) {
			if ( (int) $bump['offer_product_id'] !== (int) $offer_product_id ) {
				continue;
			}

			$product = wc_get_product( $offer_product_id );
			if ( ! $product ) {
				return null;
			}

			// Price derived from the bump, matching
			// OrderBump::bump_product_frontend_view() exactly.
			$regular_price = $product->get_regular_price();
			$current_price = $product->get_sale_price() ? $product->get_sale_price() : $regular_price;

			if ( 'discount' === $bump['offer_type'] ) {
				return (float) ( $current_price - ( $current_price * $bump['offer_amount'] / 100 ) );
			}

			return (float) $bump['offer_amount'];
		}

		return null;
	}
}
