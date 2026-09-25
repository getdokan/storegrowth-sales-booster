# Order Bump (`upsell-order-bump`)

> **Design:**
> - List: https://storegrowth-design.vercel.app/order-bump.html
> - Create / edit: https://storegrowth-design.vercel.app/order-bump-edit.html
>
> Build it exactly as designed; see the design-fidelity rule in `README.md`.

## 1. Summary
- **Phase:** 4. Build it after BOGO; it reuses the list, editor and preview pattern.
- **Size:** L.
- **Design:** `order-bump.html` (list) and `order-bump-edit.html` (editor).

## 2. Current state
- **Storage:** table `{prefix}spsg_order_bumps` (created on module activation). The legacy CPT `spsg_order_bump` is still queried but unused.
- **REST:** `spsg/v1/order-bumps` (+ `/{id}`, `/matching`), `manage_options`. The client uses raw `fetch` with `wpApiSettings.nonce`, which is never enqueued.
- **Ajax:** storefront nopriv `upsell_offer_product_add_to_cart` (stays).
- **PHP hooks** (keep): `spsg_order_bump_created`, `_created_by`, `_deleted`, `_insert_data`, `_update_data`, `_updated`, `_updated_by`, `_needs_front_assets`.
- **JS hooks** (retire): `spsg_upsell_order_bump_data`, `spsg_control_upsell_order_bump_data`. Pro uses them only to lift the 2-offer UI cap.
- **Builds today:** `settings.js` (admin) and `blocks.js` (storefront checkout block `storegrowth-upsell-order-bump`).
- **Existing bugs:**
  1. `bump_schedule` is never persisted.
  2. The list fetches the first 10 only.
  3. No status toggle.
  4. Variation offers may 403 (unverified).
  5. `BlockRegistry` may run while the module is inactive.

## 3. Target design
- **List:** DataViews. Columns: Name, Target (product or category), Offers ("$174 / Bump $139.20"), Status switch, row menu. Bulk delete, search, pagination, empty state.
- **Editor:** Basic Information (Bump Setup, Offer Section) / Design (Bump Offer Box, Discount Section, Product Section, Content).
- **Preview:** should be the **checkout** frame, not the product page the mockup shows.

## 4. Field map
| Design field | Column / key | Tier | Component |
|---|---|---|---|
| Name | `name` | lite | `text` |
| Bump Type Products / Categories | `target_type` | lite | radio |
| Target Products / Categories | `target_products` / `target_categories` | lite | `ProductSearch` / `CategorySearch` multi |
| Order Bump Schedule | `bump_schedule` (**not persisted today**) | lite | see §5 |
| Offer Product | `offer_product_id` (simple + variations) | lite | `ProductSearch` single |
| Offer Price / Discount | `offer_type` discount/price (+ **free**, new) + `offer_amount` | lite | `select` + `number` |
| Box border style, colour, margins | `design_settings.box_*` | lite | `select`, `color_picker`, `number` |
| Discount bg / text / size | `design_settings.discount_*` | lite | `color_picker`, `number` |
| Product text colour / size | `design_settings.product_description_*` | lite | `color_picker`, `number` |
| For Discount % text | `offer_discount_title` | lite | `text` |
| Fixed price title (not in design) | `design_settings.offer_fixed_price_title` | lite | keep; shown when offer type = price |
| Status (list) | `status` | lite | list switch |

## 5. Data changes
- **Schedule:** the design has a single select (Daily / Weekdays / Weekends / Always); the old UI had a multi-select of days that was never saved.
  - Proposal: store a `schedule` column or a `design_settings.schedule` value `always|daily|weekdays|weekends` through a versioned migration (default `always`).
  - The storefront eligibility check must honour it.
  - Needs product sign-off.
- **Offer type `free`:** new value. The storefront price calculation must handle it (price 0).
- **Status:** the column exists; only the toggle is new.

## 6. REST (`rest-api.md` #26–31)
- Register the same controller under `sales-booster/v1/order-bumps`; **keep `spsg/v1/order-bumps` permanently.**
- Add `search`, `PATCH /{id}/status` and `POST /batch`.
- The client moves to `apiFetch`.

## 7. Compatibility
- All 8 PHP hooks unchanged; the table columns are unchanged (additive only).
- Order-item meta `_spsg_campaign_*` is still written through WooCommerce CRUD (HPOS).
- The storefront ajax and the classic `woocommerce_review_order_before_submit` render are unchanged.
- The lite 2-offer cap moves from the UI to a server-side check, as BOGO does (403 `salesbooster_limit_exceeded`). When pro is active, the cap is lifted through `storegrowth_pro_is_active`. That replaces pro's JS-only lift, so pro 2.2.0 users keep unlimited bumps.
- The checkout block moves to `modules/upsell-order-bump/src/blocks/` → `modules/upsell-order-bump/assets/js/blocks.js` (add `blocks.js` to `.gitignore`); the block name stays `storegrowth-upsell-order-bump`.
- Retired JS hooks → `storegrowth.orderBump.editor.tabs`.

## 8. Components
- Reuses: the DataViews list pattern, `EditorLayout`, `ProductSearch`, `CategorySearch`.
- Builds: the checkout-frame preview (a new `LivePreview` layout).

## 9. Open questions / design issues
- Schedule model (§5).
- "Free" offer type.
- Preview frame must be checkout.
- The heading reads "Order Bumps List".
- Should the server-side cap apply to existing sites that already have more than 2 bumps without pro? Proposal: block creating new ones only; never touch existing ones.

## 10. Tasks and definition of done
- [ ] REST: new namespace, old kept, search/status/batch, server-side cap.
- [ ] Schedule migration + storefront check (if approved).
- [ ] List + editor + checkout preview.
- [ ] Block bundle moved into the main build; block renders in Checkout Blocks.
- [ ] Fix `BlockRegistry` running while the module is inactive.
- [ ] E2E matrix: create, edit, status, bulk delete, cap with and without pro, classic + block checkout.
- [ ] Delete `modules/upsell-order-bump/assets/src`, `package.json` and `build/`.
