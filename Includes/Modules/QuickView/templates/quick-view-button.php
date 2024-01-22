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
$buy_now_button_label = sgsb_find_option_setting( $settings, 'quick_view_button_label', 'Quick View' );
$button_effect        = sgsb_find_option_setting( $settings, 'effect', 'mfp-3d-unfold' );
$product_page         = is_product() ? '_product_page' : '';
	$classes          = implode(
		' ',
		array_filter(
			array(
				'button',
				' woosq-btn-' . $product_id,
				'woosq-btn' . $product_page,
			)
		)
	);

	?>

<a href="#" data-id="<?php echo absint( $product_id ); ?>" data-context="default" data-effect="<?php echo esc_attr( $button_effect ); ?>" class="<?php echo esc_attr( $classes ); ?>" rel="nofollow">
	<?php echo esc_html( sprintf( '%1$s', $buy_now_button_label ) ); ?>
</a>
