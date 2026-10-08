# StoreGrowth admin redesign

| Document | What it is |
|---|---|
| [migration-spec.md](migration-spec.md) | The plan: target build, file tree, PHP changes, data rules, phases |
| [modules/](modules/README.md) | Per-module migration specs: core shell + 10 modules, with field maps, data changes, REST, compat, tasks |
| [adr/RDR-001](adr/RDR-001-typescript-first-full-rewrite.md) | Redesign decision: TypeScript-first full rewrite; pro extends the PHP schema |
| [../adr/](../adr/README.md) | Core system ADRs (apply beyond the redesign): ADR-001 build, ADR-002 source layout, ADR-003 Tailwind scoping, ADR-004 backward compatibility, ADR-005 storefront standard, ADR-006 admin ajax client |
| [rest-api.md](rest-api.md) | Every REST route needed: existing, to change, new; ajax → REST mapping |
| [storefront-impact.md](storefront-impact.md) | What changes for shoppers/vendors per module, cross-cutting storefront risks, storefront tests |
| [pro-migration-spec.md](pro-migration-spec.md) | Moving the pro plugin itself: inventory, handshake, legacy bundle for old lite, build, per-module tasks, release order |
| [pro-compat-review.md](pro-compat-review.md) | Review of "update lite only, keep old pro": what works, 7 gaps, rules R1–R6, test matrix |
| [compat-contract.md](compat-contract.md) | What pro and third parties depend on: hooks, classes, options, slugs |
| [tests/compat/](../../tests/compat/) | Hook baselines for the CI check (`npm run check:hooks`) |
| [report.md](report.md) | Design vs current features vs plugin-ui: gaps, blockers, questions for design/product |
| [findings-features-A.md](findings-features-A.md) | Current settings: Countdown, Stock Bar, Sales Notification, Free Shipping, Floating Bar |
| [findings-features-B.md](findings-features-B.md) | Current settings: BOGO, Order Bump, Quick View, Fly Cart, Direct Checkout, admin shell, endpoints |

Designs: https://storegrowth-design.vercel.app · Design system: https://github.com/getdokan/plugin-ui · Reference build: `../dokan-lite`
