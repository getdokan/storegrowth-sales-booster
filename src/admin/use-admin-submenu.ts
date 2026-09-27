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
 */
function submenuTarget( pathname: string ): string {
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

    // Every other route is a feature (module) page.
    return 'page=storegrowth#/features';
}

/**
 * @since SPSG_VERSION
 */
export default function useAdminSubmenu(): void {
    const { pathname } = useLocation();

    useEffect( () => {
        const items = document.querySelectorAll< HTMLAnchorElement >(
            '#toplevel_page_sales-booster-for-woocommerce .wp-submenu a'
        );
        const target = submenuTarget( pathname );

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
    }, [ pathname ] );
}
