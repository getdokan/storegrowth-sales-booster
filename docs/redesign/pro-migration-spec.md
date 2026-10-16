# Pro migration spec: StoreGrowth Pro on the redesigned lite

- Status: Draft (decision 2026-10-01: no legacy bundle; pro N requires lite N, see §6)
- Date: 2026-09-25, updated 2026-10-01
- Plugin: `storegrowth-sales-booster-pro` 2.2.0 (`StorePulse\StoreGrowthPro\`)
- Depends on: lite phases 1–4 (`migration-spec.md`), ADR-001…006 (`../adr/`), RDR-001, `pro-compat-review.md` (rules R1–R6)
- This is lite's phase 5.

## 1. Goal and key insight

**Goal:** move pro onto the new architecture (TypeScript, dokan-lite build, plugin-ui, REST) without breaking any mix of lite and pro versions a site might run.

**Key insight:** under R1, R2 and R3, lite owns the UI for every pro 2.2.0 setting:
- the fields (R1);
- the BOGO category-messages screen (R2);
- the caps and flags, decided server-side (R3);
- the previews (lite's preview widgets render the pro features too).

So **the new pro needs almost no admin JS.** Its migration is mostly:
- a capability handshake with lite;
- a check for lite's new admin, with a notice asking to update lite when it's missing;
- deleting its old antd admin bundle (no frozen copy, decision 2026-10-01);
- build infrastructure for pro-only UI (first entry: the license page, `#/license`).

Pro's PHP runtime (the storefront features) stays unchanged.

## 2. Current inventory (pro 2.2.0)

### 2.1 PHP
| File | Role | Notes |
|---|---|---|
| `storegrowth-sales-booster-pro.php` | Entry point; `Requires Plugins: woocommerce, storegrowth-sales-booster`; constants `STOREGROWTH_PRO_FILE`, `_DIR_URL`, `_DIR_PATH` | No version constant |
| `includes/Bootstrap.php` | Licence gate (`PluginUpdater::is_valid_license()`; when invalid, only a notice is shown and nothing else loads), loads modules, scripts, ajax; hooks `storegrowth_pro_is_active` | Handshake goes here |
| `includes/PluginUpdater.php` | Appsero licence and updates (`dependencies/Appsero`) | Unchanged |
| `includes/Modules.php` | `storegrowth_module_after_boot( $module_id )` → switch on lite `*Module::get_id()` → boots `*Pro` | Unchanged |
| `includes/Modules/*/*Pro.php` | Storefront and product-screen features. `add_action` / `add_filter` counts: BoGo 23, QuickCart 5, StockBar 4, QuickView 4, CountdownTimer 2, SalesPop 2, FloatingBar 1, FreeShippingBar 1, DirectCheckout 1 | Unchanged |
| `includes/Modules/*/templates/*.php` | Storefront templates (shop countdown, stock bar variants, floating bar pro, coupon, BOGO product-tab premium settings, …) | Unchanged |
| `includes/Modules/*/assets/` | Storefront/product-screen JS/CSS (`qc-coupon.js`, `qc-centered-cart.js`, `frontend-pro.js`, `variable-product-bogo-settings.js`) | Unchanged. **Depends on lite handle `wfc-script`**, which lite must keep (added to the compat contract) |
| `includes/Assets.php` | Enqueues `build/index.js` (the admin filter bundle) on `storegrowth_page_spsg-settings` / `-modules`; localizes `spsgProAdmin` (`ajax_url`, `bogo_nonce`) | Changes (§5) |
| `includes/Ajax.php` | `wp_ajax_bogo_category_msg_status_handler`, `wp_ajax_bogo_category_msg_delete` (nonce `spsg_bogo_nonce`, `manage_options`) | Kept (hook freeze) |
| `includes/Helper.php` | Pro path/URL helpers | Unchanged |

### 2.2 Admin JS (`src/`, one wp-scripts package; deps `antd`, `dayjs`, `@wordpress/i18n`)
| Module folder | `addFilter` calls | What they do |
|---|---|---|
| BoGo | 11 | Premium options (Buy X Get X, min quantity), badge radio boxes, editable message, category messages screen (`jQuery.post`), cap lift, list override |
| SalesPop | 11 | Pro fields: visibility, message, timing, image/popup style, typography |
| DirectCheckout | 8 | Label, layouts, redirect, shop page, design fields, preview styles |
| StockBar | 7 | Shop/variation display, bar colour, design, warning, preview parts |
| FloatingNotificationBar | 7 | Position, icon, redirection, coupon + countdown, display rules, height, font size |
| QuickView | 6 | Navigation, button position, redirection, close button, icon, fly-cart |
| FreeShippingBar | 5 | Position, icon, display rules, height, font size |
| QuickCart | 4 | Layout, position, content, preview (coupon preview) |
| SalesCountdown | 3 | Shop display, design colours, premium styles |
| UpsellOrderBump | 2 | Cap lift, list override |
| **Total** | **64 `addFilter` calls in `Modules/` (65 distinct hook names in the static scan)** | All target lite JS hooks retired by ADR-004 §4 |

### 2.3 Hooks pro **fires** (frozen, same rules as lite)
`sales_boster_floating_notification_bar_text`, `sales_boster_pd_banner_text`, `spsg_stock_bar_stock_below`, plus re-fired `woocommerce_cart_coupon` and `woocommerce_date_input_html_pattern`.

## 3. Target

| Area | 2.2.0 | New pro |
|---|---|---|
| Storefront PHP, templates, assets | as above | **Unchanged** |
| Pro detection | `storegrowth_pro_is_active` | Unchanged |
| Admin fields | 64 JS filters + antd | **None**: lite's schema renders them (R1) |
| Category messages UI | Pro JS | **Lite** screen (R2); pro ajax handlers kept, sharing the data layer with lite's REST |
| Caps | JS filter lifts them | Lite server-side from `has_pro()` (R3) |
| Handshake | none | `storegrowth_pro_admin_ui_version` → `2` (registered with or without a valid licence) |
| Old admin bundle | `build/index.js` | **Deleted** with its `src/` and the `antd` / `dayjs` / `colorette` deps; no legacy copy (decision 2026-10-01). `Assets` stays as a deprecated no-op class |
| Licence page | Appsero's page (`storegrowth-sales-booster-pro-license`) | Route `#/license` in lite's app (plugin-ui `License`, REST `sales-booster-pro/v1/license`); the "License" submenu links there and the Appsero slug redirects there. On old lite, Appsero's page stays |
| Build | wp-scripts, antd | dokan-lite pattern, TS, externals to lite's `window.storegrowth.*` (§7); pro's only admin build; no antd |
| Pro-only new features (future) | — | PHP schema filter `spsg_settings_schema` (fields with `tab`, `label`, `variant`); a custom control through `storegrowth_settings_{variant}_field` |

## 4. Field ownership (avoid double definitions)

- **Lite owns** every field that exists in pro 2.2.0. The full key list per module is in `modules/*.md` §4, rows with tier `pro`.
- **Pro owns** only fields added **after** 2.2.0. It adds them through `add_filter( 'spsg_settings_schema', …, 10, 2 )` (checking `$module_id`) with `pro: true`, a built-in field type and a `tab` (plus `label`, `help`, `labels`, `variant`, `priority`); lite draws them on that tab and saves them with it — no JS unless a custom control is needed (`storegrowth_settings_{variant}_field`). Redefining a lite field or using an unknown type is refused (reported under WP_DEBUG). Read through lite's `Helper::get_settings()` / `storefront_settings()`, a never-saved pro key gets its default; read from the raw option, pro supplies it.
- A field that redefines a lite-owned key is ignored (the module's definition wins) and reported with `_doing_it_wrong()` under WP_DEBUG. Pro must never re-declare a lite-owned field.
- Values of pro-owned fields are stored in the **same module option** as today (pro reads them through `Helper::find_option_settings`). The only exception is a feature that needs its own storage, which then gets its own REST controller in pro.
- **Previews:** lite's preview widgets render every 2.2.0 pro feature (shop countdown, variation stock bar, coupon chip, bar countdown, centered cart, …). New pro-only visuals register through `storegrowth.preview.{module}`.

## 5. PHP changes in pro

1. **Handshake** (`Bootstrap.php`, before the licence check): `add_filter( 'storegrowth_pro_admin_ui_version', [ $this, 'admin_ui_version' ] )` → `2`.
2. **Lite check.**
   - Feature detection, not a version compare: lite's new admin is present when `StorePulse\StoreGrowth\Admin\AdminMenu` has `PAGE` and `SCREEN_ID` (`Admin\LicensePage::is_app_available()`).
   - Without it (old lite), pro shows a warning notice: "StoreGrowth Pro needs the latest StoreGrowth to show its settings…" with an "Update StoreGrowth" link, and loads no admin UI. Storefront features and saved settings keep working.
3. **`Assets.php`:** enqueues nothing (kept as a deprecated no-op; `Assets::instance()` and `admin_enqueue_scripts()` are public). The only pro admin bundle is `build/license.js`, enqueued by `Admin\LicensePage` on `AdminMenu::SCREEN_ID`. `spsgProAdmin` is no longer localized (nothing in lite reads it; lite's category-messages screen uses its own REST).
4. **`Ajax.php`:** unchanged. `bogo_category_msg_status_handler` / `_delete` keep their nonce and capability checks. If lite's REST category-message routes exist, the handlers call the same lite data layer. No behaviour change.
5. **Frozen:** all pro-fired hooks (§2.3), pro class names, constants and templates.
6. **New symbols** carry `@since SPSG_PRO_VERSION`, pro's own placeholder. Add a `bin/version-replace` to pro, copying lite's.

## 6. Version matrix and behaviour

| Lite | Pro | Admin UI | Pro admin JS | Result |
|---|---|---|---|---|
| ≤ 2.2 (old) | 2.2.0 | Old antd | `build/index.js` | Today's behaviour |
| **new** | **2.2.0** | New | Old bundle loads but is inert; lite dequeues it (R6) | ✅ Via R1–R6 (`pro-compat-review.md`) |
| **new** | **new** | New | None, or new TS entries | ✅ Target |
| ≤ 2.2 (old) | **new** | Old antd, **without pro fields** | none | ⚠️ Not supported for editing (decision 2026-10-01): pro N requires lite N. Pro shows "Update StoreGrowth to use Pro's settings" and loads no admin UI; storefront features and saved settings keep working; licence stays on Appsero's own page |
| any | any, licence invalid | Whatever lite version | none (new lite: `#/license` only) | Pro does nothing (licence gate); lite locks pro fields; stored values kept |

**No support window:** there is no legacy bundle to keep (decision 2026-10-01). Pro N requires lite N; a `Requires Plugins` minimum version can't be expressed, so the notice above is the enforcement.

## 7. Build migration (pro repo)

- **Files:** copy lite's `webpack.config.js`, `webpack-entries.js`, `webpack-dependency-mapping.js`, `tsconfig.json`, `postcss.config.js`. No Lerna (there isn't one today).
- **Dependency mapping:**
  - `@wedevs/plugin-ui` → `window.storegrowth.pluginUI` (handle `spsg-plugin-ui`)
  - `@storegrowth/components|utilities|hooks|stores/*` → lite globals and handles
  - Pro **never bundles plugin-ui**.
  - Generated `.asset.php` files list the lite handles, so WordPress loads lite first.
- **Types:** pro gets `@storegrowth/*` types either from a small `types/storegrowth.d.ts` copied from lite, or from a published `@storegrowth/types` package (open question). A CI check diffs pro's copy against lite's.
- **Tailwind:**
  - Lite's stylesheet only contains classes lite's own source uses, so pro's classes wouldn't be generated.
  - Pro builds `build/pro-admin.css`: **utilities only** (no preflight), scoped to `.spsg-layout`, and dependent on `spsg-tailwind`.
  - Tokens come from `src/theme-tokens.css`, a copy of lite's `@theme` block, with a CI diff check.
  - Prefer plugin-ui and lite components over raw utilities, so this file stays tiny.
- **No legacy entry** (decision 2026-10-01): the 2.2.0 `src/` is deleted, not frozen; pro has no antd anywhere.
- **Scripts:** `start`, `build`, `type-check`, `lint:js`, `version` (`bin/version-replace.sh`, `SPSG_PRO_VERSION`); `makepot` includes `build`; `release` runs them all, then `archiver.mjs`.
- **`.distignore` / archiver:** exclude `src/`, `types/`, `bin/`, config files. Keep `build/`, `vendor/`, `dependencies/`.

## 8. Per-module pro tasks

In every row, the 2.2.0 JS is deleted outright (no legacy copy).

| Module | Pro 2.2.0 JS (filters) | Replaced by lite | Pro PHP work | Pro tests |
|---|---|---|---|---|
| BoGo | 11: premium options, badges, message edit, category messages (`jQuery.post`), cap/list | Lite fields (Buy X Get X, min quantity, badge upload, message edit), lite category-messages screen (R2), cap via `has_pro()` | None. Product-tab premium settings (PHP + `variable-product-bogo-settings.js`) unchanged | Category messages CRUD via lite REST + pro ajax; unlimited offers; product-tab variations |
| SalesPop | 11 | Lite schema (visibility, message, timing, image/popup style, typography) | None (`spsg_sales_pop_visbility_controller`, `_image_position`) | Targeting, message tokens, timing |
| DirectCheckout | 8 | Lite schema (label, pro layouts, quick-cart redirect, shop page, font/padding/border) | None (`spsg_direct_checkout_button_inline_styles`) | Buy-now layouts, Fly Cart redirect |
| StockBar | 7 | Lite schema (shop/variation display, colours, height, format, texts, warning) | None (templates `shop-stock-bar`, `variation-stock-bar`, `stock-count-below`) | Shop and variation bars |
| FloatingNotificationBar | 7 | Lite schema incl. "Advanced": coupon, custom icon, new tab (R1) | None (`bar-pro.php`, `countdown.php`, `coupon-code.php`) | Countdown, coupon chip, targeting |
| QuickView | 6 | Lite schema (navigation colour, position, redirect, close/details buttons, icon, auto-open Fly Cart) | None (`frontend-pro.js` needs `wfc-script`) | Icon mode, details button, redirect |
| FreeShippingBar | 5 | Lite schema (position, icon + custom, display rules, height, font size) | None (`bar-pro.php`) | Position, trigger, targeting |
| QuickCart (Fly Cart) | 4 | Lite schema (center layout, pro positions, stock, badge, free-shipping msg, coupon, redirect) | None (`qc-coupon.js`, `qc-centered-cart.js`, `coupon.php`) | Centered layout, coupon apply |
| SalesCountdown | 3 | Lite schema (shop display, counter colours) | None (`shop-countdown-timer.php`, `spsg_countdown_timer_styles`) | Shop loop countdown |
| UpsellOrderBump | 2 (cap lift) | Lite server-side cap via `has_pro()` (R3) | None | More than 2 bumps with pro |

**Net pro code change:**
- Delete `src/` (64 module filters) and the antd deps.
- Add the handshake, the lite check + notice, and the licence page (REST + `#/license`).
- Add build infrastructure.
- No storefront changes.

## 9. Release order

**Decision 2026-10-01: lite and pro are released together as v3.0.0** (replaces the earlier "pro after at least one lite patch release").

1. **Lite 3.0.0** (redesign) and **pro 3.0.0** ship on the same day. Lite 3.0.0 stays compatible with pro 2.2.0 through R1–R6, so a store that updates only lite keeps working.
2. Pro 3.0.0 has the handshake, the lite check + notice, the licence page and the new build; no legacy bundle.
3. Pro 3.0.0 **requires lite 3.0.0** (decision 2026-10-01). Its changelog says: "Requires StoreGrowth 3.0.0. With an older StoreGrowth, Pro's features keep working on the store but their settings can't be changed until StoreGrowth is updated."
4. No support window or later drop release is needed.

## 10. Tests (run from both repos)

- **E2E matrix** (§6 rows), with pinned zips of lite 2.2.0, pro 2.2.0 and the current builds.
- **Pro PHPUnit:** handshake filter returns 2; on old lite the notice shows and no admin bundle loads; licence REST (status shape, masked key, `manage_options`, errors) leaves the Appsero option shape unchanged.
- **Byte-identical fixture:** pro 2.2.0 option dump → save through lite N's UI with no changes → option unchanged (lite repo, shared fixture).
- **Storefront regression per module:** the "Pro tests" column in §8.
- **Bundle checks:**
  - no `antd` in pro's new bundle;
  - no plugin-ui copy inside the pro bundle (size check: `build/*.js` under a threshold, e.g. 50 KB; `license.js` is ~5 KB).

## 11. Tasks

Pro work is on the pro repo's branch `feature/react-admin-license` (39c7792, e4c32d3), not merged yet.

- [x] P1: Version-replace script (`bin/version-replace.sh`, `SPSG_PRO_VERSION`); `STOREGROWTH_PRO_VERSION` constant not added (not needed).
- [x] P2: Handshake filter + lite check (feature detection) + notice.
- [x] P3: Delete the old antd `src/` and its enqueue (`Assets.php` → deprecated no-op); **no legacy bundle** (decision 2026-10-01).
- [x] P4: New build infrastructure (webpack trio, tsconfig, types copy) with the licence page as first entry. No `pro-admin.css` yet: the page uses plugin-ui's `License` and utilities lite's stylesheet already has.
- [x] P5: Every 2.2.0 pro field and the category-messages screen are covered by lite (`.claude/scratch/pro-p5-coverage.md`: 63/64 covered or not needed; the Sales Pop external-products gap fixed in lite f814ca7a).
- [ ] P6: Version-mix tests (§10): lite 3.0.0 + pro 2.2.0, lite 3.0.0 + pro 3.0.0, old lite + pro 3.0.0; needs a licence key on the E2E pro stack.
- [ ] P7: `.distignore`, archiver (`bin/archiver.mjs`) and makepot done; changelog, version bump and docs at the 3.0.0 release.

## 12. Open questions

1. Distribute `@storegrowth/*` types as an npm package or a copied `.d.ts`?
2. ~~Support window length for legacy mode (§6).~~ Resolved 2026-10-01: no legacy mode; pro N requires lite N.
3. ~~Does pro N need any pro-only admin UI on day one?~~ Yes: the licence page (`#/license`).
4. Should the licence-invalid state show pro fields as "Licence expired" (distinct from "Upgrade")? That needs lite to receive `licence_status` from pro through an additive filter.
