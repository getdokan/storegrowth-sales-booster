import { __ } from "@wordpress/i18n";
import { Fragment } from "react";
import { addFilter } from "@wordpress/hooks";
import ColourPicker from "../../../settings/Panels/PanelSettings/Fields/ColorPicker";
import { Switcher } from "../../../settings/Panels";

// Handle stock bar modules pro settings prompts.
addFilter(
    "spsg_quick_view_navigation_settings",
    "spsg_quick_view_navigation_settings_callback",
    (component) => {
        return (
            <Fragment>
                <ColourPicker
                    needUpgrade={true}
                    fieldValue={"FFFFFF"}
                    name={"navigation_background"}
                    title={__("Navigation Background Color", "storegrowth-sales-booster")}
                />
            </Fragment>
        );
    }
);
addFilter(
    "spsg_quick_view_button_position_settings",
    "spsg_quick_view_button_position_settings_callback",
    (component, buttonPositions) => {
        return [
            ...buttonPositions,
            {
                value: "center_on_the_image",
                label: __("Center On The Image", "storegrowth-sales-booster"),
                disabled: true,
                needUpgrade: true,
            },
        ];
    }
);
addFilter(
    "spsg_quick_after_modal_close_button_settings",
    "spsg_quick_after_modal_close_button_settings_callback",
    (component) => {
        return (
            <Switcher
                colSpan={24}
                name={"show_view_details_button"}
                needUpgrade={true}
                title={__("Enable View Details Button", "storegrowth-sales-booster")}
                isEnable={false}
                tooltip={__(
                    "By enableing this quick view will show in mobile.",
                    "storegrowth-sales-booster"
                )}
            />
        );
    }
);
addFilter(
    "spsg_quick_view_button_icon_settings",
    "spsg_quick_view_button_icon_settings_callback",
    (component) => {
        return (
            <>
                <Switcher
                    colSpan={24}
                    name={"enable_qucik_view_icon"}
                    needUpgrade={true}
                    title={__("Enable Quick View Icon", "storegrowth-sales-booster")}
                    isEnable={false}
                    tooltip={__(
                        "By enableing this quick view will show in mobile.",
                        "storegrowth-sales-booster"
                    )}
                />
            </>
        );
    }
);

addFilter(
    "spsg_quick_view_add_to_cart_redirection_settings",
    "spsg_quick_view_add_to_cart_redirection_settings_callback",
    (component, addToCartRedirection) => {
        return [
            ...addToCartRedirection,
            {
                value: "add-to-cart-ajax",
                label: __("Ajax add to cart", "storegrowth-sales-booster"),
                disabled: true,
                needUpgrade: true,
            },
        ];
    }
);
