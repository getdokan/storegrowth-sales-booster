/**
 * Direct Checkout preview widget (design `.dc-btn` in a shop card): the
 * buttons one shop card shows for the Button Layout, styled by the Design
 * tab.
 *
 * Lite styles the colours, font size and radius; the font, padding and
 * border come from pro (`DirectCheckoutPro` inline styles), so they apply
 * here only with pro, as on the storefront.
 *
 * @since SPSG_VERSION
 */
import { cn } from '@wedevs/plugin-ui';
import { __ } from '@wordpress/i18n';
import type { CSSProperties } from 'react';

import type { DirectCheckoutValues } from '../types';

export interface DirectCheckoutButtonProps {
    values: DirectCheckoutValues;
    isPro: boolean;
    /** CSS family of the chosen font (pro). */
    fontFamily: string;
    /**
     * `shop`: a shop card, with its own Add to cart (pro: lite prints the
     * button on product pages only). `product`: the single product page,
     * whose Add to cart the preview frame already draws.
     */
    page: 'shop' | 'product';
}

/**
 * @since SPSG_VERSION
 *
 * @param props            Props.
 * @param props.values     Settings.
 * @param props.isPro      Pro active.
 * @param props.fontFamily CSS family of the chosen font.
 * @param props.page       Shop card or product page.
 */
export function DirectCheckoutButton( {
    values,
    isPro,
    fontFamily,
    page,
}: DirectCheckoutButtonProps ) {
    const layout = values.buy_now_button_setting;
    const shown =
        page === 'shop'
            ? isPro && values.shop_page_checkout_enable
            : values.product_page_checkout_enable;
    const showBuyNow =
        shown &&
        ( layout === 'cart-with-buy-now' ||
            ( isPro &&
                ( layout === 'cart-to-buy-now' ||
                    layout === 'specific-buy-now' ) ) );
    // "Add to cart" as the Buy Now button replaces it.
    const showAddToCart =
        page === 'shop' && ( ! showBuyNow || layout !== 'cart-to-buy-now' );

    const style: CSSProperties = values.button_style
        ? {
              background: values.button_color,
              color: values.text_color,
              fontSize: values.font_size,
              borderRadius: values.button_border_radius,
              ...( isPro && {
                  fontFamily,
                  padding: `${ values.paddingYaxis }px ${ values.paddingXaxis }px`,
                  borderStyle: values.button_border_style,
                  borderWidth:
                      values.button_border_style === 'none'
                          ? 0
                          : values.border_width,
                  borderColor: values.border_color,
              } ),
          }
        : {};

    return (
        <div className="flex w-full flex-col items-stretch gap-2">
            { showAddToCart && (
                <span className="flex items-center justify-center whitespace-nowrap rounded-[4px] bg-[#E1E2E4] px-2 py-2.5 text-[12px] font-semibold leading-[1.3] text-[#111]">
                    { __( 'Add to cart', 'storegrowth-sales-booster' ) }
                </span>
            ) }
            { showBuyNow && (
                <span
                    className={ cn(
                        'flex items-center justify-center whitespace-nowrap font-semibold leading-[1.3]',
                        // Without the custom style: the theme's button.
                        ! values.button_style &&
                            'rounded-[4px] bg-[#1A1D20] text-[12px] text-white',
                        // Lite's storefront keeps the theme's padding.
                        ( ! values.button_style || ! isPro ) && 'px-5 py-2.5'
                    ) }
                    style={ style }
                >
                    { values.buy_now_button_label ||
                        __( 'Buy Now', 'storegrowth-sales-booster' ) }
                </span>
            ) }
        </div>
    );
}
