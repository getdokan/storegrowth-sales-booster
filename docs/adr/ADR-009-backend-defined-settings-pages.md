# ADR-009: Settings pages are defined in the backend

- Status: Accepted
- Date: 2026-09-27
- Extends: ADR-007 (settings engine, extension fields); builds on ADR-008 (one admin page)
- Reference: getdokan/dokan#3141 (flat schema, one GET for every page, plugin-ui `Settings`)
- How-to and key reference: [`../settings-pages.md`](../settings-pages.md)

## Context

Every redesigned module page was a hand-written React component of 400–860 lines. Most of it declared fields one by one (`<TextField label=… value=… onChange=… />`) that the PHP schema already describes, plus the same tab, accordion, Save bar and toast code on each page. Each page also registered its own route and fetched its own settings.

## Decision

1. **A schema defines its page.** A settings schema that also implements `Interfaces\SettingsPage` returns `get_page()`: the title, and the tabs with their sections (accordions). Its fields say where they go and how they look: `tab`, `section`, `label`, `help`, `labels`, `variant`, `suffix`, `priority`, and `pro_ui` (control locked without pro, value still saved). These are the keys extension fields already carry (ADR-007).
2. **One request for every page.** `GET sales-booster/v1/admin/settings` returns `{ <id>: { page, schema, values, published } }` for every schema with a page. The admin fetches it once and shares it (`fetchSettingsPages()`, `useSettingsPages()`). Each page still saves on its own through `POST sales-booster/v1/settings/<id>`, which also returns `page`. The old routes stay (ADR-004): `GET/POST settings/<id>`, and `GET/POST settings` for the global settings.
3. **The page is generated.** `#/settings?module=<id>&tab=<tab>` draws the page with our renderer (`ModuleSettingsPage`: title card, tabs, a section's fields in its accordion, one Save bar per tab). The tab is in the URL; a module page sits in the feature frame (module rail). `#/settings` without a module opens the global settings (`general`). This is every module's page (`moduleRoute( id )`); a module without a settings page yet shows the empty module frame. The old `#/<module-id>` (links in 2.2.0, bookmarks, docs) redirects to it; any other unknown path opens the dashboard.
4. **Only what JS must draw stays in the module**, through the JS filter `storegrowth.settings.page` ( parts, moduleId ). It returns `{ preview, controls }`, render functions of the page's settings, which see unsaved values:
   - `preview`: the live preview;
   - `controls`: a control the page draws instead of a field's, by key (e.g. a template picker that sets several keys).
   A module without these needs no admin JS at all.
5. **Our renderer, not plugin-ui `Settings`.** The design puts a live preview beside the settings, which plugin-ui's sidebar layout has no place for. The page and field shapes follow plugin-ui `SettingsElement` attributes, so switching later stays possible.
6. **Everything is filterable in PHP.** Pro and other plugins extend a page without JS:
   - `spsg_settings_schema` ( $fields, $id ): add fields (with `tab` / `section`); a module's own fields can't be redefined (ADR-007). Each module also fires its own `spsg_{module}_settings_schema` ( $fields ), module id in snake case (`spsg_stock_bar_settings_schema`), after the generic one;
   - `spsg_settings_page` ( $page, $id ): add or change tabs and sections;
   - `spsg_settings_schemas` ( $schemas ): register a schema, and page, of their own, read, saved and drawn by the same engine. StoreGrowth's schemas can't be replaced or removed.
   A custom control is a `variant` drawn through the JS filter `storegrowth_settings_{variant}_field`.
7. **A schema may have no option name.** Then each key is its own option, not autoloaded. This is how the global setting `spsg_remove_data_on_uninstall` became the `general` page without changing where it's stored (ADR-004).

## Consequences

- Adding a settings page is PHP only: the schema, `get_page()`, and presentation keys on the fields. The JS is the preview and any multi-key control.
- Every settings-only module is generated: Stock Bar, Countdown Timer, Floating Bar, Free Shipping Rules, Fly Cart, Quick View, Sales Notification, plus the global `general` page. BOGO, Upsell Order Bump and Direct Checkout are not redesigned yet: their `#/settings?module=<id>` shows the empty module frame. When they get pages with more than settings (offer lists), they can add routes of their own (`storegrowth.admin.routes`).
- The schema covers conditional fields and sections (`show_when`), header-switch sections (`toggle`, as accordion or `card`), collapsed sections, hidden keys saved with their tab, half-width rows, pro-only options, and the built-in variants `checkbox`, `switch_card`, `box`, `alignment`, `radio`, `device`. What stays page-drawn (`controls`): template pickers, icon pickers, picker cards with artwork, controls writing several keys (digit colours, discount type, text style rows), runtime option lists (coupons, product search) and values shown from a template without pro.
- Shared fields (`DisplaySettings`) carry their own labels and conditions; a module places them with `DisplaySettings::place( $fields, $tab, $section )`.
- `tests/compat/settings-roundtrip.php` covers standalone-option schemas too.
