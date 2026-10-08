/**
 * Stock Bar settings as the settings API returns them
 * (`sales-booster/v1/settings/stock-bar`, PHP `StockBarSettings`).
 *
 * @since SPSG_VERSION
 */
export interface StockBarValues
    extends Record< string, string | number | boolean > {
    // Content.
    total_sell_count_text: string;
    available_item_count_text: string;
    stock_status_text: string;

    // Configure.
    product_page_stock_bar_enable: boolean;
    shop_page_stock_bar_enable: boolean;
    variation_page_stock_bar_enable: boolean;
    stock_display_format: 'above' | 'below' | 'hide';
    show_stock_status: boolean;
    status_quantity_required: number;

    // Design.
    stockbar_bg_color: string;
    /** Hex, or a CSS gradient written by the old third template. */
    stockbar_fg_color: string;
    stockbar_height: number;
    stockbar_card_bg_color: string;
    stockbar_border_color: string;
    font_family: string;
    count_text_size: number;
    count_text_color: string;
    status_text_size: number;
    status_text_color: string;
    stockbar_template: 'stock_bar_one' | 'stock_bar_two' | 'stock_bar_three';
}
