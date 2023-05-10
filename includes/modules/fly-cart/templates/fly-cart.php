<?php
/**
 * Template to show fly cart icon.
 *
 * @var $icon_position string
 * @var $icon_name string
 *
 * @package SBFW
 */

$settings   = get_option( 'spsb_fly_cart_settings' );
$layout     = spsb_find_option_setting( $settings, 'layout', 'side' );
$class_name = 'center' === $layout ? 'spsb-fast-cart-center-layout' : '';
?>
<div class="wfc-cart-icon <?php echo esc_attr( $icon_position ); ?>">
	<span class="wfc-open-btn wfc-icon <?php echo esc_attr( $icon_name ); ?>">
		<span class="wfc-cart-countlocation">
			<?php echo esc_html( wc()->cart->get_cart_contents_count() ); ?>
		</span>
	</span>
</div>

<div class="wfc-overlay wfc-hide"></div>
<div class="wfc-widget-sidebar wfc-slide <?php echo esc_attr( $class_name ); ?>">
	<h3 class="wfc-cart-heading">
		<?php esc_html_e( 'Shopping Cart', 'spsb' ); ?>
		<span class="wfc-close-btn spsb-cart-widget-close" title="Close">×</span>
	</h3>
	<div class="spsb-widget-shopping-cart-content-wrapper">
		<div class="spsb-widget-shopping-cart-content"></div>
		<div class="spsb-page-loader spsb-fly-cart-loader">
			<div class="spsb-page-loader-ring"></div>
		</div>
	</div>
</div>
