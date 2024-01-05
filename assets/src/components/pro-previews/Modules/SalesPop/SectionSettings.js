import { Fragment } from "react";
import { __ } from "@wordpress/i18n";
import { SelectBox } from "../../../settings/Panels";
import SectionHeader from "../../../settings/Panels/SectionHeader";
import InputNumber from "../../../settings/Panels/PanelSettings/Fields/Number";
import SettingsSection from "../../../settings/Panels/PanelSettings/SettingsSection";
import ColourPicker from "../../../settings/Panels/PanelSettings/Fields/ColorPicker";

const SectionSettings = ( {
    tooltip,
    fontName,
    fontSize,
    textTitle,
    fontColor,
    fontWeight,
    fontSizeName,
    fontWeightName,
} ) => {
    const fontWeights = [
        { value: '400', label: __( 'Normal', 'storegrowth-sales-booster' ) },
    ];

    return (
        <Fragment>
            <SectionHeader
                title={ textTitle }
                tooltip={ tooltip }
                showUpgrade={ true }
            />
            <SettingsSection>
                <ColourPicker
                    colSpan={ 12 }
                    name={ fontName }
                    needUpgrade={ true }
                    fieldValue={ fontColor }
                    title={ __( 'Color', 'storegrowth-sales-booster' ) }
                />
                <InputNumber
                    min={ 1 }
                    colSpan={ 12 }
                    needUpgrade={ true }
                    name={ fontSizeName }
                    fieldValue={ fontSize }
                    title={  __( 'Font size', 'storegrowth-sales-booster' ) }
                />
                <SelectBox
                    needUpgrade={ true }
                    name={ fontWeightName }
                    fieldValue={ fontWeight }
                    options={ [ ...fontWeights ] }
                    title={ __( 'Font weight', 'storegrowth-sales-booster' ) }
                />
            </SettingsSection>
        </Fragment>
    );
}

export default SectionSettings;
