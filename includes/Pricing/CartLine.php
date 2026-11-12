<?php
/**
 * Live pricing of a StoreGrowth cart line.
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Pricing;

use StorePulse\StoreGrowth\Modules\BoGo\Helper as BogoHelper;
use StorePulse\StoreGrowth\Support\Money;
use WC_Cart;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Sets a gift or bump line's price on each cart calculation and tells the
 * shopper when it changed since the cart was last priced.
 *
 * @since SPSG_VERSION
 */
class CartLine {

	/**
	 * Cart item key: the price the line was last priced at.
	 *
	 * @since SPSG_VERSION
	 *
	 * @var string
	 */
	const PRICED_WITH = '_spsg_priced_with';

	/**
	 * Cart item key: the Cart Rewards milestone a free gift line belongs to.
	 *
	 * @since SPSG_VERSION
	 *
	 * @var string
	 */
	const REWARD_GIFT = '_spsg_reward_gift';

	/**
	 * Notice data marking a notice as StoreGrowth's, so the block cart can
	 * show it (`StoreApi\CartExtension`).
	 *
	 * @since SPSG_VERSION
	 *
	 * @var string
	 */
	const NOTICE_SOURCE = 'spsg_notice';

	/**
	 * Notice data marking a notice as a line's own: a campaign's notice takes
	 * its place when both come from one event (StoreGrowth Pro's campaign notices).
	 *
	 * @since SPSG_VERSION
	 *
	 * @var string
	 */
	const LINE_NOTICE = 'spsg_line_notice';

	/**
	 * Whether a line is a free gift of any kind: a BOGO gift or a Cart Rewards
	 * gift. Gift lines stay out of coupons' reach, shares and minimums.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array $item Cart item.
	 *
	 * @return bool
	 */
	public static function is_gift( array $item ): bool {
		return ! empty( $item[ self::REWARD_GIFT ] ) || BogoHelper::is_gift_line( $item );
	}

	/**
	 * Price a cart line for this calculation.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param WC_Cart    $cart         Cart.
	 * @param string     $key          Cart item key.
	 * @param float      $price        The line's current unit price.
	 * @param mixed|null $legacy_price The price a cart from before 3.1 saved on the line, if any.
	 *
	 * @return void
	 */
	public static function set_price( WC_Cart $cart, string $key, float $price, $legacy_price = null ): void {
		$last_price = $cart->cart_contents[ $key ][ self::PRICED_WITH ] ?? $legacy_price;

		$cart->cart_contents[ $key ]['data']->set_price( $price );
		$cart->cart_contents[ $key ][ self::PRICED_WITH ] = $price;

		if ( null !== $last_price && 0 !== Money::compare( (float) $last_price, $price ) ) {
			self::notice( __( 'Prices updated.', 'storegrowth-sales-booster' ), true );
		}
	}

	/**
	 * Remove a line the shopper no longer gets. It can't be brought back with
	 * WooCommerce's "Undo".
	 *
	 * @since SPSG_VERSION
	 *
	 * @param WC_Cart $cart    Cart.
	 * @param string  $key     Cart item key.
	 * @param string  $message Notice for the shopper; empty for none.
	 *
	 * @return void
	 */
	public static function remove( WC_Cart $cart, string $key, string $message = '' ): void {
		$cart->remove_cart_item( $key );
		unset( $cart->removed_cart_contents[ $key ] );

		if ( '' !== $message ) {
			self::notice( $message, true );
		}
	}

	/**
	 * Add a notice once.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param string $message Notice.
	 * @param bool   $is_line Whether the notice is a line's own, which a campaign's replaces.
	 *
	 * @return void
	 */
	public static function notice( string $message, bool $is_line = false ): void {
		if ( ! wc_has_notice( $message, 'notice' ) ) {
			wc_add_notice(
				$message,
				'notice',
				[
					self::NOTICE_SOURCE => true,
					self::LINE_NOTICE   => $is_line,
				]
			);
		}
	}
}
