<?php
/**
 * Post type class.
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Modules\UpsellOrderBump;

use StorePulse\StoreGrowth\Interfaces\HookRegistry;
use StorePulse\StoreGrowth\Traits\Singleton;
use StorePulse\StoreGrowth\Modules\UpsellOrderBump\Database\OrderBumpData;
use StorePulse\StoreGrowth\Modules\UpsellOrderBump\Validators\BumpOfferValidator;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Load post type related functionality inside this class.
 */
class OrderBump implements HookRegistry {

	use Singleton;

	/**
	 * OrderBumpData instance.
	 *
	 * @var OrderBumpData
	 */
	private $order_bump_data;

	/**
	 * BumpOfferValidator instance.
	 *
	 * @var BumpOfferValidator
	 */
	private $bumpOfferValidator;

	/**
	 * Constructor.
	 */
	public function __construct() {
		$this->order_bump_data = new OrderBumpData();
		$this->bumpOfferValidator = new BumpOfferValidator($this->order_bump_data);
	}

	/**
	 * Constructor of Woocommerce_Functionality class.
	 */
	public function register_hooks(): void {
		add_action( 'woocommerce_review_order_before_submit', array( $this, 'bump_product_frontend_view' ) );
		add_action( 'woocommerce_before_calculate_totals', array( $this, 'woocommerce_custom_price_to_cart_item' ) );
		add_action( 'woocommerce_cart_item_removed', array( $this, 'handle_target_product_removal' ), 10, 2 );
		add_action( 'woocommerce_after_cart_item_quantity_update', array( $this, 'handle_cart_quantity_update' ), 10, 4 );
	}

	/**
	 * Bump offer product for frontend.
	 */
	public function bump_product_frontend_view() {
		global $woocommerce;
		$all_cart_products     = $woocommerce->cart->get_cart();
		$all_cart_product_ids  = array();
		$all_cart_category_ids = array();

		foreach ( $all_cart_products as $value ) {
			// Get categories from the current cart item (variation or simple product)
			$cat_ids = $value['data']->get_category_ids();
			foreach ( $cat_ids as $cat_id ) {
				$all_cart_category_ids[] = (int) $cat_id;
			}
			
			// For variable products, also get categories from the parent product
			if ( isset($value['variation_id']) && $value['variation_id'] > 0 ) {
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
			if ( isset($value['variation_id']) && $value['variation_id'] > 0 ) {
				$all_cart_product_ids[] = (int) $value['variation_id'];
			}
		}
		
		// Remove duplicate category IDs
		$all_cart_category_ids = array_unique( $all_cart_category_ids );

		// Get matching bumps using the new data access class
		$matching_bumps = $this->order_bump_data->get_matching_bumps( $all_cart_product_ids, $all_cart_category_ids );

		foreach ( $matching_bumps as $bump ) {
			$offer_product_id = $bump['offer_product_id'];
			$offer_type       = $bump['offer_type'];
			$offer_amount     = $bump['offer_amount'];

			$checked = '';
			if ( in_array( (int) $offer_product_id, $all_cart_product_ids, true ) ) {
				$checked = 'checked';
			}

			$_product      = wc_get_product( $offer_product_id );

			// FIX: If the offer product doesn't exist (deleted or invalid ID), skip it to avoid a fatal error.
			if ( ! $_product ) {
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
			$bump_info = (object) array_merge( $bump, $bump['design_settings'] );
			$bump_info->bump_type = $bump['target_type'];

			// Check if product is available for purchase (in stock or allows backorders)
			$is_purchasable = $_product->is_in_stock() || $_product->backorders_allowed();

			include __DIR__ . '/../templates/bump-product-front-view.php';
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

	/**
	 * Handle when a target product is removed from cart - clean up any related bump products.
	 *
	 * @param string $cart_item_key The cart item key.
	 * @param object $cart The cart object.
	 */
	public function handle_target_product_removal( $cart_item_key, $cart ) {
		$removed_item = $cart->removed_cart_contents[ $cart_item_key ];
		if ( ! $removed_item ) {
			return;
		}

		$removed_product_id = $removed_item['product_id'];
		$removed_variation_id = isset( $removed_item['variation_id'] ) ? $removed_item['variation_id'] : 0;
		
		// For variable products, check both parent and variation IDs
		$removed_item_ids = array( $removed_product_id );
		if ( $removed_variation_id > 0 ) {
			$removed_item_ids[] = $removed_variation_id;
		}

		$this->validate_bump_products_after_removal( $removed_item_ids );
	}

	/**
	 * Handle cart quantity updates - if quantity becomes 0, treat as removal.
	 *
	 * @param string $cart_item_key The cart item key.
	 * @param int    $quantity New quantity.
	 * @param int    $old_quantity Old quantity.
	 * @param object $cart The cart object.
	 */
	public function handle_cart_quantity_update( $cart_item_key, $quantity, $old_quantity, $cart ) {
		// If quantity was reduced to 0, the item is effectively removed
		if ( $quantity === 0 && $old_quantity > 0 ) {
			$cart_item = $cart->cart_contents[ $cart_item_key ];
			if ( $cart_item ) {
				$product_id = $cart_item['product_id'];
				$variation_id = isset( $cart_item['variation_id'] ) ? $cart_item['variation_id'] : 0;
				
				// For variable products, check both parent and variation IDs
				$item_ids = array( $product_id );
				if ( $variation_id > 0 ) {
					$item_ids[] = $variation_id;
				}

				$this->validate_bump_products_after_removal( $item_ids );
			}
		}
	}

	/**
	 * Validate and clean up bump products when their target products are removed.
	 *
	 * @param array $removed_item_ids Array of removed product/variation IDs.
	 */
	private function validate_bump_products_after_removal( $removed_item_ids ) {
		$this->bumpOfferValidator->validateBumpOffersAfterRemoval($removed_item_ids);
	}

	/**
	 * Get remaining target products in cart for a bump offer.
	 *
	 * @param array $bump_info The bump offer info.
	 * @param string $bump_type The bump type (products or categories).
	 * @return array Array of remaining target product IDs.
	 */
	private function get_remaining_target_products( $bump_info, $bump_type ) {
		$cart = WC()->cart;
		$remaining_targets = array();

		foreach ( $cart->get_cart() as $cart_item ) {
			$cart_product_id = $cart_item['product_id'];
			$cart_variation_id = isset( $cart_item['variation_id'] ) ? $cart_item['variation_id'] : 0;
			
			// For variable products, check both parent and variation IDs
			$cart_item_ids = array( $cart_product_id );
			if ( $cart_variation_id > 0 ) {
				$cart_item_ids[] = $cart_variation_id;
			}

			if ( $bump_type === 'products' ) {
				$target_products = $bump_info['target_products'];
				if ( ! empty( array_intersect( $cart_item_ids, $target_products ) ) ) {
					$remaining_targets = array_merge( $remaining_targets, $cart_item_ids );
				}
			} else {
				$cart_categories = wp_get_post_terms( $cart_product_id, 'product_cat', array( 'fields' => 'ids' ) );
				$target_categories = $bump_info['target_categories'];
				if ( ! empty( array_intersect( $cart_categories, $target_categories ) ) ) {
					$remaining_targets = array_merge( $remaining_targets, $cart_item_ids );
				}
			}
		}

		return $remaining_targets;
	}

	/**
	 * Handle orphaned bump product - remove it from cart.
	 *
	 * @param int $offer_product_id The bump offer product ID.
	 */
	private function handle_orphaned_bump_product( $offer_product_id ) {
		$cart = WC()->cart;

		foreach ( $cart->get_cart() as $cart_item_key => $cart_item ) {
			$cart_product_id = $cart_item['product_id'];
			$cart_variation_id = isset( $cart_item['variation_id'] ) ? $cart_item['variation_id'] : 0;
			$cart_item_id = $cart_variation_id > 0 ? $cart_variation_id : $cart_product_id;

			// Check if this is the bump product with custom pricing and remove it
			if ( $cart_item_id == $offer_product_id && isset( $cart_item['custom_price'] ) ) {
				$cart->remove_cart_item( $cart_item_key );
			}
		}
	}
}
