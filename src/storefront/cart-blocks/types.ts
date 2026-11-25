/**
 * StoreGrowth's data on the Store API cart (PHP `StoreApi\CartExtension`) and
 * the WooCommerce Blocks globals the block script uses.
 *
 * @since 3.1.0
 */
import type { ComponentType, ReactNode } from 'react';

export interface RewardsMilestone {
    threshold: string;
    label: string;
    text: string;
    reached: boolean;
}

export interface RewardsProgress {
    placement: 'fly-cart' | 'cart-page' | 'both';
    message: string;
    percent: number;
    percent_width: string;
    milestones: RewardsMilestone[];
    unlocked: Array< { code: string; message: string } >;
}

export interface CartExtensionData {
    notices: string[];
    coupon_labels: Record< string, string >;
    rewards: RewardsProgress | null;
    /** An automatic coupon's minimum still to reach (Smart Coupons). */
    coupon_nudge?: string | null;
}

export interface CartCoupon {
    code: string;
    label: string;
}

type CheckoutFilter< V > = (
    value: V,
    extensions?: Record<
        string,
        { is_reward_gift?: boolean; is_bogo_gift?: boolean }
    >
) => V;

export interface WcBlocksCheckout {
    registerCheckoutFilters: (
        namespace: string,
        filters: {
            coupons?: CheckoutFilter< CartCoupon[] >;
            showRemoveItemLink?: CheckoutFilter< boolean >;
        }
    ) => void;
    ExperimentalOrderMeta: ComponentType< { children?: ReactNode } >;
}

interface WpData {
    select: ( store: string ) => {
        getCartData: () => {
            extensions?: { storegrowth?: CartExtensionData };
        };
    };
    dispatch: ( store: string ) => {
        createInfoNotice: (
            content: string,
            options: { context: string }
        ) => void;
    };
    subscribe: ( listener: () => void, store?: string ) => () => void;
    useSelect: < T >(
        mapSelect: ( select: WpData[ 'select' ] ) => T,
        deps: unknown[]
    ) => T;
}

export interface WpGlobals {
    data: WpData;
    plugins: {
        registerPlugin: (
            name: string,
            settings: { scope: string; render: ComponentType }
        ) => void;
    };
}

export interface CartBlocksWindow {
    wc: { blocksCheckout: WcBlocksCheckout };
    wp: WpGlobals & {
        hooks: {
            addFilter: (
                hook: string,
                namespace: string,
                callback: (
                    value: boolean,
                    item: {
                        extensions?: Record<
                            string,
                            { is_reward_gift?: boolean; is_bogo_gift?: boolean }
                        >;
                    }
                ) => boolean
            ) => void;
        };
    };
}
