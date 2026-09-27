/**
 * Quick View admin bundle (`modules/quick-view/assets/js/admin.js`):
 * registers the module's settings page on the admin app's `/quick-view`
 * route. Loaded on the StoreGrowth admin pages before the app mounts.
 *
 * @since SPSG_VERSION
 */
import { addFilter } from '@wordpress/hooks';
import type { ReactNode } from 'react';

import QuickViewPage from './quick-view-page';

interface AdminRoute {
    id: string;
    path: string;
    element: ReactNode;
}

addFilter(
    'storegrowth.admin.routes',
    'storegrowth/quick-view',
    ( routes: AdminRoute[] ) => [
        ...routes.filter( ( route ) => route.id !== 'quick-view' ),
        {
            id: 'quick-view',
            path: '/quick-view',
            element: <QuickViewPage />,
        },
    ]
);
