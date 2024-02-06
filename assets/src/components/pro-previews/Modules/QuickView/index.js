import { __ } from '@wordpress/i18n';
import { Fragment } from 'react';
import { addFilter } from '@wordpress/hooks';
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
            </Fragment>
        );
    }
);
addFilter( 
    'sgsb_quick_view_button_position_settings',
    'sgsb_quick_view_button_position_settings_callback',
    ( component,buttonPositions ) =>  { 
        return [...buttonPositions,
            {
                value: "center_on_the_image",
                label: __("Center On The Image", "storegrowth-sales-booster"),
                disabled:true,
                needUpgrade:true,
            },
        ]
            
    }
);

