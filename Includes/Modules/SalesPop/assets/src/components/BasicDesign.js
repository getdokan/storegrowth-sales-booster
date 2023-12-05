import { noop } from '../helper';
import { __ } from '@wordpress/i18n';
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
		<>
            <SettingsSection>
                <Switcher
                    name={ 'image_style' }
                    disabled={ upgradeTeaser }
                    changeHandler={ props.onFieldChange }
                    isEnable={ Boolean( props.createPopupForm.image_style ) }
                    title={ __( 'Image Style', 'storegrowth-sales-booster' ) }
                    tooltip={ __( 'Will be able to achieve the control of the image style in the popup.', 'storegrowth-sales-booster' ) }
                />
                { Boolean( props.createPopupForm.image_style ) && (
                    <Fragment>
                        <Number
                            min={ 1 }
                            max={ 20 }
                            colSpan={ 12 }
                            needUpgrade={ upgradeTeaser }
                            name={ `spacing_around_image` }
                            fieldValue={ props.createPopupForm.spacing_around_image }
                            changeHandler={ upgradeTeaser ? noop : props.onFieldChange }
                            title={ __( 'Image Spacing', 'storegrowth-sales-booster' ) }
                            tooltip={ __( 'Apply spacing around the image.', 'storegrowth-sales-booster' ) }
                            placeHolderText={ __( 'Enter the gap of popup image content', 'storegrowth-sales-booster' ) }
                        />
                        <Number
                            min={ 1 }
                            max={ 100 }
                            colSpan={ 12 }
                            needUpgrade={ upgradeTeaser }
                            name={ `popup_image_border_radius` }
                            changeHandler={ upgradeTeaser ? noop : props.onFieldChange }
                            fieldValue={ props.createPopupForm.popup_image_border_radius }
                            title={ __( 'Image Radius', 'storegrowth-sales-booster' ) }
                            tooltip={ __( 'Apply radius around the image.', 'storegrowth-sales-booster' ) }
                            placeHolderText={ __( 'Enter border radius of popup', 'storegrowth-sales-booster' ) }
                        />
                        <SelectBox
                            colSpan={ 12 }
                            name={ `image_position` }
                            options={ [ ...imgPositions ] }
                            needUpgrade={ upgradeTeaser }
                            fieldValue={ props.createPopupForm.image_position }
                            changeHandler={ upgradeTeaser ? noop : props.onFieldChange }
                            title={ __( 'Image Position', 'storegrowth-sales-booster' ) }
                            tooltip={ __( 'Define the position of the image in the popup it can be either ‘left’ or ‘right’.', 'storegrowth-sales-booster' ) }
                        />
                        <Number
                            min={ 1 }
                            colSpan={ 12 }
                            needUpgrade={ upgradeTeaser }
                            name={ `popup_image_width` }
                            changeHandler={ upgradeTeaser ? noop : props.onFieldChange }
                            fieldValue={ props.createPopupForm.popup_image_width }
                            title={ __( 'Image Width', 'storegrowth-sales-booster' ) }
                            tooltip={ __( 'Change the width size of the image.', 'storegrowth-sales-booster' ) }
                        />
                    </Fragment>
                ) }
                <Switcher
                    name={ 'popup_style' }
                    changeHandler={ props.onFieldChange }
                    title={ __( 'Popup Style', 'storegrowth-sales-booster' ) }
                    isEnable={ Boolean( props.createPopupForm.popup_style ) }
                    tooltip={ __( 'Will be able to achieve the control of the popup style in the popup.', 'storegrowth-sales-booster' ) }
                />
                { Boolean( props.createPopupForm.popup_style ) && (
                    <Fragment>
                        <ColourPicker
                            name={ `background_color` }
                            needUpgrade={ upgradeTeaser }
                            fieldValue={ props.createPopupForm.background_color }
                            changeHandler={ upgradeTeaser ? noop : props.onFieldChange }
                            title={ __( 'Background Color', 'storegrowth-sales-booster' ) }
                            tooltip={ __( 'Set a background color for the pop up', 'storegrowth-sales-booster' ) }
                        />
                        <SelectBox
                            name={ `popup_position` }
                            options={ [ ...popupPositions ] }
                            needUpgrade={ upgradeTeaser }
                            fieldValue={ props.createPopupForm.popup_position }
                            changeHandler={ upgradeTeaser ? noop : props.onFieldChange }
                            title={ __( 'Popup Position', 'storegrowth-sales-booster' ) }
                            tooltip={ __( 'Set the position of the popup in the store.', 'storegrowth-sales-booster' ) }
                        />
                        <Number
                            min={ 1 }
                            max={ 20 }
                            colSpan={ 12 }
                            needUpgrade={ upgradeTeaser }
                            name={ `popup_border_radius` }
                            fieldValue={ props.createPopupForm.popup_border_radius }
                            changeHandler={ upgradeTeaser ? noop : props.onFieldChange }
                            title={ __( 'Border radius', 'storegrowth-sales-booster' ) }
                            tooltip={ __( 'Set border radius for the popup.', 'storegrowth-sales-booster' ) }
                            placeHolderText={ __( 'Enter border radius of popup', 'storegrowth-sales-booster' ) }
                        />
                        <Number
                            min={ 1 }
                            max={ 20 }
                            colSpan={ 12 }
                            name={ `popup_width` }
                            needUpgrade={ upgradeTeaser }
                            fieldValue={ props.createPopupForm.popup_width }
                            changeHandler={ upgradeTeaser ? noop : props.onFieldChange }
                            title={ __( 'Popup Width', 'storegrowth-sales-booster' ) }
                            placeHolderText={ __( 'Enter popup with', 'storegrowth-sales-booster' ) }
                            tooltip={ __( 'Set the width of the popup.', 'storegrowth-sales-booster' ) }
                        />
                    </Fragment>
                ) }
            </SettingsSection>
			<SectionSpacer />
            <SettingsSection>
                <Switcher
                    needUpgrade={ upgradeTeaser }
                    changeHandler={ props.onFieldChange }
                    name={ 'open_product_link_in_new_tab' }
                    isEnable={ Boolean( props.createPopupForm.open_product_link_in_new_tab ) }
                    title={ __( 'Open product link in new tab', 'storegrowth-sales-booster' ) }
                    tooltip={ __( 'By clicking on the product the link will open in the new tab.', 'storegrowth-sales-booster' ) }
                />
                <Switcher
                    needUpgrade={ upgradeTeaser }
                    name={ 'link_image_to_product' }
                    changeHandler={ props.onFieldChange }
                    isEnable={ Boolean( props.createPopupForm.link_image_to_product ) }
                    title={ __( 'Link image to product page', 'storegrowth-sales-booster' ) }
                    tooltip={ __( 'The image will have an embedded link that will take to the product page.', 'storegrowth-sales-booster' ) }
                />
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
		</>
	)
}


export default BasicDesign;
