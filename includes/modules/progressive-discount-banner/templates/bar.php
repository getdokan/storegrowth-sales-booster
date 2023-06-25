<?php
/**
 * Template to show the bar.
 *
 * @package SBFW
 */

$banner_type_to_show = sgsb_pd_banner_get_banner_type_to_show();

if ( ! $banner_type_to_show ) {
	return;
}

$settings    = sgsb_pd_banner_get_settings();
$banner_text = sgsb_pd_banner_get_banner_text( $settings );
$banner_icon = sgsb_pd_banner_get_banner_icon( $settings );
?>
<div class="sgsb-pd-banner-bar-wrapper">
	<div class="sgsb-pd-banner-bar">
		<div class="sgsb-pd-banner-bar-icon">
			<?php
			if ( $banner_icon ) {
				echo $banner_icon; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
			}
			?>
		</div>
		<span class="sgsb-pd-banner-text">
			<?php
			/**
			 * Banner text filter.
			 *
			 * @since 1.0.0
			 */
			echo wp_kses_post( apply_filters( 'sales_boster_pd_banner_text', $banner_text ) );
			?>
		</span>
		<div class="sgsb-pd-banner-bar-remove">
			<img src="<?php echo esc_url( plugin_dir_url( __FILE__ ) . '../assets/images/sgsb-pd-banner-bar-remove.svg' ); ?>" alt="remove">
		</div>
	</div>
</div>
