<?php
/**
 * Helper funcitons for stock countdown module.
 *
 * @package SBFW
 */

/**
 * Check product is discount-able.
 *
 * @param int $product_id Product post ID.
 */
function sgsb_stock_bar_is_product_discountable( $product_id ) {
	$discount_amount = get_post_meta( $product_id, '_sgsb_stock_bar_discount_amount', true );
	$start_date      = get_post_meta( $product_id, '_sgsb_stock_bar_discount_start', true );
	$end_date        = get_post_meta( $product_id, '_sgsb_stock_bar_discount_end', true );

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
