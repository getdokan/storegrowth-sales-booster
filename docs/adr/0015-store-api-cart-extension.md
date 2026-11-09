# ADR-015: Store API cart extension

- Status: Accepted
- Date: 2026-11-09
- Follows: ADR-005 (storefront), ADR-014 (referee)
- First use: Cart Rewards, cart notices, automatic coupon names

## Context

Block cart and checkout are WooCommerce's default for new stores, but StoreGrowth's notices and rewards bar only reached the classic cart. Blocks read the cart through the Store API, so that is where StoreGrowth's data has to be.

## Decision

1. **One extension in core.** `StoreApi\CartExtension` registers data under `extensions.storegrowth` with `woocommerce_store_api_register_endpoint_data`: `notices`, `coupon_labels` and whatever a module adds on the filter `spsg_store_api_cart_data` (Cart Rewards: `rewards`). Cart items carry `is_reward_gift`.
2. **Labels and price steps are not in it.** They already go through `woocommerce_get_item_data`, which the Store API reads, so the classic cart, block cart, mini-cart and checkout all show the same line data from one place.
3. **Notices are tagged, then taken.** `CartLine` tags StoreGrowth's notices with `wc_add_notice()`'s data argument. A real REST request (`REST_REQUEST`) takes the tagged ones out of the WooCommerce queue, so a later classic page doesn't print them again. A page that embeds the cart response while rendering (hydration) leaves the queue alone.
4. **Coupon messages need nothing extra.** The Store API applies and removes coupons through `is_coupon_valid()`, so the referee's messages (`woocommerce_coupon_is_valid`) reach the block cart unchanged.
5. **Block script.** `src/storefront/cart-blocks` (`build/cart-blocks.js`), registered as an `IntegrationInterface` on the cart, checkout and mini-cart blocks: the `coupons` and `showRemoveItemLink` checkout filters, an `ExperimentalOrderMeta` fill for the bar, and notices through `core/notices`. It is plain to WooCommerce: a missing build registers nothing and the blocks still render.
6. **The mini-cart is PHP.** From WooCommerce 11.1 the mini-cart is Interactivity API and has no slot. The bar is added with `render_block_woocommerce/mini-cart-footer-block` and bound to `woocommerce::state.cart.extensions.storegrowth`, the state WooCommerce keeps current itself, so no script is involved. On an older WooCommerce (React mini-cart) the bar doesn't show there.

## Consequences

- The `coupons` checkout filter maps labels only: `RemovableChip` always gets `onRemove`, so an automatic coupon's remove button stays. Removing one is harmless: the referee applies it again on the next calculation.
- Campaigns (#308) add their copy for the bar through the same extension data.
