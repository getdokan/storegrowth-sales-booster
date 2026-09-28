/**
 * Direct Checkout settings as the settings API returns them
 * (`sales-booster/v1/settings/direct-checkout`, PHP `DirectCheckoutSettings`).
 *
 * @since SPSG_VERSION
 */
import type { SettingValue } from '@storegrowth/utilities';

export interface DirectCheckoutValues extends Record< string, SettingValue > {
    // Checkout Setting.
    buy_now_button_label: string;
    buy_now_button_setting:
        | 'cart-to-buy-now'
        | 'cart-with-buy-now'
        | 'specific-buy-now'
        | 'default-add-to-cart';
    checkout_redirect: 'legacy-checkout' | 'quick-cart-checkout';
    shop_page_checkout_enable: boolean;
    product_page_checkout_enable: boolean;

    // Design.
    button_style: boolean;
    button_color: string;
    text_color: string;
    font_family: string;
    font_size: number;
    paddingYaxis: number;
    paddingXaxis: number;
    button_border_style: 'solid' | 'dashed' | 'dotted' | 'none';
    border_width: number;
    border_color: string;
    button_border_radius: number;
}
