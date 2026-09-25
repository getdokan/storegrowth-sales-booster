# ADR-005: Never rename or remove hooks; stay compatible with existing pro versions

- Status: Accepted
- Date: 2026-09-25
- Amends: ADR-001, ADR-002 (item 6, `../redesign/adr/`), `../redesign/migration-spec.md`
- Contract inventory: `../redesign/compat-contract.md`, baselines in `tests/compat/`
- REST surface: `../redesign/rest-api.md`

## Context

The redesign removes the antd admin UI completely and moves the admin to REST (ADR-002). There is no legacy UI mode.

Every shipped pro version (up to 2.2.0) depends on lite through:

- **23 PHP hooks** fired by lite, including `storegrowth_module_after_boot` and `storegrowth_pro_is_active`. They drive pro's storefront and runtime features.
- **Lite PHP classes:**
  - `Helper::find_option_settings` (69 calls in pro);
  - `BogoDataManager`;
  - every `*Module` class;
  - per-module `Helper` classes.
- **Option names, keys and value types.** Pro stores its pro-only settings **inside lite's options** and reads them in PHP.
- **Admin screen IDs** `storegrowth_page_spsg-settings` / `-modules`, where pro enqueues its admin bundle.
- **65 JS filters** that lite fires inside the antd settings screens. Pro's callbacks return antd elements built from `window.SGSettings`. **This is the only part of the contract that depends on antd.**

Lite fires 100 PHP hooks and 83 JS hooks in total. Third-party code may use any of them.

## Decision

### 1. PHP hook freeze
- No PHP hook is ever renamed or removed. This covers every entry in `tests/compat/php-hooks-baseline.txt`, dynamic hook patterns, and every `wp_ajax_*` / `wp_ajax_nopriv_*` registration.
- Each hook keeps its behaviour:
  - same name, including misspellings (`spsg_sales_pop_visbility_controller`, `sales_boster_*`);
  - same arguments, order and types;
  - same return contract;
  - same point in the request lifecycle.
- Replacements are additive and fire alongside the old hook. `do_action_deprecated()` / `apply_filters_deprecated()` wrappers are allowed only if the old hook keeps firing.
- New hooks carry `@since SPSG_VERSION`.

### 2. Public PHP API, data and transport freeze
These keep their names and signatures and may only be extended:
- the classes, methods, functions and constants in `../redesign/compat-contract.md` §2;
- container IDs, module IDs, admin page slugs `spsg-settings` / `spsg-modules`;
- option names, keys and value shapes, including misspelled keys;
- custom table columns.

Ajax and REST rules:
- **Admin ajax actions stay registered** as thin adapters that call the same service as the new REST controllers. Same sanitization, same stored data.
- **Existing REST routes stay permanently.** Namespace moves add the new route and keep the old one (`spsg/v1/order-bumps`).

### 3. Pro compatibility without the antd UI
- **Lite owns the full settings schema for every module, including the pro-only fields**, keyed to the same option keys pro reads today (`../redesign/findings-features-A.md` / `-B.md`). Each pro field has `pro: true` in the schema.
- **Gating:** when `storegrowth_pro_is_active` is true, pro fields are editable. Otherwise they render locked (crown + upgrade), and the REST save **ignores** pro keys. That removes today's gap where lite storefront code reads pro keys that were set earlier.
- **Result:** pro 2.2.0 keeps working with the new lite. Its PHP reads the same options, which are now edited through lite's new UI. Its admin JS bundle no longer has any lite slots to fill, so it renders nothing and has no effect. Pro 2.2.0 needs no update.
- **Pro-only screens not reachable through the schema** keep their current ajax actions and move to REST routes that lite registers only when pro is active (`../redesign/rest-api.md` §4):
  - BOGO category messages
  - BOGO product-tab schedule and variations (PHP-rendered on the product edit screen; not affected)
- **Rules R1–R6 from `../redesign/pro-compat-review.md` are part of this decision:**
  - R1: every pro 2.2.0 field is in lite's schema, even if the design drops it (an "Advanced (Pro)" section).
  - R2: lite builds the BOGO category messages screen.
  - R3: caps and flags are decided server-side from `has_pro()`.
  - R4: sanitizers accept the same value domain and never blank a value.
  - R5: saves deep-merge.
  - R6: dequeue the inert old pro admin bundle on the new SPA page.
- **New pro versions** extend through the additive PHP filter `storegrowth_settings_schema_{module}` (for extra fields or options only pro knows about) and additive JS extension points (§4). They don't need the old JS filters.

### 4. JS hooks — the one deliberate exception
The 83 JS hooks in `tests/compat/js-hooks-baseline.txt` belong to the antd UI. Their contract is "receive `(value, formData, onFieldChange)` and return an antd element", and it can't be honoured once antd and `window.SGSettings` are gone.

- These hook names are **retired with the antd UI**. This is the only exception to "never remove hooks", and it's recorded here on purpose.
- Nothing breaks at runtime: an `addFilter` on a hook nobody fires is a no-op. The fields pro used to inject are now rendered by lite from the schema (§3).
- **New, additive JS extension points** (`@since SPSG_VERSION`, namespace `storegrowth.*`):
  - `storegrowth.admin.routes`
  - `storegrowth.settings.fieldTypes` (register custom field variants)
  - `storegrowth.settings.schema.{module}` (client-side schema tweak)
  - `storegrowth.preview.{module}` (preview widget extension)
  - `storegrowth.bogo.editor.tabs`
  - `storegrowth.orderBump.editor.tabs`

  From now on these are frozen under the same rules as §1.
- **Changelog:** the release notes list every retired JS hook name and its replacement.

### 5. Enforcement
- **Hook baseline check in CI:** re-extract PHP hook names from `includes/`, `modules/`, `integrations/`, `helpers/`, `templates/` and fail if any name in `php-hooks-baseline.txt` is missing. A JS baseline is started for the new `storegrowth.*` hooks.
- **API test:** a PHPUnit reflection test asserts every symbol in `../redesign/compat-contract.md` §2 exists with a compatible signature.
- **Compatibility matrix in E2E:** new lite × { no pro, pro 2.2.0, new pro }. For each module:
  - pro fields are locked without pro and editable with pro;
  - saved options match the baseline shape;
  - pro storefront features read them correctly.
- **Code review:** add a `storegrowth-code-review` checklist item: "no PHP hook, public method, option key, slug, ajax action or REST route removed or renamed".

## Consequences

**Positive:**
- antd, `window.SGSettings` and every legacy admin bundle are deleted, so there's one UI to maintain.
- Pro 2.2.0 keeps working with no update.
- Pro-only settings become visible (locked) to free users. That's product upsell, now driven by the schema instead of a duplicate teaser bundle.

**Negative:**
- 83 JS hook names retire. Any third-party snippet that used them loses its injected admin field (with no error). This is documented in the changelog.
- Lite now defines pro field schemas. A new pro-only field needs either a lite release or the additive PHP schema filter.
- Old ajax handlers and REST routes stay as adapters permanently.

**Superseded items in earlier documents:**

| Earlier item | Replacement |
|---|---|
| ADR-002 item 6 ("pro extends via PHP schema filter; lite renders locked states") | Stands, but lite also owns the existing pro fields so old pro keeps working |
| Spec phase 3 exit ("No `wp_ajax_*_settings` left") | Ajax handlers stay as adapters |
| Spec phase 4 (Order Bump alias "for one release") | Old route stays permanently |
| Spec §6 ("rename the two `spsg` stores") | The old stores are deleted along with the antd UI; the new stores use `storegrowth/*` names |

## Alternatives considered

| Option | Why rejected |
|---|---|
| Keep the frozen antd UI as a legacy mode for old pro | User decision: remove antd completely. The schema-owned pro fields make it unnecessary. |
| Render old pro's antd callbacks inside the new UI | Needs antd kept; mixed design systems; the callbacks expect `formData`/`onFieldChange` shapes that no longer exist |
| Require pro upgrade in lockstep | Breaks sites with lapsed licences or no auto-update |
| Keep firing old JS hook names with new arguments | Silent breakage for every existing callback; worse than retiring them openly |
