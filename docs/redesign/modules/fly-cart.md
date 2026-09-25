# Fly Cart

> **Design:** https://storegrowth-design.vercel.app/fly-cart.html
>
> Build it exactly as designed; see the design-fidelity rule in `README.md`.

## 1. Summary
- **Phase:** 3.
- **Size:** M.
- **Design:** `fly-cart.html`.

## 2. Current state
- **Option:** `spsg_fly_cart_settings`. Save merges into the existing option.
- **Transport:** admin ajax `spsg_fly_cart_get_settings` / `_save_settings`; storefront nopriv `spsg_fly_cart_frontend` (stays ajax) and WooCommerce `wc-ajax` coupon endpoints.
- **PHP hooks** (keep): `spsg_fly_cart_show_free_shipping_enabled`, `spsg_fly_cart_show_stock_status_enabled`, `storegrowth_sb_quick_cart_coupon` (all pro), `spsg_fly_cart_frontend_allowed_methods`, `spsg_fly_cart_item_bogo_badge`, `spsg_fly_cart_item_price_html`, `spsg_fly_cart_after_single_item_columns`, `spsg_ffc_wp_enqueue_scripts`, `spsg_woocommerce_before_cart_collaterals`, `storegrowth_quick_cart_module_init`, plus about 17 re-fired `woocommerce_cart_*` hooks.
- **JS hooks** (retire): `spsg_quick_cart_layout_settings`, `_position_settings`, `_content_settings`, `spsg_before_quick_cart_total_preview`, `spsg_cart_product_detail_after`, `spsg_quick_cart_state`.
- **Known bug:** the `woocommerce_add_to_cart_fragments` filter drops other plugins' fragments (`CommonHooks.php:88-98`). Fix it in this migration; it's storefront, but it's a one-line fix.

## 3. Target design
- Tabs: General (Layout picker cards, Cart Contents checkboxes) / Design (Icon Position picker ×6, Icon radio ×5, Colors ×5).
- Preview: cart panel + floating button.

## 4. Field map
| Design field | Option key | Tier | Component |
|---|---|---|---|
| Layout | `layout` `side` / `center` (design says "popup") | side lite, center pro | `PickerCards` (label "Popup" → value `center`) |
| Show Product Image | `show_product_image` | lite | checkbox |
| Show Remove Icon | `show_remove_icon` | lite | checkbox |
| Show Quantity Picker | `show_quantity_picker` | lite | checkbox |
| Show Product Price | `show_product_price` | lite | checkbox |
| Show Stock Status | `show_stock_status` | pro | checkbox |
| BOGO Badge | `fly_cart_badge_icon` | pro | checkbox |
| Free Shipping Message | `show_free_shipping_message` | pro | checkbox |
| Coupon | `show_coupon` | pro | checkbox |
| Cart panel auto-opens | `enable_add_to_cart_redirect` | pro | checkbox (**verify meaning**) |
| Cart Icon Position | `icon_position` (4 corners lite, centre-left/right pro) | lite/pro | `PickerCards` |
| Cart Icon | `icon_name` 1..5 | lite | `IconPicker` |
| Colors ×5 | `buttons_bg_color`, `shopping_button_bg_color`, `icon_color`, `widget_bg_color`, `product_card_bg_color` | lite | `color_picker` |
| Dokan store name / link (not in design) | `show_quick_cart_dokan_store_names`, `enable_quick_cart_dokan_store_links` | integration | keep; shown only when Dokan is active |

## 5. Data changes
None. The design's "popup" label maps to the stored `center`.

## 6. REST
`GET/POST /settings/fly-cart`.

## 7. Compatibility
- Admin ajax pair becomes adapters.
- The storefront ajax and all PHP hooks are unchanged.
- Direct Checkout's "Fly Cart Checkout" depends on this module being active; keep the cross-module check.
- Retired JS hooks → `storegrowth.settings.schema.fly-cart`, `storegrowth.preview.fly-cart`.

## 8. Components
- Builds: `PickerCards` and the cart panel preview.
- Reuses: `IconPicker`.

## 9. Open questions / design issues
- **The General tab has no Save.**
- Reset doesn't reset the pickers.
- The default icon doesn't match the preview.
- Confirm "Cart panel auto-opens" = `enable_add_to_cart_redirect`.

## 10. Tasks and definition of done
- [ ] Schema + adapters; fragments filter fix.
- [ ] TS page + preview.
- [ ] Characterisation test + E2E matrix (plus the fragments regression); delete the old bundle.
