<?php
/**
 * Money display and comparison.
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Support;

use WC_Product;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Thin layer over WooCommerce's price functions, so every StoreGrowth price
 * follows the store's currency format and tax display, and two amounts are
 * always compared in the same terms. Base currency only.
 *
 * @since SPSG_VERSION
 */
class Money {

	/**
	 * A product price with or without tax, as the store displays it.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param WC_Product $product Product.
	 * @param float      $price   Price as entered.
	 * @param string     $context `shop` for product pages, `cart` for cart and checkout.
	 *
	 * @return float
	 */
	public static function display_amount( WC_Product $product, float $price, string $context = 'shop' ): float {
		return (float) wc_get_price_to_display(
			$product,
			[
				'price'           => $price,
				'display_context' => $context,
			]
		);
	}

	/**
	 * A product price as HTML, in the store's tax display and currency format.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param WC_Product $product Product.
	 * @param float      $price   Price as entered.
	 * @param string     $context `shop` for product pages, `cart` for cart and checkout.
	 *
	 * @return string
	 */
	public static function price_html( WC_Product $product, float $price, string $context = 'shop' ): string {
		return wc_price( self::display_amount( $product, $price, $context ) );
	}

	/**
	 * Compare two amounts at the store's rounding.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param float $first  First amount.
	 * @param float $second Second amount.
	 *
	 * @return int -1, 0 or 1, as `<=>`.
	 */
	public static function compare( float $first, float $second ): int {
		$decimals = wc_get_price_decimals();

		return round( $first, $decimals ) <=> round( $second, $decimals );
	}
}
