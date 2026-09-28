/**
 * Quick View settings as the settings API returns them
 * (`sales-booster/v1/settings/quick-view`, PHP `QuickViewSettings`).
 *
 * @since SPSG_VERSION
 */
import type { SettingValue } from '@storegrowth/utilities';

export interface QuickViewValues extends Record< string, SettingValue > {
    // General.
    enable_in_mobile: boolean;
    enable_zoom_box: boolean;
    modal_animation_effect:
        | 'mfp-fade'
        | 'mfp-move-from-top'
        | 'mfp-zoom-out'
        | 'mfp-none';
    cart_url_redirection:
        | 'shop-page-redirection'
        | 'legacy-cart-redirection'
        | 'checkout-redirection'
        | 'add-to-cart-ajax';
    auto_open_fly_cart: boolean;

    // Button settings.
    button_label: string;
    button_position:
        | 'after_add_to_cart'
        | 'before_add_to_cart'
        | 'center_on_the_image'
        | 'top_right_of_the_image';
    enable_qucik_view_icon: boolean;
    quick_view_icon: string;
    enable_close_button: boolean;
    show_view_details_button: boolean;

    // Contents.
    show_title: boolean;
    show_description: boolean;
    show_price: boolean;
    show_image: boolean;
    show_excerpt: boolean;
    show_meta: boolean;
    show_add_to_cart: boolean;

    // Design.
    button_border_radius: number;
    button_color: string;
    button_text_color: string;
    modal_background_color: string;
    navigation_background: string;
}
