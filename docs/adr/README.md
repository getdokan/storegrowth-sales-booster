# Architecture decision records: core system

Standing rules for all StoreGrowth code: build, layout, styling, compatibility, storefront, server calls. They apply to every future change, not only to the admin redesign. Numbered in sequence; a new ADR takes the next number.

Decisions that only concern the redesign/refactor itself are redesign decision records (`RDR-###`) in [`../redesign/adr/`](../redesign/adr/).

| ADR | Decision |
|---|---|
| [ADR-001](ADR-001-frontend-build-system.md) | Single webpack build following dokan-lite, no monorepo, shared bundles as globals |
| [ADR-002](ADR-002-source-layout.md) | Source layout: root `src/`, `modules/<name>/src/`, kebab-case |
| [ADR-003](ADR-003-tailwind-v4-scoped-styling.md) | Tailwind v4, one stylesheet scoped to `.spsg-layout` |
| [ADR-004](ADR-004-backward-compatibility.md) | Never rename/remove PHP hooks or public API; older pro versions keep working |
| [ADR-005](ADR-005-storefront-consistency.md) | One storefront standard for all modules: CSS variables, style vocabulary, fonts, text tokens, display rules, templates, preview parity |
| [ADR-006](ADR-006-admin-ajax-client.md) | REST first; the admin app calls existing ajax actions only through the `ajax()` helper |
| [ADR-007](ADR-007-settings-engine-and-extension-fields.md) | One settings engine; gated modules turn on at first save; extensions add fields in PHP (`spsg_settings_schema`) and custom controls through `storegrowth_settings_{variant}_field` |
| [ADR-008](ADR-008-single-admin-page.md) | One admin page `admin.php?page=storegrowth#/<route>`; old slugs redirect; exception to ADR-004 for the old screen IDs (ships with a pro update) |
| [ADR-009](ADR-009-backend-defined-settings-pages.md) | Settings pages are defined in the backend (`SettingsPage::get_page()`), come in one request (`admin/settings`) and are generated at `#/settings?module=<id>&tab=<tab>`; modules add only preview and multi-key controls (`storegrowth.settings.page`) |
| [ADR-010](ADR-010-record-editors-defined-in-php.md) | Record editors (BOGO offers, order bumps) are defined in PHP like settings pages, served by the record's REST routes (`/editor`), drawn by the same renderer; PHP filters replace the old editors' JS slots |
| [ADR-011](ADR-011-storegrowth-ui-on-dokan-vendor-dashboard.md) | StoreGrowth UI on the Dokan vendor dashboard: the module's own pages in vendor mode, shared bundles and `spsg-tailwind` (under `.spsg-layout`) loaded there, Dokan's router bridged to the shared one, a localized data subset without the admin nonce |
