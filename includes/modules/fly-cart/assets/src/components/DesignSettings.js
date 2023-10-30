import { __ } from '@wordpress/i18n';
import { Button, Form, Input, Select, Typography } from "antd";
import SelectBox from "sales-booster/src/components/settings/Panels/PanelSettings/Fields/SelectBox";
import ColourPicker from "sales-booster/src/components/settings/Panels/PanelSettings/Fields/ColorPicker";
import SettingsSection from "sales-booster/src/components/settings/Panels/PanelSettings/SettingsSection";
import ActionsHandler from "sales-booster/src/components/settings/Panels/PanelSettings/ActionsHandler";
import RadioBox from "sales-booster/src/components/settings/Panels/PanelSettings/Fields/RadioBox";
import CartIcon from "./CartIcon";

const DesignSettings = ({
    formData,
    onFieldChange,
    onFormSave,
    buttonLoading,
    onFormReset
}) => {
    const iconPositions = [
        { value: 'top-left', label: __( 'Top Left', 'storegrowth-sales-booster' ) },
        { value: 'top-right', label: __( 'Top Right', 'storegrowth-sales-booster' ) },
        { value: 'bottom-left', label: __( 'Bottom Left', 'storegrowth-sales-booster' ) },
        { value: 'bottom-right', label: __( 'Bottom Right', 'storegrowth-sales-booster' ) },
    ];

    const iconStyleNames = [
        'shopping-cart-icon-1',
        'shopping-cart-icon-2',
        'shopping-cart-icon-3',
        'shopping-cart-icon-4',
    ];

    const iconOptions = iconStyleNames?.map( iconStyleName => (
        { key: iconStyleName, value: <CartIcon activeIcon={ formData?.icon_name === iconStyleName } iconName={ iconStyleName } /> }
    ) );

    return (
        <SettingsSection>
            <SelectBox
                name={ `icon_position` }
                changeHandler={ onFieldChange }
                options={ [ ...iconPositions ] }
                fieldValue={ formData.icon_position }
                title={ __( 'Cart Icon Position', 'storegrowth-sales-booster' ) }
            />
            <RadioBox
                name={ `icon_name` }
                options={ [ ...iconOptions ] }
                changeHandler={ onFieldChange }
                fieldValue={ formData.icon_name }
                title={ __( `Cart Icon`, 'storegrowth-sales-booster' ) }
            />
            <ColourPicker
                name={ `buttons_bg_color` }
                changeHandler={ onFieldChange }
                fieldValue={ formData.buttons_bg_color }
                title={ __( 'Action Buttons Background', 'storegrowth-sales-booster' ) }
            />
            <ColourPicker
                name={ `shopping_button_bg_color` }
                changeHandler={ onFieldChange }
                fieldValue={ formData.shopping_button_bg_color }
                title={ __( 'Shopping Button Background', 'storegrowth-sales-booster' ) }
            />
            <ColourPicker
                name={ `icon_color` }
                changeHandler={ onFieldChange }
                fieldValue={ formData.icon_color }
                title={ __( 'Cart Icon Color', 'storegrowth-sales-booster' ) }
            />
            <ColourPicker
                name={ `widget_bg_color` }
                changeHandler={ onFieldChange }
                fieldValue={ formData.widget_bg_color }
                title={ __( 'Widget Background Color', 'storegrowth-sales-booster' ) }
            />
        <ActionsHandler
          saveHandler={ onFormSave }
          resetHandler={ onFormReset }
          loadingHandler={ buttonLoading }
        />
        </SettingsSection>
    );
}

export default DesignSettings;
