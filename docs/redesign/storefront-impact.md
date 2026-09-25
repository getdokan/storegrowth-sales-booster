# Storefront (frontend) impact of the redesign

- Date: 2026-09-25
- Scope: what shoppers and vendors see, meaning the storefront JS/CSS/templates and the Dokan vendor dashboard, as opposed to the wp-admin settings UI.

> **Update:** ADR-005 applies one consistent storefront standard to **every** module: CSS variables, shared font/token/display-rule/template loaders, and previews that use the real storefront CSS. So every module's storefront code is touched, not only the modules marked "Yes" below. The guarantee stays the same: output is identical for sites that don't change their settings, and old classes, selectors, handles and CSS filters remain.

## 1. What does NOT change (all modules)

- **Storefront code location and build:**
  - hand-written storefront JS/CSS in `modules/<name>/assets/{js,css}` and PHP templates stay where they are;
  - webpack doesn't build them today and won't after the redesign;
  - the only built storefront bundle is the Order Bump checkout block (§3).
- **Script/style handles:** unchanged (`wfc-script` and the rest). Pro's storefront scripts depend on them.
- **Localized storefront data:** unchanged (`spsg_fsb_data`, `spsg_fnb_data`, `popup_info`, `wc_cart_params`, …).
- **Public ajax** (`spsg_fly_cart_frontend`, `spsgqcv_quickview`, `offer_product_add_to_cart`, `update_offer_product`, `upsell_offer_product_add_to_cart`) and their nonces: unchanged.
- **PHP hooks:** all frozen (ADR-004), so theme and pro storefront customisations keep working.
- **Tailwind, plugin-ui and React:** admin only. Tailwind must **never** load on the storefront (ADR-003).
- **Option keys:** unchanged. The storefront reads the same data.

## 2. Cross-cutting risks (all modules)

| Risk | Rule |
|---|---|
| **Default unification.** JS and PHP defaults disagree today (Stock Bar colours, Countdown theme/heading, Direct Checkout layout). Sites that never saved settings render with the **PHP** defaults. | When unifying, the **PHP (storefront) default wins**. A site that never saved must render identically before and after. |
| **New sanitization on save** (Free Shipping, Floating Bar, Direct Checkout, BOGO general, Dokan vendor) may normalise stored values the next time an admin saves. | Same value domain (R4). A rejected value keeps the old one. Storefront snapshot test after a no-op save. |
| **New style keys** (Countdown, Stock Bar) | Storefront reads them **with a fallback** to today's hard-coded values. Defaults must reproduce today's look pixel-for-pixel until an admin edits them. |
| **Preview drifts from the real storefront.** Admin previews re-implement the widgets in React. | Previews use the same token values as the storefront CSS. Visual test: preview screenshot vs storefront screenshot per module (tolerance check). |

## 3. Per module

| Module | Storefront impact | Why | Required storefront work | Blocked by decision? |
|---|---|---|---|---|
| **Core / modules** | None | Activation, `spsg_active_module_ids` unchanged | — | — |
| **Stock Bar** | **Yes (additive)** | New keys: card background, font family, count text size/colour, status text size; new format value `hide` | Template + inline CSS read the new keys with fallbacks; handle `stock_display_format = hide` (hide the counts row) | "Hide Counts" tier |
| **Countdown Timer** | **Yes (additive)** | About 15 new style keys: heading weight, letter spacing, line height; widget/counter radius, alignment, margin, padding; label/separator colours; counter fonts. 6 templates (colour presets) | Extend `spsg_countdown_timer_styles` output and the widget markup/CSS; product-meta discount logic unchanged | Pro/lite split of the new keys |
| **Sales Notification** | **Only if approved** | "Best Sellers" product source (new `product_source = 2`) | New branch in the product query; transient invalidation unchanged | Best Sellers approval |
| **Free Shipping Rules** | None | Discount-type UI maps onto the existing two keys; no new keys | — (sanitization only, see §2) | Amount field for Percentage/Fixed is a UI gap only |
| **Floating Bar** | **Only if approved** | "Scroll To Section" button action (`ba-scroll` + target selector) | Template + JS for smooth-scroll to the target; `ac_button_text` becoming lite needs no storefront change | Scroll-to-section approval |
| **Quick View** | **Yes, if the new option values are adopted** | Effects "None", redirect "Checkout", button positions "top-right" / "bottom" | Magnific-popup effect `none`; checkout redirect in `spsgqcv_redirect_url` path; CSS/markup for new button positions | Quick View value decisions |
| **Fly Cart** | **Yes (bug fix)** | Fix `woocommerce_add_to_cart_fragments` dropping other plugins' fragments (`CommonHooks.php:88-98`); design labels map to existing values | One-line filter fix + regression test with another plugin's fragment | — |
| **Direct Checkout** | None (watch defaults) | Same keys; PHP default mismatch (`CommonHooks.php:81`) resolved in favour of PHP | Keep the PHP default, so no change for unsaved sites | — |
| **BOGO** | **Yes** | (1) Bug fix: badges now show for **global** offers (they never did); visible change. (2) `design_settings` no longer wiped on edit, so the offer box keeps its saved look. (3) Per-offer "Show Regular Price" / "Allow Remove Offer Product" with fallback to the global option. (4) **Fixed-price** offer type if approved | (1) badge template status fix; (3) read the per-offer value, falling back to the global value; (4) pricing branch in the cart/price filters | (3) scope change, (4) Fixed price |
| **Order Bump** | **Yes** | (1) Schedule presets become a real eligibility check (the old schedule was never saved, so bumps always showed). (2) **Free** offer type (price 0). (3) Status toggle: the storefront must skip inactive bumps. (4) The checkout block's build moves from `modules/upsell-order-bump/assets/build/blocks.*` to `build/modules/upsell-order-bump/blocks.*`. (5) `BlockRegistry` fixed so it doesn't run while the module is inactive | (1) eligibility check with default `always`, so existing bumps keep showing; (2) price calc; (3) verify the query filters `status = active`; (4) update the block script registration path, keeping the block name `storegrowth-upsell-order-bump` and its script handle; (5) guard in the always-loaded provider | (1) schedule model, (2) Free type |
| **Dokan vendor dashboard** | **Yes (vendor-facing)** | Vendor BOGO screens rebuilt on the new components; server-side product-ownership check and vendor flag enforcement added | New integration bundle scoped with Dokan's layout (not `spsg-tailwind`); vendors creating offers for products they don't own now get an error | — |
| **Product edit screens** (WooCommerce / Dokan product forms: Countdown, BOGO, Direct Checkout meta) | None | PHP forms not redesigned | — | — |

## 4. Tests to add (storefront)

- **Snapshot per module, before/after upgrade, for a site that never saved settings:** must be identical.
- **Snapshot per module after a no-op save through the new UI:** must be identical.
- **Fly Cart:** another plugin's cart fragment survives add-to-cart.
- **BOGO:** a global-offer badge renders; the design is preserved after editing an offer.
- **Order Bump:**
  - an existing bump with no schedule still shows;
  - an inactive bump is hidden;
  - the checkout block renders in the Checkout block.
- **Pro 2.2.0 storefront features** per module (see `pro-migration-spec.md` §8 "Pro tests").
