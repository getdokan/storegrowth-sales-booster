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
