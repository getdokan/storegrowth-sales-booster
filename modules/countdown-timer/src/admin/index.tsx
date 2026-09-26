/**
 * Countdown Timer admin bundle (`modules/countdown-timer/assets/js/admin.js`):
 * registers the module's settings page on the admin app's `/countdown-timer`
 * route. Loaded on the StoreGrowth admin pages before the app mounts.
 *
 * @since SPSG_VERSION
 */
import { addFilter } from '@wordpress/hooks';
import type { ReactNode } from 'react';

import CountdownTimerPage from './countdown-timer-page';

interface AdminRoute {
    id: string;
    path: string;
    element: ReactNode;
}

addFilter(
    'storegrowth.admin.routes',
    'storegrowth/countdown-timer',
    ( routes: AdminRoute[] ) => [
        ...routes.filter( ( route ) => route.id !== 'countdown-timer' ),
        {
            id: 'countdown-timer',
            path: '/countdown-timer',
            element: <CountdownTimerPage />,
        },
    ]
);
