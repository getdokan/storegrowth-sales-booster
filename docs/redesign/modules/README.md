# Module-wise migration specs

One spec per migration unit. They all follow the rules in `../migration-spec.md` and ADR-001…005, so each file lists only what's specific to that unit.

| Spec | Design | Phase | Size | Type |
|---|---|---|---|---|
| [00-core-shell.md](00-core-shell.md) | [index](https://storegrowth-design.vercel.app/index.html) · [modules](https://storegrowth-design.vercel.app/modules.html) | 1 | L | Shell, dashboard, modules page, shared components |
| [stock-bar.md](stock-bar.md) | [stock-bar](https://storegrowth-design.vercel.app/stock-bar.html) | 2 (pilot) | S | Settings |
| [countdown-timer.md](countdown-timer.md) | [countdown-timer](https://storegrowth-design.vercel.app/countdown-timer.html) | 3 | M | Settings + product meta |
| [sales-pop.md](sales-pop.md) | [sales-notification](https://storegrowth-design.vercel.app/sales-notification.html) | 3 | L | Settings |
| [progressive-discount-banner.md](progressive-discount-banner.md) | [free-shipping-rules](https://storegrowth-design.vercel.app/free-shipping-rules.html) | 3 | M | Settings |
| [floating-notification-bar.md](floating-notification-bar.md) | [floating-bar](https://storegrowth-design.vercel.app/floating-bar.html) | 3 | M | Settings |
| [quick-view.md](quick-view.md) | [quick-view](https://storegrowth-design.vercel.app/quick-view.html) | 3 | M | Settings |
| [fly-cart.md](fly-cart.md) | [fly-cart](https://storegrowth-design.vercel.app/fly-cart.html) | 3 | M | Settings |
| [direct-checkout.md](direct-checkout.md) | [direct-checkout](https://storegrowth-design.vercel.app/direct-checkout.html) | 3 | M | Settings + product meta |
| [bogo.md](bogo.md) | [list](https://storegrowth-design.vercel.app/bogo.html) · [edit](https://storegrowth-design.vercel.app/bogo-edit.html) | 4 | XL | CRUD + global settings + Dokan |
| [upsell-order-bump.md](upsell-order-bump.md) | [list](https://storegrowth-design.vercel.app/order-bump.html) · [edit](https://storegrowth-design.vercel.app/order-bump-edit.html) | 4 | L | CRUD + checkout block |

Size key: S ≈ 3–5 dev-days, M ≈ 1–1.5 weeks, L ≈ 2 weeks, XL ≈ 3 weeks. These are rough estimates and include E2E tests.

## Execution order

Work runs in this sequence. A step starts only when the steps it depends on are merged.

| Step | Spec / work | Depends on | Can run in parallel with |
|---|---|---|---|
| 0 | plugin-ui upstream: export `ColorPicker`, `RadioImageCard`, `CombineInput`, …; alpha off (U1, U4) | — | 1a |
| 1a | `00-core-shell`: build system (remove Lerna, webpack trio, TS, Tailwind v4), shared bundles, CI checks (hook baseline, API test) | — | 0 |
| 1b | `00-core-shell`: shell UI (TopBar, feature rail, deactivated modal), Dashboard, Modules page, `/modules` + `/dashboard` REST | 0, 1a | 1c |
| 1c | Settings engine: PHP settings registry/service (merge, same value domain, pro gating), `GET/POST /settings/{module}`, TS settings store; `LivePreview` frame, `Accordion`, `SaveBar` | 1a | 1b |
| 2 | `stock-bar` (pilot) — first `TemplatePicker` | 1b, 1c | — |
| 3 | `countdown-timer` — first `BoxModelInput` | 2 | 4 |
| 4 | `sales-pop` — first `ProductSearch`, `TypographyRow` | 2 | 3 |
| 5 | `progressive-discount-banner` — first bar fragment, `ModeNumber`, `IconPicker` | 2 | 7, 8 |
| 6 | `floating-notification-bar` — reuses the bar fragment; first `DateRange` | 5 | 7, 8 |
| 7 | `quick-view` | 2 | 5, 6, 8 |
| 8 | `fly-cart` — first `PickerCards` | 2 | 5, 6, 7 |
| 9 | `direct-checkout` | 3 (`BoxModelInput`), 8 (Fly Cart redirect) | — |
| 10 | `bogo`: REST bug fixes first, then list, editor, category messages (R2), Dokan vendor screens | 4 (`ProductSearch`), 6 (`DateRange`) | — |
| 11 | `upsell-order-bump`: REST namespace, cap, list, editor, checkout block | 10 (list/editor pattern) | — |
| 12 | Cleanup: delete antd, `SGSettings`, `assets/src`, `modules/*/assets/src`, `integrations/assets`, Lerna leftovers | 11 | — |
| 13 | `../pro-migration-spec.md` (pro P1–P7) | 12, plus one stable lite patch release | — |
| 14 | Docs, changelog, release | 13 | — |

Why this order:
- **Stock Bar first:** smallest page and closest to the schema. It proves the whole pattern.
- Each later module introduces **one or two new shared components**, so they're built once and reused.
- **BOGO and Order Bump last:** CRUD work, and it reuses everything before it.
- **Pro last:** lite ships compatible with pro 2.2.0 before pro changes anything.

Steps 1c–11 are blocked only by the product decisions in each spec's §9; get them answered before that module starts.

## Design fidelity rule

**Build every screen exactly as the linked mockup.** That covers layout, spacing, sizes, typography, colours, radius, icons, copy, tab order, field order, control types, preview behaviour and empty states.

- **The mockup is the source of truth.** The HTML/CSS at https://storegrowth-design.vercel.app (`assets/ui.css`, `assets/theme.js`) defines the values. Match them with Tailwind `@theme` tokens and plugin-ui theming. If a plugin-ui component can't reach the mockup through props/className/theme, wrap or restyle it locally; don't accept the component's default look.
- **Allowed deviations** (the only ones; each must be listed in that module's §9 and signed off by design before merge):
  1. **Mockup bugs listed in the spec:** missing Save buttons, duplicate fields, wrong help text, checkboxes that should be a radio, the Order Bump preview frame. Fixed in the design's own visual style.
  2. **Compatibility-required UI** (ADR-005, R1/R2): the pro-only "Advanced (Pro)" section and the BOGO category-messages screen, styled with the same components as the rest of the page.
  3. **Pro lock states:** the mockups don't show them. Use the design's own crown/amber style (`sg-amber-pro`).
  4. **plugin-ui behaviours we accept** (report §3): DataViews bulk bar and pagination, delete confirm dialog.
- **Visual QA per module before merge:**
  - side-by-side screenshots of the mockup and the built page at 1440px, 1100px and 782px widths (Playwright), stored in the PR;
  - differences in spacing, colour or copy block the merge unless they're in the deviation list;
  - a reviewer from design approves the PR.

## Template every spec follows
1. **Summary:** phase, dependencies, size.
2. **Current state:** storage, transport, hooks (PHP kept, JS retired).
3. **Target design:** screen, tabs, preview.
4. **Field map:** design field → option key → type/default → tier → component.
5. **Data changes:** migrations. Option keys are never renamed.
6. **REST:** routes (see `../rest-api.md`).
7. **Compatibility:** PHP hooks, ajax adapters, retired JS hooks and their replacements.
8. **Components:** shared ones reused, new ones built.
9. **Open questions / design issues.**
10. **Tasks and definition of done.**

## Definition of done shared by every module
- Screen matches the linked mockup (design fidelity rule); visual QA screenshots attached; design sign-off on any listed deviation.
- Admin page built from `modules/<name>/src/` in TypeScript; no antd import left in the module.
- `GET/POST /settings/<id>` (or the CRUD routes) is the only transport the UI uses.
- The ajax get/save actions are still registered, as adapters over the same service.
- Stored option is byte-identical for unchanged fields (characterisation test: old save → new read, new save → old shape).
- Pro fields are editable with pro active, locked without pro, and ignored by save when pro is inactive.
- E2E passes for no pro, pro 2.2.0 and new pro: save, reset, reload, storefront renders the saved values.
- The PHP hook baseline check passes.
- `modules/<name>/assets/src`, `modules/<name>/assets/package.json` and `modules/<name>/assets/build` are deleted. Storefront `assets/js` and `assets/css` stay untouched.
