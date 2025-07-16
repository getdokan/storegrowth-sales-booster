import { __ } from "@wordpress/i18n";
import { Fragment } from "react";
import SectionHeader from "../../../../../../assets/src/components/settings/Panels/SectionHeader";
import SettingsSection from "../../../../../../assets/src/components/settings/Panels/PanelSettings/SettingsSection";
import CountDownOne from "./Templates/CountDownOne";
import {applyFilters} from "@wordpress/hooks";
import RadioTemplate from "sales-booster/src/components/settings/Panels/PanelSettings/Fields/RadioTemplate";
import CountDownTwo from "./Templates/CountDownTwo";

const Templates = ( { formData, setFormData, showUndoIcon } ) => {
    let templates = [
        { key: 'ct-layout-1', component: <CountDownOne /> },
        { key: 'ct-layout-2', component: <CountDownTwo /> },
    ];

    // List of sales countdown templates.
    templates = applyFilters(
        "sgsb_sales_countdown_timer_templates",
        templates,
    );

    let templateStyles = {
        'ct-layout-1' : {
            font_family              : 'roboto',
            border_color             : '#1677FF',
            day_text_color           : '#1B1B50',
            selected_theme           : 'ct-layout-1',
            hour_text_color          : '#1B1B50',
            minute_text_color        : '#1B1B50',
            second_text_color        : '#1B1B50',
            heading_text_color       : '#008dff',
            counter_border_color     : '#ECEDF0',
            widget_background_color  : '#FFFFFF',
            counter_background_color : '#FFFFFF',
        },
        'ct-layout-2' : {
            font_family              : 'merienda',
            border_color             : '#0875FF33',
            day_text_color           : '#FFFFFF',
            selected_theme           : 'ct-layout-2',
            hour_text_color          : '#FFFFFF',
            minute_text_color        : '#FFFFFF',
            second_text_color        : '#FFFFFF',
            heading_text_color       : 'transparent',
            counter_border_color     : 'transparent',
            widget_background_color  : '#eff8ff',
            counter_background_color : 'transparent',
        },
    };

    // Sales countdown template styles.
    templateStyles = applyFilters(
        "sgsb_countdown_timer_template_styles",
        templateStyles,
    );

    const onTemplateChange = ( name, value ) => {
        for ( let key in showUndoIcon ) {
            showUndoIcon[key] = false;
        }

        setFormData( {
            ...formData,
            ...templateStyles?.[ value ]
        } );
    };

    return (
        <Fragment>
            <SectionHeader title={ __( 'Template', 'storegrowth-sales-booster' ) } />
            <SettingsSection>
                <RadioTemplate
                    options={ templates }
                    name={ `selected_theme` }
                    changeHandler={ onTemplateChange }
                    fieldValue={ formData?.selected_theme }
                    classes={ `countdown-timer-templates` }
                />
            </SettingsSection>
        </Fragment>
    );
};

export default Templates;
