---
name: sg-test-automation
description: Write, run, and extend the StoreGrowth (Sales Booster) Playwright E2E + API test suite in tests/e2e. Use when adding or modifying browser/UI tests, REST/API tests, fixtures, helpers, or test data; debugging failing tests; setting up the wp-env test environment; or wiring CI. Read before touching anything under tests/e2e.
---

# StoreGrowth Test Automation

The end-to-end + API test suite for the StoreGrowth Sales Booster WooCommerce plugin. Built with **Playwright + TypeScript**, living entirely in `tests/e2e/` (self-contained — it does **not** touch the plugin's Lerna/wp-scripts deps). For what the plugin *does* (modules, REST routes, ajax, storefront selectors) see `reference/surface-map.md` — the testable-surface map you assert against. For backend/frontend dev conventions see the sibling skills `storegrowth-backend-dev` / `storegrowth-frontend-dev`.

## Design contract — keep it this way

- **No Page Object Model.** Reusable **fixtures** + small **helper functions** + stable **data** only. POM adds indirection without payoff here. Do not introduce page-object classes.
- **Two Playwright projects, one config** (`playwright.config.ts`): `ui` (browser/E2E) and `api` (browserless REST). A `setup` project logs in once and persists the session so no UI test pays the login cost.
- **Layout** (all under `tests/e2e/`):
  - `fixtures/test.ts` — the custom `test`/`expect` and the `api` fixture. **Every spec imports `{ test, expect }` from here, never from `@playwright/test` directly.**
  - `helpers/` — `env.ts` (the *only* place that reads `process.env`), `wp-admin.ts` (`login`, `gotoAdminPage`), `modules.ts` (`gotoModules`, `setModuleState`, page slugs).
  - `data/` — stable ids/names (`data/modules.ts`).
  - `tests/auth.setup.ts` — authenticates once → writes `.auth/admin.json`.
  - `tests/ui/*.spec.ts` — browser tests (reuse admin session).
  - `tests/api/*.api.spec.ts` — REST tests (App Password / HTTP Basic).

## Running the suite

From `tests/e2e/` (Node 20+):

```bash
npm install
npm run install:browsers          # playwright install --with-deps chromium
cp .env.example .env              # then fill credentials + App Password

npm test                          # everything (setup → ui → api)
npm run test:ui                   # UI/E2E only
npm run test:api                  # API only
npm run test:headed               # UI, headed browser
npm run test:debug                # PWDEBUG inspector
npm run codegen                   # record selectors against the live site
npm run report                    # open last HTML report
```

Single test while iterating: `npx playwright test tests/ui/modules.spec.ts -g "can be activated"`.

## Test environment (wp-env)

`.wp-env.json` (in `tests/e2e/`) provisions a disposable WP + WooCommerce + this plugin. Run it **from `tests/e2e/`**:

```bash
npx wp-env start
# App Password for the api project:
npx wp-env run cli wp user application-password create admin "local-e2e" --porcelain
```

Put the result into `.env` (`WP_APP_PASSWORD` — the spaces are part of the value). `BASE_URL` defaults to `http://localhost:8888` (the wp-env port). All config flows through `helpers/env.ts`; add new config there, never read `process.env` in a spec.

## Writing a UI test

```ts
import { test, expect } from '../../fixtures/test';      // never @playwright/test
import { gotoAdminPage } from '../../helpers/wp-admin';

test.describe('Admin · <area>', () => {
  test('does the thing', async ({ page }) => {
    await gotoAdminPage(page, 'spsg-settings');           // ?page= slug
    await expect(page.locator('#sbooster-settings-page')).toBeVisible();
  });
});
```

Rules:
- **Reuse the session** — UI tests run under the `ui` project with `storageState: .auth/admin.json`; never call `login()` inside a test.
- **Role/text locators, auto-waiting** — prefer `getByRole`, `getByText`, `getByLabel` over CSS/XPath. The admin UI is **Ant Design React**: toggles are `role="switch"` with `aria-checked`; the settings/modules apps are HashRouter SPAs that mount into `#sbooster-settings-page` / `#sbooster-modules-page` — assert that container is visible before interacting.
- **Idempotent + leave-as-found** — mutating state (toggling a module, saving settings) must restore the original state at the end. See `setModuleState()` (idempotent, no-op when already in target state) and the modules spec (enable → assert → disable). Persistence is via admin-ajax; wait for the UI to settle (`expect(toggle).toHaveAttribute('aria-checked', …)`), not a fixed timeout.
- **Reach for `helpers/`** before inlining navigation/state logic. New cross-spec navigation or state helpers go in `helpers/`; new ids/names go in `data/`.

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
- The **`api` fixture** (in `fixtures/test.ts`) is an authenticated `APIRequestContext` — HTTP Basic from a WP **Application Password**, scoped per-test so state never leaks. Use it for fast, browserless checks.
- To test **anonymous / unauthorized** behavior, build a fresh context with no `Authorization` header (`playwright.request.newContext({ baseURL: env.baseURL })`) and assert `401`/`403` — see `tests/api/auth.api.spec.ts`.
- Plugin REST namespaces: **`sales-booster/v1`** (product picker, BOGO offers) and **`spsg/v1`** (upsell order-bumps). Every plugin route requires `manage_options` — assert both the happy path *and* that an anonymous caller is rejected. Full route list in `reference/surface-map.md`.
- Spec files end in `.api.spec.ts` and live in `tests/api/` (the `api` project's `testDir`).

## Asserting plugin functionality

`reference/surface-map.md` is the authoritative map: admin page slugs + React mount ids, every REST route + namespace + capability, every `wp_ajax_*` action + nonce, every `spsg_*` option key, all 10 modules with their storefront injection hooks and DOM markers, and the module enable/disable mechanism (`spsg_active_module_ids`, `update_module_status` ajax, `spsg_module_activated/deactivated`).

Coverage priorities, in order:
1. **Admin surface** — settings & modules SPAs mount; module catalog renders; a module can be toggled and the state persists (highest signal, already partly covered).
2. **API surface** — REST health (namespaces present), authed access resolves to an admin, plugin endpoints list/CRUD, anonymous calls rejected.
3. **Storefront behavior** — activate a module, visit the storefront page that exercises it (shop / single product / cart / checkout — see the map), assert its DOM marker appears; deactivate, assert it's gone. This is the strongest end-to-end signal and the thinnest current coverage.

**Verify storefront selectors before asserting them.** The frontend CSS-class markers in the surface map were read from templates and are mostly reliable, but some are inferred — confirm against the live storefront before hard-coding.

**When you need a browser to inspect/verify the UI, use the Playwright MCP plugin first.** Load it before any browser call (its tools are deferred): `ToolSearch` with `select:mcp__plugin_playwright_playwright__browser_navigate,mcp__plugin_playwright_playwright__browser_snapshot,mcp__plugin_playwright_playwright__browser_click,mcp__plugin_playwright_playwright__browser_evaluate` (add `browser_take_screenshot`, `browser_fill_form`, etc. to the same call as needed). Drive the page with these `mcp__plugin_playwright_playwright__*` tools — `browser_navigate` to the URL, `browser_snapshot` to read the accessibility tree / real selectors, `browser_evaluate` to query the DOM — then copy the confirmed selectors into the spec. Only fall back to `npm run codegen <url>` or the `mcp__claude-in-chrome__*` tools if the Playwright MCP plugin is unavailable.

Storefront tests usually need a published product and items in the cart — seed via `wp-env run cli wp wc ...` or the WC REST API in a setup step; document any new seed data in `data/`.

## CI

`.github/workflows/e2e.yml` runs on every **published release** (and on demand): builds the plugin (composer + `npm run build`), boots `wp-env`, generates an App Password, runs the suite, uploads the HTML report, JUnit XML, and failure traces/screenshots as artifacts. CI-only hardening lives in `playwright.config.ts`: `forbidOnly`, `retries: 2`, `workers: 2`, `trace: 'on-first-retry'`, plus the `github` reporter. Keep tests deterministic and parallel-safe — files run `fullyParallel`. Never commit `.only`. A failing test fails the pipeline.

## Gotchas

- Import `{ test, expect }` from `fixtures/test` — importing from `@playwright/test` silently drops the `api` fixture and shared setup.
- The plugin **no-ops without WooCommerce**; the test env must have WC active (`.wp-env.json` installs it).
- Module toggles persist to the single `spsg_active_module_ids` option and affect the whole site — parallel UI tests mutating the *same* module will race. Restore state, and prefer distinct modules per spec when toggling.
- `headless: false` is the default in `playwright.config.ts`; CI overrides via the `ui` project device. Set `--headed`/headless intentionally when debugging.
- App Password values contain spaces — keep them quoted/unmodified in `.env`.
