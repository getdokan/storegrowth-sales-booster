# Architecture decision records

Standing rules for all StoreGrowth code: build, layout, styling, compatibility, storefront, server calls. They apply to every change. Numbered in sequence; a new ADR takes the next number, and numbers are never reused. Files are named `NNNN-short-title.md` (`0013-…`); in text an ADR is cited by its id (`ADR-013`).

| ADR | Decision |
|---|---|
| [ADR-001](0001-build-and-typescript.md) | Single webpack build following dokan-lite, TypeScript first, no monorepo, shared bundles as globals |
| [ADR-002](0002-source-layout.md) | Source layout: root `src/`, `modules/<name>/src/`, kebab-case |
| [ADR-003](0003-tailwind-scoped-styling.md) | Tailwind v4, one stylesheet scoped to `.spsg-layout` |
| [ADR-004](0004-backward-compatibility.md) | Never rename/remove PHP hooks, public API, options, slugs, ajax actions or REST routes; settings are never lost; older pro versions keep working |
| [ADR-005](0005-storefront-standard.md) | One storefront standard for all modules: CSS variables, style vocabulary, fonts, text tokens, display rules, templates, preview parity |
| [ADR-006](0006-rest-first-and-ajax.md) | REST first; the admin app calls existing ajax actions only through the `ajax()` helper; storefront ajax stays admin-ajax |
| [ADR-007](0007-settings-engine.md) | One settings engine; gated modules turn on at first save; extensions add fields in PHP (`spsg_settings_schema`) and custom controls through `storegrowth_settings_{variant}_field` |
| [ADR-008](0008-single-admin-page.md) | One admin page `admin.php?page=storegrowth#/<route>`; old slugs redirect; exception to ADR-004 for the old screen IDs |
| [ADR-009](0009-settings-pages-in-php.md) | Settings pages are defined in the backend (`SettingsPage::get_page()`), come in one request (`admin/settings`) and are generated at `#/settings?module=<id>&tab=<tab>`; modules add only preview and multi-key controls (`storegrowth.settings.page`) |
| [ADR-010](0010-record-editors-in-php.md) | Record editors (BOGO offers, order bumps) are defined in PHP like settings pages, served by the record's REST routes (`/editor`), drawn by the same renderer; PHP filters replace the old editors' JS slots |
| [ADR-011](0011-dokan-vendor-dashboard.md) | StoreGrowth UI on the Dokan vendor dashboard: the module's own pages in vendor mode, shared bundles and `spsg-tailwind` (under `.spsg-layout`) loaded there, Dokan's router bridged to the shared one, a localized data subset without the admin nonce |
| [ADR-012](0012-module-analytics.md) | Module analytics: StoreGrowth order keys written at checkout, mirrored into `spsg_offer_lookup` from WooCommerce Analytics' import; reports extend WooCommerce's report data stores, dokan-lite style (no money table of our own); views and clicks in one counts table via one storefront tracker |
| [ADR-013](0013-offer-versions.md) | Offer versions: campaign versions and campaign-only offers live on the campaign's list (`spsg_campaign_offers`); `OfferVersions::effective_offer()` says what applies, live, writing nothing; Free limits worked out live |
| [ADR-014](0014-deal-referee.md) | Deal list and referee: modules report per-line deals on `spsg_cart_deals`, `Pricing\Referee` decides only for carts with a Smart Coupon or campaign deal, and WooCommerce's coupon filters apply the result; gifts exist only by the decision; Smart Coupons are real coupons (`Pricing\SmartCoupon` meta contract) |
| [ADR-015](0015-store-api-cart-extension.md) | One Store API extension in core (`StoreApi\CartExtension`, `extensions.storegrowth`): notices, automatic coupon names and module data (`spsg_store_api_cart_data`); line labels stay in item data; the block mini-cart's bar is PHP bound to WooCommerce's cart state |
| [ADR-016](0016-campaigns-and-attribution.md) | Campaigns and attribution: new keys say "promotion" (`_spsg_promotion_id`, `spsg_offer_lookup.promotion_id`); one order, one campaign from the referee's result then the first-party link cookie; revenue from the offer report data stores |
| [ADR-017](0017-campaigns-in-pro.md) | Campaigns live in StoreGrowth Pro: Free asks through filters with "no campaign" defaults, Pro answers; Free shows nothing about campaigns |
