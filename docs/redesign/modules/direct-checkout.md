# Direct Checkout

> **Design:** https://storegrowth-design.vercel.app/direct-checkout.html
>
> Build it exactly as designed; see the design-fidelity rule in `README.md`.

## 1. Summary
- **Phase:** 3.
- **Depends on:** `BoxModelInput` (from Countdown).
- **Size:** M.
- **Design:** `direct-checkout.html`.

## 2. Current state
- **Option:** `spsg_direct_checkout_settings`.
- **Product meta:** `_spsg_direct_checkout_button_layout` (product tab, used when the layout is `specific-buy-now`).
- **Transport:** ajax `spsg_direct_checkout_get_settings` / `_save_settings`. **Saves with no sanitization today.**
- **PHP hooks** (keep): `woocommerce_loop_add_to_cart_args` re-fire. Pro PHP filter: `spsg_direct_checkout_button_inline_styles`.
- **JS hooks** (retire): `spsg_prepend_direct_checkout_settings`, `spsg_direct_checkout_button_layout_options`, `spsg_after_direct_checkout_buy_now_settings`, `spsg_direct_checkout_page_options`, `spsg_inside_direct_checkout_redirection_settings`, `spsg_direct_checkout_before_product_page_settings`, `spsg_after_direct_checkout_button_design_settings`, `spsg_direct_checkout_button_preview_styles`.

## 3. Target design
- Tabs: Checkout (Button Label, Button Layout, Checkout Redirect, Visibility) / Design (Custom Button Style switch → Colors, Typography, Spacing, Border).
- Preview: shop grid with a live button.

## 4. Field map
| Design field | Option key | Tier | Component |
|---|---|---|---|
| Buy Now Button Label | `buy_now_button_label` | pro | `text` |
| Button Layout (4 options) | `buy_now_button_setting`: `cart-with-buy-now`, `default-add-to-cart` (lite), `cart-to-buy-now`, `specific-buy-now` (pro) | lite/pro per option | **radio** (the design draws checkboxes, but it's one choice) |
| Checkout Redirect | `checkout_redirect` `legacy` / `quick-cart` (pro, needs Fly Cart) | lite/pro | radio + tooltips |
| Display on Shop Page | `shop_page_checkout_enable` | pro | checkbox |
| Display on Product Page | `product_page_checkout_enable` | lite | checkbox |
| Custom Button Style | `button_style` | lite | `switch` controlling the sections |
| Button Color / Text Color | `button_color`, `text_color` | lite | `color_picker` |
| Font Family | `font_family` | pro | `select` |
| Font Size | `font_size` | lite | `number` + px |
| Padding | `paddingXaxis`, `paddingYaxis` | pro | `BoxModelInput` in 2-value mode (4-value would need new keys; don't add them) |
| Border style / width / color | `button_border_style`, `border_width`, `border_color` | pro | `select`, `number`, `color_picker` |
| Border Radius | `button_border_radius` | lite | `number` + px |

## 5. Data changes
- None. Add sanitization on save.
- Fix the PHP default mismatch (`CommonHooks.php:81`); the schema defaults win.
- `generated_link` is dead and stays unread.

## 6. REST
`GET/POST /settings/direct-checkout`. Product meta stays in the PHP product tab (optional #38).

## 7. Compatibility
- Ajax pair becomes adapters (now sanitized).
- The product meta key is unchanged.
- Pro's inline-styles filter reads the same keys.
- Retired JS hooks → `storegrowth.settings.schema.direct-checkout`, `storegrowth.preview.direct-checkout`.

## 8. Components
- Builds: radio list with per-option tooltip (upstream U2 or local) and the shop-grid preview.
- Reuses: `BoxModelInput`.

## 9. Open questions / design issues
- Checkboxes → radio for Button Layout.
- The "Overview Border" label.
- Design default colour `#155dfc` vs today's `#008dff`. Keep today's default.

## 10. Tasks and definition of done
- [ ] Schema + sanitization + adapters.
- [ ] TS page + preview.
- [ ] Characterisation test + E2E matrix; delete the old bundle.
