# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

StoreGrowth (Sales Booster) — a WooCommerce plugin (the free/"lite" build, composer name `dokan/storegrowth-lite`) by Dokan Inc. It bundles sales-conversion features as independently activatable **modules**: BOGO, countdown timer, direct checkout, floating notification bar, fly cart (side cart), progressive discount banner, quick view, sales pop (live notifications), stock bar, upsell/order bump. Requires WooCommerce (the plugin no-ops without it).

PHP namespace root is `StorePulse\StoreGrowth\` (not "Dokan"). Entry point: `storegrowth-sales-booster.php`.

## Build / dev commands

JS is a **Lerna monorepo** built with `@wordpress/scripts` (wp-scripts → webpack). Each module's frontend lives in `modules/<name>/assets/` as its own npm package; the root `assets/` package builds the admin settings UI.

```bash
npm install                 # install root + all workspace deps
npm run start               # lerna run start — watch ALL packages
npm run build               # lerna run build — production build ALL packages

# single module (faster) — see package.json for the full list of scopes:
npm run watch:bogo          # watch one module
npm run build:bogo          # build one module
npm run watch:sales-booster # watch the admin/settings UI (root assets)

npm run makepot             # regenerate languages/storegrowth-sales-booster.pot
npm run version             # replace SPSG_VERSION placeholder with package.json version (bin/version-replace.sh)
npm run archiver            # zip a distributable build (archiver.js, honors .distignore)
npm run release             # composer no-dev + build + version + makepot + archiver (full release artifact)
```

There is **no JS test runner** (`npm test` is a stub that exits 1).

PHP:
```bash
composer install            # dev install — triggers mozart (see below) + dumps autoload
vendor/bin/phpcs            # lint against phpcs.xml (WordPress + WooCommerce-Core + PHPCompatibilityWP)
```

PHP "tests" under `modules/*/tests/` are ad-hoc classes run in a live WP context, **not** a PHPUnit suite — there is no `phpunit.xml`.

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

`Bootstrap::register_hooks()` resolves everything tagged `HookRegistry` and calls `register_hooks()` on each; `register_rest_routes()` resolves everything tagged `WP_REST_Controller` and calls `register_routes()`. **So: to add hooks, implement `Interfaces\HookRegistry`; to add a REST route, extend `WP_REST_Controller`** — registration is automatic once the class is registered in a provider via the `*_with_implements_tags` helpers.

### Module system
Every module follows the same shape under `modules/<name>/`:
- `bootstrap.php` — registers the module's `Providers\ServiceProvider`.
- `includes/<Name>Module.php` — extends `BaseModule` (implements `Interfaces\ModuleSkeleton`). Defines `get_id()`, name/icon/banner/description/category, and `get_bootstrap_service_provider()`.
- `includes/Providers/ServiceProvider.php` — registers the `*Module` class tagged as `ModuleSkeleton`.
- `includes/Providers/BootstrapServiceProvider.php` — registers the module's runtime services (Ajax, EnqueueScript, REST controller, etc.); booted **only when the module is active**.
- `includes/`, `templates/`, `assets/` (own npm package).

Module enable/disable state lives in the single `spsg_active_module_ids` option. `BaseModule::activate()`/`deactivate()` mutate that option and fire `spsg_module_activated`/`spsg_module_deactivated`. `ModuleManager` (in container) lists modules (`spsg_modules` filter), boots active ones on load, and toggles them. A module's `BootstrapServiceProvider` is only added to the container when the module `boot()`s — inactive modules add zero runtime overhead.

To add a module: create the directory following the shape above, add its `require_once .../bootstrap.php` line in `storegrowth-sales-booster.php`, add a PSR-4 entry in `composer.json` autoload, add an `assets/package.json`, and add `watch:`/`build:` scripts to the root `package.json`.

### Other layout
- `includes/Admin/` — `AdminMenu`, `AdminHooks` (admin settings page mounting the React UI).
- `includes/REST/ProductController.php` — extends WC's product controller under namespace `sales-booster/v1` (used by the settings UI to pick products).
- `includes/Tracker.php` — Appsero telemetry.
- `integrations/` — third-party integrations (currently Dokan multivendor: vendor dashboard BOGO, vendor REST controllers). Mirrors the module/provider structure under namespace `StorePulse\StoreGrowth\Integrations\`.
- `helpers/functions.php` — global procedural helpers (composer `files` autoload). `includes/Helper.php` — static asset-URL/utility helpers.
- Frontend admin store: `assets/src/` uses React + Ant Design (`antd`) + `react-router-dom`; module front-ends each have their own `assets/src/`.

### Conventions
- Option/meta/prefix naming uses `spsg_` (and constants `STOREGROWTH_*`); module IDs are lowercase slugs (`bogo`, `fly-cart`, …).
- Singletons use the `Traits\Singleton` trait.
- All user-facing strings use text domain `storegrowth-sales-booster`.
- Extension points are WordPress hooks: `storegrowth_before_load`, `storegrowth_loaded`, `storegrowth_module_before_boot`/`_after_boot`, filter `storegrowth_pro_is_active` (gates pro features).

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

The release pipeline runs `bin/version-replace.sh` (`npm run version`, mirrors dokan-lite's `bin/version-replace.js`), which reads `version` from `package.json` and replaces every `SPSG_VERSION` occurrence across source files (`*.php`/`*.js`/`*.scss`/`*.css`, excluding `node_modules`/`vendor`/`lib`/`build`). So `@since SPSG_VERSION` becomes the real number at release time.

Do **not** edit an existing `@since X.Y.Z` that already has a real number — only new code gets the placeholder. The script does **not** touch the `Version:` header, the `STOREGROWTH_VERSION` constant, or `readme.txt` `Stable tag` — bump those (and `package.json` `version`) by hand when cutting a release.
