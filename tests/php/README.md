# PHPUnit suite

Characterisation tests for offer eligibility and the BOGO data layer. They boot
a **real WordPress + WooCommerce** through `wp-phpunit`, mirroring the harness
dokan-lite uses — no mocking of WordPress or WooCommerce.

## What belongs here, and what does not

These are **characterisation** tests. They record what the code does today so a
behavioural change in 2.2 or 3.0 shows up as a failing test. They do not assert
that the behaviour is right. Several assertions deliberately encode known
defects; each says so inline. When a later issue fixes one, updating the test is
expected — the diff is the record of what changed for merchants.

Pure logic and data-layer behaviour live here. Anything that needs a rendered
cart — line item prices, subtotals, tax totals, order totals — lives in the
Playwright suite under `tests/e2e/`, because asserting those through mocks would
test the mocks rather than the pricing.

## Running

### With wp-env (no local WordPress needed)

`.wp-env.json` at the repo root describes the environment: WordPress, WooCommerce
and this plugin. It is a separate site from the Playwright one in `tests/e2e`, on
ports 8890/8891 so both can run at once.

```bash
npm -g install @wordpress/env   # once
composer install                # vendor/ is mounted into the container
npm run env:start
npm run phpunit:env
```

Run a single case by appending PHPUnit's own flags:

```bash
npm run phpunit:env -- --filter test_offer_inside_date_range_is_applicable
```

The suite runs in the **`tests-cli`** container, never `cli`. wp-env exports
`WP_TESTS_DIR=/wordpress-phpunit` there and points it at the throwaway
`tests-wordpress` database; `bootstrap.php` prefers that variable, so WordPress'
own test library is used and `phpunit-wp-config.php` is not consulted. WordPress'
test bootstrap drops and recreates every table it owns, which is why this must
not run against the `cli` container serving the development site.

`npm run env:stop` when finished, or `npm run env:destroy` to discard the
database along with it.

### Against a local MySQL + WordPress

Needs a MySQL server, WordPress core, and WooCommerce as a sibling plugin
directory — the usual local plugin-development layout already satisfies this.

```bash
composer install
mysql -u root -e "CREATE DATABASE IF NOT EXISTS spsg_phpunit_tests;"

composer test                 # or: npm run phpunit
composer test-f -- --filter test_offer_inside_date_range_is_applicable
```

**This path DROPS ALL TABLES prefixed `unit_`.** The prefix is deliberately not
the site's own, so the suite can share a development database without destroying
the site next to it. Never point it at production.

Database connection is overridable, so the same config serves a local MySQL and
CI:

| Variable | Default |
|---|---|
| `WP_DB_NAME` | `spsg_phpunit_tests` |
| `WP_DB_USER` | `root` |
| `WP_DB_PASS` | *(empty)* |
| `WP_DB_HOST` | `localhost` |

## Layout

```
phpunit.xml                          repo root, like dokan-lite
tests/php/bootstrap.php              boots WP, WooCommerce, then StoreGrowth
tests/php/phpunit-wp-config.php      DB + constants (WP_PHPUNIT__TESTS_CONFIG)
tests/php/src/StoreGrowthTestCase.php  base case, offer builders
tests/php/src/Bogo/                  eligibility + data layer cases
```

Test classes are PSR-4 under `StorePulse\StoreGrowth\Test\` via `autoload-dev`.

## CI

`.github/workflows/phpunit.yml` runs on every pull request at PHP 7.4 — the same
default as the E2E workflow, so a difference between the suites is never just a
PHP version difference. It boots the environment with wp-env from the same
`.wp-env.json` used locally, so CI and a developer's machine describe the site
once rather than twice. A `workflow_dispatch` run takes a `php_version` input,
applied through a generated `.wp-env.override.json`.
