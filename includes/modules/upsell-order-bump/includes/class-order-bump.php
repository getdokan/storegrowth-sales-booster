<?php
/**
 * Post type class.
 *
 * @package SBFW
 */

namespace STOREGROWTH\SPSB\Modules\Upsell_Order_Bump;

use STOREGROWTH\SPSB\Traits\Singleton;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Load post type related functionality inside this class.
 */
class Order_Bump {

	use Singleton;

	/**
	 * Constructor of Woocommerce_Functionality class.
	 */
	public function __construct() {
		add_action( 'woocommerce_review_order_before_submit', array( $this, 'bump_product_frontend_view' ) );
		add_action( 'woocommerce_before_calculate_totals', array( $this, 'woocommerce_custom_price_to_cart_item' ) );
	}

	/**
	 * Bump offer product for frontend.
	 */
	public function bump_product_frontend_view() {

		global $woocommerce;
		$all_cart_products      = $woocommerce->cart->get_cart();
		$all_cart_product_ids   = array();
		$all_cart_category_ids  = array();
		$args_bump              = array(
			'post_type'      => 'sgsb_order_bump',
			'posts_per_page' => -1,
		);
		$bump_list              = get_posts( $args_bump );
		$showed_bump_product_id = array();

		foreach ( $all_cart_products as $value ) {
			$cat_ids = $value['data']->get_category_ids();
			foreach ( $cat_ids as $cat_id ) {
				$all_cart_category_ids[] = $cat_id;
			}
			$all_cart_product_ids[] = $value['product_id'];
		}

		foreach ( $bump_list as $bump ) {
			$bump_info        = maybe_unserialize( $bump->post_excerpt );
			$bump_info        = (object) $bump_info;
			$offer_product_id = $bump_info->offer_product;
			$offer_type       = $bump_info->offer_type;
			$offer_amount     = $bump_info->offer_amount;

			$checked = '';
			if ( in_array( (int) $offer_product_id, $all_cart_product_ids, true ) ) {
				$checked = 'checked';
			}

			$_product      = wc_get_product( $offer_product_id );
			$regular_price = $_product->get_regular_price();
			if ( 'discount' === $offer_type ) {
				$offer_price = ( $regular_price - ( $regular_price * $offer_amount / 100 ) );
			} else {
				$offer_price = $offer_amount;
			}

			$cart                            = WC()->cart;
			$product_already_added_from_shop = false;
			foreach ( $cart->get_cart() as $cart_item_key => $cart_item ) {
				$product    = $cart_item['data'];
				$product_id = $product->get_id();
				if ( absint( $product_id ) !== absint( $offer_product_id ) ) {
					continue;
				}
				$price = $product->get_price();
				if ( floatval( $price ) !== floatval( $offer_price ) ) {
					$product_already_added_from_shop = true;
				}
				break;
			}
			if ( $product_already_added_from_shop ) {
				// don't show the offer if the 'offer product' is already added in the cart from the shop page with regular price.
				continue;
			}
			if (
				$bump_info->target_products
				&&
				count( $all_cart_product_ids ) !== count( array_diff( $all_cart_product_ids, $bump_info->target_products ) )
				&&
				! in_array( $offer_product_id, $showed_bump_product_id, true )
			) {

				include __DIR__ . '/../templates/bump-product-front-view.php';

				$showed_bump_product_id[] = $offer_product_id;
			}

			if (
				isset( $bump_info->target_categories )
				&& count( $all_cart_category_ids ) !== count( array_diff( $all_cart_category_ids, $bump_info->target_categories ) )
				&& ! in_array( $offer_product_id, $showed_bump_product_id, true )
			) {

				include __DIR__ . '/../templates/bump-product-front-view.php';

				$showed_bump_product_id[] = $offer_product_id;
			}
		}
	}


	/**
	 * Product custom price.
	 *
	 * @param object $cart_object is all product of cart.
	 */
	public function woocommerce_custom_price_to_cart_item( $cart_object ) {
		if ( ! WC()->session->__isset( 'reload_checkout' ) ) {
			foreach ( $cart_object->cart_contents as $key => $value ) {
				if ( isset( $value['custom_price'] ) ) {
					$value['data']->set_price( $value['custom_price'] );
				}
			}
		}
	}
}
