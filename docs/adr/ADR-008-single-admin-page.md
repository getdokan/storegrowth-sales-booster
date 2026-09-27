# ADR-008: One admin page, `admin.php?page=storegrowth`

- Status: Accepted
- Date: 2026-09-27
- Amends: ADR-004 §2 (admin page slugs) and its Context (admin screen IDs), `../redesign/compat-contract.md` §3

## Context

The redesigned admin is one React app with one route table. It was mounted on two WordPress pages, `spsg-settings` and `spsg-modules`, which differed only in the route they opened without a hash. Every route worked on both, so links used either slug at random (`spsg-modules#/ini-setup`, `spsg-settings#/modules`).

ADR-004 froze both slugs and their screen IDs (`storegrowth_page_spsg-settings` / `-modules`), because pro up to 2.2.0 enqueues its admin bundle only on those screens.

## Decision

1. **The app runs on one page: `admin.php?page=storegrowth`**, screen ID `storegrowth_page_storegrowth`. Routes stay in the hash: `#/dashboard`, `#/modules`, `#/settings`, `#/<module-id>`, `#/ini-setup`. In PHP, use `AdminMenu::PAGE` and `AdminMenu::SCREEN_ID`, never the strings.
2. **The submenu items are routes on that page:** Dashboard (`storegrowth`), Features (`#/features`), Modules (`#/modules`), Settings (`#/settings`), Initial Setup (`#/ini-setup`).
3. **Old slugs keep working.** `spsg-settings` and `spsg-modules` stay registered as hidden pages (no parent). `AdminMenu::redirect_legacy_pages()` sends them to `storegrowth` on `admin_init`: the admin has no `template_redirect`, and `admin_init` runs after the menu access check and before output.
   - The browser keeps the URL's `#/route` across the redirect, so `spsg-settings#/stock-bar` opens `storegrowth#/stock-bar`.
   - A bare `spsg-modules` link redirects with `view=modules`, so it still opens the modules list.
4. **Exception to ADR-004: the old screen IDs are gone.** The old pages never render, so `storegrowth_page_spsg-settings` / `-modules` never fire `admin_enqueue_scripts`.
   - Pro 2.2.0 doesn't load its admin bundle with this lite. Its storefront and PHP features are unaffected, and the redesigned pages don't need it (they never fire the antd JS filters, ADR-004 §4).
   - **What pro 2.2.0 users lose:** the three pages still on legacy bundles fire JS filters that pro's bundle answers, so without it they show lite behaviour:
     - BOGO: `spsg_hide_bogo_premium_options`, `spsg_edit_bogo_message`, `spsg_upsell_order_bogo_data`, `spsg_control_upsell_order_bogo_data` (premium options locked, offer caps);
     - Upsell Order Bump: `spsg_upsell_order_bump_data`, `spsg_control_upsell_order_bump_data` (the 2-offer cap comes back);
     - Direct Checkout: `spsg_after_direct_checkout_*`, `spsg_direct_checkout_*_options`, `spsg_prepend_direct_checkout_settings`, `spsg_inside_direct_checkout_redirection_settings` (pro settings missing).
     Stored values stay and keep driving the storefront; they can't be edited on those pages until pro is updated or the page is redesigned.
   - The next pro release enqueues on `storegrowth_page_storegrowth` as well as the old IDs, so it works with lite before and after this change. Lite and that pro ship together.
   - Add-ons that enqueue on the old screen IDs must add the new one.
5. **Everything else in ADR-004 stands.** The old slugs are kept (as redirects), the top-level menu slug `sales-booster-for-woocommerce` is unchanged, and `AdminMenu`'s public callbacks stay.

## Consequences

- Links, docs and tests use `admin.php?page=storegrowth#/<route>`.
- Built legacy bundles (BOGO, Upsell Order Bump, Direct Checkout, pro) that still link to the old slugs keep working through the redirect until they're rebuilt.
- A module settings page can now be addressed by one stable URL, which the schema-driven pages build on (`#/<module-id>`, tab in the query string).
