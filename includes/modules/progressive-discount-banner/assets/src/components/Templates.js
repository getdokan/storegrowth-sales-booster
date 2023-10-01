import { __ } from "@wordpress/i18n";
import { Fragment } from "react";
import SectionHeader from "../../../../../../assets/src/components/settings/Panels/SectionHeader";
import SettingsSection from "../../../../../../assets/src/components/settings/Panels/PanelSettings/SettingsSection";
import ShippingBarOne from "./Templates/ShippingBarOne";
import {applyFilters} from "@wordpress/hooks";
import RadioTemplate from "sales-booster/src/components/settings/Panels/PanelSettings/Fields/RadioTemplate";

const Templates = ( {
    formData,
    onFieldChange,
    onFormSave,
    buttonLoading,
    upgradeTeaser,
    fontFamily,
} ) => {

    let templates = [
        { key: 'shipping_bar_one', component: <ShippingBarOne formData={ formData } /> },
    ];

    // List of shipping bar templates.
    templates = applyFilters(
        "sgsb_shipping_bar_templates",
        templates,
    );

    return (
        <Fragment>
            <SectionHeader title={ __( 'Template', 'storegrowth-sales-booster' ) } />
            <SettingsSection>
                <RadioTemplate
                    options={ templates }
                    classes={ `free-shipping-bar-templates` }
                    // name,
                    // classes,
                    // options,
                    // fieldValue,
                    // changeHandler,
                />
            </SettingsSection>
        </Fragment>
    );
};

export default Templates;
