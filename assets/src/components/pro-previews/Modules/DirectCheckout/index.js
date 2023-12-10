import { __ } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';
import TextInput from "../../../settings/Panels/PanelSettings/Fields/TextInput";
import SingleCheckBox from "../../../settings/Panels/PanelSettings/Fields/SingleCheckBox";

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
                label       : `"Add to cart" as "Buy Now"`,
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
                label       : `"Buy Now" for specific product"`,
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
                label       : __( 'Quick Cart Checkout', 'storegrowth-sales-booster' ),
                value       : 'quick-cart-checkout',
                disabled    : true,
                needUpgrade : true,
                tooltip     : __(
                    'The checkout will redirect to Quick Cart module cart checkout page.',
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
