/**
 * Admin shell: top bar plus the current route.
 *
 * Routes: `/dashboard` (default), `/modules`, `/settings`, `/features` (first
 * module), `/<module-id>` and anything a module bundle registers through the
 * `storegrowth.admin.routes` filter. Legacy hashes such as
 * `#/dashboard/overview` still land on the right page.
 *
 * @since SPSG_VERSION
 */
import { Toaster } from '@wedevs/plugin-ui';
import {
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
} from '@wordpress/element';
import { AppTopBar } from '@storegrowth/components';
import { navigate, useHashRoute, useModules } from '@storegrowth/hooks';

import AdminNotices from './admin-notices';
import DashboardPage from './pages/dashboard';
import ModulePendingPage from './pages/module-pending';
import ModulesPage from './pages/modules';
import SettingsPage from './pages/settings';
import { matchRoute, registeredRoutes } from './routes';

/** Legacy (antd admin) hashes → new routes. */
const LEGACY_ROUTES: Record< string, string > = {
    '/': '/dashboard',
    '/dashboard/overview': '/dashboard',
    '/dashboard/faq': '/dashboard',
    '/advanced': '/settings',
};

export default function App() {
    const route = useHashRoute();
    const { modules } = useModules();
    const topBarRef = useRef< HTMLDivElement >( null );
    const rootRef = useRef< HTMLDivElement >( null );
    const routes = useMemo( registeredRoutes, [] );

    // Redirect legacy hashes and the "Features" entry point.
    useEffect( () => {
        if ( LEGACY_ROUTES[ route ] ) {
            navigate( LEGACY_ROUTES[ route ] );
        } else if ( route === '/features' && modules.length ) {
            const first =
                modules.find( ( module ) => module.status ) ?? modules[ 0 ];
            navigate( `/${ first.id }` );
        }
    }, [ route, modules ] );

    // The feature rail sticks below WordPress's toolbar and our top bar.
    useLayoutEffect( () => {
        const topBar = topBarRef.current;
        const root = rootRef.current;

        if ( ! topBar || ! root ) {
            return;
        }

        const update = () => {
            const adminBar = document.getElementById( 'wpadminbar' );
            const offset =
                ( adminBar?.offsetHeight ?? 0 ) + topBar.offsetHeight;
            root.style.setProperty( '--spsg-rail-top', `${ offset }px` );
        };

        update();

        const observer = new ResizeObserver( update );
        observer.observe( topBar );

        return () => observer.disconnect();
    }, [] );

    let page = null;
    const registered = matchRoute( routes, route );

    if ( registered ) {
        const Page = registered.component;
        page = <Page route={ route } />;
    } else if ( route === '/dashboard' ) {
        page = <DashboardPage />;
    } else if ( route === '/modules' ) {
        page = <ModulesPage />;
    } else if ( route === '/settings' ) {
        page = <SettingsPage />;
    } else {
        const moduleId = route.split( '/' )[ 1 ] ?? '';

        if ( modules.some( ( module ) => module.id === moduleId ) ) {
            page = <ModulePendingPage moduleId={ moduleId } />;
        } else if ( ! LEGACY_ROUTES[ route ] && route !== '/features' ) {
            page = <DashboardPage />;
        }
    }

    return (
        <div
            ref={ rootRef }
            className="flex min-h-[calc(100vh-32px)] w-full flex-col bg-sg-page"
        >
            <div ref={ topBarRef } className="sticky top-8 z-[25]">
                <AppTopBar />
            </div>
            <AdminNotices />
            { page }
            <Toaster position="bottom-right" />
        </div>
    );
}
