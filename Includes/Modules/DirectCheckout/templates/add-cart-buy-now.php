<?php
/**
 * Template for direct checkout Buy Now Button.
 *
 * @package SBFW
 */

global $product;
if ( $product ) {
	$defaults = array(
		'quantity'   => 1,
		'class'      => implode(
			' ',
			array_filter(
				array(
					'button',
					wc_wp_theme_get_element_class_name( 'button' ), // escaped in the template.
					'product_type_' . $product->get_type(),
					$product->is_purchasable() && $product->is_in_stock() ? 'add_to_cart_button' : '',
					$product->supports( 'ajax_add_to_cart' ) && $product->is_purchasable() && $product->is_in_stock() ? 'ajax_add_to_cart' : '',
				)
			)
		),
		'attributes' => array(
			'data-product_id'  => $product->get_id(),
			'data-product_sku' => $product->get_sku(),
			'aria-label'       => $product->add_to_cart_description(),
			'aria-describedby' => $product->add_to_cart_aria_describedby(),
			'rel'              => 'nofollow',
		),
	);

	$args = apply_filters( 'woocommerce_loop_add_to_cart_args', wp_parse_args( $args, $defaults ), $product );

	if ( ! empty( $args['attributes']['aria-describedby'] ) ) {
		$args['attributes']['aria-describedby'] = wp_strip_all_tags( $args['attributes']['aria-describedby'] );
	}

	if ( isset( $args['attributes']['aria-label'] ) ) {
		$args['attributes']['aria-label'] = wp_strip_all_tags( $args['attributes']['aria-label'] );
	}
	include __DIR__ . '/loop/buy-to-cart.php';

}
