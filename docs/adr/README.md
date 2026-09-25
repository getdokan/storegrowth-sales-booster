# Architecture decision records: core system

Standing rules for all StoreGrowth code: build, layout, styling, compatibility, storefront, server calls. They apply to every future change, not only to the admin redesign.

Decisions that only concern the redesign/refactor itself live in [`../redesign/adr/`](../redesign/adr/). ADR numbers are shared across both folders and never reused.

| ADR | Decision |
|---|---|
| [ADR-001](ADR-001-frontend-build-system.md) | Single webpack build following dokan-lite, no monorepo, shared bundles as globals |
| [ADR-003](ADR-003-source-layout.md) | Source layout: root `src/`, `modules/<name>/src/`, kebab-case |
| [ADR-004](ADR-004-tailwind-v4-scoped-styling.md) | Tailwind v4, one stylesheet scoped to `.spsg-layout` |
| [ADR-005](ADR-005-backward-compatibility.md) | Never rename/remove PHP hooks or public API; older pro versions keep working |
| [ADR-006](ADR-006-storefront-consistency.md) | One storefront standard for all modules: CSS variables, style vocabulary, fonts, text tokens, display rules, templates, preview parity |
| [ADR-007](ADR-007-admin-ajax-client.md) | REST first; the admin app calls existing ajax actions only through the `ajax()` helper |
