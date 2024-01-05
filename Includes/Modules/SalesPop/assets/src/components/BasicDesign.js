import { noop } from '../helper';
import { __ } from '@wordpress/i18n';
import { applyFilters } from '@wordpress/hooks';
import SettingsSection from "../../../../../../assets/src/components/settings/Panels/PanelSettings/SettingsSection";
import ColourPicker from "../../../../../../assets/src/components/settings/Panels/PanelSettings/Fields/ColorPicker";
import Switcher from "../../../../../../assets/src/components/settings/Panels/PanelSettings/Fields/Switcher";
import SectionSpacer from "../../../../../../assets/src/components/settings/Panels/PanelSettings/SectionSpacer";
import SelectBox from "../../../../../../assets/src/components/settings/Panels/PanelSettings/Fields/SelectBox";
import { Fragment } from "react";
import Number from "../../../../../../assets/src/components/settings/Panels/PanelSettings/Fields/Number";

const BasicDesign = (props) => {

    const isProEnabled = sgsbAdmin.isPro;
    const upgradeTeaser = !isProEnabled;

    const imgPositions = [
        { value: 'left', label: __( 'Left', 'storegrowth-sales-booster' ) },
        { value: 'right', label: __( 'Right', 'storegrowth-sales-booster' ) },
    ];

    const imageWidth = [ ...Array( 9 ).keys() ].map( value => {
        const pair = value + 72;
        return { value: pair, label: pair };
    } );

    const popupPositions = [
        { value: 'left_bottom', label: __( 'Left Bottom', 'storegrowth-sales-booster' ) },
        { value: 'right_bottom', label: __( 'Right Bottom', 'storegrowth-sales-booster' ) },
        { value: 'left_top', label: __( 'Left Top', 'storegrowth-sales-booster' ) },
        { value: 'right_top', label: __( 'Right Top', 'storegrowth-sales-booster' ) },
    ];
  
	return (
		<Fragment>
            <SettingsSection>
                <Switcher
                    name={ 'image_style' }
                    disabled={ upgradeTeaser }
                    changeHandler={ props.onFieldChange }
                    isEnable={ Boolean( props.createPopupForm.image_style ) }
                    title={ __( 'Image Style', 'storegrowth-sales-booster' ) }
                    tooltip={ __( 'Will be able to achieve the control of the image style in the popup.', 'storegrowth-sales-booster' ) }
                />

                {/* Rendered sales pop image style settings. */}
                { Boolean( props.createPopupForm.image_style ) && (
                    applyFilters(
                        'sgsb_sales_pop_image_style_settings',
                        '',
                        props.createPopupForm,
                        props.onFieldChange
                    )
                ) }

                <Switcher
                    name={ 'popup_style' }
                    changeHandler={ props.onFieldChange }
                    title={ __( 'Popup Style', 'storegrowth-sales-booster' ) }
                    isEnable={ Boolean( props.createPopupForm.popup_style ) }
                    tooltip={ __( 'Will be able to achieve the control of the popup style in the popup.', 'storegrowth-sales-booster' ) }
                />

                {/* Rendered sales popup style settings. */}
                { Boolean( props.createPopupForm.popup_style ) && (
                    applyFilters(
                        'sgsb_sales_popup_style_settings',
                        '',
                        props.createPopupForm,
                        props.onFieldChange
                    )
                ) }
            </SettingsSection>
			<SectionSpacer />
            <SettingsSection>
                {/* Rendered sales pop action settings. */}
                { applyFilters(
                    'sgsb_sales_pop_action_settings',
                    '',
                    props.createPopupForm,
                    props.onFieldChange
                ) }

                <Switcher
                    name={ 'show_close_button' }
                    changeHandler={ props.onFieldChange }
                    isEnable={ Boolean( props.createPopupForm.show_close_button ) }
                    title={ __( 'Show close button', 'storegrowth-sales-booster' ) }
                    tooltip={ __( 'The visibility control of the close button.', 'storegrowth-sales-booster' ) }
                />
                <Switcher
                    name={ 'text_style' }
                    changeHandler={ props.onFieldChange }
                    isEnable={ Boolean( props.createPopupForm.text_style ) }
                    title={ __( 'Text Style', 'storegrowth-sales-booster' ) }
                    tooltip={ __( 'By enabling  to control the styling of the text in the sales pop.', 'storegrowth-sales-booster' ) }
                />
            </SettingsSection>
		</Fragment>
	)
}


export default BasicDesign;
