# ADR-005: One consistent storefront implementation across modules

- Status: Accepted
- Date: 2026-09-25
- Related: ADR-003 (admin Tailwind; never on the storefront), ADR-004 (compatibility)

## Context

A survey of the 10 modules' storefront code showed each one solving the same problems differently:

| Concern | Before |
|---|---|
| Styles from settings | Each module concatenated its own CSS string with its own selectors and `wp_add_inline_style` (8 modules). Templates also used inline `style=""` attributes (BOGO 17, Sales Pop 14, Countdown 13, Order Bump 9, …). No CSS custom properties anywhere. |
| Colour sanitization | Mixed: `Helper::sanitize_css_color` in some modules, none in others |
| Fonts | Font lists differed per module (Countdown 6, Free Shipping 5, …). Countdown's `wpbs-style.css` `@import`ed Google Fonts (Merienda); others shipped local font folders |
| Font weights | Sales Notification 3 options, Countdown 4 |
| Text tokens | `[amount]`, `[discount]` (brackets) vs `{quantity}`, `{virtual_name}` (braces) |
| Display rules (device, trigger, page, audience) | Duplicated in Free Shipping, Floating Bar and Sales Notification, with the same keys but separate code |
| Templates | Plain `include __DIR__ . '/../templates/…'`; themes couldn't override them |
| Stacking | Bars, popups, fly cart and quick view each picked their own z-index and position |
| Admin preview | Would re-implement every widget in React (drift risk) |

One pattern for the storefront is worth it only if nothing visible changes for sites that don't edit their settings.

## Decision

Standard **S1–S10** applies to every module's storefront, existing and new.

### S1. Settings → CSS custom properties
- Every styled widget has one root class, `spsg-<module>`, e.g. `spsg-stock-bar`, `spsg-countdown`, `spsg-fly-cart`.
- Settings are emitted as **scoped CSS variables** on that class through one shared renderer:
  ```php
  StorefrontStyle::render( 'stock-bar', [
      'bar-bg'      => [ 'value' => $s['stockbar_bg_color'], 'type' => 'color' ],
      'bar-height'  => [ 'value' => $s['stockbar_height'],   'type' => 'px' ],
      'font-family' => [ 'value' => $s['font_family'],       'type' => 'font' ],
  ] );
  // → .spsg-stock-bar{--spsg-stock-bar-bar-bg:#e7efff;--spsg-stock-bar-bar-height:10px;…}
  ```
- **Static CSS** (`modules/<m>/assets/css/*.css`) consumes the variables, with **the old hard-coded value as the fallback**: `background: var(--spsg-stock-bar-bar-bg, #e7efff);`. A site with no saved value renders as before.
- **Existing CSS output is kept alongside:**
  - Existing inline CSS filters keep firing with the same arguments, and their returned CSS is still appended: `spsg_countdown_timer_styles`, `spsg_qcv_inline_styles`, `spsg_direct_checkout_button_inline_styles`, and the rest in `tests/compat/php-hooks-baseline.txt`. Pro's CSS keeps working.
  - Existing selectors and classes are **never removed or renamed**, because themes and pro target them. New classes are added next to them.
- **No new inline `style=""` attributes** in templates; a replaced one must render identically. The template markup otherwise stays the same.

### S2. Shared style vocabulary for new settings
Existing option keys never change (ADR-004). **New** style settings, and the CSS variable names every module uses (old keys are mapped onto them), follow one vocabulary:

| Group | Tokens (suffixes) |
|---|---|
| Typography | `font-family`, `font-size`, `font-weight`, `line-height`, `letter-spacing`, `color` |
| Box | `bg`, `border-color`, `border-width`, `border-style`, `radius`, `padding`, `margin`, `align` |
| Button | `btn-bg`, `btn-color`, `btn-radius`, `btn-padding`, `btn-border-*` |
| Layout | `width`, `height`, `gap`, `position` |

- New option keys use the matching snake_case (`heading_letter_spacing`, `widget_radius`, …).
- Each module maps `option key → token` in one place (where it calls `StorefrontStyle::render()`). That's the only place that knows legacy names such as `stockbar_fg_color` and `paddingXaxis`.

### S3. Values
- **Colours:** 6-digit hex (alpha off, matching the admin rule), sanitized by `Helper::sanitize_css_color` inside the renderer, **for every module**. Invalid values fall back to the default, never to empty.
- **Lengths:** stored as integers, emitted with `px`. Box values (margin/padding) are stored as `{top,right,bottom,left}` for new keys; old two-value keys (`paddingXaxis/Yaxis`) are mapped.
- **Keywords** (border style, alignment, position): allow-listed through `Helper::sanitize_css_keyword`.

### S4. Fonts
- **One font list for every module:** `inherit` (theme font, the default for **new** keys), Inter, Poppins, Roboto, Open Sans, Lato. Stored values outside this list (e.g. older Countdown fonts) stay valid and keep rendering.
- **One font loader**, `StorefrontFonts::request( $family )`:
  - collects the fonts actually in use by the active modules on the page; fonts requested before `wp_head` load in the head, later ones (from templates) in the footer;
  - bundled files first (`StorefrontFonts::local_stylesheets()`: one shared Inter, Countdown's Merienda), then one Google Fonts request for the rest. New code requests fonts through the loader, never a module copy of its own;
  - Google loading can be disabled with the filter `spsg_load_google_fonts` (default `true`).
- **One weight list:** 400, 500, 600, 700 everywhere.

### S5. Text tokens
- One replacer, `StorefrontText::replace( $text, $vars )`, accepts **both** `{token}` and `[token]`. Stored `[amount]` / `[discount]` texts keep working.
- UI help shows `{token}` as the canonical form.
- The same token names mean the same thing everywhere: `{amount}`, `{discount}`, `{quantity}`, `{product_title}`, `{offered_product}` (BOGO), `{virtual_name}`, `{location}`, `{time}`.
- Values are inserted as given; callers escape for their context (a `wc_price()` value is HTML).
- Existing filters on the text (`sales_boster_pd_banner_text`, `sales_boster_floating_notification_bar_text`) still fire with the same arguments.

### S6. Display rules
- One PHP evaluator, `DisplayRules::should_show( array $settings, string $module, array $defaults = [] ): bool`. Lite checks only the promotion audience (`Helper::is_current_user_allowed_to_view_promotions()`) and that `banner_device_view` isn't empty. `banner_show_option`, `slected_page_option` and `user_type` are evaluated **only by pro** (`SalesPopPro`, `FloatingBarPro`, `FreeShippingBarPro`); evaluating them in lite would change lite-only sites whose options still hold old pro values, and apply pro's rules twice. The filter `spsg_display_rules_should_show` runs after lite's checks for anything more. The module passes its own defaults (they differ per module).
- One storefront JS helper, `window.spsgStorefront` (`spsg-storefront-core`), handles the device check (`innerWidth <= 768`), the trigger (`banner_trigger`, `banner_delay`, `scroll_banner_delay`) and dismiss state. Its storage matches the old scripts: a `localStorage` key per widget (`fn_banner_hidden_time`, `banner_hidden_time`), value = time + 10 minutes, so dismissed bars stay dismissed across updates.
- Used by Free Shipping, Floating Bar and Sales Notification.
- Existing hooks in the path keep firing (e.g. `spsg_sales_pop_visbility_controller`), so pro's targeting filters still apply after the shared evaluator.

### S7. Stacking and placement
- One z-index scale as CSS variables on `:root`, prefixed `--spsg-z-`. The values are the ones each layer always used, so bars stay above sticky headers:

  | Layer | Value | Used by |
  |---|---|---|
  | `bar` | 99999 | `.spsg-pd-banner-bar-wrapper`, `.spsg-floating-notification-bar-wrapper` |
  | `popup` | 99999 | `.custom-social-proof .custom-notification` |
  | `fly-cart-button` | 999 | `.wfc-cart-icon` |
  | `fly-cart-overlay` | 100000 | `.wfc-overlay` |
  | `fly-cart-panel` | 1000001 | `.wfc-widget-sidebar` |
  | `modal` | 99999970 | Quick View |

  A new layer takes a variable on this scale, never a literal z-index. Known oddities (changing them is visible): the Fly Cart button (999) sits below the bars; the Sales Notification wrapper uses `9999999999999 !important`; BOGO's product-selection modal (1000/1001) sits below the bars; Fly Cart's added-to-cart popup uses 9999.
- Top/bottom bar stacking keeps the same localized data (`spsg_fnb_data`).

### S8. Templates
- One loader: `Helper::get_template( 'stock-bar/stock-bar.php', $args )`. It looks in the theme at `storegrowth/<module>/<file>` first, then in the plugin; `$args` become the template's variables. New templates go through it; a template still loaded with `include __DIR__ …` (several read variables from the including method's scope) moves to the loader only with its variables passed explicitly and identical output.
- Template files, paths and variables never change (themes override them).
- Filter `spsg_template_path`.

### S9. Assets
- **A shared storefront base,** registered by core and loaded only when an active module renders on the page:
  - `assets/css/storefront-base.css` (handle `spsg-storefront-base`): the z-index scale, reduced-motion rules, and any component two modules share;
  - `assets/js/storefront-core.js` (handle `spsg-storefront-core`, `window.spsgStorefront`): the device check, trigger and dismiss helpers.
  - Static files, not built by webpack; no reliance on browser defaults, because the admin preview renders the same classes inside the admin app, where they are reset.
- It's plain CSS/JS, **no Tailwind, no React** (ADR-003), dependency-free apart from jQuery, which is already present.
- Module handles (`wfc-script`, `spsg-ffc-style`, …) keep their names and add the base as a dependency.
- Don't add new jQuery plugins; the existing ones (jqMeter, magnific-popup, slick, jquery.countdown) stay until a separate decision.

### S10. Preview parity
- Admin preview widgets **load the real storefront stylesheet** of their module, plus `spsg-storefront-base.css`, inside the preview frame. The preview's React markup reuses the storefront class names, and the preview feeds the same CSS variables from the live form values.
- So the preview and the shop share one set of CSS, and the admin can't drift from the storefront.

### Checks
- `wp eval-file tests/compat/storefront-foundation.php` covers the shared helpers.
- A storefront change must render identically for (a) a never-saved site and (b) a no-op save, and pro 2.2.0's storefront features must still work.

## Consequences

**Positive:**
- One way to style, sanitize, load fonts, replace tokens, evaluate display rules and override templates.
- Previews are exact.
- Themes can override templates.
- Sanitization is the same everywhere (S3).

**Negative:**
- Legacy inline CSS filters and old selectors stay forever alongside the variables (ADR-004).

## Alternatives considered

| Option | Why rejected |
|---|---|
| Leave each module's storefront as it was | Previews would re-implement the CSS and drift; five kinds of inconsistency stay; sanitization gaps stay |
| Tailwind on the storefront | Theme conflicts, extra CSS weight, contradicts ADR-003 |
| Rename old keys and classes to the new vocabulary | Breaks pro, themes and custom CSS (ADR-004) |
| React/Interactivity API storefront widgets | Large rewrite of working code |
