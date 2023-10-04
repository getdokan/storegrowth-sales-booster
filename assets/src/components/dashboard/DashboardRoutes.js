import { __ } from '@wordpress/i18n';
import Overview from './Overview';
import Pricing from './Pricing';
import Faq from './Faq';
import React from 'react';

const dashboardRoutes = [
    {
        name    : 'dashboard',
        path    : '/dashboard/overview',
        label   : __( 'Overview', 'storegrowth-sales-booster' ),
        element : <Overview />,
    },
    {
        name    : 'dashboard',
        path    : '/dashboard/pricing',
        label   : __( 'Pricing', 'storegrowth-sales-booster' ),
        element : <Pricing />,
    },
    {
        name    : 'dashboard',
        path    : '/dashboard/faq',
        label   : __( 'FAQs', 'storegrowth-sales-booster' ),
        element : <Faq />,
    },
];

export default dashboardRoutes;
