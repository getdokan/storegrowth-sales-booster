/**
 * Floating Bar admin bundle
 * (`modules/floating-notification-bar/assets/js/admin.js`): registers the
 * module's settings page on the admin app's `/floating-notification-bar`
 * route. Loaded on the StoreGrowth admin pages before the app mounts.
 *
 * @since SPSG_VERSION
 */
import { addFilter } from '@wordpress/hooks';
import type { ReactNode } from 'react';

import FloatingBarPage from './floating-bar-page';

interface AdminRoute {
    id: string;
    path: string;
    element: ReactNode;
}

addFilter(
    'storegrowth.admin.routes',
    'storegrowth/floating-notification-bar',
    ( routes: AdminRoute[] ) => [
        ...routes.filter(
            ( route ) => route.id !== 'floating-notification-bar'
        ),
        {
            id: 'floating-notification-bar',
            path: '/floating-notification-bar',
            element: <FloatingBarPage />,
        },
    ]
);
