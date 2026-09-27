/**
 * Fly Cart admin bundle (`modules/fly-cart/assets/js/admin.js`): registers
 * the module's settings page on the admin app's `/fly-cart` route. Loaded on
 * the StoreGrowth admin pages before the app mounts.
 *
 * @since SPSG_VERSION
 */
import { addFilter } from '@wordpress/hooks';
import type { ReactNode } from 'react';

import FlyCartPage from './fly-cart-page';

interface AdminRoute {
    id: string;
    path: string;
    element: ReactNode;
}

addFilter(
    'storegrowth.admin.routes',
    'storegrowth/fly-cart',
    ( routes: AdminRoute[] ) => [
        ...routes.filter( ( route ) => route.id !== 'fly-cart' ),
        {
            id: 'fly-cart',
            path: '/fly-cart',
            element: <FlyCartPage />,
        },
    ]
);
