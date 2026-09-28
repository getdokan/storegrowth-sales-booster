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

/**
 * The offers route: the admin's, or the Dokan vendor's (`/bogo/offers/vendor`,
 * the vendor's own offers).
 *
 * @since SPSG_VERSION
 *
 * @param vendor The Dokan vendor dashboard.
 */
const base = ( vendor = false ) => {
    return `/${ getAdminData().restNamespace }/bogo/offers${
        vendor ? '/vendor' : ''
    }`;
};

/**
 * A page of offers.
 *
 * @since SPSG_VERSION
 *
 * @param query          Query.
 * @param query.page     Page, from 1.
 * @param query.per_page Rows per page.
 * @param query.search   Name contains.
 * @param vendor         The Dokan vendor's offers.
 */
export async function fetchOffers(
    query: {
        page: number;
        per_page: number;
        search?: string;
    },
    vendor = false
): Promise< OfferPage > {
    const response = await apiFetch< Response, false >( {
        path: addQueryArgs( base( vendor ), query ),
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
 * @param vendor The Dokan vendor's offer.
 */
export function setOfferStatus( id: number, active: boolean, vendor = false ) {
    return apiFetch( {
        path: `${ base( vendor ) }/${ id }/status`,
        method: 'POST',
        data: { status: active ? 'yes' : 'no' },
    } );
}

/**
 * Delete offers.
 *
 * @since SPSG_VERSION
 *
 * @param ids    Offer ids.
 * @param vendor The Dokan vendor's offers.
 *
 * @return The ids deleted and those that couldn't be.
 */
export function deleteOffers( ids: number[], vendor = false ) {
    return apiFetch< { deleted: number[]; failed: number[] } >( {
        path: `${ base( vendor ) }/batch`,
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
    /** The global "Show Regular Price" setting, for the preview. */
    show_regular_price: boolean;
    /**
     * Dokan vendor route only: the vendor may choose Buy X Get X
     * (`vendors_can_create_buy_x_get_x`).
     */
    buy_x_get_x?: boolean;
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
 *
 * @param vendor The Dokan vendor's route.
 */
export function fetchEditor( vendor = false ) {
    return apiFetch< OfferEditor >( { path: `${ base( vendor ) }/editor` } );
}

/** An offer as the REST routes read and take it (raw values). */
export type OfferData = Record< string, unknown >;

/**
 * One offer.
 *
 * @since SPSG_VERSION
 *
 * @param id     Offer id.
 * @param vendor The Dokan vendor's offer.
 */
export function fetchOffer( id: number, vendor = false ) {
    return apiFetch< OfferData >( { path: `${ base( vendor ) }/${ id }` } );
}

/**
 * Create an offer (`id` null) or change one: an update sends only what
 * changed, merged over the stored offer.
 *
 * @since SPSG_VERSION
 *
 * @param id     Offer id, or null for a new offer.
 * @param data   Values.
 * @param vendor The Dokan vendor's offer.
 *
 * @return The offer as stored.
 */
export function saveOffer(
    id: number | null,
    data: OfferData,
    vendor = false
) {
    return apiFetch< OfferData >( {
        path: id ? `${ base( vendor ) }/${ id }` : base( vendor ),
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

/**
 * A category page message (`sales-booster/v1/bogo/category-messages`).
 *
 * @since SPSG_VERSION
 */
export interface CategoryMessage {
    /** Category (term) id. */
    id: number;
    /** Category name; null when the category was deleted. */
    name: string | null;
    message: string;
    /** Shown on the category page. */
    status: boolean;
}

/**
 * The category messages route.
 *
 * @since SPSG_VERSION
 */
const messagesBase = () => {
    return `/${ getAdminData().restNamespace }/bogo/category-messages`;
};

/**
 * Every category message.
 *
 * @since SPSG_VERSION
 */
export function fetchCategoryMessages() {
    return apiFetch< CategoryMessage[] >( { path: messagesBase() } );
}

/**
 * Add a category's message (`id` null) or change one (pro).
 *
 * @since SPSG_VERSION
 *
 * @param id            Category id of the message to change, or null.
 * @param data          Values.
 * @param data.category Category id (a change moves the message).
 * @param data.message  Message.
 */
export function saveCategoryMessage(
    id: number | null,
    data: { category: number; message: string }
) {
    return apiFetch< CategoryMessage >( {
        path: id ? `${ messagesBase() }/${ id }` : messagesBase(),
        method: id ? 'PUT' : 'POST',
        data,
    } );
}

/**
 * Show or hide a category's message (pro).
 *
 * @since SPSG_VERSION
 *
 * @param id     Category id.
 * @param active Shown.
 */
export function setCategoryMessageStatus( id: number, active: boolean ) {
    return apiFetch< CategoryMessage >( {
        path: `${ messagesBase() }/${ id }`,
        method: 'PATCH',
        data: { status: active },
    } );
}

/**
 * Delete a category's message (pro).
 *
 * @since SPSG_VERSION
 *
 * @param id Category id.
 */
export function deleteCategoryMessage( id: number ) {
    return apiFetch( {
        path: `${ messagesBase() }/${ id }`,
        method: 'DELETE',
    } );
}

/**
 * Every product category (WordPress `wp/v2/product_cat`), a child labelled
 * with its parents ("Parent › Child"), sorted by label.
 *
 * @since SPSG_VERSION
 */
export async function fetchProductCategories(): Promise<
    Array< { value: string; label: string } >
> {
    const terms: Array< { id: number; name: string; parent: number } > = [];

    for ( let page = 1, pages = 1; page <= pages; page++ ) {
        const response = await apiFetch< Response, false >( {
            path: addQueryArgs( '/wp/v2/product_cat', {
                per_page: 100,
                page,
                _fields: 'id,name,parent',
            } ),
            parse: false,
        } );

        pages = Number( response.headers.get( 'X-WP-TotalPages' ) ?? 1 );
        terms.push( ...( await response.json() ) );
    }

    const byId = new Map( terms.map( ( term ) => [ term.id, term ] ) );
    const label = ( id: number, depth = 0 ): string => {
        const term = byId.get( id );
        if ( ! term ) {
            return '';
        }
        const name = decodeEntities( term.name );
        // Depth guards against a parent loop.
        return term.parent && depth < 10
            ? [ label( term.parent, depth + 1 ), name ]
                  .filter( Boolean )
                  .join( ' › ' )
            : name;
    };

    return terms
        .map( ( term ) => {
            return { value: String( term.id ), label: label( term.id ) };
        } )
        .sort( ( a, b ) => {
            return a.label.localeCompare( b.label );
        } );
}
