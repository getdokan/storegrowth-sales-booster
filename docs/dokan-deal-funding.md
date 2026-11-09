# Who pays for a deal on a Dokan marketplace

For marketplace owners. How each StoreGrowth deal is funded today.

| Deal | Who pays | Why |
|---|---|---|
| BOGO | The vendor whose product it is, even for an admin BOGO | The gift's price is lowered on the line, and Dokan pays vendors from line prices. |
| Countdown | The vendor | The product's price is lowered, as above. |
| Order Bump | The vendor | The line's price is lowered, as above. |
| Free Shipping Rules discount | The marketplace | It is a cart fee, which isn't copied to vendor sub-orders. |
| Smart Coupon | Follows Dokan's admin-coupon setting | It is a real WooCommerce coupon. Dokan's `coupon_commissions_type` decides: the marketplace funds it with `from_admin`. |

When a Smart Coupon beats a vendor BOGO on a vendor's product, the coupon is what's applied, so its funding is the coupon's (the row above), and the vendor's gift cost goes away with the gift.

Smart Coupons writes `admin_coupons_enabled_for_vendor` and `coupon_commissions_type` when it saves an admin coupon. Without `admin_coupons_enabled_for_vendor`, Dokan treats an admin coupon as invalid on vendor products.

A "$X off the cart" coupon on a cart with products from two or more vendors follows Dokan, which rejects it with its own message. StoreGrowth doesn't override that.

Prices and thresholds are in the store's base currency; multi-currency is not supported.
