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
- **PHP hooks** (keep): `spsg_sales_pop_visbility_controller`, `spsg_sales_pop_image_position`, `spsg_sales_pop_billing_orders_limit`, `spsg_sales_pop_category_products_limit`, `spsg_sales_pop_selection_products_limit`, `spsg_sales_pop_id_list_fields`, `storegrowth_sales_pop_module_init`.
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

Dead keys (`enabe`, `sound*`, `address`, `virtual_country`, `virtual_time`, `text_color`, `highlight_color`, `message_checkout`, `product_image_size`, `popup_mobile_image_width`, `screen_*`, `target_categories`, `name_text_*`, `product_link_*`, `date_text_*`) stay in stored data. The schema doesn't expose them and save doesn't touch them.

## 5. Data changes
- `product_source = 2` (Best Sellers) is new. The storefront query needs a best-sellers branch.
- Keep the existing lite caps (5 products, 5 names), enforced server-side in the REST save. Today they're enforced in the UI only.
- Stop building `sales_pop_data.product_list` on page load; the preview uses REST #17.

## 6. REST
- `GET/POST /settings/sales-pop`
- `GET /products?search` (#13)
- `GET /sales-pop/preview-products` (#17)
- `GET /pages` (#15), if page targeting stays

## 7. Compatibility
- Ajax `popup_products` and `create_popup` become adapters (unprefixed names kept).
- The `spsg_admin_ajax_nonce` flow is kept for the adapters.
- Pro's `SalesPopPro` visibility filter and the lite storefront keep reading the same keys.
- Retired JS hooks → `storegrowth.settings.schema.sales-pop`, `storegrowth.preview.sales-pop`.

## 8. Components
- Builds: `ProductSearch` (first user), `TypographyRow`, page picker, preview toast.
- Reuses: `TemplatePicker` (image mode), `switch_group`.

## 9. Open questions / design issues
- Best Sellers: new feature. Needs approval and a pro/lite call.
- The page picker for "Specific Pages" isn't drawn.
- Font weight options (3) differ from Countdown (4).
- The "Time" weight default: the markup shows Medium, the JS default is 400.

## 10. Tasks and definition of done
- [ ] Schema (about 50 keys) + service + adapters, with lite caps enforced server-side.
- [ ] Best Sellers source in the storefront query (if approved).
- [ ] TS page, `TypographyRow`, `ProductSearch`, preview.
- [ ] Transient cleared on save (same as today).
- [ ] Characterisation test + E2E matrix; delete the old bundle.
