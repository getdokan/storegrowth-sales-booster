# StoreGrowth redesign — design vs current features vs plugin-ui

Date: 2026-09-25. Sources: mockups at https://storegrowth-design.vercel.app (13 pages),
lite `develop` @ eedd8d8e, pro plugin (local), plugin-ui `main` @ 45dd413.
Appendices: `findings-features-A.md` (countdown, stock bar, sales-pop, free shipping, floating bar — every key/default/pro split), `findings-features-B.md` (bogo, order bump, quick view, fly cart, direct checkout, admin shell, all ajax/REST endpoints).
Build phase: the `settings-migration-architect` agent covers mapping existing options onto plugin-ui/wp-kit schemas.

## 1. Verdict

| Question | Answer |
|---|---|
| Do the mockups cover every current feature? | **No.** Nearly every page adds, drops or reshapes fields. "Design-only" is not true for ~8 of 10 modules (§4). |
| Can plugin-ui build these pages? | **Mostly, but not with the `<Settings>` page component as is.** ~75% of controls map to existing components. The page shell (pill tabs + accordions + form + live preview) does not fit `<Settings>`. Use a hybrid: `SettingsProvider` + `FieldRenderer` inside a custom StoreGrowth shell. |
| Is the REST move ready? | Half. BOGO and Order Bump already use REST. All 10 module settings pages, module list/toggle and BOGO category messages still use admin-ajax. wp-kit's `BaseSettingsRESTController` is already vendored in `lib/` but uses a different storage layout than today's options (§5). |
| Pro gating in the design? | **None.** No field shows a pro badge or lock. Today ~100 fields and 2 hard caps (2 BOGO, 2 bumps, 5 sales-pop products/names) are pro-gated. Needs a design decision before build. |

## 2. What already exists

- `@wedevs/plugin-ui` is already in `assets/package.json` (used only by `AdminNotices.jsx`, theme `primary #0875ff`, `radius 6px`).
- `wedevs/wp-kit` is vendored via mozart into `lib/packages/WeDevs/WPKit` (Settings, DataLayer, Migration, AdminNotification). `Settings/BaseSettingsRESTController.php` gives GET schema+values / POST per-scope save.
- Other weDevs plugins already on plugin-ui + wp-kit, usable as references: `texty`, `woocommerce-conversion-tracking`, `dokan-lite`, `wepos`.

## 3. Shared shell — mapping

| Mockup element | plugin-ui | Status |
|---|---|---|
| Top bar (logo, version pill, What's New, Support, Upgrade + crown) | `TopBar`, `TopBar.UpgradeBtn`, `CrownIcon` | Fits. Needs `sticky` class and pill restyle |
| Feature rail 210px, active tint, dimmed inactive module → "deactivated" modal | `Layout`/`LayoutSidebar`/`LayoutMenu` (`onItemClick`, item `className`) + `AlertDialog*` | Fits. Do **not** use the Settings sidebar (256px, searchable, no click intercept) |
| Title card | `Card`/`CardHeader`/`CardTitle` | Fits |
| Pill tabs (brand text on active) | `Tabs` `TabsList variant="default"` + `data-active:text-primary` | Fits. `<Settings>` hardcodes underline tabs (`settings-content.tsx:115`) |
| Accordion cards | Only schema `section` with `collapsible` | **Gap** outside the schema. Needs an `Accordion` |
| Switch card (body shows when on) | `SwitchCard`, schema `switch_group` | Fits |
| Form 512px + live preview (device switch, dark toggle, product/shop/storefront mock) | Device toggle: `ToggleGroup`. Rest: none | **Gap — biggest one.** Build a shared `LivePreview` |
| Reset + Save at end of each tab | `renderSaveButton` (no reset handle) | Partial. Reset-to-defaults is custom |
| Lists (BOGO, Order Bump) | `DataViews` (`actions`, `supportsBulk`, `search`, `empty`, `paginationInfo`) | Fits. Status switch, avatar and price cells via `render`. Pagination/bulk bar will look WP-style, not mockup-style |
| Feature pages assume folded WP admin menu (`?nav=collapsed`) | none | Add WP `folded` body class on feature routes (small PHP/JS) |
| Dashboard stat tiles | `MatricsCard` doesn't match layout | Build from `Card` |
| Modules grid + master switch | `Card`, `Switch`, `LabeledSwitch`, `Button` | Fits |

## 4. Per module: design vs current code

Legend: **NEW** = in design, not in code. **GONE** = in code (lite or pro), not in design. **CHANGED** = same idea, different options/data shape.

### Countdown Timer — option `spsg_countdown_timer_settings` + product meta — ajax `spsg_countdown_timer_{get,save}_settings`
- NEW: heading font weight, letter spacing, line height; widget/counter radius, alignment, margin + padding box-model (2↔4 values); label text colour, separator colour; 6 templates (today ~3 layouts).
- CHANGED: "Shop Page Display" is pro today, plain in design.
- GONE: Dokan "Vendors" tab (`vendor_can_create_*`). Per-product discount % and dates stay on the product edit screen (not in design; fine if intended).
- Mockup has no Save button (autosaves to localStorage) — design bug.
- plugin-ui gaps: box-model input, side-by-side numbers, live template thumbnails.

### Stock Bar — option `spsg_stock_bar_settings` — ajax
- NEW: "Hide Counts" format option, font family, count/status text sizes, count text colour, card background colour.
- CHANGED: 10 pro fields (shop/variation display, bar colour, height, format, texts, warning qty/text/colour) are plain in design. Min quantity default 100 vs 10 today.
- Cleanup: 2 dead copy-paste keys (`shop_page_countdown_enable`, `product_page_countdown_enable`).
- Closest page to the schema renderer if templates become static images.

### Sales Notification (`sales-pop`) — option `spsg_popup_products` — ajax `popup_products` / `create_popup`
- NEW: Product Source "Best Sellers"; audience select (Everyone / Logged-in / Guests) exists as `user_type` in pro, so CHANGED rather than new.
- CHANGED: ~30 pro fields plain in design. Product source "Recent Orders" = today's latest orders. Visibility shown as 2 selects; today `banner_show_option` + `slected_page_option` page list — mockup draws no page picker.
- GONE: `number_of_orders`, `virtual_locations` still there; dead keys to drop: `enabe`, `sound*`, `address`, `virtual_country`, `virtual_time`, etc.
- plugin-ui gaps: async product multi-search field type, typography grid row (colour/size/weight), 2 selects under one label.

### Free Shipping Rules (`progressive-discount-banner`) — option `spsg_progressive_discount_banner_settings` — ajax
- Confirmed same module (`get_name()` = "Free Shipping Rules"). Still a single threshold + single reward; the design does not introduce multiple rules.
- CHANGED: Discount Type becomes 3 options (Free Shipping / Percentage / Fixed); today `discount_type` + `discount_amount_mode` — needs a mapping. **No amount field for Percentage/Fixed is drawn** — design gap. Page targeting options differ from today's page list.
- NEW: Design tab has no Save — design bug. Template has one preset, not wired.
- Security: save writes decoded JSON with no sanitization — fix during REST move.
- plugin-ui gaps: plain radio list, mode-dependent number (sec / %), rich tooltip with links, icon-or-upload picker.

### Floating Bar — option `spsg_floating_notification_bar_settings` — ajax
- NEW: Button Action "Scroll To Section"; "Who Can See".
- CHANGED: 17 pro fields plain in design (position, countdown, device, trigger, targeting, icon).
- GONE: coupon (`show_cupon`, `cupon_code`), custom icon upload, `new_tab_enable`.
- Design bugs: no Save/Reset; "Button Text" twice; Button Link default "Shop Now" and shown for every action.
- Shares ~20 keys with Free Shipping bar → one shared "bar" schema.
- Security: save unsanitized (same as Free Shipping).

### BOGO — custom table `spsg_bogo_settings` + option `spsg_bogo_general_settings` — REST `sales-booster/v1/bogo/offers` + 6 ajax
- CHANGED: global general settings (remove-from-cart, regular price, badges) move into each offer. Buy X Get X (pro today) is plain.
- NEW: list "Type" column Global/Specific has no editor field; list search (REST ignores `search` today); bulk delete.
- GONE: BOGO category type, alternate products, shop/category page messages, shop-page badge, category messages tab, Dokan vendor tab.
- Existing bugs to fix first: edit wipes `design_settings` (REST doesn't return it); global-offer badges never show; `X-WP-Total` counts global only.
- Not in design at all: WooCommerce product-tab BOGO form and the Dokan vendor dashboard BOGO UI — they stay on current UI unless redesigned too.
- plugin-ui gaps: async product search field, date field, badge image picker + upload.

### Order Bump — custom table `spsg_order_bumps` — REST `spsg/v1/order-bumps`
- CHANGED: schedule is a single preset select (Daily/Weekdays/Weekends/Always); today a multi-select of days that **is not even saved** (`bump_schedule` not persisted). Offer type adds **Free**; today discount/price only.
- NEW: status switch in list (column exists, no toggle today), search, bulk delete, pagination (today first 10 only).
- Design bug: preview shows a product page; bumps render at checkout. Heading reads "Order Bumps List".
- REST namespace `spsg/v1` should move to `sales-booster/v1` (keep an alias one release). Client uses `wpApiSettings.nonce` which is never enqueued — switch to `apiFetch`.

### Quick View — option `spsg_quick_view_settings` — ajax
- CHANGED: Modal effects Fade/Slide/Zoom/None vs 4 magnific-popup effects today; Add-to-cart redirect Shop/Cart/Checkout/Stay vs legacy-cart/shop/ajax; Button Position center/top-right/bottom vs before/after/center-on-image. All need value mapping or frontend work.
- CHANGED: pro fields (icon, view-details, navigation colour, position) plain in design.
- GONE: auto-open Fly Cart (pro).
- plugin-ui gaps: text max-length + counter, icon-only radio.

### Fly Cart — option `spsg_fly_cart_settings` — ajax
- CHANGED: Layout side/**popup** vs side/center today. BOGO badge and "cart auto-opens" appear as checkboxes (map to existing/pro keys — verify). All pro fields plain.
- GONE: Dokan store name/link toggles.
- Design bugs: General tab has no Save; default icon doesn't match preview.
- Existing bug: fragments filter drops other plugins' WooCommerce fragments (`CommonHooks.php:88-98`).
- plugin-ui gaps: visual picker cards (layout, 6 positions), icon radio.

### Direct Checkout — option `spsg_direct_checkout_settings` + product meta — ajax
- CHANGED: Button Layout drawn as 4 checkboxes but it's one choice → should be a radio. Redirect "Fly Cart Checkout" is pro. All pro design keys (font, padding, border) plain.
- NEW: "Custom Button Style" master switch (today `button_style`, so mapping only).
- Security: save unsanitized.
- plugin-ui gaps: plain radio list with per-option tooltip, padding box-model (same as Countdown).

### Not in the design at all
Dashboard "Revenue" tile (not surfaced today; BOGO/bump write order-item attribution meta, so it can be derived — needs a new aggregate endpoint), Settings page (`remove_data_on_uninstall`), Initial Setup wizard, WooCommerce product-edit tabs (Countdown, BOGO, Direct Checkout), Dokan vendor tabs/dashboard. Decide: keep current UI, or add to scope.

## 5. REST migration plan

Today: 10 settings get/save ajax pairs using 3 payload encodings, 3 of them with **no sanitization** (Free Shipping, Floating Bar, Direct Checkout; BOGO general and Dokan vendors too).

Target:
1. `GET/POST sales-booster/v1/settings/{module}` — one controller per module, schema-driven (option name, defaults, sanitizer per field). Replaces all 10 ajax pairs and adds sanitization.
2. `GET /modules`, `PATCH /modules/{id}` (404 on unknown id; fixes today's fatal in `update_module_status`).
3. `/bogo/category-messages` CRUD — only if category messages survive the redesign (§4 says GONE).
4. Move `spsg/v1/order-bumps` → `sales-booster/v1/order-bumps`. Make `sales-booster/v1/products` read-only (today it inherits full WC product CRUD).
5. **Keep** the 5 public cart actions (`spsg_fly_cart_frontend`, `spsgqcv_quickview`, `offer_product_add_to_cart`, `update_offer_product`, `upsell_offer_product_add_to_cart`) as nopriv ajax or move to Store API — never behind the `wp_rest` cookie nonce.

How pro plugs in after the move: today ~64 JS `addFilter` calls inject pro fields and lite's `pro-previews` injects locked teasers into the same hooks. In a schema-driven REST setup, pro adds its fields server-side through the schema filter (wp-kit already fires `{$option_prefix}_settings_schema`, `BaseSettingsRESTController.php:160`) and lite renders a locked state from a `pro` flag on the same schema. One source of truth, no JS hook wiring. This also answers §7 Q1 structurally.

wp-kit `BaseSettingsRESTController` fit — **do not use as-is**:
- Stores each page under `{prefix}_{page_id}` with nested paths → does not read today's flat options (`spsg_stock_bar_settings` etc.). Needs overriding `load_values`/`create_item` to map onto the existing option, or a data migration.
- `switch` saves `'on'/'off'`; today's values are booleans.
- `color_picker` uses `sanitize_hex_color` → drops any alpha. plugin-ui `ColorPicker` has `enableAlpha = true` by default, so users can pick values the backend silently discards. Set alpha off.
- Misspelled keys are stored data and must be kept or migrated: `enble_visibility`, `dispaly_time`, `slected_page_option`, `cupon_code`, `show_cupon`, `enable_qucik_view_icon`.

## 6. plugin-ui: gaps and fixes

Upstream (we own `getdokan/plugin-ui`) — small, worth doing first:
| # | Problem | Evidence |
|---|---|---|
| U1 | `ColorPicker`, `RadioImageCard`, `RadioIconCard`, `CombineInput`, `CopyInput`, `CardAction` not exported from root, and subpath exports (`/components/ui`, `/settings`, `/themes`) ship **only `.d.ts`, no `.js`** → cannot be imported at all | `src/index.ts`; `dist/components/ui/` has 0 `.js` |
| U2 | `radio_variant: 'simple'` typed but not rendered (falls to image card) | `fields.tsx:1009-1049` |
| U3 | `NumberField` / `SelectField` ignore `layout: 'full-width'`; select capped `sm:max-w-56` | `fields.tsx` |
| U4 | Schema `color_picker` can't turn alpha off | `color-picker.tsx:26`, `fields.tsx:458-470` |
| U5 | Tabs style fixed to underline in `<Settings>` | `settings-content.tsx:115` |
| U6 | No standalone `Accordion` | — |
| U7 | Text field: no `maxLength` / counter | `fields.tsx:152-168` |
| U8 | `renderSaveButton` has no reset-to-defaults handle | `settings-types.ts` |
| U9 | No pro/locked field flag | `SettingsElement` |
| U10 | `dist/styles.css` ships global Tailwind preflight and unprefixed utilities (why `assets/src/preflight-reset.css` exists) | — |
| U11 | Docs say `comparison: "="`; code only knows `==` → `"="` silently always shows | `settings-formatter.ts:370-398` |

### StoreGrowth-owned custom components (decided: we build these ourselves)

Not blockers — built in this plugin on top of plugin-ui primitives. Form fields register as custom schema variants via `applyFilters('{prefix}_settings_{variant}_field')` so they keep `dependencies`, validation and dirty tracking.

| Component | Used by | Built from (plugin-ui) |
|---|---|---|
| `FeatureLayout` (rail + title card + form/preview split) | all feature pages | `Layout`, `LayoutMenu`, `Card`, `AlertDialog` |
| `LivePreview` (device switch, dark toggle, product/shop/storefront/checkout frames, slots) | all feature pages | `ToggleGroup`, `Toggle` |
| Per-module preview widgets (countdown, stock bar, toast, bar, BOGO box, bump, quick view modal, cart panel, buy button) | one per module | plain React + shared CSS with storefront |
| `Accordion` | all feature pages | `Card` + `ChevronDown` (or upstream later) |
| `SaveBar` (Reset to defaults + Save) | all settings pages | `Button` |
| `ProductSearch` / `CategorySearch` | Sales Notification, BOGO, Order Bump | `SmartSelect`, `SmartMultiSelect` + `sales-booster/v1/products` |
| `DateField` / `DateRange` | BOGO, Floating Bar | `DatePicker` |
| `BoxModelInput` (margin/padding 2↔4) | Countdown, Direct Checkout | `InputGroup` |
| `TemplatePicker` (preset writes many fields) | Countdown, Stock Bar, Sales Notification, Free Shipping, Floating Bar | `RadioGroup` |
| `TypographyRow` (colour/size/weight) | Sales Notification | `ColorPicker`, `Input`, `Select` |
| `BadgePicker` / `IconPicker` (+ upload) | BOGO, Free Shipping, Floating Bar, Quick View, Fly Cart | `ToggleGroup`, `WpMediaUpload` |
| `PickerCards` | Fly Cart layout/position | `RadioGroup` |
| `ModeNumber` (radio + number whose unit follows it) | Free Shipping, Floating Bar trigger | `RadioGroup`, `LabeledRadio`, `InputGroup` |
| `ProLock` wrapper (once gating is decided) | any pro field | `CrownIcon`, `Badge`, `Tooltip` |

Location: shared components in `src/components/`, preview widgets next to each module in `modules/<name>/src/preview/` (see §9).

Still upstream in plugin-ui (these are the real blockers): U1 exports, U4 alpha off. Nice-to-have upstream: U2, U3, U7.

Theme (`createTheme`): primary/ring `#0875FF`, foreground `#25252D`, muted-fg `#828282`, border/input `#E9E9E9`, muted `#F3F4F6`, accent `#EFF6FF`, font Inter, radius 8px. Not reachable via tokens: 40px control height (plugin-ui hardcodes `h-9` = 36px), type scale, `#0663DB` hover → small scoped override stylesheet, or accept 36px.

## 7. Questions for design / product before build

1. Pro gating: where do locks/badges go, and do the free caps (2 BOGO, 2 bumps, 5 popup products) stay?
2. Confirm every GONE item in §4 is intended removal (BOGO categories/alternates/messages, Floating Bar coupon, Quick View auto-open Fly Cart, Dokan tabs).
3. NEW items that need backend work: Countdown spacing/alignment/typography, Stock Bar "Hide Counts", Sales-pop Best Sellers, Floating Bar scroll-to-section, Order Bump Free offer + schedule presets, Dashboard revenue.
4. Changed option sets needing value migration: Quick View effects/redirect/position, Fly Cart popup vs center, Free Shipping discount type, Order Bump schedule.
5. Missing Save on Countdown, Free Shipping Design tab, Floating Bar, Fly Cart General tab.
6. Free Shipping: amount field for Percentage/Fixed not drawn.
7. Order Bump preview should be a checkout page.
8. Product-edit tabs, Dokan vendor UI, Settings, Initial Setup: in or out of scope?

## 9. Architecture decisions

| # | Decision | Status |
|---|---|---|
Superseded by the ADRs in `adr/` and the plan in `migration-spec.md`. Where this section and those files disagree, the ADRs and the spec win.

| # | Decision | Status |
|---|---|---|
| D1 | TypeScript-first, full rewrite | Accepted — `adr/RDR-001` |
| D2 | Source layout: root `src/`, `modules/<name>/src/` | Accepted — `../adr/ADR-002` |
| D3 | Single build following dokan-lite; core bundles + separate module bundles; no monorepo | Accepted — `../adr/ADR-001` |
| D4 | Tailwind v4, one scoped stylesheet | Accepted — `../adr/ADR-003` |
| D5 | Custom components (§6 table) owned by StoreGrowth, built on plugin-ui | Accepted |
| D6 | Settings over REST (§5); pro extends the PHP schema, not JS hooks | Accepted — `adr/RDR-001` item 6, spec §5.4 |

The older draft tree and change list below are kept for history. The current tree is in `migration-spec.md` §3.

### Proposed tree
```
src/                              # shared admin app (TS)
  app/                            # shell: TopBar, FeatureLayout, router, ThemeProvider
  components/                     # LivePreview, Accordion, SaveBar, ProductSearch, … (§6)
  fields/                         # custom schema field variants, registered via applyFilters
  api/                            # typed apiFetch clients: settings, modules, bogo, order-bumps
  store/                          # @wordpress/data or react-query; one store per resource
  types/                          # shared types (schema, module, offer)
  pages/                          # dashboard, modules grid, settings
  index.tsx
modules/<name>/src/
  index.tsx                       # registers the module route/page with the shell
  schema.ts                       # field schema (mirrors PHP schema) or types for it
  preview/                        # widget mock for LivePreview
  components/                     # module-only UI (e.g. BOGO/Order Bump list + editor)
modules/<name>/assets/            # storefront-only JS/CSS stays here (not admin)
tsconfig.json                     # paths: @sg/* → src/*, @modules/* → modules/*/src
webpack.config.js                 # extends @wordpress/scripts, entries: src + modules/*/src
```

### What this changes
- **Build:** drop Lerna and the per-module `assets/package.json` for admin code; one root `package.json`, one `npm run build`/`start`. Per-module `watch:`/`build:` scripts become entry filters (e.g. `--env module=bogo`) if still wanted. Outputs to `build/` (root) with `*.asset.php` per entry; PHP enqueues by module id.
- **Storefront code:** frontend scripts (`modules/<name>/assets/js`, `css`) are out of scope for the redesign; leave them in place unless the rewrite touches them.
- **Types from PHP:** keep one source of truth for the settings schema. Either PHP serves the schema over REST (wp-kit style) and TS only types the shape, or generate TS types from the PHP schema. Don't hand-maintain both.
- **Pro plugin:** its `src/` (~64 `addFilter` calls) becomes obsolete. Pro ships PHP schema extensions plus, where needed, its own TS entries registering custom fields/previews through the same shell API. Pro should adopt the same TS + `src/` layout.
- **Dokan vendor UI** (`integrations/`) reuses `CreateBogo` today; it must move to the new BOGO editor or keep the old bundle until migrated.
- **Docs to update when this lands:** `CLAUDE.md` (build + layout sections), `storegrowth-frontend-dev` and `storegrowth-module-dev` skills, `phpcs.xml`/eslint ignores, `bin/archiver.js` / `.distignore` (exclude `src/`, `modules/*/src`, `tsconfig.json`). `bin/version-replace.sh` already sweeps `*.ts`/`*.tsx` — no change.
- **Tooling:** add `typescript`, `@types/react@18`, `@types/wordpress__*`; wp-scripts handles TS via Babel (no type-check) — add `tsc --noEmit` to lint/CI.

## 8. Suggested order

See `migration-spec.md` §7 for the phases: 0 upstream plugin-ui fixes → 1 build skeleton and shell → 2 Stock Bar pilot → 3 settings modules → 4 BOGO, Order Bump and integrations → 5 pro → 6 docs.
