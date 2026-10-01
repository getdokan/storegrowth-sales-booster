# Plugin behaviours found while building the E2E suite

Specs and comments cite these by number (`ISSUES.md #2`, `BUG #6`). Numbers are
never reused; a resolved entry stays, marked **Resolved**, so old references
still lead somewhere.

The original file was referenced but never committed. #1, #2, #6 and #7 are
rebuilt from what the specs, the README and `bin/provision-site.php` say about
them; #3–#5 had no remaining reference and are kept as reserved numbers.

| # | Area | Status |
|---|---|---|
| 1 | Admin: Settings SPA had no index route | Resolved by the admin redesign |
| 2 | Modules: toggles write one shared option non-atomically | Open — why the suite runs `workers: 1` |
| 3–5 | — | Reserved (lost with the original file) |
| 6 | Sales Notification: array `virtual_locations` fatals the storefront enqueue | Probably fixed — keep the regression spec |
| 7 | Order Bump: needs the classic checkout | Open on the provisioned stack — re-check against the block checkout |

## #1 — Settings SPA had no index route

The old antd Settings app (`#sbooster-settings-page`) rendered an empty shell at
`?page=spsg-settings` with no hash, so specs had to navigate to a hash route
(`#/dashboard/overview`) explicitly.

**Resolved.** Since ADR-008 there is one page, `admin.php?page=storegrowth`, which
opens `#/dashboard` without a hash (`#/modules` when an old Modules link was
redirected with `view=modules`). The old slugs redirect on `admin_init`.
`tests/ui/settings.spec.ts` covers the redirects.

## #2 — Module toggles write one shared option non-atomically

Every module's on/off state lives in the single `spsg_active_module_ids` option.
Activating or deactivating a module reads the option, changes one id and writes
the whole list back. Two concurrent toggles (two Playwright workers, or a UI
click racing a REST call) can each read the old list and the second write
drops the first change.

**Consequences for the suite:** `playwright.config.ts` runs `workers: 1`, and CI
shards across separate sites instead of adding workers. Toggle through
`setModuleStatus()` (helpers/rest.ts, asserts the response) or
`setModuleState()` (UI, waits for the save), and restore what you changed.
Parallel runs need parallel stacks (README, "Parallel stacks").

## #3, #4, #5 — Reserved

## #6 — Array `virtual_locations` broke the Sales Notification enqueue

`EnqueueScript::enqueue_scripts()` `explode()`d `virtual_locations`
unconditionally. Saved as an array (which the old admin could send) it fatalled
on the storefront, so `popup-custom.js` never loaded.

**Status:** the current `modules/sales-pop/includes/EnqueueScript.php` handles
both a string and an array, so this looks fixed. Keep the `[BUG #6]` regression
test in `storefront-sales-pop.spec.ts`.

## #7 — The Order Bump needs the classic checkout

The bump renders from a classic checkout hook; WooCommerce's default block
checkout did not fire it, so the bump never appeared.
`bin/provision-site.php` therefore puts the `[woocommerce_checkout]` shortcode
on the checkout page.

**Status:** the module now ships a checkout block
(`modules/upsell-order-bump/includes/Blocks/`). The stack still uses the classic
checkout; the Order Bump batch should add block-checkout coverage and update
this entry.
