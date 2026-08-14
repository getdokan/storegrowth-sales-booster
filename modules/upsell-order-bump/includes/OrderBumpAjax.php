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
		$all_cart_products = $woocommerce->cart->get_cart();

		foreach ( $all_cart_products as $value ) {
			$cat_ids = $value['data']->get_category_ids();
			foreach ( $cat_ids as $cat_id ) {
				$all_cart_category_ids[] = $cat_id;
			}
			$all_cart_product_ids[] = $value['product_id'];
		}

		$bump_price         = isset( $_POST['data']['bump_price'] ) ? floatval( wp_unslash( $_POST['data']['bump_price'] ) ) : null;
		$checked            = isset( $_POST['data']['checked'] ) ? boolval( wp_unslash( $_POST['data']['checked'] ) ) : null;
		$offer_product_id   = isset( $_POST['data']['offer_product_id'] ) ? intval( wp_unslash( $_POST['data']['offer_product_id'] ) ) : null;
		$offer_variation_id = isset( $_POST['data']['offer_variation_id'] ) ? intval( wp_unslash( $_POST['data']['offer_variation_id'] ) ) : null;
		
		if ( $checked ) {
			$product_id      = $offer_product_id;
			$product_cart_id = WC()->cart->generate_cart_id( $product_id );
			$cart_item_key   = WC()->cart->find_product_in_cart( $product_cart_id );
			foreach ( WC()->cart->get_cart() as $cart_item_key => $cart_item ) {
				if ( $cart_item['product_id'] === $offer_product_id ) {
					WC()->cart->remove_cart_item( $cart_item_key );
				}
			}
		} else {
			$custom_price = $bump_price;
			// Cart item data to send & save in order.
			$cart_item_data = array( 'custom_price' => $custom_price, '_spsg_order_bump_product' => true );

			// Attribution stamp — additive campaign identity keys for revenue reporting.
			$cart_item_data = array_merge( $cart_item_data, $this->resolve_bump_stamp( $offer_product_id, $offer_variation_id ) );

			// Woocommerce function to add product into cart check its documentation also.
			$woocommerce->cart->add_to_cart( $offer_product_id, 1, $offer_variation_id, $variation = array(), $cart_item_data );
			// Calculate totals.
			$woocommerce->cart->calculate_totals();
			// Save cart to session.
			$woocommerce->cart->set_session();
			// Maybe set cart cookies.
			$woocommerce->cart->maybe_set_cart_cookies();
		}

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
}
