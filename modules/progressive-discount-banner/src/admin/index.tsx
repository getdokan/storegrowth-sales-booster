/**
 * Free Shipping Rules admin bundle
 * (`modules/progressive-discount-banner/assets/js/admin.js`): registers the
 * module's settings page on the admin app's `/progressive-discount-banner`
 * route. Loaded on the StoreGrowth admin pages before the app mounts.
 *
 * @since SPSG_VERSION
 */
import { addFilter } from '@wordpress/hooks';
import type { ReactNode } from 'react';

import FreeShippingPage from './free-shipping-page';

interface AdminRoute {
    id: string;
    path: string;
    element: ReactNode;
}

addFilter(
    'storegrowth.admin.routes',
    'storegrowth/progressive-discount-banner',
    ( routes: AdminRoute[] ) => [
        ...routes.filter(
            ( route ) => route.id !== 'progressive-discount-banner'
        ),
        {
            id: 'progressive-discount-banner',
            path: '/progressive-discount-banner',
            element: <FreeShippingPage />,
        },
    ]
);
