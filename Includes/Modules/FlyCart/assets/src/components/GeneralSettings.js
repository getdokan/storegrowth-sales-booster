import { __ } from "@wordpress/i18n";
import LayoutOption from "./LayoutOption";
import { applyFilters } from '@wordpress/hooks';
import SideCartLayout from '../../images/side-cart-layout.svg';
import CenteredPopupLayout from '../../images/centered-popup-layout.svg';
import SettingsSection from "sales-booster/src/components/settings/Panels/PanelSettings/SettingsSection";
import ActionsHandler from "sales-booster/src/components/settings/Panels/PanelSettings/ActionsHandler";
import RadioBox from "sales-booster/src/components/settings/Panels/PanelSettings/Fields/RadioBox";
import ContentGroup from "./ContentGroup";

const GeneralSettings = ({
    onFormSave,
    formData,
    onFieldChange,
    onFormReset,
    buttonLoading
}) => {
    let layoutContents = [
        {
            key  : 'side',
            icon : SideCartLayout,
            name : __( 'Side Cart', 'storegrowth-sales-booster' )
        },
    ];

    layoutContents = applyFilters(
        'sgsb_quick_cart_layout_settings',
        layoutContents,
        CenteredPopupLayout
    );

    const layoutOptions = layoutContents?.map( layout => (
        {
            key      : layout?.key,
            disabled : layout?.disabled,
            value    : <LayoutOption src={ layout?.icon } name={ layout?.name } disabled={ layout?.disabled } />
        }
    ) );

    let contentOptions = [
        { name: 'show_product_image', title: __( 'Show Product Image', 'storegrowth-sales-booster' ) },
        { name: 'show_remove_icon', title: __( 'Show Remove Icon', 'storegrowth-sales-booster' ) },
        { name: 'show_quantity_picker', title: __( 'Show Quantity Picker', 'storegrowth-sales-booster' ) },
        { name: 'show_product_price', title: __( 'Show product price', 'storegrowth-sales-booster' ) },
    ];

    contentOptions = applyFilters( 'sgsb_quick_cart_content_settings', contentOptions );

    return (
        <SettingsSection>
            <RadioBox
                name={ `layout` }
                fieldWidth={ true }
                classes={ `radio-img-field quick-cart-layout` }
                fieldValue={ formData.layout }
                changeHandler={ onFieldChange }
                options={ [ ...layoutOptions ] }
                title={ __( `Layout:`, 'storegrowth-sales-booster' ) }
            />
            <ContentGroup
                formData={ formData }
                changeHandler={ onFieldChange }
                options={ [ ...contentOptions ] }
                title={ __( 'Cart Contents:', 'storegrowth-sales-booster' ) }
            />
            <ActionsHandler
                saveHandler={ () => onFormSave('general_settings')  }
                resetHandler={ onFormReset }
                loadingHandler={ buttonLoading }
            />
        </SettingsSection>
    );
}

export default GeneralSettings;
