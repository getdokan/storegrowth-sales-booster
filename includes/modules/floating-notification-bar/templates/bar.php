<?php
/**
 * Template to show the bar.
 *
 * @package SBFW
 */

$banner_type_to_show = sgsb_floating_notification_bar_get_banner_type_to_show();

if ( ! $banner_type_to_show ) {
	return;
}

$settings    = sgsb_floating_notification_bar_get_settings();
$banner_text = sgsb_floating_notification_bar_get_banner_text( $settings );
$banner_icon = sgsb_floating_notification_bar_get_banner_icon( $settings );
?>
<div class="sgsb-floating-notification-bar-wrapper">
	<div class="sgsb-floating-notification-bar">
		<div class="sgsb-floating-notification-bar-icon">
			<?php
			if ( $banner_icon ) {
				echo $banner_icon; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
			}
			?>
		</div>
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
		<div class="sgsb-floating-notification-bar-remove">
			<img src="<?php echo esc_url( plugin_dir_url( __FILE__ ) . '../assets/images/sgsb-floating-notification-bar-remove.svg' ); ?>" alt="remove">
		</div>
	</div>
</div>
