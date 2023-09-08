import { noop } from '../helper';
import { __ } from "@wordpress/i18n";
import SettingsSection from "../../../../../../assets/src/components/settings/Panels/PanelSettings/SettingsSection";
import ColourPicker from "../../../../../../assets/src/components/settings/Panels/PanelSettings/Fields/ColorPicker";
import SectionHeader from "../../../../../../assets/src/components/settings/Panels/SectionHeader";
import SelectBox from "../../../../../../assets/src/components/settings/Panels/PanelSettings/Fields/SelectBox";

const fontSizes = [ ...Array( 14 ).keys() ].map( value => {
    const pair = value + 12;
    return { value: pair, label: pair };
} );

const fontWeights = [
    { value: 'bold', label: __( 'Bold', 'storegrowth-sales-booster' ) },
    { value: 'normal', label: __( 'Normal', 'storegrowth-sales-booster' ) },
]

const TextDesign = (props) => {

    const {upgradeTeaser} = props;
	return (
		<>
            <SectionHeader
                showUpgrade={ upgradeTeaser }
                title={ __( props.textTitle, 'storegrowth-sales-booster' ) }
            />
            <SettingsSection>
                <ColourPicker
                    colSpan={ 12 }
                    name={ props.fontName }
                    needUpgrade={ upgradeTeaser }
                    fieldValue={ props.fontColor }
                    changeHandler={ upgradeTeaser ? noop : props.onFieldChange }
                    title={ __( 'Color', 'storegrowth-sales-booster' ) }
                />
                <SelectBox
                    colSpan={ 12 }
                    name={ props.fontSizeName }
                    options={ [ ...fontSizes ] }
                    fieldValue={ props.fontSize }
                    needUpgrade={ upgradeTeaser }
                    changeHandler={ upgradeTeaser ? noop : props.onFieldChange }
                    title={ __( 'Font size', 'storegrowth-sales-booster' ) }
                />
                <SelectBox
                    name={ props.fontWeightName }
                    needUpgrade={ upgradeTeaser }
                    options={ [ ...fontWeights ] }
                    fieldValue={ props.fontWeight }
                    changeHandler={ upgradeTeaser ? noop : props.onFieldChange }
                    title={ __( 'Font weight', 'storegrowth-sales-booster' ) }
                />
            </SettingsSection>
		</>
	)
}


export default TextDesign;
