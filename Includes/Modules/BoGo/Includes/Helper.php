<?php
/**
 * Helper functions for BOGO module.
 *
 * @package SBFW
 */

namespace STOREGROWTH\SPSB\Modules\BoGo\Includes;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class Helper.
 */
class Helper {

	/**
	 * Check product BOGO offer is need to load.
	 *
	 * @since 1.0.2
	 *
	 * @param int $product_id Product post ID.
	 *
	 * @return bool
	 */
	public static function sgsb_is_load_product_bogo_offer( $product_id ) {
		$offers                              = self::sgsb_get_global_offered_product_list();
		$product                             = wc_get_product( $product_id );
		$offer_applied_ids                   = wp_list_pluck( $offers, 'offered_products' );
		$is_variable_product                 = $product->is_type( 'variable' );
		$offer_available_for_current_product = in_array( $product_id, $offer_applied_ids );

		// BOGO settings will be available for simple product &
		return apply_filters(
			'sgsb_load_product_bogo_offer',
			! ( $is_variable_product || ( count( $offers ) >= 2 && ! $offer_available_for_current_product ) )
		);
	}

	/**
	 * Get BOGO offer applied product ids for global settings.
	 *
	 * @since 1.0.2
	 *
	 * @return array
	 */
	public static function sgsb_get_global_offer_applied_product_ids() {
		$offers = self::sgsb_get_global_offered_product_list();
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
	public static function sgsb_get_product_bogo_settings( $product_id ) {
		$bogo_settings = get_post_meta( $product_id, 'sgsb_product_bogo_settings', true );
		return $bogo_settings;
	}

	/**
	 * Get BOGO offered posts.
	 *
	 * @since 1.0.2
	 *
	 * @return \WP_POST[]|int[]
	 */
	public static function sgsb_get_global_offered_products() {
		$args_bogo = array(
			'post_type'      => 'sgsb_bogo',
			'posts_per_page' => -1,
		);

		return get_posts( $args_bogo );
	}

	/**
	 * Get offered BOGO lists.
	 *
	 * @since 1.0.2
	 *
	 * @return array
	 */
	public static function sgsb_get_global_offered_product_list() {
		$bogo_list = self::sgsb_get_global_offered_products();
		$offers    = wp_list_pluck( $bogo_list, 'post_excerpt' );

		// Convert the serialized data into an array
		return array_map( 'maybe_unserialize', $offers );
	}


	/**
	 * Get the option value of BOGO settings field.
	 *
	 * @since 1.0.2
	 *
	 * @param string $option  settings field name
	 * @param string $default default text if it's not found
	 *
	 * @return mixed
	 */
	public static function sgsb_get_bogo_settings_option( $option, $default = '' ) {
		$options = get_option( 'sgsb_bogo_general_settings', array() );

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
     * @param int $product_id
     *
     * @return array|mixed|void
     */
    public static function sgsb_get_product_bogo_settings_for_cart( $product_id ) {
        $product_settings = Helper::sgsb_get_product_bogo_settings( $product_id );
        if ( isset( $product_settings['bogo_status'] ) && $product_settings['bogo_status'] === 'yes' ) {
            return $product_settings;
        }

        $offers = self::sgsb_get_global_offered_product_list();
        foreach ( $offers as $offer ) {
            if ( intval( $offer['offered_products'] ) === $product_id ) {
                return $offer;
            }
        }
    }

    /**
     * Get offer product id for BOGO apply.
     *
     * @since 1.0.2
     *
     * @param array $settings
     * @param int   $product_id
     *
     * @return int|mixed|null
     */
    public static function sgsb_get_offer_product_id( $settings, $product_id ) {
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
            'sgsb_bogo_offer_product_id_for_cart',
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
     * @param int $product_id
     * @param int $item_id
     *
     * @return int|mixed|null
     */
    public static function sgsb_get_alternate_offer_products( $product_id, $item_id ) {
        $variation_id    = 0;
        $current_product = wc_get_product( $item_id );

        if ( $current_product->is_type( 'variable' ) ) {
            $variation_id = $item_id;
        }

        $bogo_settings = Helper::sgsb_get_product_bogo_settings_for_cart( $product_id );
        $bogo_settings = apply_filters( 'sgsb_get_bogo_settings_for_cart', $bogo_settings, $product_id, $variation_id );

        // Fetch full product details.
        $product_ids     = ! empty( $bogo_settings['get_alternate_products'] ) ? $bogo_settings['get_alternate_products'] : array();
        $product_objects = ! empty( $product_ids ) ? array_map( 'wc_get_product', $product_ids ) : array();

        return apply_filters( 'sgsb_bogo_offer_products_for_item', $product_objects, $bogo_settings, $item_id );
    }

    public static function sgsb_prepare_bogo_settings( $apply_able_product_id, $product_id, $variation_id ) {
        // Prepare settings for BOGO apply.
        return apply_filters(
            'sgsb_get_bogo_settings_for_cart',
            Helper::sgsb_get_product_bogo_settings_for_cart( $apply_able_product_id ),
            $product_id,
            $variation_id
        );
    }
}
