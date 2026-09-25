/**
 * Admin shell: top bar, notices and the routed page (see ./routes.tsx).
 *
 * @since SPSG_VERSION
 */
import { Toaster } from '@wedevs/plugin-ui';
import { useLayoutEffect, useMemo, useRef } from '@wordpress/element';
import { AppTopBar } from '@storegrowth/components';
import { Route, Routes } from '@storegrowth/hooks';

import AdminNotices from './admin-notices';
import { getRoutes } from './routes';

export default function App() {
    const topBarRef = useRef< HTMLDivElement >( null );
    const rootRef = useRef< HTMLDivElement >( null );

    // Read once: module and pro bundles have registered before the app mounts.
    const routes = useMemo( getRoutes, [] );

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

    return (
        <div
            ref={ rootRef }
            className="flex min-h-[calc(100vh-32px)] w-full flex-col bg-sg-page"
        >
            <div ref={ topBarRef } className="sticky top-8 z-[25]">
                <AppTopBar />
            </div>
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
