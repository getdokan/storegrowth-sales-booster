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
        $product             = wc_get_product( $product_id );
        $is_variable_product = $product->is_type( 'variable' );

        return apply_filters( 'sgsb_load_product_bogo_offer', !$is_variable_product );
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
}
