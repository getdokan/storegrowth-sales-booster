/**
 * Typed REST clients for the admin app. All admin data goes through REST
 * (`sales-booster/v1`); `@wordpress/api-fetch` adds the `wp_rest` nonce.
 *
 * @since SPSG_VERSION
 */
import apiFetch from '@wordpress/api-fetch';
import { decodeEntities } from '@wordpress/html-entities';
import { addQueryArgs } from '@wordpress/url';

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
/** Margin/padding value of a `box` field. */
export interface BoxValue {
    top: number;
    right: number;
    bottom: number;
    left: number;
}

/** Value of a `list` field: product ids, names, page conditions, … */
export type ListValue = Array< string | number >;

export type SettingValue = string | number | boolean | BoxValue | ListValue;

/** One field of a module's settings schema (PHP `SettingsSchema`). */
export interface SettingField {
    type:
        | 'text'
        | 'textarea'
        | 'number'
        | 'toggle'
        | 'color'
        | 'select'
        | 'box'
        | 'list';
    default: SettingValue;
    /** Saved only while pro is active. */
    pro: boolean;
    min?: number;
    max?: number;
    step?: number;
    /** Allowed values of a `select` or `list`. */
    options?: string[];
    /** `list`: item type. */
    item?: 'int' | 'text';
    /** `list`: most items allowed now (the lite cap without pro). */
    max_items?: number;
}

/** A product as the pickers show it. */
export interface ProductOption {
    id: number;
    name: string;
    /** Thumbnail URL, or empty. */
    image?: string;
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

interface WcProduct {
    id: number;
    name: string;
    type?: string;
    images?: Array< { src: string } >;
}

const toOption = ( product: WcProduct ): ProductOption => ( {
    id: product.id,
    name: decodeEntities( product.name ),
    image: product.images?.[ 0 ]?.src ?? '',
} );

/**
 * Search published products by name (`GET /products?search`), external
 * products left out.
 *
 * @since SPSG_VERSION
 *
 * @param search Search text.
 * @param limit  Most results.
 */
export async function searchProducts(
    search: string,
    limit = 20
): Promise< ProductOption[] > {
    const products = await apiFetch< WcProduct[] >( {
        path: addQueryArgs( path( '/products' ), {
            search,
            per_page: limit,
            status: 'publish',
            _fields: 'id,name,type,images',
        } ),
    } );

    return products
        .filter( ( product ) => product.type !== 'external' )
        .map( toOption );
}

/**
 * Products by id, e.g. to show the names of saved ids.
 *
 * @since SPSG_VERSION
 *
 * @param ids Product ids.
 */
export async function fetchProductsByIds(
    ids: number[]
): Promise< ProductOption[] > {
    if ( ! ids.length ) {
        return [];
    }

    const products = await apiFetch< WcProduct[] >( {
        path: addQueryArgs( path( '/products' ), {
            include: ids.join( ',' ),
            per_page: ids.length,
            _fields: 'id,name,type,images',
        } ),
    } );

    return products.map( toOption );
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
