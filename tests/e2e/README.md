# StoreGrowth — Playwright E2E + API Tests

A lightweight Playwright (TypeScript) suite for the StoreGrowth Sales Booster
plugin, built for fast, reliable CI/CD release gating. **No Page Object Model** —
just reusable fixtures, small helper functions, and clear test organization.

## Design at a glance

| Concern        | Approach                                                                 |
| -------------- | ------------------------------------------------------------------------ |
| Structure      | `fixtures/` + `helpers/` + `data/` + `tests/{ui,api}` — no page objects   |
| Auth (UI)      | One `setup` project logs in once → session saved → reused by every test   |
| Auth (API)     | `api` fixture with WP Application Password (HTTP Basic), per-test context |
| UI vs API      | Two Playwright `projects` sharing one config                             |
| Reporting      | `list` + `html` + `junit` (+ `github` annotations in CI)                  |
| Reliability    | Auto-waiting locators, role-based selectors, retries/trace **in CI only** |
| Speed          | Parallel files, no per-test login, browserless API project               |

## Project structure

```
tests/e2e/
├── playwright.config.ts     # projects (setup → ui, api), reporters, timeouts
├── package.json             # self-contained — does not touch the plugin's Lerna deps
├── tsconfig.json
├── .wp-env.json             # disposable WP + WooCommerce + this plugin for local/CI
├── .env.example             # copy to .env for local runs
├── fixtures/
│   └── test.ts              # custom `test`/`expect` + the `api` fixture
├── helpers/
│   ├── env.ts               # typed, centralized config (the only place reading process.env)
│   ├── wp-admin.ts          # login(), gotoAdminPage()
│   └── modules.ts           # StoreGrowth-specific: gotoModules(), setModuleState()
├── data/
│   └── modules.ts           # stable module ids/names used across tests
└── tests/
    ├── auth.setup.ts        # authenticates once, persists .auth/admin.json
    ├── ui/                  # E2E browser tests (reuse admin session)
    │   ├── settings.spec.ts
    │   └── modules.spec.ts
    └── api/                 # browserless REST tests (App Password auth)
        ├── health.api.spec.ts
        ├── auth.api.spec.ts
        └── products.api.spec.ts
```

> **Why fixtures over POM:** for a small plugin, page objects add indirection
> without payoff. A handful of typed helpers + Playwright's auto-waiting,
> role-based locators are easier to read, change, and onboard onto.

## Local setup

> Requires **Node 20+**.

```bash
cd tests/e2e
cp .env.example .env          # then edit credentials / Application Password
npm install
npm run install:browsers

npm test                      # everything
npm run test:ui               # UI/E2E only
npm run test:api              # API only
npm run report                # open the last HTML report
```

Spin up a disposable WordPress (WP + WooCommerce + this plugin) with
[`wp-env`](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-env/).
The `.wp-env.json` lives here in `tests/e2e/`, so run it from this folder:

```bash
cd tests/e2e
npx wp-env start
# create an Application Password for API tests:
npx wp-env run cli wp user application-password create admin "local-e2e" --porcelain
```

## CI/CD

`.github/workflows/e2e.yml` runs on every **published release** (and on demand).
It builds the plugin (composer + `npm run build`), boots `wp-env`, generates an
Application Password, runs the suite, and **uploads the HTML report, JUnit XML,
and failure traces/screenshots as artifacts**. Any failing test exits non-zero
and fails the pipeline.
