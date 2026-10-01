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
| 7 | Order Bump: needs the classic checkout | Resolved — the checkout block works; both checkouts covered (see #9) |
| 8 | Direct Checkout / BOGO general: an array `data` fatals the legacy ajax save | Open — `test.fail` in `settings-malformed-payload.spec.ts` |
| 9 | Order Bump: Checkout block off the store's checkout page can't be ticked | Open — `test.fail` in `storefront-order-bump.spec.ts` |
| 10 | BOGO / Order Bump list: "Turn on" shows the empty state over existing records | Open — `test.fail` in `bogo-admin.spec.ts`, `order-bump-admin.spec.ts` |
| 11 | BOGO REST: `bogo_deal_type` / `offer_type` accept any value | Open — `test.fail` in `bogo-rules.api.spec.ts` |

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

**Resolved.** The module ships a checkout block
(`modules/upsell-order-bump/includes/Blocks/`, `storegrowth-upsell-order-bump`),
and the bump shows, prices and adds/removes on WooCommerce's Checkout block as
on the classic one. The stack keeps the classic shortcode on `/checkout/` (other
specs read the classic markup) and also provisions a Checkout block page,
`/e2e-block-checkout/`; `storefront-order-bump.spec.ts` runs every bump case on
both, making the block page the store's checkout page for the block run (#9).

## #8 — An array `data` fatals two legacy ajax saves

`spsg_direct_checkout_save_settings` (`modules/direct-checkout/includes/Ajax.php`)
and `spsg_bogo_general_save_settings` (`modules/bogo/includes/Ajax.php`) pass
`$_POST['data']` straight to `json_decode()`. Sent as an array (`data[k]=v`)
it throws `TypeError: json_decode(): Argument #1 ($json) must be of type string,
array given` → HTTP 500 instead of a 400 "Invalid settings payload". Admin-only
(nonce + `manage_options`) and nothing is written, so no data loss; the other
JSON adapters (Floating Bar, Free Shipping Rules, `create_popup`) refuse it
cleanly.

Repro (admin session, `nonce` = `window.spsgAdmin.nonce`):

```
POST /wp-admin/admin-ajax.php
action=spsg_direct_checkout_save_settings&_ajax_nonce=<nonce>&data[some_key]=value
```

**Fix:** check `is_string( $_POST['data'] )` before decoding (or decode only a
string). `settings-malformed-payload.spec.ts` marks the two cases `test.fail`;
remove that once fixed.

## #9 — Order Bump: a Checkout block off the store's checkout page can't be ticked

`EnqueueScript::front_scripts()` (`modules/upsell-order-bump/includes/EnqueueScript.php`)
localises `bump_save_url` (ajax URL + nonce) only when `is_checkout()` (filter
`spsg_order_bump_needs_front_assets`). The block (`assets/js/blocks.js`) reads
`window.bump_save_url` when ticked. A Checkout block on a page that isn't
WooCommerce › Advanced › Checkout page draws the bump, but ticking throws
`Cannot read properties of undefined (reading 'ajax_url_for_front')` and nothing
is added (the box stays ticked). On the store's checkout page it works.

Repro: classic `/checkout/` as the checkout page, a page with the Checkout
block at `/e2e-block-checkout/`, a bump on product A; add A, open the block
page, tick the bump.

**Fix:** localise the data with the block's script (the integration's
`get_script_data()`), or enqueue when the page has the `woocommerce/checkout`
block. `storefront-order-bump.spec.ts` "[BUG] a Checkout block off the store
checkout page" is `test.fail`.

## #10 — "Turn on" in the BOGO / Order Bump list shows the empty state over existing records

`setModuleStatus()` (`src/hooks/modules-context.tsx`) applies the new status
before the server answers. The list (`bogo-list.tsx`, `order-bump-list.tsx`)
mounts at once and requests `GET …/bogo/offers` / `…/order-bumps` while the
module, and so its REST routes, are still off: 404, a "could not be loaded"
toast and "No BOGO offers yet" / "No order bumps yet" over existing records,
until a reload.

Repro: a bump exists; turn the module off; open `#/upsell-order-bump`; click
"Turn on Upsell Order Bump" (or BOGO's "Turn on BOGO").

**Fix:** render the list only once the module isn't pending
(`pending.includes( id )`), or reload the list after the status save.
`[BUG]` tests in `bogo-admin.spec.ts` and `order-bump-admin.spec.ts` are `test.fail`.

## #11 — BOGO: `bogo_deal_type` and `offer_type` accept any value

`BogoController` declares `enum: [same, different]` for `bogo_deal_type` with a
`sanitize_callback` and no `validate_callback`, so WordPress never checks it:
`POST sales-booster/v1/bogo/offers` with `bogo_deal_type: "other"` answers 201
and stores it (the storefront reads it as Buy X Get Y). `offer_type` has no enum
at all: `"percentage"` is stored and the cart prices the gift FREE (only
`discount` is discounted), so a typo gives the product away. Admin-only (the
editor sends valid values); third-party REST clients are exposed.

**Fix:** `'validate_callback' => 'rest_validate_request_arg'` (and an enum for
`offer_type`: `free`, `discount`). `bogo-rules.api.spec.ts` "[BUG] an unknown deal
type" is `test.fail`; `pricing-characterisation.spec.ts` records the
`offer_type` behaviour.
