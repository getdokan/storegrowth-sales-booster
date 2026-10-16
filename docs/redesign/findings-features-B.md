# Feature inventory B — bogo, upsell-order-bump, quick-view, fly-cart, direct-checkout, admin shell, endpoints

| Module | Settings | Lite / pro | Transport | Storage |
|---|---|---|---|---|
| BOGO | 7 global + ~16 per offer + product-tab form | Pro: badge icon/upload, min qty, Buy X Get X, product-tab schedule/categories/variations; lite cap 2 offers | REST `sales-booster/v1/bogo/offers` (+`/{id}`, `/{id}/status`, `/vendor`) + 6 lite ajax + 2 pro ajax | Table `spsg_bogo_settings` (type global/product) |
| Order Bump | 8 per offer + 9 design | Pro JS only lifts 2-offer cap (UI-only) | REST `spsg/v1/order-bumps` + 1 public ajax | Table `spsg_order_bumps` |
| Quick View | 22 (3 dead) | 6 pro | 2 admin + 1 public ajax | Option `spsg_quick_view_settings` (replaced on save) |
| Fly Cart | 17 (+2 Dokan) | ~7 pro | 2 admin + 1 public ajax | Option `spsg_fly_cart_settings` (merged on save) |
| Direct Checkout | 16 (1 dead) | 8 pro | 2 admin ajax | Option `spsg_direct_checkout_settings` (unsanitized) + product meta `_spsg_direct_checkout_button_layout` |

## Order Bump (`modules/upsell-order-bump/`)
Per offer (defaults `assets/src/helper.js:83-117`, store `spsg_order_bump`):

| Key | Column | Default | Control |
|---|---|---|---|
| `name_of_order_bump` | `name` | — | TextInput |
| `bump_type` (products/categories) | `target_type` | — | TextRadioBox |
| `target_products[]` | `target_products` | — | MultiSelectBox |
| `target_categories[]` | `target_categories` | — | MultiSelectBox |
| `bump_schedule` | **not persisted** | `['daily']` | MultiSelect |
| `offer_product` | `offer_product_id` | — | SelectBox (simple + variations) |
| `offer_type` (discount/price) | `offer_type` | — | Select |
| `offer_amount` | `offer_amount` | — | InputNumber (max checks client-only) |

Design (`design_settings` JSON): `box_border_style` solid, `box_border_color` #32DBBE, `box_top_margin`/`box_bottom_margin` 1 (0–20), `discount_background_color` #E1FFF4, `discount_text_color` #02AC6E, `discount_font_size` 13 (12–25), `product_description_text_color` #080814, `product_description_font_size` 18 (14–22), `offer_discount_title` "% off only for you!", `offer_fixed_price_title` "$ Just Only"; ~9 more saved with no control.
Dead: `OrderBumpGlobalSettings.js` (offer_skip, offer_remove, offer_adaption, offer_location, offer_price, smart_offer, custom_css, custom_js).
Table columns: `id, name, status(active), target_type, target_products JSON, target_categories JSON, offer_product_id, offer_type, offer_amount decimal(10,2), offer_discount_title, design_settings JSON, created_by, updated_by, created_at, updated_at`. Created on module activation only. Legacy CPT `spsg_order_bump` still queried/localized, unused.
Pro: `P/src/components/Modules/UpsellOrderBump/index.js` hooks `spsg_upsell_order_bump_data`, `spsg_control_upsell_order_bump_data`. No REST/storefront cap.
REST `spsg/v1` (all `manage_options`): `/order-bumps` GET (`page`, `per_page`=10, `status`, `orderby`, `order`) + POST; `/order-bumps/{id}` GET/EDITABLE/DELETE; `/order-bumps/matching` GET (unused). Client uses raw fetch + `wpApiSettings.nonce` (never enqueued).
Ajax: `upsell_offer_product_add_to_cart` nopriv, `spsg_frontend_ajax_nonce`, server-side price.
List: Name, Targets, Offers, Actions (Edit, Delete→reload). No status toggle, search, filters, bulk. First 10 rows only.
Frontend: classic `woocommerce_review_order_before_submit`; Blocks integration `storegrowth-upsell-order-bump`; full reload on tick; qty forced 1; removed when target leaves cart; order-item meta `_spsg_campaign_*` via CRUD (HPOS-safe). `BlockRegistry` in always-loaded provider (may run while inactive).
Possible bug: variation offers may always 403 (not reproduced).

## BOGO (`modules/bogo/`)
Global option `spsg_bogo_general_settings` (saved unsanitized): `offer_remove_from_cart` false, `regular_price_show` false, `shop_page_bage_icon` false, `global_product_page_bage_icon` false, `default_badge_icon_name` `bogo-icons-1` (pro RadioBox `spsg_bogo_global_badge_icon_radio_box`), `default_custom_badge_icon` (pro), `bogo_category_messages[]` (tab commented out; frontend pro).
Per offer (CreateBogo tabs basic/design/content): `name_of_order_bogo`, `offered_products` (single), `bogo_deal_type` `different` | `same` (pro `spsg_hide_bogo_premium_options`), `get_different_product_field`, `offer_type` free/discount, `discount_amount`, `offer_start`/`offer_end` (lite), `minimum_quantity_required` (pro `spsg_after_bogo_offer_settings`), `enable_custom_badge_image` (+ pro `spsg_bogo_single_badge_icon_radio_box`), 9 design keys, `product_page_message` (read-only unless pro `spsg_edit_bogo_message`). Hidden/not persisted: `offer_schedule`, `exclude_products`, `bogo_type`, alternate categories. JS/PHP/frontend design defaults differ.
Product tab: nonce `spsg_bogo_settings`, `edit_product`; pro adds min qty, categories/exclusions, schedule, per-variation rows; lite shows upgrade notice for variable products or ≥2 global offers.
Table `spsg_bogo_settings`: `id, type(product|global), name, product_id, variation_id, offered_products JSON, offered_categories JSON, bogo_deal_type, offer_type, discount_amount, minimum_quantity_required, offer_product_id, alternate_products JSON, product_page_message, shop_page_message, bogo_badge_image, offer_start, offer_end, offer_schedule JSON, status, design_settings JSON, created_by/updated_by/created_at/updated_at`; unique (`product_id`,`variation_id`). Dropped on save: badge fields, `bogo_type`, alternate categories, exclusions, variable availability. `BogoMigration` (CPT `spsg_bogo` + meta → table) likely fails for global offers (unserializes JSON excerpt).
REST `sales-booster/v1`: `/bogo/offers` GET/POST, `/{id}` GET/PUT/PATCH/POST/DELETE, `/{id}/status` (`yes|no`). Permission `spsg_bogo_check_permission` (default `manage_options`). Lite: 403 `salesbooster_limit_exceeded` at ≥2 global. Response omits `design_settings`, `offer_schedule` → edit overwrites design with defaults. List returns product rows but `X-WP-Total` counts global only; `search` ignored.
Ajax: `spsg_bogo_general_{save,get}_settings` (spsg_ajax_nonce), `bogo_category_msg_{create,list}` (spsg_admin_ajax_nonce), nopriv `offer_product_add_to_cart` (JS caller dead), `update_offer_product` (gift swap); pro `bogo_category_msg_status_handler`, `bogo_category_msg_delete` (`spsg_bogo_nonce`).
List: Name, Type, Status switch, Targets, Offers, Actions (Edit, Delete confirm→reload). No search/filters/bulk; first 20. Cap counted 4 different ways.
Frontend: offer box `woocommerce_single_product_summary`@6; badge template (broken for global: missing `status`); auto-add gift on `woocommerce_add_to_cart`; swap popup + Fly Cart badge (pro); order-item meta via CRUD.

## Dokan integration (`integrations/`)
Admin "Vendors" tab (`spsg_bogo_tab_panels`), option `spsg_bogo_dokan_vendors_settings.vendors_can_create_buy_x_get_x` (true), ajax `spsg_bogo_vendors_{get,save}_settings` unsanitized. PHP flag hides vendor menu; JS only hides `same` deal type.
Vendor dashboard nav `bogo` (`dokandar`), routes `/bogo` (DataViews, server paging 10), `/bogo/create-bogo`, `/bogo/:id` reusing lite `CreateBogo`. `spsg_bogo_check_permission` widened to `dokandar` + `created_by` scope. `VendorBogoController` (`/bogo/offers/vendor`) registered but unused, even when module inactive.
Gaps: no vendor ownership check on product IDs; vendor flag not enforced server-side; full product list exposed inline.

## Quick View (option `spsg_quick_view_settings`)
Tabs General/Button/Design. `enable_in_mobile` true, `enable_zoom_box` false, `modal_animation_effect` mfp-3d-unfold (4), `cart_url_redirection` legacy-cart/shop-page/add-to-cart-ajax (pro; PHP default false), `auto_open_fly_cart` (pro), `show_title/description/price/image/excerpt/meta/add_to_cart` true, `button_label` "Quick View" (max 15), `button_position` after/before/center_on_the_image (pro), `enable_qucik_view_icon` + `quick_view_icon` 1..4 (pro), `enable_close_button` true, `show_view_details_button` (pro), `button_border_radius` 4, `button_color` #0875FF, `button_text_color` #fff, `modal_background_color` #fff, `navigation_background` #000 (pro). Dead: `navigation_text_color`, `enable_product_navigation`, `show_quick_icon`.
Pro JS: `spsg_quick_view_navigation_settings`, `_button_position_settings`, `_add_to_cart_redirection_settings`, `spsg_quick_after_modal_close_button_settings`, `spsg_quick_view_button_icon_settings`, `spsg_quick_view_fly_cart_settings`. Pro PHP: `spsg_qcv_inline_styles`, `spsg_quick_view_details_button`, `spsg_quick_view_icon_button`.
Ajax: `spsg_quick_view_{save,get}_settings`; nopriv `spsgqcv_quickview` (nonce `spsgqcv-security`) returns modal HTML.

## Fly Cart (option `spsg_fly_cart_settings`, pro `QuickCartPro`)
`layout` side | center (pro); `show_product_image`, `show_remove_icon`, `show_quantity_picker`, `show_product_price` true; `show_stock_status` false, `fly_cart_badge_icon` true, `show_free_shipping_message` false (pro, `needUpgrade`); `show_coupon` true, `enable_add_to_cart_redirect` true (pro); `icon_position` 4 corners | center-left/right (pro); `icon_name` shopping-cart-icon-5 (1..5); `buttons_bg_color` #0875FF, `shopping_button_bg_color` #073B4C, `icon_color` #FFF, `widget_bg_color` #FFF, `product_card_bg_color` #FFF; Dokan `show_quick_cart_dokan_store_names`, `enable_quick_cart_dokan_store_links` true.
Pro JS: `spsg_quick_cart_layout_settings`, `_position_settings`, `_content_settings`, `spsg_before_quick_cart_total_preview`.
Ajax: `spsg_fly_cart_{save,get}_settings`; nopriv `spsg_fly_cart_frontend` (nonce `spsg_frontend_ajax`, method allow-list); WC cart/remove/`wc-ajax` coupon endpoints.
Bug: `woocommerce_add_to_cart_fragments` filter drops all other fragments (`CommonHooks.php:88-98`).

## Direct Checkout (option `spsg_direct_checkout_settings`, store `spsg_direct_checkout`)
`buy_now_button_label` "Buy Now" (pro); `buy_now_button_setting` cart-with-buy-now | default-add-to-cart | cart-to-buy-now / specific-buy-now (pro) (PHP default mismatch `CommonHooks.php:81`); `checkout_redirect` legacy | quick-cart (pro, needs Fly Cart); `shop_page_checkout_enable` true (pro); `product_page_checkout_enable` true; `button_style` true, `button_color` #008dff, `text_color` #fff, `font_size` 16, `button_border_radius` 5; pro design `font_family` poppins, `paddingXaxis` 20, `paddingYaxis` 10, `border_width` 1, `border_color` #008dff, `button_border_style` solid. Dead: `generated_link`.
Pro JS: `spsg_prepend_direct_checkout_settings`, `spsg_direct_checkout_button_layout_options`, `spsg_after_direct_checkout_buy_now_settings`, `spsg_direct_checkout_page_options`, `spsg_inside_direct_checkout_redirection_settings`, `spsg_direct_checkout_before_product_page_settings`, `spsg_after_direct_checkout_button_design_settings`, `spsg_direct_checkout_button_preview_styles`. Pro PHP: `spsg_direct_checkout_button_inline_styles`.
Ajax: `spsg_direct_checkout_{save,get}_settings` (JSON `data.direct_checkout_data`, unsanitized). `isQuickCartActivated` flag name inverted.

## Admin shell
Menu (`includes/Admin/AdminMenu.php`): Dashboard (`#/dashboard/overview`), Modules (`spsg-modules`), Settings (`spsg-settings`), Docs, Initial Setup (`#/ini-setup`), Upgrade.
Bundles: `build/modules.js`, `build/settings.js`, `build/notices.js` + each active module's `assets/build/settings.js`.
Modules SPA: `/` (cards), `/ini-setup`. Settings SPA routes via `applyFilters('spsg_routes', dashboardRoutes)`: `/dashboard/overview`, `/dashboard/faq`, `/advanced` (REST `sales-booster/v1/settings`, `remove_data_on_uninstall`), `/<moduleId>`. Sidebar appends inactive modules → activation alert. Dead: `sidebar_menu_items`, `#/dashboard/pricing`.
Module cards: ajax `spsg_admin_ajax` → `get_all_modules` (`ModuleManager::list_all_modules`, filter `spsg_modules`): `id, name, icon, banner, description, category, status, doc_link` (no pro flag). Toggle `update_module_status` → `spsg_active_module_ids` (fatals on unknown id).
Stores: `spsg` (×2 — collide if bundles merge), `spsg_bogo`, `spsg_direct_checkout`, `spsg_order_sales_pop`, `spsg_order_bump`.
Localized: `spsgAdmin {ajax_url, nonce, isPro}`, `spsg.currency`, `bogo_save_url`, `bump_save_url`, `sales_pop_data`, `spsgProAdmin` (`spsg_bogo_nonce`); pro reuses WC global name `wc_cart_params`.
Pro: requires license → `storegrowth_pro_is_active`, `*Pro` classes on `storegrowth_module_after_boot` (none for upsell), `build/index.js` with ~64 `addFilter`, no routes.

## All ajax actions
- Admin `spsg_ajax_nonce` + `manage_options`: `spsg_admin_ajax` (`get_all_modules`, `update_module_status`), `spsg_inisetup_flag_update`, `*_{save,get}_settings` for stock-bar, fly-cart, countdown-timer, direct-checkout, pd-banner, floating-notification-bar, quick-view, bogo_general, bogo_vendors.
- Admin `spsg_admin_ajax_nonce` + `manage_options`: `popup_products`, `create_popup`, `bogo_category_msg_create`, `bogo_category_msg_list`.
- Pro `spsg_bogo_nonce` + `manage_options`: `bogo_category_msg_status_handler`, `bogo_category_msg_delete`.
- Public nopriv: `spsg_fly_cart_frontend`, `spsgqcv_quickview`, `offer_product_add_to_cart`, `update_offer_product`, `upsell_offer_product_add_to_cart` (3 different public nonce actions).

## REST routes
| Route | Permission |
|---|---|
| `sales-booster/v1/settings` | `manage_options` |
| `sales-booster/v1/products` (full WC product CRUD + batch) | inherited WC — should be read-only |
| `sales-booster/v1/migration/status`, `/migration/upgrade` | `update_plugins` |
| `sales-booster/v1/notices/admin`, `/notices/dismiss` | `manage_options` |
| `sales-booster/v1/bogo/offers` (+ `/vendor`) | `spsg_bogo_check_permission` |
| `spsg/v1/order-bumps` | `manage_options` |

Pro registers no REST routes.
