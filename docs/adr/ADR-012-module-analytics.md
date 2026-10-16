# ADR-012: Module analytics on top of WooCommerce Analytics

- Status: Accepted
- Date: 2026-10-08
- Follows: ADR-004 (2.2.0 attribution keys stay), ADR-005 (plain storefront JS), ADR-006 (REST first), ADR-008 (one admin page)
- Plan and details: [`docs/analytics/README.md`](../analytics/README.md)
- First use: BOGO, Upsell Order Bump, Countdown Timer, Free Shipping Bar

## Context

Each module should report what it earned or helped earn (revenue, discount given) and how shoppers engaged with it (views, clicks). Since 2.2.0, BOGO gifts and order bumps carry campaign keys on their order lines (`OfferAttribution`); nothing else is recorded.

A money table of our own was drafted first. Three reviews showed it would have to re-implement refunds (partial, by amount, by status), paid → cancelled → paid again, edits, history import and Dokan's parent/sub-order split, which WooCommerce Analytics already does. A read-time join of order-item meta onto WooCommerce's tables came next. It had to group per line to net refunds and gave up WooCommerce's intervals and cache. So reports now follow dokan-lite: a small table mirrored from WooCommerce's own import, and data stores built on WooCommerce's.

Two more facts shaped the design:
- **Lost discounts:** BOGO, Order Bump and Countdown lower the line price itself, so WooCommerce records a cheaper product, not a discount.
- **Lost fee ids:** a fee from `woocommerce_cart_calculate_fees` keeps only its name and amount on the order; its id is lost.

## Decision

1. **Money comes from WooCommerce Analytics, the way dokan-lite extends it** (amended 2026-10-08):
   - **Lookup table:** `spsg_offer_lookup` holds one row per `wc_order_product_lookup` row (same key) for lines a module touched: module, role, campaign, trigger campaign and **discount per unit**.
   - **Sync:** the table is kept in step on `woocommerce_analytics_update_product` / `woocommerce_analytics_delete_product`, as Dokan keeps `dokan_order_stats` in step with WooCommerce's import. Refund rows copy their original line's values.
   - **Discount** = `unit_discount × product_qty`. Refund rows have a negative quantity, so a plain SUM nets refunds.
   - **Reports** are WooCommerce report data stores: `Analytics\Reports\Offers\Stats\DataStore` extends WooCommerce's Products stats store, joining the lookup and adding a discount column. WooCommerce supplies date ranges, intervals, the merchant's excluded statuses, refund rows and the report cache. Dates are the order's `date_created`, as in WooCommerce's Products report.
   - **No money table:** revenue and quantities are WooCommerce's columns. The lookup holds no amounts except the discount per unit.
2. **Limits accepted:**
   - Fully refunded orders are left out.
   - Refunds with no lines ticked, and partial refunds of the bar discount, don't reduce our figures.
   - On stores with scheduled import (new installs since WC 10.5), figures lag up to 12 hours.
3. **No fallback.** If WooCommerce Analytics is off, revenue reports say so and show nothing else; view and click counts still work.
4. **StoreGrowth writes money data only as keys at checkout:**
   - Line keys `_spsg_trigger_campaign_id`, `_spsg_reference_price`, `_spsg_countdown_pct`.
   - Fee-item keys on the Free Shipping Bar's discount fee: its source and the rule that earned it.
   - Order key `_spsg_fsb_threshold` (free-shipping mode), set or deleted on every checkout pass.
   - The 2.2.0 keys and `_spsg_influencing_offers` are unchanged.
   - Keys are never written to subscriptions; 2.2.0 keys already on subscriptions are stripped on `wcs_new_order_items`.
5. **Discounts are measured from what was charged** (lookup revenue against the saved reference price or %), not from the add-to-cart stamp `_spsg_discount_value`, which is kept but is no longer the source of truth.
6. **The Free Shipping Bar discount stays a fee.** A coupon would be copied to Dokan sub-orders and taken off vendor earnings by default, and would conflict with merchants' "individual use" coupons. The fee line is tagged at checkout instead.
7. **One role per line, plus flags.** Roles: `reward` (gift, bump) takes precedence over `discounted` (countdown). The StoreGrowth total counts `reward` and `discounted` revenue. `trigger` and `assisted` are flags: their revenue shows only on their module's report, and a flagged line that also has a role counts once, under its role.
8. **Views and clicks** go to one core counts table (`spsg_analytics_daily`):
   - One plain-JS tracker posts to an unauthenticated, increment-only, validated REST route; counts are deduped per session and labelled as estimates.
   - **Analytics tables** (the counts table and `spsg_offer_lookup`) are created through `Upgrader`: an update creates them when the admin runs the database upgrade from the notice (`Migrations\V_3_0_0`); a fresh install creates them on activation. Until they exist, writers no-op and reports return `spsg_analytics_not_installed` (amended 2026-10-08).
9. **Dokan:** while Dokan is active, the report joins `dokan_order_stats` with Dokan's own `OrderType::get_vendor_order_types()`, the types Dokan's Products report counts. That means sub-orders and single-vendor orders and their refunds, never a parent order and its copy both. The vendor comes from there. The bar's fee is read from the order holding it.
10. **Lite/Pro limits** (date range, per-offer rows, CSV, per-vendor) are enforced in the REST controller.
11. **Later phase:** StoreGrowth figures also appear inside WooCommerce Analytics (an "offer" filter and column) through WooCommerce's report filters. No separate Analytics menu page (ADR-008).

## Consequences

- Refund and status handling matches WooCommerce's own reports, and figures change when the merchant changes Analytics settings.
- Reports depend on WooCommerce Analytics being on and imported; empty states link to its settings and to "Import historical data".
- BOGO gift and Order Bump lines are reportable back to 2.2.0. Their discount is approximate there (no reference price). Trigger, countdown and bar data start at the release that adds the keys.
- Reports inherit WooCommerce's report classes; a change to WooCommerce's Products stats store can need a change in ours (the same exposure dokan-lite has).
- The lookup fills as WooCommerce imports orders. Orders imported before this release get rows once they are re-imported. A backfill re-imports orders whose lines carry StoreGrowth keys.
- Rows of lines WooCommerce drops from an order without a hook stay behind, but they join to nothing.
- New order data is written only through the CRUD API, so the HPOS declaration stays honest.
- Multi-currency stores aren't supported, as in WooCommerce Analytics.
