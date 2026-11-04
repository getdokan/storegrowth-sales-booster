# ADR-004: Never rename or remove hooks; stay compatible with existing pro versions

- Status: Accepted
- Date: 2026-09-25
- Related: ADR-007 (settings engine), ADR-008 (one admin page; the old screen IDs), baselines in `tests/compat/`

## Context

Every shipped pro version (up to 2.2.0) depends on lite through:

- **PHP hooks** fired by lite, including `storegrowth_module_after_boot` and `storegrowth_pro_is_active`. They drive pro's storefront and runtime features.
- **Lite PHP classes and functions** (§6).
- **Option names, keys and value types.** Pro stores its pro-only settings **inside lite's options** and reads them in PHP, mostly through `Helper::find_option_settings`.
- **Admin screen IDs**, where pro enqueues its admin bundle.
- **65 JS filters** that the old antd admin fired. Pro's callbacks returned antd elements built from `window.SGSettings`. This was the only part of the contract that depended on antd.

Lite fires about 100 PHP hooks. Third-party code may use any of them.

The admin is a TypeScript app on REST and plugin-ui; antd, `window.SGSettings` and the antd admin bundles are gone. There is no legacy UI mode.

## Decision

### 1. PHP hook freeze
- No PHP hook is ever renamed or removed. This covers every entry in `tests/compat/php-hooks-baseline.txt`, dynamic hook patterns, and every `wp_ajax_*` / `wp_ajax_nopriv_*` registration.
- Each hook keeps its behaviour:
  - same name, including misspellings (`spsg_sales_pop_visbility_controller`, `sales_boster_*`);
  - same arguments, order and types;
  - same return contract;
  - same point in the request lifecycle.
- Replacements are additive and fire alongside the old hook. `do_action_deprecated()` / `apply_filters_deprecated()` wrappers are allowed only if the old hook keeps firing.
- New hooks carry `@since SPSG_VERSION` and are added to the baseline.

### 2. Public PHP API, data and transport freeze
These keep their names and signatures and may only be extended:
- the classes, methods, functions and constants in §6;
- container IDs, module IDs, admin page slugs `spsg-settings` / `spsg-modules` (kept as redirects to `storegrowth`, ADR-008; their screen IDs are the one exception to this ADR);
- option names, keys and value shapes, including misspelled keys (`enble_visibility`, `dispaly_time`, `slected_page_option`, `cupon_code`, `show_cupon`, `enable_qucik_view_icon`);
- custom table columns;
- every script and style handle lite registers (§6).

**Existing user settings are never lost.** Every settings write goes through `SettingsService::save()` (REST and the ajax adapters), which:
- writes only the keys in the request; every other stored key stays as it is (no whole-option replace, no deletes);
- leaves a key alone when the request sends back the value the API reported for it, so stored values the schema can't show (a decimal in a whole-number field, a non-hex colour, a value pro added) survive a save of the whole form;
- ignores pro keys while pro is inactive;
- saves nothing when any value is invalid, or when the stored option isn't an array;
- stores values in the shape the old admin stored them.

**Stored vs API shape.** The old admin posted form-encoded values and `Helper::sanitize_form_fields` only turned `'true'/'false'` into booleans, so options hold `toggle` → bool and **every other type as a string** (numbers too: `"10"`), colours as 6-digit hex. `SettingsService` stores exactly that shape; the REST API returns typed values (`toggle` bool, `number` int/float, the rest string). Storefront and pro code keep casting numbers themselves. Booleans never become wp-kit's `'on'/'off'`.

**Changing an option's value set** (a new layout, a renamed choice) is a versioned migration in `includes/Migrations/` run by `Upgrader`, never a translation at read time.

A sanitizer may never be stricter than what the old admin accepted for a value it could store, or that setting can't be saved again. Every module with a settings schema must pass `wp eval-file tests/compat/settings-roundtrip.php` (round trip byte-identical, one change touches one key, pro keys and invalid values write nothing).

Ajax and REST rules:
- **Admin ajax actions stay registered** as thin adapters that call the same service as the REST controllers. Same sanitization, same stored data.
- **REST routes stay permanently.** Namespace moves add the new route and keep the old one (`spsg/v1/order-bumps` next to `sales-booster/v1/order-bumps`).
- **Storefront ajax stays admin-ajax** (guest cart actions; the `wp_rest` cookie nonce would break guests), ADR-006.

### 3. Pro compatibility
- **Lite owns the full settings schema for every module, including the pro-only fields**, keyed to the same option keys pro reads. Each pro field has `pro: true` in the schema. Every pro 2.2.0 field is in lite's schema, even if the design drops it (each locked field shows its own Pro badge).
- **Gating:** when `storegrowth_pro_is_active` is true, pro fields are editable. Otherwise they render locked (crown + upgrade), and the save **ignores** pro keys. Caps and flags are decided server-side from `has_pro()`, never in JS.
- **Result:** pro 2.2.0 keeps working with the current lite. Its PHP reads the same options, edited through lite's UI. Its admin JS bundle has no lite slots to fill and doesn't load (ADR-008). Pro 2.2.0 needs no update.
- **Pro-only screens not reachable through a schema** keep their ajax actions and have REST routes lite registers: the BOGO category messages (`sales-booster/v1/bogo/category-messages`, writes need pro). BOGO's product-tab schedule and variations are PHP-rendered on the product edit screen and unaffected.
- **New pro versions** extend through the additive PHP filters (`spsg_settings_schema`, `spsg_settings_page`, record-editor filters; ADR-007, ADR-009, ADR-010) and the JS extension points in §4.

### 4. JS hooks — the one deliberate exception
The 83 JS hooks in `tests/compat/js-hooks-baseline.txt` belonged to the antd UI. Their contract was "receive `(value, formData, onFieldChange)` and return an antd element", which can't be honoured without antd and `window.SGSettings`.

- These hook names are **retired**. This is the only exception to "never remove hooks", and it's recorded here on purpose. The baseline file stays as the record of what was retired.
- Nothing breaks at runtime: an `addFilter` on a hook nobody fires is a no-op. The fields pro used to inject are rendered by lite from the schema (§3).
- **The JS extension points** (namespace `storegrowth.*`), frozen under the same rules as §1:
  - `storegrowth.admin.routes` ( routes ): add admin routes;
  - `storegrowth.settings.page` ( parts, moduleId ): a module's preview and page-drawn controls (ADR-009);
  - `storegrowth.preview.{module}`: extend a module's live preview;
  - `storegrowth_settings_{variant}_field` ( defaultField, element ): the control of a field variant (ADR-007). The underscore name is plugin-ui's field-hook format, a deliberate exception to the `storegrowth.*` naming.
- Record editors have no JS tab hooks; they're extended in PHP (ADR-010).

### 5. Enforcement
- **Hook baseline:** `npm run check:hooks` re-extracts PHP hook names from `includes/`, `modules/`, `integrations/`, `helpers/`, `templates/` and fails if any name in `php-hooks-baseline.txt` is missing.
- **Settings round trip:** `wp eval-file tests/compat/settings-roundtrip.php` for every schema.
- **With and without pro:** every change is checked with no pro, pro 2.2.0 and the current pro: pro fields locked without pro and editable with it; saved options keep the stored shape; pro storefront features read them correctly.
- **Code review:** the `storegrowth-code-review` checklist has "no PHP hook, public method, option key, slug, ajax action, REST route or handle removed or renamed".

### 6. Contract inventory
The public PHP API pro and third parties use (namespace `StorePulse\StoreGrowth\`):

| Symbol | Notes |
|---|---|
| `Helper::find_option_settings`, `Helper::get_settings` | pro's main reads (69 / 19 calls in 2.2.0) |
| `Helper::get_pro_modules_path` / `get_pro_modules_url` / `include_pro_modules_file` / `get_pro_plugin_path` / `get_pro_plugin_url`, `get_modules_path` / `get_modules_url` | paths |
| `Helper::template_visibility_controller` / `should_template_visibility_controller` | |
| `Helper::sanitize_css_keyword` / `sanitize_css_color`, `is_product_discountable`, `get_days_for_schedule` | |
| Module `BoGo\Helper`: `get_product_bogo_settings`, `get_product_bogo_settings_for_cart`, `prepare_bogo_settings`, `get_global_offered_product_list`, `build_offer_stamp` | |
| Module `ProgressiveDiscountBanner\Helper`, `FloatingNotificationBar\Helper`: `get_banner_text`, `get_banner_icon`, `get_custom_banner_icon`, `get_banner_custom_icon` | |
| `Modules\BoGo\BogoDataManager::get_product_bogo_settings`, `save_product_bogo_settings`, `sync_offer_schedules` | |
| `Modules\CountdownTimer\Helper` | |
| Every `Modules\*\*Module` class | module ID / class checks |
| `sp_store_growth()`, `storegrowth_get_container()` | functions |
| `STOREGROWTH_*` constants (`STOREGROWTH_MODULE_DIR`, …) | |
| `Bootstrap::__get` container entries | every ID kept |

Admin surface:
- **Localized globals:** `spsgAdmin` (`ajax_url`, `nonce`, `isPro`, …) stays, because the ajax adapters and old pro's localize calls use it. Pro adds its own `spsgProAdmin`. `window.SGSettings` and the old `@wordpress/data` stores (`spsg`, `spsg_bogo`, `spsg_order_bump`, `spsg_direct_checkout`, `spsg_order_sales_pop`) are gone with the antd UI (§4).
- **Handles:** every handle lite registers stays. Pro's storefront scripts (`qc-coupon.js`, `qc-centered-cart.js`, Quick View `frontend-pro.js`) depend on lite's `wfc-script`. New code gets new handles (`spsg-admin`, `spsg-plugin-ui`, …) and never re-uses an old handle for different code. The old admin handles `spsg-settings-script`, `spsg-modules-script` and `spsg-notices-script` are registered as aliases of `spsg-admin`.
- **Ajax actions:** every one keeps working, including pro-only `bogo_category_msg_status_handler` / `bogo_category_msg_delete` and the lite handlers pro relies on.
- **REST routes:** `sales-booster/v1/*` and `spsg/v1/order-bumps` are kept permanently; new routes are additive.

## Consequences

**Positive:**
- One UI to maintain; no antd, no `window.SGSettings`.
- Pro 2.2.0 keeps working with no update.
- Pro-only settings are visible (locked) to free users: upsell driven by the schema instead of a duplicate teaser bundle.

**Negative:**
- 83 JS hook names are retired. Any third-party snippet that used them loses its injected admin field (with no error). The release notes list them.
- Lite defines pro field schemas. A new pro-only field needs either a lite release or the additive PHP schema filter.
- Old ajax handlers and REST routes stay as adapters permanently.

## Alternatives considered

| Option | Why rejected |
|---|---|
| Keep the antd UI as a legacy mode for old pro | Two UIs to maintain; the schema-owned pro fields make it unnecessary |
| Render old pro's antd callbacks inside the new UI | Needs antd kept; mixed design systems; the callbacks expect `formData`/`onFieldChange` shapes that no longer exist |
| Require pro upgrade in lockstep | Breaks sites with lapsed licences or no auto-update |
| Keep firing old JS hook names with new arguments | Silent breakage for every existing callback; worse than retiring them openly |
