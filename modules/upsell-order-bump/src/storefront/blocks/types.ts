/**
 * Order Bump checkout block: the data PHP sends
 * (`OrderBumpCheckoutIntegration::get_script_data()`) and the WooCommerce
 * Blocks globals the block uses.
 *
 * @since SPSG_VERSION
 */
import type { ComponentType, ReactNode } from 'react';

/** A bump's `design_settings`, as stored. */
export interface BumpDesign {
    box_border_style?: string;
    box_border_color?: string;
    discount_background_color?: string;
    discount_text_color?: string;
    discount_font_size?: string | number;
    product_description_text_color?: string;
    product_description_font_size?: string | number;
    offer_discount_title?: string;
    offer_fixed_price_title?: string;
    offer_image_url?: string;
    offer_product_title?: string;
    fallback_image_url?: string;
}

/** One matching bump for the current cart. */
export interface BumpOffer {
    /** The bump's id (unique checkbox ids). */
    id?: number;
    design_settings?: BumpDesign;
    /** The product id sent back: a variation's parent, else the product. */
    offer_product_id?: number;
    variation_id?: number;
    checked?: string;
    /** The bump price as displayed (sent back, ignored by the server). */
    offer_price?: string | number;
    /** The offer strip's text, e.g. "10% off only for you!" (plain text). */
    offer_label?: string;
    /** `wc_price()` markup of the struck regular price. */
    regular_price_html?: string;
    /** `wc_price()` markup of the bump price. */
    offer_price_html?: string;
    is_purchasable?: boolean;
}

interface CheckboxControlProps {
    checked: boolean;
    id: string;
    onChange: ( checked: boolean ) => void;
    label: string;
}

declare global {
    interface Window {
        wc: {
            blocksCheckout: {
                registerCheckoutBlock: ( options: {
                    metadata: unknown;
                    component: ComponentType;
                } ) => void;
                ExperimentalOrderMeta: ComponentType< {
                    children?: ReactNode;
                } >;
            };
            blocksComponents: {
                CheckboxControl: ComponentType< CheckboxControlProps >;
            };
            wcSettings: {
                getSetting: < T >( name: string ) => T | undefined;
            };
        };
        /** Localized on `spsg-order-bump-front-js` (`EnqueueScript::front_scripts()`). */
        bump_save_url: {
            ajax_url_for_front: string;
            ajd_nonce: string;
        };
        jQuery: {
            post: (
                url: string,
                data: Record< string, unknown >
            ) => PromiseLike< unknown >;
        };
    }
}
