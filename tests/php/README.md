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

Needs a MySQL server, WordPress core, and WooCommerce as a sibling plugin
directory — the usual local plugin-development layout already satisfies this.

```bash
composer install
mysql -u root -e "CREATE DATABASE IF NOT EXISTS spsg_phpunit_tests;"

composer test                 # or: npm run phpunit
composer test-f -- --filter test_offer_inside_date_range_is_applicable
```

**The suite DROPS ALL TABLES prefixed `unit_`.** The prefix is deliberately not
the site's own, so the suite can share a development database without destroying
the site next to it. Never point it at production.

Database connection is overridable, so the same config serves a local MySQL, a
wp-env container and CI:

| Variable | Default |
|---|---|
| `WP_DB_NAME` | `spsg_phpunit_tests` |
| `WP_DB_USER` | `root` |
| `WP_DB_PASS` | *(empty)* |
| `WP_DB_HOST` | `localhost` |

Against wp-env, set `WP_DB_HOST=mysql`.

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
PHP version difference.
