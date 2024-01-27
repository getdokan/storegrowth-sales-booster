import { __ } from '@wordpress/i18n';
import { Fragment } from 'react';
import { addFilter } from '@wordpress/hooks';
import InputNumber from '../../../settings/Panels/PanelSettings/Fields/Number';
import SelectBox from '../../../settings/Panels/PanelSettings/Fields/SelectBox';
import TextInput from '../../../settings/Panels/PanelSettings/Fields/TextInput';
import SingleCheckBox from '../../../settings/Panels/PanelSettings/Fields/SingleCheckBox';
import ColourPicker from '../../../settings/Panels/PanelSettings/Fields/ColorPicker';

// Handle stock bar modules pro settings prompts.
addFilter( 
    'sgsb_quick_view_navigation_settings',
    'sgsb_quick_view_navigation_settings_callback',
    ( component ) =>  { 
        return ( 
            <Fragment>
                <ColourPicker
                    needUpgrade={ true }
                    fieldValue={ 'FFFFFF' }
                    name={ 'navigation_background' }
                    title={ __( 'Navigation Background Color', 'storegrowth-sales-booster' ) }
                />
                <ColourPicker
                    needUpgrade={ true }
                    fieldValue={ '000000' }
                    name={ 'navigation_text_color' }
                    title={ __( 'Navigation Text Color', 'storegrowth-sales-booster' ) }
                />
            </Fragment>
        );
    }
);

