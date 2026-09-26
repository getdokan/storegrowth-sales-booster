/**
 * Sales Notification admin bundle (`modules/sales-pop/assets/js/admin.js`):
 * registers the module's settings page on the admin app's `/sales-pop`
 * route. Loaded on the StoreGrowth admin pages before the app mounts.
 *
 * @since SPSG_VERSION
 */
import { addFilter } from '@wordpress/hooks';
import type { ReactNode } from 'react';

import SalesPopPage from './sales-pop-page';

interface AdminRoute {
    id: string;
    path: string;
    element: ReactNode;
}

addFilter(
    'storegrowth.admin.routes',
    'storegrowth/sales-pop',
    ( routes: AdminRoute[] ) => [
        ...routes.filter( ( route ) => route.id !== 'sales-pop' ),
        { id: 'sales-pop', path: '/sales-pop', element: <SalesPopPage /> },
    ]
);
