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
        | 'list'
        | 'url'
        | 'date';
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
    /** `number`: `''` is a valid "not set" value. */
    allow_empty?: boolean;

    // Fields an extension adds (`spsg_settings_schema`): where and how the
    // settings page draws them.
    /** Page tab it shows on, e.g. `configure`. */
    tab?: string;
    label?: string;
    help?: string;
    /** Custom control (`storegrowth_settings_{variant}_field`). */
    variant?: string;
    /** Option value → label. */
    labels?: Record< string, string >;
    placeholder?: string;
    prefix?: string;
    suffix?: string;
    /** Order within the tab (lower first). */
    priority?: number;
    /** Section (accordion) of the tab, on a page drawn from the schema. */
    section?: string;
    /** Control locked without pro; the value is still saved (presets). */
    pro_ui?: boolean;
    /** Shown only while these keys have these values. */
    show_when?: ShowWhen;
    /** Saved with its tab, not drawn (written by a preset or another control). */
    hidden?: boolean;
    /** `half`: sits beside the next half-width field. */
    width?: 'half';
    /** Options offered only with pro (or while stored). */
    pro_options?: string[];
    /** Option value → info tip beside it (`radio`). */
    option_help?: Record< string, string >;
    /** `textarea`: visible lines. */
    rows?: number;
    /** `text`: longest text that can be typed. */
    max_length?: number;
    /** Accessible name when the label repeats on the page (`box`, `alignment`). */
    name?: string;
}

/**
 * Condition on other settings: key → the value it must have, or a list of
 * allowed values. Every key must match.
 *
 * @since SPSG_VERSION
 */
export type ShowWhen = Record< string, SettingValue | SettingValue[] >;

/**
 * A section (accordion) of a settings page, keyed by id in drawing order.
 *
 * @since SPSG_VERSION
 */
export type SettingsSections = Record<
    string,
    {
        title: string;
        help?: string;
        /** Shown only while these keys have these values. */
        show_when?: ShowWhen;
        /** Switch field drawn in the header; body shows while on. */
        toggle?: string;
        /** Text beside the header switch (default "Show"). */
        toggle_label?: string;
        /** With `toggle`: a switch card (`OptionCard`), not an accordion. */
        card?: boolean;
        /** Accordion starts closed. */
        collapsed?: boolean;
    }
>;

/**
 * A settings page as the backend defines it (PHP `SettingsPage`): title and
 * tabs with their sections, keyed by id in drawing order. A page without
 * `tabs` draws its fields that have no `tab` (and the page's own `sections`)
 * under the title. Empty (`{}`) for a schema without a page.
 *
 * @since SPSG_VERSION
 */
export interface SettingsPageDefinition {
    title?: string;
    tabs?: Record<
        string,
        {
            label: string;
            sections?: SettingsSections;
        }
    >;
    /** Sections of a page without tabs. */
    sections?: SettingsSections;
    /** Links beside the title to other pages of the app, e.g. an extension's page. */
    links?: Array< { label: string; route: string } >;
    /** A page that isn't a module's: the module whose frame (rail) it sits in. */
    module?: string;
}

/** A product as the pickers show it. */
export interface ProductOption {
    id: number;
    name: string;
    /** Thumbnail URL, or empty. */
    image?: string;
    /** WooCommerce type: `simple`, `variable`, `variation`, … */
    type?: string;
}

/** Response of `GET|POST /settings/{module}`. */
export interface ModuleSettingsResponse< V = Record< string, SettingValue > > {
    /** The page the backend defines for it; empty when it has none. */
    page: SettingsPageDefinition;
    schema: Partial< Record< keyof V, SettingField > >;
    values: V;
    /** False while a gated module's settings were never saved. */
    published: boolean;
}

/** Response of `GET /admin/settings`: every settings page, keyed by id. */
export type SettingsPagesResponse = Record< string, ModuleSettingsResponse >;

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

let settingsPages: Promise< SettingsPagesResponse > | null = null;

/**
 * Every settings page with its schema and values, in one request
 * (`GET /admin/settings`). Fetched once per page load and shared; a save
 * updates the shared copy.
 *
 * @since SPSG_VERSION
 */
export function fetchSettingsPages(): Promise< SettingsPagesResponse > {
    if ( ! settingsPages ) {
        settingsPages = apiFetch< SettingsPagesResponse >( {
            path: path( '/admin/settings' ),
        } ).catch( ( error ) => {
            // Let the next caller try again.
            settingsPages = null;
            throw error;
        } );
    }

    return settingsPages;
}

/**
 * A module's settings schema and values: from the shared settings pages
 * when it has one, else its own request.
 *
 * @since SPSG_VERSION
 *
 * @param moduleId Module id, e.g. `stock-bar`.
 */
export async function fetchModuleSettings< V = Record< string, SettingValue > >(
    moduleId: string
): Promise< ModuleSettingsResponse< V > > {
    const pages = await fetchSettingsPages().catch( () => {
        return null;
    } );
    const page = pages?.[ moduleId ];

    if ( page ) {
        return page as unknown as ModuleSettingsResponse< V >;
    }

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
export async function saveModuleSettings< V = Record< string, SettingValue > >(
    moduleId: string,
    values: Partial< V >
): Promise< ModuleSettingsResponse< V > > {
    const response = await apiFetch< ModuleSettingsResponse< V > >( {
        path: path( `/settings/${ encodeURIComponent( moduleId ) }` ),
        method: 'POST',
        data: { values },
    } );

    // Keep the shared pages current, so the page opens saved values again.
    settingsPages?.then( ( pages ) => {
        if ( pages[ moduleId ] ) {
            pages[ moduleId ] = response as unknown as ModuleSettingsResponse;
        }
    } );

    return response;
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
    type: product.type,
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

    const byId = new Map(
        terms.map( ( term ) => {
            return [ term.id, term ];
        } )
    );
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
