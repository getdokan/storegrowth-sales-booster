/**
 * Minimal hash router for the admin app (`admin.php?page=spsg-settings#/modules`).
 *
 * @since SPSG_VERSION
 */
import { useEffect, useState } from '@wordpress/element';

/**
 * Current route from the location hash, always starting with a slash.
 *
 * @since SPSG_VERSION
 */
export function currentRoute(): string {
    const hash = window.location.hash.replace( /^#/, '' );

    return hash.startsWith( '/' ) ? hash : `/${ hash }`;
}

/**
 * Go to a route.
 *
 * @since SPSG_VERSION
 *
 * @param route Route starting with a slash, e.g. `/modules`.
 */
export function navigate( route: string ): void {
    window.location.hash = route;
}

/**
 * The current route, re-rendering on hash changes.
 *
 * @since SPSG_VERSION
 */
export function useHashRoute(): string {
    const [ route, setRoute ] = useState( currentRoute );

    useEffect( () => {
        const onChange = () => setRoute( currentRoute() );

        window.addEventListener( 'hashchange', onChange );

        return () => window.removeEventListener( 'hashchange', onChange );
    }, [] );

    return route;
}
