import { Fragment } from "react";
import { __ } from "@wordpress/i18n";
import { applyFilters } from '@wordpress/hooks';
import SelectBox from "../../../../../../assets/src/components/settings/Panels/PanelSettings/Fields/SelectBox";
import Number from "../../../../../../assets/src/components/settings/Panels/PanelSettings/Fields/Number";
import TextAreaBox from "../../../../../../assets/src/components/settings/Panels/PanelSettings/Fields/TextAreaBox";
import SettingsSection from "../../../../../../assets/src/components/settings/Panels/PanelSettings/SettingsSection";
// import DisplayRules from "sales-booster/src/components/pro-previews/free-shipping-bar/DisplayRules";
// import DisplayRules from "./DisplayRules";
import BarIcon from "./BarIcon";
import {wpMedia} from "sales-booster/src/utils/helper";
import SettingInstruction from "./SettingInstruction";

function DiscountBanner(props) {
    const { formData, setFormData, onFieldChange, upgradeTeaser } = props;

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

    const noop = () => {};

    const iconStyleNames = [
        'shipping-bar-icon-1',
        'shipping-bar-icon-2',
        'shipping-bar-icon-3',
    ];

    const iconOptions = iconStyleNames?.map( iconStyleName => (
        { key: iconStyleName, value: <BarIcon activeIcon={ formData?.progressive_banner_icon_name === iconStyleName } iconName={ iconStyleName } /> }
    ) );

    const handleMediaUpload = () => {
        wpMedia( {
            fileType: 'image',
            selectMultiple: false,
            callback: handleAttachmentData,
        } );
    };

    const handleAttachmentData = ( media ) => {
        if ( !Boolean( media?.url ) ) return;

        setFormData({
            ...formData,
            progressive_banner_icon_name   : '',
            progressive_banner_custom_icon : media?.url,
        });
    };

    const handleSelectionRemove = () => {
        setFormData({
            ...formData,
            progressive_banner_custom_icon : '',
            progressive_banner_icon_name   : iconStyleNames?.[0],
        });
    };

    const onBarChange = ( key, value ) => {
        setFormData( {
            ...formData,
            [ key ]: value,
            progressive_banner_custom_icon : '',
        } );
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
                    onBarChange
                ) }

                {/* <RadioBox
                    uploadOption={ upgradeTeaser ? 'pro' : true }
                    options={ [ ...iconOptions ] }
                    name={ `progressive_banner_icon_name` }
                    changeHandler={ onBarChange }
                    uploadHandler={ upgradeTeaser ? noop : handleMediaUpload }
                    iconRemoveHandler={ upgradeTeaser ? noop : handleSelectionRemove }
                    title={ __( `Banner Icon`, 'storegrowth-sales-booster' ) }
                    customValue={ formData.progressive_banner_custom_icon }
                    fieldValue={ formData.progressive_banner_icon_name }
                /> */}

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
