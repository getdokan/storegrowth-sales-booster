<?php
/**
 * Template for direct checkout Buy Now Button.
 *
 * @package SBFW
 */

global $product;
$product_id   = $product->get_ID();
$product_type = $product->get_type();
$settings     = get_option( 'sgsb_quick_view_settings' );
$button_label = sgsb_find_option_setting( $settings, 'button_label', 'Quick View' );
$modal_effect = sgsb_find_option_setting( $settings, 'effect', 'mfp-3d-unfold' );
$product_page = is_product() ? '_product_page' : '';
	$classes  = implode(
		' ',
		array_filter(
			array(
				'button',
				' sgsbqcv-btn-' . $product_id,
				'sgsbqcv-btn' . $product_page,
			)
		)
	);

	?>

<a href="#" data-id="<?php echo absint( $product_id ); ?>" data-context="default" data-effect="<?php echo esc_attr( $modal_effect ); ?>" class="<?php echo esc_attr( $classes ); ?>" rel="nofollow">
	<?php echo esc_html( sprintf( '%1$s', $button_label ) ); ?>
</a>
