import { __ } from '@wordpress/i18n';
import { applyFilters } from '@wordpress/hooks';
import ColourPicker from "sales-booster/src/components/settings/Panels/PanelSettings/Fields/ColorPicker";
import SettingsSection from "sales-booster/src/components/settings/Panels/PanelSettings/SettingsSection";
import ActionsHandler from "sales-booster/src/components/settings/Panels/PanelSettings/ActionsHandler";
import RadioBox from "sales-booster/src/components/settings/Panels/PanelSettings/Fields/RadioBox";
import CartIcon from "./CartIcon";
import LayoutOption from './LayoutOption';
import BottomLeft from '../../images/cart-position/bottom-left.svg';
import CenterLeft from '../../images/cart-position/center-left.svg';
import TopLeft from '../../images/cart-position/top-left.svg';
import BottomRight from '../../images/cart-position/bottom-right.svg';
import CenterRight from '../../images/cart-position/center-right.svg';
import TopRight from '../../images/cart-position/top-right.svg';


const DesignSettings = ({
    formData,
    onFieldChange,
    onFormSave,
    buttonLoading,
    onFormReset
}) => {

    let positionContents = [
        {
            key  : 'bottom-right',
            icon : BottomRight,
            name : __( 'Bottom Right', 'storegrowth-sales-booster' )
        },
        {
            key  : 'top-left',
            icon : TopLeft,
            name : __( 'Top Left', 'storegrowth-sales-booster' )
        },
        {
            key  : 'top-right',
            icon : TopRight,
            name : __( 'Top Right', 'storegrowth-sales-booster' )
        },
        {
            key  : 'bottom-left',
            icon : BottomLeft,
            name : __( 'Bottom Left', 'storegrowth-sales-booster' )
        },
    ];

    const positionIcons = {
        'center_left': CenterLeft,
        'center_right': CenterRight,
    };

    positionContents = applyFilters(
        'sgsb_quick_cart_position_settings',
        positionContents,
        positionIcons
    );

    const positionOptions = positionContents?.map( layout => (
        {
            key      : layout?.key,
            disabled : layout?.disabled,
            value    : <LayoutOption src={ layout?.icon } name={ layout?.name } disabled={ layout?.disabled } />
        }
    ) );

    const iconStyleNames = [
        'shopping-cart-icon-1',
        'shopping-cart-icon-2',
        'shopping-cart-icon-3',
        'shopping-cart-icon-4',
        'shopping-cart-icon-5',
    ];

    const iconOptions = iconStyleNames?.map( iconStyleName => (
        { key: iconStyleName, value: <CartIcon activeIcon={ formData?.icon_name === iconStyleName } iconName={ iconStyleName } /> }
    ) );

    return (
        <SettingsSection>
            <RadioBox
                name={ `icon_position` }
                fieldWidth={ true }
                classes={ `radio-img-field quick-cart-position` }
                fieldValue={ formData.icon_position }
                changeHandler={ onFieldChange }
                options={ [ ...positionOptions ] }
                title={ __( `Cart Icon Position`, 'storegrowth-sales-booster' ) }
            />

            <RadioBox
                name={ `icon_name` }
                options={ [ ...iconOptions ] }
                changeHandler={ onFieldChange }
                classes={ `radio-icon-field quick-icon-layout` }
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
            <ColourPicker
                name={ `product_card_bg_color` }
                changeHandler={ onFieldChange }
                fieldValue={ formData.product_card_bg_color }
                title={ __( 'Product Card Backgorund Color', 'storegrowth-sales-booster' ) }
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
