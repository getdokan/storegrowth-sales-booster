<?php
/**
 * AJAX handler for Order Bump frontend operations using REST API.
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Modules\UpsellOrderBump;

use StorePulse\StoreGrowth\Analytics\Counter;
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
			$this->remove_offer_from_cart( $offer_id );

			wp_send_json_success( $offer_variation_id );
		}

		if ( ! $offer_id ) {
			wp_send_json_error( array( 'message' => __( 'Invalid product.', 'storegrowth-sales-booster' ) ), 400 );
		}

		// Already in the cart (a repeated tick, e.g. quick clicks before the
		// page reloads): one bump line, not one per request.
		if ( $this->is_offer_in_cart( $offer_id ) ) {
			wp_send_json_success( $offer_variation_id );
		}

		$offer = $this->find_offer( $offer_id );
		if ( null === $offer ) {
			wp_send_json_error( array( 'message' => __( 'This offer is not available.', 'storegrowth-sales-booster' ) ), 403 );
		}

		// E.g. a variation with an "Any …" attribute, which can't be added without a choice.
		if ( ! $this->add_offer_to_cart( $offer ) ) {
			wp_send_json_error( [ 'message' => __( 'This offer could not be added to the cart.', 'storegrowth-sales-booster' ) ], 400 );
		}

		Counter::bump( UpsellOrderBumpModule::get_id(), 'accept', Counter::CAMPAIGN, (int) $offer['bump']['id'] );

		$woocommerce->cart->calculate_totals();
		$woocommerce->cart->set_session();
		$woocommerce->cart->maybe_set_cart_cookies();

		wp_send_json_success( $offer_variation_id );
		die();
	}

	/**
	 * Add an offer (`find_offer()`) to the cart as a bump line: at the bump's
	 * price, marked, with its attribution stamp; a variation under its
	 * parent, both taken from the product rather than the request.
	 *
	 * @since 3.0.0
	 *
	 * @param array $offer An offer from `find_offer()`.
	 *
	 * @return string|false The cart item key, or false when WooCommerce refused it.
	 */
	public function add_offer_to_cart( array $offer ) {
		// `custom_price` is the Order Bump price key applied by
		// OrderBump::woocommerce_custom_price_to_cart_item().
		$cart_item_data = array_merge(
			[
				'custom_price'             => $offer['price'],
				'_spsg_order_bump_product' => true,
			],
			// Attribution stamp — additive campaign identity keys for revenue reporting.
			$offer['stamp']
		);

		$product = $offer['product'];
		if ( $product->is_type( 'variation' ) ) {
			return WC()->cart->add_to_cart( $product->get_parent_id(), 1, $product->get_id(), [], $cart_item_data );
		}

		return WC()->cart->add_to_cart( $product->get_id(), 1, 0, [], $cart_item_data );
	}

	/**
	 * Whether the cart already holds a bump line of this offer.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param int $offer_id The offered product: a variation's own id, else the product's.
	 *
	 * @return bool
	 */
	public function is_offer_in_cart( int $offer_id ): bool {
		foreach ( WC()->cart->get_cart() as $cart_item ) {
			$cart_item_id = ! empty( $cart_item['variation_id'] ) ? (int) $cart_item['variation_id'] : (int) $cart_item['product_id'];

			if ( $cart_item_id === $offer_id && OrderBump::is_bump_cart_item( $cart_item ) ) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Remove an offer's bump lines from the cart (unticking the box), and
	 * count the removal against the bump each line came from; the shopper's
	 * own lines of the same product stay.
	 *
	 * @since 3.0.0
	 *
	 * @param int $offer_id The offered product: a variation's own id, else the product's.
	 *
	 * @return int How many lines were removed.
	 */
	public function remove_offer_from_cart( int $offer_id ) {
		$removed = 0;

		foreach ( WC()->cart->get_cart() as $cart_item_key => $cart_item ) {
			$cart_item_id = ! empty( $cart_item['variation_id'] ) ? (int) $cart_item['variation_id'] : (int) $cart_item['product_id'];

			if ( $cart_item_id === $offer_id && OrderBump::is_bump_cart_item( $cart_item ) && WC()->cart->remove_cart_item( $cart_item_key ) ) {
				++$removed;

				// The stamp's campaign id is "order_bump:<bump id>".
				$bump_id = (int) substr( (string) strrchr( (string) ( $cart_item[ OfferAttribution::CAMPAIGN_ID ] ?? '' ), ':' ), 1 );
				if ( $bump_id ) {
					Counter::bump( UpsellOrderBumpModule::get_id(), 'remove', Counter::CAMPAIGN, $bump_id );
				}
			}
		}

		return $removed;
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
	 * @since 3.0.0
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
