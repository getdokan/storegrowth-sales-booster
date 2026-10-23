/**
 * Entry point of the StoreGrowth admin app. Mounts into `#spsg-admin-app`
 * on the StoreGrowth admin pages.
 *
 * Mounted on DOM ready, after every module and pro bundle has run, so the
 * routes they add through `storegrowth.admin.routes` are registered first.
 *
 * @since 3.0.0
 */
import { ThemeProvider } from '@wedevs/plugin-ui';
import domReady from '@wordpress/dom-ready';
import { createRoot } from '@wordpress/element';
import { HashRouter, ModulesProvider } from '@storegrowth/hooks';

import App from './app';
import { storegrowthTheme } from './theme';

/**
 * WordPress's skip links ("Skip to main content", "Skip to toolbar") jump by
 * setting the hash (`#wpbody-content`), which the hash router reads as a
 * route and replaces the page with the Dashboard. Move focus to the target
 * instead and leave the hash alone.
 *
 * @since SPSG_VERSION
 *
 * @param {MouseEvent} event Click anywhere on the page.
 */
const keepRouteOnSkipLink = ( event: MouseEvent ) => {
    const link = ( event.target as Element | null )?.closest?.(
        'a.screen-reader-shortcut[href^="#"]'
    );
    const target = link
        ? document.getElementById(
              ( link.getAttribute( 'href' ) ?? '' ).slice( 1 )
          )
        : null;

    if ( ! target ) {
        return;
    }

    event.preventDefault();

    if ( ! target.hasAttribute( 'tabindex' ) ) {
        target.setAttribute( 'tabindex', '-1' );
    }
    target.focus();
};

domReady( () => {
    const container = document.getElementById( 'spsg-admin-app' );

    if ( ! container ) {
        return;
    }

    document.addEventListener( 'click', keepRouteOnSkipLink, true );

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
