import { __ } from '@wordpress/i18n';

export const createDirectCheckoutForm = {
    font_size                    : 16,
    text_color                   : "#ffffff",
    font_family                  : "poppins",
    button_style                 : true,
    button_color                 : "#008dff",
    border_color                 : "#008dff",
    border_width                 : 1,
    paddingXaxis                 : 20,
    paddingYaxis                 : 10,
    generated_link               : "example",
    checkout_redirect            : 'legacy-checkout',
    button_border_style          : "solid",
    button_border_radius         : 5,
    buy_now_button_label         : __( 'Buy Now', 'storegrowth-sales-booster' ),
    buy_now_button_setting       : __( 'cart-with-buy-now', 'storegrowth-sales-booster' ),
    shop_page_checkout_enable    : true,
    product_page_checkout_enable : true,
};
