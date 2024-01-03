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
	// **
	// * Get offered BOGO lists.
	// *
	// * @since 1.0.2
	// *
	// * @return array
	// */
	// public static function sgsb_get_global_offer_applied_product_ids() {
	// $bogo_list = self::sgsb_get_global_offered_products();
	// $offers    = wp_list_pluck( $bogo_list, 'post_excerpt' );
	//
	// Convert the serialized data into an array
	// return array_map( 'maybe_unserialize', $offers );
	// }
}
