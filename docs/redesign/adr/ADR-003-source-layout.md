# ADR-003: Source layout — root `src/`, `modules/<name>/src/`

- Status: Accepted
- Date: 2026-09-25
- Related: ADR-001, ADR-002

## Context

Today admin source lives in `assets/src/` (core) and `modules/<name>/assets/src/` (per module). Those folders sit next to storefront JS/CSS (`assets/js`, `assets/css`), images, fonts and build output. dokan-lite keeps new TS source in a root `src/`, with `assets/` holding only static files and output.

## Decision

1. **Core admin source goes in root `src/`:**
   ```
   src/
     admin/            # entry: shell, router, pages (dashboard, modules, settings)
     components/       # StoreGrowth components on plugin-ui (report §6)
     fields/           # custom schema field variants (product search, date, box model, …)
     hooks/            # shared React hooks
     utilities/        # helpers, formatters
     api/              # typed apiFetch clients (settings, modules, bogo, order-bumps)
     stores/           # @wordpress/data stores, one per resource
     externals/        # plugin-ui shim (ADR-001)
     base-tailwind.css # the single Tailwind entry (ADR-004)
   ```
2. **Module admin source goes in `modules/<name>/src/`:**
   ```
   modules/<name>/src/
     index.tsx         # registers the module page with the shell
     schema.ts         # types for this module's settings shape
     preview/          # the LivePreview widget mock
     components/       # module-only UI (e.g. BOGO / Order Bump list + editor)
     blocks/           # storefront block bundles, when needed (Order Bump checkout)
   ```
3. **Dokan integration source goes in `integrations/src/`.**
4. **Global typings go in `types/`** at the root.
5. **`assets/` and `modules/<name>/assets/` keep only static and storefront files:** images, fonts, and the hand-written storefront `js/`/`css/`. No admin source, no build output.
6. **All build output goes in `build/`** (ADR-001). It's gitignored but ships in the release zip.
7. **Module rule:** a module's `src/` may import `@storegrowth/*` shared libraries, but not another module's `src/`. Anything two modules need goes into `src/components` or `src/fields`.

## Consequences

- Each module stays self-contained: PHP in `includes/`, templates in `templates/`, admin UI in `src/`, storefront files in `assets/`.
- `.distignore` excludes `/src`, `/modules/**/src/` (already there), `/integrations/**/src/` (already there), `/types` and `/docs`.
- `makepot --include` switches from `assets/src` to `build`, so it scans the built JS for i18n strings, as dokan-lite does with `assets/js`.
- `CLAUDE.md` "To add a module" steps change: no `assets/package.json`, add an entry in `webpack-entries.js` instead.

## Alternatives considered

| Option | Why rejected |
|---|---|
| Keep `assets/src/` | Mixes source with static and storefront files; differs from dokan-lite |
| All module UI inside root `src/modules/<name>` | Breaks module self-containment; a module's PHP and UI would live far apart |
