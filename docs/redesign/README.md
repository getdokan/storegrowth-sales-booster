# StoreGrowth admin redesign

| Document | What it is |
|---|---|
| [migration-spec.md](migration-spec.md) | The plan: target build, file tree, PHP changes, data rules, phases |
| [modules/](modules/README.md) | Per-module migration specs: core shell + 10 modules, with field maps, data changes, REST, compat, tasks |
| [adr/ADR-001](adr/ADR-001-frontend-build-system.md) | Single webpack build following dokan-lite, no monorepo, shared bundles as globals |
| [adr/ADR-002](adr/ADR-002-typescript-first-full-rewrite.md) | TypeScript-first full rewrite; pro extends the PHP schema |
| [adr/ADR-003](adr/ADR-003-source-layout.md) | Source layout: root `src/`, `modules/<name>/src/` |
| [adr/ADR-004](adr/ADR-004-tailwind-v4-scoped-styling.md) | Tailwind v4, one scoped stylesheet |
| [adr/ADR-005](adr/ADR-005-backward-compatibility.md) | Never rename/remove PHP hooks or public API; pro 2.2.0 keeps working; antd removed, JS hooks retired |
| [rest-api.md](rest-api.md) | Every REST route needed: existing, to change, new; ajax → REST mapping |
| [storefront-impact.md](storefront-impact.md) | What changes for shoppers/vendors per module, cross-cutting storefront risks, storefront tests |
| [pro-migration-spec.md](pro-migration-spec.md) | Moving the pro plugin itself: inventory, handshake, legacy bundle for old lite, build, per-module tasks, release order |
| [pro-compat-review.md](pro-compat-review.md) | Review of "update lite only, keep old pro": what works, 7 gaps, rules R1–R6, test matrix |
| [compat-contract.md](compat-contract.md) | What pro and third parties depend on: hooks, classes, options, slugs |
| [compat/](compat/) | Hook baselines for the CI check |
| [report.md](report.md) | Design vs current features vs plugin-ui: gaps, blockers, questions for design/product |
| [findings-features-A.md](findings-features-A.md) | Current settings: Countdown, Stock Bar, Sales Notification, Free Shipping, Floating Bar |
| [findings-features-B.md](findings-features-B.md) | Current settings: BOGO, Order Bump, Quick View, Fly Cart, Direct Checkout, admin shell, endpoints |

Designs: https://storegrowth-design.vercel.app · Design system: https://github.com/getdokan/plugin-ui · Reference build: `../dokan-lite`
