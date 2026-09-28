/**
 * BOGO offers REST client (`sales-booster/v1/bogo/offers`).
 *
 * @since SPSG_VERSION
 */
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';
import { getAdminData } from '@storegrowth/utilities';

/** A product in a list cell. */
export interface OfferProduct {
    id: number;
    name: string;
    price: string;
    regular_price: string;
    currency: string;
    image: string;
}

/** An offer as the list shows it (the route returns more). */
export interface BogoOffer {
    id: number;
    name: string;
    type: 'global' | 'product';
    status: 'active' | 'inactive';
    offer_type: string;
    discount_amount: string;
    bogo_deal_type: 'same' | 'different';
    product_id: number;
    /** A product offer's product edit screen. */
    edit_url?: string;
    /** Target categories by name (category offers). */
    target_categories: string[];
    /** The offer product's prices, in the store's format. */
    offer_prices?: { regular: string; offer: string };
    get_offered_product_info?: OfferProduct;
    get_different_product_info?: OfferProduct;
}

export interface OfferPage {
    items: BogoOffer[];
    totalItems: number;
    totalPages: number;
    /** Lite's limit allows another offer (`X-SPSG-Can-Create`). */
    canCreate: boolean;
}

const base = () => `/${ getAdminData().restNamespace }/bogo/offers`;

/**
 * A page of offers.
 *
 * @since SPSG_VERSION
 *
 * @param query          Query.
 * @param query.page     Page, from 1.
 * @param query.per_page Rows per page.
 * @param query.search   Name contains.
 */
export async function fetchOffers( query: {
    page: number;
    per_page: number;
    search?: string;
} ): Promise< OfferPage > {
    const response = await apiFetch< Response, false >( {
        path: addQueryArgs( base(), query ),
        parse: false,
    } );

    return {
        items: ( await response.json() ) as BogoOffer[],
        totalItems: Number( response.headers.get( 'X-WP-Total' ) ?? 0 ),
        totalPages: Number( response.headers.get( 'X-WP-TotalPages' ) ?? 0 ),
        canCreate: response.headers.get( 'X-SPSG-Can-Create' ) !== '0',
    };
}

/**
 * Turn an offer on or off.
 *
 * @since SPSG_VERSION
 *
 * @param id     Offer id.
 * @param active On.
 */
export function setOfferStatus( id: number, active: boolean ) {
    return apiFetch( {
        path: `${ base() }/${ id }/status`,
        method: 'POST',
        data: { status: active ? 'yes' : 'no' },
    } );
}

/**
 * Delete offers.
 *
 * @since SPSG_VERSION
 *
 * @param ids Offer ids.
 *
 * @return The ids deleted and those that couldn't be.
 */
export function deleteOffers( ids: number[] ) {
    return apiFetch< { deleted: number[]; failed: number[] } >( {
        path: `${ base() }/batch`,
        method: 'POST',
        data: { delete: ids },
    } );
}
