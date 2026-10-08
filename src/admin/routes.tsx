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
import { Navigate, useModules, useParams } from '@storegrowth/hooks';
import { moduleRoute } from '@storegrowth/utilities';

import DashboardPage from './pages/dashboard';
import ModulesPage from './pages/modules';
import OnboardingPage from './pages/onboarding';
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
    const first =
        modules.find( ( module ) => {
            return module.status;
        } ) ?? modules[ 0 ];

    return (
        <Navigate to={ first ? moduleRoute( first.id ) : '/modules' } replace />
    );
}

/**
 * `/<module-id>`, the module pages' address until ADR-009 (links in 2.2.0,
 * bookmarks, docs; `spsg-settings#/stock-bar` redirects keep the hash), opens
 * that module's page. Anything else opens the dashboard.
 *
 * @since SPSG_VERSION
 */
function LegacyModuleRedirect() {
    const { moduleId = '' } = useParams();
    const { getModule } = useModules();

    return (
        <Navigate
            to={
                getModule( moduleId ) ? moduleRoute( moduleId ) : '/dashboard'
            }
            replace
        />
    );
}

/**
 * Pages every install has. Every module's page is `/settings?module=<id>`
 * (its settings page, or the empty module frame until it has one); the old
 * `/<module-id>` redirects there. A module may add routes of its own (e.g.
 * `/bogo/:id`). Anything else falls through to the dashboard.
 *
 * @since SPSG_VERSION
 */
const coreRoutes: AdminRoute[] = [
    { id: 'home', path: '/', element: <Navigate to="/dashboard" replace /> },
    { id: 'dashboard', path: '/dashboard', element: <DashboardPage /> },
    { id: 'features', path: '/features', element: <FeaturesRedirect /> },
    { id: 'modules', path: '/modules', element: <ModulesPage /> },
    { id: 'settings', path: '/settings', element: <SettingsPage /> },
    // Legacy path, kept: activation and the "Initial Setup" submenu link here.
    { id: 'onboarding', path: '/ini-setup', element: <OnboardingPage /> },
    {
        id: 'legacy-module',
        path: '/:moduleId',
        element: <LegacyModuleRedirect />,
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
