/**
 * Route registry. Module bundles add their page through the
 * `storegrowth.admin.routes` JS filter:
 *
 *     addFilter( 'storegrowth.admin.routes', 'storegrowth/stock-bar', ( routes ) => [
 *         ...routes,
 *         { path: '/stock-bar', component: StockBarPage },
 *     ] );
 *
 * @since SPSG_VERSION
 */
import { applyFilters } from '@wordpress/hooks';
import type { ComponentType } from 'react';

export interface AdminRoute {
    /** Exact path, e.g. `/stock-bar`, or a prefix ending in `/*`, e.g. `/bogo/*`. */
    path: string;
    component: ComponentType< { route: string } >;
}

/**
 * Routes registered by module and pro bundles.
 *
 * @since SPSG_VERSION
 */
export function registeredRoutes(): AdminRoute[] {
    /**
     * Admin routes added by module, integration and pro bundles.
     *
     * @since SPSG_VERSION
     *
     * @param {AdminRoute[]} routes Registered routes.
     */
    const routes = applyFilters( 'storegrowth.admin.routes', [] );

    return Array.isArray( routes ) ? ( routes as AdminRoute[] ) : [];
}

/**
 * First registered route matching a path.
 *
 * @since SPSG_VERSION
 *
 * @param routes Registered routes.
 * @param route  Current path.
 */
export function matchRoute(
    routes: AdminRoute[],
    route: string
): AdminRoute | undefined {
    return routes.find( ( candidate ) =>
        candidate.path.endsWith( '/*' )
            ? route === candidate.path.slice( 0, -2 ) ||
              route.startsWith( candidate.path.slice( 0, -1 ) )
            : route === candidate.path
    );
}
