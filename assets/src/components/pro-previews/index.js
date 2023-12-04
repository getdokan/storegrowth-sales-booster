import { __ } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';
import { Switcher } from "../settings/Panels";
import InputNumber from "../settings/Panels/PanelSettings/Fields/Number";
import SettingsSection from "../settings/Panels/PanelSettings/SettingsSection";
import TextAreaBox from "../settings/Panels/PanelSettings/Fields/TextAreaBox";

const noop = () => {};

// Handle sales pop Modules pro settings prompts.
addFilter(
    'sgsb_after_sales_pop_enable_settings',
    'sgsb_after_sales_pop_enable_settings_callback',
    ( component ) => {
        return (
            <Switcher
                colSpan={ 12 }
                isEnable={ false }
                needUpgrade={ true }
                name={ 'mobile_view' }
                changeHandler={ noop }
                title={ __( 'Popup in Mobile', 'storegrowth-sales-booster-pro' ) }
                tooltip={ __( 'By enabling the pop up will be visible in the mobile devices.', 'storegrowth-sales-booster-pro' ) }
            />
        );
    }
);
addFilter(
    'sgsb_sales_pop_message_panel_settings',
    'sgsb_sales_pop_message_panel_settings_callback',
    ( component ) => {
        return (
            <SettingsSection>
                <TextAreaBox
                    areaRows={ 4 }
                    needUpgrade={ true }
                    changeHandler={ noop }
                    name={ 'message_popup' }
                    renderTextAreaContent={ true }
                    fieldValue={ `virtual_name}\n{product_title}\nFrom {location}\n{time}` }
                    title={ __( 'Message Popup', 'storegrowth-sales-booster-pro' ) }
                    placeHolderText={ __( 'Enter Message Popup', 'storegrowth-sales-booster-pro' ) }
                    tooltip={ __( 'The base message template that is to be shown in the sales pop.', 'storegrowth-sales-booster-pro' ) }
                />
            </SettingsSection>
        );
    }
);
addFilter(
    'sgsb_sales_pop_time_panel_settings',
    'sgsb_sales_pop_time_panel_settings_callback',
    () => {
        return (
            <SettingsSection>
                <Switcher
                    name={ 'loop' }
                    colSpan={ 12 }
                    isEnable={ false }
                    needUpgrade={ true }
                    changeHandler={ noop }
                    title={ __( 'Loop', 'storegrowth-sales-booster-pro' ) }
                    tooltip={ __( 'The product source will loop around in the sales pop.', 'storegrowth-sales-booster-pro' ) }
                />
                <InputNumber
                    min={ 1 }
                    colSpan={ 12 }
                    fieldValue={ 5 }
                    needUpgrade={ true }
                    changeHandler={ noop }
                    name={ 'next_time_display' }
                    title={ __( 'Next Time Display', 'storegrowth-sales-booster-pro' ) }
                    placeHolderText={ __( 'Enter Next Time Display', 'storegrowth-sales-booster-pro' ) }
                    tooltip={ __( 'Time to start next notification(in seconds)', 'storegrowth-sales-booster-pro' ) }
                />
                <InputNumber
                    min={ 1 }
                    colSpan={ 12 }
                    fieldValue={ 5 }
                    needUpgrade={ true }
                    changeHandler={ noop }
                    name={ 'notification_per_page' }
                    title={ __( 'Notification Per Page', 'storegrowth-sales-booster-pro' ) }
                    tooltip={ __( 'Quantity Notifications Per Page', 'storegrowth-sales-booster-pro' ) }
                    placeHolderText={ __( 'Enter Notification Per Page', 'storegrowth-sales-booster-pro' ) }
                />
                <InputNumber
                    min={ 1 }
                    colSpan={ 12 }
                    fieldValue={ 5 }
                    needUpgrade={ true }
                    changeHandler={ noop }
                    name={ 'initial_time_delay' }
                    title={ __( 'Initial Time Delay', 'storegrowth-sales-booster-pro' ) }
                    placeHolderText={ __( 'Enter Initial Time Delay', 'storegrowth-sales-booster-pro' ) }
                    tooltip={ __( 'When Your Site Load, Notification will wait this time to show(in seconds)', 'storegrowth-sales-booster-pro' ) }
                />
                <InputNumber
                    min={ 1 }
                    colSpan={ 12 }
                    fieldValue={ 5 }
                    needUpgrade={ true }
                    changeHandler={ noop }
                    name={ 'dispaly_time' }
                    title={ __( 'Display Time', 'storegrowth-sales-booster-pro' ) }
                    placeHolderText={ __( 'Enter Virtual Time', 'storegrowth-sales-booster-pro' ) }
                    tooltip={ __( 'Time your notification display', 'storegrowth-sales-booster-pro' ) }
                />
            </SettingsSection>
        );
    }
);
