---
name: storegrowth-code-review
description: Review StoreGrowth (Sales Booster) code changes and pull requests for conventions, security, data safety, and architecture compliance. Use when reviewing PRs, auditing code, or checking quality before merge.
---

# StoreGrowth Code Review

Review changes against the ADRs (`docs/adr/`) and `CLAUDE.md`. Consult `storegrowth-backend-dev`, `storegrowth-frontend-dev`, and `storegrowth-module-dev` for the detailed standards each item references. Feature plans live in `docs/<feature>/` (analytics: `docs/analytics/README.md`).

## Critical violations to flag

### Backward compatibility (ADR-004): highest priority

- **Renamed or removed** PHP hook, public class/method/function, option name/key/value shape, admin slug, ajax action, REST route, storefront class or script handle. Pro 2.2.0 must keep working when only lite updates.
- **New hook not in `tests/compat/php-hooks-baseline.txt`** (sorted); `npm run check:hooks` must pass.
- **Settings write that bypasses `SettingsService::save()`** (merge-only): existing user settings must never be lost.

### Backend PHP: architecture

- **Hooks registered ad-hoc**: hooks live in a class implementing `Interfaces\HookRegistry`, registered in a provider.
- **REST controller not auto-wired**: extends `WP_REST_Controller`, registered with `*_with_implements_tags()` (shared ones in `CommonServiceProvider`). Namespace `sales-booster/v1` (WooCommerce Analytics extensions may use `wc-analytics`).
- **Module runtime services in the always-on provider**: they belong in `BootstrapServiceProvider` (booted only when the module is active).
- **Wrong namespace / imports**: `StorePulse\StoreGrowth\…`; `use` imports, no inline FQNs; mozart-prefixed `…\ThirdParty\Packages\League\Container\…`. Never hand-edit `lib/`.
- **Style**: short array syntax `[]` in new code, `array_merge()` not `+`, snake_case, module ids from `XModule::get_id()` (not repeated strings).
- **Options**: `autoload` false unless read on front-end requests.

### Backend PHP: order data (HPOS)

- **`update_post_meta()` / `get_post_meta()` on an order**: orders are read with `wc_get_order(s)()` and written through the CRUD API.
- **Keys written on subscriptions** (or copied to renewals): order-line analytics keys skip subscriptions.
- **Test or demo orders left behind**: deleting an order leaves notes, refund items, `wc_order_stats` / lookup rows, Dokan `dokan_orders` / `dokan_order_stats` / `dokan_vendor_balance` rows, and changed `total_sales`. Cleanup code must remove all of them.

### Backend PHP: reports and analytics (ADR-012)

- **Money not from WooCommerce Analytics**: offer money comes from the offer report data stores (`Analytics\Reports\…`, extending WooCommerce's), never ad-hoc order loops.
- **Dokan double counts or leaks**: Dokan copies lines to sub-orders, so the parent order and its sub-orders must not both count. Every report must respect Dokan's vendor rule: a vendor sees only their orders, an admin the vendor they picked. Check every new report route and the WooCommerce Analytics extensions (`OfferQuery::scoped_args()`).
- **Cache key missing a filter**: any arg that changes a WooCommerce report's result (filter, vendor) must be in the query args before `get_data()`, or filtered and unfiltered results share one cache entry.
- **Refunds and sub-orders**: refund rows have their own ids (`parent_id` = the order); filters on `order_id` drop them. Fully refunded orders, partial refunds, and refunds of non-offer lines must behave.
- **Request-only state**: values read from `$_GET` are empty in background runs (Action Scheduler, CSV export batches, cron, internal `rest_do_request`). Pass them through args.
- **Before the DB update**: everything that reads or writes analytics tables checks `Schema::is_installed()`.
- **Counts presented as exact**: view/click counts from the storefront tracker are estimates and must be labelled so; rates built from them need a sane base (e.g. orders older than the first counted view).

### Backend PHP: security

- **Missing or too-loose `permission_callback`** on any REST route. Reports: `manage_woocommerce` (or WooCommerce's report permission plus vendor scope).
- **Unauthenticated endpoints** (e.g. the analytics tracker): accept only known values, reject non-scalar fields, cap counts and batch size, never trust ids without checking the object exists.
- **Unsanitized input** (`absint`, `sanitize_key`, `sanitize_text_field`, `wc_clean`), **unescaped output** (`esc_html`, `esc_attr`, `wp_kses_post`, especially in `templates/`), **raw SQL** without `$wpdb->prepare()` (table names from constants only).
- **Loose comparisons**: `===` / `!==`; `in_array()` with `true`.
- **CSV / spreadsheet exports** without formula-injection escaping.

### Versioning, i18n and docs

- **Hardcoded `@since` on new code**: new symbols and hooks use `@since SPSG_VERSION`. Don't touch existing real numbers.
- **Wrong text domain**: always the literal `'storegrowth-sales-booster'`; `sprintf()` with `/* translators: */`, never concatenation; `_n()` for plurals.
- **Plan / ADR not updated** when the change alters a recorded decision (`docs/adr/`, `docs/<feature>/README.md`).

### Frontend (TypeScript, admin)

- **Native `<button>` / `<input>` / `<select>`** in admin code: use plugin-ui (`Button`, `Toggle`, `ToggleGroup`, `Tabs`, `Select`, `Input`, …) or `@storegrowth/components`.
- **Routing**: routes through the `storegrowth.admin.routes` filter; `react-router` only from `@storegrowth/hooks`. Module settings pages come from the PHP schema (ADR-009), not hand-built pages.
- **Global stores**: no `@wordpress/data` stores; local state and context.
- **Shared bundles**: `@wedevs/plugin-ui` and `@storegrowth/*` are externals. Charts take `recharts` from plugin-ui (`import { recharts } from '@wedevs/plugin-ui'`), never a bare `recharts` import (lint blocks it).
- **Tailwind**: utilities scoped to `.spsg-layout` (ADR-003); tokens `sg-*` over one-off hex values; new source folders need an `@source` line in `src/base-tailwind.css`.
- **New bundle not wired**: entry in `webpack-entries.js`, enqueued from PHP with its `.asset.php` dependencies, generated names git-ignored.
- **Extension points**: JS filters named `storegrowth.*`, documented where they're applied.
- **Files**: kebab-case inside every `src/`, 4-space indentation, block-body arrow functions.

### Storefront (ADR-005)

- Plain CSS/JS, no Tailwind or React; settings as `--spsg-<module>-*` variables with fallbacks; scripts and the tracker enqueued only on pages that use them; existing classes and handles kept.

## Process checks

- `vendor/bin/phpcs` on changed PHP (compare with the base for pre-existing errors in legacy files), `npm run type-check`, `npm run lint:js` (never `--fix`), `npm run check:hooks`, PHPUnit (`npm run phpunit`).
- `wp eval-file tests/compat/settings-roundtrip.php` when settings code changed.
- Branch targets `develop` (see `storegrowth-git`); `readme.txt` / changelog for user-facing changes.

## Output format

For each finding:

```text
[SEVERITY]: [specific problem]
Location: [file:line]
Standard: [ADR / skill section]
Fix: [brief correct example]
```

Severity: **CRITICAL** (security, data leak, data loss, breakage) · **ERROR** (standards violation, wrong figures) · **WARNING** (suboptimal) · **SUGGESTION** (improvement).

## Reviewer principles

- **Correct**: does it fulfil the requirement, with the right numbers in every context (Dokan, refunds, background runs)?
- **Secure**: sanitized, escaped, permission-checked, prepared SQL, nothing leaked across vendors?
- **Compatible**: pro 2.2.0 and stored settings unaffected?
- **Consistent and simple**: fits the provider/hook/ADR architecture, reuses existing parts, no needless abstraction?
- **Extensible**: `spsg_` filters/actions and `storegrowth.*` JS filters where pro needs to hook in?
