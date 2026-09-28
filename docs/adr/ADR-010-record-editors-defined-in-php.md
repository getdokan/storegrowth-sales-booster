# ADR-010: Record editors are defined in PHP, like settings pages

- Status: Accepted
- Date: 2026-09-28
- Extends: ADR-009 (settings pages defined in the backend), ADR-007 (extension fields); keeps ADR-004
- First use: the BOGO offer editor (`docs/redesign/modules/bogo.md` §10, 10d)

## Context

Some pages edit a record, not an option: a BOGO offer or an order bump is a row of its own table, saved through its own REST routes. The old antd editors were hand-written forms, extended by JS slots (`spsg_bogo_tab_panels`, `spsg_after_bogo_offer_settings`, `spsg_after_bogo_basic_info_settings`, …). ADR-004 §4 retires those slots; the redesign planned a JS hook (`storegrowth.bogo.editor.tabs`) in their place.

Settings pages already have a better contract (ADR-009): fields and page in PHP, drawn by one renderer, extended by PHP filters.

## Decision

1. **A record editor is defined in PHP like a settings page.** A class returns the fields (settings field format: `type`, `default`, `pro`, `options`, and the page keys `tab`, `section`, `label`, `help`, `variant`, `show_when`, `pro_options`, `width`, `hidden`, …) and the page (`get_page()`: title, tabs, sections). Keys are the record's REST keys (ADR-004). BOGO: `BoGo\Settings\BogoOfferFields`.
2. **The record's REST routes serve it.** `GET <records>/editor` returns `{ page, schema }` (schema through `SettingsService::to_public_schema()`), plus what the editor needs from the server (BOGO: `can_create`, `currency`). Values come from `GET <records>/{id}`; saves go to `POST <records>` (create, every value) and `PUT <records>/{id}` (only what changed, merged over the stored record). `SettingsService` doesn't store records.
3. **The same renderer draws it.** A hook (BOGO: `useBogoOffer`) loads and saves the record and returns the `ModuleSettings` shape, so `ModuleSettingsPage` draws tabs, sections, fields, locks and Save bars as for a settings page. The page adds only what PHP can't describe: the live preview and page-drawn controls (product search, badge picker). `ModuleSettingsPage` takes `actions` (beside the title) and `savedMessage`.
4. **PHP filters replace the retired JS slots.** Per editor: `spsg_bogo_offer_fields` ( $fields ) adds fields; `spsg_bogo_offer_page` ( $page ) adds tabs and sections. The record's own fields can't be redefined; a field of an unknown type is dropped. An extension stores and returns its keys through the record's existing hooks (BOGO: `spsg_bogo_mapped_data`, `storegrowth_rest_prepare_bogo_offer`). A custom control is a `variant` (`storegrowth_settings_{variant}_field`, ADR-007); the preview has a JS filter (`storegrowth.preview.bogo`). No `storegrowth.bogo.editor.tabs`.
5. **Pro-only fields are enforced by the server** (ADR-004 §3): without pro their values are ignored, never rejected.

## Consequences

- A new record editor (Upsell Order Bump) is PHP fields + page, an `/editor` route, a small load/save hook and its preview.
- Pro 2.2.0's JS for the old editor (badge upload slot, "hide premium options") no longer applies; its stored values and PHP hooks keep working. The next pro adds fields in PHP.
- Tab and section ids of an editor are extension API: record changes in the module spec.
