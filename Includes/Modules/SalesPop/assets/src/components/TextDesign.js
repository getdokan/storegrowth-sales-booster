import { noop } from '../helper';
import { __ } from "@wordpress/i18n";
import SettingsSection from "../../../../../../assets/src/components/settings/Panels/PanelSettings/SettingsSection";
import ColourPicker from "../../../../../../assets/src/components/settings/Panels/PanelSettings/Fields/ColorPicker";
import SectionHeader from "../../../../../../assets/src/components/settings/Panels/SectionHeader";
import SelectBox from "../../../../../../assets/src/components/settings/Panels/PanelSettings/Fields/SelectBox";
import Number from "../../../../../../assets/src/components/settings/Panels/PanelSettings/Fields/Number";
const fontSizes = [ ...Array( 15 ).keys() ].map( value => {
    const pair = value + 10;
    return { value: pair, label: pair };
} );

const fontWeights = [
    { value: '400', label: __( 'Normal', 'storegrowth-sales-booster' ) },
    { value: '500', label: __( 'Medium', 'storegrowth-sales-booster' ) },
    { value: '700', label: __( 'Bold', 'storegrowth-sales-booster' ) },
];

const TextDesign = (props) => {
    const { upgradeTeaser } = props;

	return (
		<>
            <SectionHeader
                tooltip={ props?.tooltip }
                showUpgrade={ upgradeTeaser }
                title={ __( props?.textTitle, 'storegrowth-sales-booster' ) }
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
                <Number
                    min={ 1 }
                    colSpan={ 12 }
                    needUpgrade={ upgradeTeaser }
                    name={ props.fontSizeName }
                    fieldValue={ props.fontSize }
                    changeHandler={ upgradeTeaser ? noop : props.onFieldChange }
                    title={  __( 'Font size', 'storegrowth-sales-booster' ) }
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
