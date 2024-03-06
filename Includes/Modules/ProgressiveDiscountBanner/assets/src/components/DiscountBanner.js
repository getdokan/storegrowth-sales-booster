import { Fragment } from "react";
import { __ } from "@wordpress/i18n";
import { useState } from "@wordpress/element";
import { applyFilters } from '@wordpress/hooks';
import SelectBox from "../../../../../../assets/src/components/settings/Panels/PanelSettings/Fields/SelectBox";
import Number from "../../../../../../assets/src/components/settings/Panels/PanelSettings/Fields/Number";
import TextAreaBox from "../../../../../../assets/src/components/settings/Panels/PanelSettings/Fields/TextAreaBox";
import SettingsSection from "../../../../../../assets/src/components/settings/Panels/PanelSettings/SettingsSection";
import BarIcon from "./BarIcon";
import SettingInstruction from "./SettingInstruction";
import Switcher from "sales-booster/src/components/settings/Panels/PanelSettings/Fields/Switcher";
import TextInput from "sales-booster/src/components/settings/Panels/PanelSettings/Fields/TextInput";

function DiscountBanner(props) {
    const { isValid, formData, setFormData, setShowUndo, onFieldChange } = props;

    const barTypes = [
        {
            value: "normal",
            label: __("Normal", "storegrowth-sales-booster"),
        },
        {
            value: "sticky",
            label: __("Sticky", "storegrowth-sales-booster"),
        },
    ];

    const discountTypes = [
        {
            value: "free-shipping",
            label: __("Free Shipping", "storegrowth-sales-booster"),
        },
        {
            value: "discount-amount",
            label: __("Discount Amount", "storegrowth-sales-booster"),
        },
    ];
    const discountModes = [
        {
            value: "fixed-amount",
            label: __("Fixed Amount", "storegrowth-sales-booster"),
        },
        {
            value: "percentage",
            label: __("Percentage", "storegrowth-sales-booster"),
        },
    ];
    const { discount_amount_mode } = formData;
    const discount_mode_text = discount_amount_mode === "fixed-amount" ? "Amount" : "Percentage";
    const discount_mode_symbol = discount_amount_mode === "fixed-amount" ? sgsbAdmin.currencySymbol : "%";


    const iconStyleNames = [
        'shipping-bar-icon-1',
        'shipping-bar-icon-2',
        'shipping-bar-icon-3',
    ];

    const iconOptions = iconStyleNames?.map( iconStyleName => (
        { key: iconStyleName, value: <BarIcon activeIcon={ formData?.progressive_banner_icon_name === iconStyleName } iconName={ iconStyleName } /> }
    ) );

    const onBarChange = ( key, value ) => {
        setFormData( {
            ...formData,
            [ key ]: value,
            progressive_banner_custom_icon : '',
        } );
        setShowUndo( true );
    };

    return (
        <Fragment>
            <SettingsSection>
                { applyFilters(
                    'sgsb_free_shipping_bar_position_settings',
                    '',
                    formData,
                    onFieldChange
                ) }
                <SelectBox
                    name={`bar_type`}
                    options={[...barTypes]}
                    fieldValue={formData.bar_type}
                    changeHandler={onFieldChange}
                    title={__("Bar Type", "storegrowth-sales-booster")}
                />
                <SelectBox
                    name={`discount_type`}
                    options={[...discountTypes]}
                    fieldValue={formData.discount_type}
                    changeHandler={onFieldChange}
                    title={__("Discount Type", "storegrowth-sales-booster")}
                    tooltip={__(
                        `Choose 'Free Shipping' for shipping discounts or 'Discount Amount' for product price reductions.`,
                        "storegrowth-sales-booster"
                    )}
                />

                {formData.discount_type === "free-shipping" && 
                    <SettingInstruction/>
                }

                {formData.discount_type === "discount-amount" && (
                    <Fragment>
                        <SelectBox
                            name={`discount_amount_mode`}
                            options={[...discountModes]}
                            fieldValue={formData.discount_amount_mode}
                            changeHandler={onFieldChange}
                            title={__("Discount Mode", "storegrowth-sales-booster")}
                        />
                        <Number
                            min={0}
                            addonBefore={`${discount_mode_symbol}`}
                            name={`discount_amount_value`}
                            changeHandler={onFieldChange}
                            fieldValue={formData.discount_amount_value}
                            title={__(
                                `Discount ${discount_mode_text}`,
                                "storegrowth-sales-booster"
                            )}
                        />
                    </Fragment>
                )}

                <Number
                    min={0}
                    addonBefore={`${sgsbAdmin.currencySymbol}`}
                    name={`cart_minimum_amount`}
                    changeHandler={onFieldChange}
                    fieldValue={formData.cart_minimum_amount}
                    title={__("Cart Minimum Amount", "storegrowth-sales-booster")}
                    placeHolderText={__(
                        "Require minimum amount in customer cart to avail this discount.",
                        "storegrowth-sales-booster"
                    )}
                    tooltip={__(
                        "Require minimum amount in customer cart to avail this discount.",
                        "storegrowth-sales-booster"
                    )}
                />

                { applyFilters(
                    'sgsb_free_shipping_bar_icon_radio_box',
                    '',
                    iconOptions,
                    formData,
                    onBarChange,
                    setFormData
                ) }

                <TextAreaBox
                    areaRows={3}
                    colSpan={24}
                    name={"progressive_banner_text"}
                    fieldValue={formData.progressive_banner_text}
                    changeHandler={onFieldChange}
                    title={__("Banner Text", "storegrowth-sales-booster")}
                    placeHolderText={__(
                        `Add more [amount] to get free shipping.`,
                        "storegrowth-sales-booster"
                    )}
                    tooltip={__(
                        "This banner will be shown to customers when the cart amount is less than the required minimum amount. [amount] will be replaced with the real amount.",
                        "storegrowth-sales-booster"
                    )}
                />

                <TextAreaBox
                    areaRows={3}
                    colSpan={24}
                    name={"goal_completion_text"}
                    fieldValue={formData.goal_completion_text}
                    changeHandler={onFieldChange}
                    title={__("Goal Completion Text", "storegrowth-sales-booster")}
                    placeHolderText={__(
                        `You have successfully acquired free shipping.`,
                        "storegrowth-sales-booster"
                    )}
                    tooltip={__(
                        "This banner will be shown to customers when the cart amount exceeds the required minimum amount.",
                        "storegrowth-sales-booster"
                    )}
                />

                <Switcher
                    name={ 'btn_style' }
                    changeHandler={ onFieldChange }
                    isEnable={ Boolean( formData.btn_style ) }
                    title={ __( 'Display CTA Button', 'storegrowth-sales-booster' ) }
                    tooltip={ __( 'Will be able to achieve the control call to action button.', 'storegrowth-sales-booster' ) }
                />

                { Boolean( formData.btn_style ) && (
                    <Fragment>
                        <TextInput
                            name={ 'btn_text' }
                            placeHolderText={ __(
                                'Write CTA button text',
                                'storegrowth-sales-booster'
                            ) }
                            fieldValue={ formData.btn_text }
                            className={ `settings-field input-field` }
                            changeHandler={ onFieldChange }
                            title={ __( 'CTA Name', 'storegrowth-sales-booster' ) }
                            tooltip={ __(
                                'The name of call to action button',
                                'storegrowth-sales-booster'
                            ) }
                        />
                        <TextInput
                            type={ 'url' }
                            name={ 'btn_target' }
                            placeHolderText={ __(
                                'Write CTA button target url',
                                'storegrowth-sales-booster'
                            ) }
                            fieldValue={ formData.btn_target }
                            className={ !isValid ? 'error' : '' }
                            changeHandler={ onFieldChange }
                            title={ __( 'CTA Target URI', 'storegrowth-sales-booster' ) }
                            tooltip={ __(
                                'The target/redirect url for call to action button',
                                'storegrowth-sales-booster'
                            ) }
                        />
                    </Fragment>
                ) }
            </SettingsSection>
            <SettingsSection>
                { applyFilters(
                    'sgsb_free_shipping_bar_display_rules_settings',
                    '',
                    formData,
                    onFieldChange
                ) }
            </SettingsSection>
        </Fragment>
    );
}

export default DiscountBanner;
