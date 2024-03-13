import { __ } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';
import SingleCheckBox from '../../../settings/Panels/PanelSettings/Fields/SingleCheckBox';
import {Fragment} from "react";
import ColourPicker from "../../../settings/Panels/PanelSettings/Fields/ColorPicker";

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

addFilter(
    'sgsb_append_countdown_design_settings',
    'sgsb_append_countdown_design_settings_callback',
    () =>  {
        return (
            <Fragment>
                <ColourPicker
                    needUpgrade={ true }
                    fieldValue={ `#FFFFFF` }
                    title={ __( "Counter Background Color", "storegrowth-sales-booster" ) }
                />

                <ColourPicker
                    needUpgrade={ true }
                    fieldValue={ `#ECEDF0` }
                    title={__("Counter Border Color", "storegrowth-sales-booster")}
                />

                <ColourPicker
                    needUpgrade={ true }
                    fieldValue={ `#1B1B50` }
                    title={__("Day Counter Text Color", "storegrowth-sales-booster")}
                />

                <ColourPicker
                    needUpgrade={ true }
                    fieldValue={ `#1B1B50` }
                    title={ __( "Hour Counter Text Color", "storegrowth-sales-booster" ) }
                />

                <ColourPicker
                    needUpgrade={ true }
                    fieldValue={ `#1B1B50` }
                    title={__("Minute Counter Text Color", "storegrowth-sales-booster")}
                />

                <ColourPicker
                    needUpgrade={ true }
                    fieldValue={ `#1B1B50` }
                    title={__("Second Counter Text Color", "storegrowth-sales-booster")}
                />
            </Fragment>
         );
     }
);

