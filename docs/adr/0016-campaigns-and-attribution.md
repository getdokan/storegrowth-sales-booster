# ADR-016: Campaigns and campaign attribution

Status: accepted (3.1.0).

## Context

3.1 groups offers, a campaign price and display surfaces under one schedule and one report (#308). ADR-012 already mirrors order keys into `spsg_offer_lookup`, whose `campaign_id` means an **offer**. Campaign credit needs its own keys.

## Decision

**Naming.** New stored keys and API fields say "promotion": order meta `_spsg_promotion_id`, `_spsg_promotion_source`, `_spsg_promotion_surface`; columns `spsg_offer_lookup.promotion_id` and `promotion_surface`. Existing `_spsg_campaign_id`, `spsg_offer_lookup.campaign_id` and report field `campaigns` keep meaning offer. Screens say Campaign.

**Where it lives.** `includes/Campaigns/` in Free, gated by `sp_store_growth()->has_pro()`. `CampaignRepository` stays the store of campaigns (`Offers/`); status is worked out from the clock (`status_at`). Boundary recompute lives there for #309.

**Crediting (one order, one campaign).**
1. The referee's decision: the promotions behind the deals that stayed (`Decision::promotions()`), largest saving first.
2. Otherwise the campaign link: a valid slug, inside the attribution window, and a campaign product in the cart.

Written with `$order->update_meta_data()` on the order being created (HPOS safe); under Dokan that is the parent, and lines of sub-orders read their parent's stamp in `OfferLookup`.

**Revenue.** Every line of a stamped order is mirrored into `spsg_offer_lookup` (role `promotion` for a line without offer keys, excluded from the offer reports' roles). Campaign reports read the offer data stores with `spsg_promotion` and an empty role list, so WooCommerce supplies dates, statuses, refunds and the report cache (ADR-012).

**Campaign link.** WooCommerce's order attribution can't carry a 7-day window (one global cookie filter). The storefront tracker sets a small first-party cookie (`spsg_promo`, `slug:timestamp:surface`) in the browser, so cached pages work. The server re-checks everything in it.

**Campaign price** goes through the Countdown module (`Campaigns\CampaignPrice`): it replaces a product's own Countdown while it runs and writes nothing to the product.

**Surfaces** are gated by `DisplayRules::should_show()` (`Campaigns\CampaignSurfaces`). The Product Badge is owned by Campaigns.

**Cart notices** (`Campaigns\CartNotices`) compare the promotions behind the cart with the last calculation, kept in the WooCommerce session, and go through `CartLine::notice()`, which the block cart reads through the Store API extension (ADR-015).

**Campaign-only offers** have no row of their own, so attribution identifies them by their campaign row (`bogo:co12`, `order_bump:co12`); `OfferLookup::module_of()` still reads the prefix.

**Licence.** Reading campaigns needs only `manage_woocommerce`, so expired stores keep their own read-only; every write needs Pro. Without Pro, running campaigns have no effect (`running()` and `running_offers()` return none).

## Consequences

- Schema changes: `spsg_campaigns` gains `slug`, `settings` and `paused_at`; `spsg_offer_lookup` gains the two promotion columns. Both go through the 3.1.0 migration, and readers tolerate an unmigrated site (`Schema::has_promotions()`, `CampaignRepository::is_installed()`).
- Orders from before 3.1 can't be credited; the report says so.
