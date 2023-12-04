<?php
/**
 * Helper functions for countdown timer module.
 *
 * @package SBFW
 */

namespace STOREGROWTH\SPSB\Modules\CountdownTimer\Includes;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Class Helper.
 */
class Helper {

    /**
     * Check product is discount-able.
     *
     * @since 1.0.2
     *
     * @param int $product_id Product post ID.
     *
     * @return bool
     */
    public static function sgsb_stock_cd_is_product_discountable( $product_id ) {
        $discount_amount = get_post_meta( $product_id, '_sgsb_countdown_timer_discount_amount', true );
        $start_date      = get_post_meta( $product_id, '_sgsb_countdown_timer_discount_start', true );
        $end_date        = get_post_meta( $product_id, '_sgsb_countdown_timer_discount_end', true );

        // If data is not set.
        if ( ! $discount_amount || ! $end_date ) {
            return false;
        }

        // Check start date is later.
        if ( strtotime( $start_date ) > time() ) {
            return false;
        }

        // Check end date has passed.
        if ( strtotime( $end_date ) < time() ) {
            return false;
        }

        return true;
    }
}
