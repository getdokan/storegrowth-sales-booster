/**
 * The BOGO offer box in the product page preview (design `bogo-edit.html`,
 * `.bg-box`): the offer message strip, then the offer product with its image
 * (the offer badge on it), name, the target product's categories (as the
 * template shows them) and prices. It shows what the
 * storefront template (`templates/bogo-product-front-view.php`) works out:
 * the message ("N% Off" while the offer costs something, else the product
 * page message or "Free Gift"), the cart's offer price and, with the global
 * "Show Regular Price" setting, the regular price.
 *
 * The design's compact box, not the storefront stylesheet: the storefront box
 * is laid out for the product summary column and wraps in the preview's
 * narrower widget slot.
 *
 * @since SPSG_VERSION
 */
import { useEffect, useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { CircleCheck } from 'lucide-react';
import type { CSSProperties } from 'react';
import { useSettingsPages } from '@storegrowth/hooks';
import { assetUrl } from '@storegrowth/utilities';

import {
    type Currency,
    fetchPreviewProducts,
    formatPrice,
    type PreviewProduct,
} from '../api';
import type { OfferValues } from './use-bogo-offer';

/** The design's sample product, until one is chosen. */
const SAMPLE: PreviewProduct = {
    id: 0,
    name: __( 'Nike Air Max Plus', 'storegrowth-sales-booster' ),
    image: '',
    price: 174,
    regular: 174,
    categories: [ __( 'Men’s Shoe', 'storegrowth-sales-booster' ) ],
};

/**
 * The product the shopper gets: the offer product, or with Buy X Get X the
 * (first) target product. Loaded when it changes.
 *
 * @param id Product id (0: none chosen).
 */
function usePreviewProduct( id: number ) {
    const [ product, setProduct ] = useState< PreviewProduct | null >( null );

    useEffect( () => {
        let cancelled = false;

        if ( ! id ) {
            setProduct( null );
            return;
        }

        fetchPreviewProducts( [ id ] )
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

export interface OfferPreviewProps {
    values: OfferValues;
    /** The store's price format. */
    currency: Currency;
    /** The badge upload needs pro: without it the icon shows. */
    uploadLocked: boolean;
}

/**
 * @since SPSG_VERSION
 *
 * @param props              Props.
 * @param props.values       The editor's (unsaved) values.
 * @param props.currency     Price format.
 * @param props.uploadLocked The badge upload needs pro.
 */
export function OfferPreview( {
    values,
    currency,
    uploadLocked,
}: OfferPreviewProps ) {
    const targetId = ( values.offered_products as number[] )?.[ 0 ] ?? 0;
    const target = usePreviewProduct( targetId );
    const offered = usePreviewProduct(
        values.bogo_deal_type === 'same'
            ? 0
            : Number( values.get_different_product_field ) || 0
    );
    // Buy X Get X gives the target product itself.
    const product =
        ( values.bogo_deal_type === 'same' ? target : offered ) ?? SAMPLE;
    // The template lists the target product's categories.
    const categories = ( target ?? SAMPLE ).categories;
    // "Show Regular Price" is a global BOGO setting.
    const global = useSettingsPages().pages.bogo?.values ?? {};

    // The cart's price: free, or the percentage off the current price.
    const percent =
        values.offer_type === 'discount'
            ? Math.min( 100, Math.max( 0, Number( values.discount_amount ) ) )
            : 100;
    const offerPrice = product.price * ( 1 - percent / 100 );
    const money = ( amount: number ) => {
        return formatPrice( amount, currency );
    };

    // As the template: the discount while the offer costs something, else
    // the message (or "Free Gift") with the offer product's name.
    const message =
        offerPrice > 0
            ? sprintf(
                  /* translators: %s: discount percent. */
                  __( '%s%% Off', 'storegrowth-sales-booster' ),
                  String( Number( values.discount_amount ) )
              )
            : (
                  String( values.product_page_message ?? '' ) ||
                  __( 'Free Gift', 'storegrowth-sales-booster' )
              ).replace( '[offered_product]', product.name );

    // The offer's own badge: an upload (pro) over the chosen icon.
    const custom = uploadLocked
        ? ''
        : String( values.default_custom_badge_icon );
    const badge =
        custom ||
        assetUrl( `images/bogo/${ values.default_badge_icon_name }.svg` );

    return (
        <div
            className="flex w-full flex-col overflow-hidden rounded-md border bg-white"
            style={
                {
                    // Tailwind's `border` takes its style from this variable.
                    '--tw-border-style':
                        values.box_border_style === 'no_border'
                            ? 'none'
                            : String( values.box_border_style ),
                    borderColor: String( values.box_border_color ),
                    marginTop: `${ values.box_top_margin }px`,
                    marginBottom: `${ values.box_bottom_margin }px`,
                } as CSSProperties
            }
        >
            <p
                className="m-0 flex items-center justify-center gap-1.5 p-[7px] font-medium"
                style={ {
                    background: String( values.discount_background_color ),
                    color: String( values.discount_text_color ),
                    fontSize: `${ values.discount_font_size }px`,
                } }
            >
                <CircleCheck
                    className="size-3 shrink-0"
                    strokeWidth={ 2 }
                    aria-hidden
                />
                <span>{ message }</span>
            </p>
            { /* The price goes under the name when the slot is narrow. */ }
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2.5">
                <span className="relative size-12 shrink-0 overflow-hidden rounded bg-[#F2F2F5]">
                    <img
                        src={
                            product.image ||
                            assetUrl( 'images/preview/product.jpeg' )
                        }
                        alt=""
                        className="block size-full object-cover"
                    />
                    { Boolean( values.enable_custom_badge_image ) && (
                        <img
                            src={ badge }
                            alt=""
                            className="absolute left-0.5 top-0.5 h-[22px] w-auto object-contain"
                        />
                    ) }
                </span>
                <span className="flex min-w-0 flex-1 basis-20 flex-col">
                    <span
                        className="font-medium leading-tight [overflow-wrap:anywhere]"
                        style={ {
                            color: String(
                                values.product_description_text_color
                            ),
                            fontSize: `${ values.product_description_font_size }px`,
                        } }
                    >
                        { product.name }
                    </span>
                    { categories.length > 0 && (
                        <span className="text-[11px] text-[#6B7280] [overflow-wrap:anywhere]">
                            { categories.join( ', ' ) }
                        </span>
                    ) }
                </span>
                <span className="ml-auto flex shrink-0 flex-col items-end gap-0.5 text-[13px] text-[#25252D]">
                    { Boolean( global.regular_price_show ) && (
                        <s className="text-[#6B7280]">
                            { money( product.regular ) }
                        </s>
                    ) }
                    <b className="font-semibold">{ money( offerPrice ) }</b>
                </span>
            </div>
        </div>
    );
}
