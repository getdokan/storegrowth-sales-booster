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
| Add To Cart Redirection | `cart_url_redirection` | lite/pro | `select` (values change, §5) |
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

## 5. Data changes (decided: additive values, no migration)
| Key | Stored today | Page shows (design labels → stored value) |
|---|---|---|
| `modal_animation_effect` | `mfp-3d-unfold` (default), `mfp-zoom-out`, `mfp-move-from-top`, `mfp-fade` | Fade → `mfp-fade`, Slide → `mfp-move-from-top`, Zoom → `mfp-zoom-out`, None → **`mfp-none` (new)**. `mfp-none` works because the animation rules only exist per effect class. **3D Unfold (flip) is retired** (product decision): not offered, default is now Fade, and a stored `mfp-3d-unfold` reads as Fade on the storefront (`QuickViewSettings::modal_effect()`); the stored value isn't rewritten |
| `cart_url_redirection` | `legacy-cart-redirection` (default), `shop-page-redirection`; pro `add-to-cart-ajax` | Shop Page / Cart Page / **Checkout Redirect (`checkout-redirection`, new, lite)** / Stay On Page (`add-to-cart-ajax`, pro). Checkout is resolved server-side in `CommonHooks::add_to_cart_redirect()` |
| `button_position` | `after_add_to_cart` (default), `before_add_to_cart`; pro `center_on_the_image` | After / Before Add to Cart, Center On The Image (pro), **Top Right Of The Image (`top_right_of_the_image`, new, pro)**. Pro 2.2.0 doesn't know the new value, so lite's inline CSS draws it when pro is active |

Pro-only values are offered only with pro; a stored pro value still shows without pro. The schema accepts every value; the storefront falls back as before. Saves merge (the old ajax replaced the whole option), so unknown keys are kept.

## 6. REST
`GET/POST /settings/quick-view`.

## 7. Compatibility
- Admin ajax pair becomes adapters.
- Storefront `spsgqcv_quickview` is unchanged.
- All `spsgqcv_*` hooks are unchanged.
- Retired JS hooks → extension fields (`spsg_settings_schema` with `tab`; `storegrowth_settings_{variant}_field`), `storegrowth.preview.quick-view`.

## 8. Components
- Builds: max-length counter on text fields (or upstream U7) and the modal preview widget.
- Reuses: `IconPicker`.

## 9. Open questions / design issues
- ~~Option value changes (§5)~~ decided: additive values.
- Dead keys stay unread and out of the schema: `navigation_text_color`, `enable_product_navigation`, `show_quick_icon`. `show_rating` is read by `CommonHooks` (default on) but was never in the admin; left out.
- **Preview:** the design's modal mock, not the storefront markup (an ADR-005 S10 exception): the real modal is the theme's single-product layout in a 920px magnific-popup, which neither fits the frame nor looks like any one store. A shop card below shows the button where Button Position puts it.
- Button label: `n / 15` counter and input limit; no server limit, so a longer stored label still saves.
- Button icons: the preview draws the lucide icons (zoom-in, eye, scan-eye, search); pro 2.2.0's storefront draws its own icons for `quick-view-icon-1..4`.
- "Navigation Background" colours the modal's prev/next arrows (pro), as on the storefront; the design's mock applied it to View Product Details.
- Auto Open Fly Cart (not in the design) shows with Stay On Page while Fly Cart is active.
- Tab ids (extension fields): `general`, `design`.

## 10. Tasks and definition of done
- [x] Schema + adapters. Save merges instead of replacing, so unknown keys are kept.
- [x] Value mapping (additive, no migration).
- [x] TS page + modal preview.
- [x] Characterisation test (settings round-trip); old bundle deleted.
- [ ] E2E matrix.
