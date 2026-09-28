/**
 * Floating Bar settings as the settings API returns them
 * (`sales-booster/v1/settings/floating-notification-bar`, PHP
 * `FloatingNotificationBarSettings`).
 *
 * @since SPSG_VERSION
 */
import type { BarValues } from '@storegrowth/components';

export interface FloatingBarValues extends BarValues {
    // Content.
    default_banner_text: string;
    default_banner_icon_name: string;
    default_banner_custom_icon: string;

    // Configure.
    button_enable: boolean;
    ac_button_text: string;
    button_action: 'ba-close' | 'ba-url-redirect';
    button_view: string[];
    redirect_url: string;
    new_tab_enable: boolean;
    show_cupon: boolean;
    cupon_code: string;
    countdown_show_enable: boolean;
    /** `Y-m-d` or `''`. */
    countdown_start_date: string;
    countdown_end_date: string;

    // Design.
    button_color: string;
    button_text_color: string;
    notify_template:
        | 'notify_bar_one'
        | 'notify_bar_dark'
        | 'notify_bar_red'
        | 'notify_bar_amber';
}
