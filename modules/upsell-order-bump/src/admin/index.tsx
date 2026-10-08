/**
 * Order Bump admin bundle (`modules/upsell-order-bump/assets/js/admin.js`),
 * loaded on the StoreGrowth admin page before the app mounts. It adds the
 * module's pages: the bump list (`#/upsell-order-bump`) and the bump editor
 * (`#/upsell-order-bump/create-bump`, `#/upsell-order-bump/<id>`).
 *
 * @since SPSG_VERSION
 */
import { addFilter } from '@wordpress/hooks';
import type { ReactNode } from 'react';
import { Navigate, useParams } from '@storegrowth/hooks';

import OrderBumpEditorPage from './editor/order-bump-editor';
import OrderBumpList from './list/order-bump-list';

/**
 * `/upsell-order-bump/:id` opens the editor for a numeric id only. Anything
 * else opens the list.
 *
 * @since SPSG_VERSION
 */
function EditRoute() {
    const { id = '' } = useParams();

    if ( ! /^\d+$/.test( id ) ) {
        return <Navigate to="/upsell-order-bump" replace />;
    }

    return <OrderBumpEditorPage id={ Number( id ) } />;
}

/**
 * 2.2.0's `/upsell-order-bump/<action>/<id>`: `edit` opens the editor;
 * `delete` (which deleted the bump on opening the link) opens the list.
 *
 * @since SPSG_VERSION
 */
function LegacyActionRoute() {
    const { action = '', id = '' } = useParams();

    if ( action === 'edit' && /^\d+$/.test( id ) ) {
        return <Navigate to={ `/upsell-order-bump/${ id }` } replace />;
    }

    return <Navigate to="/upsell-order-bump" replace />;
}

interface AdminRoute {
    id: string;
    path: string;
    element: ReactNode;
}

// The module's pages; the paths are 2.2.0's, so old links keep working.
addFilter(
    'storegrowth.admin.routes',
    'storegrowth/upsell-order-bump',
    ( routes: AdminRoute[] ) => {
        return [
            ...routes,
            {
                id: 'upsell-order-bump',
                path: '/upsell-order-bump',
                element: <OrderBumpList />,
            },
            {
                id: 'upsell-order-bump-create',
                path: '/upsell-order-bump/create-bump',
                element: <OrderBumpEditorPage id={ null } />,
            },
            {
                id: 'upsell-order-bump-edit',
                path: '/upsell-order-bump/:id',
                element: <EditRoute />,
            },
            {
                id: 'upsell-order-bump-legacy-action',
                path: '/upsell-order-bump/:action/:id',
                element: <LegacyActionRoute />,
            },
        ];
    }
);
