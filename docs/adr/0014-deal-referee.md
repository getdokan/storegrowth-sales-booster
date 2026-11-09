# ADR-014: Deal list and referee, WooCommerce-first coupon gating

- Status: Accepted
- Date: 2026-11-09
- Follows: ADR-004 (compatibility), ADR-012 (attribution), ADR-013 (offer versions)
- First use: BOGO, Upsell Order Bump, Countdown

## Context

Each module applied its discount on its own, so a shopper could get a BOGO gift and a coupon on the same product, and nothing could explain the price. 3.1 needs one place where "the larger deal wins" lives, without rewriting how WooCommerce prices a cart.

## Decision

1. **Report, decide, apply.** Modules report each cart line's deals on the filter `spsg_cart_deals`. `Pricing\Referee` decides, and `spsg_referee_decided` tells the modules. Countdown keeps its price filter and bumps keep pricing their own line; they never compete. Decisions are built on demand and memoized per cart state, because cart fragments render labels without running totals.
2. **Rule 1.** The referee acts only on a cart with a Smart Coupon or a campaign deal. Any other cart takes the 3.0 path: no deal list, no labels.
3. **Decisions read fresh prices, never the cart's.** `Pricing\DealList` uses fresh products, the lines' quantities and WooCommerce's price-entry basis (`get_price()`), so tax settings, zeroed totals and what a decision does to the cart can't change it. A BOGO deal is reported on the bought line, from the offer: removing its gift changes nothing.
4. **WooCommerce applies every coupon.**
   - `woocommerce_coupon_is_valid` (priority 20, after Dokan's) rejects a coupon that lost every line, so the shopper never sees it applied. WooCommerce re-checks validity during totals and at every cart view.
   - `woocommerce_coupon_get_items_to_apply` keeps a coupon off lines it lost and a Smart Coupon off gift lines. WooCommerce does the real split of a fixed-cart coupon.
   - `woocommerce_coupon_validate_minimum_amount` measures a Smart Coupon's minimum spend without gift lines, from the lines.
   - `woocommerce_coupon_error` gives a coupon WooCommerce removes the referee's reason.
5. **Comparisons.** A BOGO competes as a whole against a coupon on the bought line; ties keep the BOGO. A fixed-cart coupon is compared by its by-price share, in one pass; moved shares are not re-compared. Two Smart Coupons stack only when both combine. An outside coupon stacks with a Smart Coupon only when that coupon allows others, otherwise the larger stays. Coupons that share no line never clash. Between two coupons the larger total stays, the one entered first on a tie. An outside coupon with Individual use stands alone under WooCommerce's rules.
6. **Gifts.** While a coupon wins, the BOGO module removes the gift (no notice; the bought line's label explains it) and marks the bought line (`_spsg_gift_held`). Add paths no-op through `Referee::coupon_won()`. The next calculation also removes a gift added by a path that doesn't ask, such as Pro 3.0. When no coupon wins any more, the gift returns, priced in the same pass. `Counter` counts a gift once per bought line (`_spsg_gift_counted`).
7. **Automatic coupons** are applied and removed by the referee with `set_applied_coupons()`, never `apply_coupon()`, so one that would lose raises no notice and never reaches the cart.
8. **Smart Coupon contract** (`Pricing\SmartCoupon`). Every Smart Coupon is a real `shop_coupon` post with `_spsg_smart_coupon` (`yes`), `_spsg_coupon_method` (`automatic`, `code`, `link`), `_spsg_coupon_title`, `_spsg_coupon_combines` and `_spsg_coupon_allow_others`. The gaps WooCommerce has no field for: `_spsg_coupon_type`, `_spsg_coupon_starts_at`, `_spsg_coupon_min_quantity`, `_spsg_coupon_eligibility`, `_spsg_coupon_roles`, `_spsg_coupon_tiers`, `_spsg_coupon_bogo_rule` and `_spsg_coupon_campaign_offer` (a campaign-only coupon's offer row). `Pricing\CouponAmount` reports a campaign's amount or a tier's percent only while a cart is priced; the saved coupon is never written. `Modules\SmartCoupons\CouponGuard` is always loaded and makes WooCommerce report a coupon invalid while the module is off, it is over the Free limit, or a campaign-only coupon is offline.
9. **Labels** go through `woocommerce_get_item_data`, so classic cart, checkout, mini-cart and the Store API read them from one place. A line with two or more deals is labelled when the cart holds a Smart Coupon or campaign deal.
10. **Observe-only.** The filter `spsg_referee_observe_only` logs decisions through `wc_get_logger()` (source `spsg-referee`) and changes no price, gift, coupon or label.

## Consequences

- Other code that needs a decision reads `Referee::for_cart()`; `Decision::to_array()` is the shape the Store API extension (#307) exposes.
- A fixed-cart coupon's displayed step follows WooCommerce's per-unit split over the lines it stayed on, not the by-price share used to decide.
- Dokan's rejection of a fixed-cart coupon across vendors stands, with its own message. Who funds a discount is in `docs/dokan-deal-funding.md`.
