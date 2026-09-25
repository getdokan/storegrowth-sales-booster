# Floating Bar (`floating-notification-bar`)

> **Design:** https://storegrowth-design.vercel.app/floating-bar.html
>
> Build it exactly as designed; see the design-fidelity rule in `README.md`.

## 1. Summary
- **Phase:** 3, right after Free Shipping (shared bar fragment and preview).
- **Size:** M.
- **Design:** `floating-bar.html`.

## 2. Current state
- **Option:** `spsg_floating_notification_bar_settings` (flat). Localized as `spsg_fnb_data`. The coupon list comes from a raw `$wpdb` query.
- **Transport:** ajax `spsg_floating_notification_bar_get_settings` / `_save_settings`. **Saves with no sanitization today** (payload key `shipping_bar_data`).
- **PHP hooks** (keep): `spsg_floating_bar_content_pro` (pro), `sales_boster_floating_notification_bar_text` (pro fires), `storegrowth_floating_bar_module_init`.
- **JS hooks** (retire): `spsg_floating_notification_bar_position_settings`, `_icon_radio_box`, `_button_redirection`, `_coupon_coundown`, `_display_rules_settings`, `_height_settings`, `_font_size`, `_templates`, `_template_styles`.

## 3. Target design
- Tabs: Content / Configure (Button, Countdown, Trigger, Page Targeting cards) / Design (Bar, Colors, Template with 4 presets).
- Preview: bar with live countdown, button and close.

## 4. Field map
| Design field | Option key | Tier | Component |
|---|---|---|---|
| Default Banner Text | `default_banner_text` (required, max 80) | lite | `textarea` + counter |
| Button Text | `ac_button_text` | pro today → **lite** in design | `text` (single field; the design shows it twice) |
| Bar Position | `bar_position` | pro | `select` |
| Bar Type | `bar_type` | lite | `select` |
| Button: show | `button_view` | lite | `switch_group` |
| Button Action | `button_action` `ba-close` / `ba-url-redirect` / **`ba-scroll` (new)** | lite | `select` |
| Show Button Desktop / Mobile | `button_view` (device) / `banner_device_view` | lite / pro | checkboxes |
| Button Link | `redirect_url` | lite | `url`, shown only for redirect |
| Open in new tab (not in design) | `new_tab_enable` | pro | keep it, `switch` under link |
| Countdown show / start / end | `countdown_show_enable`, `countdown_start_date`, `countdown_end_date` | pro | `switch_group` + `DateRange` |
| Trigger | `banner_trigger`, `banner_delay`, `scroll_banner_delay` | pro | `ModeNumber` |
| Page Targeting / Who Can See | `banner_show_option`, `slected_page_option`, `user_type` | pro | `select` + page picker |
| Banner Height / Font Size | `banner_height`, `font_size` | pro | `number` + px |
| Font Family | `font_family` | lite | `select` |
| Colors ×6 | `background_color`, `text_color`, `icon_color`, `button_color`, `button_text_color`, `close_icon_color` | lite | `color_picker` |
| Template | `notify_template` | lite | `TemplatePicker` (writes 6 colours) |
| Icon (not in design) | `default_banner_icon_name`, `default_banner_custom_icon` | pro | keep, `IconPicker` |
| Coupon (not in design) | `show_cupon`, `cupon_code` | pro | **Required by R1:** "Advanced (Pro)" section, coupon search (`/coupons`) |

## 5. Data changes
- `button_action: ba-scroll` is new (it needs a target selector field and storefront JS). Only if approved.
- Making `ac_button_text` lite is a tier change, not a data change.
- Add sanitization on save.

## 6. REST
`GET/POST /settings/floating-notification-bar`, `/pages`, and `/coupons` if the coupon stays.

## 7. Compatibility
- Ajax pair becomes adapters (now sanitized).
- `spsg_fnb_data` unchanged, including the discount-bar stacking data.
- Pro's `FloatingBarPro` reads the same keys.
- Retired JS hooks → `storegrowth.settings.schema.floating-notification-bar`.

## 8. Components
- Reuses: the bar fragment, bar preview, `ModeNumber`, `IconPicker`, `TemplatePicker`.
- Builds: `DateRange` (first user; also used by BOGO) and a live countdown in the preview.

## 9. Open questions / design issues
- **No Save or Reset in the mockup.**
- "Button Text" appears twice.
- Button Link's default is "Shop Now" and the field shows for every action.
- The coupon, icon and new-tab fields are missing from the design. Keep or drop?
- Scroll To Section: approve, and define its target field.

## 10. Tasks and definition of done
- [ ] Schema (reusing the bar fragment) + sanitization + adapters.
- [ ] TS page + preview.
- [ ] Characterisation test + E2E matrix; delete the old bundle.
