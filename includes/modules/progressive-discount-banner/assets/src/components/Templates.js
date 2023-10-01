import { __ } from "@wordpress/i18n";
import { Fragment } from "react";
import SectionHeader from "../../../../../../assets/src/components/settings/Panels/SectionHeader";
import SettingsSection from "../../../../../../assets/src/components/settings/Panels/PanelSettings/SettingsSection";
import ShippingBarOne from "./Templates/ShippingBarOne";
import {applyFilters} from "@wordpress/hooks";
import RadioTemplate from "sales-booster/src/components/settings/Panels/PanelSettings/Fields/RadioTemplate";

const Templates = ( { formData, setFormData } ) => {
    let templates = [
        { key: 'shipping_bar_one', component: <ShippingBarOne /> },
    ];

    // List of shipping bar templates.
    templates = applyFilters(
        "sgsb_shipping_bar_templates",
        templates,
    );

    let templateStyles = {
        shipping_bar_one: {
            font_size               : 20,
            text_color              : "#ffffff",
            icon_color              : "#ffffff",
            font_family             : "poppins",
            bar_template            : 'shipping_bar_one',
            banner_height           : 60,
            close_icon_color        : "#ffffff",
            background_color        : "#0875FF",
            cart_minimum_amount     : 10,
            progressive_banner_text : __( 'Add more $10 to get FREE SHIPPING.', 'storegrowth-sales-booster' ),
        },
    };

    // Shipping bar template styles.
    templateStyles = applyFilters(
        "sgsb_shipping_bar_template_styles",
        templateStyles,
    );

    const onTemplateChange = ( name, value ) => {
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
                    name={ `bar_template` }
                    changeHandler={ onTemplateChange }
                    fieldValue={ formData?.bar_template }
                    classes={ `free-shipping-bar-templates` }
                />
            </SettingsSection>
        </Fragment>
    );
};

export default Templates;
