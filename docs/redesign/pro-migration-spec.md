# Pro migration spec: StoreGrowth Pro on the redesigned lite

- Status: Draft
- Date: 2026-09-25
- Plugin: `storegrowth-sales-booster-pro` 2.2.0 (`StorePulse\StoreGrowthPro\`)
- Depends on: lite phases 1–4 (`migration-spec.md`), ADR-001…005, `pro-compat-review.md` (rules R1–R6)
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
- a version check against lite;
- freezing its old admin bundle for sites still on old lite;
- build infrastructure for future pro-only UI.

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
| **Total** | **64 `addFilter` calls in `Modules/` (65 distinct hook names in the static scan)** | All target lite JS hooks retired by ADR-005 §4 |

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
| Handshake | none | `storegrowth_pro_admin_ui_version` → `2` |
| Old admin bundle | `build/index.js` | Frozen as `build/legacy/index.js`, loaded **only on old lite** (§6) |
| Build | wp-scripts, antd | dokan-lite pattern, TS, externals to lite's `window.storegrowth.*` (§7); no antd in new code |
| Pro-only new features (future) | — | PHP schema filter `storegrowth_settings_schema_{module}` + optional TS entries using `storegrowth.*` extension points |

## 4. Field ownership (avoid double definitions)

- **Lite owns** every field that exists in pro 2.2.0. The full key list per module is in `modules/*.md` §4, rows with tier `pro`.
- **Pro owns** only fields added **after** 2.2.0. It adds them through `add_filter( 'storegrowth_settings_schema_{module}', … )` with `pro: true` and `owner: 'pro'`, and their sanitizers ship with them.
- The lite registry **rejects a duplicate field id**: the first definition wins, and the conflict is logged via `wc_get_logger()` in debug mode. Pro must never re-declare a lite-owned field.
- Values of pro-owned fields are stored in the **same module option** as today (pro reads them through `Helper::find_option_settings`). The only exception is a feature that needs its own storage, which then gets its own REST controller in pro.
- **Previews:** lite's preview widgets render every 2.2.0 pro feature (shop countdown, variation stock bar, coupon chip, bar countdown, centered cart, …). New pro-only visuals register through `storegrowth.preview.{module}`.

## 5. PHP changes in pro

1. **Handshake** (`Bootstrap.php`, after the licence check):
   ```php
   /**
    * Tell lite which admin UI generation this pro build supports.
    *
    * @since SPSG_PRO_VERSION
    */
   add_filter( 'storegrowth_pro_admin_ui_version', static fn() => 2 );
   ```
2. **Lite version check.**
   - Add a version constant, `STOREGROWTH_PRO_VERSION` (new, additive).
   - Read lite's `STOREGROWTH_VERSION`. If it's below the redesign release (`SPSG_REDESIGN_MIN = X.Y.0`), run in **legacy admin mode** (§6).
   - Show a dismissible notice: "Update StoreGrowth to get the new settings experience".
3. **`Assets.php`:**
   - On new lite, enqueue nothing admin-side, unless pro ships TS entries for post-2.2 features (§7), loaded on the new SPA page with dependencies on lite handles.
   - On old lite, enqueue `build/legacy/index.js` exactly as today (same screen IDs, same `spsgProAdmin`).
4. **`Ajax.php`:** unchanged. `bogo_category_msg_status_handler` / `_delete` keep their nonce and capability checks. If lite's REST category-message routes exist, the handlers call the same lite data layer. No behaviour change.
5. **Frozen:** all pro-fired hooks (§2.3), pro class names, constants and templates.
6. **New symbols** carry `@since SPSG_PRO_VERSION`, pro's own placeholder. Add a `bin/version-replace` to pro, copying lite's.

## 6. Version matrix and behaviour

| Lite | Pro | Admin UI | Pro admin JS | Result |
|---|---|---|---|---|
| ≤ 2.2 (old) | 2.2.0 | Old antd | `build/index.js` | Today's behaviour |
| **new** | **2.2.0** | New | Old bundle loads but is inert; lite dequeues it (R6) | ✅ Via R1–R6 (`pro-compat-review.md`) |
| **new** | **new** | New | None, or new TS entries | ✅ Target |
| ≤ 2.2 (old) | **new** | Old antd | `build/legacy/index.js` (frozen copy of 2.2.0's bundle) | ✅ Pro fields still injected into the old UI; notice asks to update lite |
| any | any, licence invalid | Whatever lite version | none | Pro does nothing (licence gate); lite locks pro fields; stored values kept |

**Support window:** new pro keeps `build/legacy/` for as long as it supports lite older than `SPSG_REDESIGN_MIN`. Proposal: 2 minor pro releases or 6 months, whichever is longer. Dropping it needs a `Requires Plugins` / min-version bump and a separate ADR.

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
- **Legacy entry:**
  - The current `src/` moves to `legacy/src/` and builds to `build/legacy/index.js` with the old antd dependencies.
  - It's frozen: no changes except security fixes.
  - It's the only place antd remains, and it's deleted when the support window ends.
- **Scripts:** `start`, `build`, `type-check`, `lint:js`; update `makepot` to include `build`, and `release`.
- **`.distignore` / archiver:** exclude `src/`, `legacy/src/`, `types/`, config files. Keep `build/` and `build/legacy/`.

## 8. Per-module pro tasks

In every row, "delete" refers to the new `src/`; the 2.2.0 code survives only as the frozen `legacy/` copy.

| Module | Pro 2.2.0 JS (filters) | Replaced by lite | Pro PHP work | Pro tests |
|---|---|---|---|---|
| BoGo | 11: premium options, badges, message edit, category messages (`jQuery.post`), cap/list | Lite fields (Buy X Get X, min quantity, badge upload, message edit), lite category-messages screen (R2), cap via `has_pro()` | None. Product-tab premium settings (PHP + `variable-product-bogo-settings.js`) unchanged | Category messages CRUD via lite REST + pro ajax; unlimited offers; product-tab variations |
| SalesPop | 11 | Lite schema (visibility, message, timing, image/popup style, typography) | None (`spsg_sales_pop_visbility_controller`, `_image_position`) | Targeting, message tokens, timing |
| DirectCheckout | 8 | Lite schema (label, pro layouts, quick-cart redirect, shop page, font/padding/border) | None (`spsg_direct_checkout_button_inline_styles`) | Buy-now layouts, Fly Cart redirect |
| StockBar | 7 | Lite schema (shop/variation display, colours, height, format, texts, warning) | None (templates `shop-stock-bar`, `variation-stock-bar`, `stock-count-below`) | Shop and variation bars |
| FloatingNotificationBar | 7 | Lite schema incl. "Advanced (Pro)": coupon, custom icon, new tab (R1) | None (`bar-pro.php`, `countdown.php`, `coupon-code.php`) | Countdown, coupon chip, targeting |
| QuickView | 6 | Lite schema (navigation colour, position, redirect, close/details buttons, icon, auto-open Fly Cart) | None (`frontend-pro.js` needs `wfc-script`) | Icon mode, details button, redirect |
| FreeShippingBar | 5 | Lite schema (position, icon + custom, display rules, height, font size) | None (`bar-pro.php`) | Position, trigger, targeting |
| QuickCart (Fly Cart) | 4 | Lite schema (center layout, pro positions, stock, badge, free-shipping msg, coupon, redirect) | None (`qc-coupon.js`, `qc-centered-cart.js`, `coupon.php`) | Centered layout, coupon apply |
| SalesCountdown | 3 | Lite schema (shop display, counter colours) | None (`shop-countdown-timer.php`, `spsg_countdown_timer_styles`) | Shop loop countdown |
| UpsellOrderBump | 2 (cap lift) | Lite server-side cap via `has_pro()` (R3) | None | More than 2 bumps with pro |

**Net pro code change:**
- Delete `src/` (64 module filters, moved to `legacy/`).
- Add the handshake, version check and asset switch (about 50 lines of PHP).
- Add build infrastructure.
- No storefront changes.

## 9. Release order

1. **Lite N** (redesign) ships. It's compatible with pro 2.2.0 through R1–R6 and needs no pro release. This is the "user updates lite only" case.
2. **Pro N** ships after lite N is stable (proposal: at least 1 lite patch release later). It has the handshake, version check, legacy bundle and new build.
3. Pro N's changelog says: "Requires StoreGrowth N for the new settings UI; older StoreGrowth still supported via legacy mode."
4. The support window ends (§6): a separate ADR, then a pro release that drops `build/legacy/` and sets min lite = N.

## 10. Tests (run from both repos)

- **E2E matrix** (§6 rows), with pinned zips of lite 2.2.0, pro 2.2.0 and the current builds.
- **Pro PHPUnit:** handshake filter returns 2; the version check chooses legacy mode on old lite; `Assets` enqueues the correct bundle per mode.
- **Byte-identical fixture:** pro 2.2.0 option dump → save through lite N's UI with no changes → option unchanged (lite repo, shared fixture).
- **Storefront regression per module:** the "Pro tests" column in §8.
- **Bundle checks:**
  - no `antd` in pro's new bundle;
  - no plugin-ui copy inside the pro bundle (size check: `build/*.js` without `legacy/` under a threshold, e.g. 50 KB).

## 11. Tasks

- [ ] P1: Add `STOREGROWTH_PRO_VERSION` and a version-replace script.
- [ ] P2: Handshake filter + lite version check + notice.
- [ ] P3: Move `src/` → `legacy/src/`; build `build/legacy/index.js`; `Assets.php` mode switch.
- [ ] P4: New build infrastructure (webpack trio, tsconfig, types copy, `pro-admin.css` pipeline) with an empty `src/`.
- [ ] P5: Confirm every 2.2.0 pro field and the category-messages screen are covered by lite (checklist against `modules/*.md`). File lite issues for anything missing. **This blocks pro N.**
- [ ] P6: Tests (§10), CI matrix.
- [ ] P7: `.distignore`, archiver, makepot, changelog, docs.

## 12. Open questions

1. Distribute `@storegrowth/*` types as an npm package or a copied `.d.ts`?
2. Support window length for legacy mode (§6).
3. Does pro N need any pro-only admin UI on day one? If not, P4 can ship as scaffolding only.
4. Should the licence-invalid state show pro fields as "Licence expired" (distinct from "Upgrade")? That needs lite to receive `licence_status` from pro through an additive filter.
