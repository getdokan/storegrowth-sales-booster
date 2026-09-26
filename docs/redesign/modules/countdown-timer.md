# Countdown Timer

> **Design:** https://storegrowth-design.vercel.app/countdown-timer.html
>
> Build it exactly as designed; see the design-fidelity rule in `README.md`.

## 1. Summary
- **Phase:** 3.
- **Depends on:** `00-core-shell`, `stock-bar` (pilot pattern).
- **Size:** M.
- **Design:** `countdown-timer.html`.

## 2. Current state
- **Option:** `spsg_countdown_timer_settings` (flat).
- **Product meta** (product + variations): `_spsg_countdown_timer_discount_amount`, `_spsg_countdown_timer_discount_start`, `_spsg_countdown_timer_discount_end`. Edited in the WooCommerce product tab and the Dokan product form.
- **Transport:** ajax `spsg_countdown_timer_get_settings` / `_save_settings`.
- **PHP hooks** (keep): `spsg_allow_countdown_timer_render`, `spsg_countdown_timer_fields_defaults`, `spsg_after_save_countdown_timer_fields`, `spsg_countdown_timer_meta_keys`, `spsg_countdown_timer_meta_value`, `storegrowth_countdown_timer_module_init`. Pro PHP filter: `spsg_countdown_timer_styles`.
- **JS hooks** (retire): `spsg_shop_sales_countdown_enable_settings`, `spsg_append_countdown_design_settings`, `spsg_render_countdown_premium_styles`, `spsg_countdown_timer_initial_data`, `spsg_countdown_timer_tab_panels`, `spsg_countdown_timer_template_styles`, `spsg_sales_countdown_timer_templates`.

## 3. Target design
- Tabs: Configure / Design.
- Preview: live ticking D:H:M:S widget on a product page, with an empty state when both display switches are off.
- Design accordions: Heading, Container and Layout, Counter/Timer (Box), Counter Text, Select Template (6 presets).

## 4. Field map
| Design field | Option key | Type / default | Tier | Component |
|---|---|---|---|---|
| Countdown Heading (`[discount]`) | `countdown_heading` | text | lite | `text` |
| Shop Page Display | `shop_page_countdown_enable` | bool | pro | switch card |
| Product Page Display | `product_page_countdown_enable` | bool / true | lite | switch card |
| Heading Font Family | `font_family` | select / roboto | lite | `select` |
| Heading Font Weight | **new** `heading_font_weight` | 400–700 / 500 | lite | `select` |
| Heading Letter Spacing | **new** `heading_letter_spacing` | px / 0 | lite | `number` |
| Heading Line Height | **new** `heading_line_height` | px / 24 | lite | `number` |
| Heading Color | `heading_text_color` | hex | lite | `color_picker` |
| Widget Background | `widget_background_color` | hex | lite | `color_picker` |
| Widget Border Color | `border_color` | hex | lite | `color_picker` |
| Widget Radius | **new** `widget_radius` | px / 10 | lite | `number` |
| Widget Alignment | **new** `widget_alignment` | left/center/right | lite | icon toggle |
| Widget Margin / Padding | **new** `widget_margin`, `widget_padding` | `{top,right,bottom,left}` | lite | `BoxModelInput` |
| Digit Text Color | `day_/hour_/minute_/second_text_color` (one design field writes all four) | hex | pro | `color_picker` |
| Label Text Color | **new** `counter_label_color` | hex | pro? | `color_picker` |
| Separator Color | **new** `counter_separator_color` | hex | pro? | `color_picker` |
| Counter Background | `counter_background_color` | hex | pro | `color_picker` |
| Counter Border | `counter_border_color` | hex | pro | `color_picker` |
| Counter Radius, Alignment, Margin, Padding | **new** `counter_*` | as above | pro? | as above |
| Counter Font Family / Weight / Letter Spacing | **new** `counter_font_*` | — | pro? | `select` / `number` |
| Template | `selected_theme` | `ct-layout-*` (6) | lite | `TemplatePicker` (writes 8 colours) |
| Dokan: vendor can create discount / schedule | `vendor_can_create_countdown_discount`, `vendor_can_create_schedule_timer` | bool | integration | switch (shown only when Dokan is active) |

## 5. Data changes
- New keys, all additive (`CountdownTimerSettings`); new keys default to the design, existing keys keep their defaults. Box fields (margin/padding) store `{top,right,bottom,left}` integers, 0–200.
- The single "Digit Text Color" field writes the same value to the 4 existing per-unit keys, so pro's styles filter keeps working.
- `selected_theme` accepts the six new templates next to the two old layouts. An unsaved theme (the old `ct-custom` fallback) now renders as `ct-layout-1`.
- **Storefront restyle (decided):** the widget follows the design on every site, including sites that never saved a design setting: heading 24px/500, left-aligned; boxes min 64px with 10px captions; widget padding 10px, radius 10px; 25px gap below. Type and boxes scale in em (shop loop 11px root). The old Twenty Twenty-Four box-height override is dropped (it would clip the captions).
- Template colours live in PHP (`Helper::TEMPLATES`) and reach the admin through `AdminPage` (`window.spsgCountdownTimer`), with the font names.
- Storefront colours: the counter colours (pro fields) are the saved ones only while pro is active; otherwise, and for any not saved, the template's. The template passes these effective settings to `spsg_countdown_timer_styles`, so pro 2.2.0's filter picks up the template's colours too. Other design settings are CSS variables, saved keys only, pro keys only with pro.
- Fonts (saved or default Roboto) are requested only where the widget renders.

## 6. REST
`GET/POST /settings/countdown-timer`. Product meta stays in the PHP product forms (optional `rest-api.md` #36).

## 7. Compatibility
- All PHP hooks unchanged; the ajax pair becomes adapters; product-meta keys unchanged.
- The Dokan vendor form keeps working (PHP).
- Retired JS hooks → `storegrowth.settings.schema.countdown-timer`, `storegrowth.preview.countdown-timer`.
- Kept: every class of the widget markup (pro's shop template copies it), the `custom.js` selectors, the `spsg_countdown_timer_styles` filter (same default keys and `$settings` argument).
- **Known gap until the integrations step:** the Dokan "Vendors" switches (`vendor_can_create_*`) had their admin tab in the removed legacy bundle (JS filter `spsg_countdown_timer_tab_panels`). Stored values keep working on the storefront and the vendor form, but they can't be changed from the admin until the Dokan integration gets its REST page.

## 8. Components
- Builds: `BoxModelInput` (first user, shared with Direct Checkout), an icon-alignment toggle, and the preview widget with the empty state.
- Reuses: `TemplatePicker`.

## 9. Open questions / design issues
- The mockup has **no Save** button; add `SaveBar`.
- Placeholder help text is repeated on every accordion, and the Product Page help text is wrong.
- Pro/lite split for the new counter styling keys.
- The schedule stays per product (not in the design). Confirm.
- Font weight options: 4 here, 3 on Sales Notification. Align them.

## 10. Tasks and definition of done
- [x] Schema + service + adapters.
- [x] New CSS vars wired into storefront output with fallbacks.
- [x] `BoxModelField` in `src/components/fields/`.
- [x] TS page + preview.
- [x] Delete the old module bundle.
- [ ] E2E matrix (with the other modules' E2E pass).
