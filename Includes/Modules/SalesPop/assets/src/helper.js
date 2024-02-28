export const noop = () => {};

/**
 * Default state of create popup.
 */
const message = {
    message_popup           : `{virtual_name}
{product_title}
From {location}
{time}`,
    message_checkout        : 'Test Checkout Message',
    normal_text_color       : '#1B1B50',
    product_title_color     : '#1B1B50',
    product_link_color      : '#000000',
    time_text_color         : '#989FAB',
    date_text_color         : '#000000',
    country_text_color      : '#1B1B50',
    state_text_color        : '#1B1B50',
    city_text_color         : '#1B1B50',
    name_text_color         : '#000000',

    normal_text_font_size   : '10',
    product_title_font_size : '16',
    product_link_font_size  : '12',
    time_text_font_size     : '10',
    date_text_font_size     : '12',
    country_text_font_size  : '10',
    state_text_font_size    : '10',
    city_text_font_size     : '10',
    name_text_font_size     : '10',

    normal_text_font_weight   : '400',
    product_title_font_weight : '500',
    product_link_font_weight  : '400',
    time_text_font_weight     : '500',
    date_text_font_weight     : '400',
    country_text_font_weight  : '400',
    state_text_font_weight    : '400',
    city_text_font_weight     : '400',
    name_text_font_weight     : '500',
}

export const createPopupForm = {
    ...message,
    loop                         : false,
    enabe                        : false,
    enble_visibility             : false,
    sound                        : false,
    address                      : ['real'],
    template                     : 4,
    user_type                    : "both",
    text_color                   : '#000000',
    text_style                   : true,
    sound_type                   : 'sound_a',
    image_style                  : true,
    popup_style                  : true,
    mobile_view                  : false,
    popup_width                  : 400,
    virtual_time				 : 1,
    screen_width                 : window.screen.width,
    virtual_name                 : [],
    dispaly_time                 : 5,
    screen_height                : window.screen.height,
    external_link                : false,
    popup_products               : [],
    image_position               : 'left',
    popup_position               : 'left_bottom',
    product_source               : '1',
    product_random               : false,
    highlight_color              : '#000000',
    virtual_country              : ['bangladesh'],
    background_color             : '#ffffff',
    number_of_orders             : 0,
    virtual_locations            : `New York City, New York, USA\nBernau, Freistaat Bayern, Germany`,
    target_categories            : [],
    popup_image_width            : 72,
    next_time_display            : 5,
    show_close_button            : true,
    banner_show_option           : "banner-show-everywhere",
    initial_time_delay           : 5,
    product_image_size           : '300*300',
    slected_page_option          : [],
    popup_border_radius          : 8,
    spacing_around_image         : 10,
    link_image_to_product        : false,
    notification_per_page        : 5,
    popup_mobile_image_width     : 25,
    popup_image_border_radius    : 6,
    open_product_link_in_new_tab : false,
};
