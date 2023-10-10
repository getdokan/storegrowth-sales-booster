<?php
/**
 * Template to show the bar.
 *
 * @package SBFW
 */



$settings      = sgsb_floating_notification_bar_get_settings();
$banner_text   = sgsb_floating_notification_bar_get_banner_text( $settings );
$banner_icon   = sgsb_floating_notification_bar_get_banner_icon( $settings );
$custom_icon   = sgsb_floating_notification_bar_get_custom_banner_icon( $settings );
$button_text   = sgsb_find_option_setting( $settings, 'ac_button_text', 'Shop Now' );
$button_action = sgsb_find_option_setting( $settings, 'button_action', 'ba-url-redirect' );
$redirect_url  = sgsb_find_option_setting( $settings, 'redirect_url', '#' );

?>
<div class="sgsb-floating-notification-bar-wrapper">
	<div class="sgsb-floating-notification-bar">
		<div class='sgsb-floating-notification-bar-icon'></div>
		<span class="sgsb-floating-notification-bar-text">
			<?php
			/**
			 * Banner text filter.
			 *
			 * @since 1.0.0
			 */
			echo wp_kses_post( apply_filters( 'sales_boster_floating_notification_bar_text', $banner_text ) );
			?>
		</span>
		<?php require plugin_dir_path( __FILE__ ) . 'action-button.php'; ?>
		<div class="sgsb-floating-notification-bar-remove">
			<img src="<?php echo esc_url( plugin_dir_url( __FILE__ ) . '../assets/images/sgsb-floating-notification-bar-remove.svg' ); ?>" alt="remove">
		</div>
	</div>
</div>
