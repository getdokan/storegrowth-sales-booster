---
name: storegrowth-frontend-dev
description: Add or modify StoreGrowth (Sales Booster) frontend code — the TypeScript admin app (plugin-ui, Tailwind v4, react-router), module settings pages, shared components/hooks/utilities, the settings engine client, live previews, storefront CSS/JS, and the single webpack build. Use when creating a page, component, route, field, preview or storefront widget, or touching the build.
---

# StoreGrowth Frontend Development

Rules live in the ADRs (`docs/adr/`); this skill is the how-to. For PHP (REST, enqueue, schema) see `storegrowth-backend-dev`; for a whole new module see `storegrowth-module-dev`.

## Build (ADR-001)

One `@wordpress/scripts` webpack build, no monorepo:
- `webpack-entries.js` — every entry listed by hand. Core: `admin`, `header`, `tailwind`, and the shared bundles `plugin-ui`, `components`, `utilities`, `hooks` (exposed as `window.storegrowth.*`). Modules: `moduleEntry( '<id>', 'admin', './modules/<id>/src/admin/index.tsx' )`, written to `modules/<id>/assets/js/admin.js`.
- `webpack-dependency-mapping.js` — `@wedevs/plugin-ui` and `@storegrowth/*` are externals (handles `spsg-plugin-ui`, `spsg-components`, `spsg-utilities`, `spsg-hooks`); `@wordpress/*` map to WordPress's own scripts.
- Output: core in `build/` (git-ignored); module bundles in `modules/<id>/assets/js/`, where only the generated names (`admin.js`, `*.asset.php`, `*.js.map`) are git-ignored — hand-written storefront scripts there stay tracked and must not use those names; a new bundle name needs its own `.gitignore` line. Each bundle gets a `*.asset.php` with its dependencies.

```bash
npm run start        # watch; restart after adding an entry to webpack-entries.js
npm run type-check   # tsc --noEmit
npm run lint:js      # read-only; fix reports by editing, never --fix
```

Don't run `npm run build` while the dev server is running; reload the page.

## Source layout (ADR-002)

- `src/admin/` — app shell (`index.tsx` mounts on `#spsg-admin-app`, `app.tsx`, `routes.tsx`, `pages/*`). `src/header/` — the top bar bundle.
- `src/components/` → `@storegrowth/components`; `src/hooks/` → `@storegrowth/hooks`; `src/utilities/` → `@storegrowth/utilities`.
- `modules/<id>/src/admin/` — everything for a module's admin page (`index.tsx` registers the route; page, `preview/`, `types.ts`, `components/`).
- `modules/<id>/src/storefront/` — **new** storefront code that needs a build (TypeScript, e.g. `blocks/`), a `moduleEntry()` into `assets/js/`. Existing hand-written storefront JS/CSS stays in `modules/<id>/assets/` and isn't moved. `src/` isn't in the release zip, so everything under it must be built.
- TypeScript, 4-space indentation, **kebab-case** file and folder names inside every `src/` (lint-enforced); PascalCase component names.

## Tech

| Need | Use |
|---|---|
| UI components | plugin-ui (`@wedevs/plugin-ui`) first, then `@storegrowth/components` |
| Styling | Tailwind v4 utilities, scoped to `.spsg-layout` (ADR-003); tokens `sg-*` in `src/base-tailwind.css` |
| Icons | `lucide-react` |
| Routing | react-router v6 `HashRouter`, imported **only** from `@storegrowth/hooks` (lint blocks `react-router-dom`) |
| Data | REST `sales-booster/v1` via `@storegrowth/utilities` (`api.ts`); legacy ajax only through `ajax()` (ADR-006) |
| State | local React state and context; **no global store** |
| Extensibility | `@wordpress/hooks` filters named `storegrowth.*` |
| i18n | `@wordpress/i18n`, text domain `storegrowth-sales-booster` |

No antd, no `@wordpress/data` stores, no dokan-ui.

## Adding a module settings page

1. PHP first: the module's `SettingsSchema` (see `storegrowth-backend-dev`) gives `GET/POST sales-booster/v1/settings/<id>`.
2. `modules/<id>/src/admin/types.ts` — the values interface (API types) and the keys each tab saves.
3. `modules/<id>/src/admin/<id>-page.tsx`:

```tsx
const settings = useModuleSettings< StockBarValues >( 'stock-bar' );
const { values, setValue, isLocked, errors } = settings;

<FeatureLayout moduleId="stock-bar">
    <CardHead title={ __( 'Stock Bar', 'storegrowth-sales-booster' ) } />
    <SettingsSplit preview={ <LivePreview widget={ <StockBarWidget values={ values } /> } /> }>
        <SettingsTabs label={ … } tabs={ [ { id: 'content', label: …, content: … }, … ] } />
    </SettingsSplit>
</FeatureLayout>
```

   Each tab ends with `<SaveBar onSave={ () => settings.save( keys ) } onReset={ () => settings.reset( keys ) } disabled={ ! settings.isDirty( keys ) } saving={ settings.saving } />`. Toast success/failure with plugin-ui `toast` and `errorMessage()`.
4. `modules/<id>/src/admin/index.tsx` — register the route:

```tsx
addFilter( 'storegrowth.admin.routes', 'storegrowth/<id>', ( routes ) => [
    ...routes.filter( ( route ) => route.id !== '<id>' ),
    { id: '<id>', path: '/<id>', element: <ModulePage /> },
] );
```

5. Add the webpack entry and enqueue `modules/<id>/assets/js/admin.js` (with its `admin.asset.php`) on `storegrowth_page_spsg-settings` / `-modules`, plus the module's storefront stylesheet for the preview, from an `AdminPage` class registered in the always-loaded `ServiceProvider` (so the page works right after the module is switched on). Reference: `modules/stock-bar/includes/AdminPage.php`.

Reference implementation: `modules/stock-bar/src/admin/`.

## Fields and shared components

- Fields (`src/components/fields/`): `TextField`, `NumberField` (`suffix="px"`, emits a number), `SelectField`, `ColorField` (6-digit hex swatch), `SwitchField`, `SwitchCard`, `AlignmentField` (left/center/right), `BoxModelField` (margin/padding, `box` type), `CheckboxField` + `CheckboxGroup`. All take `label`, value/onChange, `locked` (pro field without pro → disabled + Pro badge), `error`, `help`.
- Frame: `FeatureLayout` (feature rail + page area), `CardHead`, `SettingsSplit`, `SettingsTabs`, `Accordion`, `SaveBar`, `TemplatePicker`, `ColorPicker`.
- `setValue()` takes the API type (a number, not the input's string), or `isDirty` sees a change that isn't one.
- **No native `<button>`, `<input>`, `<select>` in admin code.** Use plugin-ui: `Button` (buttons, links styled as buttons), `Toggle` (on/off icon button), `ToggleGroup` / `ToggleGroupItem` (segmented choice; guard `onValueChange` against `[]`, a click on the pressed item empties it), `Tabs`, `Select` (pass `items` so the trigger shows labels), `Input` / `InputGroup`, `Switch` (via `ToggleSwitch`), `Checkbox`, the `Field*` parts. Restyle them to the design with `sg-*` classes.
- plugin-ui's padding uses logical properties (`ps-*` / `pe-*`); override with the same (`ps-4 pe-4`), `px-4` loses.
- Build a new control only when plugin-ui and these parts can't do it; keep it simple and reusable.

## Live preview (ADR-005 S10)

- `LivePreview` gives the device switch, dark toggle, browser frame and a mock product page; the module passes `widget` (or `banner` / `overlay`) as a node or `( { device, theme } ) => node`.
- The widget renders the **storefront's own markup and classes** inside `.spsg-storefront` (the admin reset skips it), styled by the real storefront stylesheet enqueued on the admin page. Feed live values as the storefront gets them (inline styles or `--spsg-<module>-*` variables).
- Dark/mobile looks: `group-data-[theme=dark]/frame:` and `group-data-[device=mobile]/frame:` variants.

## Styling rules (ADR-003)

- Tailwind utilities are `important` and scoped to `.spsg-layout`; preflight is scoped too and stops at `.spsg-wp-notices`, `.spsg-storefront` and `@wordpress/components` roots.
- Use the `sg-*` tokens (`bg-sg-brand`, `text-sg-text`, `border-sg-stroke`, …) and plugin-ui variants; avoid one-off hex values when a token exists.
- plugin-ui portals (select lists, popovers, dialogs) carry the ThemeProvider class, so `.spsg-layout` styles reach them.
- Match the design reference's layout; visual values come from the design system.

## Storefront CSS/JS (ADR-005)

- Plain CSS/JS in `modules/<id>/assets/` — no Tailwind, no React.
- Settings arrive as `--spsg-<module>-<token>` variables with the default as fallback: `font-size: var(--spsg-stock-bar-count-size, 11px);`. Printed by `StorefrontStyle` only for saved keys.
- Shared base: `spsg-storefront-base` (z-index scale `--spsg-z-*`) and `spsg-storefront-core` (`window.spsgStorefront`: `isMobile`, `matchesDevice`, `isDismissed`, `dismiss`, `onTrigger`).
- Never rename or remove existing classes, selectors or handles; themes and pro target them (ADR-004).

## i18n and versions

- `__`, `_n`, `sprintf` from `@wordpress/i18n`; `/* translators: */` before placeholders; never concatenate translated strings.
- `@since SPSG_VERSION` on new exported functions/components/hooks (version-replace scans `.ts`/`.tsx`).

## Before committing

`npm run type-check`, `npm run lint:js`, test the page in the browser against the design reference and the storefront; run the review agents (`.claude/agents/`: `sg-designer`, `sg-qa`, `sg-architect`).

## Key files

- `src/admin/routes.tsx`, `src/admin/app.tsx` — routes and shell
- `src/hooks/use-module-settings.ts`, `src/utilities/api.ts`, `src/utilities/ajax.ts`
- `src/components/index.ts`, `src/components/fields/`, `src/components/live-preview.tsx`
- `src/base-tailwind.css` — tokens and scoping
- `modules/stock-bar/src/admin/` — reference module page
- `webpack-entries.js`, `webpack-dependency-mapping.js`
