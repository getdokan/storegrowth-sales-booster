import { __ } from "@wordpress/i18n";
import { useDispatch, useSelect } from '@wordpress/data';
import SectionHeader from "sales-booster/src/components/settings/Panels/SectionHeader";
import Number from "sales-booster/src/components/settings/Panels/PanelSettings/Fields/Number";
import SelectBox from "sales-booster/src/components/settings/Panels/PanelSettings/Fields/SelectBox";
import ColourPicker from "sales-booster/src/components/settings/Panels/PanelSettings/Fields/ColorPicker";
import SettingsSection from "sales-booster/src/components/settings/Panels/PanelSettings/SettingsSection";
import {Fragment} from "react";

const TemplateSection = () => {
    const { setCreateFromData } = useDispatch( 'sgsb_order_bump' );

    const { createBumpData } = useSelect( ( select ) => ( {
        createBumpData: select( 'sgsb_order_bump' ).getCreateFromData()
    } ) );

    const onFieldChange = ( key, value ) => {
        setCreateFromData( {
            ...createBumpData,
            [ key ]: value
        } );
    };

    const borders = [
        { value: 'dotted', label: __( 'Dotted', 'storegrowth-sales-booster' ) },
        { value: 'dashed', label: __( 'Dashed', 'storegrowth-sales-booster' ) },
        { value: 'solid', label: __( 'Solid', 'storegrowth-sales-booster' ) },
        { value: 'no_border', label: __( 'No Border', 'storegrowth-sales-booster' ) },
    ];

    return (
        <Fragment>
            {/* Render bump offer box settings section. */}
            <SectionHeader title={ __( 'Bump Offer Box', 'storegrowth-sales-booster' ) } />
            <SettingsSection>
                <SelectBox
                    options={ [ ...borders ] }
                    name={ `box_border_style` }
                    changeHandler={ onFieldChange }
                    fieldValue={ createBumpData.box_border_style }
                    title={ __( 'Overview Border', 'storegrowth-sales-booster' ) }
                    placeHolderText={ __( 'Change Overview Border', 'storegrowth-sales-booster' ) }
                    tooltip={ __( 'The Style of the order bump border.', 'storegrowth-sales-booster' ) }
                />
                <ColourPicker
                    name={ `box_border_color` }
                    changeHandler={ onFieldChange }
                    fieldValue={ createBumpData.box_border_color }
                    title={ __( 'Border Color', 'storegrowth-sales-booster' ) }
                    tooltip={ __( 'The color of the order bump color.', 'storegrowth-sales-booster' ) }
                />
                <Number
                    min={ 0 }
                    max={ 20 }
                    style={ { width: 100 } }
                    name={ `box_top_margin` }
                    changeHandler={ onFieldChange }
                    fieldValue={ createBumpData.box_top_margin }
                    title={ __('Top Margin', 'storegrowth-sales-booster' ) }
                />
                <Number
                    min={ 0 }
                    max={ 20 }
                    style={ { width: 100 } }
                    name={ `box_bottom_margin` }
                    changeHandler={ onFieldChange }
                    fieldValue={ createBumpData.box_bottom_margin }
                    title={ __( 'Bottom Margin', 'storegrowth-sales-booster' ) }
                />
            </SettingsSection>

            {/* Render discount settings section. */}
            <SectionHeader title={ __( 'Discount Section', 'storegrowth-sales-booster' ) } />
            <SettingsSection>
                <ColourPicker
                    changeHandler={ onFieldChange }
                    name={ `discount_background_color` }
                    fieldValue={ createBumpData.discount_background_color }
                    title={ __( 'Background Color', 'storegrowth-sales-booster' ) }
                    tooltip={ __( 'The background color of the discount heading.', 'storegrowth-sales-booster' ) }
                />
                <ColourPicker
                    name={ `discount_text_color` }
                    changeHandler={ onFieldChange }
                    fieldValue={ createBumpData.discount_text_color }
                    title={ __( 'Text Color', 'storegrowth-sales-booster' ) }
                    tooltip={ __( 'The text color of the discount text.', 'storegrowth-sales-booster' ) }
                />
                <Number
                    min={ 12 }
                    max={ 25 }
                    style={ { width: 100 } }
                    name={ `discount_font_size` }
                    changeHandler={ onFieldChange }
                    fieldValue={ createBumpData.discount_font_size }
                    title={ __( 'Font Size', 'storegrowth-sales-booster' ) }
                />
            </SettingsSection>

            {/* Render product settings section. */}
            <SectionHeader title={ __( 'Product Section', 'storegrowth-sales-booster' ) } />
            <SettingsSection style={ { marginBottom: 0 } }>
                <ColourPicker
                    changeHandler={ onFieldChange }
                    name={ `product_description_text_color` }
                    fieldValue={ createBumpData.product_description_text_color }
                    title={ __( 'Text Color', 'storegrowth-sales-booster' ) }
                    tooltip={ __( 'The text color of the product.', 'storegrowth-sales-booster' ) }
                />
                <Number
                    min={ 14 }
                    max={ 22 }
                    style={ { width: 100 } }
                    changeHandler={ onFieldChange }
                    name={ `product_description_font_size` }
                    fieldValue={ createBumpData.product_description_font_size }
                    title={ __( 'Font Size', 'storegrowth-sales-booster' ) }
                />
            </SettingsSection>
        </Fragment>
    );
}

export default TemplateSection;
