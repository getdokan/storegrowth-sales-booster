<?php
/**
 * Template for direct checkout Buy Now Button.
 *
 * @package SBFW
 */

global $product;
$product_id            = $product->get_ID();
$product_type          = $product->get_type();
$settings              = get_option( 'sgsb_quick_view_settings' );
$button_label          = sgsb_find_option_setting( $settings, 'button_label', 'Quick View' );
$modal_effect          = sgsb_find_option_setting( $settings, 'modal_animation_effect', 'mfp-3d-unfold' );
$quick_view_icon_color = sgsb_find_option_setting( $settings, 'button_text_color', '#ffffff' );
$is_icon_active        = sgsb_find_option_setting( $settings, 'enable_qucik_view_icon', false );
// $product_page          = is_product() ? '_product_page' : '';
	$classes = implode(
		' ',
		array_filter(
			array(
				'button',
				' sgsbqcv-btn-' . $product_id,
				'sgsbqcv-btn',
			)
		)
	);

	?>

<a href="#" data-id="<?php echo absint( $product_id ); ?>" data-context="default" data-effect="<?php echo esc_attr( $modal_effect ); ?>" class="<?php echo esc_attr( $classes ); ?>" rel="nofollow">
<?php
if ( $is_icon_active && SGSB_PRO_ACTIVE ) {
	do_action( 'sgsb_quick_view_icon_button', $quick_view_icon_color );
} else {
	echo esc_html( sprintf( '%1$s', $button_label ) );
}
?>
</a>
