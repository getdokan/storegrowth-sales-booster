import { addFilter } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';


addFilter(
    'sgsb_quick_cart_content_settings',
    'sgsb_quick_cart_content_settings_callback',
    ( contentOptions ) => {
        return [
            ...contentOptions,
            {
                name  : 'show_quick_cart_dokan_store_names',
                title : __( 'Show Store Names', 'storegrowth-sales-booster' ),
            },
            {
                name  : 'enable_quick_cart_dokan_store_links',
                title : __( 'Enable Store Links', 'storegrowth-sales-booster' ),
            },
        ];
    }
);

addFilter(
    'sgsb_quick_cart_state',
    'sgsb_quick_cart_state_callback',
    ( data ) => {
        return {
            ...data,
            show_quick_cart_dokan_store_names: true,
            enable_quick_cart_dokan_store_links: true,
        };
    }
);
