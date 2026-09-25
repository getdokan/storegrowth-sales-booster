# ADR-001: Single webpack build following dokan-lite, no monorepo

- Status: Accepted
- Date: 2026-09-25
- Related: RDR-001 (`../redesign/adr/`), ADR-002, ADR-003, `../redesign/migration-spec.md`

## Context

The admin JS is a Lerna monorepo today:

- 12 npm packages: root `assets/`, `integrations/assets/`, and `modules/*/assets/` for 10 modules.
- Each package has its own `package.json`, `node_modules` and `wp-scripts build`.
- Build output: `assets/build/{settings,modules,notices}.js`, one `modules/<name>/assets/build/settings.js` per module (Order Bump also builds `blocks.js`), and 5 Dokan bundles in `integrations/assets/build/`.

Problems with this setup:

- **Duplicated dependencies.** Every package installs its own React/antd tree. Shared code is copied into every bundle.
- **Store name clash.** Two `@wordpress/data` stores are both registered as `spsg`, which breaks if they ever load on the same page.
- **Slow, fragmented builds.** 12 `wp-scripts` runs, and 22 `watch:*`/`build:*` scripts to maintain.
- **No shared types or aliases.** There's no single tsconfig and no single lint config.

The redesign adds `@wedevs/plugin-ui`, which is about 3.5 MB. If every module bundle imports it, each one inlines its own copy.

dokan-lite (and dokan-pro) already solve this with:

- one `webpack.config.js` extending `@wordpress/scripts`;
- `webpack-entries.js` listing every entry;
- `webpack-dependency-mapping.js`, which maps shared packages to `window.*` globals;
- shared UI shim entries (`src/externals/plugin-ui.js` → `window.dokan.pluginUI`);
- PHP that registers each bundle from its `.asset.php` file, so WordPress loads dependencies in the right order.

## Decision

**Interpretation of "core in a single build, module-specific separate build file":** there is one webpack config and one `npm run build` run. It emits separate output files:

- **Core** (`build/`): the admin app (shell, dashboard, modules page, settings), the shared runtime libraries, and the Tailwind stylesheet.
- **Per module** (`build/modules/<name>/`): one admin bundle per module, plus any storefront blocks bundle.
- **Integrations** (`build/integrations/`): the Dokan bundles.

It is not a separate webpack config per module.

1. **Remove Lerna and npm workspaces.**
   - Delete `lerna.json`, the `workspaces` key, and every nested `package.json` and `node_modules` under `assets/`, `modules/*/assets/` and `integrations/assets/`.
   - All dependencies move to the root `package.json`.
2. **Adopt dokan-lite's file set at the plugin root:**
   - `webpack.config.js`: extends `@wordpress/scripts/config/webpack.config`, filesystem cache, `MiniCssExtractPlugin`, asset rules.
   - `webpack-entries.js`: every entry in one place.
   - `webpack-dependency-mapping.js`: `requestToExternal` / `requestToHandle` for `DependencyExtractionWebpackPlugin`.
   - `postcss.config.js`: `@tailwindcss/postcss` (ADR-003).
   - `tsconfig.json`: see RDR-001.
3. **Shared runtime bundles, exposed as globals** (the dokan-lite `library: { type: 'window' }` pattern):

   | Entry | Global | WP handle | Import specifier |
   |---|---|---|---|
   | `plugin-ui` (shim `src/externals/plugin-ui.js`) | `window.storegrowth.pluginUI` | `spsg-plugin-ui` | `@wedevs/plugin-ui` |
   | `components` (`src/components/index.ts`) | `window.storegrowth.components` | `spsg-components` | `@storegrowth/components` |
   | `utilities` (`src/utilities/index.ts`) | `window.storegrowth.utilities` | `spsg-utilities` | `@storegrowth/utilities` |
   | `hooks` (`src/hooks/index.ts`) | `window.storegrowth.hooks` | `spsg-hooks` | `@storegrowth/hooks` |

   There is no global data store. Shared state (the module list) is a React context in `@storegrowth/hooks`; because that bundle is shared, module bundles get the same context instance as the shell. Everything else is component state.

   Module bundles import these bare specifiers. The dependency mapping turns them into globals, and the generated `.asset.php` lists the handles. WordPress then loads core before modules, and each shared library is downloaded once.
4. **Output layout.** `output.path = build/` with `clean: true`, which is safe because it's a dedicated folder. Every entry is listed by hand in `webpack-entries.js` (no auto-discovery); a module or integration is added there when it migrates. Entry keys set the file paths:
   - core: `build/admin.js`, `build/tailwind.css`, `build/plugin-ui.js`, …
   - modules: `build/modules/<name>/admin.js`, `build/modules/upsell-order-bump/blocks.js`
   - integrations: `build/integrations/<bundle>.js`
5. **Pro plugin.** Pro copies the same `webpack-dependency-mapping.js` rules, externalising `@wedevs/plugin-ui` and `@storegrowth/*` to the lite globals. Otherwise pro would inline its own copy of plugin-ui. Pro's bundles depend on lite handles through `.asset.php`.
6. **No legacy admin bundles.** antd, react-fa-icon-picker, `@getdokan/dokan-ui` and the other legacy UI packages are removed; icons come from `lucide-react`. The old antd admin screens (`assets/src`, `modules/*/assets/src`, `integrations/assets/src`) are no longer built, and the PHP that enqueued them skips a missing build file instead of failing. Their sources are deleted as each module migrates.
7. **Storefront code is out of scope.** The hand-written storefront JS/CSS in `modules/<name>/assets/{js,css}` isn't built by webpack today and stays as it is. The one built storefront bundle, Order Bump's checkout block, moves into this build as a module entry.

## Consequences

**Positive:**
- One `npm install` and one `npm run build`/`start`.
- One lockfile, one tsconfig, one lint config.
- plugin-ui ships once per page.
- The same mental model as dokan-lite/pro, so the Dokan team can work on it.

**Negative:**
- A full rebuild covers all modules. The filesystem cache keeps rebuilds fast, and a module-only watch can filter entries with `--env module=<id>` (see migration spec).
- The shim re-exports `@wedevs/plugin-ui/dist/index.js`, so anything missing from plugin-ui's root export (e.g. `ColorPicker`) is still unavailable. This inherits plugin-ui issue U1 (`../redesign/report.md` §6); it doesn't work around it.
- All 12 PHP enqueue sites change paths (`assets/build` → `build`).
- The root `package.json` drops `"type": "module"`, because dokan-lite's webpack files are CommonJS. `bin/archiver.js` (ESM) is renamed to `bin/archiver.mjs`.

## Alternatives considered

| Option | Why rejected |
|---|---|
| Keep Lerna, add plugin-ui per package | Duplicate dependencies, plugin-ui inlined 12 times, user direction is "never use monorepo" |
| One webpack config per module | Same duplication, and no shared externals mapping |
| Vite | Different from the rest of the weDevs/Dokan stack; wp-scripts gives `.asset.php` dependency extraction for free |
| One bundle containing everything | Inactive modules would ship code; lazy-loading adds complexity. Separate module entries let PHP enqueue only active modules |
