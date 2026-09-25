/**
 * Keep the WordPress "StoreGrowth" submenu highlight in step with the route.
 *
 * WordPress highlights submenu items by page slug, so every
 * `spsg-settings#/…` route would show "Settings" as current. This marks the
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
        return 'page=spsg-settings#/dashboard';
    }

    if ( pathname.startsWith( '/ini-setup' ) ) {
        return 'page=spsg-modules#/ini-setup';
    }

    if ( pathname.startsWith( '/modules' ) ) {
        return 'page=spsg-modules';
    }

    if ( pathname.startsWith( '/settings' ) ) {
        return 'page=spsg-settings';
    }

    // Every other route is a feature (module) page.
    return 'page=spsg-settings#/features';
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
