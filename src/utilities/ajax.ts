/**
 * admin-ajax client for the legacy `wp_ajax_spsg_*` actions that have no REST
 * route (ADR-004 keeps them). New features use REST (./api.ts). Rules:
 * docs/adr/ADR-006-admin-ajax-client.md.
 *
 * @since SPSG_VERSION
 */
import apiFetch from '@wordpress/api-fetch';
import { __ } from '@wordpress/i18n';

import { getAdminData } from './admin-data';

/** Reply of `wp_send_json_success()` / `wp_send_json_error()`. */
interface AjaxResponse< T > {
    success: boolean;
    data?: T;
}

/** Values admin-ajax receives as form fields. */
export type AjaxParams = Record< string, string | number | boolean >;

/**
 * Call an admin-ajax action with the shared `spsg_ajax_nonce`.
 *
 * Resolves with the `data` of a success reply; rejects with an `Error`
 * whose message is the error reply's `data` when that is a string.
 *
 * @since SPSG_VERSION
 *
 * @param action Ajax action, e.g. `spsg_inisetup_flag_update`.
 * @param params Extra form fields.
 *
 * @return The reply's `data`.
 */
export async function ajax< T = unknown >(
    action: string,
    params: AjaxParams = {}
): Promise< T > {
    const { ajax_url: ajaxUrl, nonce } = getAdminData();

    const body = new URLSearchParams( { action, _ajax_nonce: nonce } );

    Object.entries( params ).forEach( ( [ key, value ] ) => {
        // PHP reads booleans as '1' / ''.
        let field = String( value );
        if ( typeof value === 'boolean' ) {
            field = value ? '1' : '';
        }
        body.append( key, field );
    } );

    let result: ( AjaxResponse< T > & { message?: string } ) | undefined;

    try {
        result = await apiFetch< AjaxResponse< T > >( {
            url: ajaxUrl,
            method: 'POST',
            body,
        } );
    } catch ( error ) {
        // A 4xx reply still carries the `wp_send_json_error()` body. A failed
        // nonce or capability check answers a bare `-1` / `0` instead.
        if ( typeof error !== 'object' || error === null ) {
            throw new Error(
                __(
                    'The request was refused. Reload the page and try again.',
                    'storegrowth-sales-booster'
                )
            );
        }
        result = error as AjaxResponse< T > & { message?: string };
    }

    if ( ! result?.success ) {
        const message =
            typeof result?.data === 'string' ? result.data : result?.message;
        throw new Error( message ?? '' );
    }

    return result.data as T;
}
