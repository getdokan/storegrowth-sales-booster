/**
 * Sales Notification settings as the settings API returns them
 * (`sales-booster/v1/settings/sales-pop`, PHP `SalesPopSettings`).
 *
 * @since SPSG_VERSION
 */
import type { SettingValue } from '@storegrowth/utilities';

/** Text rows of the Text Style card: key prefix → colour key. */
export const TEXT_ROWS = {
    normal_text: 'normal_text_color',
    product_title: 'product_title_color',
    time_text: 'time_text_color',
    country_text: 'country_text_color',
    state_text: 'state_text_color',
    city_text: 'city_text_color',
} as const;

export type TextRow = keyof typeof TEXT_ROWS;

export interface SalesPopValues extends Record< string, SettingValue > {
    // General.
    enable: boolean;
    enble_visibility: boolean;
    mobile_view: boolean;
    show_close_button: boolean;

    // Products.
    product_random: boolean;
    external_link: boolean;
    open_product_link_in_new_tab: boolean;
    link_image_to_product: boolean;
    /** 0 recent orders, 1 selected products, 2 best sellers. */
    product_source: '0' | '1' | '2';
    number_of_orders: number;
    popup_products: number[];
    virtual_name: string[];
    virtual_locations: string[];
    banner_show_option: 'banner-show-everywhere' | 'banner-show-selected';
    slected_page_option: string[];
    user_type: 'both' | 'logged_in' | 'not_logged_in';

    // Message and timing.
    message_popup: string;
    loop: boolean;
    notification_per_page: number;
    next_time_display: number;
    initial_time_delay: number;
    dispaly_time: number;

    // Design.
    template: '1' | '2' | '3' | '4';
    image_style: boolean;
    spacing_around_image: number;
    popup_image_border_radius: number;
    image_position: 'left' | 'right';
    popup_image_width: number;
    popup_style: boolean;
    background_color: string;
    popup_position: 'left_bottom' | 'right_bottom' | 'left_top' | 'right_top';
    popup_border_radius: number;
    popup_width: number;
    text_style: boolean;
    name_text_color: string;
    name_text_font_size: number;
    name_text_font_weight: string;
}

export type SalesPopKey = keyof SalesPopValues;

/** Keys each tab saves and resets. */
export const TAB_KEYS: Record< 'settings' | 'design', SalesPopKey[] > = {
    settings: [
        'enable',
        'enble_visibility',
        'mobile_view',
        'show_close_button',
        'product_random',
        'external_link',
        'open_product_link_in_new_tab',
        'link_image_to_product',
        'product_source',
        'number_of_orders',
        'popup_products',
        'virtual_name',
        'virtual_locations',
        'banner_show_option',
        'slected_page_option',
        'user_type',
        'message_popup',
        'loop',
        'notification_per_page',
        'next_time_display',
        'initial_time_delay',
        'dispaly_time',
    ],
    design: [
        'template',
        'image_style',
        'spacing_around_image',
        'popup_image_border_radius',
        'image_position',
        'popup_image_width',
        'popup_style',
        'background_color',
        'popup_position',
        'popup_border_radius',
        'popup_width',
        'text_style',
        ...Object.entries( TEXT_ROWS ).flatMap( ( [ prefix, color ] ) => [
            color,
            `${ prefix }_font_size`,
            `${ prefix }_font_weight`,
        ] ),
    ],
};
