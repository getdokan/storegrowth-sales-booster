# Review: new lite + old pro (user updates lite only)

- Date: 2026-09-25
- Scenario: the site updates StoreGrowth lite to the redesigned version and keeps pro at 2.2.0 or older.
- Verdict: **compatible, provided the 6 rules in §3 are implemented.** Without R1 and R2, pro users lose the ability to edit some settings they paid for.

## 1. What old pro does on a new-lite site, traced through the code

| Pro 2.2.0 part | How it works | With new lite | Result |
|---|---|---|---|
| Module boot | `Modules.php` hooks `storegrowth_module_after_boot( $module_id )` and switches on static `*Module::get_id()` | Hook and static `get_id()` kept (ADR-005 §1–2) | ✅ Works |
| Pro detection | Pro hooks `storegrowth_pro_is_active`; lite checks `sp_store_growth()->has_pro()` | Unchanged | ✅ Works |
| Storefront features | 23 PHP hooks, `Helper::find_option_settings` (69 calls), `BogoDataManager`, module helpers | All frozen | ✅ Works |
| Reading settings | Pro reads pro keys from **lite's options** | Option names, keys and value shapes frozen; new UI writes the same keys | ✅ Works |
| Admin bundle load | `includes/Assets.php` enqueues `build/index.js` on `storegrowth_page_spsg-settings` / `-modules`; deps are only `react`, `react-dom`, `wp-element`, `wp-hooks`, `wp-i18n` | Slugs kept, so it still loads. Its top level only calls `addFilter`; nothing touches the DOM or lite stores. `window.SGSettings` is read only inside callbacks | ✅ Loads without errors; all 65 filters stay unused |
| Admin fields | Filter callbacks inject antd fields into lite's antd screens | Those hooks aren't fired any more; **lite's schema renders every pro field**, editable when `has_pro()` | ✅ Only if R1 holds |
| Feature flags via JS hooks | Pro returns `false` from `spsg_hide_bogo_premium_options`, `spsg_edit_bogo_message`, `spsg_bogo_render_upgrade_message`, `spsg_bogo_category_tab_prompts`, `spsg_control_upsell_order_*_data`, and returns the full list from `spsg_upsell_order_*_data` (lifting the 2-item caps) | New UI derives all of these from `has_pro()` sent by the server; caps enforced server-side | ✅ Only if R3 holds |
| BOGO category messages | Whole management screen lives in pro JS (`jQuery.post` to `bogo_category_msg_*`); create/list handlers in lite, status/delete in pro PHP | Design drops the screen | ❌ **Gap** — R2 |
| BOGO product tab | `spsg-bogo-pro-admin-script` on `post.php` / `post-new.php` for products | Product edit screen not redesigned | ✅ Works |
| Pro ajax | `bogo_category_msg_status_handler`, `_delete` registered by pro | Not touched by lite | ✅ Works |
| Pro storefront scripts | Own handles (`spsgqcv-frontend-pro`, `spsg-ffc-style`, …) | Storefront untouched | ✅ Works |

## 2. Gaps found

1. **Pro fields the design drops.** With old pro, the only place to edit these was pro's JS, which is now unused. If lite doesn't render them, the values stay stored and keep driving the storefront, but nobody can change them. Affected fields:
   - Floating Bar: coupon, custom icon, new tab.
   - Free Shipping: custom icon.
   - Quick View: auto-open Fly Cart.
   - BOGO: badge upload, min quantity.
   - Plus any other pro field in `findings-features-A/B.md` missing from a mockup.
2. **BOGO category messages screen.** Same problem for a whole screen.
3. **Caps and flags moved from JS to the server.** Order Bump's 2-offer cap is UI-only today and pro lifts it in JS. The new UI must not reimplement the cap in JS. It must come from `has_pro()` on the server.
4. **Stricter sanitization.** New sanitizers (ADR-005, the fixes in `rest-api.md`) must accept every value pro 2.2.0's storefront writes or expects. Otherwise a save through the new UI silently rewrites a pro value. Examples: `sanitize_hex_color` drops non-hex values; gradient or `rgba` values; template-specific values.
5. **Save must merge.** Quick View's save replaces the whole option today. Any key the new schema doesn't know must survive a save.
6. **Weight.** Old pro's admin bundle, with antd bundled inside it, still loads on the new settings page and does nothing.
7. **Reverse case** (new pro on old lite): new pro must not assume the new lite UI exists.

## 3. Rules (added to ADR-005 §3)

| # | Rule |
|---|---|
| **R1** | Lite's schema includes **every field pro 2.2.0 exposes**, whether or not the redesign draws it. A field missing from the design goes into an "Advanced (Pro)" section of that module, visible only when `has_pro()` is true. A pro field may leave the schema only after the minimum supported pro version no longer uses the key. |
| **R2** | Lite builds the **BOGO category messages** screen (pro-gated) on REST `/bogo/category-messages`. The existing ajax actions stay. Pro 2.2.0's status/delete ajax handlers keep working, and the REST routes call the same data layer. |
| **R3** | Every pro flag and cap is decided **server-side** from `sp_store_growth()->has_pro()`: the schema `pro`/`locked` flags, `GET /modules` `is_pro`, and 403 on create over the cap (BOGO already does this; add it for Order Bump). The client never hardcodes a cap. |
| **R4** | Sanitizers accept the **same value domain** as today. Tightening a value's rules is allowed only for security (e.g. CSS injection). When a value is rejected, the stored value is kept (never blanked) and a field error is returned. Characterisation tests use real option dumps that include pro keys. |
| **R5** | Settings save = deep **merge** into the existing option. Keys the schema doesn't know are never removed. |
| **R6** | On the new SPA page, if pro is active and doesn't declare `storegrowth_pro_admin_ui_version >= 2`, lite dequeues `spsg-pro-admin-script`. It's inert anyway, and dequeuing saves the antd download. This removes no hook or handle registration; pro's enqueue call still runs. |

**Reverse compatibility (new pro, old lite):** new pro checks `STOREGROWTH_VERSION`. Below the redesign version, it shows an admin notice ("update StoreGrowth to use the new settings") and keeps its PHP storefront features running. It doesn't load its new admin bundle.

## 4. Test matrix (CI)

| Lite | Pro | Must pass |
|---|---|---|
| new | none | Pro fields locked; save ignores pro keys; caps enforced |
| new | **2.2.0 (pinned zip)** | Every pro field editable (including R1 advanced fields); pro storefront renders saved values; category messages CRUD; caps lifted; no JS errors on the settings page |
| new | new | New UI + pro extension points |
| 2.2.0 | new | Notice shown; storefront pro features work |
| new, pro licence lapsed | 2.2.0 | `has_pro()` false → locked; stored pro values preserved and still in the option |

Use a fixture: a real option dump from a pro 2.2.0 site with every pro field set to a non-default value. Load it, save through the new UI without changes, and require that the option is byte-identical.
