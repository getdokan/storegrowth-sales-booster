# StoreGrowth — Playwright E2E + API Tests

A lightweight Playwright (TypeScript) suite for the StoreGrowth Sales Booster
plugin, built for fast, reliable CI/CD release gating. **No Page Object Model** —
just reusable fixtures, small helper functions, and clear test organization.

## Design at a glance

| Concern        | Approach                                                                 |
| -------------- | ------------------------------------------------------------------------ |
| Structure      | `fixtures/` + `helpers/` + `data/` + `tests/{ui,api}` — no page objects   |
| Auth (UI)      | One `setup` project logs in once → session saved → reused by every test   |
| Auth (API)     | `api` fixture, HTTP Basic via WP-API Basic-Auth (admin login), per-test  |
| UI vs API      | Two Playwright `projects` sharing one config                             |
| Reporting      | `list` + `html` + `junit` (+ `github` annotations in CI)                  |
| Reliability    | Auto-waiting locators, role-based selectors, retries/trace **in CI only** |
| Concurrency    | `workers: 1` — module state is one shared option (ISSUES.md #2)           |

## Project structure

```
tests/e2e/
├── playwright.config.ts     # projects (setup → ui, api), reporters, timeouts
├── docker-compose.yml       # the stack (WP + DB + cli); project/port/names from E2E_* env
├── docker-compose.pro.yml   # opt-in Pro variant (mounts $PRO_DIR)
├── bin/setup-docker.sh      # one-shot: boot Docker, install prereqs, write .env (if missing)
├── bin/provision-site.php   # SHARED site setup (modules, products, options) — Docker + CI
├── bin/logs/                # WP_DEBUG_LOG per stack: bin/logs/<container>.log (git-ignored)
├── bin/qa-shots.mjs         # review screenshots, before/after + compare.html (dev site, run from the plugin folder)
├── package.json             # self-contained — does not touch the plugin's build deps
├── tsconfig.json
├── .wp-env.json             # alternative disposable WP env
├── .env.example             # copy to .env for manual runs
├── ISSUES.md                # plugin behaviours found while building the suite
├── fixtures/
│   └── test.ts              # custom `test`/`expect` + the `api` fixture
├── helpers/
│   ├── env.ts               # typed, centralized config (only place reading process.env)
│   ├── wp-admin.ts          # login(), gotoAdminPage()
│   ├── modules.ts           # app shell: gotoDashboard(), gotoModules(), moduleToggle(), setModuleState()
│   ├── settings-ui.ts       # generated settings pages: gotoSettings(), setField(), saveSettings(), …
│   ├── rest.ts              # REST setup: setModuleStatus(), get/save/resetModuleSettings(), hasPro()
│   ├── records.ts           # BOGO offers + order bumps: create*/delete*/deleteAll*
│   ├── record-ui.ts         # record list/editor screens: rows, Actions menu, delete dialog, product picker, saveRecord()
│   ├── wp-cli.ts            # raw option access through E2E_WP_CLI (opt-in)
│   ├── ajax.ts              # legacy admin-ajax via the page's nonce
│   └── storefront.ts        # gotoShop(), gotoProduct(), gotoCart()
├── data/
│   ├── modules.ts           # module ids/names, baseline set, verified markers
│   └── products.ts          # seeded product ids + slugs + store page paths
└── tests/
    ├── auth.setup.ts        # authenticates once, persists .auth/admin[-<port>].json
    ├── ui/                  # E2E browser tests (reuse admin session)
    │   ├── settings.spec.ts            # every settings page mounts, save/reset, legacy redirects
    │   ├── admin-menu.spec.ts          # menu + app shell (#/dashboard, #/features)
    │   ├── modules.spec.ts             # #/modules catalog, toggle persists (UI + REST)
    │   ├── module-ajax.spec.ts         # get_all_modules / update_module_status
    │   ├── settings-persistence.spec.ts# per-module settings save→get round-trip
    │   ├── settings-pages.spec.ts      # every settings page: each tab saves/persists/resets; pro locked on lite
    │   ├── bogo-admin.spec.ts          # BOGO list + editor + category messages (lite)
    │   ├── order-bump-admin.spec.ts    # Order Bump list + editor, 2.2.0 hash routes
    │   ├── pricing-characterisation.spec.ts # cart money: BOGO, Order Bump, Free Shipping Rules
    │   └── storefront-*.spec.ts        # one per module: positive + negative,
    │                                   #   validated on the storefront (countdown
    │                                   #   timer, direct checkout, floating bar,
    │                                   #   fly cart, free shipping, quick view,
    │                                   #   sales notification, stock bar, order bump)
    └── api/                 # browserless REST tests
        ├── health.api.spec.ts          # namespaces + route listing
        ├── auth.api.spec.ts            # authed admin + anonymous rejection
        ├── products.api.spec.ts        # product picker
        ├── bogo.api.spec.ts            # BOGO offers CRUD + status
        ├── bogo-rules.api.spec.ts      # BOGO 400s, lite cap 403, merge, batch, status
        ├── bogo-category-msg-auth.api.spec.ts # category messages: ajax + REST auth
        ├── order-bumps.api.spec.ts     # order bumps CRUD + matching
        └── order-bump-rules.api.spec.ts# both namespaces, 400s, cap, merge, schedule, batch
```

> **Why fixtures over POM:** for a small plugin, page objects add indirection
> without payoff. A handful of typed helpers + Playwright's auto-waiting,
> role-based locators are easier to read, change, and onboard onto.

## Quickstart with the `sg-test-automation` Docker stack (recommended)

A self-contained Docker stack (`docker-compose.yml` + `bin/setup-docker.sh`)
provisions everything the suite needs and writes `.env` for you:

- WordPress (container **`sg-test-automation`**) + MariaDB
- WooCommerce + the **Storefront** theme
- this plugin (bind-mounted from the repo — runs your working tree)
- the WP-API **Basic-Auth** plugin (so the API project uses the admin login)
- `WP_ENVIRONMENT_TYPE=local`, pretty permalinks, storefront published
  (`woocommerce_coming_soon=no`), the StoreGrowth initial-setup flag cleared
- **ALL modules activated** (the baseline; the order-bump table migration runs)
- the **classic checkout** shortcode on `/checkout/`, plus a WooCommerce
  **Checkout block** page at `/e2e-block-checkout/` (Order Bump runs on both —
  ISSUES.md #7)
- three published, stock-managed products for storefront tests (ids 11, 12, 13
  on a fresh stack — `data/products.ts`), the `e2e10` coupon; **no** BOGO offers
  or order bumps (specs create their own with `helpers/records.ts`)
- **lite**: StoreGrowth Pro is not mounted and is deactivated, so `has_pro()` is
  false (see "Pro variant" below)

The shared, environment-agnostic site setup lives in **`bin/provision-site.php`**
(a `wp eval-file` script) and is run by BOTH the Docker stack and CI — so the two
environments are configured identically.

> Requires **Docker** and **Node 20+**.

```bash
cd tests/e2e
bash bin/setup-docker.sh      # boot + provision + write .env if missing  (idempotent)
npm install
npm run install:browsers

npm test                      # everything (setup → ui → api)
npm run test:api              # API only
npm run test:ui               # UI only
HEADLESS=1 npm run test:ui    # UI without opening browser windows
npm run report                # open the last HTML report

docker compose -p "${COMPOSE_PROJECT_NAME:-sg-test-automation}" down -v   # tear down + wipe data (the setup prints the exact command)
```

The site runs at <http://localhost:8888> (admin `admin` / `password`). Built admin
assets come from the plugin's own `npm run start` / `npm run build` output in the
working tree (the plugin folder is bind-mounted).

`setup-docker.sh` never overwrites an existing `.env`; delete it to regenerate.
If your shell exports `COMPOSE_PROJECT_NAME`, that names the default stack (and
wins over the file's `name:`) — always pass `-p <project>` to `docker compose`.

### Parallel stacks

Each stack gets its own compose project (volumes), containers, port and env
file, so several batches can run at once from the same checkout:

```bash
E2E_PORT=8890 E2E_PROJECT=sg-e2e-b2 bash bin/setup-docker.sh   # writes .env.sg-e2e-b2
E2E_ENV_FILE=.env.sg-e2e-b2 HEADLESS=1 npm run test:ui        # or BASE_URL=http://localhost:8890
docker compose -p sg-e2e-b2 down -v                           # tear it down
```

| Variable | Default | Meaning |
|---|---|---|
| `E2E_PORT` | `8888` | host port of WordPress |
| `E2E_PROJECT` | `$COMPOSE_PROJECT_NAME` or `sg-test-automation` | compose project (volume prefix) |
| `E2E_CONTAINER` | `sg-test-automation`, or `$E2E_PROJECT` when that is set | container names `<name>` / `<name>-db` |
| `E2E_ENV_FILE` | `.env` | env file `helpers/env.ts` loads |

A run against a non-8888 `BASE_URL` keeps its artefacts apart: session
`.auth/admin-<port>.json`, `test-results-<port>/`, `playwright-report-<port>/`,
`results/junit-<port>.xml`. Module state is still one option per site
(ISSUES.md #2): parallelism comes from more stacks, never more workers.

### Pro variant (opt-in)

The default stack is lite. To test with Pro, pass the Pro folder and a license
key; the setup mounts it through `docker-compose.pro.yml`, activates it and its
Appsero license:

```bash
PRO_DIR=../../../storegrowth-sales-booster-pro LICENSE_KEY=… bash bin/setup-docker.sh
```

Re-running the setup without them switches the stack back to lite
(`provision-site.php` deactivates Pro). In specs, `hasPro(api)`
(`helpers/rest.ts`) tells which variant is running.

### Debug log

`WP_DEBUG_LOG` writes to `bin/logs/<container>.log` on the host (one file per
stack; WordPress and WP-CLI both write there):

```bash
tail -f bin/logs/sg-test-automation.log
```

### Manual / wp-env alternative

`.env.example` documents the variables. You can point `BASE_URL` at any WP site
that has WooCommerce active; set `WP_ADMIN_USER`/`WP_ADMIN_PASSWORD` and, if the
site requires it, `WP_APP_PASSWORD` (an Application Password overrides the admin
password for the API project). A `.wp-env.json` is also provided.

## Known plugin behaviours the suite works around

See **[ISSUES.md](./ISSUES.md)** — notably the non-atomic module-toggle option
write (#2), which is why the suite runs `workers: 1`.

## CI/CD

`.github/workflows/e2e.yml` runs on **every pull request**, on pushes to
`develop`/`main`/`master`, on every **published release**, and on demand. A
single `build` job builds the plugin (composer + `npm run build`, plus Pro when
the repo secrets are set) and uploads the generated output — `vendor/`,
`lib/packages/` and every `build/` dir — as one artifact. Each shard then
unpacks that over its checkout instead of rebuilding, boots its own `wp-env`
site, generates an Application Password, and runs its slice of the suite.
Docker can't be shared across matrix jobs (separate runners), so the wp-env boot
stays per shard. Any failing test fails the pipeline.

**Sharding.** The suite is split across four parallel jobs — one `api` job plus
three `ui` shards — each on its own isolated `wp-env` site (a single site can't
run multiple workers, see [ISSUES.md](./ISSUES.md) #2). `fail-fast: false` lets every shard
finish so the report is complete.

**Fancy report.** Each shard emits a Playwright `blob` report and a JUnit XML.
A downstream `report` job (`if: always()`) then:

- merges the four blobs into **one browsable HTML report**, uploaded as the
  `playwright-report` artifact;
- renders a per-test **GitHub Check** ("Playwright results") via
  `dorny/test-reporter`, so passes/failures show in the PR's **Checks** tab with
  inline annotations on failing tests;
- writes a **pass/fail/skip/duration summary table** to the run's **Summary** tab.

**Merge gating.** The `E2E Tests` job is a single, stable status check that
fails unless **every** shard passed. Mark it (alongside `Run PHPCS inspection`)
as a **required status check** in the repo's branch-protection rule for
`develop`, so a PR can only merge once CI is fully green — matching the
"tests must pass before merge" flow.
