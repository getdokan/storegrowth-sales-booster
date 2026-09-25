# Free Shipping Rules (`progressive-discount-banner`)

> **Design:** https://storegrowth-design.vercel.app/free-shipping-rules.html
>
> Build it exactly as designed; see the design-fidelity rule in `README.md`.

## 1. Summary
- **Phase:** 3. Build it alongside Floating Bar; they share about 20 keys and one "bar" schema fragment.
- **Size:** M.
- **Design:** `free-shipping-rules.html`.

## 2. Current state
- **Option:** `spsg_progressive_discount_banner_settings` (flat), plus `spsg_discount_banner_flags` (first-boot seeding). Localized as `spsg_fsb_data`.
- **Transport:** ajax `spsg_pd_banner_get_settings` / `_save_settings`. **Saves with no sanitization today.**
- **PHP hooks** (keep): `free_shipping_bar_content_pro` (pro), `sales_boster_pd_banner_text` (pro fires), `storegrowth_free_shipping_bar_module_init`.
- **JS hooks** (retire): `spsg_free_shipping_bar_position_settings`, `_icon_radio_box`, `_display_rules_settings`, `_height_settings`, `_font_size`, `spsg_shipping_bar_templates`, `spsg_shipping_bar_template_styles`.

## 3. Target design
- Tabs: Content / Configure (with a Display Rules accordion) / Design (Banner, Colors, Template).
- Preview: the bar in the banner slot, top or bottom of the page.

## 4. Field map
| Design field | Option key | Tier | Component |
|---|---|---|---|
| Banner Text (`[amount]`) | `progressive_banner_text` | lite | `textarea` |
| Goal Completion Text | `goal_completion_text` | lite | `textarea` |
| Banner Icon + Upload | `progressive_banner_icon_name`, `progressive_banner_custom_icon` | pro | `IconPicker` + media |
| Display CTA Button | `btn_style` | lite | `switch` |
| CTA Name / Target URI | `btn_text`, `btn_target` | lite | `text` (depends on CTA) |
| Bar Position | `bar_position` | pro | `select` |
| Bar Type | `bar_type` | lite | `select` |
| Discount Type | `discount_type` + `discount_amount_mode` (design: Free Shipping / Percentage / Fixed) | lite | `select`, mapped (§5) |
| Discount amount (**not drawn**) | `discount_amount_value` | lite | `number`, shown when not Free Shipping |
| Cart Minimum Amount | `cart_minimum_amount` | lite | `number` + currency |
| Show Banner Desktop / Mobile | `banner_device_view` | pro | inline checkboxes |
| Trigger + delay / scroll | `banner_trigger`, `banner_delay`, `scroll_banner_delay` | pro | `ModeNumber` |
| Page targeting pages / audience | `banner_show_option`, `slected_page_option`, `user_type` | pro | `select` + page picker |
| Banner Height / Font Size | `banner_height`, `font_size` | pro | `number` + px |
| Font Family | `font_family` | lite | `select` |
| Colors ×6 | `background_color`, `text_color`, `icon_color`, `close_icon_color`, `btn_color`, `btn_text_color` | lite | `color_picker` |
| Template | `bar_template` | lite | `TemplatePicker` |

## 5. Data changes
- **Discount Type mapping** (read and write, no migration):

  | Design option | `discount_type` | `discount_amount_mode` |
  |---|---|---|
  | Free Shipping | `free-shipping` | (unchanged) |
  | Percentage | `discount-amount` | `percentage` |
  | Fixed | `discount-amount` | `fixed` |

  The schema exposes one virtual field. The service splits it into the two stored keys.
- Add sanitization on save (new behaviour, same keys).

## 6. REST
`GET/POST /settings/progressive-discount-banner`, plus `/pages` if targeting stays.

## 7. Compatibility
- Ajax pair becomes adapters (now sanitized).
- `spsg_fsb_data` localization unchanged.
- Pro's `FreeShippingBarPro` reads the same keys.
- Retired JS hooks → `storegrowth.settings.schema.progressive-discount-banner`.

## 8. Components
- Builds: `ModeNumber`, `IconPicker` (+ upload), the shared "bar" schema fragment and bar preview widget (reused by Floating Bar), and a rich help popover for the WooCommerce free-shipping instructions.

## 9. Open questions / design issues
- **The discount amount field isn't drawn** for Percentage/Fixed.
- **The Design tab has no Save.**
- Template has one preset and isn't wired in the mockup.
- The preview has no "goal reached" state; add a toggle.
- The sidebar label still says "Discount Banner". Rename the label only; the module ID stays.

## 10. Tasks and definition of done
- [ ] Shared bar schema fragment, used by this module and Floating Bar.
- [ ] Discount type virtual field.
- [ ] Sanitization.
- [ ] TS page + bar preview.
- [ ] Characterisation test + E2E matrix; delete the old bundle.
