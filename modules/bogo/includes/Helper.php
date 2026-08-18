<?php
/**
 * Helper functions for BOGO module.
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Modules\BoGo;

use StorePulse\StoreGrowth\Attribution\OfferAttribution;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class Helper.
 */
class Helper {

	/**
	 * Check if product BOGO offer should be loaded.
	 *
	 * @since 1.0.2
	 *
	 * @param int $product_id Product post ID.
	 *
	 * @return bool
	 */
	public static function is_load_product_bogo_offer( $product_id ) {
		$offers                              = self::get_global_offered_product_list();
		$product                             = wc_get_product( $product_id );
		$offer_applied_ids                   = wp_list_pluck( $offers, 'offered_products' );
		$is_variable_product                 = $product->is_type( 'variable' );
		$offer_available_for_current_product = in_array( $product_id, $offer_applied_ids );
		// BOGO settings will be available for simple product &
		return apply_filters(
			'spsg_load_product_bogo_offer',
			! ( $is_variable_product || ( count( $offers ) >= 2 && ! $offer_available_for_current_product ) )
		);
	}

	/**
	 * Get BOGO offer applied product IDs for global settings.
	 *
	 * @since 1.0.2
	 *
	 * @return array
	 */
	public static function get_global_offer_applied_product_ids() {
		$offers = self::get_global_offered_product_list();
		return wp_list_pluck( $offers, 'offered_products' );
	}

	/**
	 * Get product BOGO settings data.
	 *
	 * @since 1.0.2
	 *
	 * @param int $product_id Product post ID.
	 *
	 * @return array|null
	 */
	public static function get_product_bogo_settings( $product_id, $variation_id = 0, array $query_args = [] ) {
		return \StorePulse\StoreGrowth\Modules\BoGo\BogoDataManager::get_product_bogo_settings( $product_id, $variation_id, $query_args );
	}

	/**
	 * Get BOGO offered posts.
	 *
	 * @since 1.0.2
	 *
	 * @return \WP_POST[]|int[]
	 */
	public static function get_global_offered_products() {
		return \StorePulse\StoreGrowth\Modules\BoGo\BogoDataManager::get_global_bogo_offers();
	}

	/**
	 * Get offered BOGO lists.
	 *
	 * @since 1.0.2
	 *
	 * @return array
	 */
	public static function get_global_offered_product_list() {
		return \StorePulse\StoreGrowth\Modules\BoGo\BogoDataManager::get_global_offered_product_list();
	}


	/**
	 * Get the option value of BOGO settings field.
	 *
	 * @since 1.0.2
	 *
	 * @param string $option  Settings field name.
	 * @param string $default Default text if it's not found.
	 *
	 * @return mixed
	 */
	public static function get_bogo_settings_option( $option, $default = '' ) {
		$options = \StorePulse\StoreGrowth\Helper::get_settings( 'spsg_bogo_general_settings', array() );

		if ( isset( $options[ $option ] ) ) {
			return $options[ $option ];
		}

		return $default;
	}

	/**
	 * Calculate the offer price based on the offer type.
	 *
	 * @since 1.0.2
	 *
	 * @param string $offer_type     The type of offer ('discount', for example).
	 * @param float  $regular_price  The regular price of the product.
	 * @param float  $discount_amount  The discount amount (in percentage).
	 *
	 * @return float  The calculated offer price.
	 */
	public static function calculate_offer_price( $offer_type, $regular_price, $discount_amount ) {
		// WC_Product::get_price() returns '' for unpriced products; cast to
		// avoid a TypeError on string arithmetic (PHP 8+).
		$regular_price   = (float) $regular_price;
		$discount_amount = (float) $discount_amount;

		if ( 'discount' === $offer_type ) {
			$offer_price = ( $regular_price - ( $regular_price * $discount_amount / 100 ) );
		} else {
			$offer_price = 0;
		}
		return $offer_price;
	}

    /**
     * Get BOGO settings for cart.
     *
     * @since 1.0.2
     *
     * @param int $product_id Product ID.
     *
     * @return array|mixed|void
     */
    public static function get_product_bogo_settings_for_cart( $product_id ) {
        $product_settings = Helper::get_product_bogo_settings( $product_id );
        if ( isset( $product_settings['status'] ) && $product_settings['status'] === 'active' ) {
            return $product_settings;
        }

        $offers = self::get_global_offered_product_list();
        foreach ( $offers as $offer ) {
            $offered_products = $offer['offered_products'] ?? array();
            
            // Handle both array and string formats for backward compatibility
            if ( is_array( $offered_products ) ) {
                if ( in_array( $product_id, $offered_products ) ) {
                    return $offer;
                }
            } else {
                // Backward compatibility for string format
                if ( intval( $offered_products ) === $product_id ) {
                    return $offer;
                }
            }
        }
        
        return null;
    }

    /**
     * Get offer product ID for BOGO apply.
     *
     * @since 1.0.2
     *
     * @param array $settings   BOGO settings.
     * @param int   $product_id Product ID.
     *
     * @return int|mixed|null
     */
    	public static function get_offer_product_id( $settings, $product_id ) {
		$deal_type = isset( $settings['bogo_deal_type'] ) ? esc_html( $settings['bogo_deal_type'] ) : 'different';

		// Return same product as offer for same deal.
		if ( $deal_type === 'same' ) {
			return $product_id;
		}

		// Return buy y product for different deal.
		if ( ! empty( $settings['get_different_product_field'] ) ) {
			return intval( $settings['get_different_product_field'] );
		}

		// Return alternate first product as offer for buy y product.
		$alternate_products = ! empty( $settings['get_alternate_products'] ) ? $settings['get_alternate_products'] : array();
		return apply_filters(
			'spsg_bogo_offer_product_id_for_cart',
			! empty( $alternate_products[0] ) ? intval( $alternate_products[0] ) : 0,
			$settings,
			$product_id
		);
	}

    /**
     * Get alternate offer products for BOGO apply.
     *
     * @since 1.0.2
     *
     * @param int $product_id Product ID.
     * @param int $item_id    Item ID.
     *
     * @return int|mixed|null
     */
    public static function get_alternate_offer_products( $product_id, $item_id ) {
        $variation_id    = 0;
        $current_product = wc_get_product( $item_id );

        if ( $current_product->is_type( 'variable' ) ) {
            $variation_id = $item_id;
        }

        $bogo_settings = Helper::get_product_bogo_settings_for_cart( $product_id );
        $bogo_settings = apply_filters( 'spsg_get_bogo_settings_for_cart', $bogo_settings, $product_id, $variation_id );

        // Fetch full product details.
        $product_ids     = ! empty( $bogo_settings['get_alternate_products'] ) ? $bogo_settings['get_alternate_products'] : array();
        $product_objects = ! empty( $product_ids ) ? array_map( 'wc_get_product', $product_ids ) : array();

        return apply_filters( 'spsg_bogo_offer_products_for_item', $product_objects, $bogo_settings, $item_id );
    }

    /**
     * Prepare BOGO settings for application.
     *
     * @since 1.0.2
     *
     * @param int $apply_able_product_id Applicable product ID.
     * @param int $product_id            Product ID.
     * @param int $variation_id          Variation ID.
     *
     * @return mixed
     */
    public static function prepare_bogo_settings( $apply_able_product_id, $product_id, $variation_id ) {
        // Prepare settings for BOGO apply.
        return apply_filters(
            'spsg_get_bogo_settings_for_cart',
            Helper::get_product_bogo_settings_for_cart( $apply_able_product_id ),
            $product_id,
            $variation_id
        );
    }

	public static function get_design_value( $bogo_info, $property ) {
	    if ( isset( $bogo_info->design_settings ) && is_string( $bogo_info->design_settings ) ) {
	        $design_data = json_decode( $bogo_info->design_settings, true );
	        return $design_data[ $property ] ?? '';
	    }
	    return '';
	}

	/**
	 * Build the campaign attribution stamp for a BOGO offer.
	 *
	 * Produces the underscore-prefixed campaign keys to merge into a cart
	 * item's data. Returns an empty array when the offer carries no stable
	 * database id, so the caller adds nothing rather than a broken stamp.
	 *
	 * @since 2.2.0
	 *
	 * @param array       $settings      BOGO offer settings (expects 'id').
	 * @param \WC_Product $price_product Product used for price calculation (gift or variation).
	 *
	 * @return array<string, string>
	 */
	public static function build_offer_stamp( $settings, $price_product ) {
		$offer_id = isset( $settings['id'] ) ? (int) $settings['id'] : 0;

		if ( ! $offer_id || ! $price_product instanceof \WC_Product ) {
			return array();
		}

		$reward_type = ( isset( $settings['offer_type'] ) && 'discount' === $settings['offer_type'] ) ? 'discount' : 'free';
		$base_price  = (float) $price_product->get_price();

		// Per-unit discount contributed: the whole price when free, else the percentage off.
		$discount_value = $base_price;
		if ( 'discount' === $reward_type ) {
			$discount_percent = isset( $settings['discount_amount'] ) ? (float) $settings['discount_amount'] : 0;
			$discount_value   = $base_price * ( $discount_percent / 100 );
		}

		return OfferAttribution::stamp( 'bogo', $offer_id, $reward_type, $discount_value );
	}

	/**
	 * Resolve the BOGO offer that produced a gift product now in the cart.
	 *
	 * Scans the cart's trigger products and returns the settings of the first
	 * offer whose reward is the requested gift, so the campaign can be
	 * identified server-side without trusting client-supplied ids.
	 *
	 * @since 2.2.0
	 *
	 * @param int $gift_product_id Gift product id added to the cart.
	 *
	 * @return array|null Offer settings, or null when no trigger offers this gift.
	 */
	public static function resolve_bogo_settings_for_gift( $gift_product_id ) {
		$gift_product_id = (int) $gift_product_id;

		if ( ! $gift_product_id || is_null( WC()->cart ) ) {
			return null;
		}

		$gift_parent_id = (int) wp_get_post_parent_id( $gift_product_id );

		foreach ( WC()->cart->get_cart() as $cart_item ) {
			// Only inspect trigger products, never the injected gift lines.
			if ( ! empty( $cart_item['bogo_offer'] ) ) {
				continue;
			}

			$trigger_id = isset( $cart_item['product_id'] ) ? (int) $cart_item['product_id'] : 0;
			if ( ! $trigger_id ) {
				continue;
			}

			$settings = self::get_product_bogo_settings_for_cart( $trigger_id );
			if ( empty( $settings ) ) {
				continue;
			}

			$offer_product_id = (int) self::get_offer_product_id( $settings, $trigger_id );
			if ( $offer_product_id === $gift_product_id || ( $gift_parent_id && $offer_product_id === $gift_parent_id ) ) {
				return $settings;
			}
		}

		return null;
	}
}
