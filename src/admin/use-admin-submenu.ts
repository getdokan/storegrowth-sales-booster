/**
 * Keep the WordPress "StoreGrowth" submenu highlight in step with the route.
 *
 * WordPress highlights submenu items by page slug, so every
 * `storegrowth#/…` route would show "Dashboard" as current. This marks the
 * item for the current route instead.
 *
 * @since SPSG_VERSION
 */
import { useEffect } from '@wordpress/element';
import { useLocation } from '@storegrowth/hooks';

/**
 * Submenu href suffix for a route.
 *
 * @param pathname Current route.
 * @param search   Its query string.
 * @param hrefs    Hrefs of the submenu items.
 */
function submenuTarget(
    pathname: string,
    search: string,
    hrefs: string[]
): string {
    const module = new URLSearchParams( search ).get( 'module' );

    // A module's settings page is a feature page.
    if (
        pathname.startsWith( '/settings' ) &&
        module &&
        'general' !== module
    ) {
        return 'page=storegrowth#/features';
    }

    if ( pathname.startsWith( '/dashboard' ) ) {
        return 'page=storegrowth';
    }

    if ( pathname.startsWith( '/ini-setup' ) ) {
        return 'page=storegrowth#/ini-setup';
    }

    if ( pathname.startsWith( '/modules' ) ) {
        return 'page=storegrowth#/modules';
    }

    if ( pathname.startsWith( '/settings' ) ) {
        return 'page=storegrowth#/settings';
    }

    // A route with its own submenu item (e.g. pro's `#/license`).
    const own = `page=storegrowth#${ pathname }`;

    if (
        hrefs.some( ( href ) => {
            return href.endsWith( own );
        } )
    ) {
        return own;
    }

    // Every other route is a feature (module) page.
    return 'page=storegrowth#/features';
}

/**
 * @since SPSG_VERSION
 */
export default function useAdminSubmenu(): void {
    const { pathname, search } = useLocation();

    useEffect( () => {
        const items = document.querySelectorAll< HTMLAnchorElement >(
            '#toplevel_page_sales-booster-for-woocommerce .wp-submenu a'
        );
        const target = submenuTarget(
            pathname,
            search,
            Array.from( items ).map( ( link ) => {
                return link.getAttribute( 'href' ) ?? '';
            } )
        );

        items.forEach( ( link ) => {
            const isCurrent = link.getAttribute( 'href' )?.endsWith( target );

            link.classList.toggle( 'current', !! isCurrent );
            link.parentElement?.classList.toggle( 'current', !! isCurrent );

            if ( isCurrent ) {
                link.setAttribute( 'aria-current', 'page' );
            } else {
                link.removeAttribute( 'aria-current' );
            }
        } );
    }, [ pathname, search ] );
}
