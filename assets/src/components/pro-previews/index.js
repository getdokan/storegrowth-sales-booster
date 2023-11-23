import { __ } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';
import { Switcher } from "../settings/Panels";

const noop = () => {};

// Handle sales pop modules pro settings prompts.
addFilter(
    'sgsb_after_sales_pop_enable_settings',
    'sgsb_after_sales_pop_enable_settings_callback',
    ( component, popupSettingsData ) => {
        return (
            <Switcher
                colSpan={ 12 }
                needUpgrade={ true }
                name={ 'mobile_view' }
                changeHandler={ noop }
                isEnable={ Boolean( popupSettingsData.mobile_view ) }
                title={ __( 'Popup in Mobile', 'storegrowth-sales-booster' ) }
                tooltip={ __( 'By enabling the pop up will be visible in the mobile devices.', 'storegrowth-sales-booster' ) }
            />
        );
    }
);
