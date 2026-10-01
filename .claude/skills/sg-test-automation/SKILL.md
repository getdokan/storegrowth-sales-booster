---
name: sg-test-automation
description: Write, run, and extend the StoreGrowth (Sales Booster) Playwright E2E + API test suite in tests/e2e. Use when adding or modifying browser/UI tests, REST/API tests, fixtures, helpers, or test data; debugging failing tests; setting up the wp-env test environment; or wiring CI. Read before touching anything under tests/e2e.
---

# StoreGrowth Test Automation

The end-to-end + API test suite for the StoreGrowth Sales Booster WooCommerce plugin. Built with **Playwright + TypeScript**, living entirely in `tests/e2e/` (self-contained — it does **not** touch the plugin's wp-scripts deps). For what the plugin *does* (modules, REST routes, ajax, storefront selectors) see `reference/surface-map.md` — the testable-surface map you assert against. For backend/frontend dev conventions see the sibling skills `storegrowth-backend-dev` / `storegrowth-frontend-dev`.

## Design contract — keep it this way

- **No Page Object Model.** Reusable **fixtures** + small **helper functions** + stable **data** only. POM adds indirection without payoff here. Do not introduce page-object classes.
- **Two Playwright projects, one config** (`playwright.config.ts`): `ui` (browser/E2E) and `api` (browserless REST). A `setup` project logs in once and persists the session so no UI test pays the login cost.
- **Layout** (all under `tests/e2e/`):
  - `fixtures/test.ts` — the custom `test`/`expect` and the `api` fixture. **Every spec imports `{ test, expect }` from here, never from `@playwright/test` directly.**
  - `helpers/` — `env.ts` (the *only* place that reads `process.env`), `wp-admin.ts` (`login`, `gotoAdminPage`), `modules.ts` (the app page: `gotoDashboard`, `gotoModules`, `gotoAppRoute`, `moduleToggle`, `setModuleState`), `settings-ui.ts` (generated settings pages: `gotoSettings`, `openTab`, `settingsField`, `setField`, `saveSettings`, `resetSettings`), `rest.ts` (REST state: `setModuleStatus`, `getModuleSettings`, `saveModuleSettings`, `resetModuleSettings`, `hasPro`, `productIdBySlug`), `records.ts` (BOGO offers / order bumps over REST with valid payloads), `record-ui.ts` (record lists and editors: rows, row actions, delete dialog, `pickProduct`, `saveRecord`), `wp-cli.ts` (raw option reads/writes in the stack), `storefront.ts`, `cart.ts`, `wc.ts`, `tax.ts`.
  - `data/` — stable ids/names (`data/modules.ts`, `data/products.ts`: seeded products 11/12/13, checked by provisioning).
  - `tests/auth.setup.ts` — authenticates once → writes `.auth/admin-<port>.json` (logs in again when the cached session is stale).
  - `ISSUES.md` — plugin behaviours and bugs found by the suite; specs cite them as `ISSUES #n`.
  - `tests/ui/*.spec.ts` — browser tests (reuse admin session).
  - `tests/api/*.api.spec.ts` — REST tests (App Password / HTTP Basic).

## Running the suite

From `tests/e2e/` (Node 20+):

```bash
bash bin/setup-docker.sh          # Docker stack on :8888, writes .env (never overwrites one)
npm install
npm run install:browsers          # playwright install --with-deps chromium

npm test                          # everything (setup → ui → api)
npm run test:ui                   # UI/E2E only
npm run test:api                  # API only
npm run test:headed               # UI, headed browser
npm run test:debug                # PWDEBUG inspector
npm run codegen                   # record selectors against the live site
npm run report                    # open last HTML report
```

Single test while iterating: `npx playwright test tests/ui/modules.spec.ts -g "can be activated"`.

## Test environment (Docker stack)

`docker-compose.yml` + `bin/setup-docker.sh` provision WordPress + WooCommerce + Storefront + this plugin (bind-mounted working tree) via the shared `bin/provision-site.php` (also used by CI's wp-env). The plugin's built assets come from the working tree: run `npm run start` (or a build) in the plugin root first; a stale `build/` / `modules/*/assets/js/admin.js` means stale UI in the tests.

- **Lite by default:** pro is not active, so `has_pro()` is honestly false. Pro stack: set `PRO_DIR=… LICENSE_KEY=…` for setup (adds `docker-compose.pro.yml`). Pro-only cases `test.skip( ! await hasPro( api ) )`.
- **Parallel stacks** (one run per stack — module state is one shared option, `workers: 1`):
  ```bash
  E2E_PORT=8890 E2E_PROJECT=sg-e2e-b2 bash bin/setup-docker.sh   # writes .env.sg-e2e-b2
  E2E_ENV_FILE=.env.sg-e2e-b2 HEADLESS=1 npx playwright test <files>
  docker compose -p sg-e2e-b2 down -v
  ```
- **Debug log:** `bin/logs/<container>.log`.
- All config flows through `helpers/env.ts`; add new config there, never read `process.env` in a spec. `.wp-env.json` stays as an alternative (CI uses it).

## Writing a UI test

```ts
import { test, expect } from '../../fixtures/test';      // never @playwright/test
import { resetModuleSettings } from '../../helpers/rest';
import { gotoSettings, setField, saveSettings } from '../../helpers/settings-ui';

test.describe('Stock Bar · settings', () => {
  test.beforeEach(async ({ api }) => {
    await resetModuleSettings(api, 'stock-bar');           // state via REST, never via the UI
  });

  test('saves a colour', async ({ page }) => {
    await gotoSettings(page, 'stock-bar', 'design');       // #/settings?module=stock-bar&tab=design
    // … setField / setColor …, then:
    await saveSettings(page, 'stock-bar');                 // waits for POST sales-booster/v1/settings/stock-bar
  });
});
```

Rules:
- **The admin is one React app** (`admin.php?page=storegrowth#/<route>`, plugin-ui): `#/dashboard`, `#/modules`, `#/settings?module=<id>&tab=<tab>` (pages generated from each module's PHP schema), `#/bogo`, `#/bogo/<id>`, `#/bogo/messages`, `#/upsell-order-bump`, `#/upsell-order-bump/<id>`. The old `spsg-settings` / `spsg-modules` slugs only redirect there.
- **Reuse the session** — UI tests run under the `ui` project with the setup's storage state; never call `login()` inside a test.
- **Role/text locators, auto-waiting** — prefer `getByRole`, `getByText`, `getByLabel`. Module switches are `getByRole('switch', { name: 'Enable <Name>' })`; settings fields are found by label (switch cards by label + help, `fieldName()`); pro fields carry " Pro" in their accessible name and are disabled on lite.
- **Settings pages:** Save saves the open tab only (save before switching tabs); Reset fills defaults and persists only on Save; pro-only tabs have no Save bar on lite; gated modules (`bogo`, `floating-notification-bar`, `progressive-discount-banner`) stay unpublished until their first save (`resetModuleSettings` counts).
- **Settings engine behaviour to assert, not fight:** unknown keys are dropped, saves merge into the stored option, one invalid value rejects the whole save (400), a pro-only option sent without pro is ignored (default kept).
- **State through REST** (`helpers/rest.ts`, `helpers/records.ts`): reset in `beforeEach`, clean up records you create. BOGO Buy X Get Y needs `offered_products` + a different `get_different_product_field`; an order bump needs `offer_product_id` + `target_type` and targets. Lite caps both at 2 (403 `salesbooster_limit_exceeded`).
- **Storefront styles are CSS variables** in enqueued stylesheets — assert computed styles, not inline `style`.
- **Idempotent + leave-as-found** — restore what you change (`setModuleState()` is a no-op when already in the target state). Wait on the request or the UI state, never a fixed timeout.
- **Reach for `helpers/`** before inlining navigation/state logic. New cross-spec helpers go in `helpers/`; new ids/names go in `data/`.

## Writing an API test

```ts
import { test, expect } from '../../fixtures/test';

test.describe('API · <area>', () => {
  test('lists something', async ({ api }) => {            // api fixture = authed REST client
    const res = await api.get('/wp-json/sales-booster/v1/products', { params: { per_page: 5 } });
    expect(res.ok()).toBeTruthy();
    expect(Array.isArray(await res.json())).toBeTruthy();
  });
});
```

Rules:
- The **`api` fixture** (in `fixtures/test.ts`) is an authenticated `APIRequestContext` — HTTP Basic (the stack's WP-API Basic-Auth plugin, or an Application Password), scoped per-test, no cookies, so it works in the `ui` project too. Use it for fast, browserless checks and for test setup.
- To test **anonymous / unauthorized** behavior, build a fresh context with no `Authorization` header (`playwright.request.newContext({ baseURL: env.baseURL })`) and assert `401`/`403` — see `tests/api/auth.api.spec.ts`. WordPress validates args before permissions, so an anonymous call with an invalid body gets 400.
- Plugin REST namespace: **`sales-booster/v1`** — modules, settings (`settings/{module}`, `admin/settings`), products, BOGO offers (+ `/editor`, `/batch`, `/{id}/status`, `/vendor`), category messages, order bumps (also kept under the old `spsg/v1`). Admin routes require `manage_options` — assert the happy path *and* that an anonymous caller is rejected. Contract: `docs/redesign/rest-api.md`.
- Spec files end in `.api.spec.ts` and live in `tests/api/` (the `api` project's `testDir`).

## Asserting plugin functionality

`reference/surface-map.md` maps the storefront (module injection hooks and DOM markers), ajax actions and options. Parts of it describe the legacy admin (`#sbooster-*` mounts, admin-ajax saves) — for the admin, trust the redesign docs (`docs/redesign/`, `docs/settings-pages.md`) and the live app over the map.

What the suite covers (keep it that way when changing a module):
1. **Admin shell** — dashboard, modules page and toggles, legacy slug redirects, every settings page mounts (`admin-menu`, `modules`, `settings` specs).
2. **Settings pages** — `settings-pages.spec.ts`: every tab of every module page saves, persists across reload and REST, resets; pro controls locked on lite. Legacy ajax save handlers stay covered (`settings-persistence`, `settings-malformed-payload`) — ADR-004.
3. **Records** — BOGO and Order Bump lists, editors, rules and caps (`bogo-admin`, `order-bump-admin`, `*-rules.api`).
4. **Storefront** — one `storefront-<module>.spec.ts` per module: positive and negative, Order Bump on classic and block checkout, pricing characterisation.
5. **Migrations** — PHPUnit (`tests/php`) plus `tests/compat/migrations.php` (`wp eval-file`).
Not covered: the Dokan vendor dashboard (no Dokan on the stack).

**Verify selectors against the live UI before asserting them** — use whatever browser tooling is available (Playwright MCP, `npm run codegen <url>`, or a quick Playwright script), then copy the confirmed role/label into the spec.

Storefront tests need published products — provisioning seeds them (`data/products.ts`) and fails loudly if their ids drift; add new seed data in `bin/provision-site.php` (after the products) and `data/`.

## CI

`.github/workflows/e2e.yml` runs on pull requests, pushes to the main branches, published releases and on demand: one job builds the plugin and shares the output; an `api` shard and three `ui` shards each boot their own `wp-env` site (shared `bin/provision-site.php`) and run a slice; a report job merges the blobs into one HTML report. Pro activates only when the `SG_LICENSE_KEY` secret is set. CI hardening in `playwright.config.ts`: `forbidOnly`, `retries: 1`, `workers: 1` (one site can't run workers in parallel — module state is one option), traces on retry, `github` reporter. Never commit `.only`. A failing test fails the pipeline.

## Gotchas

- Import `{ test, expect }` from `fixtures/test` — importing from `@playwright/test` silently drops the `api` fixture and shared setup.
- The plugin **no-ops without WooCommerce**; the test env must have WC active (`.wp-env.json` installs it).
- Module toggles persist to the single `spsg_active_module_ids` option and affect the whole site — never run two Playwright processes against the same stack; use parallel stacks instead. Never `pkill` Playwright globally: other stacks' runs die too.
- The stack runs the working tree live: editing plugin PHP while a run is in progress can produce transient fatals. Re-run before blaming a test.
- Headed by default locally; `HEADLESS=1` (and CI) runs headless.
- Known bugs a spec documents before they're fixed use `test.fail` with an `ISSUES #n` reference; flip to a normal test when the fix lands.
- App Password values contain spaces — keep them quoted/unmodified in `.env`.
