/**
 * BOGO offers REST client (`sales-booster/v1/bogo/offers`).
 *
 * @since SPSG_VERSION
 */
import apiFetch from '@wordpress/api-fetch';
import { decodeEntities } from '@wordpress/html-entities';
import { addQueryArgs } from '@wordpress/url';
import {
    getAdminData,
    type SettingField,
    type SettingsPageDefinition,
} from '@storegrowth/utilities';

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

/** The store's price format (WooCommerce settings). */
export interface Currency {
    symbol: string;
    /** `left`, `right`, `left_space` or `right_space`. */
    position: string;
    decimals: number;
    decimal_separator: string;
    thousand_separator: string;
}

/** What the offer editor is drawn from (`GET /bogo/offers/editor`). */
export interface OfferEditor {
    page: SettingsPageDefinition;
    schema: Record< string, SettingField >;
    /** Lite's limit allows a new offer. */
    can_create: boolean;
    currency: Currency;
}

/**
 * A price in the store's format, as `wc_price()` writes it (plain text).
 *
 * @since SPSG_VERSION
 *
 * @param amount   Amount.
 * @param currency Price format.
 */
export function formatPrice( amount: number, currency: Currency ): string {
    const [ whole, fraction ] = Math.abs( amount )
        .toFixed( currency.decimals )
        .split( '.' );
    const number =
        whole.replace( /\B(?=(\d{3})+(?!\d))/g, currency.thousand_separator ) +
        ( fraction ? currency.decimal_separator + fraction : '' );
    const formats: Record< string, string > = {
        left: `${ currency.symbol }${ number }`,
        right: `${ number }${ currency.symbol }`,
        left_space: [ currency.symbol, number ].join( ' ' ),
        right_space: [ number, currency.symbol ].join( ' ' ),
    };

    return (
        ( amount < 0 ? '-' : '' ) +
        ( formats[ currency.position ] ?? formats.left )
    );
}

/**
 * The offer editor's page and fields (PHP `BogoOfferFields`).
 *
 * @since SPSG_VERSION
 */
export function fetchEditor() {
    return apiFetch< OfferEditor >( { path: `${ base() }/editor` } );
}

/** An offer as the REST routes read and take it (raw values). */
export type OfferData = Record< string, unknown >;

/**
 * One offer.
 *
 * @since SPSG_VERSION
 *
 * @param id Offer id.
 */
export function fetchOffer( id: number ) {
    return apiFetch< OfferData >( { path: `${ base() }/${ id }` } );
}

/**
 * Create an offer (`id` null) or change one: an update sends only what
 * changed, merged over the stored offer.
 *
 * @since SPSG_VERSION
 *
 * @param id   Offer id, or null for a new offer.
 * @param data Values.
 *
 * @return The offer as stored.
 */
export function saveOffer( id: number | null, data: OfferData ) {
    return apiFetch< OfferData >( {
        path: id ? `${ base() }/${ id }` : base(),
        method: id ? 'PUT' : 'POST',
        data,
    } );
}

/** A product as the offer preview shows it. */
export interface PreviewProduct {
    id: number;
    name: string;
    image: string;
    /** Current price (sale price when on sale). */
    price: number;
    regular: number;
    categories: string[];
}

interface WcProduct {
    id: number;
    name: string;
    price: string;
    regular_price: string;
    images?: Array< { thumbnail?: string; src: string } >;
    categories?: Array< { name: string } >;
}

/**
 * Products by id, with what the preview shows (price, categories).
 *
 * @since SPSG_VERSION
 *
 * @param ids Product ids.
 */
export async function fetchPreviewProducts(
    ids: number[]
): Promise< PreviewProduct[] > {
    if ( ! ids.length ) {
        return [];
    }

    const products = await apiFetch< WcProduct[] >( {
        path: addQueryArgs( `/${ getAdminData().restNamespace }/products`, {
            include: ids.join( ',' ),
            per_page: ids.length,
            _fields: 'id,name,price,regular_price,images,categories',
        } ),
    } );

    return products.map( ( product ) => {
        const price = Number( product.price ) || 0;

        return {
            id: product.id,
            name: decodeEntities( product.name ),
            image:
                product.images?.[ 0 ]?.thumbnail ??
                product.images?.[ 0 ]?.src ??
                '',
            price,
            regular: Number( product.regular_price ) || price,
            categories: ( product.categories ?? [] ).map( ( category ) => {
                return decodeEntities( category.name );
            } ),
        };
    } );
}
