import { __ } from '@wordpress/i18n';
import { Fragment } from 'react';
import { addFilter } from '@wordpress/hooks';
import InputNumber from '../../../settings/Panels/PanelSettings/Fields/Number';
import SelectBox from '../../../settings/Panels/PanelSettings/Fields/SelectBox';
import TextInput from '../../../settings/Panels/PanelSettings/Fields/TextInput';
import ColourPicker from '../../../settings/Panels/PanelSettings/Fields/ColorPicker';
import SingleCheckBox from '../../../settings/Panels/PanelSettings/Fields/SingleCheckBox';
import Number from "../../../settings/Panels/PanelSettings/Fields/Number";
import {UpgradeCrown} from "../../../settings/Panels";

// Handle stock bar modules pro settings prompts.
addFilter( 
    'sgsb_shop_stock_bar_enable_settings',
    'sgsb_shop_stock_bar_enable_settings_callback',
    ( component ) =>  { 
        return ( 
            <SingleCheckBox
                needUpgrade= { true }
                name={ 'shop_page_stock_bar_enable' }
                checkedValue= { false }
                className={ `settings-field checkbox-field` }
                title={ __( 'Display on Shop Page', 'storegrowth-sales-booster' ) }
                tooltip={ __( 
                    'The stock countdown bar will show on the shop page',
                    'storegrowth-sales-booster'
                ) }
            />
        );
    }
);
addFilter( 
    'sgsb_variation_product_stock_bar_enable_settings',
    'sgsb_variation_product_stock_bar_enable_settings_callback',
    ( component ) =>  { 
        return ( 
            <SingleCheckBox
                needUpgrade={ true }
                name={ 'variation_page_stock_bar_enable' }
                checkedValue={ false }
                className={ `settings-field checkbox-field` }
                title={ __( 
                    'Display on Variation Product Page',
                    'storegrowth-sales-booster'
                ) }
                tooltip={ __( 
                    'The stock countdown bar will show on the variations product page',
                    'storegrowth-sales-booster'
                ) }
            />
         );
     }
);
addFilter( 
    'sgsb_bar_color_stock_bar_settings',
    'sgsb_bar_color_stock_bar_settings_callback',
    ( component ) =>  { 
        return ( 
            <ColourPicker
                needUpgrade={ true }
                fieldValue={ '008DFF' }
                name={ 'stockbar_fg_color' }
                title={ __( 'Bar Color', 'storegrowth-sales-booster' ) }
            />
        );
    }
);
addFilter( 
    'sgsb_design_panel_stock_bar_settings',
    'sgsb_design_panel_stock_bar_settings_callback',
    ( component ) =>  { 
        const barDisplayFormat = [
            {
                value : 'above',
                label : __( 'Above Stock Bar', 'storegrowth-sales-booster' ),
            },
        ];

        return ( 
            <Fragment>
                <InputNumber
                    min={ 1 }
                    max={ 100 }
                    fieldValue={ 10 }
                    needUpgrade={ true }
                    style={ { 
                        width: '100px',
                    } }
                    name={ `stockbar_height` }
                    title={ __( `Stock Bar Height`, 'storegrowth-sales-booster' ) }
                />

                <SelectBox
                    needUpgrade={ true }
                    fieldValue={ 'above' }
                    name={ `stock_display_format` }
                    options={ [ ...barDisplayFormat ] }
                    title={ __( 'Stock Display Format', 'storegrowth-sales-booster' ) }
                    tooltip={ __( 
                        'Select your desired font family',
                        'storegrowth-sales-booster'
                    ) }
                />

                <TextInput
                    name={ 'total_sell_count_text' }
                    placeHolderText={ __( 
                        'Last chance! [discount]% OFF',
                        'storegrowth-sales-booster'
                    ) }
                    className={ `settings-field input-field` }
                    fieldValue={ __( 'Total Sold', 'storegrowth-sales-booster' ) }
                    title={ __( 'Total Sell Count Text', 'storegrowth-sales-booster' ) }
                    tooltip={ __( 
                        'It will be placed left side of the above of the Stock Bar. e.g. Total Sold',
                        'storegrowth-sales-booster'
                    ) }
                    needUpgrade={ true }
                />
                <TextInput
                    name={ 'available_item_count_text' }
                    placeHolderText={ __( 
                        'Last chance! [discount]% OFF',
                        'storegrowth-sales-booster'
                    ) }
                    fieldValue={ __( 'Available Item', 'storegrowth-sales-booster' ) }
                    className={ `settings-field input-field` }
                    title={ __( 'Available Item Count Text', 'storegrowth-sales-booster' ) }
                    tooltip={ __( 
                        'It will be placed right side of the above of the Stock Bar. e.g. Available Item',
                        'storegrowth-sales-booster'
                    ) }
                    needUpgrade={ true }
                />
            </Fragment>
        );
    }
);
addFilter(
    'sgsb_append_after_stock_status_settings',
    'sgsb_append_after_stock_status_settings_callback',
    () => {
        return (
            <Fragment>
                <Number
                    min={ 1 }
                    max={ 100 }
                    fieldValue={ 10 }
                    needUpgrade={ true }
                    title={ __( `Minimum Quantity Required`, 'storegrowth-sales-booster' ) }
                />

                <TextInput
                    needUpgrade={ true }
                    className={ `settings-field input-field` }
                    title={ __( 'Stock Status Text', 'storegrowth-sales-booster' ) }
                    fieldValue={ __( 'Hurry! only {quantity} stocks left.', 'storegrowth-sales-booster' ) }
                    tooltip={ __(
                        'Please input your stock status warning message here, using {quantity} to represent the actual product quantity.',
                        'storegrowth-sales-booster'
                    ) }
                />

                <ColourPicker
                    needUpgrade={ true }
                    fieldValue={ '#073B4C' }
                    title={ __( 'Stock Status Color', 'storegrowth-sales-booster' ) }
                />
            </Fragment>
        );
    }
);
addFilter(
    'sgsb_before_stock_bar_preview_end',
    'sgsb_before_stock_bar_preview_end_callback',
    () => {
        return (
            <Fragment>
                <p
                    className={ `stock-status-warning-msg` }
                    style={ {
                        gap       : 10,
                        color     : '#073B4C',
                        margin    : 0,
                        display   : 'flex',
                        fontSize  : 14,
                        alignItem : 'center',
                    } }
                >
                    { __(
                        'Hurry! only {quantity} stocks left.',
                        'storegrowth-sales-booster'
                    ) }
                </p>
            </Fragment>
        );
    }
);
addFilter(
    'sgsb_before_stock_bar_preview_template_end',
    'sgsb_before_stock_bar_preview_template_end_callback',
    () => {
        return (
            <Fragment>
                <p
                    className={ `stock-status-warning-msg` }
                    style={ {
                        gap       : 10,
                        color     : '#073B4C',
                        margin    : 0,
                        display   : 'flex',
                        fontSize  : 14,
                        alignItem : 'center',
                    } }
                >
                    { __(
                        'Hurry! only {quantity} stocks left.',
                        'storegrowth-sales-booster'
                    ) }
                </p>
            </Fragment>
        );
    }
);
