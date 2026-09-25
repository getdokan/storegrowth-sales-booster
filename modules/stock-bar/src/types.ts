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

/** Keys each tab saves and resets. */
export const TAB_KEYS: Record<
    'content' | 'configure' | 'design',
    Array< keyof StockBarValues >
> = {
    content: [
        'total_sell_count_text',
        'available_item_count_text',
        'stock_status_text',
    ],
    configure: [
        'shop_page_stock_bar_enable',
        'product_page_stock_bar_enable',
        'variation_page_stock_bar_enable',
        'stock_display_format',
        'show_stock_status',
        'status_quantity_required',
    ],
    design: [
        'stockbar_bg_color',
        'stockbar_fg_color',
        'stockbar_height',
        'stockbar_card_bg_color',
        'stockbar_border_color',
        'font_family',
        'count_text_size',
        'count_text_color',
        'status_text_size',
        'status_text_color',
        'stockbar_template',
    ],
};
