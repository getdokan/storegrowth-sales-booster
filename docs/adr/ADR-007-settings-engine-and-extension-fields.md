# ADR-007: Settings engine and extension fields

- Status: Accepted
- Date: 2026-09-27
- Related: ADR-004 (settings are never lost; pro compatibility; JS hooks), ADR-006 (REST first), `../redesign/migration-spec.md` §8, `../redesign/pro-migration-spec.md` §3–4

## Context

Every redesigned module page reads and saves its settings through one engine: a schema per module (`SettingsSchema`), `Settings\SettingsService`, REST `sales-booster/v1/settings/{module}` and the `useModuleSettings()` hook. ADR-004 §2 fixes how saves protect stored data.

Two questions were open:

1. **How pro (or a third party) adds a field to a module page.** The old antd UI had 83 JS slots (retired, ADR-004 §4). The pages are now laid out by hand to their designs, so there is no generic form to append to.
2. **What "never saved" means.** The two storefront bars stay off until the admin first saves (the old behaviour). With saves that write only changed keys, a page left at its defaults could never be saved, so the bar could never be turned on.

We answer the first question with plugin-ui's settings contract: fields are flat PHP arrays in plugin-ui's `SettingsElement` shape, appended through one filter, and a custom control is a variant with its own JS hook.

## Decision

### 1. One engine
- A module declares its fields in a `SettingsSchema` (option name; key → `type`, `default`, `pro`, limits, `options`). Types: `text`, `textarea`, `number` (`allow_empty`), `toggle`, `color`, `select`, `box`, `list`, `url`, `date`. New types are added in `SettingsService` (`FIELD_TYPES`, `sanitize()`, and `to_api()` / `is_unchanged()` for structured values) and in `api.ts`.
- `SettingsService` is the only reader and writer (REST and the legacy ajax adapters). Its save rules are ADR-004 §2.
- The page's `useModuleSettings()` owns values, dirty state and saving. Each tab saves its own keys: every field with that `tab` (ADR-009; before, a hand-kept `TAB_KEYS` list).

### 2. Gated modules: the first save turns them on
A schema whose storefront stays off until first saved implements `GatedSettingsSchema::is_saved( $stored )`. The API returns `published: false` until then. The page keeps Save enabled and says the output shows once saved. That first save writes the full option, like the old admin's whole-form save: every key the tab sends (even unchanged) and the default of every other key. Pro 2.2.0 reads the raw option, so a key left out would read as empty. Later saves write only changes.

### 3. Extension fields
**PHP — append a field.** An extension adds fields with the filter `spsg_settings_schema` ( `$fields, $module_id` ). A field uses a built-in type, is stored in the module's option, and carries where and how the page draws it:

```php
'spsg_pro_bar_animation' => [
    'type'     => 'select',
    'default'  => 'slide',
    'options'  => [ 'none', 'slide', 'fade' ],
    'pro'      => true,
    'tab'      => 'design',                       // page tab it shows on
    'label'    => __( 'Animation', '…' ),
    'help'     => __( 'How the bar enters.', '…' ),
    'labels'   => [ 'slide' => __( 'Slide in', '…' ) ],
    'variant'  => 'my_animation_picker',          // optional custom control
    'priority' => 10,                             // order within the tab
],
```

Also `placeholder`, `prefix`, `suffix`. The public schema returns these keys.

**Lite draws it.** Settings pages are generated from the schema (ADR-009), so an extension field is drawn like the module's own: in field order on its `tab`, inside its `section` when it names one (else after the module's fields, above the Save bar), and saved, reset and dirty-checked with the tab. It can use every page key the module's fields use (`show_when`, `width`, …). A hand-written page draws extension fields with `<FieldRenderer tab settings />` and `extensionKeys( schema, tab )`. Without a `variant` the control follows the type: text, url, date → text; textarea; number; toggle → switch; color → colour picker; select; list → multi-select. `box` has no default control.

**JS — a custom control is a variant.** Each field is a plugin-ui `SettingsElement` (id, label, description, value, default, options `{ value, label }`, disabled, badge, validationError, min/max/increment, prefix/postfix) passed through:

```ts
addFilter(
    'storegrowth_settings_my_animation_picker_field', // storegrowth_settings_{variant}_field
    'my-plugin/animation-picker',
    ( defaultField, element ) => (
        <AnimationPicker element={ element } onChange={ defaultField.props.onChange } />
    )
);
```

`defaultField.props.onChange( key, value )` saves. The hook name is plugin-ui's field-hook format (`{prefix}_settings_{variant}_field`); the underscores are a deliberate exception to the `storegrowth.*` naming (ADR-004 §4). Pro shares lite's React and plugin-ui (externals, ADR-001), so it may also use lite's components.

**Rules.**
- A module's own fields can't be redefined through the filter: the module's definition wins.
- A field of an unknown type is dropped.
- Both are reported with `_doing_it_wrong()` under WP_DEBUG.
- `pro: true` fields are locked (Pro badge) and not saved without pro.
- The storefront reads options through `SettingsService::with_defaults()` (each module's `storefront_settings()`), which fills every key never saved from its default, extension fields included. Code that reads the raw option (as pro 2.2.0 does) must supply its own defaults.
- Tab ids are part of the API: Stock Bar, Free Shipping Rules and Floating Bar use `content` / `configure` / `design`; Countdown Timer uses `configure` / `design`; Sales Notification uses `settings` / `design`.

### 4. Lite renders the controls itself
`FieldRenderer` fires the variant hook from lite's own field components (`DefaultField`), not plugin-ui's `SettingsProvider` / `FieldRenderer`:
- The controls match the hand-built page (label above the control, the design's inputs).
- plugin-ui's provider is built for a page/section tree. It drops root-level fields and duplicates the page's dirty and save state.
- With plugin-ui 2.0, a numeric value in the provider's `values` froze the browser tab (e.g. a `text` field with `values: { key: 5 }`), and module options always hold numbers.

The extension contract (PHP arrays, element shape, hook name, `onChange`) is the same either way.

## Consequences

- Pro adds a field with a PHP array and no JS; only a custom control needs a JS filter, written against plugin-ui's field contract.
- Adding a tab to a page, or renaming one, changes the extension API: record it in the module spec.
- A new field type is a `SettingsService` change plus a default control in `DefaultField`.
- Checks: `wp eval-file tests/compat/settings-roundtrip.php`; an extension field on every tab of a changed page renders above Save and saves only its key.
