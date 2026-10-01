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
