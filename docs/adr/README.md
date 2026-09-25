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
