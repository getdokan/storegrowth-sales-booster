# ADR-004: Tailwind v4, one scoped stylesheet (dokan-lite pattern)

- Status: Accepted
- Date: 2026-09-25
- Related: ADR-001, report §6 (U10)

## Context

Today's styling:
- antd CSS-in-JS
- per-module SCSS (`assets/src/admin.scss`)
- `assets/src/preflight-reset.css`, which exists only to undo plugin-ui's global Tailwind preflight leaking from `dist/styles.css` into wp-admin

The mockups are Tailwind (design tokens `sg-*` in the design repo's `assets/theme.js`).

dokan-lite uses Tailwind v4 through `@tailwindcss/postcss`, with a single entry `src/base-tailwind.css`. It never imports plugin-ui's `dist/styles.css`. Instead it:
- `@source`s plugin-ui's `dist` so the class names are generated in its own build;
- scopes preflight and utilities under `.pui-root, .dokan-layout`, marked `important`.

This keeps wp-admin untouched. It also covers portals (dialogs, popovers, selects), because plugin-ui wraps portal content in `.pui-root`.

## Decision

1. **Tailwind v4** (`tailwindcss`, `@tailwindcss/postcss`, `@tailwindcss/forms`) via `postcss.config.js`. No SCSS, LESS or CSS-in-JS in new admin code.
2. **One stylesheet entry, `src/base-tailwind.css`** → `build/tailwind.css`, WP style handle `spsg-tailwind`. Every admin script handle depends on it. Module bundles emit no Tailwind of their own.
   ```css
   @layer theme, base, components, utilities;
   @import "tailwindcss/theme.css" layer(theme);
   @import "../node_modules/@wedevs/plugin-ui/src/components/wordpress/style.css";

   @source "../src/";
   @source "../modules/*/src/";
   @source "../integrations/src/";
   @source "../node_modules/@wedevs/plugin-ui/dist";

   @plugin "@tailwindcss/forms";

   @theme {
     --color-sg-brand: #0875FF;
     --color-sg-brand-soft: #EFF6FF;
     --color-sg-heading: #25262B;
     --color-sg-text: #25252D;
     --color-sg-muted: #6B7280;
     --color-sg-help: #828282;
     --color-sg-line: #E4E4E7;
     --color-sg-stroke: #E9E9E9;
     --color-sg-page: #F0F0F1;
     --color-sg-amber: #FFBC00;
     --color-sg-amber-pro: #FFBD18;
     --color-sg-chip: #F3F4F6;
     --color-sg-suffix: #F1F1F4;
     --color-sg-preview: #E6E6E6;
     --font-sans: Inter, ui-sans-serif, system-ui, sans-serif;
   }

   .pui-root,
   .spsg-layout {
     @import "tailwindcss/preflight.css" layer(base);
     @import "tailwindcss/utilities.css" important;
   }
   ```
   The full `sg-*` list comes from the design repo's `assets/theme.js`.
3. **The app root element carries `spsg-layout`.** plugin-ui's `ThemeProvider` adds `.pui-root` inside it. Brand tokens are set through `createTheme` (primary `#0875FF`, radius `8px`, Inter), as in report §6.
4. **Delete** `assets/src/preflight-reset.css` and every per-module admin SCSS file once its module migrates.
5. **Storefront styles are out of scope.** The storefront CSS under `modules/<name>/assets/css` stays plain CSS. Tailwind must not load on the storefront.
6. **Preview widgets** (`modules/<name>/src/preview`) render inside the admin, so they use Tailwind. They must mirror the storefront's CSS values (same tokens for colour, radius, spacing) rather than import storefront CSS.

## Consequences

- Fixes the global preflight leak (plugin-ui U10) without an upstream change.
- One CSS file is cached across every StoreGrowth admin page.
- Design tokens exist once, in `@theme`, and are used by both classes and plugin-ui theme tokens.
- Anything rendered outside `.spsg-layout` or `.pui-root` (e.g. WP admin notices) gets no Tailwind utilities, which is intended.
- The Dokan vendor dashboard already loads `dokan-tailwind`. Integration bundles there should use Dokan's layout class, not load `spsg-tailwind`. This needs checking in phase 4 of the migration spec.

## Alternatives considered

| Option | Why rejected |
|---|---|
| Import plugin-ui `dist/styles.css` | Global preflight leaks into wp-admin (the reason `preflight-reset.css` exists) |
| Tailwind `prefix(sg)` | Doesn't cover plugin-ui's own unprefixed classes; differs from dokan-lite |
| Tailwind per module bundle | Duplicate CSS, ordering conflicts |
