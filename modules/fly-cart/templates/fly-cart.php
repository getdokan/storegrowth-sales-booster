<?php
/**
 * Template to show fly cart icon.
 *
 * @var $icon_position string
 * @var $icon_name string
 *
 * @package SBFW
 */

use StorePulse\StoreGrowth\Helper;

$settings   = Helper::get_settings( 'spsg_fly_cart_settings' );
$layout     = Helper::find_option_settings( $settings, 'layout', 'side' );
$class_name = 'center' === $layout ? 'spsg-quick-cart-center-layout' : '';

// Printed into attributes: constrained to CSS colour characters (ADR-005).
$cart_icon_color      = Helper::sanitize_css_color( Helper::find_option_settings( $settings, 'icon_color', '#FFF' ), '#FFF' );
$action_btn_active_bg = Helper::sanitize_css_color( Helper::find_option_settings( $settings, 'buttons_bg_color', '#0875FF' ), '#0875FF' );

// The stored icon slugs as lucide icons (spec §9): cart, basket, package,
// briefcase and, the default, shopping bag.
$cart_icon_paths = [
	'shopping-cart-icon-1' => '<circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>',
	'shopping-cart-icon-2' => '<path d="m15 11-1 9"/><path d="m19 11-4-7"/><path d="M2 11h20"/><path d="m3.5 11 1.6 7.4a2 2 0 0 0 2 1.6h9.8a2 2 0 0 0 2-1.6l1.7-7.4"/><path d="M4.5 15.5h15"/><path d="m5 11 4-7"/><path d="m9 11 1 9"/>',
	'shopping-cart-icon-3' => '<path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/><path d="M12 22V12"/><polyline points="3.29 7 12 12 20.71 7"/><path d="m7.5 4.27 9 5.15"/>',
	'shopping-cart-icon-4' => '<path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/>',
	'shopping-cart-icon-5' => '<path d="M16 10a4 4 0 0 1-8 0"/><path d="M3.103 6.034h17.794"/><path d="M3.4 5.467a2 2 0 0 0-.4 1.2V20a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6.667a2 2 0 0 0-.4-1.2l-2-2.667A2 2 0 0 0 17 2H7a2 2 0 0 0-1.6.8z"/>',
];
$cart_icon_path  = $cart_icon_paths[ $icon_name ] ?? $cart_icon_paths['shopping-cart-icon-5'];
?>
<div class="wfc-cart-icon <?php echo esc_attr( $icon_position ); ?>">
	<span class="wfc-open-btn wfc-icon <?php echo esc_attr( $icon_name ); ?>">
		<svg class="radio-icon spsg-cart-icon" viewBox="0 0 24 24" fill="none" stroke="<?php echo esc_attr( $cart_icon_color ); ?>" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"
			style="border-radius: 10px; background: <?php echo esc_attr( $action_btn_active_bg ); ?>;">
			<?php
			echo wp_kses(
				$cart_icon_path,
				[
					'path'     => [ 'd' => true ],
					'circle'   => [
						'cx' => true,
						'cy' => true,
						'r'  => true,
					],
					'rect'     => [
						'width'  => true,
						'height' => true,
						'x'      => true,
						'y'      => true,
						'rx'     => true,
					],
					'polyline' => [ 'points' => true ],
				]
			);
			?>
		</svg>
		<span class="wfc-cart-countlocation">
			<?php echo esc_html( wc()->cart->get_cart_contents_count() ); ?>
		</span>
	</span>
</div>

<div class="wfc-overlay wfc-hide"></div>
<div class="wfc-widget-sidebar <?php echo esc_attr( sp_store_growth()->has_pro() ? $class_name : '' ); ?> wfc-slide ">
<span class="qc-close-nav">
<svg xmlns="http://www.w3.org/2000/svg" width="14" height="8" viewBox="0 0 14 8" fill="none">
<path d="M1 1L4.72223 5.3426C5.91952 6.73944 8.08048 6.73944 9.27777 5.3426L13 1" stroke="#073B4C" stroke-width="2" stroke-linecap="round"/>
</svg>
</span>
	<div class="qc-cart-heading">
		<h3 class="wfc-cart-heading">
			<?php esc_html_e( 'Shopping Cart', 'storegrowth-sales-booster' ); ?>
			<div class="wfc-cart-countlocation">
				<?php echo esc_html( wc()->cart->get_cart_contents_count() ); ?>
		</div>
		</h3>
		<span class="wfc-close-btn spsg-cart-widget-close" title="Close">
			<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
			<path d="M13.9697 15.0303C14.2626 15.3232 14.7374 15.3232 15.0303 15.0303C15.3232 14.7374 15.3232 14.2626 15.0303 13.9697L11.0607 10L15.0303 6.03033C15.3232 5.73744 15.3232 5.26256 15.0303 4.96967C14.7374 4.67678 14.2626 4.67678 13.9697 4.96967L10 8.93934L6.03033 4.96967C5.73744 4.67678 5.26256 4.67678 4.96967 4.96967C4.67678 5.26256 4.67678 5.73744 4.96967 6.03033L8.93934 10L4.96967 13.9697C4.67678 14.2626 4.67678 14.7374 4.96967 15.0303C5.26256 15.3232 5.73744 15.3232 6.03033 15.0303L10 11.0607L13.9697 15.0303Z" fill="#303030"/>
			</svg>
		</span>
	</div>
	<div class="spsg-widget-shopping-cart-content-wrapper">
		<div class="spsg-widget-shopping-cart-content"></div>
		<div class="spsg-page-loader spsg-fly-cart-loader">
			<div class="spsg-page-loader-ring"></div>
		</div>
	</div>
</div>
