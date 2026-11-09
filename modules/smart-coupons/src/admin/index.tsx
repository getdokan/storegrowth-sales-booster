/**
 * Smart Coupons admin bundle (`modules/smart-coupons/assets/js/admin.js`),
 * loaded on the StoreGrowth admin page before the app mounts. It adds the
 * coupon list (`#/smart-coupons`) and the editor (`#/smart-coupons/new`,
 * `#/smart-coupons/<id>`).
 *
 * @since SPSG_VERSION
 */
import { addFilter } from '@wordpress/hooks';
import type { ReactNode } from 'react';
import { Navigate, useParams } from '@storegrowth/hooks';

import SmartCouponEditorPage from './editor/smart-coupon-editor';
import SmartCouponList from './list/smart-coupon-list';

/**
 * `/smart-coupons/:id` opens the editor for a numeric id only.
 */
function EditRoute() {
    const { id = '' } = useParams();

    if ( ! /^\d+$/.test( id ) ) {
        return <Navigate to="/smart-coupons" replace />;
    }

    return <SmartCouponEditorPage id={ Number( id ) } />;
}

interface AdminRoute {
    id: string;
    path: string;
    element: ReactNode;
}

addFilter(
    'storegrowth.admin.routes',
    'storegrowth/smart-coupons',
    ( routes: AdminRoute[] ) => {
        return [
            ...routes,
            {
                id: 'smart-coupons',
                path: '/smart-coupons',
                element: <SmartCouponList />,
            },
            {
                id: 'smart-coupons-new',
                path: '/smart-coupons/new',
                element: <SmartCouponEditorPage id={ null } />,
            },
            {
                id: 'smart-coupons-edit',
                path: '/smart-coupons/:id',
                element: <EditRoute />,
            },
        ];
    }
);
