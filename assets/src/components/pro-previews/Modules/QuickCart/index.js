import { __ } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';
import CouponPreview from "./CouponPreview";

// Handle quick cart settings pro prompts stuff.
addFilter(
    'sgsb_quick_cart_layout_settings',
    'sgsb_quick_cart_layout_settings_callback',
    ( layoutOptions, centeredCartPopupImg ) => {
        return [
            ...layoutOptions,
            {
                key      : 'center',
                icon     : centeredCartPopupImg,
                name     : __( 'Centered Popup', 'storegrowth-sales-booster' ),
                disabled : true,
            }
        ];
    }
);

addFilter(
    'sgsb_quick_cart_content_settings',
    'sgsb_quick_cart_content_settings_callback',
    ( contentOptions ) => {
        return [
            ...contentOptions,
            {
                name        : 'show_coupon',
                title       : __( 'Show coupon', 'storegrowth-sales-booster' ),
                needUpgrade : true
            },
            {
                name        : 'enable_add_to_cart_redirect',
                title       : __( 'Cart panel auto-opens', 'storegrowth-sales-booster' ),
                needUpgrade : true
            },
        ];
    }
);
addFilter(
    'sgsb_before_quick_cart_total_preview',
    'sgsb_before_quick_cart_total_preview_callback',
    () => <CouponPreview />
);

addFilter(
    'sgsb_quick_cart_position_settings',
    'sgsb_quick_cart_position_settings_callback',
    ( positionContents, positionIcons ) => {

        return [
            ...positionContents,
            {
                key      : 'center-right',
                icon     : positionIcons?.center_right,
                name     : __( 'Centre Right', 'storegrowth-sales-booster' ),
                disabled : true,
            },
            {
                key      : 'center-left',
                icon     : positionIcons?.center_left,
                name     : __( 'Centre Left', 'storegrowth-sales-booster' ),
                disabled : true,
            }
        ];
    }
);
