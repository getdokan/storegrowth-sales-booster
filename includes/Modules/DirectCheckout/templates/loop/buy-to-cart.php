<?php
/**
 * Loop Add to Cart
 *
 * This template can be overridden by copying it to yourtheme/woocommerce/loop/add-to-cart.php.
 *
 * HOWEVER, on occasion WooCommerce will need to update template files and you
 * (the theme developer) will need to copy the new files to your theme to
 * maintain compatibility. We try to do this as little as possible, but it does
 * happen. When this occurs the version of the template file will be bumped and
 * the readme will list any important changes.
 *
 * @see         https://docs.woocommerce.com/document/template-structure/
 * @package     WooCommerce\Templates
 * @version     3.3.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

global $product;
$product_id               = $product->get_ID();
$product_type             = $product->get_type();
$add_to_cart_text         = $product->add_to_cart_text();
$is_in_stock              = $product->is_in_stock();
$permalink                = get_permalink( $product_id );
$settings                 = get_option( 'sgsb_direct_checkout_settings' );
$class                    = 'simple' === $product_type ? 'button product_type_simple sgsb_buy_now_button' : $args['class'];
$buy_now_button_label     = $is_in_stock ? sgsb_find_option_setting( $settings, 'buy_now_button_label', 'Buy Now' ) : 'Read More';
$product_checkout_url     = esc_url( $is_in_stock ? wc_get_checkout_url() : $permalink );
$product_quantity         = esc_attr( isset( $args['quantity'] ) ? $args['quantity'] : 1 );
$product_class            = esc_attr( isset( $args['class'] ) ? $class : 'button' );
$product_attributes       = isset( $args['attributes'] ) ? wc_implode_html_attributes( $args['attributes'] ) : '';
$product_add_to_cart_text = esc_html( 'simple' === $product_type ? $buy_now_button_label : $add_to_cart_text );


if ( ! $product->is_in_stock() && is_product() && 'single-product/add-to-cart/simple.php' === $template_name ) {
	$html_output = '<p class="stock out-of-stock">Out Of Stock</p>';
} else {
	$html_output = '<a href="' . $product_checkout_url . '" data-quantity="' . $product_quantity . '" class="' . $product_class . '" ' . $product_attributes . '>' . $product_add_to_cart_text . '</a>';
}


// Output the HTML.
echo wp_kses_post( $html_output );
