# Stock Bar — pilot

> **Design:** https://storegrowth-design.vercel.app/stock-bar.html
>
> Build it exactly as designed; see the design-fidelity rule in `README.md`.

## 1. Summary
- **Phase:** 2, the pilot. It proves the settings registry, `LivePreview`, `TemplatePicker` and the E2E pattern.
- **Depends on:** `00-core-shell`.
- **Size:** S.
- **Design:** `stock-bar.html`.

## 2. Current state
- **Option:** `spsg_stock_bar_settings` (flat). Defaults exist in both JS and PHP and disagree on colours.
- **Transport:** ajax `spsg_stock_bar_get_settings` / `spsg_stock_bar_save_settings`, nonce `spsg_ajax_nonce` + `manage_options`, sanitized by `Helper::sanitize_form_fields`.
- **PHP hooks** (keep): `spsg_stock_bar_stock_below` (pro listens and fires it).
- **JS hooks** (retire): `spsg_shop_stock_bar_enable_settings`, `spsg_variation_product_stock_bar_enable_settings`, `spsg_bar_color_stock_bar_settings`, `spsg_design_panel_stock_bar_settings`, `spsg_append_after_stock_status_settings`, `spsg_before_stock_bar_preview_end`, `spsg_before_stock_bar_preview_template_end`, `spsg_shipping_bar_templates`.
- **Storefront:** jqMeter bar on simple managed-stock products.

## 3. Target design
- Tabs: Content / Configure / Design, each ending with Reset + Save.
- Preview: product page with the stock card in the widget slot.
- Design tab accordions: Stock Bar, Stock Bar Card, Template (3 presets: Blue, Green, Violet).

## 4. Field map
| Design field | Option key | Type / default | Tier | Component |
|---|---|---|---|---|
| Total Sold Count Text | `total_sell_count_text` | text / "Total Sold" | pro | `text` |
| Available Item Count Text | `available_item_count_text` | text / "Available Item" | pro | `text` |
| Stock Status Text (`{quantity}`) | `stock_status_text` | text | pro | `text` + token help |
| Display on Product Page | `product_page_stock_bar_enable` | bool / true | lite | checkbox |
| Display on Shop Page | `shop_page_stock_bar_enable` | bool / false | pro | checkbox |
| Display on Variation Product Page | `variation_page_stock_bar_enable` | bool / false | pro | checkbox |
| Stock Display Format | `stock_display_format` | above/below (**+ hide**) | pro | `select` |
| Stock Status | `show_stock_status` | bool / true | lite | `switch` |
| Minimum Quantity Required | `status_quantity_required` | int / 10 (design shows 100) | pro | `number` |
| Foreground Color | `stockbar_bg_color` | hex | lite | `color_picker` (today labelled "Foreground" but stores the background) |
| Bar Color | `stockbar_fg_color` | hex | pro | `color_picker` |
| Stock Bar Height | `stockbar_height` | int 1–100 / 10 | pro | `number` + px |
| Background Color (card) | **new** `stockbar_card_bg_color` | hex | lite | `color_picker` |
| Border Color | `stockbar_border_color` | hex | lite | `color_picker` |
| Font Family | **new** `font_family` | select / inter | lite | `select` |
| Count Text Size | **new** `count_text_size` | int / 11 | lite | `number` + px |
| Count Text Color | **new** `count_text_color` | hex | lite | `color_picker` |
| Status Text Size | **new** `status_text_size` | int / 11 | lite | `number` + px |
| Stock Status Color | `status_text_color` | hex | pro | `color_picker` |
| Template | `stockbar_template` | one/two/three | lite | `TemplatePicker` (writes bar + foreground colours) |

Unused keys `shop_page_countdown_enable` and `product_page_countdown_enable` stay in the option. Don't write them and don't delete them.

## 5. Data changes
- New keys (above) are additive. Their defaults reproduce today's storefront look, so nothing changes visually until an admin edits them.
- Storefront templates/CSS must read the new keys, with a fallback to the current hard-coded values.
- `stock_display_format: hide` is a new value. The storefront must handle it (hide the counts row).
- Pick one default source: PHP `get_defaults()` becomes the only one, and the REST schema exposes it.

## 6. REST
`GET/POST /settings/stock-bar`.

## 7. Compatibility
- Ajax pair becomes adapters.
- `spsg_stock_bar_stock_below` unchanged.
- Pro's PHP (`spsg_stock_bar_warning_contents` path) reads the same keys.
- Retired JS hooks → `storegrowth.settings.schema.stock-bar`, `storegrowth.preview.stock-bar`.

## 8. Components
- Reuses: `FeatureLayout`, `Accordion`, `SaveBar`, `LivePreview`.
- Builds: `TemplatePicker` (first user, shared later), preview widget `modules/stock-bar/src/preview/stock-bar-widget.tsx`.

## 9. Open questions / design issues
- Min quantity default: 100 in the design vs 10 today. Keep 10.
- Should "Hide Counts" be lite or pro?
- The "Foreground" / "Bar" labels are confusing; confirm the wording.

## 10. Tasks and definition of done
- [ ] PHP schema: fields, defaults, sanitizers, pro flags.
- [ ] Settings service shared by the REST controller and the ajax adapter.
- [ ] TS page, schema types, preview widget.
- [ ] Storefront reads the new keys, with fallbacks.
- [ ] Characterisation test; E2E for no pro, pro 2.2.0 and new pro.
- [ ] Delete `modules/stock-bar/assets/src`, `package.json` and `build/`.
- **Done when:** the shared definition of done in `README.md` is met.
