# Free Shipping Rules (`progressive-discount-banner`)

> **Design:** https://storegrowth-design.vercel.app/free-shipping-rules.html
>
> Build it exactly as designed; see the design-fidelity rule in `README.md`.

## 1. Summary
- **Phase:** 3. Build it alongside Floating Bar; they share 13 identical bar keys (`DisplaySettings::bar_fields()`) plus the 3 targeting keys (`DisplaySettings::targeting_fields()`, also Sales Notification), and six parallel-named pairs (`btn_*` / `button_*`, icon and text keys) that stay per module.
- **Size:** M.
- **Design:** `free-shipping-rules.html`.

## 2. Current state
- **Option:** `spsg_progressive_discount_banner_settings` (flat), plus `spsg_discount_banner_flags` (first-boot seeding). Localized as `spsg_fsb_data`.
- **Transport:** ajax `spsg_pd_banner_get_settings` / `_save_settings`. **Saves with no sanitization today.**
- **PHP hooks** (keep): `free_shipping_bar_content_pro` (pro), `sales_boster_pd_banner_text` (applied by lite's and pro's templates; nothing listens). (`storegrowth_free_shipping_bar_module_init` is never fired; nothing to keep.)
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
  | Fixed | `discount-amount` | `fixed-amount` |

  The admin page maps the design's one select onto the two stored keys (no virtual field in the schema).
- **Discount amount (decided):** added — `discount_amount_value` shows for Percentage / Fixed (the old admin stored `''` until typed: `allow_empty`).
- Saves go through the settings service: sanitized (the old ajax stored the payload unsanitized) and merged. New setting types `url` (`btn_target`, custom icons) and `date`.
- **Never saved = off, as today:** an option holding only the first-boot texts (or nothing) is left as it is, so no bar shows and no discount applies. Once saved, unsaved keys take the schema defaults (the old admin's), for every reader through `Helper::get_settings()` (lite, pro, localized data, discount code).
- **First save turns the bar on:** the schema is a `GatedSettingsSchema` (`is_saved()`); the settings API returns `published: false` until then, the page enables Save with nothing changed and says the bar shows once saved, and that first save writes the full option: the tab's values and every other key's default, as the old whole-form save did (pro 2.2.0's template reads the raw option). Later saves write only changes. `Helper::get_banner_text()` also fills defaults, since pro passes it the raw option.
- **First-boot seeding is no longer destructive:** it never deletes the option; it adds it when missing, or fills only missing text keys.
- **Page targeting (decided):** Show Everywhere / Show on Specific Pages + the page conditions pro 2.2.0 evaluates; Everyone / Logged-in / Guests. The design's "Shop / Product pages only" are not stored values.
- **Scroll trigger (decided):** keeps today's meaning — the scroll delay in seconds after scrolling past the bar's height — not the design's % depth.
- Fonts: the five old slugs stay; Inter and Open Sans are added.

## 6. REST
`GET/POST /settings/progressive-discount-banner` (no `/pages`: targeting picks page conditions).

## 7. Compatibility
- Ajax pair becomes adapters (now sanitized).
- `spsg_fsb_data` localization unchanged.
- Pro's `FreeShippingBarPro` reads the same keys.
- Retired JS hooks → extension fields (`spsg_settings_schema` with `tab` `content` / `configure` / `design`; `storegrowth_settings_{variant}_field`).

## 8. Components
- Builds: `ModeNumber`, `IconPicker` (+ upload), the shared "bar" schema fragment and bar preview widget (reused by Floating Bar), and a rich help popover for the WooCommerce free-shipping instructions.

## 9. Open questions / design issues
- **The discount amount field isn't drawn** for Percentage/Fixed.
- **The Design tab has no Save.**
- Template has one preset and isn't wired in the mockup.
- The preview has no "goal reached" state; add a toggle.
- The sidebar label still says "Discount Banner". Rename the label only; the module ID stays.

**Resolved at build:** a discount amount field for Percentage / Fixed; Save on every tab; the one template writes the design's colours; a goal-reached preview switch.

**Deferred / decided (step 5):**
- **ADR-005 storefront standard deferred:** the bar keeps its inline CSS (not `StorefrontStyle` variables) and its own storefront script (device, trigger, dismiss) rather than `window.spsgStorefront`. Its markup is shared with pro 2.2.0's template, so the move waits for the pro migration (step 13). Adopted now: shared `assets/css/storefront-bar.css`, lucide icons, `StorefrontFonts` for Inter / Open Sans.
- Long banner text wraps on the storefront (the design truncates to one line); wrapping keeps the whole message readable.
- The preview grows with wrapped text (as the storefront does at 768px and below); on wider screens the storefront keeps the fixed Banner Height.

## 10. Tasks and definition of done
- [ ] Shared bar schema fragment, used by this module and Floating Bar.
- [ ] Discount type virtual field.
- [ ] Sanitization.
- [ ] TS page + bar preview.
- [ ] Characterisation test + E2E matrix; delete the old bundle.
