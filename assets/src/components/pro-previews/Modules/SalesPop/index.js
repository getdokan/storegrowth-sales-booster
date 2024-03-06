import { Fragment } from "react";
import { __ } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';
import SectionSettings from "./SectionSettings";
import { SelectBox, Switcher } from '../../../settings/Panels';
import InputNumber from '../../../settings/Panels/PanelSettings/Fields/Number';
import TextAreaBox from '../../../settings/Panels/PanelSettings/Fields/TextAreaBox';
import SettingsSection from '../../../settings/Panels/PanelSettings/SettingsSection';
import ColourPicker from "../../../settings/Panels/PanelSettings/Fields/ColorPicker";
import VisibilityControl from '../../../../../../Includes/Modules/SalesPop/assets/src/components/VisibilityControl';

// Handle sales pop modules pro settings prompts.
addFilter(
    'sgsb_after_sales_pop_enable_settings',
    'sgsb_after_sales_pop_enable_settings_callback',
    () => {
        return (
            <Switcher
                colSpan={ 12 }
                isEnable={ false }
                needUpgrade={ true }
                name={ 'mobile_view' }
                title={ __( 'Popup in Mobile', 'storegrowth-sales-booster' ) }
                tooltip={ __(
                    'By enabling the pop up will be visible in the mobile devices.',
                    'storegrowth-sales-booster'
                ) }
            />
         );
     }
);
addFilter(
    'sgsb_prepend_sales_pop_product_settings',
    'sgsb_prepend_sales_pop_product_settings_callback',
    () => {
        return (
            <Switcher
                isEnable={ false }
                needUpgrade={ true }
                name={ 'external_link' }
                title={ __( 'External Link', 'storegrowth-sales-booster' ) }
                tooltip={ __(
                    'Working with External/Affiliate Products. Product link is product url',
                    'storegrowth-sales-booster'
                ) }
            />
         );
     }
);
addFilter(
    'sgsb_append_sales_pop_product_settings',
    'sgsb_append_sales_pop_product_settings_callback',
    () => {
        return <VisibilityControl />;
     }
);
addFilter(
    'sgsb_sales_pop_image_style_settings',
    'sgsb_sales_pop_image_style_settings_callback',
    () => {
        const imgPositions = [
            { value: 'left', label: __( 'Left', 'storegrowth-sales-booster' ) },
        ];

        return (
            <Fragment>
                <InputNumber
                    min={ 1 }
                    max={ 20 }
                    colSpan={ 12 }
                    fieldValue={ 10 }
                    needUpgrade={ true }
                    name={ `spacing_around_image` }
                    title={ __( 'Image Spacing', 'storegrowth-sales-booster' ) }
                    tooltip={ __( 'Apply spacing around the image.', 'storegrowth-sales-booster' ) }
                    placeHolderText={ __( 'Enter the gap of popup image content', 'storegrowth-sales-booster' ) }
                />
                <InputNumber
                    min={ 1 }
                    max={ 100 }
                    colSpan={ 12 }
                    fieldValue={ 6 }
                    needUpgrade={ true }
                    name={ `popup_image_border_radius` }
                    title={ __( 'Image Radius', 'storegrowth-sales-booster' ) }
                    tooltip={ __( 'Apply radius around the image.', 'storegrowth-sales-booster' ) }
                    placeHolderText={ __( 'Enter border radius of popup', 'storegrowth-sales-booster' ) }
                />
                <SelectBox
                    colSpan={ 12 }
                    needUpgrade={ true }
                    fieldValue={ 'left' }
                    name={ `image_position` }
                    options={ [ ...imgPositions ] }
                    title={ __( 'Image Position', 'storegrowth-sales-booster' ) }
                    tooltip={ __( 'Define the position of the image in the popup it can be either ‘left’ or ‘right’.', 'storegrowth-sales-booster' ) }
                />
                <InputNumber
                    min={ 1 }
                    colSpan={ 12 }
                    fieldValue={ 72 }
                    needUpgrade={ true }
                    name={ `popup_image_width` }
                    title={ __( 'Image Width', 'storegrowth-sales-booster' ) }
                    tooltip={ __( 'Change the width size of the image.', 'storegrowth-sales-booster' ) }
                />
            </Fragment>
        );
    }
);
addFilter(
    'sgsb_sales_popup_style_settings',
    'sgsb_sales_popup_style_settings_callback',
    () => {
        const popupPositions = [
            { value: 'left_bottom', label: __( 'Left Bottom', 'storegrowth-sales-booster' ) },
        ];

        return (
            <Fragment>
                <ColourPicker
                    needUpgrade={ true }
                    fieldValue={ '#ffffff' }
                    name={ `background_color` }
                    title={ __( 'Background Color', 'storegrowth-sales-booster' ) }
                    tooltip={ __( 'Set a background color for the pop up', 'storegrowth-sales-booster' ) }
                />
                <SelectBox
                    needUpgrade={ true }
                    name={ `popup_position` }
                    fieldValue={ 'left_bottom' }
                    options={ [ ...popupPositions ] }
                    title={ __( 'Popup Position', 'storegrowth-sales-booster' ) }
                    tooltip={ __( 'Set the position of the popup in the store.', 'storegrowth-sales-booster' ) }
                />
                <InputNumber
                    min={ 1 }
                    max={ 20 }
                    colSpan={ 12 }
                    fieldValue={ 8 }
                    needUpgrade={ true }
                    name={ `popup_border_radius` }
                    title={ __( 'Border radius', 'storegrowth-sales-booster' ) }
                    tooltip={ __( 'Set border radius for the popup.', 'storegrowth-sales-booster' ) }
                    placeHolderText={ __( 'Enter border radius of popup', 'storegrowth-sales-booster' ) }
                />
                <InputNumber
                    min={ 1 }
                    max={ 20 }
                    colSpan={ 12 }
                    fieldValue={ 22 }
                    needUpgrade={ true }
                    name={ `popup_width` }
                    title={ __( 'Popup Width', 'storegrowth-sales-booster' ) }
                    placeHolderText={ __( 'Enter popup with', 'storegrowth-sales-booster' ) }
                    tooltip={ __( 'Set the width of the popup.', 'storegrowth-sales-booster' ) }
                />
            </Fragment>
        );
    }
);
addFilter(
    'sgsb_sales_pop_action_settings',
    'sgsb_sales_pop_action_settings_callback',
    () => {
        return (
            <Fragment>
                <Switcher
                    isEnable={ false }
                    needUpgrade={ true }
                    name={ 'open_product_link_in_new_tab' }
                    title={ __( 'Open product link in new tab', 'storegrowth-sales-booster' ) }
                    tooltip={ __( 'By clicking on the product the link will open in the new tab.', 'storegrowth-sales-booster' ) }
                />
                <Switcher
                    isEnable={ false }
                    needUpgrade={ true }
                    name={ 'link_image_to_product' }
                    title={ __( 'Link image to product page', 'storegrowth-sales-booster' ) }
                    tooltip={ __( 'The image will have an embedded link that will take to the product page.', 'storegrowth-sales-booster' ) }
                />
            </Fragment>
        );
    }
);
addFilter(
    'sgsb_prepend_sales_pop_section_settings',
    'sgsb_prepend_sales_pop_section_settings_callback',
    () => {
        return (
            <SectionSettings
                fontSize={ 10 }
                fontWeight={ 400 }
                fontColor={ '#1B1B50' }
                fontName={ 'normal_text_color' }
                fontSizeName={ 'normal_text_font_size' }
                fontWeightName={ 'normal_text_font_weight' }
                textTitle={ __( 'Normal Text', 'storegrowth-sales-booster' ) }
                tooltip={ __( 'Modify the text style of the normal text in the sales pop.', 'storegrowth-sales-booster' ) }
            />
        );
    }
);
addFilter(
    'sgsb_append_sales_pop_section_settings',
    'sgsb_append_sales_pop_section_settings_callback',
    () => {
        return (
            <Fragment>
                {/* State text section. */ }
                <SectionSettings
                    fontSize={ 10 }
                    fontWeight={ 400 }
                    fontColor={ '#1B1B50' }
                    fontName={ 'state_text_color' }
                    fontSizeName={ 'state_text_font_size' }
                    fontWeightName={ 'state_text_font_weight' }
                    textTitle={ __( 'State Text', 'storegrowth-sales-booster' ) }
                    tooltip={ __( 'Modify the text style of the state name in the sales pop.', 'storegrowth-sales-booster' ) }
                />

                {/* City text section. */ }
                <SectionSettings
                    fontSize={ 10 }
                    fontWeight={ 400 }
                    fontColor={ '#1B1B50' }
                    fontName={ 'city_text_color' }
                    fontSizeName={ 'city_text_font_size' }
                    fontWeightName={ 'city_text_font_weight' }
                    textTitle={ __( 'City Text', 'storegrowth-sales-booster' ) }
                    tooltip={ __( 'Modify the text style of the city name in the sales pop.', 'storegrowth-sales-booster' ) }
                />
            </Fragment>
        );
    }
);
addFilter(
    'sgsb_sales_pop_message_panel_settings',
    'sgsb_sales_pop_message_panel_settings_callback',
    () => {
        return (
            <SettingsSection>
                <TextAreaBox
                    areaRows={ 4 }
                    needUpgrade={ true }
                    name={ 'message_popup' }
                    renderTextAreaContent={ true }
                    fieldValue={ `virtual_name }\n{ product_title }\nFrom { location }\n{ time }` }
                    title={ __( 'Message Popup', 'storegrowth-sales-booster' ) }
                    placeHolderText={ __(
                        'Enter Message Popup',
                        'storegrowth-sales-booster'
                    ) }
                    tooltip={ __(
                        'The base message template that is to be shown in the sales pop.',
                        'storegrowth-sales-booster'
                    ) }
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
                    colSpan={ 12 }
                    name={ 'loop' }
                    isEnable={ false }
                    needUpgrade={ true }
                    title={ __( 'Loop', 'storegrowth-sales-booster' ) }
                    tooltip={ __(
                        'The product source will loop around in the sales pop.',
                        'storegrowth-sales-booster'
                    ) }
                />
                <InputNumber
                    min={ 1 }
                    colSpan={ 12 }
                    fieldValue={ 5 }
                    needUpgrade={ true }
                    name={ 'next_time_display' }
                    title={ __( 'Next Time Display', 'storegrowth-sales-booster' ) }
                    placeHolderText={ __(
                        'Enter Next Time Display',
                        'storegrowth-sales-booster'
                    ) }
                    tooltip={ __(
                        'Time to start next notification( in seconds )',
                        'storegrowth-sales-booster'
                    ) }
                />
                <InputNumber
                    min={ 1 }
                    colSpan={ 12 }
                    fieldValue={ 5 }
                    needUpgrade={ true }
                    name={ 'notification_per_page' }
                    title={ __( 'Notification Per Page', 'storegrowth-sales-booster' ) }
                    tooltip={ __(
                        'Quantity Notifications Per Page',
                        'storegrowth-sales-booster'
                    ) }
                    placeHolderText={ __(
                        'Enter Notification Per Page',
                        'storegrowth-sales-booster'
                    ) }
                />
                <InputNumber
                    min={ 1 }
                    colSpan={ 12 }
                    fieldValue={ 5 }
                    needUpgrade={ true }
                    name={ 'initial_time_delay' }
                    title={ __( 'Initial Time Delay', 'storegrowth-sales-booster' ) }
                    placeHolderText={ __(
                        'Enter Initial Time Delay',
                        'storegrowth-sales-booster'
                    ) }
                    tooltip={ __(
                        'When Your Site Load, Notification will wait this time to show(in seconds)',
                        'storegrowth-sales-booster'
                    ) }
                />
                <InputNumber
                    min={ 1 }
                    colSpan={ 12 }
                    fieldValue={ 5 }
                    needUpgrade={ true }
                    name={ 'dispaly_time' }
                    title={ __( 'Display Time', 'storegrowth-sales-booster' ) }
                    placeHolderText={ __(
                        'Enter Virtual Time',
                        'storegrowth-sales-booster'
                    ) }
                    tooltip={ __(
                        'Time your notification display',
                        'storegrowth-sales-booster'
                    ) }
                />
            </SettingsSection>
         );
     }
);
