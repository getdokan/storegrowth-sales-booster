/**
 * The admin route table (react-router, hash history).
 *
 * Core pages and module pages live in one table. Module, integration and pro
 * bundles add theirs through the `storegrowth.admin.routes` JS filter:
 *
 *     import { addFilter } from '@wordpress/hooks';
 *
 *     addFilter( 'storegrowth.admin.routes', 'storegrowth/stock-bar', ( routes ) => [
 *         ...routes,
 *         { id: 'stock-bar', path: '/stock-bar', element: <StockBarPage /> },
 *         // Nested pages: path '/bogo/*' and a <Routes> inside the element,
 *         // or separate entries such as '/bogo/new' and '/bogo/:id'.
 *     ] );
 *
 * Paths use react-router syntax. Import router APIs (useNavigate, useParams,
 * Link, …) from `@storegrowth/hooks`, never from `react-router-dom`.
 *
 * @since SPSG_VERSION
 */
import { applyFilters } from '@wordpress/hooks';
import type { ReactNode } from 'react';
import { Navigate, useModules } from '@storegrowth/hooks';

import DashboardPage from './pages/dashboard';
import ModulePendingPage from './pages/module-pending';
import ModulesPage from './pages/modules';
import SettingsPage from './pages/settings';

export interface AdminRoute {
    /** Unique id, so a later filter can replace or remove a route. */
    id: string;
    /** react-router path, e.g. `/stock-bar`, `/bogo/:id`, `/bogo/*`. */
    path: string;
    element: ReactNode;
}

/**
 * `/features` opens the first active module (the first module when none is
 * active), as the WordPress "Features" submenu does in the design.
 *
 * @since SPSG_VERSION
 */
function FeaturesRedirect() {
    const { modules } = useModules();
    const first = modules.find( ( module ) => module.status ) ?? modules[ 0 ];

    return <Navigate to={ first ? `/${ first.id }` : '/modules' } replace />;
}

/**
 * Pages every install has. Module pages registered through the filter take
 * precedence over the `/:moduleId` placeholder because react-router ranks
 * static paths above dynamic ones.
 *
 * @since SPSG_VERSION
 */
const coreRoutes: AdminRoute[] = [
    { id: 'home', path: '/', element: <Navigate to="/dashboard" replace /> },
    { id: 'dashboard', path: '/dashboard', element: <DashboardPage /> },
    { id: 'features', path: '/features', element: <FeaturesRedirect /> },
    { id: 'modules', path: '/modules', element: <ModulesPage /> },
    { id: 'settings', path: '/settings', element: <SettingsPage /> },
    // Feature page for a module that hasn't registered its own page yet.
    {
        id: 'module-pending',
        path: '/:moduleId',
        element: <ModulePendingPage />,
    },
    {
        id: 'not-found',
        path: '*',
        element: <Navigate to="/dashboard" replace />,
    },
];

/**
 * All routes: core plus whatever module, integration and pro bundles added.
 *
 * @since SPSG_VERSION
 */
export function getRoutes(): AdminRoute[] {
    /**
     * Admin routes. Add, replace (same `id`) or remove entries.
     *
     * @since SPSG_VERSION
     *
     * @param {AdminRoute[]} routes Core routes.
     */
    const routes = applyFilters( 'storegrowth.admin.routes', [
        ...coreRoutes,
    ] );

    return Array.isArray( routes ) ? ( routes as AdminRoute[] ) : coreRoutes;
}
