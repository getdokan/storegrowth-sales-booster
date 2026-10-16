# Feature inventory A — countdown-timer, stock-bar, sales-pop, progressive-discount-banner, floating-notification-bar

## 0. Cross-cutting

How pro fields reach the lite UI:
1. Lite component calls `applyFilters('spsg_<hook>', '', formData, onFieldChange, …)` where a pro field belongs.
2. Non-pro: `assets/src/settings.js` does `if (!spsgAdmin?.isPro) import('./components/pro-previews')` → fills the same hooks with disabled teasers + upgrade badges.
3. Pro: `storegrowth-sales-booster-pro/src/components/Modules/<X>/index.js` fills the hooks with real fields (`window.SGSettings.*`, some raw antd).
4. Pro PHP: `includes/Modules.php` on `storegrowth_module_after_boot` boots one `<X>Pro` class per active module. PHP filters: `spsg_countdown_timer_styles`, `spsg_stock_bar_warning_contents`, `spsg_sales_pop_visbility_controller`, `free_shipping_bar_content_pro`, `spsg_floating_bar_content_pro`.

Pro folder names: `SalesCountdown` = countdown-timer, `FreeShippingBar` = progressive-discount-banner, `FloatingNotificationBar`/`FloatingBar` = floating-notification-bar.

Field wrappers (antd): TextInput=Input, TextAreaBox=Input.TextArea, Number/InputNumber, SelectBox=Select, ProductAsyncMultiSelect (Select → `/sales-booster/v1/products`), Switcher=Switch, SingleCheckBox, CheckboxGroup, ColourPicker (+undo), RadioTemplate (template cards), RadioBox (icon picker + wp.media). Page: PanelSettings (Tabs), PanelPreview/TouchPreview, ActionsHandler (Reset/Save).

Transport: nonce `spsg_ajax_nonce` (`spsgAdmin.nonce`, `includes/Assets.php`), `check_ajax_referer` + `manage_options`, `wp_ajax_*` only. Save posts whole `formData`.

| Module | Payload | Server sanitization |
|---|---|---|
| countdown, stock-bar | `form_data[]` form-encoded | `Helper::sanitize_form_fields` (flat only, `'true'/'false'` → bool; nested array would throw on `string` hint) |
| sales-pop | `data` JSON `{popup_data}` | recursive `sanitize_popup_data` (`sanitize_textarea_field`, `absint` on products) |
| discount banner, floating bar | `form_data` JSON `{shipping_bar_data}` | **none** — straight `update_option` (`$icon_validator` unused) |

Storefront gating: pro gating is UI-only; lite storefront reads some pro keys if present (sales-pop timing/message, bar position/height/trigger/font size).

## 1. Countdown Timer
Storage: option `spsg_countdown_timer_settings` (flat). Product + variation meta `_spsg_countdown_timer_discount_amount` (0–100), `_spsg_countdown_timer_discount_start` (`Y-m-d 00:00:00`), `_spsg_countdown_timer_discount_end` (`Y-m-d 23:59:59`), edited in WC product tab (`templates/wc-product-data-panels.php`, `woocommerce_admin_process_product_object`) and Dokan product form (`dokan_process_product_meta`).

| Key | Default JS (PHP) | Control | Tier |
|---|---|---|---|
| `countdown_heading` (`[discount]`) | `'[discount]% OFF'` (`'Last chance! [discount]% OFF'`) | TextInput | lite |
| `product_page_countdown_enable` | true | SingleCheckBox | lite |
| `shop_page_countdown_enable` | false | SingleCheckBox | pro (`spsg_shop_sales_countdown_enable_settings`) |
| `font_family` (6) | roboto | SelectBox | lite |
| `widget_background_color` / `border_color` / `heading_text_color` | #FFFFFF / #1677FF / #008DFF | ColourPicker | lite |
| `counter_background_color`, `counter_border_color`, `day_/hour_/minute_/second_text_color` | #FFFFFF, #ECEDF0, #1B1B50×4 | ColourPicker | pro (`spsg_append_countdown_design_settings`, PHP `spsg_countdown_timer_styles`) |
| `selected_theme` | `ct-layout-1` (`ct-custom`) | RadioTemplate (overwrites colours/font) | lite |
| `vendor_can_create_countdown_discount`, `vendor_can_create_schedule_timer` | true | Switcher, Vendors tab | Dokan integration |

Endpoints: `wp_ajax_spsg_countdown_timer_{get,save}_settings`.
Frontend: price filters apply discount inside window; D:H:M:S box above add-to-cart; pro adds shop loop.

## 2. Stock Bar
Storage: option `spsg_stock_bar_settings` (flat).

| Key | Default JS (PHP) | Control | Tier |
|---|---|---|---|
| `product_page_stock_bar_enable` | true | SingleCheckBox | lite |
| `shop_page_stock_bar_enable`, `variation_page_stock_bar_enable` | false | SingleCheckBox | pro |
| `stockbar_bg_color` | #EBF6FF (#e7efff) | ColourPicker (mislabelled "Foreground Color") | lite |
| `stockbar_fg_color` | #008DFF | ColourPicker "Bar Color" | pro |
| `stockbar_border_color` | #DDE6F9 | ColourPicker | lite |
| `stockbar_height` (1–100) | 10 | InputNumber | pro |
| `stock_display_format` (above/below) | above | SelectBox | pro |
| `total_sell_count_text` / `available_item_count_text` | Total Sold / Available Item | TextInput | pro |
| `show_stock_status` | true | Switcher | lite |
| `status_quantity_required` / `stock_status_text` (`{quantity}`) / `status_text_color` | 10 / 'Hurry! only {quantity}…' / #073B4C | InputNumber / TextInput / ColourPicker | pro (`spsg_stock_bar_warning_contents`) |
| `stockbar_template` (one/two/three) | one | RadioTemplate (PHP never reads) | lite |
| `shop_page_countdown_enable`, `product_page_countdown_enable` | — | none | dead copy-paste keys |

Endpoints: `wp_ajax_spsg_stock_bar_{get,save}_settings`. Frontend: jqMeter bar on simple managed-stock products; hides WC stock HTML; template-3 gradient rejected by `sanitize_css_color` → falls back #0875ff.

## 3. Sales Notification (sales-pop)
Storage: option `spsg_popup_products` (nested); transient `spsg_sales_pop_popup_info` (1 day, cleared on option/product change). Whole option sent to storefront as `popup_info.popup_all_properties`. Admin store `spsg_order_sales_pop`.

- General: `enable` (defaults typo `enabe` → no default), `enble_visibility` (sic, stop after close), `mobile_view` (pro, lite frontend reads it).
- Template: `template` 1–4 (preview cards; overwrites ~25 style keys).
- Design lite: switches `image_style` (disabled non-pro), `popup_style`, `show_close_button`, `text_style`; typography `product_title_*`, `time_text_*`, `country_text_*` (color, size, weight 400/500/700).
- Design pro: `spacing_around_image`, `popup_image_border_radius`, `image_position`, `popup_image_width`, `background_color`, `popup_position` (4 corners), `popup_border_radius`, `popup_width`, `open_product_link_in_new_tab`, `link_image_to_product`, typography `normal_text_*`, `state_text_*`, `city_text_*`.
- Products lite: `product_random`, `product_source` (0 latest orders / 1 selected), `number_of_orders`, `popup_products` (max 5 in lite), `virtual_name` (comma list, max 5 in lite), `virtual_locations` (`city,state,country` per line).
- Products pro: `external_link`, `banner_show_option`, `slected_page_option` (sic), `user_type`.
- Message (pro): `message_popup` tokens `{virtual_name} {product_title} {location} {time}` (lite frontend reads it).
- Time (pro): `loop`, `next_time_display`, `notification_per_page`, `initial_time_delay`, `dispaly_time` (sic) (lite frontend reads all).
- Dead: `enabe`, `sound`, `sound_type`, `address`, `virtual_country`, `virtual_time`, `text_color`, `highlight_color`, `message_checkout`, `product_image_size`, `popup_mobile_image_width`, `screen_width/height`, `target_categories` + source 3, `name_text_*`, `product_link_*`, `date_text_*`.

Endpoints: `wp_ajax_popup_products`, `wp_ajax_create_popup` (unprefixed names), nonce `spsg_admin_ajax_nonce` + `manage_options`. `sales_pop_data.product_list` built on every settings load (100 orders via `wc_get_orders`, 200 products, category map).

## 4. Free Shipping Rules (progressive-discount-banner)
Confirmed: `get_name()` = 'Free Shipping Rules'; pro `FreeShippingBarPro`; sidebar still says "Discount Banner".
Storage: option `spsg_progressive_discount_banner_settings` (flat); `spsg_discount_banner_flags` (first boot deletes main option, seeds 3 text keys). Sent to storefront as `spsg_fsb_data`.

- General lite: `bar_type` (normal/sticky), `discount_type` (`free-shipping`/`discount-amount`), `discount_amount_mode` (fixed/percentage), `discount_amount_value`, `cart_minimum_amount` (10), `progressive_banner_text` (`[amount]`), `goal_completion_text`, `btn_style`, `btn_text` ('Cart'), `btn_target`.
- General pro: `bar_position`, `progressive_banner_icon_name` (3), `progressive_banner_custom_icon`.
- Display rules pro: `banner_device_view`, `banner_trigger`, `banner_delay` (7), `scroll_banner_delay` (7), `banner_show_option`, `slected_page_option`, `user_type`.
- Design lite: `font_family` (5), `background_color` #0875FF, `text_color`, `icon_color`, `close_icon_color`, `btn_color`, `btn_text_color`, `bar_template` (1).
- Design pro: `banner_height` (60), `font_size` (20).

Endpoints: `wp_ajax_spsg_pd_banner_{get,save}_settings` (save unsanitized). Frontend: top/bottom bar in `wp_footer` refreshed via fragments; `free-shipping` forces WC `free_shipping` rate (needs zone method); `discount-amount` adds negative fee.

## 5. Floating Bar
Storage: option `spsg_floating_notification_bar_settings` (flat); `banner_device_view` / `button_view` defaults merged on read. Sent as `spsg_fnb_data` (+ discount bar height/position for stacking). Coupon list via raw `$wpdb`.

- General lite: `bar_type`, `default_banner_text` (required, max 80), `button_view` (desktop/mobile), `button_action` (`ba-close`/`ba-url-redirect`), `redirect_url`.
- General pro: `bar_position`, `default_banner_icon_name`, `default_banner_custom_icon`, `new_tab_enable`, `countdown_start_date`, `countdown_end_date`, `countdown_show_enable`, `show_cupon`, `cupon_code`.
- Display rules pro: `banner_device_view`, `ac_button_text` ('Shop Now' — lite can't change button label), `banner_trigger`, `banner_delay` (1), `scroll_banner_delay` (1), `banner_show_option`, `slected_page_option`, `user_type`.
- Design lite: `font_family`, `background_color`, `text_color`, `icon_color`, `button_color`, `button_text_color`, `close_icon_color`, `notify_template` (1).
- Design pro: `banner_height`, `font_size`.

Endpoints: `wp_ajax_spsg_floating_notification_bar_{get,save}_settings` (save unsanitized, payload key `shipping_bar_data`).
Dead code: lite `DisplayRules.js`, `BannerTrigger.js`, `PageTarget.js` (this module) and `BannerTrigger.js`, `PageTarget.js` (discount banner).

Shared: Free Shipping + Floating Bar share ~20 keys (display rules, design, icon picker, bar position/type).
