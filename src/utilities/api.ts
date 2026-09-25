/**
 * Typed REST clients for the admin app. All admin data goes through REST
 * (`sales-booster/v1`); `@wordpress/api-fetch` adds the `wp_rest` nonce.
 *
 * @since SPSG_VERSION
 */
import apiFetch from '@wordpress/api-fetch';

import { getAdminData } from './admin-data';

/** Response of `GET /dashboard/overview`. `null` means the value is not tracked yet. */
export interface DashboardOverview {
    total_modules: number;
    active_modules: number;
    revenue: { amount: number; formatted: string } | null;
    templates: number | null;
}

/**
 * Prefix a route with the plugin's REST namespace.
 *
 * @param route Route inside the namespace, starting with a slash.
 *
 * @return Path for apiFetch.
 */
function path( route: string ): string {
    return `/${ getAdminData().restNamespace }${ route }`;
}

/**
 * All modules with their status.
 *
 * @since SPSG_VERSION
 */
export function fetchModules(): Promise< SpsgModule[] > {
    return apiFetch< SpsgModule[] >( { path: path( '/modules' ) } );
}

/**
 * Activate or deactivate one module.
 *
 * @since SPSG_VERSION
 *
 * @param id     Module id.
 * @param status True to activate.
 */
export function updateModuleStatus(
    id: string,
    status: boolean
): Promise< SpsgModule > {
    return apiFetch< SpsgModule >( {
        path: path( `/modules/${ encodeURIComponent( id ) }` ),
        method: 'PATCH',
        data: { status },
    } );
}

/**
 * Activate or deactivate several modules at once.
 *
 * @since SPSG_VERSION
 *
 * @param ids    Module ids.
 * @param status True to activate.
 */
export function updateModulesStatus(
    ids: string[],
    status: boolean
): Promise< SpsgModule[] > {
    return apiFetch< SpsgModule[] >( {
        path: path( '/modules/batch' ),
        method: 'POST',
        data: { ids, status },
    } );
}

/**
 * Dashboard tiles.
 *
 * @since SPSG_VERSION
 */
export function fetchDashboardOverview(): Promise< DashboardOverview > {
    return apiFetch< DashboardOverview >( {
        path: path( '/dashboard/overview' ),
    } );
}

/** Response of `GET|POST /onboarding`. */
/**
 * Mark the onboarding wizard finished, through the existing
 * `spsg_inisetup_flag_update` ajax action (sets `spsg_ini_completion`).
 *
 * @since SPSG_VERSION
 */
export async function completeOnboarding(): Promise< void > {
    const { ajax_url: ajaxUrl, nonce } = getAdminData();

    const response = await window.fetch( ajaxUrl, {
        method: 'POST',
        credentials: 'same-origin',
        body: new URLSearchParams( {
            action: 'spsg_inisetup_flag_update',
            _ajax_nonce: nonce,
            spsg_ini_completion: '1',
        } ),
    } );
    const result = await response.json().catch( () => null );

    if ( ! response.ok || ! result?.success ) {
        throw new Error( typeof result?.data === 'string' ? result.data : '' );
    }
}

/**
 * Human-readable message from an apiFetch error.
 *
 * @since SPSG_VERSION
 *
 * @param error    Thrown value.
 * @param fallback Message when none can be read.
 */
export function errorMessage( error: unknown, fallback: string ): string {
    if (
        error &&
        typeof error === 'object' &&
        'message' in error &&
        typeof ( error as { message: unknown } ).message === 'string'
    ) {
        return ( error as { message: string } ).message;
    }

    return fallback;
}
