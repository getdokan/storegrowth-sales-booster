# Core shell, dashboard, modules page, shared components

> **Design:**
> - Dashboard: https://storegrowth-design.vercel.app/index.html
> - Modules: https://storegrowth-design.vercel.app/modules.html
> - Shell (top bar, feature rail, deactivated modal): any feature page, e.g. https://storegrowth-design.vercel.app/countdown-timer.html
>
> Build it exactly as designed; see the design-fidelity rule in `README.md`.

## 1. Summary
- **Phase:** 1. Every module spec depends on this one.
- **Depends on:** phase 0 plugin-ui fixes (U1 exports, U4 alpha).
- **Size:** L.

## 2. Current state
- **Bundles:**
  - `assets/build/{settings,modules,notices}.js` from `assets/src`: antd, React Router, and two `@wordpress/data` stores both named `spsg`.
- **Menu** (`includes/Admin/AdminMenu.php`): Dashboard, Modules (`spsg-modules`), Settings (`spsg-settings`), Docs, Initial Setup, Upgrade.
- **Transport:**
  - ajax `spsg_admin_ajax` (`get_all_modules`, `update_module_status`) and `spsg_inisetup_flag_update`;
  - REST `sales-booster/v1/settings` (advanced), `/notices/*`, `/migration/*`.
- **JS hooks** (retire): `spsg_routes`, `spsg_dashboard_routes`, `spsg_dashboard_route_components`.
- **PHP hooks** (keep): `spsg_modules`, `spsg_module_activated`, `spsg_module_deactivated`, `storegrowth_module_before_boot`, `storegrowth_module_after_boot`, `storegrowth_before_load`, `storegrowth_loaded`, `storegrowth_pro_is_active`.

## 3. Target design
- **Shell:**
  - plugin TopBar: logo, version pill, What's New, Support, amber Upgrade with crown;
  - 210px feature rail with active tint, dimmed inactive modules and the "is currently deactivated" modal;
  - title card;
  - WP admin menu folded on feature routes.
- **Dashboard** (`index.html`):
  - 4 stat tiles (All Modules, Active, Revenue, Templates);
  - module groups "Raise order value", "Shorten the path", "Create urgency" with status pills;
  - right rail with Pro promo, Support card and links.
- **Modules** (`modules.html`):
  - header card with an "Active All Modules" master switch;
  - 4-column grid of cards (thumbnail, title, description, Docs link, switch).
- **Settings:** the existing advanced setting `remove_data_on_uninstall`. Not in the designs; build it from the same components.

## 4. Build and shared pieces delivered here
| Item | Location | Notes |
|---|---|---|
| Root build files, `types/`, Tailwind entry | root | ADR-001/004 |
| `plugin-ui` shim | `src/externals/plugin-ui.js` | `window.storegrowth.pluginUI` |
| Shell | `src/admin/` | TopBar, `FeatureLayout`, router (`/dashboard`, `/modules`, `/settings`, `/<module>`, `/bogo/new`, `/bogo/:id`, `/order-bumps/new`, `/order-bumps/:id`) |
| Shared components | `src/components/` | Done (1c): `SettingsSplit` (settings + preview columns), `SettingsTabs`, `Accordion`, `SaveBar` (Reset + Save), `LivePreview` (device switch, dark toggle, browser frame, product layout, widget/banner/overlay/footer slots). Later: shop/storefront/checkout preview layouts (with the first module that needs each), `ProLock`, `EmptyState` |
| Settings engine | `src/hooks/use-module-settings.ts` | Done (1c): `useModuleSettings(id)` loads `{schema, values}`, tracks dirty state per key set, saves, resets to defaults, reports field errors, locks pro fields without pro. Local state, no store. **Next (step 2):** field components (`text`, `number` + unit, colour, `select`, switch, checkbox) and the `storegrowth.settings.fieldTypes` registry |
| API client | `src/utilities/api.ts` (REST), `src/utilities/ajax.ts` (legacy ajax, ADR-006) | Typed `apiFetch` wrappers |
| Theme | `src/admin/theme.ts` | `createTheme` (primary `#0875FF`, Inter, radius 8px) |

## 5. Data changes
None. Module state stays in `spsg_active_module_ids`.

## 6. REST
| Route | Status |
|---|---|
| `GET /modules` | new |
| `PATCH /modules/{id}` | new |
| `POST /modules/batch` | new |
| `GET /dashboard/overview` | new |
| `GET/POST /onboarding` | new |
| `GET/POST /settings`, `/notices/*`, `/migration/*` | exists |

`GET /modules` adds `is_pro` and `locked` to today's card data.

## 7. Compatibility
- `ModuleManager` keeps firing `spsg_modules`, `spsg_module_activated` and `spsg_module_deactivated`.
- `PATCH /modules/{id}` goes through the same `BaseModule::activate()` / `deactivate()` as today.
- Ajax `spsg_admin_ajax` and `spsg_inisetup_flag_update` become adapters. `update_module_status` returns an error on an unknown id instead of fataling.
- Page slugs `spsg-settings` and `spsg-modules` stay, because pro enqueues on `storegrowth_page_spsg-settings` / `-modules`. The new SPA mounts on the settings slug; the modules slug redirects into the SPA's `/modules` route, keeping the slug registered.
- `spsgAdmin` stays localized (`ajax_url`, `nonce`, `isPro`) and gains `restNonce`, `modules` and `urls`.
- Retired JS hooks → `storegrowth.admin.routes`.

## 8. Open questions
- Dashboard "Revenue": which orders count (BOGO + bump attributed items via `_spsg_campaign_*` meta)? Which time window?
- "Predefined Templates: 12": what counts as a template?
- Keep Initial Setup (onboarding) in scope? It isn't in the designs.
- Mockup copy bugs:
  - the Floating Bar "Unlock Pro" pill is green;
  - the "Request a feature" description is copied from the Documentation row.

## 9. Tasks and definition of done
- [ ] Remove Lerna, add build files, and pass `build`, `type-check` and `lint:js`.
- [ ] Tailwind scoped build; portal check for Dialog, Select and Popover.
- [ ] Shared bundles registered in `includes/Assets.php`, with a missing-asset guard.
- [ ] Shell, Dashboard, Modules and Settings pages.
- [ ] REST `/modules*`, `/dashboard/overview`, `/onboarding`.
- [ ] CI: PHP hook baseline check and PHPUnit API reflection test.
- [ ] Old module bundles still enqueue for module routes that haven't migrated (router falls back to mounting the old bundle's root).
- **Done when:** a module can be toggled and bulk-toggled from the new UI, every old module page still works, and the E2E smoke test passes on every admin route.
