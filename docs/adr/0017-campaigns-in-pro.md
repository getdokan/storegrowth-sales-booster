# ADR-017: Campaigns live in StoreGrowth Pro

Status: accepted (3.1.0). Supersedes "Where it lives" in ADR-016; the rest of ADR-016 (naming, crediting, revenue, link, price, surfaces, notices) still holds, now implemented in Pro.

## Context

ADR-016 put the campaign manager in Free under `includes/Campaigns/`, gated by `has_pro()`, with a sample-data preview for Free stores. Campaigns are a Pro feature, and shipping their code, routes, tables and admin pages in the free plugin (all unused there) makes Free heavier and blurs what Free is. Nothing campaign-related shipped in Free 3.0.0, so moving it breaks no released surface (ADR-004).

## Decision

**Campaigns are StoreGrowth Pro's.** Pro holds the campaign store (`spsg_campaigns`, `spsg_campaign_offers` and their install), the services (price, surfaces, notices, attribution, boundary, readiness, report), the `sales-booster/v1/campaigns` routes, the `#/campaigns` admin pages, the Campaigns menu item, the attribution window setting and the campaign tests. StoreGrowth alone shows nothing about campaigns: no menu item, route, page or preview.

**StoreGrowth asks through filters; Pro answers.** Each place Free code needs a campaign has a filter whose default means "no campaign":

| Question | Filter (default) |
|---|---|
| Campaign version running over an offer | `spsg_offer_campaign_row` (null) |
| State of a campaign-only offer | `spsg_campaign_only_offer_state` (null → offline) |
| Offer rows of the running campaigns | `spsg_running_campaign_offers` ([]) |
| A campaign price is running | `spsg_campaign_prices_running` (false) |
| Campaign price on a product / all prices | `spsg_campaign_price` (null), `spsg_campaign_prices` ([]) |
| Countdown end a campaign sets | `spsg_countdown_campaign_end` (null) |
| Campaign copy on a surface | `spsg_surface_campaign_copy` ('') |
| Sales Pop products | `spsg_sales_pop_product_ids` (unchanged) |
| Offer timeline (list chip, editor banner) | `spsg_offer_timeline` (empty) |
| Smart Coupon's campaign | `spsg_smart_coupon_response` (unchanged) |
| Campaign-only offer name in reports | `spsg_campaign_offer_name` ('') |
| Campaign link cookie | `spsg_tracker_settings` (no cookie) |

`OfferVersions` stays in Free as the resolver: it merges a campaign's overrides and switches the offer on (`switch_on`), so every module keeps one answer to "what applies now" (ADR-013).

**Admin.** Pro's bundle adds the routes (`storegrowth.admin.routes`) and the editors' version through the JS filter `storegrowth.offer.useVersion`, which returns a hook giving `{ row, route, returnTo, header }`; Free's `useOfferVersion()` defaults to the everyday version. `TimelineChip` and `OfferBanner` draw only what the timeline data says, so they are empty in Free.

**Stays in Free (neutral).** The order and item keys (`_spsg_promotion_*`, `_spsg_campaign_*`), the `spsg_offer_lookup` promotion columns (`V_3_1_0::add_promotion_lookup_columns`) and the reports' `spsg_promotion` support, deals' `promotion_id`, `Decision::promotions()`, `SmartCoupon::CAMPAIGN_OFFER`, the storefront tracker's cookie code (off unless configured), and the uninstaller dropping the campaign tables (uninstall runs without Pro).

**Loading in Pro.** Campaigns boot before Pro's licence check, so an expired store keeps reading its campaigns; storefront effects and writes check `has_pro()`. They boot only when Free has the filters (`OfferVersions::running_campaign_offers()` exists).

**Tests and CI.** Campaign PHPUnit tests live in Pro (`tests/php`) and run on Free's test bootstrap (`TEST_SPSG_PRO_DIR`). The PHPUnit and E2E workflows check out Pro's branch with the same name as Free's when it exists, else `develop`.

## Consequences

- Free is smaller and has no Pro-only screens; Pro owns the whole feature.
- A change to a campaign filter is a change to Free's public API (ADR-004) once released.
- Pro needs a Free version with the filters; an older Free leaves campaigns off.
