# Sales Notification (`sales-pop`)

> **Design:** https://storegrowth-design.vercel.app/sales-notification.html
>
> Build it exactly as designed; see the design-fidelity rule in `README.md`.

## 1. Summary
- **Phase:** 3.
- **Depends on:** shell, pilot, `ProductSearch` field.
- **Size:** L (about 50 keys, typography grid, product sources).
- **Design:** `sales-notification.html`.

## 2. Current state
- **Option:** `spsg_popup_products` (nested). The whole option is localized to the storefront.
- **Transient:** `spsg_sales_pop_popup_info` (1 day).
- **Transport:** ajax `popup_products` / `create_popup`, nonce `spsg_admin_ajax_nonce` + `manage_options`, recursive sanitizer.
- **Admin page data:** `sales_pop_data.product_list` is built on every page load (100 orders, 200 products).
- **PHP hooks** (keep): `spsg_sales_pop_visbility_controller`, `spsg_sales_pop_image_position`, `spsg_sales_pop_billing_orders_limit`, `spsg_sales_pop_category_products_limit`, `spsg_sales_pop_selection_products_limit`, `spsg_sales_pop_id_list_fields`. (`storegrowth_sales_pop_module_init` is not fired anywhere; nothing to keep.)
- **JS hooks** (retire): `spsg_after_sales_pop_enable_settings`, `spsg_prepend_/append_sales_pop_product_settings`, `spsg_prepend_/append_sales_pop_section_settings`, `spsg_sales_pop_action_settings`, `spsg_sales_pop_image_style_settings`, `spsg_sales_popup_style_settings`, `spsg_sales_pop_message_panel_settings`, `spsg_sales_pop_time_panel_settings`, `spsg_sales_pop_selection_available_product_list`.

## 3. Target design
- **Tabs:** Notification Setting (General, Products, Message, Timing) / Design (Template 2×2, and Image Style, Popup Style, Text Style switch cards).
- **Preview:** storefront with the toast overlaid in the chosen corner.

## 4. Field map
| Design field | Option key | Tier | Component |
|---|---|---|---|
| Enable Popup | `enable` (the defaults typo `enabe` stays unread) | lite | `switch` |
| Stop Popup Visibility On Close | `enble_visibility` | lite | `switch` |
| Popup in Mobile | `mobile_view` | pro | `switch` |
| Show Close Button | `show_close_button` | lite | `switch` |
| Product Show Random | `product_random` | lite | `switch` |
| External Link | `external_link` | pro | `switch` |
| Open Link in New Tab | `open_product_link_in_new_tab` | pro | `switch` |
| Link Image to Product | `link_image_to_product` | pro | `switch` |
| Product Source | `product_source` 0=recent orders, 1=selected, **2=best sellers (new)** | lite | `select` |
| Number of orders (not in design) | `number_of_orders` | lite | `number`; keep it, shown when source = recent orders |
| Select Popup Products | `popup_products` (max 5 in lite) | lite | `ProductSearch` multi |
| Virtual First Name | `virtual_name` (max 5 in lite) | lite | `textarea` |
| Virtual Location | `virtual_locations` | lite | `textarea` |
| Visibility: pages | `banner_show_option` + `slected_page_option` | pro | `select` + page picker |
| Visibility: audience | `user_type` | pro | `select` |
| Message Popup | `message_popup` | pro | `textarea` + token legend |
| Loop / Per page / Next / Initial delay / Display time | `loop`, `notification_per_page`, `next_time_display`, `initial_time_delay`, `dispaly_time` | pro | `switch`, `number` + sec |
| Template | `template` 1–4 | lite | `TemplatePicker` (PNG), writes about 25 style keys |
| Image Style card | `image_style` + `spacing_around_image`, `popup_image_border_radius`, `image_position`, `popup_image_width` | pro | `switch_group` |
| Popup Style card | `popup_style` + `background_color`, `popup_position`, `popup_border_radius`, `popup_width` | lite switch / pro fields | `switch_group` |
| Text Style card | `text_style` + `{normal,product_title,time,country,state,city}_text_{color,font_size,font_weight}` | product_title/time/country lite, others pro | `TypographyRow` × 6 |

Dead keys (`enabe`, `sound*`, `address`, `virtual_country`, `virtual_time`, `text_color`, `highlight_color`, `message_checkout`, `product_image_size`, `popup_mobile_image_width`, `screen_*`, `target_categories`, `product_link_*`, `date_text_*`) stay in stored data. The schema doesn't expose them and save doesn't touch them. `name_text_*` is **not** dead: the storefront styles the name line with it; it's in the schema (defaults) without a field.

## 5. Data changes
- New settings type `list` (SettingsService): `popup_products` (int[]), `slected_page_option` (the conditional names pro 2.2.0 evaluates, string[]), `virtual_name` / `virtual_locations` (stored by the old admin as a comma / newline string, read through a separator, saved as arrays — a shape the storefront already reads).
- Lite caps as the old admin had them: 5 names (enforced server-side, `lite_max_items`), 5 products picked by hand (admin only — Recent Orders could fill more, so stored product lists stay uncapped). Number fields have minimums but no maximums (the old admin had none).
- Storefront still uses `templates/popup-style.php` inline styles, not ADR-005 CSS variables: **deferred** — pro 2.2.0's `spsg_sales_pop_visbility_controller` rebuilds the absolute path to `templates/popup.php`, so moving to the template loader must keep that contract. Colours and weights are sanitized for the CSS context there; invalid stored numbers fall back to the defaults. Without pro, the template's radii apply (`TEMPLATE_RADII`); with pro, the saved radii.
- The storefront cache (`spsg_sales_pop_popup_info`) is also flushed when the option changes while the module is off, and on module activation.
- Saves write only changed keys, so the storefront fills unsaved keys from the schema defaults (`SalesPopSettings::storefront_settings()`); defaults are the old admin's.
- `product_source = 2` (Best Sellers, decided: lite, snapshot): like Recent Orders, the admin fills `popup_products` on save from `GET sales-pop/source-products` (orders / best sellers by `total_sales`); the storefront keeps showing `popup_products`, no new query.
- `create_popup` merges through the settings service (a partial payload no longer wipes the rest). `sales_pop_data` keeps `ajax_url` / `ajd_nonce` (plus the preview's `fallback_image` and `template_radii`); the product lists are no longer built on every settings page load.
- The storefront CSS's site-wide `a { text-decoration: none }` is scoped to the popup.

## 6. REST
- `GET/POST /settings/sales-pop`
- `GET /products?search` (#13)
- `GET /sales-pop/source-products?source=orders|best_sellers&limit=N` (replaces #17)
- No `/pages`: "Specific Pages" picks page conditions (`is_front_page`, `is_page`, …), not page ids.

## 7. Compatibility
- Ajax `popup_products` and `create_popup` become adapters (unprefixed names kept).
- The `spsg_admin_ajax_nonce` flow is kept for the adapters.
- Pro's `SalesPopPro` visibility filter and the lite storefront keep reading the same keys.
- Retired JS hooks → `storegrowth.settings.schema.sales-pop`, `storegrowth.preview.sales-pop`.

## 8. Components
- Builds: `ProductSearch` (first user), `TypographyRow`, page picker, preview toast.
- Reuses: `TemplatePicker` (image mode), `switch_group`.

## 9. Open questions / design issues
- Best Sellers: **decided** — lite, snapshot on save (§5).
- "Hide on Specific Pages": **decided** — dropped until pro supports it; visibility offers Show Everywhere / Show on Specific Pages (what pro 2.2.0 evaluates).
- Templates: **decided** — keep stored 1–4, redraw the storefront to the design's four (01 avatar, 02 bag icon, 03/04 product photo).
- Font weights: this module keeps its 3 (400/500/700), as stored.
- The "Time" weight default stays the stored 500 (the design markup shows Medium).

## 10. Tasks and definition of done
- [x] Schema + service (`list` type) + adapters; lite caps as the old admin had them.
- [x] Best Sellers as a snapshot on save (`sales-pop/source-products`).
- [x] TS page, `TextStyleRow`, `MultiSelectField` (product search), preview.
- [x] Transient cleared on save (module on or off).
- [x] Delete the old bundle.
- [ ] Move the storefront onto ADR-005 CSS variables (keeping pro's template-path contract).
- [ ] E2E matrix (with the other modules' E2E pass).
