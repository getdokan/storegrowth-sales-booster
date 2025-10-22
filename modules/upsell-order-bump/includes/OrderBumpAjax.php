<?php
/**
 * AJAX handler for Order Bump frontend operations using REST API.
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Modules\UpsellOrderBump;

use StorePulse\StoreGrowth\Interfaces\HookRegistry;

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
		check_ajax_referer( 'ajd_protected' );
		
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
}
