# ADR-002: Source layout — root `src/`, `modules/<name>/src/`

- Status: Accepted
- Date: 2026-09-25
- Related: ADR-001

## Context

Admin source used to live in `assets/src/` (core) and `modules/<name>/assets/src/` (per module), next to storefront JS/CSS (`assets/js`, `assets/css`), images, fonts and build output. dokan-lite keeps TS source in a root `src/`, with `assets/` holding only static files and output.

## Decision

1. **Core admin source goes in root `src/`:**
   ```
   src/
     admin/            # entry: shell, router, pages (dashboard, modules, settings, analytics, onboarding)
     header/           # the top bar bundle
     components/       # StoreGrowth components on plugin-ui; field controls in components/fields/
     hooks/            # shared React hooks (router, modules context, settings, record editor)
     utilities/        # REST clients (api.ts), ajax() helper, admin data, formatters
     wc-analytics/     # the WooCommerce Analytics extension (ADR-012)
     externals/        # plugin-ui shim (ADR-001)
     base-tailwind.css # the single Tailwind entry (ADR-003)
   ```
2. **Module source goes in `modules/<name>/src/`, split by where it runs:**
   ```
   modules/<name>/src/
     admin/            # the module's admin bundle → assets/js/admin.js
       index.tsx       # registers preview / controls (storegrowth.settings.page) and any routes
       types.ts        # this module's settings values
       templates.tsx   # presets, when the module has them
       preview/        # the live preview widget (storefront markup)
       list/, editor/  # module-only UI (e.g. the BOGO offer list and editor)
     storefront/       # storefront source that needs a build
       blocks/         # e.g. Order Bump's checkout block → assets/js/blocks.js
   ```
   - `src/storefront/` is for storefront code that needs a build (TypeScript, blocks). Hand-written storefront JS/CSS stays in `modules/<name>/assets/{js,css,scripts}` and is loaded as-is.
   - `src/` is left out of the release zip, so anything under it must be built into `assets/` to reach a site.
3. **Integration source goes in `integrations/src/<integration>/<bundle>/`** (ADR-011).
4. **Global typings go in `types/`** at the root.
5. **`assets/` and `modules/<name>/assets/` keep static and storefront files:** images, fonts, and the hand-written storefront `js/`/`css/`. No admin source. A module's compiled bundles also land in its `assets/js/` (ADR-001), git-ignored by name.
6. **Build output:** core in `build/`, module bundles in `modules/<name>/assets/js/` (ADR-001). Git-ignored, shipped in the release zip.
7. **Module rule:** a module's `src/` may import `@storegrowth/*` shared libraries, but not another module's `src/`. Anything two modules need goes into `src/components` (or `src/hooks`, `src/utilities`).

7a. **Naming inside every `src/` directory** (root `src/`, `modules/*/src/`, `integrations/src/`, and pro's `src/`): **every directory and file name is lowercase kebab-case.**

   | Kind | File name | What it exports (unchanged casing) |
   |---|---|---|
   | Component | `live-preview.tsx`, `save-bar.tsx` | `LivePreview`, `SaveBar` (PascalCase) |
   | Hook | `use-module-settings.ts`, `use-record-editor.ts` | `useModuleSettings`, `useRecordEditor` |
   | Types | `types.ts`, `settings-schema.ts` | `SettingsSchema` (PascalCase types) |
   | Preview | `preview/stock-bar-widget.tsx` | `StockBarWidget` |
   | Styles | `base-tailwind.css`, `live-preview.css` | — |
   | Directories | `admin/pages/dashboard`, `components/fields` | — |
   | Tests next to source | `save-bar.test.tsx` | — |

   - A component with several files gets a kebab-case folder with an `index.ts(x)` barrel.
   - Module ids are kebab-case and map 1:1 to folder names: `modules/stock-bar/src/admin/` → `modules/stock-bar/assets/js/admin.js`.
   - **Enforced by lint:** `eslint-plugin-check-file` (`check-file/filename-naming-convention`, `check-file/folder-naming-convention`, `KEBAB_CASE`) in `.eslintrc.js`; `npm run lint:js` fails otherwise.
   - **Out of scope:** PHP stays PSR-4 PascalCase (`includes/Settings/SettingsService.php`), because class-to-file autoloading requires it and renaming PHP classes is forbidden (ADR-004). Storefront files in `modules/*/assets/` and `templates/` keep their names (theme and pro paths).

8. **Plugin tree:**
   ```
   storegrowth-sales-booster/
   ├─ storegrowth-sales-booster.php
   ├─ package.json · webpack.config.js · webpack-entries.js · webpack-dependency-mapping.js
   ├─ tsconfig.json · postcss.config.js · composer.json · phpcs.xml
   ├─ types/                         # global and external typings
   ├─ src/                           # core admin app (TS), §1
   ├─ includes/                      # core PHP (namespace StorePulse\StoreGrowth\)
   │  ├─ Admin/                      # AdminMenu, AdminHooks, ModuleAdminPage
   │  ├─ REST/                       # sales-booster/v1 controllers
   │  ├─ Settings/                   # SettingsService and the shared schemas (ADR-007)
   │  ├─ Storefront/                 # StorefrontStyle, StorefrontFonts, StorefrontText, DisplayRules (ADR-005)
   │  ├─ Analytics/ · Attribution/   # ADR-012
   │  ├─ Migrations/ · Upgrader.php  # versioned data migrations
   │  └─ Bootstrap, Assets, Ajax, Helper, Interfaces, Traits, DependencyManagement, …
   ├─ assets/                        # static + storefront only
   │  ├─ css/storefront-base.css     # ADR-005 S9
   │  ├─ js/storefront-core.js       # ADR-005 S9
   │  └─ images/ · fonts/
   ├─ modules/<name>/
   │  ├─ bootstrap.php
   │  ├─ includes/                   # module PHP
   │  │  ├─ <Name>Module.php · AdminPage.php · Providers/ · Ajax.php · EnqueueScript.php · …
   │  │  ├─ Settings/<Name>Settings.php # schema + page: fields, defaults, pro flags, presentation keys
   │  │  └─ REST/                    # record CRUD controllers (BOGO, Order Bump)
   │  ├─ src/                        # admin/ and storefront/ (§2)
   │  ├─ templates/                  # storefront templates (loaded via Helper::get_template)
   │  └─ assets/{css,js,images,fonts} # storefront static files + generated bundles
   ├─ integrations/
   │  ├─ includes/Dokan/             # PHP
   │  └─ src/<integration>/<bundle>/ # integration UI (TS), ADR-011
   ├─ helpers/functions.php
   ├─ lib/                           # mozart-prefixed deps
   ├─ languages/
   ├─ build/                         # generated: core bundles, build/integrations/
   ├─ tests/
   │  ├─ php/                        # PHPUnit
   │  ├─ e2e/                        # Playwright: UI and API
   │  └─ compat/                     # hook baselines, settings round trip, storefront foundation
   └─ docs/                          # ADRs, settings-page how-to, feature plans
   ```
   Pro mirrors the same shape (`src/`, `build/`, `includes/Modules/*`).

## Consequences

- Each module stays self-contained: PHP in `includes/`, templates in `templates/`, admin UI in `src/`, storefront files in `assets/`.
- `.distignore` excludes `/src`, `/modules/**/src/`, `/integrations/**/src/`, `/types` and `/docs`.
- `makepot` scans the built JS (`build/` and the module bundles) for i18n strings, as dokan-lite does.
- Adding a module's admin bundle is an entry in `webpack-entries.js`, never a `package.json`.

## Alternatives considered

| Option | Why rejected |
|---|---|
| Keep `assets/src/` | Mixes source with static and storefront files; differs from dokan-lite |
| All module UI inside root `src/modules/<name>` | Breaks module self-containment; a module's PHP and UI would live far apart |
