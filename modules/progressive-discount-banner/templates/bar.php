<?php
/**
 * Template to show the bar.
 *
 * @package SBFW
 */

use StorePulse\StoreGrowth\Helper as PluginHelper;
use StorePulse\StoreGrowth\Modules\ProgressiveDiscountBanner\Helper;

$settings          = Helper::get_settings();
$banner_text       = Helper::get_banner_text( $settings );
$banner_icon       = Helper::get_banner_icon( $settings );
$button_style      = PluginHelper::find_option_settings( $settings, 'btn_style', true );
$button_bg         = PluginHelper::find_option_settings( $settings, 'btn_color', '#fff' );
$button_text       = PluginHelper::find_option_settings( $settings, 'btn_text', __( 'Cart', 'storegrowth-sales-booster' ) );
$redirect_url      = PluginHelper::find_option_settings( $settings, 'btn_target', wc_get_cart_url() );
$button_text_color = PluginHelper::find_option_settings( $settings, 'btn_text_color', '#073b4c' );
?>
<div class='spsg-pd-banner-bar-wrapper'>
	<div class='spsg-pd-banner-bar'>
		<div class='spsg-pd-banner-bar-icon'>
			<?php // The stored icon slugs as lucide icons: truck, caravan, bus. ?>
			<?php if ( 'shipping-bar-icon-1' === $banner_icon ) : ?>
				<svg class="spsg-bar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>
			<?php elseif ( 'shipping-bar-icon-2' === $banner_icon ) : ?>
				<svg class="spsg-bar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 19V9a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v8a2 2 0 0 0 2 2h2"/><path d="M2 9h3a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H2"/><path d="M22 17v1a1 1 0 0 1-1 1H10v-9a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v9"/><circle cx="8" cy="19" r="2"/></svg>
			<?php elseif ( 'shipping-bar-icon-3' === $banner_icon ) : ?>
				<svg class="spsg-bar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3"/><circle cx="7" cy="18" r="2"/><path d="M9 18h5"/><circle cx="16" cy="18" r="2"/></svg>
			<?php endif; ?>
		</div>
		<div class="spsg-fn-bar-data-content">
			<span class='spsg-pd-banner-text'>
				<?php
				/**
				 * Banner text filter.
				 *
				 * @since 1.0.0
				 */
				echo wp_kses_post( apply_filters( 'sales_boster_pd_banner_text', $banner_text ) );
				?>
			</span>
			<?php if ( $button_style ) : ?>
				<a href="<?php echo esc_url( $redirect_url ); ?>" target="_blank" class="fn-bar-action-button"
					style="background: <?php echo esc_attr( $button_bg ); ?>; color: <?php echo esc_attr( $button_text_color ); ?>">
					<?php echo wp_kses_post( $button_text ); ?>
				</a>
			<?php endif; ?>
		</div>
		<div class='spsg-pd-banner-bar-remove' role="button" tabindex="0" aria-label="<?php esc_attr_e( 'Close', 'storegrowth-sales-booster' ); ?>">
			<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
		</div>
	</div>
</div>
