/**
 * Order Bump REST client: the bumps route (`sales-booster/v1/order-bumps`,
 * read through the shared records client) and the offer products.
 *
 * @since SPSG_VERSION
 */
import apiFetch from '@wordpress/api-fetch';
import { decodeEntities } from '@wordpress/html-entities';
import { addQueryArgs } from '@wordpress/url';
import {
    type Currency,
    getAdminData,
    type RecordEditorData,
} from '@storegrowth/utilities';

/** A bump's target: a product or a category (`target_type`). */
export interface BumpTarget {
    id: number;
    name: string;
    /** Product thumbnail (empty for a category). */
    image: string;
}

/** An order bump as the list shows it (the route returns more). */
export interface OrderBump {
    id: number;
    name: string;
    status: 'active' | 'inactive';
    target_type: 'products' | 'categories';
    /** Deleted targets are left out. */
    targets: BumpTarget[];
    /** The offered product; null when it's gone. */
    offer_product_info: { id: number; name: string; image: string } | null;
    /**
     * The offer's prices in the store's format, the offer as the cart
     * charges it; null when the product is gone.
     */
    offer_prices: { regular: string; offer: string } | null;
}

/**
 * The bumps route.
 *
 * @since SPSG_VERSION
 */
export const bumpsRoute = () => {
    return `/${ getAdminData().restNamespace }/order-bumps`;
};

/**
 * What the bump editor is drawn from (`GET /order-bumps/editor`, PHP
 * `OrderBumpFields`).
 */
export interface BumpEditor extends RecordEditorData {
    /** The store's price format. */
    currency: Currency;
    /**
     * The cart shows prices with a tax adjustment the preview doesn't make
     * (taxes on, shown with tax while entered without, or the other way).
     */
    tax_adjusted: boolean;
    /** The checkout box's image for a product without one. */
    fallback_image_url: string;
}

/** An offer product, as the picker and the checkout preview show it. */
export interface OfferProduct {
    id: number;
    name: string;
    type: string;
    /** Thumbnail URL, or empty. */
    image: string;
    /** Active price (the sale price while a sale runs), as entered. */
    price: number;
    /** Regular price, else the active one. */
    regular: number;
    /** In stock or on backorder: the box shows its Select checkbox. */
    available: boolean;
    /** A variation with an "Any …" attribute: it can't be an offer. */
    anyAttribute: boolean;
}

interface WcProduct {
    id: number;
    name: string;
    type: string;
    price: string;
    regular_price: string;
    stock_status: string;
    backorders_allowed: boolean;
    any_attribute?: boolean;
    images?: Array< { thumbnail?: string; src: string } >;
}

/**
 * Products for the offer: simple products and variations (`include_variations`).
 *
 * @param query Query args of `GET /products`.
 */
async function fetchOfferProducts(
    query: Record< string, string | number >
): Promise< OfferProduct[] > {
    const products = await apiFetch< WcProduct[] >( {
        path: addQueryArgs( `/${ getAdminData().restNamespace }/products`, {
            ...query,
            include_variations: true,
            _fields:
                'id,name,type,price,regular_price,stock_status,backorders_allowed,any_attribute,images',
        } ),
    } );

    return products.map( ( product ) => {
        const price = Number( product.price ) || 0;

        return {
            id: product.id,
            name: decodeEntities( product.name ),
            type: product.type,
            image:
                product.images?.[ 0 ]?.thumbnail ??
                product.images?.[ 0 ]?.src ??
                '',
            price,
            regular: Number( product.regular_price ) || price,
            available:
                product.stock_status !== 'outofstock' ||
                product.backorders_allowed,
            anyAttribute: Boolean( product.any_attribute ),
        };
    } );
}

/**
 * Products by id (a saved offer or targets).
 *
 * @since SPSG_VERSION
 *
 * @param ids Product ids.
 */
export function fetchOfferProductsByIds( ids: number[] ) {
    if ( ! ids.length ) {
        return Promise.resolve( [] );
    }

    return fetchOfferProducts( {
        include: ids.join( ',' ),
        per_page: ids.length,
    } );
}

/**
 * Products that can be an offer, by name: a simple product or a variation
 * with every attribute set (as the routes check), not a variable product
 * (the shopper would have to pick the variation) or an external one.
 *
 * @since SPSG_VERSION
 *
 * @param search Search text.
 */
export async function searchOfferProducts( search: string ) {
    const products = await fetchOfferProducts( {
        search,
        per_page: 20,
        status: 'publish',
    } );

    return products.filter( ( product ) => {
        return (
            ! [ 'variable', 'grouped', 'external' ].includes( product.type ) &&
            ! product.anyAttribute
        );
    } );
}
