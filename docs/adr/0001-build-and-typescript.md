# ADR-001: Single webpack build following dokan-lite, TypeScript, no monorepo

- Status: Accepted
- Date: 2026-09-25
- Related: ADR-002, ADR-003

## Context

The admin JS used to be a Lerna monorepo: 12 npm packages (root `assets/`, `integrations/assets/`, `modules/*/assets/`), each with its own `package.json`, `node_modules` and `wp-scripts build`, written in untyped JS on antd. That gave:

- **Duplicated dependencies.** Every package installed its own React tree; shared code was copied into every bundle.
- **Store name clashes.** Two `@wordpress/data` stores were both registered as `spsg`.
- **Slow, fragmented builds.** 12 `wp-scripts` runs and 22 `watch:*`/`build:*` scripts.
- **No shared types or aliases.** No single tsconfig, no single lint config.

`@wedevs/plugin-ui` is about 3.5 MB. If every module bundle imported it, each one would inline its own copy.

dokan-lite (and dokan-pro) solve this with:

- one `webpack.config.js` extending `@wordpress/scripts`;
- `webpack-entries.js` listing every entry;
- `webpack-dependency-mapping.js`, which maps shared packages to `window.*` globals;
- shared UI shim entries (`src/externals/plugin-ui.js` → `window.dokan.pluginUI`);
- PHP that registers each bundle from its `.asset.php` file, so WordPress loads dependencies in the right order.

## Decision

There is one webpack config and one `npm run build` run. It emits separate output files:

- **Core** (`build/`): the admin app (shell, dashboard, modules page, settings), the shared runtime libraries, and the Tailwind stylesheet.
- **Per module** (`modules/<name>/assets/js/`): one admin bundle per module, plus any storefront blocks bundle.
- **Integrations** (`build/integrations/`): the Dokan bundles.

It is not a separate webpack config per module.

1. **No Lerna, no npm workspaces.** All dependencies are in the root `package.json`; there is no nested `package.json` or `node_modules`.
2. **dokan-lite's file set at the plugin root:**
   - `webpack.config.js`: extends `@wordpress/scripts/config/webpack.config`, filesystem cache, `MiniCssExtractPlugin`, asset rules.
   - `webpack-entries.js`: every entry in one place.
   - `webpack-dependency-mapping.js`: `requestToExternal` / `requestToHandle` for `DependencyExtractionWebpackPlugin`.
   - `postcss.config.js`: `@tailwindcss/postcss` (ADR-003).
   - `tsconfig.json` (§8).
3. **Shared runtime bundles, exposed as globals** (the dokan-lite `library: { type: 'window' }` pattern):

   | Entry | Global | WP handle | Import specifier |
   |---|---|---|---|
   | `plugin-ui` (shim `src/externals/plugin-ui.js`) | `window.storegrowth.pluginUI` | `spsg-plugin-ui` | `@wedevs/plugin-ui` |
   | `components` (`src/components/index.ts`) | `window.storegrowth.components` | `spsg-components` | `@storegrowth/components` |
   | `utilities` (`src/utilities/index.ts`) | `window.storegrowth.utilities` | `spsg-utilities` | `@storegrowth/utilities` |
   | `hooks` (`src/hooks/index.ts`) | `window.storegrowth.hooks` | `spsg-hooks` | `@storegrowth/hooks` |

   There is no global data store. Shared state (the module list) is a React context in `@storegrowth/hooks`; because that bundle is shared, module bundles get the same context instance as the shell. Everything else is component state.

   Module bundles import these bare specifiers. The dependency mapping turns them into globals, and the generated `.asset.php` lists the handles. WordPress then loads core before modules, and each shared library is downloaded once.

   Packages that plugin-ui already bundles and re-exports are taken from it, not imported bare (which would bundle a second copy): charts use `import { recharts } from '@wedevs/plugin-ui'` (plugin-ui's `dist` inlines recharts, so it can't be split into a bundle of its own). `.eslintrc.js` blocks the bare `recharts` import.
4. **Output layout.** `output.path = build/` with `clean: true`, which is safe because it's a dedicated folder. Every entry is listed by hand in `webpack-entries.js` (no auto-discovery). Entry keys set the file paths:
   - core: `build/admin.js`, `build/tailwind.css`, `build/plugin-ui.js`, …
   - modules: `modules/<name>/assets/js/admin.js` (+ `admin.asset.php`), `modules/upsell-order-bump/assets/js/blocks.js`. A module's compiled files live with the module. The entry key is relative to `build/` (`../modules/<name>/assets/js/<bundle>`, helper `moduleEntry()`), so `clean` never touches module folders. **Only the generated names are git-ignored** (`admin.js`, `*.asset.php`, `*.js.map` under `modules/*/assets/js/`): the hand-written storefront scripts in the same folder stay tracked and must not use those names. A new bundle name gets its own `.gitignore` line.
   - integrations: `build/integrations/<integration>/<bundle>.js`
5. **Pro plugin.** Pro copies the same `webpack-dependency-mapping.js` rules, externalising `@wedevs/plugin-ui` and `@storegrowth/*` to the lite globals. Otherwise pro would inline its own copy of plugin-ui. Pro's bundles depend on lite handles through `.asset.php`.
6. **No antd.** antd, react-fa-icon-picker, `@getdokan/dokan-ui` and the other legacy UI packages are not dependencies; icons come from `lucide-react`. PHP that enqueues a bundle skips a missing build file instead of failing.
7. **Storefront code.** The hand-written storefront JS/CSS in `modules/<name>/assets/{js,css,scripts}` isn't built by webpack. New storefront code that needs a build goes in `modules/<name>/src/storefront/` (ADR-002) and is a module entry like the admin bundle (e.g. Order Bump's checkout block: `moduleEntry( 'upsell-order-bump', 'blocks', './modules/upsell-order-bump/src/storefront/blocks/index.tsx' )` → `assets/js/blocks.js`, name added to `.gitignore`).
8. **TypeScript first.**
   - All admin code is `.ts`/`.tsx`. No new `.js` (the plugin-ui shim is the exception).
   - `tsconfig.json` follows dokan-lite: `strict: true`, `moduleResolution: "bundler"`, `jsx: "react-jsx"`, `skipLibCheck`; `include` covers `src/`, `modules/*/src/`, `integrations/src/` and `types/`; `paths` mirror the webpack aliases (`@storegrowth/*`).
   - wp-scripts compiles TS through Babel, which strips types without checking them, so `npm run type-check` (`tsc --noEmit`) runs in CI and before every release (`npm run release`).
   - Global and external typings live in `types/` (`window.spsgAdmin`, `window.storegrowth.*`, the `@storegrowth/*` modules, CSS imports).
   - The server owns field definitions, defaults and sanitization (ADR-007, ADR-009); TypeScript types their shape and never repeats field lists.
   - New symbols get `@since SPSG_VERSION`; `bin/version-replace.sh` sweeps `.ts`/`.tsx` too.

## Consequences

**Positive:**
- One `npm install` and one `npm run build`/`start`.
- One lockfile, one tsconfig, one lint config.
- plugin-ui ships once per page.
- Type errors are caught at build/CI time.
- The same mental model as dokan-lite/pro, so the Dokan team can work on it.

**Negative:**
- A full rebuild covers all modules. The filesystem cache keeps rebuilds fast.
- The shim re-exports `@wedevs/plugin-ui/dist/index.js`, so anything missing from plugin-ui's root export is still unavailable (StoreGrowth builds its own control, e.g. `src/components/color-picker.tsx`).
- The root `package.json` has no `"type": "module"`, because dokan-lite's webpack files are CommonJS; ESM scripts use `.mjs` (`bin/archiver.mjs`).

## Alternatives considered

| Option | Why rejected |
|---|---|
| Keep Lerna, add plugin-ui per package | Duplicate dependencies, plugin-ui inlined 12 times; "never use a monorepo" |
| One webpack config per module | Same duplication, and no shared externals mapping |
| Vite | Different from the rest of the weDevs/Dokan stack; wp-scripts gives `.asset.php` dependency extraction for free |
| One bundle containing everything | Inactive modules would ship code; lazy-loading adds complexity. Separate module entries let PHP enqueue only active modules |
| Incremental port, keeping antd underneath | Two design systems on one page and a double bundle cost; the designs don't map to antd |
| JS with JSDoc types | Weaker guarantees; dokan-lite has standardised on TS |
