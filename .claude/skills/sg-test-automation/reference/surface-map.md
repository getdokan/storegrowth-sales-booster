# StoreGrowth — Testable Surface Map

Authoritative reference for what to assert. Exact strings matter. Admin slugs, REST routes, ajax actions, and option keys were read from source. Storefront CSS markers are mostly read from `templates/`/`assets/`; a few are inferred — **verify with codegen or the browser MCP before hard-coding a storefront selector**.

## Admin pages (wp-admin `?page=` slugs)

Parent menu slug: `sales-booster-for-woocommerce` (title "StoreGrowth", cap `manage_options`).

| Slug | Title | React mount id |
| --- | --- | --- |
| `spsg-settings` | Settings - StoreGrowth | `#sbooster-settings-page` |
| `spsg-modules` | Modules - StoreGrowth | `#sbooster-modules-page` |
| `go-spsg-docs` | Documentation | external redirect (no app) |
| `go-spsg-pro` | Upgrade to Pro | external redirect (no app) |

Both apps are **HashRouter SPAs**. Deep links: `spsg-settings#/dashboard/overview`, `spsg-modules#/ini-setup`. Navigate with `gotoAdminPage(page, 'spsg-settings')` / `gotoModules(page)` and assert the mount id is visible before interacting.

## REST routes

Namespaces: **`sales-booster/v1`** and **`spsg/v1`**. Every plugin route checks `manage_options` via its `permission_callback`. Test happy path **and** anonymous rejection (`401`/`403`).

| Route | Methods | Namespace | Notes |
| --- | --- | --- | --- |
| `/wp-json/sales-booster/v1/products` | GET | sales-booster/v1 | Product picker (extends WC products controller); supports `per_page`, `search`, `author` |
| `/wp-json/sales-booster/v1/bogo/offers` | GET, POST | sales-booster/v1 | BogoController list/create |
| `/wp-json/sales-booster/v1/bogo/offers/(?P<id>\d+)` | GET, PUT | sales-booster/v1 | BogoController read/update |
| `/wp-json/sales-booster/v1/bogo/offers/(?P<id>\d+)/status` | PUT | sales-booster/v1 | Toggle offer status |
| `/wp-json/spsg/v1/order-bumps` | GET, POST | spsg/v1 | OrderBumpController list/create |
| `/wp-json/spsg/v1/order-bumps/(?P<id>[\d]+)` | GET, PUT, DELETE | spsg/v1 | OrderBumpController CRUD |
| `/wp-json/spsg/v1/order-bumps/matching` | GET | spsg/v1 | Bumps matching the current cart/checkout |

REST health check: `GET /wp-json/` → `body.namespaces` should contain `sales-booster/v1` (and `spsg/v1` when upsell-order-bump is active).

## Ajax actions

Core dispatcher: **`wp_ajax_spsg_admin_ajax`** (`includes/Ajax.php`, cap `manage_options`, nonce `spsg_ajax_nonce`). POST `method=` selects the operation:
- `get_all_modules` → `ModuleManager::list_all_modules()`
- `update_module_status` → POST `data[module_id]`, `data[status]` (`'true'`/`'false'`) → activate/deactivate.

Other core: `wp_ajax_spsg_process_user_concent_data` (open, nonce param), `wp_ajax_spsg_inisetup_flag_update` (`manage_options`).

Per-module settings ajax (all nonce `spsg_ajax_nonce`, pattern `spsg_<module>_{save,get}_settings`):

| Module | Actions |
| --- | --- |
| stock-bar | `spsg_stock_bar_save_settings`, `spsg_stock_bar_get_settings` |
| countdown-timer | `spsg_countdown_timer_save_settings`, `spsg_countdown_timer_get_settings` |
| direct-checkout | `spsg_direct_checkout_save_settings`, `spsg_direct_checkout_get_settings` |
| fly-cart | `spsg_fly_cart_save_settings`, `spsg_fly_cart_get_settings` |
| progressive-discount-banner | `spsg_pd_banner_save_settings`, `spsg_pd_banner_get_settings` |
| quick-view | `spsg_quick_view_save_settings`, `spsg_quick_view_get_settings` |
| floating-notification-bar | `spsg_floating_notification_bar_save_settings`, `spsg_floating_notification_bar_get_settings` |
| sales-pop | `spsg_popup_product_get`, `spsg_popup_product_save` |
| bogo | `spsg_bogo_general_save_settings`, `spsg_bogo_general_get_settings`, plus front: `offer_product_add_to_cart`, `update_offer_product`, `bogo_category_msg_create/list` (also `nopriv`) |

## Options / settings keys

| Key | Purpose |
| --- | --- |
| `spsg_active_module_ids` | Array of active module ids — `[ 'bogo' => 'bogo', ... ]` |
| `spsg_user_consent_data` | Tracking consent |
| `spsg_ini_completion` | Initial-setup-done flag |
| `spsg_<module>_settings` | Per-module settings (e.g. `spsg_stock_bar_settings`, `spsg_fly_cart_settings`, `spsg_countdown_timer_settings`, `spsg_quick_view_settings`, `spsg_floating_notification_bar_settings`, `spsg_direct_checkout_settings`, `spsg_progressive_discount_banner_settings`, `spsg_bogo_general_settings`) |
| `spsg_popup_products` | Sales-pop per-product config |
| Countdown post meta | `_spsg_countdown_timer_discount_{start,end,amount}` on products |

Upsell-order-bump uses a **custom DB table** (`Migration::run_migration()`), not an option.

## Modules — id, name, storefront page, hook, DOM marker

`id` = slug in `spsg_active_module_ids`; `name` = label on the Modules screen. To test storefront behavior: activate → visit the page → assert marker → deactivate → assert gone.

| id | name | Storefront page | Injection hook | DOM marker (verify before use) |
| --- | --- | --- | --- | --- |
| `bogo` | BOGO | single product, cart, fly-cart | `woocommerce_single_product_summary`, `woocommerce_before_calculate_totals`, cart-item filters | offer cart-item CSS class (via `woocommerce_cart_item_class`), product badge |
| `countdown-timer` | Countdown Timer | single product | `woocommerce_before_add_to_cart_form` | `.ct-layout-1`, `.ct-layout-2`, `.ct-custom` |
| `direct-checkout` | Direct Checkout | shop loop, single product | `woocommerce_loop_add_to_cart_link` (filter), `woocommerce_after_add_to_cart_button` | "Buy Now" button replacing add-to-cart |
| `floating-notification-bar` | Floating Bar | all pages | `wp_footer` | `.spsg-fn-bar-data-content`, `a.fn-bar-action-button` |
| `fly-cart` | Fly Cart | all pages (drawer) | `wp_footer`, `woocommerce_add_to_cart_fragments` | `.wfc-cart-icon`, `.wfc-open-btn.wfc-icon`, `span.wfc-cart-countlocation`, layout `.spsg-quick-cart-center-layout` |
| `progressive-discount-banner` | Free Shipping Rules | cart, fly-cart | `woocommerce_add_to_cart_fragments`, `woocommerce_cart_calculate_fees` | `.spsg-pd-banner-bar-wrapper`, `.spsg-pd-banner-bar`, `.spsg-pd-banner-text` |
| `quick-view` | Quick View | shop loop, single product | shop-loop item hooks | `.spsgqcv-btn`, `.spsgqcv-btn-{product_id}`, modal `[data-effect]` |
| `sales-pop` | Sales Notification | all pages | `wp_footer` | `.custom-social-proof`, `.custom-notification`, `.custom-notification-container`, `#image_of_product`, `#product_url` |
| `stock-bar` | Stock Bar | single product | `woocommerce_before_add_to_cart_form`, `woocommerce_get_stock_html` (filter) | `.spsg-stock-bar`, `.spsg-stock-progress-bar-section`, `.spsg-stock-progress-title`, `.jqmeter-container` |
| `upsell-order-bump` | Upsell Order Bump | checkout | REST-driven (`/spsg/v1/order-bumps/matching`) | order-bump block on checkout |

## Module enable/disable mechanism

1. Toggle in `?page=spsg-modules` (Ant Design `role="switch"`, `aria-checked`).
2. Fires `wp_ajax_spsg_admin_ajax` with `method=update_module_status`, `data[module_id]`, `data[status]`, nonce `spsg_ajax_nonce`.
3. `Ajax::update_module_status()` → `BaseModule::activate()`/`deactivate()` → `update_option('spsg_active_module_ids', …)`.
4. Fires `do_action('spsg_module_activated', $id)` / `spsg_module_deactivated`. Active modules then `boot()` their `BootstrapServiceProvider`, registering their storefront hooks.

No REST endpoint for toggling — it is ajax-only. In UI tests use `setModuleState(page, name, enabled)` (`helpers/modules.ts`); it is idempotent and waits for `aria-checked` to settle.

## Quick selector cheatsheet (verified / from source)

- Settings SPA mounted: `#sbooster-settings-page` (assert visible after `?page=spsg-settings`).
- Modules SPA mounted: `#sbooster-modules-page` (assert visible after `?page=spsg-modules`).
- Module toggle: nearest card ancestor of the module name that contains a `role="switch"`, then drive the switch (see `setModuleState`).
- Logged-in admin: `#wpadminbar` visible.
