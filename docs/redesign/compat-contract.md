# Compatibility contract: lite ↔ pro and third parties

- Captured: 2026-09-25 from lite `develop` @ eedd8d8e and pro 2.2.0 (local).
- Rules: `adr/ADR-005-backward-compatibility.md`.
- Nothing in this file may be renamed or removed.

## 1. Hooks

### 1.1 Full baselines
- `tests/compat/php-hooks-baseline.txt`: 100 PHP actions and filters that lite fires. This includes the WooCommerce hooks lite re-fires in its fly-cart template, such as `woocommerce_cart_item_name` and `woocommerce_before_cart_table`.
- `tests/compat/js-hooks-baseline.txt`: 83 JS hooks (`applyFilters` / `doAction`) that lite fires.
- Every `wp_ajax_*` / `wp_ajax_nopriv_*` action lite registers (list in `findings-features-B.md`, "All ajax actions").

The baselines were extracted by static search for string-literal hook names, so they have limits:
- Dynamic names aren't captured in full: `spsgqcv_localization_*`, `storegrowth_{module}_module_init`, and wp-kit's `{option_prefix}_settings_*`. Treat each dynamic pattern as frozen too.
- Before phase 1, also grep for hooks built with `"…{$var}…"` and add them to the baselines.

### 1.2 PHP hooks pro 2.2.0 listens to
`free_shipping_bar_content_pro`, `spsg_after_bogo_offer_settings`, `spsg_after_bogo_offer_type_field`, `spsg_after_bogo_settings_panel`, `spsg_bogo_fly_cart_badge_enabled`, `spsg_bogo_get_apply_able_product_id`, `spsg_bogo_offer_products_for_item`, `spsg_bogo_select_product_list`, `spsg_floating_bar_content_pro`, `spsg_fly_cart_show_free_shipping_enabled`, `spsg_fly_cart_show_stock_status_enabled`, `spsg_free_product_quantity_for_cart_update`, `spsg_get_bogo_settings_for_cart`, `spsg_is_bogo_applicable_product`, `spsg_qcv_inline_styles`, `spsg_quick_view_details_button`, `spsg_quick_view_icon_button`, `spsg_sales_pop_image_position`, `spsg_sales_pop_visbility_controller`, `spsg_stock_bar_stock_below`, `storegrowth_module_after_boot`, `storegrowth_pro_is_active`, `storegrowth_sb_quick_cart_coupon`.

Pro also listens to hooks named after lite module init, `storegrowth_{countdown_timer,floating_bar,free_shipping_bar,quick_cart,quick_view,sales_pop}_module_init`. These must keep firing.

Pro fires hooks that lite code listens to or documents: `sales_boster_floating_notification_bar_text`, `sales_boster_pd_banner_text`, `spsg_stock_bar_stock_below`.

### 1.3 JS hooks pro 2.2.0 listens to (all 65 are fired by lite today)

**These retire with the antd UI (ADR-005 §4).** Lite's schema now renders the fields they used to inject. The list is kept here for the changelog and for mapping each hook to its schema field.
All lite JS hooks in `tests/compat/js-hooks-baseline.txt` **except** the following, which pro doesn't use but third parties might:
- `spsg_after_textarea_settings`
- `spsg_bogo_category_messages_data`, `spsg_bogo_deal_type_options`, `spsg_bogo_tab_panels`
- `spsg_cart_product_detail_after`
- `spsg_countdown_timer_initial_data`, `spsg_countdown_timer_tab_panels`, `spsg_countdown_timer_template_styles`
- `spsg_dashboard_route_components`, `spsg_dashboard_routes`
- `spsg_direct_checkout_button_layout_options`, `spsg_direct_checkout_page_options`
- `spsg_floating_notification_bar_template_styles`, `spsg_floating_notification_bar_templates`
- `spsg_quick_cart_state`
- `spsg_quick_view_add_to_cart_redirection_settings`, `spsg_quick_view_button_position_settings`
- `spsg_routes`
- `spsg_sales_countdown_timer_templates`, `spsg_sales_pop_selection_available_product_list`
- `spsg_shipping_bar_template_styles`, `spsg_shipping_bar_templates`
- `spsg_shop_quick_view_enable_settings`, `spsg_variation_product_quick_view_enable_settings`

Callback signature today: `( defaultValue, formData, onFieldChange, …extra )`. Callbacks return an antd React element or data. This is why the hooks can't survive the antd removal. Replacements are the `storegrowth.*` JS extension points in ADR-005 §4.

## 2. PHP API pro uses

**Classes and static methods** (namespace `StorePulse\StoreGrowth\`):

| Symbol | Calls in pro |
|---|---|
| `Helper::find_option_settings` | 69 |
| `Helper::get_settings` | 19 |
| `Helper::get_pro_modules_path` / `get_pro_modules_url` / `include_pro_modules_file` / `get_pro_plugin_path` / `get_pro_plugin_url` | 7 / 6 / 4 / 2 / 1 |
| `Helper::get_modules_path` / `get_modules_url` | 1 / 1 |
| `Helper::template_visibility_controller` / `should_template_visibility_controller` | 3 / 1 |
| `Helper::sanitize_css_keyword` / `sanitize_css_color` | 2 / 2 |
| `Helper::is_product_discountable`, `get_days_for_schedule` | 2, 2 |
| `Helper::get_product_bogo_settings`, `get_product_bogo_settings_for_cart`, `prepare_bogo_settings`, `get_global_offered_product_list`, `build_offer_stamp` | module `BoGo\Helper` |
| `Helper::get_banner_text`, `get_banner_icon`, `get_custom_banner_icon`, `get_banner_custom_icon` | module `ProgressiveDiscountBanner\Helper`, `FloatingNotificationBar\Helper` |
| `Modules\BoGo\BogoDataManager::get_product_bogo_settings`, `save_product_bogo_settings`, `sync_offer_schedules` | 4 / 1 / 1 |
| `Modules\CountdownTimer\Helper` | 2 |
| `Modules\{StockBar,SalesPop,QuickView,ProgressiveDiscountBanner,FlyCart,FloatingNotificationBar,DirectCheckout,CountdownTimer,BoGo}\*Module` | 1 each (module ID / class checks) |

**Functions:** `sp_store_growth()`, `storegrowth_get_container()`.
**Constants:** `STOREGROWTH_MODULE_DIR`, plus the other `STOREGROWTH_*` constants.
**Bootstrap magic `__get` container entries:** keep every existing ID.

## 3. Admin surface

- **Screen IDs** `storegrowth_page_spsg-settings` and `storegrowth_page_spsg-modules`. Pro's `includes/Assets.php` enqueues its bundle only on these.
- **Localized globals:** keep `spsgAdmin` (`ajax_url`, `nonce`, `isPro`), because the kept ajax adapters and old pro's localize calls use it. `spsg`, `bogo_save_url`, `bump_save_url` and `sales_pop_data` belonged to the antd bundles and go with them. Pro adds its own `spsgProAdmin`.
- **Removed with the antd UI (ADR-005 §4):** `window.SGSettings` (the panel components pro reads *inside* its filter callbacks, which never run once the hooks stop firing, so pro 2.2.0 loads without errors), and the `@wordpress/data` stores `spsg` (×2), `spsg_bogo`, `spsg_order_bump`, `spsg_direct_checkout`, `spsg_order_sales_pop`. New stores use `storegrowth/*` names.
- **Script/style handles** registered by lite that pro or themes may depend on: keep every current handle. Pro's storefront scripts `qc-coupon.js`, `qc-centered-cart.js` and QuickView `frontend-pro.js` depend on lite's **`wfc-script`**. The new UI adds new handles (`spsg-admin`, `spsg-plugin-ui`, …) and never re-uses old ones for different code.

## 4. Data
Option names, keys, value types and custom table columns follow `findings-features-A.md` and `-B.md`. This includes misspelled keys (`enble_visibility`, `dispaly_time`, `slected_page_option`, `cupon_code`, `show_cupon`, `enable_qucik_view_icon`). Pro reads them directly through `Helper::find_option_settings`.

## 5. Transport
- **Ajax actions:** every one keeps working (ADR-005 §2), including pro-only `bogo_category_msg_status_handler` / `bogo_category_msg_delete` and the lite handlers pro relies on.
- **REST routes:** `sales-booster/v1/*` and `spsg/v1/order-bumps` are kept permanently. New routes are additive.
