# REST API for the redesigned admin

- Status: Draft
- Date: 2026-09-25
- Rules: ADR-004. Existing routes and ajax actions are never removed. Old ajax handlers become thin adapters over the same service the REST controllers use.
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
| 6 | `GET /settings/{module}` | DONE (1c) | `{ schema, values }` for one module. `schema` includes pro fields with `pro:true`; `values` come from the existing option with defaults filled in. 404 `spsg_settings_module_not_found` for a module without a schema | every `spsg_*_get_settings` (below) |
| 7 | `POST /settings/{module}` `{ values }` | DONE (1c) | Validate and sanitize per the schema, ignore pro keys when pro is inactive, **merge** into the existing option (same key names and value types), return `{ schema, values }`. 400 `spsg_settings_invalid` with `data.params` (key → message); nothing is saved then | every `spsg_*_save_settings` (below) |
| 8 | `GET /settings/{module}/defaults` | SKIPPED | The client reads defaults from the schema | — |

Engine: `includes/Settings/SettingsService.php`; each module declares `Interfaces\SettingsSchema` in its always-loaded `ServiceProvider`. Hooks: filter `spsg_settings_schema( $fields, $module_id )` (pro adds fields), action `spsg_settings_saved( $module_id, $new, $old )`. Value shapes: migration-spec §8.
| 9 | `GET /dashboard/overview` | NEW | Dashboard tiles: module count, active count, revenue, template count | — |
| 10 | `GET /onboarding` · `POST /onboarding` | NEW | Initial-setup state and completion flag | `spsg_inisetup_flag_update` |
| 11 | `GET /notices/admin` · `POST /notices/dismiss` | EXISTS | Admin notices (wp-kit) | — |
| 12 | `GET /migration/status` · `POST /migration/upgrade` | EXISTS | Data migrations (`update_plugins`) | — |

`{module}` = `countdown-timer`, `stock-bar`, `sales-pop`, `progressive-discount-banner`, `floating-notification-bar`, `quick-view`, `fly-cart`, `direct-checkout`, `bogo`.

`/settings/bogo` covers the global BOGO options (`spsg_bogo_general_settings`). **Done (10f):** the Dokan vendor options (`spsg_bogo_dokan_vendors_settings`, their own option) are their own page, `/settings/bogo-vendors`, registered through `spsg_settings_schemas` only while Dokan is active.

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
| `bogo` | `spsg_bogo_general_settings` | `spsg_bogo_general_get_settings`, `spsg_bogo_general_save_settings` |
| `bogo-vendors` (Dokan) | `spsg_bogo_dokan_vendors_settings` | `spsg_bogo_vendors_get_settings`, `spsg_bogo_vendors_save_settings` |

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
| 18 | `GET /bogo/offers?page&per_page&search&status&type&orderby&order` | CHANGE | **Done (10a):** `search` (name), `type`, `status` reach the query; `X-WP-Total` / `X-WP-TotalPages` count every listed row and are always sent; `X-SPSG-Can-Create: 1|0` says whether a create would pass the route's limit. To do: thumbnails + prices for the list cells |
| 19 | `POST /bogo/offers` | EXISTS | Lite cap: 2 global offers of any status → 403 `salesbooster_limit_exceeded` (checked before body validation; one rule, `BogoDataManager::can_create_global_offer()`). Pro-only values without pro: defaults for min quantity and schedule |
| 20 | `GET /bogo/offers/{id}` | CHANGE | **Done (10a):** returns the design keys (flattened, badge keys included) and `offer_schedule` |
| 21 | `PUT/PATCH /bogo/offers/{id}` | CHANGE | **Done (10a):** a merge over the stored offer (unknown `design_settings` keys kept); per-offer badge keys stored in `design_settings`; pro-only values without pro keep the stored value. To do: `bogo_type`, exclusions (pro, 10d) |
| 22 | `DELETE /bogo/offers/{id}` | EXISTS | |
| 22a | `GET /bogo/offers/editor` | NEW | **Done (10d, ADR-010):** the offer editor: `{ page, schema, can_create, currency: { symbol, position, decimals, decimal_separator, thousand_separator } }` from `BogoOfferFields` (filters `spsg_bogo_offer_fields`, `spsg_bogo_offer_page`). Without pro, create/update also ignore `product_page_message` (a new offer gets "Free Gift"), `default_badge_icon_name`, `default_custom_badge_icon` (R3). Create/update (#19, #21) return 400 `bogo_invalid_discount`, `bogo_invalid_dates`, `bogo_missing_target` (an update only for the keys it sends) and `bogo_offer_exists` as 400 |
| 23 | `POST /bogo/offers/{id}/status` `{ status }` | EXISTS | List status switch |
| 24 | `POST /bogo/offers/batch` `{ delete: [ids] }` | NEW | **Done (10c):** each id through the single-delete checks; returns `{ deleted, failed }`. List rows also carry `product_id` and, in `get_offered_product_info` / `get_different_product_info`, `image` and `regular_price` |
| 25 | `GET /bogo/offers/vendor` … | EXISTS | Dokan vendor controller (`dokandar` scope). It inherits the routes, so `POST /bogo/offers/vendor/batch` exists too, each id through the vendor's item check. **Done (10f):** `search` / `type` / `status` reach its list (always limited to the vendor's offers). On both `/bogo/offers` and `/bogo/offers/vendor`, a vendor's (not `manage_options`) create/update is rejected with 403 `spsg_bogo_vendor_product` when a target, the offer product (`get_different_product_field`) or an alternate isn't the vendor's (Dokan's vendor of the product), 403 `spsg_bogo_vendor_categories` for category targets, and 403 `spsg_bogo_vendor_buy_x_get_x` for a new (or switched-to) Buy X Get X offer while `vendors_can_create_buy_x_get_x` is off (missing = off); turning an offer on (`status: yes`) checks its products again, turning it off and deleting need only ownership. Filter `spsg_bogo_offer_rules` ( true, $data, $stored, $request ). **10f2:** `GET /bogo/offers/vendor/editor` adds `buy_x_get_x` (bool, `vendors_can_create_buy_x_get_x`; the vendor editor hides Buy X Get X while it's false, unless the offer already is one); the vendor dashboard (`integrations/src/dokan/bogo`, ADR-011) uses these routes only |

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
| 32 | `GET /bogo/category-messages` | NEW | `bogo_category_msg_list`. **Done (10e):** `[ { id, name, message, status } ]`: `id` is the category's term id (the message's key), `name` null when the category was deleted, `status` bool (`categoryStatus === 'true'`, what pro's storefront reads). One row per category (the ajax create could store a category twice; the first is listed). Works without pro |
| 33 | `POST /bogo/category-messages` `{ category, message, status? }` | NEW | `bogo_category_msg_create`. **Done (10e):** 201 with the item; stores `{ id: int, message, categoryStatus: 'true'\|'false' }` as the ajax does. 400 `bogo_invalid_category` (not a `product_cat`), `bogo_category_message_exists`, `bogo_category_messages_limit` (`spsg_bogo_max_category_messages`, default 100, as the ajax), `rest_invalid_param` (empty message; `sanitize_text_field`, the ajax's `wc_clean()` domain) |
| 33a | `PUT/PATCH /bogo/category-messages/{id}` `{ category?, message?, status? }` | NEW | **Done (10e):** changes only the keys sent, on the category's first (listed) row only, keeping its other keys and the id as stored (a 2.2.0 duplicate row stays as it was, so switching on doesn't print the message twice); `category` moves the message (400 `bogo_invalid_category` for ≤0 / unknown, `bogo_category_message_exists` when taken); 404 `bogo_category_message_not_found` |
| 34 | `PATCH /bogo/category-messages/{id}` `{ status: bool }` | NEW | `bogo_category_msg_status_handler` (pro). **Done (10e):** #33a with `status` only (no separate status route) |
| 35 | `DELETE /bogo/category-messages/{id}` | NEW | `bogo_category_msg_delete` (pro). **Done (10e):** `{ deleted: true, id }`; removes every row of the category, as pro's handler |

**Required:** under `pro-compat-review.md` R2, pro 2.2.0 users must keep a way to manage their existing category messages, so lite builds this pro-gated screen even though the design drops it. The ajax actions stay registered too.

**Done (10e):** `REST\CategoryMessagesController` over `BoGo\CategoryMessages` (writes only `bogo_category_messages`, keeps the option's other keys and non-array rows as stored, autoload default: the storefront reads it; an option or `bogo_category_messages` that isn't an array → every write 409 `bogo_invalid_option`, left alone, and the list is empty). Each write rewrites the option, so the admin sends one at a time (bulk delete in sequence, switches and row actions wait while one is pending). `manage_options` only (not `spsg_bogo_check_permission`: vendors don't manage store-wide messages); every write also needs pro (403 `salesbooster_pro_required`), as the old screen (upgrade overlay) and pro's own handlers did; reading doesn't. Registered only while BOGO is on. The ajax actions are unchanged (lite's `bogo_category_msg_create` still has no pro check, ADR-004).

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
| Pro-only | — | — | 4 routes (#32–35, 33a; #34 is #33a), done in 10e |
| Product-level | — | — | 3 optional (#36–38) |

Minimum to remove antd and go fully REST: #1, #2, #3, #6, #7, #9, #10, #13, #14, #17, #18, #20, #24, #26, #29, #30. Add #15 and #16 if page targeting and coupons stay, and #32–35 if category messages stay.

## 8. Shared response conventions
- Errors: `WP_Error` → `{ code, message, data: { status, errors?: { [fieldId]: message } } }`. Field errors map straight onto plugin-ui field errors.
- Lists: `X-WP-Total` and `X-WP-TotalPages` headers, with `page` / `per_page` (max 100).
- Settings `POST` returns the full saved `values`, so the client can reset its dirty state without a refetch.
- Every controller is registered through the container using `share_with_implements_tags()`, so `Bootstrap::register_rest_routes()` picks it up (CLAUDE.md, "Dependency injection").
- New routes and controller methods carry `@since SPSG_VERSION`.
