# ADR-002: Source layout — root `src/`, `modules/<name>/src/`

- Status: Accepted
- Date: 2026-09-25
- Related: ADR-001, RDR-001

## Context

Today admin source lives in `assets/src/` (core) and `modules/<name>/assets/src/` (per module). Those folders sit next to storefront JS/CSS (`assets/js`, `assets/css`), images, fonts and build output. dokan-lite keeps new TS source in a root `src/`, with `assets/` holding only static files and output.

## Decision

1. **Core admin source goes in root `src/`:**
   ```
   src/
     admin/            # entry: shell, router, pages (dashboard, modules, settings)
     components/       # StoreGrowth components on plugin-ui (report §6)
     fields/           # custom schema field variants (product search, date, box model, …)
     hooks/            # shared React hooks
     utilities/        # helpers, formatters
     api/              # typed apiFetch clients (settings, modules, bogo, order-bumps)
     stores/           # @wordpress/data stores, one per resource
     externals/        # plugin-ui shim (ADR-001)
     base-tailwind.css # the single Tailwind entry (ADR-003)
   ```
2. **Module source goes in `modules/<name>/src/`, split by where it runs:**
   ```
   modules/<name>/src/
     admin/            # the admin settings page → assets/js/admin.js
       index.tsx       # registers the module page with the shell
       <name>-page.tsx # the page
       types.ts        # this module's settings values and tab keys
       templates.tsx   # presets, when the module has them
       preview/        # the LivePreview widget (storefront markup)
       components/     # module-only UI (e.g. BOGO / Order Bump list + editor)
     storefront/       # new storefront source, built by webpack
       blocks/         # e.g. Order Bump's checkout block → assets/js/blocks.js
   ```
   - `src/storefront/` is for **new** storefront code that needs a build (TypeScript, blocks). The existing hand-written storefront JS/CSS stays in `modules/<name>/assets/{js,css,scripts}` and is loaded as-is; it isn't moved.
   - `src/` is left out of the release zip, so anything under it must be built into `assets/` to reach a site.
3. **Dokan integration source goes in `integrations/src/`.**
4. **Global typings go in `types/`** at the root.
5. **`assets/` and `modules/<name>/assets/` keep static and storefront files:** images, fonts, and the hand-written storefront `js/`/`css/`. No admin source. A module's compiled bundles also land in its `assets/js/` (ADR-001), git-ignored by name.
6. **Build output:** core in `build/`, module bundles in `modules/<name>/assets/js/` (ADR-001). Git-ignored, shipped in the release zip.
7. **Module rule:** a module's `src/` may import `@storegrowth/*` shared libraries, but not another module's `src/`. Anything two modules need goes into `src/components` or `src/fields`.

7a. **Naming inside every `src/` directory** (root `src/`, `modules/*/src/`, `integrations/src/`, and pro's `src/` and `legacy/src/`): **every directory and file name is lowercase kebab-case.**

   | Kind | File name | What it exports (unchanged casing) |
   |---|---|---|
   | Component | `live-preview.tsx`, `save-bar.tsx`, `product-search.tsx` | `LivePreview`, `SaveBar`, `ProductSearch` (PascalCase) |
   | Hook | `use-settings.ts`, `use-module-status.ts` | `useSettings`, `useModuleStatus` |
   | Store | `stores/settings/index.ts`, `stores/settings/selectors.ts` | — |
   | Types | `settings-schema.ts`, `module.ts` | `SettingsSchema`, `Module` (PascalCase types) |
   | Preview | `preview/stock-bar-widget.tsx` | `StockBarWidget` |
   | Styles | `base-tailwind.css`, `live-preview.css` | — |
   | Directories | `admin/pages/dashboard`, `fields/box-model-input`, `components/save-bar` | — |
   | Tests next to source | `save-bar.test.tsx` | — |

   - A component with several files gets a kebab-case folder with an `index.ts(x)` barrel: `components/live-preview/index.tsx`, `components/live-preview/device-switch.tsx`.
   - Module ids already are kebab-case and map 1:1 to folder names: `modules/stock-bar/src/admin/` → `modules/stock-bar/assets/js/admin.js`.
   - **Enforced by lint:** add `eslint-plugin-check-file` to the wp-scripts ESLint config with `check-file/filename-naming-convention` and `check-file/folder-naming-convention` set to `KEBAB_CASE` for `src/**`, `modules/*/src/**`, `integrations/src/**`. `npm run lint:js` fails otherwise.
   - `legacy/src/` in pro is renamed to kebab-case in the same PR that moves it (e.g. `Modules/BoGo/index.js` → `modules/bogo/index.js`). The build output is unchanged.
   - **Out of scope:** PHP stays PSR-4 PascalCase (`includes/Settings/SettingsService.php`), because class-to-file autoloading requires it and renaming PHP classes is forbidden (ADR-004). Existing storefront files in `modules/*/assets/` and `templates/` keep their names (theme and pro paths).

8. **Full plugin tree** (admin TS, PHP, storefront and tests; PHP keeps the existing PSR-4 layout and adds folders):
   ```
   storegrowth-sales-booster/
   ├─ storegrowth-sales-booster.php
   ├─ package.json · webpack.config.js · webpack-entries.js · webpack-dependency-mapping.js
   ├─ tsconfig.json · postcss.config.js · composer.json · phpcs.xml
   ├─ types/                         # globals.d.ts, externals.d.ts (@storegrowth/*), styles.d.ts
   ├─ src/                           # core admin app (TS) — ADR-002 §1
   │  ├─ admin/                      # shell, router, pages/{dashboard,modules,settings}
   │  ├─ components/                 # LivePreview, Accordion, SaveBar, ProLock, EditorLayout, …
   │  ├─ fields/                     # ProductSearch, DateRange, BoxModelInput, TemplatePicker, TypographyRow, …
   │  ├─ hooks/ · utilities/ · api/ · stores/
   │  ├─ externals/plugin-ui.js
   │  └─ base-tailwind.css
   ├─ includes/                      # core PHP (namespace StorePulse\StoreGrowth\)
   │  ├─ Admin/                      # AdminMenu (slugs spsg-settings / spsg-modules kept)
   │  ├─ REST/                       # existing Settings/Product controllers + new Modules, ModuleSettings, Dashboard, Onboarding, Lookups
   │  ├─ Settings/                   # NEW: SettingsRegistry, SettingsService (merge, sanitize, pro gating), Schema field types
   │  ├─ Storefront/                 # NEW (ADR-005): StorefrontStyle, StorefrontFonts, StorefrontText, DisplayRules
   │  ├─ Helper.php                  # + get_template() (ADR-005 S8); existing methods frozen
   │  └─ …                           # existing Bootstrap, Assets, Ajax, Upgrader, Traits, Interfaces unchanged
   ├─ assets/                        # static + storefront only
   │  ├─ css/storefront-base.css     # NEW (ADR-005 S9)
   │  ├─ js/storefront-core.js       # NEW (ADR-005 S9)
   │  └─ images/ · fonts/
   ├─ modules/<name>/
   │  ├─ bootstrap.php
   │  ├─ includes/                   # module PHP (existing classes kept)
   │  │  ├─ <Name>Module.php · Providers/ · Ajax.php (→ adapters) · EnqueueScript.php · CommonHooks.php
   │  │  ├─ Settings/<Name>Schema.php   # NEW: field definitions, defaults, sanitizers, pro flags
   │  │  ├─ Settings/<Name>TokenMap.php # NEW: option key → CSS token (ADR-005 S2)
   │  │  └─ REST/                    # module CRUD controllers (BOGO; Order Bump's RestApi/ stays, new controllers go in REST/)
   │  ├─ src/                        # admin/ (settings page) and storefront/ (new built storefront code, e.g. blocks/)
   │  ├─ templates/                  # storefront templates (paths unchanged; loaded via Helper::get_template)
   │  └─ assets/{css,js,images,fonts} # storefront static files (unchanged location)
   ├─ integrations/
   │  ├─ includes/Dokan/             # PHP (unchanged)
   │  └─ src/<bundle>/               # Dokan admin/vendor UI (TS), replaces integrations/assets
   ├─ helpers/functions.php
   ├─ lib/                           # mozart-prefixed deps (league/container, appsero, wp-kit)
   ├─ languages/
   ├─ build/                         # generated: core bundles, build/integrations/ (module bundles go to modules/<name>/assets/js/)
   ├─ tests/
   │  ├─ php/                        # PHPUnit: settings service, REST, compat API reflection test
   │  ├─ e2e/                        # Playwright: modules, visual QA, compat matrix, storefront snapshots
   │  └─ compat/                     # hook baselines + pro 2.2.0 option fixtures
   └─ docs/redesign/                 # this documentation
   ```
   Pro mirrors the same shape (`src/`, `legacy/src/`, `build/`, `build/legacy/`, `includes/Modules/*`), see `../redesign/pro-migration-spec.md` §7.

## Consequences

- Each module stays self-contained: PHP in `includes/`, templates in `templates/`, admin UI in `src/`, storefront files in `assets/`.
- `.distignore` excludes `/src`, `/modules/**/src/` (already there), `/integrations/**/src/` (already there), `/types` and `/docs`.
- `makepot --include` switches from `assets/src` to `build`, so it scans the built JS for i18n strings, as dokan-lite does with `assets/js`.
- `CLAUDE.md` "To add a module" steps change: no `assets/package.json`, add an entry in `webpack-entries.js` instead.

## Alternatives considered

| Option | Why rejected |
|---|---|
| Keep `assets/src/` | Mixes source with static and storefront files; differs from dokan-lite |
| All module UI inside root `src/modules/<name>` | Breaks module self-containment; a module's PHP and UI would live far apart |
