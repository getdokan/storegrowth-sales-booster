/**
 * Template colours and font names from PHP (`Helper::TEMPLATES`,
 * `Helper::FONT_FAMILIES`, printed by `AdminPage`), so the admin and the
 * storefront use one list.
 *
 * @since SPSG_VERSION
 */
import type { CountdownTimerValues } from './types';

interface CountdownData {
    /** Template id → setting key → colour. */
    templates: Record< string, Partial< Record< string, string > > >;
    /** Stored font slug → CSS family. */
    fonts: Record< string, string >;
}

declare global {
    interface Window {
        spsgCountdownTimer?: CountdownData;
    }
}

const DATA: CountdownData = window.spsgCountdownTimer ?? {
    templates: {},
    fonts: {},
};

export const FONT_FAMILIES = DATA.fonts;

/**
 * CSS family of a stored font slug.
 *
 * @since SPSG_VERSION
 *
 * @param slug Stored font.
 */
export const fontFamily = ( slug: string ) => FONT_FAMILIES[ slug ] ?? slug;

/**
 * The settings a template sets; unknown ids get the first old layout's.
 *
 * @since SPSG_VERSION
 *
 * @param id Template id.
 */
export function templateColors( id: string ): Partial< CountdownTimerValues > {
    return DATA.templates[ id ] ?? DATA.templates[ 'ct-layout-1' ] ?? {};
}

/**
 * Only the counter colours of a template (what the old layouts set).
 *
 * @since SPSG_VERSION
 *
 * @param id Template id.
 */
export function counterColors( id: string ): Partial< CountdownTimerValues > {
    const counterKeys = Object.keys( templateColors( 'ct-layout-1' ) );

    return Object.fromEntries(
        Object.entries( templateColors( id ) ).filter( ( [ key ] ) =>
            counterKeys.includes( key )
        )
    );
}
