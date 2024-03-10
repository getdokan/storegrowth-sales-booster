import { __ } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';
import TextInput from "../../../settings/Panels/PanelSettings/Fields/TextInput";
import SingleCheckBox from "../../../settings/Panels/PanelSettings/Fields/SingleCheckBox";
import {Fragment} from "react";
import {SelectBox} from "../../../settings/Panels";
import InputNumber from "../../../settings/Panels/PanelSettings/Fields/Number";
import ColourPicker from "../../../settings/Panels/PanelSettings/Fields/ColorPicker";

// Handle direct checkout modules pro settings prompts.
addFilter(
    'sgsb_prepend_direct_checkout_settings',
    'sgsb_prepend_direct_checkout_settings_callback',
    () => {
        return (
            <TextInput
                needUpgrade={ true }
                name={ 'buy_now_button_label' }
                className={ `settings-field input-field` }
                fieldValue={ __( 'Buy Now', 'storegrowth-sales-booster' ) }
                title={ __( 'Buy Now Button Label', 'storegrowth-sales-booster' ) }
                placeHolderText={ __('Buy Now Label', 'storegrowth-sales-booster' ) }
                tooltip={ __(
                    'This will be the set the Label of the Buy Now Button',
                    'storegrowth-sales-booster'
                ) }
            />
        );
    }
);
addFilter(
    'sgsb_direct_checkout_button_layout_options',
    'sgsb_direct_checkout_button_layout_options_callback',
    ( buttonLayoutOptions ) => {
        buttonLayoutOptions?.splice(
            0, 0,
            {
                label       : __(`"Add to cart" as "Buy Now"`,"storegrowth-sales-booster"),
                value       : 'cart-to-buy-now',
                needUpgrade : true,
                tooltip     : __(
                    `Use the add to cart button as the Buy Now button`,
                    'storegrowth-sales-booster'
                ),
            },
        );
        buttonLayoutOptions?.splice(
            2, 0,
            {
                label       : __(`"Buy Now" for specific product"`,"storegrowth-sales-booster"),
                value       : 'specific-buy-now',
                needUpgrade : true,
                tooltip     : __(
                    'This setting can be directly accessed from the woocommerce product meta page',
                    'storegrowth-sales-booster'
                ),
            },
        );

        return buttonLayoutOptions;
    }
);
addFilter(
    'sgsb_direct_checkout_page_options',
    'sgsb_direct_checkout_page_options_callback',
    ( checkoutPageOptions ) => {
        checkoutPageOptions?.push(
            {
                label       : __( 'Fly Cart Checkout', 'storegrowth-sales-booster' ),
                value       : 'quick-cart-checkout',
                disabled    : true,
                needUpgrade : true,
                tooltip     : __(
                    'The checkout will redirect to Fly Cart module cart checkout page.',
                    'storegrowth-sales-booster'
                ),
            },
        );

        return checkoutPageOptions;
    }
);
addFilter(
    'sgsb_direct_checkout_before_product_page_settings',
    'sgsb_direct_checkout_before_product_page_settings_callback',
    () => {
        return (
            <SingleCheckBox
                needUpgrade={ true }
                checkedValue={ true }
                name={ 'shop_page_checkout_enable' }
                className={ `settings-field checkbox-field` }
                title={ __( 'Display on Shop Page', 'storegrowth-sales-booster' ) }
                tooltip={ __(
                    'The direct checkout button will show on the shop page',
                    'storegrowth-sales-booster'
                ) }
            />
        );
    }
);
addFilter(
    'sgsb_after_direct_checkout_button_design_settings',
    'sgsb_after_direct_checkout_button_design_settings_callback',
    () => {
        const fontFamily = [
            {
                value: 'poppins',
                label: __('Poppins', 'storegrowth-sales-booster'),
            }
        ];

        const borders = [
            { value: 'dotted', label: __( 'Dotted', 'storegrowth-sales-booster' ) }
        ];

        return (
            <Fragment>
                <SelectBox
                    needUpgrade={ true }
                    fieldValue={ fontFamily?.[0] }
                    title={ __( "Font Family", "storegrowth-sales-booster" ) }
                    tooltip={ __(
                        "Select your desired font family",
                        "storegrowth-sales-booster"
                    ) }
                />

                <InputNumber
                    min={1}
                    max={100}
                    style={{
                        width: "100px",
                        textAlign: "center",
                    }}
                    addonAfter={"px"}
                    needUpgrade={ true }
                    title={__("Horizontal Padding", "storegrowth-sales-booster")}
                    placeHolderText={__("Button Horizontal Padding", "storegrowth-sales-booster")}
                    tooltip={__(
                        "To set the horizontal padding of the button",
                        "storegrowth-sales-booster"
                    )}
                />

                <InputNumber
                    min={1}
                    max={100}
                    style={{
                        width: "100px",
                        textAlign: "center",
                    }}
                    addonAfter={"px"}
                    needUpgrade={ true }
                    title={__("Vertical Padding", "storegrowth-sales-booster")}
                    placeHolderText={__("Button Vertical Padding", "storegrowth-sales-booster")}
                    tooltip={__(
                        "To set the vertical padding of the button",
                        "storegrowth-sales-booster"
                    )}
                />

                <InputNumber
                    min={1}
                    max={20}
                    style={{
                        width: "100px",
                        textAlign: "center",
                    }}
                    addonAfter={"px"}
                    needUpgrade={ true }
                    title={__("Border Width", "storegrowth-sales-booster")}
                    placeHolderText={__("Button Border Width", "storegrowth-sales-booster")}
                    tooltip={__(
                        "To set the border width of the button",
                        "storegrowth-sales-booster"
                    )}
                />

                <ColourPicker
                    needUpgrade={ true }
                    fieldValue={`#008dff`}
                    title={__("Border Color", "storegrowth-sales-booster")}
                />

                <SelectBox
                    needUpgrade={ true }
                    fieldValue={ borders?.[0] }
                    title={ __( 'Overview Border', 'storegrowth-sales-booster' ) }
                    placeHolderText={ __( 'Change Overview Border', 'storegrowth-sales-booster' ) }
                    tooltip={ __( 'The Style of the order bump border.', 'storegrowth-sales-booster' ) }
                />
            </Fragment>
        );
    }
);
