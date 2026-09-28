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
use WC_Product;

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
		foreach ( self::get_checkout_offers() as $offer ) {
			$bump             = $offer['bump'];
			$offer_product_id = $bump['offer_product_id'];
			$offer_type       = $bump['offer_type'];
			$offer_amount     = $bump['offer_amount'];
			$offer_label      = $offer['offer_label'];
			$checked          = $offer['checked'];
			$_product         = $offer['product'];
			$product_offer_id = $offer['cart_product_id'];
			$variation_id     = $offer['variation_id'];
			$regular_price    = $offer['regular_price_display'];
			$offer_price      = $offer['offer_price_display'];
			$is_purchasable   = $offer['is_purchasable'];

			// Convert bump data to object for template compatibility.
			$bump_info            = (object) array_merge( $bump, $offer['design'] );
			$bump_info->bump_type = $bump['target_type'];

			include __DIR__ . '/../templates/bump-product-front-view.php';
		}
	}

	/**
	 * The bumps the checkout shows for the current cart, with what the
	 * classic box and the checkout block both print: the offer product, the
	 * struck regular price and the bump price (the one the cart charges),
	 * the offer strip's text, whether it's in the cart, whether it can be
	 * bought, and the design sanitized as a save does (so a row stored
	 * before that can't print CSS or markup).
	 *
	 * Prices are given as entered (`offer_price`, what the cart line is set
	 * to) and as displayed (`*_display`: with or without tax, as the store
	 * shows cart prices), so what the box shows is what the cart charges.
	 *
	 * Left out: an offer product that can't be bought (no price, not
	 * published) and one already in the cart as the shopper's own line.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return array[]
	 */
	public static function get_checkout_offers() {
		list( $cart_product_ids, $cart_category_ids ) = self::get_cart_targets();

		$offers = [];

		foreach ( ( new OrderBumpData() )->get_matching_bumps( $cart_product_ids, $cart_category_ids ) as $bump ) {
			$offer_product_id = (int) $bump['offer_product_id'];
			$product          = wc_get_product( $offer_product_id );

			// A deleted or unsellable offer product: skip it.
			if ( ! $product || ! $product->is_purchasable() ) {
				continue;
			}

			$checked = '';
			foreach ( WC()->cart->get_cart() as $cart_item ) {
				if ( absint( $cart_item['data']->get_id() ) !== $offer_product_id ) {
					continue;
				}
				// Added from the shop: don't offer it.
				if ( ! self::is_bump_cart_item( $cart_item ) ) {
					continue 2;
				}
				$checked = 'checked';
			}

			$offer_price   = self::calculate_offer_price( $bump['offer_type'], self::get_current_price( $product ), $bump['offer_amount'] );
			$regular_price = self::get_regular_price( $product );
			$offer_display = self::get_display_price( $product, $offer_price );
			$design        = OrderBumpDesign::sanitize( array_merge( OrderBumpDesign::get_defaults(), $bump['design_settings'] ) );
			$is_variation  = $product->is_type( 'variation' );

			$offers[] = [
				'bump'                  => $bump,
				'product'               => $product,
				// The ids the storefront sends back: a variation as its parent plus its own id.
				'cart_product_id'       => $is_variation ? $product->get_parent_id() : $product->get_id(),
				'variation_id'          => $is_variation ? $product->get_id() : 0,
				'design'                => $design,
				'regular_price'         => $regular_price,
				'offer_price'           => $offer_price,
				'regular_price_display' => self::get_display_price( $product, $regular_price ),
				'offer_price_display'   => $offer_display,
				// A fixed price reads as displayed.
				'offer_label'           => self::get_offer_label( $bump['offer_type'], 'price' === $bump['offer_type'] ? $offer_display : $bump['offer_amount'], $design ),
				'checked'               => $checked,
				// In stock or on backorder.
				'is_purchasable'        => $product->is_in_stock() || $product->backorders_allowed(),
			];
		}

		return $offers;
	}

	/**
	 * Whether a cart line is an order bump's (added through the checkout
	 * box, at the bump's price), not the shopper's own.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array $cart_item Cart item.
	 *
	 * @return bool
	 */
	public static function is_bump_cart_item( $cart_item ) {
		return ! empty( $cart_item['_spsg_order_bump_product'] ) || isset( $cart_item['custom_price'] );
	}

	/**
	 * A price of the product as the cart shows it: with or without tax, as
	 * the store's "Display prices during cart and checkout" says.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param WC_Product $product Product.
	 * @param float      $price   Price as entered.
	 *
	 * @return float
	 */
	public static function get_display_price( $product, $price ) {
		return (float) wc_get_price_to_display(
			$product,
			[
				'price'           => $price,
				'display_context' => 'cart',
			]
		);
	}

	/**
	 * The offer strip's text: "Free", the percentage with the discount title
	 * ("10% off only for you!"), or the price with the fixed price title
	 * ("2.00$ Just Only"; it used to read "2.00.00"). Numbers in the store's
	 * format; the titles carry any currency symbol, so none is added.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param string $offer_type   `discount`, `price` or `free`.
	 * @param float  $offer_amount The bump's amount.
	 * @param array  $design       The bump's design settings.
	 *
	 * @return string Plain text.
	 */
	public static function get_offer_label( $offer_type, $offer_amount, $design ) {
		if ( 'free' === $offer_type ) {
			return __( 'Free', 'storegrowth-sales-booster' );
		}

		if ( 'discount' === $offer_type ) {
			return wc_format_localized_decimal( wc_format_decimal( $offer_amount, false, true ) ) . ( $design['offer_discount_title'] ?? '' );
		}

		return number_format( (float) $offer_amount, wc_get_price_decimals(), wc_get_price_decimal_separator(), wc_get_price_thousand_separator() ) . ( $design['offer_fixed_price_title'] ?? '' );
	}


	/**
	 * What the cart holds, as bumps target it: the product ids (a variation's
	 * parent and its own id) and the category ids (a variation's and its
	 * parent's). One list for the checkout box, the add-to-cart price check
	 * and the attribution stamp, so they agree on which bumps apply.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return array{0: int[], 1: int[]} Product ids, category ids.
	 */
	public static function get_cart_targets() {
		$product_ids  = [];
		$category_ids = [];

		if ( ! function_exists( 'WC' ) || ! WC()->cart ) {
			return [ $product_ids, $category_ids ];
		}

		foreach ( WC()->cart->get_cart() as $cart_item ) {
			$product_ids[] = (int) $cart_item['product_id'];

			if ( $cart_item['data'] instanceof WC_Product ) {
				$category_ids = array_merge( $category_ids, array_map( 'intval', $cart_item['data']->get_category_ids() ) );
			}

			if ( ! empty( $cart_item['variation_id'] ) ) {
				$product_ids[] = (int) $cart_item['variation_id'];

				$parent = wc_get_product( $cart_item['product_id'] );
				if ( $parent ) {
					$category_ids = array_merge( $category_ids, array_map( 'intval', $parent->get_category_ids() ) );
				}
			}
		}

		return [ array_values( array_unique( $product_ids ) ), array_values( array_unique( $category_ids ) ) ];
	}

	/**
	 * The price a bump's discount applies to: the product's active price (the
	 * sale price while a sale runs), as BOGO's offer price. It used the sale
	 * price even while a scheduled sale hadn't started.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param WC_Product $product Offer product (the variation for a variation offer).
	 *
	 * @return float
	 */
	public static function get_current_price( $product ) {
		return (float) $product->get_price();
	}

	/**
	 * The price the checkout strikes through: the regular price, else the
	 * active one.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param WC_Product $product Offer product.
	 *
	 * @return float
	 */
	public static function get_regular_price( $product ) {
		return (float) ( '' !== (string) $product->get_regular_price() ? $product->get_regular_price() : $product->get_price() );
	}

	/**
	 * A bump's price for its offer product: a percentage off (0–100), a
	 * fixed price (at least 0) or free.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param string $offer_type    `discount`, `price` or `free`.
	 * @param float  $current_price The product's price (`get_current_price()`).
	 * @param float  $offer_amount  The bump's amount.
	 *
	 * @return float
	 */
	public static function calculate_offer_price( $offer_type, $current_price, $offer_amount ) {
		$current_price = (float) $current_price;
		$offer_amount  = (float) $offer_amount;

		if ( 'free' === $offer_type ) {
			return 0.0;
		}

		if ( 'discount' === $offer_type ) {
			$percent = min( 100.0, max( 0.0, $offer_amount ) );

			return max( 0.0, $current_price - ( $current_price * $percent / 100 ) );
		}

		return max( 0.0, $offer_amount );
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
