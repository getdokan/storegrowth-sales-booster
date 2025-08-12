import { __ } from '@wordpress/i18n';
// @ts-ignore
import domReady from '@wordpress/dom-ready';
// @ts-ignore
import { Fill } from '@wordpress/components';
// @ts-ignore
import { registerPlugin } from '@wordpress/plugins';
// @ts-ignore
import { DokanButton } from '@dokan/components';
import App from './components/App';
import CreateBogoOffer from './components/CreateBogoOffer';

const AddOfferCreateButton = () => {
    return (
        <Fill name="dokan-header-actions">
            { ( { navigate } ) => (
                <DokanButton onClick={ () => navigate( '/sales-booster/bogo/create' ) }>
                    { __( 'Create New Offer', 'storegrowth-sales-booster-pro' ) }
                </DokanButton>
            ) }
        </Fill>
    );
};

registerPlugin( 'storegrowth-dokan-vendor-bogo', {
    render: AddOfferCreateButton,
    scope: 'storegrowth-dokan-vendor-bogo',
} );

domReady( () => {
    // @ts-ignore
    window.wp.hooks.addFilter(
        'dokan-dashboard-routes',
        'storegrowth-dokan-vendor-bogo',
        function ( routes ) {
            routes.push( {
                id: 'storegrowth-dokan-vendor-bogo',
                title: __( 'StoreGrowth BOGO', 'storegrowth-sales-booster-pro' ),
                element: <App />,
                path: '/sales-booster/bogo/',
                exact: true,
                order: 10,
                parent: 'sales-booster',
                capabilities: [ 'dokandar' ],
            } );

            return routes;
        }
    );

    // @ts-ignore
    window.wp.hooks.addFilter(
        'dokan-dashboard-routes',
        'storegrowth-dokan-vendor-bogo-create',
        function ( routes ) {
            routes.push( {
                id: 'storegrowth-dokan-vendor-bogo-create',
                title: __( 'Create BOGO Offer', 'storegrowth-sales-booster-pro' ),
                element: <CreateBogoOffer />,
                path: '/sales-booster/bogo/create',
                exact: true,
                order: 10,
                parent: 'sales-booster/bogo',
                capabilities: [ 'dokandar' ],
                backUrl: '/sales-booster/bogo/',
            } );

            return routes;
        }
    );

    // @ts-ignore
    window.wp.hooks.addFilter(
        'dokan-dashboard-routes',
        'storegrowth-dokan-vendor-bogo-update',
        function ( routes ) {
            routes.push( {
                id: 'storegrowth-dokan-vendor-bogo-update',
                title: __( 'Update BOGO Offer', 'storegrowth-sales-booster-pro' ),
                element: <CreateBogoOffer />,
                path: '/sales-booster/bogo/update/:id',
                exact: true,
                order: 10,
                parent: 'sales-booster/bogo',
                capabilities: [ 'dokandar' ],
                backUrl: '/sales-booster/bogo/',
            } );

            return routes;
        }
    );
} );