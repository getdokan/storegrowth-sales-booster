# ADR-018: Smart Coupons' Pro options live in StoreGrowth Pro

Status: accepted (3.1.0). Follows ADR-017 (campaigns in Pro).

## Context

The Smart Coupons plan splits Free and Pro:

- **Free:** unlimited code and link coupons, one active automatic coupon (turning on a second asks to swap it or upgrade), Percentage / Fixed amount / Buy X get Y, all customers or specific roles, total uses, one use per customer, dates, and Uses / Discount given / Revenue in the list.
- **Pro:** unlimited automatic coupons, Buy more save more tiers by quantity or by cart subtotal, first-time / returning / specific customers, more than one use per customer, and use in campaigns.

The Pro options were built in Free and gated by `has_pro()`.

## Decision

**Pro owns the Pro options' code.** `StoreGrowthPro\Modules\SmartCoupons\SmartCouponsPro` adds their editor fields (`tier_basis`, `tiers` with the `spsg_coupon_tiers` control, `customer_emails`, `customer_uses`), cleans, checks, writes and reads them, prices tiers, and judges first-time / returning / specific customers. It plugs into Free's filters:

- `spsg_smart_coupon_pro_options` (Pro runs them)
- `spsg_smart_coupon_sanitize`
- `spsg_smart_coupon_check`
- `spsg_smart_coupon_write`
- `spsg_smart_coupon_values`
- `spsg_smart_coupon_tier_percent`
- `spsg_smart_coupon_customer_may_use`
- `spsg_smart_coupon_campaign_changes`
- `spsg_smart_coupon_campaign_record`

**Free keeps the data, the pause and the refusal.** It keeps the type and eligibility values, the meta keys, `SmartCoupon::needs_pro()`, and `SmartCoupon::pro_options_available()` (a licence AND Pro answering). It never writes or clears Pro's data, so a save without Pro keeps every option. A coupon using an option that doesn't run pauses ("Paused: needs Pro", fail closed) and resumes when Pro runs again. Newly chosen Pro options are refused without it. Specific customers are WooCommerce's allowed emails, and uses per customer is WooCommerce's per-user limit.

**The Free limit counts active automatic coupons only** (`OfferLimits` with `active_automatic()`); Free's editor and list ask to swap a second one on.

**Tiers by subtotal** compare the eligible items' shelf prices × quantity, before any coupon, so a tier never depends on its own discount. The rows are `{ min, percent }` (subtotal) or `{ qty, percent }` (quantity), and the basis is stored in `_spsg_coupon_tier_basis`.

Pro boots this before its licence check, like Campaigns, so an expired store keeps reading and saving its coupons' options.

## Consequences

- A Pro without these filters (3.0.0) leaves coupons with Pro options paused instead of running them without their rules.
- The Pro options' tests live in Pro (`SmartCouponsProTest`). Free tests the pause, the refusal and that a save keeps Pro's data.
