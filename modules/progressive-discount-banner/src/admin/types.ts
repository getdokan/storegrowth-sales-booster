/**
 * Cart Rewards settings as the settings API returns them
 * (`sales-booster/v1/settings/progressive-discount-banner`, PHP
 * `ProgressiveDiscountBannerSettings`).
 *
 * @since 3.0.0
 */
import type { BarValues } from '@storegrowth/components';

export type RewardType =
    | 'free-shipping'
    | 'coupon'
    | 'gift'
    | 'discount-amount';

/** One milestone (PHP `Milestones::normalize_row()`). */
export interface Milestone {
    [ key: string ]: string | number;
    /** 0 until saved. */
    id: number;
    threshold: number;
    reward: RewardType;
    coupon_id: number;
    gift_product_id: number;
    discount_mode: 'fixed-amount' | 'percentage';
    discount_value: number;
}

export interface FreeShippingValues extends BarValues {
    // Milestones.
    milestones: Milestone[];
    progressive_banner_text: string;
    bar_placement: 'fly-cart' | 'cart-page' | 'both';

    // Content.
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
