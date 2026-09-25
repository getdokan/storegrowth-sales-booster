/**
 * Typed REST clients for the admin app. All admin data goes through REST
 * (`sales-booster/v1`); `@wordpress/api-fetch` adds the `wp_rest` nonce.
 *
 * @since SPSG_VERSION
 */
import apiFetch from '@wordpress/api-fetch';

import { getAdminData } from './admin-data';
import { ajax } from './ajax';

/** Response of `GET /dashboard/overview`. `null` means the value is not tracked yet. */
export interface DashboardOverview {
    total_modules: number;
    active_modules: number;
    revenue: { amount: number; formatted: string } | null;
    templates: number | null;
}

/** Setting value in API shape. */
export type SettingValue = string | number | boolean;

/** One field of a module's settings schema (PHP `SettingsSchema`). */
export interface SettingField {
    type: 'text' | 'textarea' | 'number' | 'toggle' | 'color' | 'select';
    default: SettingValue;
    /** Saved only while pro is active. */
    pro: boolean;
    min?: number;
    max?: number;
    step?: number;
    /** Allowed values of a `select`. */
    options?: string[];
}

/** Response of `GET|POST /settings/{module}`. */
export interface ModuleSettingsResponse< V = Record< string, SettingValue > > {
    schema: Partial< Record< keyof V, SettingField > >;
    values: V;
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
 * A module's settings schema and values.
 *
 * @since SPSG_VERSION
 *
 * @param moduleId Module id, e.g. `stock-bar`.
 */
export function fetchModuleSettings< V = Record< string, SettingValue > >(
    moduleId: string
): Promise< ModuleSettingsResponse< V > > {
    return apiFetch< ModuleSettingsResponse< V > >( {
        path: path( `/settings/${ encodeURIComponent( moduleId ) }` ),
    } );
}

/**
 * Save some or all of a module's settings. Rejects with `params` (field →
 * message) when a value is invalid; nothing is saved then.
 *
 * @since SPSG_VERSION
 *
 * @param moduleId Module id.
 * @param values   Values to save, keyed by setting key.
 */
export function saveModuleSettings< V = Record< string, SettingValue > >(
    moduleId: string,
    values: Partial< V >
): Promise< ModuleSettingsResponse< V > > {
    return apiFetch< ModuleSettingsResponse< V > >( {
        path: path( `/settings/${ encodeURIComponent( moduleId ) }` ),
        method: 'POST',
        data: { values },
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

/**
 * Mark the onboarding wizard finished, through the existing
 * `spsg_inisetup_flag_update` ajax action (sets `spsg_ini_completion`).
 *
 * @since SPSG_VERSION
 */
export async function completeOnboarding(): Promise< void > {
    await ajax( 'spsg_inisetup_flag_update', { spsg_ini_completion: true } );
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
