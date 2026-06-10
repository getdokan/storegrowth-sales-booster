---
name: storegrowth-code-review
description: Review StoreGrowth (Sales Booster) code changes and pull requests for conventions, security, and architecture compliance. Use when reviewing PRs, auditing code, or checking quality before merge.
---

# StoreGrowth Code Review

Review changes against StoreGrowth conventions. Consult `storegrowth-backend-dev`, `storegrowth-frontend-dev`, and `storegrowth-module-dev` for the detailed standards each item references.

## Critical violations to flag

### Backend PHP — architecture

- **Hooks registered ad-hoc** — new WordPress hooks should live in a class implementing `HookRegistry` (auto-registered), not scattered `add_action` calls in random constructors. See `storegrowth-backend-dev`.
- **REST controller not auto-wired** — controllers must extend `WP_REST_Controller` and be registered in a provider (tagged so `Bootstrap::register_rest_routes()` finds them). Namespace must be `sales-booster/v1`.
- **Service not registered via a provider** — new services belong in the appropriate `ServiceProvider` / `BootstrapServiceProvider` using `add_with_implements_tags()` / `share_with_implements_tags()`; avoid `new ClassName()` for things that should be container-managed.
- **Wrong namespace / path** — must follow `StorePulse\StoreGrowth\…` with matching file path. Watch for `League\Container\…` imports that should be the mozart-prefixed `StorePulse\StoreGrowth\ThirdParty\Packages\League\Container\…`.
- **Hand-edited `lib/`** — that directory is mozart-generated; changes belong in `composer.json` + regeneration.

### Backend PHP — modules

- **Module not extending `BaseModule`** / not implementing the `ModuleSkeleton` methods (`get_id`, `get_name`, `get_icon`, `get_banner`, `get_description`, `get_module_category`).
- **Module not fully wired** — missing `require_once` in `storegrowth-sales-booster.php`, missing PSR-4 autoload entry, or missing `watch:`/`build:` scripts. See `storegrowth-module-dev`.
- **Runtime services registered in the always-on provider** — module runtime services go in `BootstrapServiceProvider` (booted only when active), not the registration `ServiceProvider`.

### Backend PHP — naming & i18n

- **camelCase** methods/variables — must be `snake_case`.
- **Unprefixed hook names** — feature hooks must start with `spsg_` (lifecycle hooks `storegrowth_`). Generic/unprefixed names risk collisions.
- **Wrong text domain** — must be `storegrowth-sales-booster` for every `__()`, `esc_html__()`, etc.
- **Concatenated translations** — use `sprintf()` with a `/* translators: */` comment; never concatenate.

### Backend PHP — security

- **Missing `permission_callback`** on any REST route (never omit).
- **Unsanitized `$request` input** — sanitize everything (`absint`, `sanitize_text_field`, `wc_clean`, …).
- **Unescaped output** — escape with `esc_html`, `esc_attr`, `wp_kses_post`, etc., especially in `templates/`.
- **Raw SQL** — dynamic values must go through `$wpdb->prepare()`.
- **Loose comparisons** — use `===`/`!==`; `in_array()` must pass `true` as the third arg.

### Versioning & docs

- **Hardcoded `@since` on new code** — new symbols must use the literal `@since SPSG_VERSION` placeholder, NOT a version number (it's replaced at release by `bin/version-replace.sh`). Flag any newly added `@since X.Y.Z`. Do not touch existing real `@since` numbers.
- **Missing PHPDoc / `@since`** on new public/protected methods, hooks, and filters.

### Frontend (React)

- **Class components** — functional only.
- **Admin page not registered via `spsg_routes`** — module UI must push routes through `addFilter('spsg_routes', 'spsg', …)`; store must be `register()`-ed (`@wordpress/data`). See `storegrowth-frontend-dev`.
- **Direct state mutation** — go through store actions.
- **Wrong i18n** — use `@wordpress/i18n` with text domain `storegrowth-sales-booster`; translator comments before `sprintf()`; `_n()` for plurals.
- **New entry/module not in build** — missing `assets/package.json` or root `package.json` `watch:`/`build:` script.

## Process checks

- Run `composer phpcs` on changed files — the PR workflow (`.github/workflows/phpcs.yml`) runs PHPCS on changed PHP and must pass.
- Verify the branch targets `develop` (see `storegrowth-git`).
- Confirm `readme.txt` / `CHANGELOG.md` updated for user-facing changes.

## Output format

For each finding:

```text
[SEVERITY]: [specific problem]
Location: [file:line]
Standard: [which storegrowth-* skill section]
Fix: [brief correct example]
```

Severity: **CRITICAL** (security / data loss / breakage) · **ERROR** (standards violation / missing required pattern) · **WARNING** (suboptimal) · **SUGGESTION** (improvement).

## Reviewer principles

- **Correct** — does it fulfill the requirement?
- **Secure** — sanitized, escaped, permission-checked, prepared SQL?
- **Consistent** — fits the module/provider/hook architecture and naming?
- **Extensible** — appropriate `spsg_` filters/actions for the pro plugin (`storegrowth_pro_is_active`) to hook into?
