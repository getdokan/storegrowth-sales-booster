/**
 * BOGO REST client: the offers route (`sales-booster/v1/bogo/offers`, read
 * through the shared records client), the preview's products and the
 * category messages.
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

/**
 * The offers route: the admin's, or the Dokan vendor's (`/bogo/offers/vendor`,
 * the vendor's own offers).
 *
 * @since SPSG_VERSION
 *
 * @param vendor The Dokan vendor dashboard.
 */
export const offersRoute = ( vendor = false ) => {
    return `/${ getAdminData().restNamespace }/bogo/offers${
        vendor ? '/vendor' : ''
    }`;
};

/**
 * What the offer editor is drawn from (`GET /bogo/offers/editor`, PHP
 * `BogoOfferFields`).
 */
export interface OfferEditor extends RecordEditorData {
    currency: Currency;
    /** The global "Show Regular Price" setting, for the preview. */
    show_regular_price: boolean;
    /**
     * Dokan vendor route only: the vendor may choose Buy X Get X
     * (`vendors_can_create_buy_x_get_x`).
     */
    buy_x_get_x?: boolean;
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
