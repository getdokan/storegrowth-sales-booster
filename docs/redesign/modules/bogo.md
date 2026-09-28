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
- Retired JS hooks → `storegrowth.bogo.editor.tabs`, extension fields (`spsg_settings_schema` with `tab`; `storegrowth_settings_{variant}_field`), `storegrowth.preview.bogo`.

## 8. Components
- Builds: DataViews list pattern (shared with Order Bump), `BadgePicker`, BOGO box preview, `EditorLayout` (back button + tabs + preview).
- Reuses: `ProductSearch`, `DateRange`.

## 9. Decisions (2026-09-28)
Planning reviews (architect, designer) found: the old editor already hides alternates, BOGO type (categories), the schedule and the shop-page message, and the Messages tab is commented out; the admin editor always creates `type=global`, "Specific" rows come only from the WooCommerce product tab.

- **Fixed-price offer type: deferred.** Every pricing path (lite, and pro 2.2.0's cart) prices anything but `discount` as free, so a new value would give products away under pro 2.2.0. The editor offers Free and Percentage; Fixed ships later with a pro release that prices it.
- **Global settings: a settings page** (`/settings?module=bogo`, schema `BogoSettings`, `GatedSettingsSchema` because the storefront reads the option raw), linked from the list header. `bogo_category_messages` stays out of the schema (kept by merge saves). No per-offer overrides now.
- **1.x migration (bug 6): fixed, guarded.** Correct names (`sgsb_bogo`, `sgsb_product_bogo_settings`), mapped keys, a per-row try; runs once behind a flag option (autoload false), only when the table has no global offers.
- **Offer Product: single product**, as stored (`offer_product_id`); `alternate_products` stays stored, hidden.
- **Removed from the UI only** (columns and REST keys kept, ADR-004): alternates, shop/category page messages. Pro 2.2.0 fields with no place in the design go in an "Advanced (Pro)" section (R1): min quantity, schedule, exclusions, badge upload. Category messages keep a pro-gated screen (R2).
- **Specific rows:** status and delete work in the list; Edit links to the product's BOGO tab (the editor rewrites a row as global).
- Buy X Get X hides Offer Product (`show_when`); `same` is a pro option.
- Delete confirm: the DataViews one.
- Border "None" maps to the stored `no_border`.
- **Lite cap:** one rule, global offers of any status (rest-api #19), used by REST and the product tab; the list gets "can create" from the server.

## 10. Sub-steps (each reviewed and committed)
- [x] **10a** (notes: the storefront badge loop can now pick an older valid global offer when the newest matching one is out of its dates, a visible fix; the Dokan vendor route keeps its own filters and ignores `search`/`type`/`status` until 10f; a create missing the route's required args gets 400 before the limit) REST contract fixes: bug 1 (GET returns `design_settings` + `offer_schedule`; PUT merges over the stored offer), bug 2 (`search` / `type` / `status` reach the query), bug 3 (`X-WP-Total` counts every row, headers always sent), bug 4 (formatted list carries `status` and dates; badge keys persisted in `design_settings`), bug 5 (one lite-cap helper; product-tab pluck fix), pro-only values ignored without pro (R3). PHPUnit tests per bug.
- [x] **10b** (notes: the legacy ajax save drops an empty `default_badge_icon_name`, which pro 2.2.0's screen sends with an upload, and keeps the stored icon; "Allow Remove Offer Product" in the cart wasn't browser-tested; the product-page badge sits where the theme puts it) Global settings page (`BogoSettings`, gated; `#/settings?module=bogo` until 10c links it from the list), ajax save through `SettingsService` (merges and validates; it replaced the option unsanitized). Default badge icon and upload (pro) drawn by the bundle with the storefront's badge artwork (`assets/images/bogo/`). **The Dokan vendor flags move to 10f:** they live in their own option (`spsg_bogo_dokan_vendors_settings`), which extension fields can't write.
- [x] **10c** Routing (catalog `route`: `moduleRoute( 'bogo' )` is `/bogo`, so the feature menu, dashboard and modules list open the list; `/bogo/create-bogo` and `/bogo/:id` show a placeholder until 10d; `/bogo/messages` comes with 10e) and the DataViews list (search, status switch, Edit / Delete with confirm, bulk delete, empty and no-results states, Settings button, Add New disabled with the Pro badge at lite's limit), `POST /bogo/offers/batch`. The list lives in the module for now; Order Bump (step 11) extracts what it shares. Notes: while the module is off the list page asks to turn it on (its REST routes aren't loaded); prices come from the server in the store's format (`offer_prices`, the cart's `calculate_offer_price()`); category offers list their categories; Buy X Get X prices the target product; 2.2.0's `#/bogo?tab_name=…` opens the settings page; the product page opens its BOGO tab from `#bogo_product_data`; a guest gets 401 (was 403) and search keeps `<` (it stripped tags). Accepted deviations from `bogo.html`: title and table are one card, as the settings pages (search sits in DataViews' toolbar, not beside the title); the row menu is the WordPress DataViews dropdown (no icons, Delete not red); the search input's accessible name waits on plugin-ui (`searchLabel` is declared but unused). **10d must reject a non-numeric `/bogo/:id`** (2.2.0's `/bogo/create-message` matches it until 10e adds `/bogo/messages`).
- [ ] **10d** Editor and preview (`BogoOfferFields` schema + page, `useBogoOffer`), Advanced (Pro), `BadgePicker`; ADR-010 (PHP page filters replace `storegrowth.bogo.editor.tabs`).
- [ ] **10e** Category messages (R2): REST + pro-gated screen.
- [ ] **10f** Dokan: ownership check and `vendors_can_create_buy_x_get_x` enforced server-side (bug 7); vendor dashboard on the shared list/editor.
- [ ] **10g** 1.x migration fix (bug 6).
- [ ] **10h** Cleanup: delete `modules/bogo/assets/src` and the Dokan BOGO bundles; E2E matrix (no pro / pro 2.2.0).
