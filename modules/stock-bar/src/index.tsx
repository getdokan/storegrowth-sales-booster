/**
 * Stock Bar admin bundle (`build/modules/stock-bar/admin.js`): registers the
 * module's settings page on the admin app's `/stock-bar` route. Loaded on the
 * StoreGrowth admin pages before the app mounts.
 *
 * @since SPSG_VERSION
 */
import { addFilter } from '@wordpress/hooks';
import type { ReactNode } from 'react';

import StockBarPage from './stock-bar-page';

interface AdminRoute {
    id: string;
    path: string;
    element: ReactNode;
}

addFilter(
    'storegrowth.admin.routes',
    'storegrowth/stock-bar',
    ( routes: AdminRoute[] ) => [
        ...routes.filter( ( route ) => route.id !== 'stock-bar' ),
        { id: 'stock-bar', path: '/stock-bar', element: <StockBarPage /> },
    ]
);
