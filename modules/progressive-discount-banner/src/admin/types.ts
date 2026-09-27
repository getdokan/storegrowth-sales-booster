/**
 * Free Shipping Rules settings as the settings API returns them
 * (`sales-booster/v1/settings/progressive-discount-banner`, PHP
 * `ProgressiveDiscountBannerSettings`).
 *
 * @since SPSG_VERSION
 */
import type { BarValues } from '@storegrowth/components';

export interface FreeShippingValues extends BarValues {
    // Content.
    progressive_banner_text: string;
    goal_completion_text: string;
    progressive_banner_icon_name: string;
    progressive_banner_custom_icon: string;
    btn_style: boolean;
    btn_text: string;
    btn_target: string;

    // Configure.
    discount_type: 'free-shipping' | 'discount-amount';
    discount_amount_mode: 'fixed-amount' | 'percentage';
    /** `''` until typed (the old admin's "not set"). */
    discount_amount_value: number | '';
    cart_minimum_amount: number;

    // Design.
    btn_color: string;
    btn_text_color: string;
    bar_template: 'shipping_bar_one';
}

export type FreeShippingKey = keyof FreeShippingValues & string;

/** Keys each tab saves and resets. */
export const TAB_KEYS: Record<
    'content' | 'configure' | 'design',
    FreeShippingKey[]
> = {
    content: [
        'progressive_banner_text',
        'goal_completion_text',
        'progressive_banner_icon_name',
        'progressive_banner_custom_icon',
        'btn_style',
        'btn_text',
        'btn_target',
    ],
    configure: [
        'bar_position',
        'bar_type',
        'discount_type',
        'discount_amount_mode',
        'discount_amount_value',
        'cart_minimum_amount',
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
        'close_icon_color',
        'btn_color',
        'btn_text_color',
        'bar_template',
    ],
};
