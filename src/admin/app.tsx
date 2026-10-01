/**
 * Admin app: notices and the routed page (see ./routes.tsx). The header is its
 * own bundle (src/header), mounted by PHP above this app.
 *
 * @since SPSG_VERSION
 */
import { Toaster } from '@wedevs/plugin-ui';
import { useLayoutEffect, useMemo, useRef } from '@wordpress/element';
import { Route, Routes } from '@storegrowth/hooks';

import AdminNotices from './admin-notices';
import { getRoutes } from './routes';
import useAdminSubmenu from './use-admin-submenu';

export default function App() {
    const rootRef = useRef< HTMLDivElement >( null );

    useAdminSubmenu();

    // Read once: module and pro bundles have registered before the app mounts.
    const routes = useMemo( getRoutes, [] );

    // The feature rail sticks below WordPress's toolbar and the plugin header.
    useLayoutEffect( () => {
        const root = rootRef.current;

        if ( ! root ) {
            return;
        }

        const header = document.getElementById( 'spsg-admin-header' );

        const update = () => {
            const adminBar = document.getElementById( 'wpadminbar' );
            const offset =
                ( adminBar?.offsetHeight ?? 0 ) + ( header?.offsetHeight ?? 0 );
            root.style.setProperty( '--spsg-rail-top', `${ offset }px` );
        };

        update();

        if ( ! header ) {
            return;
        }

        const observer = new ResizeObserver( update );
        observer.observe( header );

        return () => observer.disconnect();
    }, [] );

    return (
        <div ref={ rootRef } className="flex w-full flex-col bg-sg-page">
            <AdminNotices />
            <Routes>
                { routes.map( ( route ) => (
                    <Route
                        key={ route.id }
                        path={ route.path }
                        element={ route.element }
                    />
                ) ) }
            </Routes>
            <Toaster position="bottom-right" />
        </div>
    );
}
