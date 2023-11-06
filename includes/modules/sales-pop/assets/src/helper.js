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
    popup_products               : [],
    enabe                        : false,
    template                     : 4,
    mobile_view                  : false,
    image_style                  : true,
    popup_style                  : true,
    text_style                   : true,
    highlight_color              : '#000000',
    text_color                   : '#000000',
    background_color             : '#ffffff',
    image_position               : 'left',
    popup_position               : 'left_bottom',
    popup_width                  : 22,
    target_categories            : [],
    popup_image_width            : 72,
    popup_mobile_image_width     : 25,
    popup_border_radius          : 8,
    popup_image_border_radius    : 6,
    spacing_around_image         : 10,
    link_image_to_product        : false,
    open_product_link_in_new_tab : false,
    show_close_button            : true,
    external_link                : false,
    product_random               : false,
    product_source               : '1',
    virtual_name                 : [],
    virtual_time				 : 1,
    address                      : ['real'],
    virtual_country              : ['bangladesh'],
    product_image_size           : '300*300',
    loop                         : false,
    next_time_display            : 5,
    notification_per_page        : 5,
    initial_time_delay           : 5,
    dispaly_time                 : 5,
    sound                        : false,
    sound_type                   : 'sound_a',
    virtual_locations            : `New York City, New York, USA\nBernau, Freistaat Bayern, Germany`,
    screen_width                 : window.screen.width,
    screen_height                : window.screen.height,
    banner_show_option           : "banner-show-everywhere",
    slected_page_option          : [],
    user_type                    : "both",
};
