<?php
/**
 * Template for direct checkout Buy Now Button.
 *
 * @package SBFW
 */

global $product;
$product_id           = $product->get_ID();
$settings             = get_option( 'sgsb_direct_checkout_settings' );
$buy_now_button_label = sgsb_find_option_setting( $settings, 'buy_now_button_label', 'Buy Now' );

	$classes = implode(
		' ',
		array_filter(
			array(
				'button',
				'product_type_' . $product->get_type(),
				'sgsb_buy_now_button',
			)
		)
	);
	?>

<a href="<?php echo esc_url( wc_get_checkout_url() ); ?>?add-to-cart=<?php echo absint( $product_id ); ?>" class="<?php echo esc_attr( $classes ); ?>" rel="nofollow">
	<?php echo esc_html( sprintf( '%1$s', $buy_now_button_label ) ); ?>
</a>