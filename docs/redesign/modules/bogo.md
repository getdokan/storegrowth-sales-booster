# BOGO

> **Design:**
> - List: https://storegrowth-design.vercel.app/bogo.html
> - Create / edit: https://storegrowth-design.vercel.app/bogo-edit.html
>
> Build it exactly as designed; see the design-fidelity rule in `README.md`.

## 1. Summary
- **Phase:** 4.
- **Depends on:** shell, `ProductSearch`, `DateRange`, `TemplatePicker`, the DataViews list pattern.
- **Size:** XL (CRUD, global settings, product tab, Dokan vendor UI, existing bugs).
- **Design:** `bogo.html` (list) and `bogo-edit.html` (editor).

## 2. Current state
- **Storage:** table `{prefix}spsg_bogo_settings` (`type` global | product, unique `product_id` + `variation_id`), plus option `spsg_bogo_general_settings` and Dokan's `spsg_bogo_dokan_vendors_settings`.
- **REST:** `sales-booster/v1/bogo/offers` (+ `/{id}`, `/{id}/status`, `/vendor`), permission filter `spsg_bogo_check_permission`.
- **Ajax:**
  - `spsg_bogo_general_get_settings` / `_save_settings` (unsanitized)
  - `bogo_category_msg_create` / `_list`
  - pro `bogo_category_msg_status_handler` / `_delete`
  - storefront nopriv `offer_product_add_to_cart` / `update_offer_product`
  - Dokan `spsg_bogo_vendors_get_settings` / `_save_settings`
- **PHP hooks** (keep, 23): `spsg_after_bogo_offer_settings`, `spsg_after_bogo_offer_type_field`, `spsg_after_bogo_settings_panel`, `spsg_bogo_check_permission`, `spsg_bogo_created_by`, `spsg_bogo_updated_by`, `spsg_bogo_fly_cart_badge_enabled`, `spsg_bogo_get_apply_able_product_id`, `spsg_bogo_mapped_data`, `spsg_bogo_max_category_messages`, `spsg_bogo_offer_products_for_item`, `spsg_bogo_product_args`, `spsg_bogo_query_args`, `spsg_bogo_rest_query_filters`, `spsg_bogo_select_product_list`, `spsg_bogo_single_item_permission`, `spsg_bogo_status`, `spsg_bogo_validator_prepared_settings`, `spsg_free_product_quantity_for_cart_update`, `spsg_get_bogo_settings_for_cart`, `spsg_is_bogo_applicable_product`, `spsg_load_bogo_badge_content`, `storegrowth_rest_prepare_bogo_offer`.
- **JS hooks** (retire, 13): `spsg_after_bogo_basic_info_settings`, `spsg_after_bogo_offer_settings`, `spsg_bogo_category_messages_data`, `spsg_bogo_category_tab_prompts`, `spsg_bogo_deal_type_options`, `spsg_bogo_global_badge_icon_radio_box`, `spsg_bogo_render_upgrade_message`, `spsg_bogo_single_badge_icon_radio_box`, `spsg_bogo_tab_panels`, `spsg_control_upsell_order_bogo_data`, `spsg_edit_bogo_message`, `spsg_hide_bogo_premium_options`, `spsg_upsell_order_bogo_data`.
- **Existing bugs to fix here:**
  1. `GET /bogo/offers/{id}` omits `design_settings` and `offer_schedule`, so editing wipes the design.
  2. The list ignores `search`.
  3. `X-WP-Total` counts global offers only.
  4. Badges never show for global offers (missing `status`).
  5. The lite cap is counted 4 different ways.
  6. `BogoMigration` probably fails for global offers.
  7. Dokan: no product-ownership check; the vendor flag isn't enforced server-side.

## 3. Target design
- **List:** DataViews. Columns: Name, Target Product, Offers (prices), Type (Global/Specific), Status switch, row menu (Edit/Delete). Bulk delete, search, pagination, empty state.
- **Editor:**
  - Basic Information (Offer Setup, Pricing, Schedule & Conditions);
  - Content (Product Page Message);
  - Design (Badge, Offer Box, Message Section, Product Section).
- **Preview:** product page with the BOGO box and badge.
- **Global settings** (`spsg_bogo_general_settings`) aren't a separate page in the design; they move into the offer editor (per the mockup comment).

## 4. Field map (editor → table column)
| Design field | Column / key | Tier | Component |
|---|---|---|---|
| Name of BOGO | `name` (`name_of_order_bogo`) | lite | `text` |
| Target Product(s) | `product_id` / `offered_products` | lite | `ProductSearch` |
| Deal Type Buy X Get Y / X Get X | `bogo_deal_type` `different` / `same` | same = pro | radio; hides Offer Product when X Get X |
| Offer Product | `offer_product_id` | lite | `ProductSearch` single |
| Offer Price / Discount | `offer_type` free/discount (+ **percentage/fixed**?) + `discount_amount` | lite | `select` + `number` |
| Show Regular Price | `regular_price_show` (global option today) | lite | `switch`; **scope change**, see §5 |
| Offer Start / End | `offer_start`, `offer_end` | lite | `DateRange` |
| Min Quantity | `minimum_quantity_required` | pro | `number` |
| Allow Remove Offer Product | `offer_remove_from_cart` (global option today) | lite | `switch`; scope change |
| Product Page Message | `product_page_message` | edit = pro | `textarea` |
| Offer Badge on/off + icon + upload | `bogo_badge_image` + global `default_badge_icon_name` / `default_custom_badge_icon` | pro | `BadgePicker` |
| Offer Box border, colour, margins | `design_settings.*` | lite | `select`, `color_picker`, `number` |
| Message bg / text / size | `design_settings.*` | lite | `color_picker`, `number` |
| Product text colour / size | `design_settings.*` | lite | `color_picker`, `number` |
| List "Type" Global/Specific | `type` global/product | — | read-only column (the editor has no field for it) |

Not in the design; keep the columns and decide in §9: `offered_categories`, `alternate_products`, `shop_page_message`, category messages, the shop-page badge, `offer_schedule`, exclusions.

## 5. Data changes
- **Scope change:** `regular_price_show` and `offer_remove_from_cart` are global today; the design puts them per offer.
  - Proposal: add per-offer keys inside `design_settings` (or new columns through a versioned migration), falling back to the global option.
  - Keep the global option and its keys (pro and the storefront read them).
- **Offer type:** the design shows Free / Percentage / Fixed; today it's free/discount (percentage). Fixed is new → storefront pricing work, needs approval.
- **Persist fields dropped today:** badge, `bogo_type`, alternates, exclusions (only those that survive).

## 6. REST (`rest-api.md` #18–25, #32–35)
- `GET /bogo/offers?search&status&type` (fixed)
- `GET/PUT /bogo/offers/{id}` (returns and persists `design_settings`)
- `POST /bogo/offers/{id}/status`
- `POST /bogo/offers/batch`
- `/bogo/category-messages` only if category messages stay
- Global settings: `GET/POST /settings/bogo`

## 7. Compatibility
- The table schema, the `BogoDataManager` public methods (`get_product_bogo_settings`, `save_product_bogo_settings`, `sync_offer_schedules`) and the `BoGo\Helper` statics pro uses are unchanged.
- All 23 PHP hooks unchanged.
- The ajax actions (including pro's category-message actions) stay.
- The WooCommerce product-tab BOGO form (PHP) is untouched.
- The lite cap (2 global offers → 403) stays server-side; the list shows `ProLock` on Add New.
- **Dokan vendor UI:**
  - moves to the new list and editor (same components, vendor scope via `/bogo/offers` with `spsg_bogo_check_permission` widened to `dokandar`);
  - adds the product-ownership check;
  - enforces `vendors_can_create_buy_x_get_x` server-side;
  - bundle `build/integrations/bogo-dokan-dashboard.js` uses Dokan's layout scope, not `spsg-tailwind`.
- Retired JS hooks → `storegrowth.bogo.editor.tabs`, `storegrowth.settings.schema.bogo`, `storegrowth.preview.bogo`.

## 8. Components
- Builds: DataViews list pattern (shared with Order Bump), `BadgePicker`, BOGO box preview, `EditorLayout` (back button + tabs + preview).
- Reuses: `ProductSearch`, `DateRange`.

## 9. Open questions / design issues
- Removals from the design are **UI-only for lite fields**. Under `pro-compat-review.md`, R1 keeps every pro 2.2.0 field in an "Advanced (Pro)" section (min quantity, badge upload, Buy X Get X). R2 keeps the category messages screen (pro-gated, REST `/bogo/category-messages`). Confirm which lite-only fields (alternates, shop/category page messages, shop-page badge) are really dropped.
- Fixed-price offer type: new?
- The list "Type" column has no editor field. How does a user create a Global offer?
- Buy X Get X must hide Offer Product.
- Delete has no confirm in the mockup; DataViews adds one. Accept.

## 10. Tasks and definition of done
- [ ] Fix bugs 1–7 (REST contract first, with its own tests).
- [ ] Per-offer settings migration (if approved).
- [ ] DataViews list + editor + preview.
- [ ] Global settings moved into the schema (`/settings/bogo`).
- [ ] Dokan vendor screens on the new components + ownership check.
- [ ] E2E matrix: create, edit (design preserved), status, bulk delete, lite cap, pro fields, vendor flow.
- [ ] Delete `modules/bogo/assets/src` and `integrations/assets` BOGO bundles.
