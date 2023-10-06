import { __ } from "@wordpress/i18n";
import { Fragment } from "react";
import SectionHeader from "../../../../../../assets/src/components/settings/Panels/SectionHeader";
import SettingsSection from "../../../../../../assets/src/components/settings/Panels/PanelSettings/SettingsSection";
import CountDownOne from "./Templates/CountDownOne";
import {applyFilters} from "@wordpress/hooks";
import RadioTemplate from "sales-booster/src/components/settings/Panels/PanelSettings/Fields/RadioTemplate";
import CountDownTwo from "./Templates/CountDownTwo";

const Templates = ( { formData, setFormData } ) => {
    let templates = [
        { key: 'ct-layout-1', component: <CountDownOne /> },
        { key: 'ct-layout-3', component: <CountDownTwo /> },
    ];

    // List of sales countdown templates.
    templates = applyFilters(
        "sgsb_sales_countdown_timer_templates",
        templates,
    );

    let templateStyles = {
        'ct-layout-1' : {
            font_size               : 20,
            text_color              : '#ffffff',
            icon_color              : '#ffffff',
            font_family             : 'poppins',
            button_color            : '#ffffff',
            bar_template            : 'shipping_bar_one',
            banner_height           : 60,
            ac_button_text          : __( 'Shop Now', 'storegrowth-sales-booster' ),
            close_icon_color        : '#ffffff',
            background_color        : '#0875FF',
            button_text_color       : '#000000',
            cart_minimum_amount     : 10,
            progressive_banner_text : __( 'Add more $10 to get FREE SHIPPING.', 'storegrowth-sales-booster' ),
        },
        'ct-layout-2' : {
            font_size               : 20,
            text_color              : '#ffffff',
            icon_color              : '#ffffff',
            font_family             : 'poppins',
            button_color            : '#ffffff',
            bar_template            : 'shipping_bar_one',
            banner_height           : 60,
            ac_button_text          : __( 'Shop Now', 'storegrowth-sales-booster' ),
            close_icon_color        : '#ffffff',
            background_color        : '#0875FF',
            button_text_color       : '#000000',
            cart_minimum_amount     : 10,
            progressive_banner_text : __( 'Add more $10 to get FREE SHIPPING.', 'storegrowth-sales-booster' ),
        },
    };

    // Sales countdown template styles.
    templateStyles = applyFilters(
        "sgsb_countdown_timer_template_styles",
        templateStyles,
    );

    const onTemplateChange = ( name, value ) => {
        console.log( name, value );
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
