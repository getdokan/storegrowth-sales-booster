/**
 * The order bump box in the checkout preview: the storefront's own markup
 * (`templates/bump-product-front-view.php`) and classes, styled by the
 * storefront stylesheet `order-bump-front.css` (loaded on the admin page by
 * `AdminPage`, ADR-005 S10), so the preview is the box shoppers see. The
 * values are the editor's unsaved ones, worked out as the checkout does
 * (`OrderBump::get_checkout_offers()`): the struck regular price, the bump
 * price from the active price, the strip's text ("10% off only for you!",
 * "2.00$ Just Only", "Free") and, for a product that can't be bought, "Out
 * of Stock" in place of the (unticked) Select checkbox.
 *
 * As the classic box, the top and bottom margins sit on its rules; the
 * checkout block leaves them out. As the block, the title takes the product
 * font size and the two prices stack. The row gap and title line height a
 * store's theme supplies are set here.
 *
 * @since SPSG_VERSION
 */
import { useEffect, useId, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import type { HTMLAttributes } from 'react';
import { assetUrl, type Currency, formatPrice } from '@storegrowth/utilities';

import { fetchOfferProductsByIds, type OfferProduct } from '../api';
import type { OrderBumpEditor } from './use-order-bump';

/** A sample product until one is chosen. */
const SAMPLE: OfferProduct = {
    id: 0,
    name: __( 'Nike Air Max Plus', 'storegrowth-sales-booster' ),
    type: 'simple',
    image: '',
    price: 174,
    regular: 174,
    available: true,
    anyAttribute: false,
};

/** The badge the storefront strip carries (`bump-product-front-view.php`). */
const BADGE_PATH =
    'M6.35818 0.158203C6.08866 0.158203 5.81928 0.261688 5.61466 0.466306L5.2127 0.868251C4.84967 1.23128 4.35705 1.43443 3.84365 1.43443H3.2095C2.63076 1.43443 2.15787 1.90729 2.15787 2.48604V2.95182V3.12053C2.15787 3.63394 1.95471 4.12619 1.59169 4.48922L1.18974 4.89117C0.780504 5.3004 0.780504 5.96965 1.18974 6.37888L1.59169 6.78083C1.95471 7.14386 2.15787 7.63577 2.15787 8.14918V8.78366C2.15787 9.36241 2.63076 9.83528 3.2095 9.83528H3.84365C4.35705 9.83528 4.84967 10.0388 5.2127 10.4018L5.61466 10.8034C6.02389 11.2126 6.69247 11.2126 7.1017 10.8034L7.504 10.4018C7.86703 10.0388 8.35931 9.83528 8.87271 9.83528H9.50686C10.0856 9.83528 10.5585 9.36241 10.5585 8.78366V8.14918C10.5585 7.63577 10.7634 7.14386 11.1264 6.78083L11.528 6.37888C11.9372 5.96964 11.9372 5.30041 11.528 4.89117L11.1264 4.48922C10.7634 4.12618 10.5585 3.63394 10.5585 3.12053V2.48604C10.5585 1.90729 10.0856 1.43443 9.50686 1.43443H8.87271C8.35931 1.43443 7.86703 1.23128 7.504 0.868251L7.1017 0.466306C6.89709 0.261687 6.6277 0.158204 6.35818 0.158203ZM5.03537 3.41518C5.52954 3.41518 5.93415 3.82012 5.93415 4.31429C5.93415 4.80846 5.52954 5.21341 5.03537 5.21341C4.54119 5.21341 4.13623 4.80846 4.13623 4.31429C4.13623 3.82012 4.54119 3.41518 5.03537 3.41518ZM8.13402 3.65669C8.18088 3.65643 8.22593 3.6748 8.25926 3.70775C8.27581 3.72405 8.28899 3.74346 8.29803 3.76486C8.30708 3.78625 8.31182 3.80923 8.31198 3.83246C8.31214 3.85569 8.30772 3.87873 8.29897 3.90025C8.29022 3.92177 8.27732 3.94136 8.261 3.95789L4.67896 7.56092C4.64604 7.59399 4.60137 7.6127 4.5547 7.61296C4.50804 7.61322 4.46315 7.59502 4.42986 7.56232C4.41325 7.54601 4.40004 7.52659 4.39096 7.50516C4.38188 7.48373 4.37713 7.46071 4.37697 7.43744C4.37681 7.41417 4.38124 7.39109 4.39002 7.36954C4.3988 7.34798 4.41175 7.32837 4.42812 7.31184L8.01015 3.70916C8.04292 3.67603 8.08743 3.65717 8.13402 3.65669ZM5.03537 3.76882C4.73224 3.76882 4.48988 4.0112 4.48988 4.31429C4.48988 4.61739 4.73224 4.85977 5.03537 4.85977C5.33849 4.85977 5.58085 4.61739 5.58085 4.31429C5.58085 4.0112 5.33849 3.76882 5.03537 3.76882ZM7.68134 6.05629C8.17552 6.05629 8.58047 6.46124 8.58047 6.95541C8.58047 7.44958 8.17552 7.85314 7.68134 7.85314C7.18717 7.85314 6.78359 7.44958 6.78359 6.95541C6.78359 6.46124 7.18717 6.05629 7.68134 6.05629ZM7.68134 6.40993C7.37822 6.40993 7.1369 6.65231 7.1369 6.95541C7.1369 7.2585 7.37822 7.50088 7.68134 7.50088C7.98447 7.50088 8.22648 7.2585 8.22648 6.95541C8.22648 6.65231 7.98447 6.40993 7.68134 6.40993Z';

/**
 * The box is a picture: out of the tab order and the accessibility tree, its
 * checkbox can't be ticked. React 18 has no `inert` prop type; it passes the
 * attribute through as a string.
 */
const INERT = { inert: '' } as HTMLAttributes< HTMLDivElement >;

/**
 * The offer product, loaded when it changes (null: none chosen, or gone).
 * While another loads, the last one stays.
 *
 * @param id Product id (0: none chosen).
 */
function useOfferProduct( id: number ) {
    const [ product, setProduct ] = useState< OfferProduct | null >( null );

    useEffect( () => {
        let cancelled = false;

        if ( ! id ) {
            setProduct( null );
            return;
        }

        fetchOfferProductsByIds( [ id ] )
            .then( ( found ) => {
                if ( ! cancelled ) {
                    setProduct( found[ 0 ] ?? null );
                }
            } )
            .catch( () => {
                if ( ! cancelled ) {
                    setProduct( null );
                }
            } );

        return () => {
            cancelled = true;
        };
    }, [ id ] );

    return product;
}

/**
 * The bump's price for the product (`OrderBump::calculate_offer_price()`):
 * a percentage (0–100) off the active price, a fixed price, or free.
 *
 * @param type    Offer type.
 * @param current Active price.
 * @param amount  The bump's amount.
 */
export function offerPrice( type: string, current: number, amount: number ) {
    if ( type === 'free' ) {
        return 0;
    }

    if ( type === 'discount' ) {
        const percent = Math.min( 100, Math.max( 0, amount ) );

        return Math.max( 0, current - ( current * percent ) / 100 );
    }

    return Math.max( 0, amount );
}

/**
 * The strip's text (`OrderBump::get_offer_label()`): "Free", the percentage
 * (zeros trimmed) with the discount title, or the price in the store's
 * number format (no symbol: the title carries it) with the fixed price title.
 *
 * @param values   The editor's values.
 * @param price    The bump price.
 * @param currency Price format.
 */
export function offerLabel(
    values: OrderBumpEditor[ 'values' ],
    price: number,
    currency: Currency
) {
    if ( values.offer_type === 'free' ) {
        return __( 'Free', 'storegrowth-sales-booster' );
    }

    if ( values.offer_type === 'discount' ) {
        // Clamped as the price is (`offerPrice()`).
        const percent = Math.min(
            100,
            Math.max( 0, Number( values.offer_amount ) || 0 )
        );
        const amount = String( percent ).replace(
            '.',
            currency.decimal_separator
        );

        return amount + String( values.offer_discount_title ?? '' );
    }

    return (
        formatPrice( price, { ...currency, symbol: '', position: 'left' } ) +
        String( values.offer_fixed_price_title ?? '' )
    );
}

export interface BumpPreviewProps {
    bump: OrderBumpEditor;
}

/**
 * @since SPSG_VERSION
 *
 * @param props      Props.
 * @param props.bump The editor's bump (unsaved values).
 */
export function BumpPreview( { bump }: BumpPreviewProps ) {
    const { values, currency } = bump;
    const checkboxId = useId();
    const productId = Number( values.offer_product_id ) || 0;
    const chosen = useOfferProduct( productId );
    // The sample only while no product is chosen; nothing until the chosen
    // one loads (or when it's gone, as the checkout shows no box).
    const product = productId ? chosen : SAMPLE;

    if ( ! product ) {
        return null;
    }

    const price = offerPrice(
        String( values.offer_type ),
        product.price,
        Number( values.offer_amount ) || 0
    );
    const money = ( amount: number ) => {
        return formatPrice( amount, currency );
    };

    // A chosen product without an image shows the box's own; the sample
    // shows the preview's product photo.
    let image = product.image || bump.fallbackImage;
    if ( ! productId ) {
        image = assetUrl( 'images/preview/product.jpeg' );
    }

    const textColor = String( values.product_description_text_color );
    const productText = {
        color: textColor,
        fontSize: `${ values.product_description_font_size }px`,
    };

    return (
        // `spsg-storefront`: the admin's style reset stops here, so the
        // storefront stylesheet styles the box as at checkout.
        <div
            className="spsg-storefront template-overview-area"
            aria-hidden
            { ...INERT }
        >
            <hr style={ { marginTop: `${ values.box_top_margin }px` } } />
            <div
                className="offer-main-wrap"
                style={ {
                    border:
                        values.box_border_style === 'no_border'
                            ? 'none'
                            : `2px ${ values.box_border_style } ${ values.box_border_color }`,
                } }
            >
                <div
                    className="dynamic-offer-text"
                    style={ {
                        background: String( values.discount_background_color ),
                        color: String( values.discount_text_color ),
                        fontSize: `${ values.discount_font_size }px`,
                    } }
                >
                    <svg
                        width="15"
                        height="15"
                        viewBox="0 0 12 12"
                        fill="none"
                        aria-hidden
                    >
                        <path
                            fill={ String( values.discount_text_color ) }
                            d={ BADGE_PATH }
                        />
                    </svg>
                    { ' ' + offerLabel( values, price, currency ) }
                </div>
                { /* The gap and title line height a store's theme gives
                   the box (the admin's don't). */ }
                <div
                    className="product-image-and-title"
                    style={ { gap: '5px' } }
                >
                    <div className="offer-product-image-title">
                        <div className="offer-product-image">
                            <img src={ image } width="70" alt="" />
                        </div>
                        <div
                            className="offer-product-title"
                            style={ productText }
                        >
                            <h3 style={ { ...productText, lineHeight: 1.5 } }>
                                { product.name }
                            </h3>
                        </div>
                    </div>
                    { /* One price a line, as the checkout block prints each
                       in its own block (`RawHTML`'s `div`). */ }
                    <div className="offer-price" style={ productText }>
                        <div style={ { textDecoration: 'line-through' } }>
                            { money( product.regular ) }
                        </div>
                        <div>{ money( price ) }</div>
                    </div>
                    <div className="product-checkbox-and-excitement-message">
                        { /* The storefront's own checkbox, unticked as a
                           shopper first sees it. */ }
                        { product.available ? (
                            <>
                                <input
                                    type="checkbox"
                                    className="custom-checkbox"
                                    id={ checkboxId }
                                    defaultChecked={ false }
                                />
                                <label htmlFor={ checkboxId }>
                                    { __(
                                        'Select',
                                        'storegrowth-sales-booster'
                                    ) }
                                </label>
                            </>
                        ) : (
                            <span
                                className="out-of-stock-message"
                                style={ { color: '#dc3545', fontWeight: 500 } }
                            >
                                { __(
                                    'Out of Stock',
                                    'storegrowth-sales-booster'
                                ) }
                            </span>
                        ) }
                    </div>
                </div>
            </div>
            <hr style={ { marginBottom: `${ values.box_bottom_margin }px` } } />
        </div>
    );
}
