# Module analytics: implementation plan

Plan for the revenue and engagement reports described in the spec "StoreGrowth Module Analytics: Capture and Storage Spec" (Oct 1, 2026). This plan covers **phase 1: four modules** that can show money they produced:

| Module (marketing name) | Module id (use in code, tables, REST) |
|---|---|
| BOGO | `bogo` |
| Upsell Order Bump | `upsell-order-bump` |
| Countdown Timer | `countdown-timer` |
| Free Shipping Bar | `progressive-discount-banner` |

The other six (Direct Checkout, Quick View, Fly Cart, Sales Notification, Floating Bar, Stock Bar) reuse the same foundation later and are listed at the end.

**Approach in one line:** money comes from **WooCommerce Analytics** (its lookup tables, joined to our order-line keys), counts come from **one small table of our own**, and StoreGrowth figures also appear **inside WooCommerce's own Analytics reports**.

The design is recorded as [ADR-012](../adr/ADR-012-module-analytics.md); §8 is the decision list it was written from.

---

## 1. What exists today

### 1.1 In StoreGrowth

| Piece | Where | State |
|---|---|---|
| Line keys `_spsg_campaign_id`, `_spsg_campaign_type`, `_spsg_reward_type`, `_spsg_discount_value` | `includes/Attribution/OfferAttribution.php` | Shipped in 2.2.0. Copied from cart item to order line on `woocommerce_checkout_create_order_line_item` (classic and blocks). CRUD API, HPOS-safe. Since 2.2.0, a line with `_spsg_campaign_id` always means a **reward** line. |
| Order-level record `_spsg_influencing_offers` (JSON) | `OfferAttribution::record_influencing_offers()` | Shipped in 2.2.0. Keep as is (ADR-004). |
| BOGO gift stamp, auto-add | `modules/bogo/includes/OrderBogo.php:536` (`apply_bogo_product`) | Stamped; sets `linked_to_product_key`. |
| BOGO gift stamp, manual add | `modules/bogo/includes/Ajax.php:384` (`offer_product_add_to_cart`) | Stamped; **no** `linked_to_product_key`. |
| BOGO gift stamp, gift swap | `modules/bogo/includes/Ajax.php:163` (`handle_update_offer_product`) | Stamped; `linked_to_product_key` taken from the browser unchecked; `intval()` on the md5 cart key (`Ajax.php:58`), which is a bug. |
| BOGO gift stamp, Pro "Buy X Get X" | `storegrowth-sales-booster-pro/includes/Modules/BoGo/BoGoPro.php:266` | Stamped (guarded by `method_exists`). |
| BOGO trigger product | gift cart item's `linked_to_product_key` → trigger cart key | **Not stamped.** Link exists only in the cart. |
| Order Bump stamp | `modules/upsell-order-bump/includes/OrderBumpAjax.php:180` (`find_offer`) | Stamped. |
| Order Bump accept / remove | `wp_ajax(_nopriv)_upsell_offer_product_add_to_cart` | One handler for classic **and** blocks (`src/storefront/blocks/order-bump-template.tsx` posts to it, then reloads the page, line 46). |
| Order Bump render | classic: `woocommerce_review_order_before_submit` (`OrderBump.php:54`), re-runs on every checkout refresh; blocks: React | No view counting. |
| Cart prices for BOGO / bump | `set_price()` in `woocommerce_before_calculate_totals` (`OrderBogo.php:886`, `OrderBump.php:322`) | The countdown price filter still runs on top of these prices. |
| Countdown discount | `modules/countdown-timer/includes/CommonHooks.php` `get_product_price()` (view context only); window check `Helper::is_product_discountable()` | `intval()` % taken off whatever price earlier filters produced. Nothing recorded on the order. |
| Countdown markup | `modules/countdown-timer/templates/countdown-timer.php:98` | No `data-` hooks for tracking. |
| Free Shipping Bar, discount mode | `modules/progressive-discount-banner/includes/WoocommerceDiscount.php:151` | **Negative fee** `spsg-pd-banner-discount`, name "Discount", non-taxable (fees API default). Tax is still correct: WooCommerce splits a negative fee's tax across the cart's items "so it works as a true discount" (`class-wc-cart-totals.php:300`); checked on the dev site, a $10 fee on a $100 cart at 10% gives fee tax −1.00, products taxed on $90. Fee lines don't reach WC Analytics' product table, and Dokan doesn't copy them to sub-orders. |
| Free Shipping Bar, free-shipping mode | same file, `set_free_shipping()` | Only **pre-selects** an existing WC `free_shipping` rate on add-to-cart. Does not grant free shipping. |
| Dashboard revenue slot | `includes/REST/DashboardController.php:93` | `revenue => null`, filter `spsg_dashboard_overview`. |
| Shared storefront JS | `assets/js/storefront-core.js` (`window.spsgStorefront`) | No tracking. |
| Table install / uninstall | modules' own `create_table()`; `Uninstaller::tables()` (line 125) | Pattern to copy. `Upgrader` (WPKit) migrations are notice-driven. |

### 1.2 In WooCommerce Analytics (checked on WooCommerce 11.1.2)

| Piece | What it gives us |
|---|---|
| `wc_order_product_lookup` | One row per order line (`order_item_id`, `order_id`, `product_id`, `variation_id`, `product_qty`, `product_net_revenue`, `product_gross_revenue`, `coupon_amount`, `date_created`). Pending, failed and checkout-draft orders are imported too; only `auto-draft`, `trash` and test orders are skipped. |
| Refund rows | `order_id` = the refund. **Line refund:** `order_item_id` = the refund line, which carries `_refunded_item_id`; qty `-n` (may be `0` for an amount-only line refund); `coupon_amount` 0. **Full refund** (WC ≥ 10.2, `_refund_type = full`): the parent's own item ids under the refund's `order_id`, no `_refunded_item_id`, qty `-abs(original qty)` even after earlier refunds; lines with net revenue 0 (a free gift) are skipped (`Products/DataStore.php:487-569`). **Refund with no lines ticked:** no line rows. |
| `wc_order_stats` | One row per order and per refund (`parent_id` links a refund to its order): `status`, `date_created`, `date_paid`, `date_completed`, `net_total`, … |
| Revenue columns | `product_net_revenue` = line total after coupons, excl. tax (`Products/DataStore.php:546`). `coupon_amount` = this line's share of coupons (`:544`; `0` on refund rows). `product_gross_revenue` = net **+ tax + shipping share** (`:621`), so it is not "before coupons" and isn't used here. |
| `wc_order_coupon_lookup` | Coupon discount per order, keyed by coupon post id; not reduced by refunds (`Coupons/DataStore.php:395-398`). A coupon with no post gets a per-order placeholder id (`-1`, …). Not used by this plan (§3.4 keeps the fee). |
| Sync | Background, through Action Scheduler. On stores installed before WC 10.5 it runs on each order change; on newer installs `woocommerce_analytics_scheduled_import = yes` and imports run **every 12 hours** (`OrdersScheduler::get_import_interval()`). This site is `no`. `woocommerce_analytics_update_product` / `_update_order_stats` fire after each update. |
| Merchant settings | "Excluded statuses" (`woocommerce_excluded_report_order_statuses`, default pending, failed, cancelled); WooCommerce always adds `auto-draft` and `trash`, then applies filter `woocommerce_analytics_excluded_order_statuses` (blocks adds `checkout-draft`) (`Reports/DataStore.php:844-858`). `wc_order_stats.status` is stored with the `wc-` prefix; the option values aren't. "Date type" (`woocommerce_date_type`: paid / created / completed) is used by the Orders reports; the Products report always uses the lookup's `date_created`. |
| History | "Import historical data" tool (Analytics → Settings) fills the tables for old orders. |
| Extension points | SQL: `woocommerce_analytics_clauses_{join,where,select}_{context}` (`src/Admin/API/Reports/SqlQuery.php:115-121`). Menu: `woocommerce_analytics_report_menu_items`. UI: WC Admin JS filters for report filters and table columns. |
| On / off | `woocommerce_analytics_enabled` option (`yes` here). Off → lookup tables stop updating. |
| Dokan | `dokan_order_stats` (`order_id`, `vendor_id`, `order_type`: 0 parent, 1 single-vendor, 2 sub-order, 3/4/5 their refunds, 6-9 ads and subscriptions). Dokan's Analytics filter (`dokan-lite/includes/Analytics/Reports/BaseQueryFilter.php`) keeps reports to types 1, 2, 4, 5, so nothing is counted twice. Sub-orders copy all line meta (`Manager.php:693-697`), so our keys are there. Gap (Dokan's own): a refund made directly on a parent order without Dokan Pro is type 3 only and drops out; Pro mirrors sub-order refunds to the parent (`dokan-pro/includes/Refund/Refund.php:864-872`). Orders Dokan never synced are dropped by the join, as in Dokan's reports. |
| Currency | No currency column: WC Analytics assumes one store currency. |

**What this gives us:** WooCommerce already handles line refunds, paid → cancelled → paid, re-sync on edits, history import and Dokan double counting. The plan doesn't rebuild any of it, so **there is no money table of our own**. Its limits (refund rows' shape, 12-hour lag on new stores, refunds with no lines) are handled in §2.3.

---

## 2. Foundation (phase 0, before any module)

All new PHP under `includes/Analytics/` (`StorePulse\StoreGrowth\Analytics\`), registered in `CommonServiceProvider` with `share_with_implements_tags()`.

### 2.1 Order-line keys (the only money data we write)

Written at checkout in `woocommerce_checkout_create_order_line_item` (both checkouts pass `$cart_item_key`, `$values` and `$order`), by `OfferAttribution`, except the countdown keys: those are written by the Countdown Timer module's own `OrderAttribution` (priority 20), registered only while the module is active. `Helper::is_product_discountable()` reads post meta and stays true when the module is off, but then no timer price is charged. Product ids are taken from `$values['data']->get_id()` (the variation id when there is one), because the countdown meta is saved per variation.

| Key | On | Value |
|---|---|---|
| `_spsg_campaign_id`, `_spsg_campaign_type`, … | reward lines (BOGO gift, bump) | Unchanged from 2.2.0. |
| `_spsg_trigger_campaign_id` *(new)* | BOGO trigger line | e.g. `bogo:12`. A new key because `_spsg_campaign_id` is written with `unique = true`, so a product added as a bump that also triggers a BOGO gift would lose `order_bump:3`. |
| `_spsg_reference_price` *(new)* | reward lines; countdown lines at 100% | Unit price the shopper would have paid without any StoreGrowth discount, **excl. tax**, through `wc_get_price_excluding_tax( $product, [ 'price' => … ] )`. When no timer is live: fresh `get_price()`, so other price filters (currency switchers, role pricing) stay in. When a timer is live: `get_price( 'edit' )`, which skips the countdown filter (`get_prop()` ignores getter filters in edit context). The whole gap then goes to the reward module (precedence). |
| `_spsg_countdown_pct` *(new)* | countdown lines | The `intval` % in force, only when `0 < p ≤ 100` (the filter doesn't range-check, `CommonHooks.php:131-134`), `Helper::is_product_discountable()` is true, and `$values` has no `_spsg_campaign_id` (precedence `reward` > `discounted`). |

**Roles vs. flags:** a line has one **role** for the total, `reward` or `discounted`. `trigger` (and later `assisted`) are **flags** on top. A BOGO trigger line with a live timer counts once in the total as `discounted`, and also shows on the BOGO report as a trigger.

**Fee lines lose their id.** A fee added in `woocommerce_cart_calculate_fees` becomes an order fee item that keeps only `name` ("Discount"), amount and tax (`class-wc-checkout.php:615-626`). The fee id `spsg-pd-banner-discount` lives only in the deprecated, unsaved `legacy_fee_key` property. So after the order, nothing says the discount came from StoreGrowth, or why. It is tagged at checkout instead:

| Fee-item key *(new)* | Value |
|---|---|
| `_spsg_campaign_type` | `progressive_discount` (same key name as other StoreGrowth lines) |
| `_spsg_fsb_threshold` | Threshold in force (`cart_minimum_amount`) |
| `_spsg_fsb_mode` | `fixed-amount` or `percentage` |
| `_spsg_fsb_value` | The configured amount or % |
| `_spsg_fsb_subtotal` | Cart subtotal that qualified |

- Written in `woocommerce_checkout_create_order_fee_item` when `$fee_key === WoocommerceDiscount::FEE_ID` (`spsg-pd-banner-discount`). The hook fires in both checkouts with the fee id as `$fee_key` (`class-wc-checkout.php:634`, `OrderController.php:857`). As built, the writer is the module's own `ProgressiveDiscountBanner\OrderAttribution` (like the countdown keys), registered only while the module is active, not `OfferAttribution`.
- **Item meta can't go stale.** Both checkouts reuse a draft order and recreate its fee lines (`OrderController.php:854-858`, `class-wc-checkout.php:425`). The tag is created and removed together with the fee line, so the order never keeps a tag the cart no longer earns. The blocks checkout recreates fee lines only when the fees change (`_fees_hash`), so a fixed discount kept while the cart changed would keep an old subtotal: the order-level pass below refreshes `_spsg_fsb_subtotal` on a tagged fee line.
- The discount amount is the fee item's own total (`abs( $item->get_total() )`); no copy is needed.

| Order key | On | Value |
|---|---|---|
| `_spsg_fsb_threshold` *(new)* | orders that met the bar threshold in **free-shipping mode** (no fee line to tag) | The threshold in force. |

This order key is **set or deleted on every checkout pass** from the cart subtotal, on the same two hooks `OfferAttribution` already uses (`woocommerce_checkout_create_order`, `woocommerce_store_api_checkout_update_order_from_request`), by the module's `OrderAttribution::record_order()`. It is deleted in discount mode too, so a mode change between passes leaves nothing behind. Otherwise a value written earlier would stay when the cart drops below the threshold.

Refund lines don't carry these keys. Line refunds point back with `_refunded_item_id`; full-refund rows reuse the original item id (§2.3).

**Subscriptions:** our keys are **never written to subscriptions.**
- `copy_stamp_to_order_item` and the new key writers take the hook's 4th argument (`$order`, `class-wc-checkout.php:598`) and return early when `'shop_subscription' === $order->get_type()`. WooCommerce Subscriptions creates subscriptions through `create_order_line_items()` (`class-wc-subscriptions-checkout.php:194`), and every renewal path copies from the subscription's items, including cart renewals, early renewals and resubscribes, which bypass `wcs_new_order_items` (`class-wcs-cart-renewal.php:293-325`).
- Subscriptions created on 2.2.0 already carry the 2.2.0 keys. Strip them on `wcs_new_order_items` (`wcs-order-functions.php:245`, renewal and resubscribe orders) as a fallback. That filter receives the subscription's own items, which are saved afterwards, so the subscription is cleaned for good, which is intended.
- No read-time filtering on `created_via` (it would also drop Dokan sub-orders, `created_via = 'dokan'`).

### 2.2 Measuring the discount

The 2.2.0 `_spsg_discount_value` is computed at **add-to-cart**. Prices change before checkout, the countdown filter stacks on BOGO and bump prices, and `get_price()` may include tax. It stays as is (ADR-004) but is no longer the source of truth. Discounts are measured per line from what WooCommerce recorded.

A coupon's saving isn't counted as ours: the line's `subtotal` (before coupons, excl. tax) is what the module charged.

Each line gets a **discount per unit**, worked out once from the original line (its `subtotal` is what it was charged before coupons, excl. tax; `unit = subtotal ÷ qty`) and stored on every lookup row of that line (§2.3). A row's discount is `unit_discount × product_qty`, so refund rows (negative quantity) subtract their share and amount-only refunds (quantity 0) leave it.

| Role | Discount per unit (excl. tax) |
|---|---|
| `reward` (gift, bump) | `max( 0, reference − unit )`. |
| `discounted` (countdown) | `unit × p ÷ ( 100 − p )`, `p = _spsg_countdown_pct`. At `p = 100`: `reference`. |
| Free Shipping Bar | Not per unit: `abs( total )` of the fee item tagged `_spsg_campaign_type = progressive_discount` (§2.1). |
| `trigger` | No discount; shown as revenue on the BOGO report only. |

**Revenue** = `SUM( product_net_revenue )` over the line's rows (after coupons and refunds, excl. tax), what the store actually kept.

**Fully refunded orders** (`wc-refunded`) are left out entirely: no revenue, no discount. This covers what WooCommerce's full-refund rows miss (free gifts skipped, qty not netted for earlier refunds) and the bar fee, which has no line rows.

**Known gaps, documented in the report help:**
- A partial refund made for an amount with no lines ticked has no line rows. It reduces order totals in WooCommerce but not our per-line figures; WooCommerce's own Products report behaves the same.
- The bar discount isn't reduced by partial refunds.

**Orders from before this release** have no reference price: the discount per unit is `_spsg_discount_value`, and the row is marked `approximate`.

### 2.3 Reading money: offer lookup + WooCommerce report data stores

Built the way dokan-lite extends WooCommerce Analytics (`dokan-lite/includes/Analytics/Reports/`): Dokan keeps `dokan_order_stats` in step with WooCommerce's import and joins it into WooCommerce's report queries.

**`spsg_offer_lookup`** (`Analytics\Schema`): one row per row of WooCommerce's `wc_order_product_lookup` (same key, `order_item_id` + `order_id`), for lines a module touched.

| Column | Value |
|---|---|
| `order_item_id`, `order_id` | The WooCommerce row's key (a refund line / the refund for refund rows). |
| `root_item_id` | The original order line. |
| `module`, `role` | e.g. `bogo` / `reward`, `countdown-timer` / `discounted`; empty role on trigger-only lines. |
| `campaign_id`, `trigger_campaign_id` | From the line keys. |
| `unit_discount` | §2.2, from the original line. |
| `approximate` | 1 when worked out from the 2.2.0 stamp. |

**Sync** (`Analytics\OfferLookup`):
- `woocommerce_analytics_update_product( $order_item_id, $order_id )`: WooCommerce fires it for each row it imports, order and refund. The row's original line is the item itself, or the line `_refunded_item_id` points at; full-refund rows reuse the original item id. A row is written with `REPLACE`; a line without keys has its row removed.
- `woocommerce_analytics_delete_product( 0, $order_id )` removes an order's rows.
- **Table creation goes through the upgrade notice:** an update creates the table when the admin runs the database upgrade (`Migrations\V_3_0_0`, through `Upgrader` / WPKit). A fresh install creates it on activation, since `Upgrader` stamps it at the current version and it never sees the notice. Until the table exists (`Schema::is_installed()`), the sync writes nothing and the report returns a `spsg_analytics_not_installed` error. Orders imported meanwhile are picked up by the backfill (step 2), which the upgrade starts.
- Rows of lines WooCommerce drops without a hook stay behind but join to nothing.

**Reports** (`Analytics\Reports\Offers\Stats\DataStore`) extend WooCommerce's `Products\Stats\DataStore`:
- Its clauses are narrowed with a join on `spsg_offer_lookup`, and a `discount` column is added: `SUM( unit_discount × product_qty )`.
- WooCommerce supplies totals and intervals, the merchant's excluded statuses (the option, `auto-draft`, `trash`, the `woocommerce_analytics_excluded_order_statuses` filter), refund rows (WooCommerce copies the order's status onto them), paging and the report cache keyed by the query args.
- Extra query args: `spsg_module`, `spsg_campaign`, `spsg_role` (default `reward` + `discounted`, the StoreGrowth total; `trigger` for BOGO trigger lines).
- Orders in `wc-refunded` are left out (§2.2).
- **Date:** the order's `date_created`, as WooCommerce's Products report uses (not the "Date type" setting, which only WooCommerce's Orders reports follow).
- **Dokan:** while Dokan is active, join `dokan_order_stats` with Dokan's own `OrderType::get_vendor_order_types()`, the types Dokan's Products report counts. Checked on the dev site: a parent order (type 0) is left out, its sub-order (type 2) counted. The bar's fee lives on the parent (fees aren't copied to sub-orders).
- **Lag:** on stores with scheduled import, figures can be up to 12 hours behind.

**Limits, documented in the report help:**
- `segmentby=product` returns segments without `discount`: WooCommerce's Products Segmenter uses its own column list. A Segmenter subclass comes with the per-product view (step 4).
- `spsg_role = trigger` reads trigger lines only; its `discount` column is the countdown discount on those lines, if any, not an offer cost.
- An order moved off `refunded` after a partial and then a full refund keeps WooCommerce's `-abs(qty)` full-refund rows, so its discount (like WooCommerce's `items_sold`) can go negative.

**Backfill** (`Analytics\Backfill`): orders imported before the table existed (2.2.0 orders, and orders placed before the admin ran the upgrade) have no lookup rows. The upgrade (`V_3_0_0::queue_offer_backfill()`) queues the Action Scheduler action `storegrowth_analytics_backfill` (group `storegrowth`). Each batch of 50 orders whose lines carry StoreGrowth keys (one query on `woocommerce_order_itemmeta`, by order id) re-syncs WooCommerce's product rows with the public `Products\DataStore::sync_order_products()`, for the order and its refunds, which fires the sync. The next batch is queued after it.

### 2.4 Counts table (views, clicks)

WC Analytics has nothing for views, so we keep one table.

**`{prefix}spsg_analytics_daily`**

| Column | Type | Note |
|---|---|---|
| `day` | `DATE` | Store timezone (`wp_date()`). |
| `module` | `VARCHAR(40)` | Module id. |
| `metric` | `VARCHAR(40)` | `view`, `click`, `dismiss`, `accept`, `remove`, `swap`, `add_to_cart`, `reached` (Free Shipping Bar threshold), … |
| `object_type` | `VARCHAR(20)` | `campaign`, `product`, or `module` (`Counter::MODULE`, a widget with no campaign: the Free Shipping Bar). |
| `object_id` | `BIGINT UNSIGNED` | Offer row id or product id; `0` for `module`. |
| `count` | `INT UNSIGNED` | |

Primary key `(day, module, metric, object_type, object_id)`. Writes are `INSERT … ON DUPLICATE KEY UPDATE count = count + VALUES(count)`.

- Created by `Analytics\Schema::install()` with `dbDelta()`, the same way as the lookup table: from the upgrade notice's migration on an update, on activation on a fresh install. Writers no-op until it exists.
- Use `$wpdb->get_charset_collate()` and dbDelta's formatting rules.
- Add it to `Uninstaller::tables()`; drop on `wpmu_drop_tables`.
- `Analytics\Counter::bump( $module, $metric, $type, $id, $n = 1 )` writes it from PHP (bump accept/remove, BOGO swap, threshold reached).

### 2.5 Storefront tracker

- `assets/js/storefront-tracker.js`, plain JS (ADR-005), handle `spsg-storefront-tracker`, adds `window.spsgStorefront.track( module, metric, objectType, objectId )`.
- Scans `[data-spsg-track]` (with an `IntersectionObserver` for real views). Markup example: `data-spsg-track="bogo" data-spsg-object="campaign:12"`.
- **One view per browser session per object** (`sessionStorage`, in try/catch), the same rule as the server-side counts.
- Opt-in `data-spsg-track-add-to-cart` on a `product:{id}` element also counts `add_to_cart` of that product, once per session like a view: from the `form.cart` submit (when not cancelled) and WooCommerce's jQuery `added_to_cart` event (§3.3).
- Queued in memory, sent once on `pagehide` / `visibilitychange` with `navigator.sendBeacon`. No cookies, no visitor id; works on cached pages.
- Endpoint `POST sales-booster/v1/analytics/track` (REST first, ADR-006), `permission_callback` `__return_true`, no nonce (cached pages can't carry one, and the shared nonce is public anyway). Assume it is spammable:
  - Allow-list of modules and metrics.
  - Validate each id (existing offer row or published product).
  - Cap each batch (e.g. 50 events, count ≤ 5 per key).
  - Per-IP rate limit only when `wp_using_ext_object_cache()`. Without an object cache, transients become `wp_options` writes, and behind a CDN everyone shares an IP.
- Counts are labelled as estimates. Stores that block REST for logged-out visitors get none; the report says so when counts stay at zero while orders exist.

### 2.6 Showing it

**Our own Analytics page** (decided Oct 8, 2026: its own page, not a dashboard tab): StoreGrowth → Analytics, `admin.php?page=storegrowth#/analytics` (ADR-008), `src/admin/pages/analytics/`, plugin-ui. No design reference yet; built from the dashboard's tiles.
- `GET sales-booster/v1/analytics` (`Analytics\AnalyticsController`) takes `days` (the last N days, worked out in store time; what the page sends) or `after` / `before` (`Y-m-d`, validated). It returns status (installed, WooCommerce Analytics on, Pro, currency and WooCommerce's price format, the range), totals, one interval per day, per module (money, counts, BOGO trigger revenue, Order Bump and BOGO take rates) and per campaign with names. Money comes from the offer report data stores (§2.3): stats, and rows per campaign (`Reports\Offers\DataStore`); counts from the counts table.
- Revenue per day by offer is a line chart: plugin-ui's chart frame (`ChartContainer`, tooltip and legend content) around a recharts `LineChart` (`recharts` is a dependency of its own; plugin-ui exports only the frame). One line per module (Order Bump, BOGO, Countdown Timer) from each interval's `modules`, with a legend and every line's revenue on hover; straight segments. BOGO's line is gifts plus trigger products, so the lines don't add up to the total.
- Permission `manage_woocommerce`, so a shop manager can read the report through REST; the StoreGrowth menu itself stays `manage_options`, like the other pages.
- Fills `revenue` in `spsg_dashboard_overview` (last 30 days; left `null`, shown as "—", while WooCommerce Analytics is off).
- Lite/Pro limits enforced **on the server** (`sp_store_growth()->has_pro()`): Lite reads at most the last 30 days, for `after` and `before` alike, never past today, and the top 3 campaigns. `spsg_analytics_report` lets Pro add longer ranges, every campaign, comparison, CSV and per-vendor.
- **Empty states:**
  - Database update not run: a message pointing at the notice.
  - WooCommerce Analytics off: a notice with a link to WooCommerce's Features settings; the counts (views) still show, no money is read.
  - No offer revenue or orders in the range: a message in the chart and the campaigns cards.
  - Old orders missing: the backfill (§2.3) fills them after the upgrade.

**Inside WooCommerce Analytics** (where merchants already look). Built Oct 8, 2026 (step 9 moved up; decision 7). `Analytics\WcAnalytics`, `Analytics\OffersStatsController`, bundle `src/wc-analytics/` (`build/wc-analytics.js`, only on WooCommerce admin pages; WooCommerce's components draw it, no plugin-ui there):
- A **"StoreGrowth offer"** filter (All / Any offer / Order Bump / BOGO / Countdown Timer) on the **Orders** and **Products** reports. Pieces:
  - JS: a report filter dropdown (`woocommerce_admin_{orders,products}_report_filters`, param `spsg_offer`); WooCommerce sends the param with the chart and table requests.
  - REST: the report controllers drop unknown params, so `spsg_offer` is read from the request URL and added through `woocommerce_analytics_{orders,orders_stats,products,products_stats}_query_args`, which also puts it in WooCommerce's cache key (Dokan's `CacheKeyModifier.php` does the same). Values outside the list are ignored.
  - SQL: `woocommerce_analytics_clauses_where_*` for the table contexts (`orders_subquery`, `products_subquery`) and the chart contexts (`*_stats_total`, `*_stats_interval`). Orders: `order_id IN ( lookup )`, a subquery so an order with several offer lines counts once, and whole orders are kept, with their refunds (`parent_id IN ( lookup )` and a negative `total_sales`; Dokan sub-orders also have a parent but are never negative). Products: `( order_item_id, order_id ) IN ( lookup )`, only the offer lines; refund rows have their own lookup rows, so they follow. BOGO trigger lines (`module = ''`) aren't offer lines here, as on our BOGO card.
  - CSV export: an export has no URL params, so the filter is read from its `report_args`, in the export request (`rest_request_before_callbacks`, which counts the rows) and in each batch (`woocommerce_admin_report_export`).
- An **"Offer" column** on the Orders report: the modules each order had offers from, in one query per page (`woocommerce_analytics_orders_select_query`), kept in the response (`woocommerce_rest_prepare_report_orders`), drawn by `woocommerce_admin_report_table`, and in the CSV (`woocommerce_report_orders_export_columns` / `_prepare_export_item`).
- **Overview indicator "StoreGrowth offer revenue"**: `GET wc-analytics/reports/spsg-offers/stats` (WooCommerce's report permission), listed through `woocommerce_admin_reports` with no report link; its `net_revenue` total is marked `indicator`, so it's in the Performance section (the merchant can hide or move it there). Same figure as our page's revenue for the range, without Lite's 30-day limit (WooCommerce's own reports have none).
- **Dokan vendors:** the offer data stores apply Dokan's vendor rule (`spsg_vendor`, filled by `OfferQuery::scoped_args()` from Dokan's `QueryFilter::get_vendor_id()` and part of the cache key): a vendor reads only their orders, an admin the vendor picked in Dokan's filter (`sellers`). Dokan vendors see the indicator on their own reports with their own figure.
- No separate StoreGrowth page under the Analytics menu: ADR-008 keeps one admin page.

---

## 3. Per module

### 3.1 BOGO (`bogo`)

**Prerequisite fix (separate commit, step 0):**
- `handle_update_offer_product()`: keep the cart key a string (`sanitize_key()`, not `intval()`, `Ajax.php:58`). The template sends the md5 `parent_key` (`bogo-offer-products-popup.php:53`), which Pro also reads (`BoGoPro.php:191`), and the bad key is reused for `child_key` (`Ajax.php:186`).
- Check the browser-sent `product_link_key` (`Ajax.php:60`) against `WC()->cart->cart_contents`.
- Set `linked_to_product_key` on the manual add path (`Ajax.php:374`), finding the trigger the way `resolve_bogo_settings_for_gift()` finds the offer.

**Build (as built, step 5):**
- Trigger key at checkout: if a gift line in the cart has `linked_to_product_key` equal to this line's cart key, write `_spsg_trigger_campaign_id`. Use `linked_to_product_key`, never `parent_key`.
- `_spsg_reference_price` on gift lines.
- Offer views: the offer box (`.offer-main-wrap`) in `templates/bogo-product-front-view.php` and `bogo-product-meta-front-view.php` carries `data-spsg-track="bogo" data-spsg-object="campaign:{id}"` (the offer row id, product or global offer). `OrderBogo::display_bogo_offer()` enqueues `spsg-storefront-tracker` as it draws a box, so the tracker loads (in the footer) only on pages that show an offer. `TrackController` takes `bogo` / `view` / `campaign` for an offer row that exists (`BogoDataManager::get_bogo_offer()`, any status). A box drawn later by ajax (Quick View) isn't seen by the tracker's page-load scan, so it isn't counted.
- Gift swaps: `Counter::bump( 'bogo', 'swap', 'campaign', $id )` after a successful swap (`Ajax::handle_update_offer_product()`).
- Gifts added: `Counter::bump( 'bogo', 'add_to_cart', 'campaign', $id )` when a new gift line goes in, automatically (`OrderBogo::apply_bogo_product()`; a quantity update of an existing gift isn't counted) or from the popup (`Ajax::offer_product_add_to_cart()`). Returned in the report's counts; not drawn yet.

**Report:** the BOGO card shows gift revenue, take rate (orders with a gift ÷ offer views, estimated; `take_rate`, as for Order Bump), views (estimated, shown with WooCommerce Analytics off too), gift cost, orders with a gift and trigger revenue (shown on this report only). The campaigns table's take rate covers BOGO offers too (orders ÷ views per row; "—" without views). Lite/Pro limits are unchanged. Gift lines are covered back to 2.2.0 (approximate discount); trigger lines start at this release; views start at this release.

### 3.2 Upsell Order Bump (`upsell-order-bump`)

**Build:**
- `_spsg_reference_price` on bump lines (the stamp already exists).
- Accept / remove: `Counter::bump()` in `upsell_offer_product_add_to_cart()`. Covers both checkouts.
- Views, **once per session per bump id in both checkouts**:
  - Classic: count in `bump_product_frontend_view()` with a WC session flag `spsg_bump_seen`, because the hook re-runs on every checkout refresh.
  - Blocks: the React template calls `window.spsgStorefront.track()` on mount; the tracker's `sessionStorage` dedupe stops the reload after each tick from adding views.
- Take rate = orders containing the bump (offer stats, `spsg_module = upsell-order-bump`) ÷ bump views. Accepts and removals show as secondary numbers.

**Report:** take rate, bump revenue, discount given, per-bump table. Covered back to 2.2.0. Smallest build; do it first.

### 3.3 Countdown Timer (`countdown-timer`)

**Built (Oct 8, 2026):**
- `_spsg_countdown_pct` at checkout (§2.1), by the module's `OrderAttribution`. The same `is_product_discountable()` check as the price filter, so the key and the charged price always agree; the percentage rule (`intval`, 1–100) is `Helper::discount_percentage()`.
- Discount from the charged price (§2.2). Not "regular − charged", which would count the store's own sale as timer cost.
- Rows are per product (no campaign id): the offer rows data store with `spsg_group = product`, keyed by the parent product id (`wc_order_product_lookup.product_id`), the same id the timer markup carries.
- Views and add-to-carts: the timer root (`templates/countdown-timer.php`; classes unchanged) carries `data-spsg-track="countdown-timer" data-spsg-object="product:{id}" data-spsg-track-add-to-cart`, and the template enqueues `spsg-storefront-tracker` after its early returns, so the tracker loads only where a timer shows.
- `data-spsg-track-add-to-cart` is a generic tracker opt-in: `add_to_cart` of that product is counted from the `form.cart` submit (when not cancelled; its `add-to-cart` field is the product id) and from WooCommerce's jQuery `added_to_cart` event (the button's `data-product_id`), so an ajax form that cancels the post counts once. Like views, once per browser session and product, so the rate is a share of visits. `TrackController` accepts `countdown-timer` `view` and `add_to_cart` for published products.
- "Timer only": a product with views or add-to-carts in the range, no line sold at a timer price, and no valid timer discount **now** (`Helper::discount_percentage()` is 0, e.g. a value of `0.5` or `150`). It reflects the product's current timer settings, not the range.
- Pro's shop-loop timer (`pro/.../CountdownTimer/templates/shop-countdown-timer.php`) isn't tracked in phase 1.

**Report (built):** the Countdown Timer card shows revenue during timers, discount, orders, items, views (estimated) and the add-to-cart rate (add-to-carts per view; both counts, so they show with WooCommerce Analytics off too). `GET /analytics` adds `modules['countdown-timer'].add_to_cart_rate` and `products` / `products_total` / `products_limited`: per product, money, counts, rate, `timer_only`, by revenue then views (money rows: the top 100). The "Products on a timer" list shows with WooCommerce Analytics on, like Campaigns; Lite lists the top 3, Pro all. Starts at this release.

### 3.4 Free Shipping Bar (`progressive-discount-banner`)

**Build:**
- **Discount mode: keep the fee**, and tag the order's fee item with its source and the rule that earned it (`_spsg_campaign_type`, threshold, mode, value, qualifying subtotal; §2.1). Reported by joining `woocommerce_order_items` (`order_item_type = 'fee'`) to that item meta; the same tables under HPOS and posts storage.
  - **Why not a coupon** (considered and dropped):
    - **Dokan:** a coupon is copied to sub-orders and comes off the vendor's earnings by default (`DokanOrderLineItemCouponInfo::get_vendor_discount()`), so it would move the bar's cost onto vendors. Today the fee stays on the parent and payouts don't change.
    - **Blocks:** blocks checkout always shows a remove × on coupons (only a JS filter can change that).
    - **Public code:** the code is visible through the Store API, so it needs a validity check against the threshold.
    - **Merchant edits:** the merchant can change limits on the coupon post.
    - **Growth:** every order adds a `_used_by` row to the post.
  - Cost: the bar discount doesn't appear in WooCommerce's Coupons report.
  - **Tax is already right** (checked Oct 8, 2026): WooCommerce splits a negative fee's tax across the cart's items (`class-wc-cart-totals.php:300`), so the discount lowers the taxed amount. No fix needed.
- **Free-shipping mode:** the bar can't prove it gave the free shipping. At checkout, when the threshold is met, write order meta `_spsg_fsb_threshold` (the threshold in force, CRUD API, on the parent order), so later setting changes don't move past figures. No cost figure.
- **Threshold reached:** `Counter::bump()` the first time per session the cart crosses it (session flag; `woocommerce_cart_calculate_fees` runs many times).
- **Views, CTA clicks, dismissals:** `window.spsgStorefront.track()` in the bar script's show and close handlers.

**As built (step 7, Oct 8, 2026):**
- Writer: `ProgressiveDiscountBanner\OrderAttribution` (module-local, registered only while the module is active). `tag_fee()` on `woocommerce_checkout_create_order_fee_item` when `$fee_key === WoocommerceDiscount::FEE_ID`; `record_order()` on `woocommerce_checkout_create_order` and `woocommerce_store_api_checkout_update_order_from_request` sets or deletes the order key and refreshes the tagged fee line's subtotal. Both skip subscriptions (`OfferAttribution::is_subscription()`). Keys are constants on that class.
- Threshold reached: `WoocommerceDiscount::woocommerce_cart_calculate_fees()` (both modes, once the cart meets the minimum) bumps `reached` / `module` / `0` behind the WC session flag `spsg_fsb_reached`.
- Bar events: `banner-bar-remove.js` (now depends on `spsg-storefront-tracker`) tracks `view` in `bannerShow()` (the tracker dedupes views per session), `dismiss` on the close control and `click` on `.fn-bar-action-button`; the same classes are in Pro's `bar-pro.php`. `TrackController` takes `view`, `click`, `dismiss` for `progressive-discount-banner` with object type `module` and id `0` only (`Counter::MODULE`); `reached` is server-only.
- Report: `Analytics\Reports\FreeShippingBar` reads tagged fee lines (`woocommerce_order_items` + itemmeta `_line_total`) and the `_spsg_fsb_threshold` order meta (`OrderUtil::get_table_for_order_meta()`, HPOS or posts) against `wc_order_stats`: the order's `date_created`, WooCommerce Analytics' excluded statuses (`Offers\Stats\DataStore::excluded_statuses()`, WooCommerce's own list and filter) and `wc-refunded`, and `parent_id = 0`. The parent rule replaces the Dokan join of the offer reports: the fee line and the order key exist only on the order the checkout created (Dokan copies neither fees nor order meta to sub-orders, checked on the dev site), and refunds have a parent, so nothing is counted twice.
- `GET /analytics` adds `modules['progressive-discount-banner']`: `orders` (orders with the discount), `discount`, `threshold_orders` (discount orders plus free-shipping orders with the key) and `counts` (`view`, `click`, `dismiss`, `reached`); counts only with WooCommerce Analytics off. It isn't one of the offer modules: not in the totals, the chart or the campaigns. The discount is a fee, not offer revenue.
- The card ("Free Shipping Rules", the module's name) is marked **Helped** with a note that the discount is an order fee not counted in offer revenue, and shows orders with the discount, discount given, orders over the threshold, views and carts that reached it. Module cards are now two per row.
- Not built: "how far above the threshold" (the qualifying subtotal is on the fee line, so it can be added later) and the free-shipping-mode check of the order's shipping line. Partial refunds don't reduce the bar's discount (ADR-012 limits).

**Report:** orders that used the bar discount, discount given, orders reaching the threshold. Don't compare unlocked-order AOV with the store average: orders above the threshold are bigger by definition. Labelled **Helped**.

---

## 4. Conventions that apply

- New symbols, hooks and routes: `@since SPSG_VERSION`. Any new hook goes into `tests/compat/php-hooks-baseline.txt`.
- Options autoload `false` (`spsg_analytics_db_version`).
- Order data only through `wc_get_order()` and the CRUD API (HPOS). Reads of WooCommerce's lookup tables and our counts table use `$wpdb->prepare()`.
- Storefront: plain JS/CSS (ADR-005). Admin: TypeScript, plugin-ui; the WC Analytics bundle uses WC Admin components because it runs on their screens.
- Existing 2.2.0 keys and `_spsg_influencing_offers` unchanged; Pro 2.2.0 keeps working when only lite updates (ADR-004).
- Update the stale HPOS comment in `storegrowth-sales-booster.php` ("writes no order or order-item meta").

---

## 5. Decisions (agreed Oct 8, 2026)

| # | Question | Decision |
|---|---|---|
| 1 | Does BOGO trigger revenue count in the StoreGrowth total? | No. Shown on the BOGO report only. |
| 2 | Free Shipping Bar label: Created or Helped? | Helped. |
| 3 | Switch the bar's discount from a fee to a coupon? | No. Keep the fee and tag its fee line; a coupon would move the cost onto Dokan vendors (§3.4). The suspected fee-tax bug was checked and isn't real. |
| 4 | WC Analytics turned off: build our own money table as a fallback? | No. Show "turn on WooCommerce Analytics"; counts still work. |
| 5 | Revenue with or without tax? | Without (`product_net_revenue`), as in WooCommerce Analytics. |
| 6 | Multi-currency stores | Not supported by WC Analytics either; documented. |
| 7 | Add filters and a column to WooCommerce's own reports in phase 1? | No, a later phase. Phase 1 ships our own Analytics tab; step 8 moves after it. **Changed Oct 8, 2026:** built right after the Analytics page (step 9 moved up), with an Overview indicator. |

---

## 6. Order of work

| Step | Work | Size |
|---|---|---|
| 0 | BOGO cart-key fixes (swap `intval()`, check `product_link_key`, `linked_to_product_key` on manual add) | S |
| 1 | ADR-012. `OfferAttribution`: `_spsg_reference_price`, `_spsg_trigger_campaign_id`, `_spsg_countdown_pct`, FSB order keys; skip subscriptions, strip legacy keys on `wcs_new_order_items`. `spsg_offer_lookup` + `OfferLookup` sync + `Offers\Stats\DataStore` on WooCommerce's Products stats (dokan-lite style), Dokan order types. PHPUnit for the discount rules and real orders through WooCommerce's import. Backfill job in step 2. | L |
| 2 | Counts table (`Schema`, `Counter`) + Order Bump accept/remove and classic views | S |
| 3 | `storefront-tracker.js` + `POST …/analytics/track` with validation and limits; blocks bump views | M |
| 4 | `GET …/analytics`, `spsg_dashboard_overview` revenue, Analytics tab (overview + Order Bump report), empty states | L |
| 5 | **Done:** BOGO: trigger key, views, swap and gift-added counts, report (take rate) | M |
| 6 | Countdown: pct key, markup, add-to-cart tracking, report | M |
| 7 | Free Shipping Bar: fee-item tag, `_spsg_fsb_threshold` order meta (free-shipping mode), threshold count, bar events, report | S |
| 8 | Pro: range, comparison, CSV, per-vendor (via `dokan_order_stats`) | M (pro repo) |
| 9 | **Done (moved up):** WooCommerce Analytics extension: "StoreGrowth offer" filter on Orders and Products (query args, table and chart clauses, JS filters), Offer column, Overview indicator | L |

Each step: `sg-developer` + `sg-qa`. Check with and without Pro, classic and blocks checkout, with and without Dokan, and with WC Analytics on and off. Also run `npm run check:hooks`.

---

## 7. Later: the other six modules

| Module | Add |
|---|---|
| Direct Checkout | Tracker on Buy Now; `spsg_source=direct-checkout` on add-to-cart → line key, role `assisted`. |
| Quick View | Tracker on `spsgqcv_loaded`; hidden `spsg_source=quick-view` field → `assisted`. |
| Fly Cart | Tracker on drawer open; session flag on fast checkout → `assisted`. |
| Sales Notification | Script must carry the product id (today it picks by list position); tracker on show and click. |
| Floating Bar | Tracker on show, CTA click, close; Pro coupon orders from `wc_order_coupon_lookup`. |
| Stock Bar | Tracker views and add-to-carts on product pages with the bar. |

`assisted` lines are mirrored into the same lookup and read by the same data stores (role `assisted`), and shown only on their own module's report.

---

## 8. Draft ADR-012 decisions

1. Money for StoreGrowth reports is read from WooCommerce Analytics' lookup tables, joined to `spsg_offer_lookup`, a table mirrored from WooCommerce's own import (dokan-lite style), through report data stores that extend WooCommerce's. StoreGrowth keeps no money table; line refunds, statuses, history import and re-sync are WooCommerce's.
2. Limits accepted:
   - Fully refunded orders are left out.
   - Refunds with no lines ticked, and partial refunds of the bar discount, don't reduce our figures.
   - On new stores, figures lag up to 12 hours (scheduled import).
3. If WooCommerce Analytics is off, revenue reports are unavailable and say so; no fallback store.
4. StoreGrowth writes money data only as keys at checkout: line keys `_spsg_trigger_campaign_id`, `_spsg_reference_price`, `_spsg_countdown_pct`, fee-item keys on the bar's discount fee (source and the rule that earned it), and order key `_spsg_fsb_threshold` (free-shipping mode, set or deleted on every checkout pass). 2.2.0 keys and `_spsg_influencing_offers` are unchanged. Keys are never written to subscriptions; 2.2.0 keys already on subscriptions are stripped on `wcs_new_order_items`.
5. Discounts are measured from what was charged (lookup revenue vs. saved reference price or %), not from the add-to-cart stamp.
6. The Free Shipping Bar discount stays a fee (who pays in Dokan doesn't change); it isn't turned into a coupon.
7. Each line has one role, precedence `reward` > `discounted`. The StoreGrowth total counts `reward` and `discounted` revenue. `trigger` and `assisted` are flags, not roles: their revenue shows only on their module's report, and a flagged line that also has a role counts once, under its role.
8. Views and clicks go to one core counts table (`spsg_analytics_daily`) through one plain-JS tracker and an unauthenticated, increment-only, validated REST route, deduped per session, labelled as estimates. Analytics tables are created through `Upgrader` (the upgrade notice's migration on an update, activation on a fresh install).
9. Dokan: follow Dokan's own order types in `dokan_order_stats` (1, 2, 4, 5 for lines; parent orders for the bar's order keys); vendor comes from there.
10. Lite/Pro limits are enforced in the REST controller.
11. In a later phase, StoreGrowth figures also appear inside WooCommerce Analytics (an "offer" filter and column) through WooCommerce's report filters; there's no separate Analytics menu page (ADR-008).
