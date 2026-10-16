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
| Checkout Redirect | `checkout_redirect` `legacy-checkout` / `quick-cart-checkout` (pro, needs Fly Cart) | lite/pro | radio + tooltips |
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
- Retired JS hooks → extension fields (`spsg_settings_schema` with `tab`; `storegrowth_settings_{variant}_field`), `storegrowth.preview.direct-checkout`.

## 8. Components
- Builds: radio list with per-option tooltip (upstream U2 or local) and the shop-grid preview.
- Reuses: `BoxModelInput`.

## 9. Open questions / design issues
- ~~Checkboxes → radio for Button Layout.~~ Radio (one choice), with the design's info tips (`option_help`).
- ~~The "Overview Border" label.~~ "Border Style".
- Design default colour `#155dfc` vs today's `#008dff`: today's default kept (ADR-004).
- **Page (ADR-009):** generated from `DirectCheckoutSettings` (`get_page()`: Checkout Setting / Design tabs; the style sections show while Custom Button Style is on). The bundle draws only the shop-grid preview (`LivePreview layout="shop"`) and three controls: Button Layout (its choices quote the button label), Checkout Redirect (Fly Cart Checkout needs the Fly Cart module, as before), and Padding (`BoxModelField pairOnly` over `paddingYaxis` / `paddingXaxis`; four sides would need new keys).
- Fonts: the five pro 2.2.0 draws (Poppins, Roboto, Lato, Montserrat, IBM Plex Sans), not the design's list.
- Pro choices (Button Layout `cart-to-buy-now` / `specific-buy-now`, Fly Cart Checkout) show only with pro, or while stored; a save without pro ignores them.
- Preview: font, padding and border apply only with pro (pro prints them on the storefront).
- The shop-page button's default layout was `cart-to-buy-now` in one hook (`CommonHooks::show_signle_direct_checkout_button_shop()`); it now uses the schema default `cart-with-buy-now` like the others. No behaviour change: that hook only runs when a layout is stored.
- Preview: the shop grid while pro shows the button in the shop loop (pro, Display on Shop Page on); otherwise the product page, where lite prints it.
- Numbers saved from the new page are stored as strings (engine rule); lite and pro read them with `absint()`.
- Preview filter: `storegrowth.preview.direct-checkout` ( widget, values ).
- Fly Cart Checkout with Fly Cart inactive (a stored choice): the Buy Now button used to do nothing (the script left the click to a panel that isn't there). The storefront flag now needs the module, so the button goes to checkout; the page keeps the choice and says so.
- A stored `font_size` of 0 or a non-number falls back to 16px (it hid the label).
- Engine-wide, not this module: a toggle accepts any non-empty string as true (`rest_sanitize_boolean()`), and an unknown module on POST returns 400 instead of 404.

## 10. Tasks and definition of done
- [x] Schema + sanitization + adapters (the ajax save now merges and validates).
- [x] TS page + preview.
- [x] Characterisation test (settings round-trip); old bundle deleted.
- [ ] E2E matrix. `storefront-direct-checkout.spec.ts` resets with a full base config (saves merge now). `inline-css-injection.spec.ts` seeds its payload through each module's admin save, which now rejects it (every redesigned module validates colours), so it needs a way to seed the option directly.
