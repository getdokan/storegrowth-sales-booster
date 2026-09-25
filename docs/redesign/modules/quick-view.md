# Quick View

> **Design:** https://storegrowth-design.vercel.app/quick-view.html
>
> Build it exactly as designed; see the design-fidelity rule in `README.md`.

## 1. Summary
- **Phase:** 3.
- **Size:** M (option values change, so a migration is needed).
- **Design:** `quick-view.html`.

## 2. Current state
- **Option:** `spsg_quick_view_settings`. Save replaces the whole option.
- **Transport:** admin ajax `spsg_quick_view_get_settings` / `_save_settings`; storefront nopriv `spsgqcv_quickview` (stays ajax).
- **PHP hooks** (keep): `spsg_qcv_inline_styles`, `spsg_quick_view_details_button`, `spsg_quick_view_icon_button` (all pro), `spsg_product_description_heading`, `spsgqcv_*` (summary, thumbnails, image size, localization, redirect, redirect_url), `woocommerce_add_to_cart_redirect`, `storegrowth_quick_view_module_init`.
- **JS hooks** (retire): `spsg_quick_view_navigation_settings`, `_button_position_settings`, `_add_to_cart_redirection_settings`, `spsg_quick_after_modal_close_button_settings`, `spsg_quick_view_button_icon_settings`, `spsg_quick_view_fly_cart_settings`, `spsg_shop_quick_view_enable_settings`, `spsg_variation_product_quick_view_enable_settings`.

## 3. Target design
- Tabs: General (fields, a Button Settings accordion, a Quick View Contents accordion) / Design.
- Preview: interactive modal mock.

## 4. Field map
| Design field | Option key | Tier | Component |
|---|---|---|---|
| Enable In Mobile | `enable_in_mobile` | lite | `switch` |
| Enable Zoom Box | `enable_zoom_box` | lite | `switch` |
| Modal Effects | `modal_animation_effect` | lite | `select` (values change, §5) |
| Add To Cart Redirection | `cart_url_redirection` | pro | `select` (values change, §5) |
| Auto open Fly Cart (not in design) | `auto_open_fly_cart` | pro | keep, `switch` shown when Fly Cart is active |
| Button label (max 15) | `button_label` | lite | `text` + counter |
| Button Position | `button_position` | lite/pro | `select` (values change, §5) |
| Enable Quick View Icon | `enable_qucik_view_icon` (sic) | pro | `switch` |
| Button Icon | `quick_view_icon` 1..4 | pro | `IconPicker` |
| Enable Close Button | `enable_close_button` | lite | `switch` |
| Enable View Details Button | `show_view_details_button` | pro | `switch` |
| Contents ×7 | `show_title`, `show_description`, `show_price`, `show_image`, `show_excerpt`, `show_meta`, `show_add_to_cart` | lite | checkboxes |
| Button Border Radius | `button_border_radius` | lite | `number` + px |
| Button / Text / Modal colours | `button_color`, `button_text_color`, `modal_background_color` | lite | `color_picker` |
| Navigation Background | `navigation_background` | pro | `color_picker` |

## 5. Data changes (migration via `MigrationManager`)
| Key | Today | Design | Proposal |
|---|---|---|---|
| `modal_animation_effect` | 4 magnific-popup effects (`mfp-3d-unfold`, …) | Fade / Slide / Zoom / None | Keep today's stored values; map the design labels to existing effects and add `none`. No migration if product accepts the labels |
| `cart_url_redirection` | `legacy-cart` / `shop-page` / `add-to-cart-ajax` | Shop / Cart / Checkout / Stay | Add `checkout` as a new value; map Cart→`legacy-cart`, Shop→`shop-page`, Stay→`add-to-cart-ajax`. No migration |
| `button_position` | `after` / `before` / `center_on_the_image` | center / top-right / bottom | Needs the storefront positions to exist. **Product decision**; if adopted, add new values and migrate old ones |

Prefer **additive values over rewriting stored ones**. Pro reads these keys.

## 6. REST
`GET/POST /settings/quick-view`.

## 7. Compatibility
- Admin ajax pair becomes adapters.
- Storefront `spsgqcv_quickview` is unchanged.
- All `spsgqcv_*` hooks are unchanged.
- Retired JS hooks → `storegrowth.settings.schema.quick-view`, `storegrowth.preview.quick-view`.

## 8. Components
- Builds: max-length counter on text fields (or upstream U7) and the modal preview widget.
- Reuses: `IconPicker`.

## 9. Open questions / design issues
- Option value changes (§5).
- Button Position only matters in icon mode.
- Dead keys stay unread: `navigation_text_color`, `enable_product_navigation`, `show_quick_icon`.

## 10. Tasks and definition of done
- [ ] Schema + adapters. Save merges instead of replacing, so unknown keys are kept.
- [ ] Value mapping and any migration.
- [ ] TS page + modal preview.
- [ ] Characterisation test + E2E matrix; delete the old bundle.
