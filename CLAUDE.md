# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

StoreGrowth (Sales Booster) — a WooCommerce plugin (the free/"lite" build, composer name `dokan/storegrowth-lite`) by Dokan Inc. It bundles sales-conversion features as independently activatable **modules**: BOGO, countdown timer, direct checkout, floating notification bar, fly cart (side cart), progressive discount banner, quick view, sales pop (live notifications), stock bar, upsell/order bump. Requires WooCommerce (the plugin no-ops without it). A separate **pro** plugin (`storegrowth-sales-booster-pro`) extends it.

PHP namespace root is `StorePulse\StoreGrowth\` (not "Dokan"). Entry point: `storegrowth-sales-booster.php`.

The admin is being redesigned module by module (TypeScript, REST, plugin-ui). Plan and progress: `docs/redesign/` (start at `README.md`; execution order in `docs/redesign/modules/README.md`).

## Decision records — read before changing the system

Core system ADRs, `docs/adr/` (apply to all code):

| ADR | Rule |
|---|---|
| ADR-001 | One webpack build following dokan-lite; no monorepo; shared bundles as `window.storegrowth.*` globals |
| ADR-002 | Source in root `src/` and `modules/<id>/src/`; every file/dir inside a `src/` is kebab-case |
| ADR-003 | Tailwind v4, one stylesheet scoped to `.spsg-layout`; never on the storefront |
| ADR-004 | **Backward compatibility:** never rename/remove a PHP hook, public PHP API, option name/key/value shape, admin slug, ajax action or REST route; pro 2.2.0 must keep working when only lite updates; **existing user settings are never lost** |
| ADR-005 | One storefront standard: settings → CSS variables, text tokens, display rules, font loader, template loader, shared base CSS/JS |
| ADR-006 | REST first; the admin calls an existing ajax action only through the `ajax()` helper |

Redesign-only records live in `docs/redesign/adr/` (`RDR-001`: TypeScript-first full rewrite). A new core decision takes the next `ADR-###`, a redesign-only one the next `RDR-###`; numbers are never reused.

## Build / dev commands

One `@wordpress/scripts` webpack build (ADR-001): `webpack.config.js` + `webpack-entries.js` (every entry listed by hand) + `webpack-dependency-mapping.js` (`@storegrowth/*` and `@wedevs/plugin-ui` are externals). Core output goes to `build/` (git-ignored); each module's bundles go to `modules/<id>/assets/js/` next to its hand-written storefront scripts, with only the generated names (`admin.js`, `*.asset.php`, `*.js.map`) git-ignored.

```bash
npm install
npm run start          # watch + rebuild (restart it after adding an entry to webpack-entries.js)
npm run build          # production build
npm run type-check     # tsc --noEmit
npm run lint:js        # src, modules/*/src, integrations/src
npm run check:hooks    # every hook in tests/compat/php-hooks-baseline.txt still fires
npm run makepot        # regenerate languages/storegrowth-sales-booster.pot
npm run version        # replace SPSG_VERSION placeholders (bin/version-replace.sh)
npm run archiver       # zip a distributable build (bin/archiver.mjs)
npm run release        # composer no-dev + type-check + build + version + makepot + archiver
```

While a dev server (`npm run start`) is running, don't run `npm run build`; reload the site instead.

Checks against a live site (run from the plugin folder; WP-CLI finds the WordPress root):

```bash
wp eval-file tests/compat/settings-roundtrip.php     # saving settings never loses or alters stored data
wp eval-file tests/compat/storefront-foundation.php  # storefront helpers (ADR-005)
```

PHP:
```bash
composer install       # dev install — triggers mozart (see below) + dumps autoload
vendor/bin/phpcs       # WordPress + WooCommerce-Core + PHPCompatibilityWP (phpcs.xml)
npm run phpunit        # PHPUnit (phpunit.xml, tests/php); `npm run phpunit:env` inside wp-env
```

Lint and format read-only (`lint-js` without `--fix`); fix reports by editing the file.

## Mozart dependency prefixing — important

Composer's `require-dev` packages (`league/container`, `appsero/client`, `appsero/updater`) are **prefixed by [mozart](https://github.com/coenjacobs/mozart)** into `StorePulse\StoreGrowth\ThirdParty\Packages\` and copied to `lib/packages/`. This runs automatically on `composer install`/`update` **only in dev mode** (`COMPOSER_DEV_MODE`). Consequences:

- Import the league container as `StorePulse\StoreGrowth\ThirdParty\Packages\League\Container\...`, never `League\Container\...`.
- `lib/` is committed and ships in the release; don't hand-edit it — regenerate via composer.
- `lib/` and `assets/` are excluded from phpcs.

## Architecture

### Bootstrap flow
`storegrowth-sales-booster.php` creates a global DI `Container`, registers the root `ServiceProvider`, then `require`s every module's `modules/<name>/bootstrap.php` and `integrations/bootstrap.php`. Each bootstrap file registers that module's `Providers\ServiceProvider` with the container. Finally `sp_store_growth()` boots `Bootstrap` (singleton), which waits for `woocommerce_loaded` before loading modules, assets, ajax, admin, hooks, and integrations.

Access the container anywhere via `storegrowth_get_container()`. `Bootstrap` also has a magic `__get` that resolves container entries.

### Dependency injection (league/container)
Service providers extend one of:
- `BaseServiceProvider` — registers services; key helpers `add_with_implements_tags()` / `share_with_implements_tags()` register a class **tagged by every interface and abstract parent it has**. This is how the container can later resolve "all modules" or "all REST controllers" by interface.
- `BootableServiceProvider` — same plus a `boot()` that runs immediately.

`Bootstrap::register_hooks()` resolves everything tagged `HookRegistry` and calls `register_hooks()` on each; `register_rest_routes()` resolves everything tagged `WP_REST_Controller` and calls `register_routes()`. **So: to add hooks, implement `Interfaces\HookRegistry`; to add a REST route, extend `WP_REST_Controller`** — registration is automatic once the class is registered in a provider via the `*_with_implements_tags` helpers. Shared services (REST controllers, settings, storefront fonts) are listed in `includes/DependencyManagement/Providers/CommonServiceProvider.php`.

### Module system
Every module follows the same shape under `modules/<id>/`:
- `bootstrap.php` — registers the module's `Providers\ServiceProvider`.
- `includes/<Name>Module.php` — extends `BaseModule` (implements `Interfaces\ModuleSkeleton`).
- `includes/Providers/ServiceProvider.php` — always loaded: registers the `*Module` class and the module's settings schema (`Settings\<Name>Settings`, implements `Interfaces\SettingsSchema`).
- `includes/Providers/BootstrapServiceProvider.php` — runtime services (Ajax, EnqueueScript, REST, …); booted **only when the module is active**.
- `includes/`, `templates/`, `assets/` (storefront CSS/JS, images), `src/` (admin page, TypeScript).

Module enable/disable state lives in the single `spsg_active_module_ids` option. `BaseModule::activate()`/`deactivate()` mutate that option and fire `spsg_module_activated`/`spsg_module_deactivated`. `ModuleManager` lists modules (`spsg_modules` filter), boots active ones on load, and toggles them.

To add a module: create the directory, add its `require_once .../bootstrap.php` line in `storegrowth-sales-booster.php`, add a PSR-4 entry in `composer.json`, and (for an admin page) add `moduleEntry( '<id>', 'admin', './modules/<id>/src/admin/index.tsx' )` to `webpack-entries.js` and enqueue `modules/<id>/assets/js/admin.js` from an always-loaded `AdminPage` class (see `modules/stock-bar/includes/AdminPage.php`).

### Admin app (redesigned)
- `src/admin/` — the app shell: react-router `HashRouter`, route table in `routes.tsx` extended through the JS filter `storegrowth.admin.routes`; pages `dashboard`, `modules`, `settings`, `onboarding` (`#/ini-setup`), and a generic feature page for modules without their own. `src/header/` — the top bar bundle.
- Shared bundles: `src/components` (`@storegrowth/components`: feature layout, settings split, tabs, accordion, save bar, live preview, template picker, field controls in `fields/`), `src/hooks` (`@storegrowth/hooks`: router, `ModulesProvider`/`useModules`, `useModuleSettings`), `src/utilities` (`@storegrowth/utilities`: REST clients in `api.ts`, `ajax()` helper, admin data). UI is built on plugin-ui (`@wedevs/plugin-ui`); icons are lucide-react.
- A module's admin page lives in `modules/<id>/src/admin/` and registers its route from its own bundle (see `modules/stock-bar/src/admin/index.tsx`). New storefront code that needs a build (TypeScript, blocks) goes in `modules/<id>/src/storefront/` and is built into `assets/js/`; existing hand-written storefront JS/CSS stays in `modules/<id>/assets/`.
- No global data store: local React state and context.
- Mounted on the `spsg-settings` / `spsg-modules` admin pages (`includes/Admin/AdminMenu.php`, `includes/Assets.php`).

### Settings engine
- Each module declares its settings in a `SettingsSchema` (option name + existing keys with type, default, pro flag, limits).
- `Settings\SettingsService` reads and saves them; REST `GET/POST sales-booster/v1/settings/{module}` (`REST\ModuleSettingsController`) and the legacy ajax save handlers both go through it.
- Saves **merge** into the stored option, write only changed keys, ignore pro keys without pro, and save nothing when a value is invalid. Stored values keep the old admin's shape (toggle → bool, everything else → string); the API returns typed values. Details: `docs/redesign/migration-spec.md` §8, ADR-004.

### Storefront (ADR-005)
- `includes/Storefront/`: `StorefrontStyle` (settings → `--spsg-<module>-*` CSS variables), `StorefrontText` (`{token}` / `[token]`), `DisplayRules` (bars and popups), `StorefrontFonts` (bundled fonts first, one Google request for the rest).
- `Helper::get_template()` (theme overrides at `storegrowth/<module>/<file>`), `Helper::sanitize_css_color()` / `sanitize_css_keyword()`.
- Shared base: `assets/css/storefront-base.css` (z-index scale), `assets/js/storefront-core.js` (`window.spsgStorefront`); registered, loaded by modules that use them. Plain CSS/JS, no Tailwind or React on the storefront.

### Other layout
- `includes/Admin/` — `AdminMenu`, `AdminHooks`.
- `includes/REST/` — `sales-booster/v1` controllers (modules, dashboard, global settings, module settings, products).
- `includes/Tracker.php` — Appsero telemetry.
- `integrations/` — third-party integrations (Dokan multivendor), mirroring the module/provider structure under `StorePulse\StoreGrowth\Integrations\`.
- `helpers/functions.php` — global procedural helpers. `includes/Helper.php` — static helpers.
- Legacy, being removed module by module: the antd admin in `assets/src/` and `modules/*/assets/src/`.

### Conventions
- Option/meta/prefix naming uses `spsg_` (and constants `STOREGROWTH_*`); module IDs are lowercase slugs (`bogo`, `fly-cart`, …). New feature hooks use `spsg_`; lifecycle hooks `storegrowth_`.
- **New hooks** go in `tests/compat/php-hooks-baseline.txt` (sorted); `npm run check:hooks` fails when one stops firing.
- **Option autoload:** pass `false` to `add_option()` / `update_option()` for any option that isn't read on most front-end requests (admin-only flags, versions, backups, one-shot state). Leave it out (WordPress's default `auto`) only for options the storefront or every request reads: `spsg_active_module_ids` and the module settings options.
- TypeScript/CSS: 4-space indentation, kebab-case file names inside `src/`. PHP: WordPress coding standards (tabs), PSR-4 PascalCase class files.
- **Keep code simple:** reuse plugin-ui and `src/components` before building a control; no unnecessary abstraction, state or CSS tricks.
- Singletons use the `Traits\Singleton` trait.
- All user-facing strings use text domain `storegrowth-sales-booster`.
- Extension points are WordPress hooks: `storegrowth_before_load`, `storegrowth_loaded`, `storegrowth_module_before_boot`/`_after_boot`, filter `storegrowth_pro_is_active` (gates pro features).
- **HPOS (High-Performance Order Storage):** both plugins declare `custom_order_tables` compatibility on `before_woocommerce_init`. This is only honest while the plugin reads orders through `wc_get_orders()` and stores order / order-item data through the WooCommerce CRUD API (`$order->update_meta_data()` / `$order->save()`), **never** `update_post_meta()` on an order ID. Any new code that writes order data must use the CRUD API or the HPOS declaration must be revisited.

### Review agents
`.claude/agents/`: `sg-architect` (architecture, backward compatibility, simplicity), `sg-qa` (behaviour on a live site, with and without pro), `sg-designer` (page vs its design reference and the design system). Run them on a finished step before committing, and when planning a module.

### Version placeholder — REQUIRED when writing code
When adding any new symbol, **always** tag it with the literal placeholder `SPSG_VERSION` in its `@since` (and `@deprecated`) docblock tag — never hardcode a version number. This applies to new functions, classes, methods, properties, parameters, hooks (`do_action`/`apply_filters`), and REST routes. Example:

```php
/**
 * Do the thing.
 *
 * @since SPSG_VERSION
 *
 * @param int $id Thing id.
 *
 * @return bool
 */
```

The release pipeline runs `bin/version-replace.sh` (`npm run version`, mirrors dokan-lite's `bin/version-replace.js`), which reads `version` from `package.json` and replaces every `SPSG_VERSION` occurrence across source files (`*.php`/`*.js`/`*.ts`/`*.tsx`/`*.scss`/`*.css`, excluding `node_modules`/`vendor`/`lib`/`build`). So `@since SPSG_VERSION` becomes the real number at release time.

Do **not** edit an existing `@since X.Y.Z` that already has a real number — only new code gets the placeholder. The script does **not** touch the `Version:` header, the `STOREGROWTH_VERSION` constant, or `readme.txt` `Stable tag` — bump those (and `package.json` `version`) by hand when cutting a release.
