import { addFilter } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import VendorsSettings from './VendorsSettings';

addFilter( 'sgsb_bogo_tab_panels', 'sgsb_bogo_tab_panels_callback', ( panels ) => {
    return [
        ...panels,
        {
            key: 'vendors',
            title: __('Vendors', 'storegrowth-sales-booster-pro'),
            panel: <VendorsSettings/>,
        },
    ];
} );
