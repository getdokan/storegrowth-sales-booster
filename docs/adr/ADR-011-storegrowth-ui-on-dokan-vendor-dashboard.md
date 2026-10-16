# ADR-011: StoreGrowth UI on the Dokan vendor dashboard

- Status: Accepted
- Date: 2026-09-28
- Amends: ADR-003 (rule 5 and its Dokan consequence); follows ADR-001 (shared bundles), ADR-004
- First use: BOGO on the vendor dashboard (`docs/redesign/modules/bogo.md` §10, 10f2)

## Context

Dokan vendors manage their BOGO offers on Dokan's React vendor dashboard (`/dashboard/new/#/bogo`), a front-end page. The old screen was its own antd bundle with its own copy of the old editor. The new list and editor (`BogoList`, `BogoEditor`) are built on the shared bundles (`@storegrowth/*`, plugin-ui), the `sg-*` Tailwind tokens and react-router hooks, all set up for wp-admin only:

- ADR-003 says Tailwind never loads on the storefront, and that Dokan integration bundles should use Dokan's Tailwind. Dokan's stylesheet has no `sg-*` tokens, so the shared components can't be drawn with it.
- Dokan's router (its own react-router copy, `createHashRouter`) draws the route's element. The shared hooks (`useNavigate`, `useSearchParams`, …) read StoreGrowth's router context, which isn't there.
- The shared code reads `spsgAdmin` / `spsgAdminHeader`, which carry the admin ajax nonce and the module list.

## Decision

1. **One integration bundle per Dokan screen** (`integrations/src/<integration>/<bundle>/`, entry `integrations/<integration>/<bundle>` → `build/integrations/<integration>/<bundle>.js`; BOGO: `integrations/src/dokan/bogo/` → `build/integrations/dokan/bogo.js`) draws the module's own list and editor in a vendor mode (a `vendor` prop: the vendor REST route, no module frame, no admin-only parts). No second copy of a page.
2. **The shared bundles load there too.** `Assets::register_shared_bundles()` registers them (and `spsg-tailwind`, `spsg-font-inter`); the integration calls it only on its dashboard page, and its bundle depends on them (`.asset.php`). Dokan's own scripts are externals too (`@dokan/components` → `dokan-react-components`, webpack-dependency-mapping.js).
3. **Tailwind on that page, scoped to `.spsg-layout`** (ADR-003's one stylesheet, unchanged). Each page is wrapped in plugin-ui's `ThemeProvider` with `className="spsg-layout"` and its own `Toaster`. The stylesheet is printed after Dokan's (`dokan-tailwind`): both apply inside `.dokan-layout`, the later wins. It never loads on shop pages.
4. **Dokan's router is bridged, not replaced.** Each page renders the shared `Router` (react-router's low-level router, exported by `@storegrowth/hooks`) with Dokan's `location` and a navigator over Dokan's `navigate`. The shared hooks then read and change Dokan's route. Dokan's page header (title, Back, header fills) stays Dokan's.
5. **Localized data is a subset under the same names.** `spsgAdmin` = `{ restNamespace, isPro }`, `spsgAdminHeader` = `{ assets_url, header_info: { is_pro_exists, upgrade_url } }`: what the shared code reads. Never the admin ajax nonce or the module list. The REST nonce and root come from `wp-api-fetch`.

## Consequences

- A vendor screen is the admin page plus a vendor switch: fixes and fields reach both.
- The vendor dashboard downloads plugin-ui and the shared bundles (cached, shared by every StoreGrowth screen on it).
- Code that runs in vendor mode can't call admin-only context (`useModules()`, `FeatureLayout`, the ajax nonce) or read other `spsgAdmin` keys.
- Dokan's and StoreGrowth's Tailwind both apply inside the page; a clash is fixed in StoreGrowth's stylesheet.
- `spsg-tailwind` has page-wide rules outside `.spsg-layout`, which now reach the whole vendor dashboard (one stylesheet kept, no separate one):
  - `@layer theme` `:root` custom properties (`--font-sans`, `--color-*`, …); harmless while Dokan's own CSS doesn't read them. **Trigger to revisit:** Dokan's stylesheet reading or giving a value to one of them (e.g. `--font-sans`), when the later sheet decides Dokan's font.
  - `:root` `--wp-admin-theme-color*` and `--wpds-*` (WordPress components tokens, as `wp-components` sets them).
  - `[role=region] { position: relative }` and the other WordPress components / DataViews rules (the `wp-components` classes Dokan also loads). Checked on Dokan's own pages (home, Products, Orders, Withdraw; computed styles with vs without the sheet): the only difference is the `border-color` of 0-width borders on Dokan's DataViews buttons, nothing visible.
  - The wp-admin-only rules (`body:has(#spsg-admin-app)`, …) don't match there.
- The accent follows Dokan: the vendor pages' plugin-ui theme uses `var(--dokan-button-background-color, #0875FF)` for `primary`, `ring` and `accentForeground`, and `.dokan-layout .spsg-layout` sets `--color-sg-brand` / `--color-sg-brand-hover` from Dokan's button colours. The admin stays blue.
- The dashboard bundle and styles load only on Dokan's React dashboard (`/dashboard/new/`) for a `dokandar` user.
- The host draws the heading: on the vendor dashboard the list has no card title and the editor passes `hideTitle` to `ModuleSettingsPage` (Dokan's page title and Back button stand in).
