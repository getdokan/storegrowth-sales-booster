<?php

namespace StorePulse\StoreGrowth\Modules\UpsellOrderBump\Blocks;

use Automattic\WooCommerce\Blocks\Integrations\IntegrationInterface;
use StorePulse\StoreGrowth\Helper as PluginHelper;
use StorePulse\StoreGrowth\Modules\UpsellOrderBump\Database\OrderBumpData;

class OrderBumpCheckoutIntegration implements IntegrationInterface {

	protected string $script_key = 'storegrowth-upsell-order-bump';

	public function get_name(): string {
		return 'storegrowth-upsell-order-bump';
	}

	public function initialize() {
		// TODO: Implement initialize() method.
	}

	public function get_script_handles(): array {
		$blocks = require PluginHelper::get_modules_path( 'upsell-order-bump/assets/build/blocks.asset.php' );
		wp_register_script(
			$this->script_key,
			PluginHelper::get_modules_url( 'upsell-order-bump/assets/build/blocks.js' ),
			array_merge( [ 'wc-blocks-registry' ], $blocks['dependencies'] ),
			$blocks['version'],
			true
		);

		return [ $this->script_key ];
	}

	public function get_editor_script_handles(): array {
		return [ $this->script_key ];
	}

	public function get_script_data(): array {
		$order_bump_data = new OrderBumpData();
		$cart = WC()->cart;
		if ( empty( $cart ) ) {
			return [];
		}
		$all_cart_products     = $cart->get_cart();
		$all_cart_product_ids  = array();
		$all_cart_category_ids = array();

		if( empty( $all_cart_products ) ) {
			return [];
		}

		foreach ( $all_cart_products as $value ) {
			// Get categories from the current cart item (variation or simple product)
			$cat_ids = $value['data']->get_category_ids();
			foreach ( $cat_ids as $cat_id ) {
				$all_cart_category_ids[] = (int) $cat_id;
			}

			// For variable products, also get categories from the parent product
			if ( isset( $value['variation_id'] ) && $value['variation_id'] > 0 ) {
				$parent_product = wc_get_product( $value['product_id'] );
				if ( $parent_product ) {
					$parent_cat_ids = $parent_product->get_category_ids();
					foreach ( $parent_cat_ids as $cat_id ) {
						$all_cart_category_ids[] = (int) $cat_id;
					}
				}
			}

			// For variable products, include both parent product ID and variation ID
			// Convert to integers to ensure consistent data types
			$all_cart_product_ids[] = (int) $value['product_id'];
			if ( isset( $value['variation_id'] ) && $value['variation_id'] > 0 ) {
				$all_cart_product_ids[] = (int) $value['variation_id'];
			}
		}

		// Remove duplicate category IDs
		$all_cart_category_ids = array_unique( $all_cart_category_ids );

		// Get matching bumps using the new data access class
		$matching_bumps = $order_bump_data->get_matching_bumps( $all_cart_product_ids, $all_cart_category_ids );

		$data = [];

		foreach ( $matching_bumps as $bump ) {
			$offer_product_id           = $bump['offer_product_id'];
			$offer_type                 = $bump['offer_type'];
			$offer_amount               = $bump['offer_amount'];
			$bump['fallback_image_url'] = esc_url( PluginHelper::get_modules_url( 'upsell-order-bump/assets/images/bump-preview.svg' ) );

			$checked = '';
			if ( in_array( (int) $offer_product_id, $all_cart_product_ids, true ) ) {
				$checked = 'checked';
			}

			$_product = wc_get_product( $offer_product_id );
			if ( ! $_product || ! $_product->is_purchasable() ) {
				continue;
			}

			$regular_price = $_product->get_regular_price();
			// Use sale price if available, otherwise use regular price for discount calculation
			$current_price = $_product->get_sale_price() ? $_product->get_sale_price() : $regular_price;
			if ( 'discount' === $offer_type ) {
				$offer_price = ( $current_price - ( $current_price * $offer_amount / 100 ) );
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

			// Convert bump data to object for template compatibility
			$bump_info            = (object) array_merge( $bump, $bump['design_settings'] );
			$bump_info->bump_type = $bump['target_type'];

			$product_offer_id = 0;
			$variation_id     = 0;
			if ( $_product->is_type( 'variation' ) ) {
				$product_offer_id = $_product->get_parent_id();
				$variation_id     = $offer_product_id;
			}
			if ( $_product->is_type( 'simple' ) ) {
				$product_offer_id = $offer_product_id;
				$variation_id     = 0;
			}

			$product_id = $bump_info->offer_product ?? 0;
			$category_names = array();
			if( $product_id ) {
				$product_categories = wp_get_post_terms( $product_id, 'product_cat' );
				foreach ( $product_categories as $category ) {
					$category_names[] = $category->name;
				}
			}

			$bump_info->offer_price      = $offer_price;
			$bump_info->regular_price    = $regular_price;
			$bump_info->offer_product_id = $product_offer_id;
			$bump_info->variation_id     = $variation_id;
			$bump_info->checked          = $checked;
			$bump_info->currency_symbol  = html_entity_decode( get_woocommerce_currency_symbol() );
			$bump_info->category_names   = $category_names;
			// Check if product is available for purchase (in stock or allows backorders)
			$bump_info->is_purchasable   = $_product->is_in_stock() || $_product->backorders_allowed();

			$data[] = $bump_info;

		}

		return $data;
	}
}
