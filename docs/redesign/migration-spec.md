# Migration spec: admin UI redesign — build, layout, TypeScript, Tailwind, REST

- Status: Draft
- Date: 2026-09-25
- Decisions: `adr/RDR-001` (redesign) and the core ADRs in `../adr/` (ADR-001…006). **ADR-004 (backward compatibility) overrides anything below that removes or renames a PHP hook, public PHP symbol, option, slug, ajax action or REST route.**
- REST surface: `rest-api.md`. Compatibility inventory: `compat-contract.md`.
- antd is removed completely. There's no legacy UI mode.
- Feature and design analysis: `report.md`; current settings inventory: `findings-features-A.md`, `findings-features-B.md`
- Reference implementation: `../dokan-lite` (`webpack.config.js`, `webpack-entries.js`, `webpack-dependency-mapping.js`, `src/base-tailwind.css`, `src/externals/plugin-ui.js`, `includes/Assets.php` shared UI registration)

## 1. Goal and non-goals

**Goal:** replace the Lerna/antd admin UI with a TypeScript + plugin-ui + Tailwind v4 UI. It is built by one wp-scripts config (dokan-lite pattern), talks to the server only over REST, and implements the new designs.

**Non-goals:**
- Rewriting the storefront JS/CSS.
- Changing storefront behaviour. The exceptions are features product approves in `report.md` §7.
- Moving public cart actions to REST.

## 2. Current → target

| Area | Current | Target |
|---|---|---|
| Package management | Lerna + npm workspaces, 12 `package.json` | One root `package.json`, no workspaces |
| Build | 12 `wp-scripts build` runs, 22 scoped scripts | One `wp-scripts build` with `webpack.config.js` + `webpack-entries.js` |
| Core admin source | `assets/src/*.js` (antd) | `src/**/*.tsx` (plugin-ui) |
| Module admin source | `modules/<name>/assets/src/*.js` | `modules/<name>/src/**/*.tsx` |
| Integration source | `integrations/assets/src` | `integrations/src` |
| Output | `assets/build/`, `modules/*/assets/build/`, `integrations/assets/build/` | `build/`, `modules/<name>/assets/js/` (generated names git-ignored), `build/integrations/` |
| Styling | antd + SCSS + `preflight-reset.css` | One scoped Tailwind v4 stylesheet `build/tailwind.css` |
| Shared UI | Each bundle inlines its deps | `window.storegrowth.{pluginUI,components,utilities,hooks,settingsStore}` via dependency mapping |
| Transport | 10 settings ajax pairs + mixed REST | The admin UI calls REST only (`rest-api.md`). Ajax actions stay registered as adapters |
| Pro fields | ~64 JS `addFilter` + lite teasers | Lite's schema owns every field; pro fields have `pro:true` and are editable when `storegrowth_pro_is_active` (ADR-004 §3) |
| JS hooks | 83 antd-bound hooks | Retired with antd; new `storegrowth.*` extension points (ADR-004 §4) |
| PHP hooks | 100 | All kept, unchanged (ADR-004 §1) |

## 3. Target file tree

```
package.json                  # single, no "type": "module", no workspaces
webpack.config.js             # extends @wordpress/scripts (CommonJS)
webpack-entries.js
webpack-dependency-mapping.js
postcss.config.js             # { plugins: { '@tailwindcss/postcss': {} } }
tsconfig.json
types/
  globals.d.ts                # window.spsgAdmin, window.storegrowth
  externals.d.ts              # @storegrowth/* modules
  styles.d.ts                 # *.css
src/
  admin/index.tsx             # entry: shell + router + pages
  admin/pages/{dashboard,modules,settings}/
  components/index.ts         # entry: shared components (window.storegrowth.components)
  fields/                     # custom schema field variants
  hooks/index.ts              # entry
  utilities/index.ts          # entry
  api/                        # typed apiFetch clients
  stores/settings/index.ts    # entry
  externals/plugin-ui.js      # entry: shim
  base-tailwind.css           # entry
modules/<name>/src/
  admin/index.tsx             # entry → modules/<name>/assets/js/admin.js
  admin/<name>-page.tsx, types.ts, preview/, components/
  storefront/blocks/index.tsx # entry → modules/<name>/assets/js/blocks.js (Order Bump)
integrations/src/<bundle>/index.tsx
build/                        # gitignored, shipped
```

## 4. Build configuration

### 4.1 `package.json`

**Remove:**
- `workspaces`
- `lerna`
- all `watch:*` / `build:*` scoped scripts
- `"type": "module"` (the webpack files are CommonJS, as in dokan-lite)

**Scripts:**
```json
{
  "start": "wp-scripts start --progress",
  "start:hot": "wp-scripts start --progress --hot",
  "build": "wp-scripts build --progress",
  "type-check": "tsc --noEmit",
  "lint:js": "wp-scripts lint-js src modules/*/src integrations/src",
  "lint:css": "wp-scripts lint-style 'src/**/*.css'",
  "format": "wp-scripts format",
  "version": "bash bin/version-replace.sh",
  "makepot": "wp i18n make-pot --domain='storegrowth-sales-booster' --include='build,includes,lib,modules,integrations,templates,storegrowth-sales-booster.php' . …",
  "archiver": "node bin/archiver.mjs",
  "release": "composer i --no-dev -o && npm i && npm run type-check && npm run build && npm run version && npm run makepot && npm run archiver"
}
```
Rename `bin/archiver.js` → `bin/archiver.mjs`, since it uses ESM `import`.

To watch or build a single module, use an env filter instead of workspace scopes: `npm run start -- --env module=bogo`. `webpack-entries.js` then returns only the core entries plus that module.

**Dependencies:**
- **Runtime:** `@wedevs/plugin-ui` (github:getdokan/plugin-ui), `@wordpress/*` (externals, versions from wp-scripts), `react`/`react-dom` ^18 (types only; provided by WP).
- **Dev:** `@wordpress/scripts`, `@wordpress/dependency-extraction-webpack-plugin`, `typescript`, `@types/react@18`, `@types/react-dom@18`, `@types/wordpress__*` as needed, `tailwindcss@^4`, `@tailwindcss/postcss@^4`, `@tailwindcss/forms`, `mini-css-extract-plugin`, `eslint-import-resolver-typescript`, `eslint-plugin-import`.
- **Removed:** `antd`, `@ant-design/*`, `lerna`, and per-module duplicates.

### 4.2 `webpack-entries.js`
```js
const core = {
  tailwind: './src/base-tailwind.css',
  admin: './src/admin/index.tsx',
  notices: './src/admin/notices/index.tsx',
  'plugin-ui': { import: './src/externals/plugin-ui.js', library: { name: [ 'storegrowth', 'pluginUI' ], type: 'window' } },
  components: { import: './src/components/index.ts', library: { name: [ 'storegrowth', 'components' ], type: 'window' } },
  utilities: { import: './src/utilities/index.ts', library: { name: [ 'storegrowth', 'utilities' ], type: 'window' } },
  hooks: { import: './src/hooks/index.ts', library: { name: [ 'storegrowth', 'hooks' ], type: 'window' } },
  'settings-store': { import: './src/stores/settings/index.ts', library: { name: [ 'storegrowth', 'settingsStore' ], type: 'window' } },
};

const modules = {
  'modules/bogo/admin': './modules/bogo/src/index.tsx',
  'modules/countdown-timer/admin': './modules/countdown-timer/src/index.tsx',
  // … one per module
  ...moduleEntry( 'upsell-order-bump', 'blocks', './modules/upsell-order-bump/src/storefront/blocks/index.tsx' ),
};

const integrations = {
  'integrations/bogo-dokan-admin': './integrations/src/bogo-dokan-admin/index.tsx',
  // … 5 bundles, see §7 phase 4
};
```
Export a function that honours `env.module` so single-module watches work.

### 4.3 `webpack.config.js`
Copy dokan-lite's config and change:
- `output.path` = `build/`, `clean: true`, `devtoolNamespace: 'storegrowth'`.
- `resolve.alias`: `@src` → `src/`. Leave `@storegrowth/*` unaliased; they're externals.
- `resolve.extensions`: `.json .js .jsx .ts .tsx`.
- Drop the Vue loader and LESS rule.
- Keep:
  - `MiniCssExtractPlugin` (a module entry's CSS goes next to its JS);
  - image, font and svg asset rules;
  - `DependencyExtractionWebpackPlugin` with the custom mapping;
  - filesystem cache;
  - `watchOptions.ignored` for `modules/*/assets/**`, `assets/**`, `build/**`.
- Externals: `jquery` → `jQuery`, plus WooCommerce globals as in dokan-lite (`@woocommerce/settings`, `@woocommerce/blocks-checkout`, `@woocommerce/price-format`, `@woocommerce/blocks-registry`). The Order Bump checkout block needs these.
- Dev server as in dokan-lite, on a different port (e.g. 8889).

### 4.4 `webpack-dependency-mapping.js`
Copy dokan-lite's file, including its WooCommerce package map, and replace the Dokan rules:

| Request | External | Handle |
|---|---|---|
| `@wedevs/plugin-ui` (bare only) | `[ 'storegrowth', 'pluginUI' ]` | `spsg-plugin-ui` |
| `@storegrowth/components` | `[ 'storegrowth', 'components' ]` | `spsg-components` |
| `@storegrowth/utilities` | `[ 'storegrowth', 'utilities' ]` | `spsg-utilities` |
| `@storegrowth/hooks` | `[ 'storegrowth', 'hooks' ]` | `spsg-hooks` |
| `@storegrowth/stores/<name>` | `[ 'storegrowth', '<name>Store' ]` | `spsg-stores-<name>` |
| `@wordpress/ui` | bundled (`false`) | — |

New helper functions carry `@since SPSG_VERSION`.

### 4.5 `tsconfig.json`
Copy dokan-lite's, and change:
- `paths`: `@src/*` → `./src/*`, `@storegrowth/components` → `./src/components`, `@storegrowth/utilities` → `./src/utilities`, `@storegrowth/hooks` → `./src/hooks`, `@storegrowth/stores/*` → `./src/stores/*`.
- `include`: `src/**/*`, `modules/*/src/**/*`, `integrations/src/**/*`, `types/**/*`.
- `exclude`: `node_modules`, `build`, `vendor`, `lib`, `tests`, `assets`, `modules/*/assets`.

### 4.6 Tailwind
See ADR-003 for the `src/base-tailwind.css` contents. The app root is `<div id="spsg-app" class="spsg-layout">`, and `ThemeProvider` goes inside it.

## 5. PHP changes

### 5.1 `includes/Assets.php`
- Register the shared handles from their `.asset.php` files, as in dokan-lite `Assets.php:745-787`:
  - `spsg-plugin-ui` → `build/plugin-ui.js`
  - `spsg-components`, `spsg-utilities`, `spsg-hooks`, `spsg-stores-settings`
- If an asset file is missing, log an error and skip registration. Don't fatal.
- Register the style `spsg-tailwind` → `build/tailwind.css`, and the `wp-components` style as its dependency.
- `spsg-admin` → `build/admin.js`. Deps come from `admin.asset.php`; style deps are `spsg-tailwind`.
- Localize one object, `spsgAdmin`: `{ restNamespace, restNonce, isPro, currency, modules[], version, urls }`. REST calls go through `apiFetch` with `wp_rest` nonce middleware. `spsg_ajax_nonce` is dropped once no admin ajax remains.
- Replace the three bundles (`settings`, `modules`, `notices`) with `admin` (+ `notices` if it must load on non-StoreGrowth screens).

### 5.2 Module enqueue
Each module's `AdminPage` class (registered from the always-loaded `ServiceProvider`, so the page works right after the module is switched on) loads `modules/<id>/assets/js/admin.js` from its `.asset.php`, on the StoreGrowth admin pages only (see `modules/stock-bar/includes/AdminPage.php`):
```php
$asset = Helper::get_modules_path( "{$id}/assets/js/admin.asset.php" );
if ( file_exists( $asset ) ) {
    $meta = require $asset;
    wp_enqueue_script( "spsg-{$id}-admin", Helper::get_modules_url( "{$id}/assets/js/admin.js" ), $meta['dependencies'], $meta['version'], true );
}
```
Order Bump's block registration switches to `modules/upsell-order-bump/assets/js/blocks.*`.

### 5.3 Admin menu
`includes/Admin/AdminMenu.php`:
- One page mounts `#spsg-app`. The hash routes become the shell routes: `/dashboard`, `/modules`, `/settings`, `/<module-id>`, `/bogo/new`, `/bogo/:id`, `/order-bumps/new`, `/order-bumps/:id`.
- Add the WP `folded` body class on feature routes, since the designs assume a collapsed WP menu.

### 5.4 REST
The full list is in `rest-api.md` (38 routes: existing, changed, new). Minimum for phase 1–2:
- `GET/PATCH /modules`, `POST /modules/batch`
- `GET/POST /settings/<module>`: a schema registry that maps onto the **existing** option names and key spellings, with pro fields included and gated
- `GET /dashboard/overview`

When a module migrates, its ajax handlers become adapters over the same service. They are **never removed** (ADR-004 §2).

### 5.5 Compatibility rules (ADR-004)
- Every PHP hook in `tests/compat/php-hooks-baseline.txt` keeps firing with the same arguments and timing.
- Every public PHP symbol in `compat-contract.md` §2 keeps its signature.
- Admin page slugs `spsg-settings` and `spsg-modules` stay the same, so pro's enqueue check still matches.
- Old REST routes stay (`spsg/v1/order-bumps` included).
- New hooks and routes are additive and carry `@since SPSG_VERSION`.

## 6. Release and repo hygiene

- `.gitignore`: add `build/`. Remove `assets/build/`, `modules/*/assets/build/` and `integrations/assets/build/` after phase 4.
- `.distignore`: add `/src`, `/types`, `/docs`, `tsconfig.json`, `webpack-entries.js`, `webpack-dependency-mapping.js`, `postcss.config.js`. `/modules/**/src/` and `/integrations/**/src/` are already listed. Remove `lerna.json`.
- `bin/archiver.mjs`: mirror the `.distignore` changes in its exclude list.
- `bin/version-replace.sh`: no change; it already covers `.ts`/`.tsx`.
- `phpcs.xml`: exclude `build/`.
- CI: add `npm run type-check` and `npm run lint:js`.
- The old `@wordpress/data` stores (`spsg` ×2, `spsg_bogo`, …) go away with antd. New stores use unique `storegrowth/*` names.
- CI: add the PHP hook-baseline check and the PHPUnit API reflection test (ADR-004 §5).

## 7. Phases

Each phase is shippable. Old bundles stay enqueued for modules not yet migrated.

| Phase | Scope | Exit criteria |
|---|---|---|
| **0. Upstream** | plugin-ui fixes: export `ColorPicker`, `RadioImageCard`, `CombineInput`, … from the root (U1); ability to turn off colour alpha (U4). Nice to have: U2, U3, U7. | New plugin-ui commit pinned in `package.json` |
| **1. Skeleton** | Root build files (§4), remove Lerna, `types/`, Tailwind entry, shared bundles, the `admin` shell (TopBar, feature rail, deactivated-module modal, routing), Dashboard + Modules pages, REST `/modules`. Old module bundles still load for module pages. | `npm run build`, `type-check` and `lint:js` pass. Modules can be toggled from the new UI. Every old module page still works. |
| **2. Pilot: Stock Bar** | Settings registry + `/settings/stock-bar`, shared `LivePreview`, `Accordion`, `SaveBar`, `TemplatePicker`. Stock Bar page in `modules/stock-bar/src`. Delete `modules/stock-bar/assets/src`, its `package.json` and its ajax pair. | Saved values identical to before for every key (migration test). E2E covers save/reset. Storefront unchanged. |
| **3. Settings modules** | Countdown, Sales Notification, Free Shipping, Floating Bar, Quick View, Fly Cart, Direct Checkout, in that order. Build each custom field as it's first needed (§ report 6 table). Sanitize every save (fixes the unsanitized saves). Pro fields go in lite's schema with `pro:true`. | Same as phase 2, per module. The admin UI makes no ajax calls. The ajax actions are still registered, as adapters. Pro 2.2.0 E2E passes. |
| **4. CRUD + integrations** | BOGO and Order Bump lists (DataViews) and editors. Order Bump REST is added under `sales-booster/v1`, and `spsg/v1` is kept permanently. Order Bump block bundle. Dokan integration bundles move to `integrations/src` and the new build; the vendor BOGO screen reuses the new editor. | Lerna, antd and `window.SGSettings` fully removed. `assets/src`, `modules/*/assets/src`, `integrations/assets` deleted. PHP hook baseline check passes. |
| **5. Pro** | New pro version adopts the same build files and dependency mapping (externals to lite globals). It stops using the retired JS filters, uses the new `storegrowth.*` extension points and the PHP schema filter for anything lite's schema doesn't cover, and declares support. Pro 2.2.0 keeps working without an update (ADR-004 §3). | E2E matrix: no pro / pro 2.2.0 / new pro all green. |
| **6. Docs** | Update `CLAUDE.md` (build, layout, "add a module"), the `storegrowth-frontend-dev`, `storegrowth-module-dev` and `sg-test-automation` skills. | — |

## 8. Data compatibility rules

- No option is renamed during the redesign. REST maps onto existing option names and keys, including the misspelled ones (`enble_visibility`, `dispaly_time`, `slected_page_option`, `cupon_code`, `show_cupon`, `enable_qucik_view_icon`).
- Value shapes stay as they are: booleans stay booleans (not wp-kit's `'on'/'off'`), and colours stay 6-digit hex.
- **Stored vs API shape** (enforced by `SettingsService`): the old admin posted form-encoded values and `Helper::sanitize_form_fields` only turned `'true'/'false'` into booleans, so options hold `toggle` → bool and **every other type as a string** (numbers too: `"10"`), colours as hex. The service stores exactly that shape; the REST API returns typed values (`toggle` bool, `number` int/float, the rest string). Storefront and pro code keep casting numbers themselves.
- Where the design changes an option set (Quick View effects/redirect/position, Fly Cart layout, Free Shipping discount type, Order Bump schedule), add a versioned migration through the existing WPKit `MigrationManager` in `includes/Upgrader.php`. Don't translate values at read time.
- Every migrated module gets a characterisation test: save through the old UI, read through the new REST, and the values must match.

## 9. Risks

| Risk | Mitigation |
|---|---|
| plugin-ui U1/U4 not fixed in time | Phase 0 first. Fallback: `ColorPicker` wrapper on `@wordpress/components` in `src/components` |
| Scoped Tailwind misses portal content | plugin-ui re-wraps portals in `.pui-root`; test Dialog/Select/Popover in phase 1 |
| Dokan vendor dashboard CSS clash | Integration bundles use Dokan's layout scope, and `spsg-tailwind` doesn't load there; verify in phase 4 |
| Pro and lite out of sync during rollout | Pro keeps its old bundle until phase 5. Lite keeps the old JS filter slots only for modules not yet migrated. |
| Build output path change breaks enqueue | Missing-asset guard logs an error instead of fataling; E2E smoke-tests every admin page |

## 10. Open questions

1. Is a module-only watch (`--env module=<id>`) needed, or is a full cached watch fast enough?
2. `notices` bundle: keep it separate (it loads on all wp-admin screens), or fold it into `admin`?
3. The product-questions list in report §7 (pro gating, removed/new features) must be answered before phase 3.
