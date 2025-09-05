<?php
/**
 * Template for direct checkout Buy Now Button.
 *
 * @package SBFW
 */

global $product;
$product_id           = $product->get_ID();
$product_type         = $product->get_type();
$settings             = \StorePulse\StoreGrowth\Helper::get_settings( 'spsg_direct_checkout_settings' );
$buy_now_button_label = \StorePulse\StoreGrowth\Helper::find_option_settings( $settings, 'buy_now_button_label', 'Buy Now' );
$product_page         = is_product() ? '_product_page' : '';
$stock_class_name     = $product->is_in_stock() ? ' ' : 'spsg_buy_now_button_disabled';
	$classes          = implode(
		' ',
		array_filter(
			array(
				'button',
				'product_type_' . $product_type,
				'spsg_buy_now_button' . $product_page,
                $stock_class_name,
			)
		)
	);

	?>

<a href="<?php echo esc_url( wc_get_checkout_url() ); ?>" data-id="<?php echo absint( $product_id ); ?>" class="<?php echo esc_attr( $classes ); ?>" rel="nofollow">
	<?php echo esc_html( sprintf( '%1$s', $buy_now_button_label ) ); ?>
</a>
