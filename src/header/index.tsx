/**
 * Entry point of the admin header bundle.
 *
 * Page order on every StoreGrowth page: header → notices → app (see
 * AdminMenu::render_app()). Runs at footer script-evaluation time, before
 * core's DOMContentLoaded notice pass, so the notice catcher is already in its
 * final place when core moves stray notices after it.
 *
 * @since SPSG_VERSION
 */
import { ThemeProvider } from '@wedevs/plugin-ui';
import { createRoot } from '@wordpress/element';

import { storegrowthTheme } from '../admin/theme';
import AdminBar from './admin-bar';

// Admin notices were captured into a hidden wrapper by AdminMenu; move it into
// the slot under the header and show it.
const noticeList = document.getElementById( 'spsg__notice-list' );
const noticeSlot = document.getElementById( 'spsg-admin-notices' );

if ( noticeList && noticeSlot ) {
    noticeSlot.appendChild( noticeList );
    noticeList.classList.remove( 'spsg-notice-list-hide' );
}

// The header mounts in its own root so it paints without waiting for the app.
const headerRoot = document.getElementById( 'spsg-admin-header' );

if ( headerRoot ) {
    createRoot( headerRoot ).render(
        <ThemeProvider
            pluginId="storegrowth-header"
            className="spsg-layout"
            tokens={ storegrowthTheme }
            mode="light"
            storageKey={ false }
        >
            <AdminBar />
        </ThemeProvider>
    );
}
