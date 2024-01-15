import { __ } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';
import SingleCheckBox from '../../../settings/Panels/PanelSettings/Fields/SingleCheckBox';

// Handle stock bar modules pro settings prompts.
addFilter( 
    'sgsb_shop_sales_countdown_enable_settings',
    'sgsb_shop_sales_countdown_enable_settings_callback',
    ( component ) =>  { 
        return ( 
            <SingleCheckBox
                needUpgrade= { true }
                name={ 'shop_page_countdown_enable' }
                checkedValue= { false }
                className={ `settings-field checkbox-field` }
                title={ __( 'Shop Page Display', 'storegrowth-sales-booster' ) }
                tooltip={ __( 
                    'The sales countdown will show on the shop page',
                    'storegrowth-sales-booster'
                ) }
            />
         );
     }
);

