<?php
/**
 * Template for direct checkout Buy Now Button.
 *
 * @package SBFW
 */

global $product;
$product_id            = $product->get_ID();
$product_type          = $product->get_type();
$settings              = \StorePulse\StoreGrowth\Helper::get_settings( 'spsg_quick_view_settings' );
$button_label          = \StorePulse\StoreGrowth\Helper::find_option_settings( $settings, 'button_label', 'Quick View' );
$modal_effect          = \StorePulse\StoreGrowth\Helper::find_option_settings( $settings, 'modal_animation_effect', 'mfp-3d-unfold' );
$quick_view_icon_color = \StorePulse\StoreGrowth\Helper::find_option_settings( $settings, 'button_text_color', '#ffffff' );
$is_icon_active        = \StorePulse\StoreGrowth\Helper::find_option_settings( $settings, 'enable_qucik_view_icon', false );
// $product_page          = is_product() ? '_product_page' : '';
	$classes = implode(
		' ',
		array_filter(
			array(
				'button',
				' spsgqcv-btn-' . $product_id,
				'spsgqcv-btn',
			)
		)
	);

	?>

<a href="#" data-id="<?php echo absint( $product_id ); ?>" data-context="default" data-effect="<?php echo esc_attr( $modal_effect ); ?>" class="<?php echo esc_attr( $classes ); ?>" rel="nofollow">
<?php
if ( $is_icon_active && sp_store_growth()->has_pro() ) {
	do_action( 'spsg_quick_view_icon_button', $quick_view_icon_color );
} else {
	echo esc_html( sprintf( '%1$s', $button_label ) );
}
?>
</a>
