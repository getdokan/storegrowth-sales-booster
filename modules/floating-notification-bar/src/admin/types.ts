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

export type FloatingBarKey = keyof FloatingBarValues & string;

/** Keys each tab saves and resets. */
export const TAB_KEYS: Record<
    'content' | 'configure' | 'design',
    FloatingBarKey[]
> = {
    content: [
        'default_banner_text',
        'default_banner_icon_name',
        'default_banner_custom_icon',
    ],
    configure: [
        'bar_position',
        'bar_type',
        'button_enable',
        'button_action',
        'button_view',
        'ac_button_text',
        'redirect_url',
        'new_tab_enable',
        'show_cupon',
        'cupon_code',
        'countdown_show_enable',
        'countdown_start_date',
        'countdown_end_date',
        'banner_device_view',
        'banner_trigger',
        'banner_delay',
        'scroll_banner_delay',
        'banner_show_option',
        'slected_page_option',
        'user_type',
    ],
    design: [
        'banner_height',
        'font_family',
        'font_size',
        'background_color',
        'text_color',
        'icon_color',
        'button_color',
        'button_text_color',
        'close_icon_color',
        'notify_template',
    ],
};
