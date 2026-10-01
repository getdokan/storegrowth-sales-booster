/**
 * Fly Cart settings as the settings API returns them
 * (`sales-booster/v1/settings/fly-cart`, PHP `FlyCartSettings`).
 *
 * @since SPSG_VERSION
 */
import type { SettingValue } from '@storegrowth/utilities';

export interface FlyCartValues extends Record< string, SettingValue > {
    // General.
    layout: 'side' | 'center';

    // Cart contents.
    show_product_image: boolean;
    show_remove_icon: boolean;
    show_quantity_picker: boolean;
    show_product_price: boolean;
    show_stock_status: boolean;
    fly_cart_badge_icon: boolean;
    show_free_shipping_message: boolean;
    show_coupon: boolean;
    enable_add_to_cart_redirect: boolean;

    // Design.
    icon_position:
        | 'bottom-right'
        | 'top-right'
        | 'center-right'
        | 'top-left'
        | 'bottom-left'
        | 'center-left';
    icon_name: string;
    buttons_bg_color: string;
    shopping_button_bg_color: string;
    icon_color: string;
    widget_bg_color: string;
    product_card_bg_color: string;
}
