# Findings from building the test suite

Issues and noteworthy behaviours discovered while validating the plugin against
the automated suite. Each lists the impact and how the tests account for it.
None of these block the suite — it is green — but they are worth a maintainer's
attention.

---

## #1 — Settings SPA has no index route; bare `?page=spsg-settings` is unstable

**What:** The Settings app is a HashRouter SPA with **no index/default route**.
Visiting the bare admin URL `admin.php?page=spsg-settings` does not land on a
stable page:

- With one or more modules active, it resolves to the **first active module's**
  route (e.g. `#/bogo`).
- With **zero modules active**, it instead bounces to the **Modules** screen.

The plugin's own menu link works around this by always deep-linking
`admin.php?page=spsg-settings#/dashboard/overview`.

**Impact:** Any caller (or test) that links to the bare slug gets
non-deterministic landing behaviour. The original `settings.spec.ts` +
`gotoAdminPage('spsg-settings')` failed for exactly this reason.

**Test handling:** `helpers/wp-admin.ts` adds `gotoSettings()`, which deep-links
`#/dashboard/overview` (the supported entry point). `settings.spec.ts` documents
the bare-slug behaviour explicitly.

**Suggested fix:** add an index route that redirects `#/` →
`#/dashboard/overview` so the bare slug is always stable.

---

## #2 — `update_module_status` is a non-atomic read-modify-write of one option

**What:** All module on/off state lives in a single option,
`spsg_active_module_ids`. `Ajax::update_module_status()` (and
`BaseModule::activate()/deactivate()`) **read the whole option, mutate it in
PHP, then write it back**. There is no locking.

**Impact:** Two concurrent toggles of *different* modules race — the second
write clobbers the first. Reproduced reliably by running the UI suite with
multiple workers: activating Countdown Timer in one worker while another worker
toggled a different module silently deactivated Countdown Timer, so its
settings-ajax action (registered only while active) returned `400`.

In production this is a narrow window (an admin would have to toggle two modules
in the same instant), but it is a genuine data-race on shared state.

**Test handling:** `playwright.config.ts` runs `workers: 1` /
`fullyParallel: false`. The suite is fast, so the cost is negligible. Each
toggling spec also owns a **distinct** module to keep intent clear:

| Spec | Module it toggles |
| --- | --- |
| `storefront-stock-bar.spec.ts` | Stock Bar |
| `storefront-fly-cart.spec.ts` | Fly Cart |
| `storefront-quick-view.spec.ts` | Quick View |
| `modules.spec.ts` | Direct Checkout, Floating Bar |
| `module-ajax.spec.ts` | Sales Notification |
| `settings-persistence.spec.ts` | Countdown Timer |

`bogo` and `upsell-order-bump` are baseline-active and never toggled.

**Suggested fix:** guard the read-modify-write (e.g. an option lock / atomic
update), or store per-module state in distinct options.

---

## #3 — Application Passwords are refused over plain HTTP

**What:** Not a plugin bug — standard WordPress behaviour — but it bites the test
env. `wp_is_application_passwords_available()` returns `false` on a non-SSL site
unless `WP_ENVIRONMENT_TYPE` is `local`/`development`, so Basic-auth via an
Application Password 401s on `http://localhost`.

**Test handling:** Provisioning sets `WP_ENVIRONMENT_TYPE=local` **and** installs
the WP-API Basic-Auth plugin, so the API project authenticates with the plain
admin username/password (`helpers/env.ts`). No Application Password needed.

---

## #4 — WooCommerce "Coming soon" blocks the storefront by default

**What:** Again WooCommerce behaviour, not the plugin. A fresh WooCommerce
install defaults `woocommerce_coming_soon = yes`, which 503s the storefront for
non-admin visitors — breaking any storefront assertion.

**Test handling:** Provisioning sets `woocommerce_coming_soon = no` (and
`woocommerce_store_pages_only = no`) so the shop/product/cart pages are public.

---

## #5 — Free-shipping banner is server-rendered but removed at runtime

**What:** Free Shipping Rules (progressive-discount-banner) outputs
`.spsg-pd-banner-bar-wrapper` server-side via `wp_footer`, but it is gone from
the live DOM after the page's JS runs — even for a brand-new guest with a valid
config. The only durable signal is the body class `show_discount_banner`.

**Impact:** Without a configured WooCommerce free-shipping threshold the bar does
not actually display to shoppers. Storefront tests assert the body class +
settings round-trip; full visual coverage needs a configured free-shipping
method (zone + method + minimum) — a good follow-up.

---

## #6 — Sales Notification fatals the storefront when configured (real bug)

**What:** `modules/sales-pop/includes/EnqueueScript.php` line ~90 runs
`explode( "\n", $virtual_locations )`, but `$virtual_locations` is an **array**
unless explicitly supplied as a string. `Ajax::form_validation()` defaults it to
`array()`, so the normal save path stores an array. Result on every storefront
page load while Sales Notification is enabled:

```
PHP Fatal error: Uncaught TypeError: explode(): Argument #2 ($string) must be of
type string, array given in .../sales-pop/includes/EnqueueScript.php:90
```

There is also an `Undefined array key "external_link"` warning at line ~64
(accessed without `isset`).

**Impact:** Configuring Sales Notification through its own UI breaks the
storefront (the popup script never loads; the page errors). It only works if
`virtual_locations` happens to be a string.

**Test handling:** the positive spec supplies `virtual_locations` as a string
(works); a `test.fail()` documents that the array form must not crash (currently
does). Asserts on the `popup-custom.js` enqueue as the clean boot signal.

**Suggested fix:** cast/guard before `explode` (e.g.
`is_array( $virtual_locations ) ? $virtual_locations : explode( "\n", (string) $virtual_locations )`),
and `isset()`-guard `external_link`.

---

## #7 — Order Bump only renders on the classic checkout

**What:** Upsell Order Bump renders via
`add_action( 'woocommerce_review_order_before_submit', ... )`
(OrderBump.php) — a **classic shortcode-checkout** hook. The block checkout
(WooCommerce's default since 8.3) never fires it, so the bump never appears on a
default store.

**Impact:** On a stock modern WooCommerce install (block checkout) the order
bump silently does nothing on the front end.

**Test handling:** provisioning sets the checkout page to the
`[woocommerce_checkout]` shortcode so the feature is exercisable; the spec then
asserts the bump (`.offer-main-wrap`) appears for a matching cart.

**Suggested fix:** add a block-checkout integration (an Integration/Block or a
`woocommerce_blocks_checkout_block_registration`) so the bump works on the
default checkout too.

---

## Notes on storefront coverage

Three modules render markers with **no configuration** and are covered with full
activate → assert → deactivate storefront specs (markers verified live under the
Storefront theme):

- **Stock Bar** → `.spsg-stock-bar` on the single product page.
- **Fly Cart** → `.wfc-cart-icon` site-wide.
- **Quick View** → `.spsgqcv-btn` per product in the shop loop.

These render **nothing until configured** (per-product meta, bar content, popup
product list, or cart contents), so they are *not* asserted on the storefront to
avoid false negatives. They are instead covered at the settings/ajax layer
(Countdown Timer round-trip) and via the module toggle + REST surface:

- Countdown Timer (needs `_spsg_countdown_timer_discount_*` product meta)
- Direct Checkout (replaces the add-to-cart button under conditions)
- Floating Bar (needs configured bar content)
- Sales Notification (needs a configured popup product list)
- Free Shipping Rules / progressive-discount-banner (needs rules + cart items)

Extending storefront coverage to these means seeding their config first — a good
next step.
