---
name: storegrowth-module-dev
description: Scaffold or modify a StoreGrowth (Sales Booster) feature module — the activatable units under modules/ (BOGO, fly-cart, etc.). Use when adding a new module or changing a module's registration, activation, providers, or assets.
---

# StoreGrowth Module Development

StoreGrowth's defining architecture is its **module system**: each sales feature is an independently activatable module under `modules/{slug}/`. Read `storegrowth-backend-dev` for DI/hook details and `storegrowth-frontend-dev` for the admin UI before adding a module.

## How modules load

- Module enable/disable state is a single option: `spsg_active_module_ids` (array of module IDs).
- `ModuleManager` (in the container) lists all modules (filter `spsg_modules`), boots active ones on `woocommerce_loaded`, and toggles them.
- `BaseModule::activate()` / `deactivate()` mutate `spsg_active_module_ids` and fire `spsg_module_activated` / `spsg_module_deactivated`.
- A module's runtime services (its `BootstrapServiceProvider`) are added to the container **only when the module boots** — inactive modules add zero overhead.

## Required structure

```
modules/{slug}/
├── bootstrap.php                              # registers Providers\ServiceProvider
├── includes/
│   ├── {Name}Module.php                       # extends BaseModule
│   ├── Providers/ServiceProvider.php          # registers the *Module (tagged ModuleSkeleton)
│   ├── Providers/BootstrapServiceProvider.php # registers runtime services (booted when active)
│   ├── EnqueueScript.php                      # implements HookRegistry (assets)
│   └── REST/{Name}Controller.php              # optional, extends WP_REST_Controller
├── templates/                                 # optional PHP view partials
└── assets/
    ├── package.json                           # own npm package (sales-booster-{slug})
    └── src/settings.js                        # admin UI entry (store + spsg_routes)
```

## Step-by-step

### 1. Module class — extend `BaseModule`

```php
namespace StorePulse\StoreGrowth\Modules\MyFeature;

use StorePulse\StoreGrowth\BaseModule;
use StorePulse\StoreGrowth\Modules\MyFeature\Providers\BootstrapServiceProvider;
use StorePulse\StoreGrowth\Helper as PluginHelper;

class MyFeatureModule extends BaseModule {
    public static function get_id(): string { return 'my-feature'; }      // lowercase slug
    public function get_name(): string { return __( 'My Feature', 'storegrowth-sales-booster' ); }
    public function get_description(): string { return __( '…', 'storegrowth-sales-booster' ); }
    public function get_module_category(): string { return __( 'Upsell', 'storegrowth-sales-booster' ); }
    public function get_icon(): string { return PluginHelper::get_modules_url( 'my-feature/assets/images/icon.svg' ); }
    public function get_banner(): string { return PluginHelper::get_modules_url( 'my-feature/assets/images/banner.png' ); }

    protected function get_bootstrap_service_provider(): BootstrapServiceProvider {
        return new BootstrapServiceProvider();
    }
}
```

`BaseModule` provides `is_active()`, `activate()`, `deactivate()`, `boot()`, `get_doc_link()`. Override `activate()` only for one-time setup (e.g. a data migration) and call `parent::activate()` — see `modules/bogo/includes/BoGoModule.php`.

### 2. ServiceProvider — register the module (always loaded)

```php
namespace StorePulse\StoreGrowth\Modules\MyFeature\Providers;

use StorePulse\StoreGrowth\DependencyManagement\BaseServiceProvider;
use StorePulse\StoreGrowth\Modules\MyFeature\MyFeatureModule;

class ServiceProvider extends BaseServiceProvider {
    protected $services = [ MyFeatureModule::class ];
    public function boot(): void {}
    public function register(): void {
        $this->add_with_implements_tags( MyFeatureModule::get_id(), MyFeatureModule::class, true );
    }
}
```

Tagging it `ModuleSkeleton` (done automatically by `add_with_implements_tags`) is what makes `ModuleManager` discover it.

### 3. BootstrapServiceProvider — runtime services (booted when active)

```php
namespace StorePulse\StoreGrowth\Modules\MyFeature\Providers;

use StorePulse\StoreGrowth\DependencyManagement\BootableServiceProvider;
use StorePulse\StoreGrowth\Modules\MyFeature\EnqueueScript;
use StorePulse\StoreGrowth\Modules\MyFeature\REST\MyFeatureController;

class BootstrapServiceProvider extends BootableServiceProvider {
    protected $services = [ EnqueueScript::class, MyFeatureController::class ];
    public function boot(): void {
        foreach ( $this->services as $service ) {
            $this->share_with_implements_tags( $service );
        }
    }
    public function register(): void {}
}
```

`HookRegistry` services auto-run `register_hooks()`; `WP_REST_Controller` services auto-run `register_routes()`.

### 4. bootstrap.php

```php
<?php
use StorePulse\StoreGrowth\Modules\MyFeature\Providers\ServiceProvider;
storegrowth_get_container()->addServiceProvider( new ServiceProvider() );
```

### 5. Wire it into the plugin

- **`storegrowth-sales-booster.php`** — add `require_once STOREGROWTH_MODULE_DIR . '/my-feature/bootstrap.php';` alongside the other module includes.
- **`composer.json`** autoload PSR-4 — add `"StorePulse\\StoreGrowth\\Modules\\MyFeature\\": "modules/my-feature/includes"`, then run `composer dump-autoload`.
- **`package.json`** — add `watch:my-feature` and `build:my-feature` scripts (scope = the `name` in the module's `assets/package.json`, e.g. `sales-booster-my-feature`). `lerna.json` already globs `modules/*/assets`.

### 6. Admin UI (optional)

In `modules/my-feature/assets/src/settings.js`, register the module's `@wordpress/data` store and push routes via `addFilter('spsg_routes', 'spsg', ...)`. See `storegrowth-frontend-dev`.

## Checklist

- [ ] `get_id()` is a unique lowercase slug matching the directory name
- [ ] All five PHP pieces present (Module, both Providers, bootstrap.php, runtime services)
- [ ] `require_once` added in `storegrowth-sales-booster.php`
- [ ] PSR-4 autoload entry added + `composer dump-autoload` run
- [ ] `watch:`/`build:` scripts added to root `package.json`
- [ ] Runtime services implement `HookRegistry` (hooks) / extend `WP_REST_Controller` (routes)
- [ ] New code uses `@since SPSG_VERSION` and text domain `storegrowth-sales-booster`

## Reference module

`modules/bogo/` is the most complete example (Module, Providers, REST, Ajax, EnqueueScript, templates, migration, assets).
