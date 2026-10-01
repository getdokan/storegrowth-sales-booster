/**
 * REST client for a module's records: rows the admin lists, turns on and
 * off, deletes and edits one at a time (BOGO offers, order bumps). Each
 * takes the records' route, e.g. `/sales-booster/v1/bogo/offers`, whose
 * routes follow one contract: a paged list with `X-WP-Total`,
 * `X-WP-TotalPages` and `X-SPSG-Can-Create`, `/editor`, `/{id}`,
 * `/{id}/status` and `/batch`.
 *
 * @since SPSG_VERSION
 */
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';

import type { SettingField, SettingsPageDefinition } from './api';

/** A record as the REST routes read and take it (raw values). */
export type RecordData = Record< string, unknown >;

/** A page of records. */
export interface RecordPage< T > {
    items: T[];
    totalItems: number;
    totalPages: number;
    /** Lite's limit allows another record (`X-SPSG-Can-Create`). */
    canCreate: boolean;
}

/** What a record editor is drawn from (`GET {route}/editor`). */
export interface RecordEditorData {
    page: SettingsPageDefinition;
    schema: Record< string, SettingField >;
    /** Lite's limit allows a new record. */
    can_create: boolean;
}

/**
 * A page of records.
 *
 * @since SPSG_VERSION
 *
 * @param route          Records route.
 * @param query          Query.
 * @param query.page     Page, from 1.
 * @param query.per_page Rows per page.
 * @param query.search   Name contains.
 */
export async function fetchRecords< T >(
    route: string,
    query: {
        page: number;
        per_page: number;
        search?: string;
    }
): Promise< RecordPage< T > > {
    const response = await apiFetch< Response, false >( {
        path: addQueryArgs( route, query ),
        parse: false,
    } );

    return {
        items: ( await response.json() ) as T[],
        totalItems: Number( response.headers.get( 'X-WP-Total' ) ?? 0 ),
        totalPages: Number( response.headers.get( 'X-WP-TotalPages' ) ?? 0 ),
        canCreate: response.headers.get( 'X-SPSG-Can-Create' ) !== '0',
    };
}

/**
 * Turn a record on or off.
 *
 * @since SPSG_VERSION
 *
 * @param route  Records route.
 * @param id     Record id.
 * @param active On.
 */
export function setRecordStatus( route: string, id: number, active: boolean ) {
    return apiFetch( {
        path: `${ route }/${ id }/status`,
        method: 'POST',
        data: { status: active ? 'yes' : 'no' },
    } );
}

/**
 * Delete records.
 *
 * @since SPSG_VERSION
 *
 * @param route Records route.
 * @param ids   Record ids.
 *
 * @return The ids deleted and those that couldn't be.
 */
export function deleteRecords( route: string, ids: number[] ) {
    return apiFetch< { deleted: number[]; failed: number[] } >( {
        path: `${ route }/batch`,
        method: 'POST',
        data: { delete: ids },
    } );
}

/**
 * The record editor's page, fields and what else the route sends.
 *
 * @since SPSG_VERSION
 *
 * @param route Records route.
 */
export function fetchRecordEditor< E extends RecordEditorData >(
    route: string
) {
    return apiFetch< E >( { path: `${ route }/editor` } );
}

/**
 * One record.
 *
 * @since SPSG_VERSION
 *
 * @param route Records route.
 * @param id    Record id.
 */
export function fetchRecord( route: string, id: number ) {
    return apiFetch< RecordData >( { path: `${ route }/${ id }` } );
}

/**
 * Create a record (`id` null) or change one: an update sends only what
 * changed, merged over the stored record.
 *
 * @since SPSG_VERSION
 *
 * @param route Records route.
 * @param id    Record id, or null for a new record.
 * @param data  Values.
 *
 * @return The record as stored.
 */
export function saveRecord(
    route: string,
    id: number | null,
    data: RecordData
) {
    return apiFetch< RecordData >( {
        path: id ? `${ route }/${ id }` : route,
        method: id ? 'PUT' : 'POST',
        data,
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

/**
 * A price format until the store's loads.
 *
 * @since SPSG_VERSION
 */
export const NO_CURRENCY: Currency = {
    symbol: '',
    position: 'left',
    decimals: 2,
    decimal_separator: '.',
    thousand_separator: ',',
};

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
    // A no-break space, as `wc_price()` (the price never wraps).
    const formats: Record< string, string > = {
        left: `${ currency.symbol }${ number }`,
        right: `${ number }${ currency.symbol }`,
        left_space: [ currency.symbol, number ].join( ' ' ),
        right_space: [ number, currency.symbol ].join( ' ' ),
    };

    return (
        ( amount < 0 ? '-' : '' ) +
        ( formats[ currency.position ] ?? formats.left )
    );
}
