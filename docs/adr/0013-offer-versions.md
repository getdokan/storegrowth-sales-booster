# ADR-013: Offer versions and `effective_offer()`

- Status: Accepted
- Date: 2026-11-09
- Follows: ADR-004 (stored keys stay), ADR-012 (`campaign_id` means offer)
- First use: BOGO, Upsell Order Bump

## Context

3.1 campaigns take over offers for a time window and hand them back. A merchant's everyday settings must never change for that, and every part of the plugin must agree on what applies right now. Migrations run on demand, so all of this has to work before the tables exist.

## Decision

1. **Two versions per offer.** The everyday version is the offer as its module stores it. The campaign version is only the values a campaign changes (empty for "Use as is"), stored on the campaign's list in `spsg_campaign_offers`, never on the offer.
2. **Campaign-only offers** live in the same table with `offer_id` 0 and all their values, so BOGO's `unique_product_variation` key doesn't apply to them. Their values carry `campaign_offer_id` and `id` 0: a row id would read as a real offer's id in attribution.
3. **`OfferVersions::effective_offer( $offer, $now )`** returns `version`, `values`, `promotion_id`, `live` and `chip`. `$offer` is the stored values plus `offer_kind`. It writes nothing. The database rows it depends on are read once per request (`CampaignRepository`); the merge is worked out each call, so an edit made during the request is seen.
4. **While a campaign runs** the offer is switched on and the campaign's window replaces the offer's own dates and weekdays.
5. **Status.** Only `draft`, `scheduled` and `paused` are stored. `running` and `ended` come from the dates (`CampaignRepository::status_at()`). A campaign with no start date never runs; a paused one past its end date is ended.
6. **Licence.** Free's server code asks `has_pro()`. Without it no campaign takes effect, every offer uses its everyday version and campaign-only offers are offline.
7. **Storefront reads only.** Campaign values are merged in storefront lookups (`BogoDataManager::with_campaign_rule()`, `OrderBumpData::get_matching_bumps()`), never in the readers that feed admin editors, so a save can't write a campaign's values over the everyday row.
8. **BOGO precedence:** a campaign's product rule (campaign-only first), then the everyday product rule, then a campaign's store-wide rule, then everyday store-wide rules.
9. **Free limits** (`OfferLimits`, filter `spsg_offer_limits`) count active everyday offers and pause the newest over the limit. This is worked out live. The merchant's "Choose offers" list is a separate option, so a renewed licence brings everything back.
10. **"Only with coupon"** is a key inside BOGO's `design_settings`, so no schema change is needed. BOGO checks it in `is_offer_live()`; only the filter `spsg_bogo_coupon_unlocks_rule` lets such a rule apply, so with Smart Coupons off it never applies by itself.
11. **Naming.** In new stored keys and API fields a real campaign is a "promotion" (`promotion_id`). `_spsg_campaign_id`, `spsg_offer_lookup.campaign_id` and report field `campaigns` still mean offer.

## Consequences

- Readers gate on `CampaignRepository::is_installed()`; until the update runs there are simply no campaigns.
- Tables are created by `Migrations\V_3_1_0` on update and by the activation hook on a fresh install.
- A new offer kind adds its own case through `spsg_offer_is_live` and `spsg_offer_limits`.
- A campaign's "End now" has to set `ends_at`: the status follows the dates.
