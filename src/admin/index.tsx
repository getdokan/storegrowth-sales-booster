/**
 * Entry point of the StoreGrowth admin app. Mounts into `#spsg-admin-app`
 * on the StoreGrowth admin pages.
 *
 * Mounted on DOM ready, after every module and pro bundle has run, so the
 * routes they add through `storegrowth.admin.routes` are registered first.
 *
 * @since SPSG_VERSION
 */
import { ThemeProvider } from '@wedevs/plugin-ui';
import domReady from '@wordpress/dom-ready';
import { createRoot } from '@wordpress/element';
import { HashRouter, ModulesProvider } from '@storegrowth/hooks';

import App from './app';
import { storegrowthTheme } from './theme';

domReady( () => {
    const container = document.getElementById( 'spsg-admin-app' );

    if ( ! container ) {
        return;
    }

    // Each admin page opens on its own route when the URL carries no hash.
    if ( ! window.location.hash && container.dataset.defaultRoute ) {
        window.history.replaceState(
            null,
            '',
            `#${ container.dataset.defaultRoute }`
        );
    }

    createRoot( container ).render(
        <ThemeProvider
            pluginId="storegrowth"
            className="spsg-layout"
            tokens={ storegrowthTheme }
            mode="light"
            storageKey={ false }
        >
            <ModulesProvider>
                <HashRouter>
                    <App />
                </HashRouter>
            </ModulesProvider>
        </ThemeProvider>
    );
} );
