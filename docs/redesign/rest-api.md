# REST API for the redesigned admin

- Status: Draft
- Date: 2026-09-25
- Rules: ADR-005. Existing routes and ajax actions are never removed. Old ajax handlers become thin adapters over the same service the REST controllers use.
- Namespace for everything new: `sales-booster/v1`
- Auth: cookie + `wp_rest` nonce through `apiFetch`
- Permission: `manage_options` unless stated otherwise

Legend: **EXISTS** = already registered today; **CHANGE** = exists but needs fixes; **NEW** = to build.

## 1. Core

| # | Method + route | Status | Purpose | Replaces ajax |
|---|---|---|---|---|
| 1 | `GET /modules` | NEW | List modules: `id, name, description, icon, banner, doc_link, category, status, is_pro, locked` | `spsg_admin_ajax` → `get_all_modules` |
| 2 | `PATCH /modules/{id}` `{ status }` | NEW | Activate or deactivate one module (fires `spsg_module_activated` / `_deactivated`). Returns 404 on an unknown id; the ajax version fatals today. | `spsg_admin_ajax` → `update_module_status` |
| 3 | `POST /modules/batch` `{ ids[], status }` | NEW | "Active All Modules" master switch | — |
| 4 | `GET /settings` | EXISTS | Global settings (`remove_data_on_uninstall`) | — |
| 5 | `POST /settings` | EXISTS | Save global settings | — |
| 6 | `GET /settings/{module}` | NEW | `{ schema, values }` for one module. `schema` includes pro fields with `pro:true`; `values` come from the existing option with defaults filled in | every `spsg_*_get_settings` (below) |
| 7 | `POST /settings/{module}` `{ values }` | NEW | Validate and sanitize per the schema, drop pro keys when pro is inactive, **merge** into the existing option (same key names and value types), return the saved values | every `spsg_*_save_settings` (below) |
| 8 | `GET /settings/{module}/defaults` | NEW (optional) | Defaults for the Reset button. Can be skipped if the client reads the defaults from the schema | — |
| 9 | `GET /dashboard/overview` | NEW | Dashboard tiles: module count, active count, revenue, template count | — |
| 10 | `GET /onboarding` · `POST /onboarding` | NEW | Initial-setup state and completion flag | `spsg_inisetup_flag_update` |
| 11 | `GET /notices/admin` · `POST /notices/dismiss` | EXISTS | Admin notices (wp-kit) | — |
| 12 | `GET /migration/status` · `POST /migration/upgrade` | EXISTS | Data migrations (`update_plugins`) | — |

`{module}` = `countdown-timer`, `stock-bar`, `sales-pop`, `progressive-discount-banner`, `floating-notification-bar`, `quick-view`, `fly-cart`, `direct-checkout`, `bogo`.

`/settings/bogo` covers the global BOGO options (`spsg_bogo_general_settings`) and, when Dokan is active, the vendor options.

### 1.1 Settings route → option → ajax pairs it replaces

| `{module}` | Option | Ajax actions (kept as adapters) |
|---|---|---|
| `countdown-timer` | `spsg_countdown_timer_settings` | `spsg_countdown_timer_get_settings`, `spsg_countdown_timer_save_settings` |
| `stock-bar` | `spsg_stock_bar_settings` | `spsg_stock_bar_get_settings`, `spsg_stock_bar_save_settings` |
| `sales-pop` | `spsg_popup_products` | `popup_products`, `create_popup` |
| `progressive-discount-banner` | `spsg_progressive_discount_banner_settings` | `spsg_pd_banner_get_settings`, `spsg_pd_banner_save_settings` |
| `floating-notification-bar` | `spsg_floating_notification_bar_settings` | `spsg_floating_notification_bar_get_settings`, `spsg_floating_notification_bar_save_settings` |
| `quick-view` | `spsg_quick_view_settings` | `spsg_quick_view_get_settings`, `spsg_quick_view_save_settings` |
| `fly-cart` | `spsg_fly_cart_settings` | `spsg_fly_cart_get_settings`, `spsg_fly_cart_save_settings` |
| `direct-checkout` | `spsg_direct_checkout_settings` | `spsg_direct_checkout_get_settings`, `spsg_direct_checkout_save_settings` |
| `bogo` | `spsg_bogo_general_settings` (+ `spsg_bogo_dokan_vendors_settings`) | `spsg_bogo_general_get_settings`, `spsg_bogo_general_save_settings`, `spsg_bogo_vendors_get_settings`, `spsg_bogo_vendors_save_settings` |

Sanitization gap closed by #7: Free Shipping, Floating Bar, Direct Checkout, BOGO general and Dokan vendor settings are saved with no sanitization today.

Do **not** use wp-kit `BaseSettingsRESTController` as-is. It writes `{prefix}_{page}` options and saves switches as `'on'/'off'`. Subclass it and override `load_values` / `create_item` to read and write the existing option and value types, or write a small registry (report §5).

## 2. Lookups used by editors and pickers

| # | Method + route | Status | Purpose | Notes |
|---|---|---|---|---|
| 13 | `GET /products?search&include&per_page&type&status` | CHANGE | Product search (Sales Notification products, BOGO target/offer, Order Bump target/offer); returns `id, name, price_html, regular_price, sale_price, image, type, parent_id` | Today `sales-booster/v1/products` extends WC's full product controller (create, update, delete, batch). Make it **read-only**: register GET only |
| 14 | `GET /product-categories?search&include` | NEW | Category search for Order Bump "Categories" | Or proxy `wc/v3/products/categories` |
| 15 | `GET /pages?search` | NEW (or reuse `wp/v2/pages`) | "Specific pages" targeting (Sales Notification, Free Shipping, Floating Bar) | Reuse core if `edit_pages` is fine for the audience |
| 16 | `GET /coupons?search` | NEW | Floating Bar coupon picker (pro) | Replaces the raw `$wpdb` query; only if the coupon field survives the redesign |
| 17 | `GET /sales-pop/preview-products?source&limit` | NEW | Resolves "Recent Orders" / "Best Sellers" / "Selected" into products for the preview and the Selected list | Replaces the `sales_pop_data.product_list` built on every page load (100 orders + 200 products) |

## 3. Offers (CRUD)

### 3.1 BOGO — `sales-booster/v1/bogo/offers`

| # | Method + route | Status | Notes |
|---|---|---|---|
| 18 | `GET /bogo/offers?page&per_page&search&status&type&orderby&order` | CHANGE | `search` is ignored today; `X-WP-Total` counts only global offers. Add `type` (global/product), and thumbnails + prices for the list cells |
| 19 | `POST /bogo/offers` | EXISTS | Lite cap (2 global offers → 403 `salesbooster_limit_exceeded`) stays |
| 20 | `GET /bogo/offers/{id}` | CHANGE | Must return `design_settings`, `offer_schedule` and badge fields. Today they're missing, so saving wipes the design |
| 21 | `PUT/PATCH /bogo/offers/{id}` | CHANGE | Persist the fields dropped today (badge, `bogo_type`, alternates, exclusions), if they survive the design |
| 22 | `DELETE /bogo/offers/{id}` | EXISTS | |
| 23 | `POST /bogo/offers/{id}/status` `{ status }` | EXISTS | List status switch |
| 24 | `POST /bogo/offers/batch` `{ delete: [ids] }` | NEW | Bulk delete from the list |
| 25 | `GET /bogo/offers/vendor` … | EXISTS | Dokan vendor controller (`dokandar` scope). Add a check that the product IDs belong to the vendor |

### 3.2 Order Bump — `sales-booster/v1/order-bumps` (new) + `spsg/v1/order-bumps` (kept permanently)

| # | Method + route | Status | Notes |
|---|---|---|---|
| 26 | `GET /order-bumps?page&per_page&search&status&orderby&order` | CHANGE | Register under `sales-booster/v1`, keep `spsg/v1`. Add `search`; return list-cell data. The client today only fetches the first 10 |
| 27 | `POST /order-bumps` | EXISTS | Persist `bump_schedule`, which is never saved today. Accept `offer_type: free` if product approves |
| 28 | `GET /order-bumps/{id}` · `PUT/PATCH` · `DELETE` | EXISTS | |
| 29 | `PATCH /order-bumps/{id}/status` `{ status }` | NEW | List status switch; the column exists but there's no toggle |
| 30 | `POST /order-bumps/batch` `{ delete: [ids] }` | NEW | Bulk delete |
| 31 | `GET /order-bumps/matching` | EXISTS | Unused; keep |

## 4. Pro-only surfaces (lite registers them; they work only when pro is active)

| # | Method + route | Status | Replaces ajax (kept as adapters) |
|---|---|---|---|
| 32 | `GET /bogo/category-messages` | NEW | `bogo_category_msg_list` |
| 33 | `POST /bogo/category-messages` | NEW | `bogo_category_msg_create` |
| 34 | `PATCH /bogo/category-messages/{id}/status` | NEW | `bogo_category_msg_status_handler` (pro) |
| 35 | `DELETE /bogo/category-messages/{id}` | NEW | `bogo_category_msg_delete` (pro) |

**Required:** under `pro-compat-review.md` R2, pro 2.2.0 users must keep a way to manage their existing category messages, so lite builds this pro-gated screen even though the design drops it. The ajax actions stay registered too.

## 5. Product-level settings (optional, only if product edit screens move to React)
Today these are PHP forms on the WooCommerce product edit screen and the Dokan product form. They work and aren't in the designs.

| # | Method + route | Data |
|---|---|---|
| 36 | `GET/POST /products/{id}/countdown` | `_spsg_countdown_timer_discount_{amount,start,end}` (product + variations) |
| 37 | `GET/POST /products/{id}/bogo` | Product-type BOGO row in `spsg_bogo_settings` (`BogoDataManager::save_product_bogo_settings`) |
| 38 | `GET/POST /products/{id}/direct-checkout` | `_spsg_direct_checkout_button_layout` |

Recommendation: leave these as PHP forms for now. They don't block the redesign.

## 6. Storefront (public) — stays admin-ajax, not REST

These are guest cart actions. Moving them behind the `wp_rest` cookie nonce would break guests, so they stay as they are:

| Ajax action | Nonce |
|---|---|
| `spsg_fly_cart_frontend` | `spsg_frontend_ajax` |
| `spsgqcv_quickview` | `spsgqcv-security` |
| `offer_product_add_to_cart` | `spsg_frontend_ajax_nonce` |
| `update_offer_product` | `spsg_frontend_ajax_nonce` |
| `upsell_offer_product_add_to_cart` | `spsg_frontend_ajax_nonce` |

A later option is the WooCommerce Store API (`/wc/store/v1` extensions), in a separate ADR.

## 7. Totals

| Group | Exists | Change | New |
|---|---|---|---|
| Core | 4 rows (#4, 5, 11, 12) | — | 7 (#1, 2, 3, 6, 7, 9, 10) + 1 optional (#8) |
| Lookups | — | 1 (#13) | 4 (#14–17) |
| BOGO | 3 (#19, 22, 23) + vendor (#25) | 3 (#18, 20, 21) | 1 (#24) |
| Order Bump | 3 (#27, 28, 31) | 1 (#26) | 2 (#29, 30) |
| Pro-only | — | — | 4 (#32–35), conditional |
| Product-level | — | — | 3 optional (#36–38) |

Minimum to remove antd and go fully REST: #1, #2, #3, #6, #7, #9, #10, #13, #14, #17, #18, #20, #24, #26, #29, #30. Add #15 and #16 if page targeting and coupons stay, and #32–35 if category messages stay.

## 8. Shared response conventions
- Errors: `WP_Error` → `{ code, message, data: { status, errors?: { [fieldId]: message } } }`. Field errors map straight onto plugin-ui field errors.
- Lists: `X-WP-Total` and `X-WP-TotalPages` headers, with `page` / `per_page` (max 100).
- Settings `POST` returns the full saved `values`, so the client can reset its dirty state without a refetch.
- Every controller is registered through the container using `share_with_implements_tags()`, so `Bootstrap::register_rest_routes()` picks it up (CLAUDE.md, "Dependency injection").
- New routes and controller methods carry `@since SPSG_VERSION`.
