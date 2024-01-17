<?php
/**
 * Template for direct checkout Buy Now Button.
 *
 * @package SBFW
 */

global $product;
$product_id           = $product->get_ID();
$product_type         = $product->get_type();
$settings             = get_option( 'sgsb_quick_view_settings' );
$buy_now_button_label = sgsb_find_option_setting( $settings, 'buy_now_button_label', 'Quick View' );
$product_page         = is_product() ? '_product_page' : '';
	$classes          = implode(
		' ',
		array_filter(
			array(
				'button',
				'product_type_' . $product_type,
				'sgsb_quick_view_button' . $product_page,
			)
		)
	);

	?>

<a href="#" data-id="<?php echo absint( $product_id ); ?>" class="<?php echo esc_attr( $classes ); ?>" rel="nofollow">
	<?php echo esc_html( sprintf( '%1$s', $buy_now_button_label ) ); ?>
</a>
