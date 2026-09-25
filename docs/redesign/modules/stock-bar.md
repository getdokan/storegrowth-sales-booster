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
| Font Family | **new** `font_family` | select / inherit (theme font) | lite | `select` |
| Count Text Size | **new** `count_text_size` | int / 11 | lite | `number` + px |
| Count Text Color | **new** `count_text_color` | hex | lite | `color_picker` |
| Status Text Size | **new** `status_text_size` | int / 11 | lite | `number` + px |
| Stock Status Color | `status_text_color` | hex | pro | `color_picker` |
| Template | `stockbar_template` | one/two/three | lite | `TemplatePicker` (writes bar + foreground colours) |

Unused keys `shop_page_countdown_enable` and `product_page_countdown_enable` stay in the option. Don't write them and don't delete them.

## 5. Data changes
- New keys (above) are additive. Their defaults are the design's card look; the storefront was restyled to it (see §9).
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

## 9. Decisions (step 2)
- Min quantity default: keep 10 (design shows 100).
- "Hide Counts" (`stock_display_format: hide`) is pro, like the rest of that field.
- Colour labels as designed: "Foreground Color" (track, `stockbar_bg_color`), "Bar Color" (fill, `stockbar_fg_color`).
- **Storefront restyled to the design's card** (user decision, an intended visible change for every site on update): flex column, 8px gap, 12/14px padding, 1px border, rounded track and fill, counts on one line. New keys default to the design (11px counts `#25252d`, 11px status); existing colour keys keep their defaults. This is the one exception to ADR-005 S1's "unsaved sites look the same".
- Template presets keep the stored ids `stock_bar_one/two/three` (Blue/Green/Violet) and write the design's palettes. A stored gradient fill (old third template) keeps rendering but can't be re-picked.
- Templates set both colours in lite too, as the old lite templates did: `stockbar_fg_color` is not `pro` on the server; the admin locks the Bar Color field without pro. A preset shows as selected only while the colours still match it.
- Font Family keeps a first "Theme font" option (`inherit`), the default (ADR-005 S4); the design lists only named fonts. Google fonts load in the admin only when picked (preview); on the storefront through `StorefrontFonts`, on product and shop pages even when that page has no stock bar (accepted).
- Stock Bar Height default stays 10 (design shows 6), like min quantity.
- The preview's dark toggle recolours the mock page only; the widget keeps the saved colours, as the shop would.
- The preview's sample stock follows Minimum Quantity Required, so the status line shows.
- Extension: JS filter `storegrowth.preview.stock-bar` ( widget, values ) for pro's preview parts. A fields filter is deferred to the pro migration (step 13).
- With pro 2.2.0, the shop-page stock bar keeps its own 14px status text (pro's template hard-codes it); the variation stock bar gets the design variables through the `.spsg-stock-progress-bar-section` selector.
- Preview renders the storefront markup with the real `spsg-stockbar-style.css` (inside `.spsg-storefront`, outside the admin reset), not the mockup's `.sb-*` classes.

## 10. Tasks and definition of done
- [x] PHP schema: fields, defaults, sanitizers, pro flags.
- [x] Settings service shared by the REST controller and the ajax adapter.
- [x] TS page, schema types, preview widget.
- [x] Storefront reads the new keys, with fallbacks.
- [ ] Characterisation test (settings round trip done); E2E for no pro, pro 2.2.0 and new pro.
- [x] Delete `modules/stock-bar/assets/src`, `package.json` and `build/` (and the unused Inter copy).
- **Done when:** the shared definition of done in `README.md` is met.
