---
name: storegrowth-frontend-dev
description: Add or modify StoreGrowth (Sales Booster) frontend code — React, Ant Design, @wordpress/data stores, the admin settings SPA, and the Lerna/wp-scripts build. Use when creating components, stores, admin routes, or touching asset builds.
---

# StoreGrowth Frontend Development

Guidance for the StoreGrowth admin UI and module front-ends. For PHP enqueue/asset registration see `storegrowth-backend-dev`.

## Build system

JS is a **Lerna monorepo** built with `@wordpress/scripts` (`wp-scripts` → webpack). Each module's UI is its own npm package under `modules/{slug}/assets/`; the root `assets/` package builds the admin settings SPA.

```bash
npm install                 # root + all workspaces
npm run start               # watch ALL packages (lerna run start)
npm run build               # production build ALL packages
npm run watch:bogo          # watch ONE module (see package.json for scopes)
npm run build:bogo          # build ONE module
npm run watch:sales-booster # watch the admin/settings SPA (root assets)
```

- Lerna packages: `assets`, `integrations/assets`, `modules/*/assets` (`lerna.json`).
- Each package's `build`/`start` runs `wp-scripts build|start src/settings.js` (root also builds `src/modules.js`). Output → `build/` (committed in releases, ignored from src globs).

## Tech stack

| Tech | Usage |
|---|---|
| React (functional components) | all UI |
| Ant Design (`antd`) + `@ant-design/icons` | component library |
| `@wordpress/data` | Redux-like stores (`createReduxStore` / `register`) |
| `@wordpress/hooks` | extensibility (`addFilter`/`applyFilters`) |
| `@wordpress/i18n` | translation (`__`, `_n`, `sprintf`) |
| `react-router-dom` v6 | routing inside the settings SPA |
| `nanoid`, `dayjs` | ids, dates |

## The admin settings SPA & route injection

The Settings page renders a single React app (root `assets/src/settings.js`). **Modules inject their own admin pages by filtering `spsg_routes`** via `@wordpress/hooks` — this is the central frontend extension point:

```jsx
import { addFilter } from "@wordpress/hooks";
import { register } from "@wordpress/data";
import BogoStore from "./store";
import BogoLayout from "./components/BogoLayout";

register( BogoStore ); // register the module's @wordpress/data store

addFilter(
  "spsg_routes",
  "spsg",
  ( routes, outlet, navigate, useParams, useSearchParams ) => {
    routes.push( {
      path: "/bogo",
      name: "bogo",
      label: "BOGO",
      element: <BogoLayout outlet={ outlet } navigate={ navigate } useParams={ useParams } useSearchParams={ useSearchParams } />,
      children: [ /* nested routes */ ],
    } );
    return routes;
  }
);
```

A module's `assets/src/settings.js` is its entry point: register its store, then push routes. The Modules page (`modules.js` / `modules-store.js`) lists modules and toggles them via the backend `ModuleManager`.

## State management

Stores use `@wordpress/data`:

```js
import { createReduxStore } from "@wordpress/data";

const DEFAULT_STATE = { pageLoading: false };
const reducer = ( state = DEFAULT_STATE, action ) => { /* ... */ return state; };

const store = createReduxStore( "spsg/settings", { reducer, actions, selectors, resolvers } );
export default store; // register( store ) in the entry file
```

Root stores: `assets/src/settings-store.js`, `assets/src/modules-store.js`. Each module ships its own `store.js`. Use store actions — never mutate state directly. Data is read/written through the `sales-booster/v1` REST API (see `storegrowth-backend-dev`) and `assets/src/ajax.js` for the legacy admin-ajax surface.

## Component conventions

- Functional components only; PascalCase files (`BogoLayout.js`, `CreateBogo.js`).
- Module UI lives in `modules/{slug}/assets/src/components/`; shared helpers in `helper.js` / `utils/`.
- Use Ant Design components + `@ant-design/icons` rather than hand-rolled widgets, to match the existing look.

## Enqueueing (PHP side)

Scripts/styles register with the `spsg-` handle prefix. Root admin assets are handled in `includes/Assets.php`; each module registers its own assets in a `EnqueueScript` class implementing `HookRegistry` (see `storegrowth-backend-dev`). Admin page hooks for conditional enqueue: `storegrowth_page_spsg-settings`, `storegrowth_page_spsg-modules`. Build assets are versioned with `filemtime()`.

## i18n

- Use `@wordpress/i18n`: `import { __, _n, sprintf } from "@wordpress/i18n";`
- Text domain: `storegrowth-sales-booster`.
- Add `/* translators: */` comments before `sprintf()` with placeholders; never concatenate translated strings; use `_n()` for plurals.
- The `SPSG_VERSION` placeholder convention also applies to JS files (version-replace scans `.js`) — use it in `@since` annotations on new code.

## Key reference files

- `assets/src/settings.js`, `assets/src/modules.js` — root SPA entry points
- `assets/src/settings-store.js`, `assets/src/modules-store.js` — root stores
- `modules/bogo/assets/src/settings.js` — model for module entry (store register + `spsg_routes`)
- `assets/package.json`, `modules/*/assets/package.json`, `lerna.json` — build config
- `includes/Assets.php`, `modules/*/includes/EnqueueScript.php` — PHP enqueue
