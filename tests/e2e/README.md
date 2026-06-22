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
├── docker-compose.yml       # the sg-test-automation stack (WP + DB + cli)
├── bin/setup-docker.sh      # one-shot: boot Docker, install prereqs, write .env
├── bin/provision-site.php   # SHARED site setup (modules, products, options) — Docker + CI
├── package.json             # self-contained — does not touch the plugin's Lerna deps
├── tsconfig.json
├── .wp-env.json             # alternative disposable WP env
├── .env.example             # copy to .env for manual runs
├── ISSUES.md                # plugin behaviours found while building the suite
├── fixtures/
│   └── test.ts              # custom `test`/`expect` + the `api` fixture
├── helpers/
│   ├── env.ts               # typed, centralized config (only place reading process.env)
│   ├── wp-admin.ts          # login(), gotoAdminPage(), gotoSettings()
│   ├── modules.ts           # gotoModules(), setModuleState(), moduleToggle()
│   ├── ajax.ts              # admin-ajax via the page's spsg_ajax_nonce
│   └── storefront.ts        # gotoShop(), gotoProduct(), gotoCart()
├── data/
│   ├── modules.ts           # module ids/names, baseline set, verified markers
│   └── products.ts          # seeded product slugs + store page paths
└── tests/
    ├── auth.setup.ts        # authenticates once, persists .auth/admin.json
    ├── ui/                  # E2E browser tests (reuse admin session)
    │   ├── settings.spec.ts            # Settings SPA mounts
    │   ├── admin-menu.spec.ts          # menu + both SPAs
    │   ├── modules.spec.ts             # catalog renders, toggle persists
    │   ├── module-ajax.spec.ts         # get_all_modules / update_module_status
    │   ├── settings-persistence.spec.ts# per-module settings save→get round-trip
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
        └── order-bumps.api.spec.ts     # order bumps CRUD + matching
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
- the **classic checkout** shortcode (the Order Bump needs it — ISSUES.md #7)
- three published, stock-managed products for storefront tests

The shared, environment-agnostic site setup lives in **`bin/provision-site.php`**
(a `wp eval-file` script) and is run by BOTH the Docker stack and CI — so the two
environments are configured identically.

> Requires **Docker** and **Node 20+**.

```bash
cd tests/e2e
bash bin/setup-docker.sh      # boot + provision + write .env  (idempotent)
npm install
npm run install:browsers

npm test                      # everything (setup → ui → api)
npm run test:api              # API only
npm run test:ui               # UI only
HEADLESS=1 npm run test:ui    # UI without opening browser windows
npm run report                # open the last HTML report

docker compose down -v        # tear down + wipe data
```

The site runs at <http://localhost:8888> (admin `admin` / `password`).

### Manual / wp-env alternative

`.env.example` documents the variables. You can point `BASE_URL` at any WP site
that has WooCommerce active; set `WP_ADMIN_USER`/`WP_ADMIN_PASSWORD` and, if the
site requires it, `WP_APP_PASSWORD` (an Application Password overrides the admin
password for the API project). A `.wp-env.json` is also provided.

## Known plugin behaviours the suite works around

See **[ISSUES.md](./ISSUES.md)** — notably the Settings SPA's missing index
route (#1) and the non-atomic module-toggle option write (#2), which is why the
suite runs `workers: 1`.

## CI/CD

`.github/workflows/e2e.yml` runs on every **published release** (and on demand).
It builds the plugin (composer + `npm run build`), boots `wp-env`, generates an
Application Password, runs the suite, and **uploads the HTML report, JUnit XML,
and failure traces/screenshots as artifacts**. Any failing test exits non-zero
and fails the pipeline.
