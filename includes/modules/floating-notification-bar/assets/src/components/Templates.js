import { __ } from "@wordpress/i18n";
import { Fragment } from "react";
import SectionHeader from "../../../../../../assets/src/components/settings/Panels/SectionHeader";
import SettingsSection from "../../../../../../assets/src/components/settings/Panels/PanelSettings/SettingsSection";
import NotifyBarOne from "./Templates/NotifyBarOne";
import {applyFilters} from "@wordpress/hooks";
import RadioTemplate from "sales-booster/src/components/settings/Panels/PanelSettings/Fields/RadioTemplate";

const Templates = ( { formData, setFormData } ) => {
    let templates = [
        { key: 'notify_bar_one', component: <NotifyBarOne /> },
    ];

    // List of shipping bar templates.
    templates = applyFilters(
        "sgsb_floating_notification_bar_templates",
        templates,
    );

    let templateStyles = {
        notify_bar_one: {
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

    // Shipping bar template styles.
    templateStyles = applyFilters(
        "sgsb_floating_notification_bar_template_styles",
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
                    name={ `notify_template` }
                    changeHandler={ onTemplateChange }
                    fieldValue={ formData?.notify_template }
                    classes={ `notify-bar-templates` }
                />
            </SettingsSection>
        </Fragment>
    );
};

export default Templates;
