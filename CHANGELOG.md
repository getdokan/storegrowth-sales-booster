== Changelog ==

### v2.0.5 (Feb 05, 2025) ###

- **fix:** Resolved cart overlay layout corruption and corrected pricing discrepancies.
- **fix:** Fixed the Fly Cart center popout not rendering properly.
- **fix:** Prevented out-of-stock products from being selectable in the Upsell Order Bump.
- **fix:** Resolved a fatal error occurring when the Order Bump product was missing or deleted.
- **fix:** Corrected a typo in the Module Activation process.


### v2.0.4 (Dec 05, 2025) ###

- **fix:** Resolved an issue where an extra quantity button appeared in the FlyCart product quantity selector.
- **fix:** Improved compatibility to display Upsell Order Bumps properly on the Block Checkout.
- **fix:** Updated BogoOffers by replacing action icons with clear text labels for better usability.
- **fix:** Fixed an issue where the Quick View module icon was not appearing on the Modules page.

### v2.0.3 (Nov 26, 2025) ###

- **fix:** Repositioned the BOGO menu item in the Dokan vendor dashboard that was shifted during the new layout update.
- **fix:** Resolved layout shift issue on the Dokan vendor dashboard by preventing the floating toolbar from causing visual jumps during page load.
- **fix:** Corrected logo positioning conflict between StoreGrowth and Dokan Live Chat, ensuring both logos display properly without overlap.


### v2.0.2 (Oct 28, 2025) ###

- **new:** "Submit Request" button now redirects to our product roadmap page
- **new:** Improved checkout redirect options in Direct Checkout module
- **fix:** Resolved compatibility issue with FlyWP Helper plugin
- **fix:** Countdown timer now displays correctly on variable products
- **fix:** Countdown timer now works on grouped products
- **fix:** Added missing countdown timer fields on Dokan vendor product pages
- **fix:** Prevented duplicate BOGO offers from causing errors on the same product
- **fix:** Order bump product quantity can now be adjusted in cart before checkout
- **fix:** Removed infinite loading when deleting products from Fly Cart
- **fix:** Resolved crash issue on stores with large product catalogs


### v2.0.1 (Sep 12, 2025) ###

- **new:** Dokan compatibility is now fully supported across StoreGrowth modules.  
- **new:** Full vendor dashboard compatibility is now supported.  
- **new:** Vendors can create and manage Buy 1 Get 1 (BOGO) offers directly from their dashboard.
- **new:** Vendors can create Countdown Timer product discount offers from their vendor dashboard.  
- **new:** Vendors can create Buy X Get Y and Buy X Get X offers from their BOGO menu in the vendor dashboard.  
- **new:** Fly Cart now displays the vendor store name for each item when the setting is enabled. Vendor names can optionally appear as links to the vendor's store.  
- **new:** Admin control for vendor offer creation has been added, allowing administrators to manage vendor offer creation permissions.  
- **enhance:** Updated API validation for `offer_type` to accept `discount` or `price` (replacing `fixed_price`). Requests using `fixed_price` should migrate to `price`.  
- **enhance:** Updated documentation links throughout the plugin to use the new StoreGrowth documentation structure.  
- **fix:** Resolved BOGO offer price saving calculation issue.  
- **update:** Updated promotional video link across the plugin.

### 2.0.0 (Sep 05, 2025) ###

- **new:** Complete plugin rebrand to StoreGrowth with standardized asset prefixes and constants.
- **new:** Introduced custom database tables and automatic migration system for Upsell Order Bump.
- **new:** Migrated BOGO module to a unified data source with full migration support.
- **new:** Implemented new container architecture with dependency injection for cleaner module bootstrapping.
- **new:** Added REST API endpoints for BOGO and Order Bump with unified data layers and automatic migrations.
- **new:** Role-based visibility for promotional banners (only visible to customers, subscribers, and guests).
- **new:** Real-time cart updates for upsell product interactions.
- **enhance:** Countdown Timer now uses product sale price for discount calculations.
- **enhance:** Pagination only displays when more than 6 items are present.
- **enhance:** Enhanced admin screens with improved validation, error handling, and clearer notices.
- **enhance:** Optimized DB queries and asset loading for better performance.
- **enhance:** Added indexes to improve query speed.
- **enhance:** Security hardening for REST endpoints (nonce verification, input validation, sanitization, capability checks).
- **enhance:** Consistent animation timing and styling across promotional elements.
- **enhance:** Updated documentation, README, FAQs, and screenshots to reflect the new branding.
- **fix:** Quick Cart – fixed alignment of tax, discount, and coupon rows; corrected script dependency loading.
- **fix:** Order Bump – resolved issue where offer products failed to appear during checkout.
- **fix:** Cart Totals – improved consistency between UI-displayed and backend-calculated totals.
- **fix:** BOGO – fixed badge rendering issues and improved cart deduplication logic.
- **fix:** Countdown Timer – corrected discount logic when a sale price exists.
- **fix:** Quick View – resolved icon rendering issues and template fallback problems.
- **fix:** Direct Checkout – improved button behavior and detection of Pro features.
- **fix:** Admin – fixed issues with license/notice display and translation domains in tooltips.
- **fix:** Suppressed PHP notices caused by uninitialized array values.

### 1.28.8 ( April 23, 2024 ) ###

- **fix:** Countdown timer script issue.
- **enhance:** Added variable product support for upsell order bump.

### 1.27.8 ( April 17, 2024 ) ###

- **fix:** order bump offer price

### 1.27.7 ( Mar 17, 2024 ) ###

- **enhance:** release BOGO module

### 1.26.7 ( Mar 17, 2024 ) ###

enhance: release quick view module

### 1.25.7 ( Mar 10, 2024 ) ###

enhance: add onboarding screen

### 1.24.7 ( Mar 10, 2024 ) ###

update: fly cart icon and prompt text
fix: add theme compatibility

### 1.24.6 ( Mar 10, 2024 ) ###

enhance: fly cart ui design
update: update logo and icon in dashboard

### 1.24.5 ( March 06, 2024 ) ###

- **enhance:** add font family customize option for countdown settings & fix template two heading ui stuff
- **fix:** bar button layout design, touch preview.
- **enhance:** close button popup visibility
- **fix:** free shipping bar documentation redirection issue
- **enhance:** implement settings undo option for free shipping bar & sales countdown
- **enhance:** implement bump type selection & dependencies for offer selection
- **enhance:** implement buy now button ui customization functionalities for direct checkout module
- **enhance:** implement cart cta button for free shipping bar
- **enhance:** add validation for cta url & add pro prompts for direct checkout ui
- **doc:** module renamed
- **enhance:** make compatible with updated ui & design
- **enhance:** make compatible with countdown premium styles
- **enhance:** update undo state & make it individual color settings
- **fix:** free shipping bar documentation redirection issue
- **enhance:** implement settings undo option for free shipping bar & sales countdown
- **enhance:** implement bump type selection & dependencies for offer selection
- **enhance:** implement buy now button ui customization functionalities for direct checkout module
- **enhance:** implement cart cta button for free shipping bar
- **enhance:** add validation for cta url & add pro prompts for direct checkout ui
- **enhance:** update undo state & make it individual color settings
- **enhance:** add font family customize option for countdown settings & fix template two heading ui stuff
- **enhance:** make compatible with updated ui & design
- **enhance:** readded undo init codes during merge conflicts
- **enhance:** add text radio box component
- **enhance:** implement low stock warning msg preview for stock bar
- **enhance:** make compatible warning message with premium version
- **enhance:** make compatible with template
- **fix:** quantity template replacement by stock quantity

### 1.1.3 ( Jan 17, 2024 ) ###

- **fix:** Deactivate module.
- **update:** Readme description.

### 1.1.2 ###

- **update:** Readme text.

### 1.1.1 ###

- **fix:** Composer issue fixed.

### 1.1.0 ( Jan 15, 2024 ) ###

- **refactored:** Codebase and checked Compatibility

### 1.0.1 ###

- Initial release
