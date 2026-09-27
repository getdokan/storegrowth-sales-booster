<?php
/**
 * Template to show the bar.
 *
 * @package SBFW
 */

use StorePulse\StoreGrowth\Helper as PluginHelper;
use StorePulse\StoreGrowth\Modules\FloatingNotificationBar\Helper;

$settings      = Helper::get_settings();
$banner_text   = Helper::get_banner_text( $settings );
$banner_icon   = Helper::get_banner_icon( $settings );
$button_text   = PluginHelper::find_option_settings( $settings, 'ac_button_text', 'Shop Now' );
$button_action = PluginHelper::find_option_settings( $settings, 'button_action', 'ba-url-redirect' );
$redirect_url  = PluginHelper::find_option_settings( $settings, 'redirect_url', '#' );

?>
<div class="spsg-floating-notification-bar-wrapper">
	<div class="spsg-floating-notification-bar">
		<div class='spsg-floating-notification-bar-icon'>
			<?php // The stored icon slugs as lucide icons: gift, badge-percent, hand-coins. ?>
			<?php if ( 'notify-bar-icon-1' === $banner_icon ) : ?>
				<svg class="spsg-bar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/></svg>
			<?php elseif ( 'notify-bar-icon-2' === $banner_icon ) : ?>
				<svg class="spsg-bar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m15 9-6 6"/><path d="M9 9h.01"/><path d="M15 15h.01"/></svg>
			<?php elseif ( 'notify-bar-icon-3' === $banner_icon ) : ?>
				<svg class="spsg-bar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 15h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 17"/><path d="m7 21 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9"/><path d="m2 16 6 6"/><circle cx="16" cy="9" r="2.9"/><circle cx="6" cy="5" r="3"/></svg>
			<?php endif; ?>
		</div>
		<div class="spsg-floating-notification-bar-text-container">
			<span class="spsg-floating-notification-bar-text">
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
		</div>
		<div class="spsg-floating-notification-bar-remove">
			<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
		</div>
	</div>
</div>
