<?php
/**
 * Countdown Timer order attribution: records the timer discount on order lines.
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Modules\CountdownTimer;

use StorePulse\StoreGrowth\Attribution\OfferAttribution;
use StorePulse\StoreGrowth\Interfaces\HookRegistry;
use WC_Order_Item;
use WC_Product;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Writes the countdown percentage onto order lines sold while a timer was live.
 *
 * Registered only while the module is active, the same as the price filter
 * in `CommonHooks`, so a line is marked only when the timer price was
 * really charged.
 *
 * @since SPSG_VERSION
 */
class OrderAttribution implements HookRegistry {

	/**
	 * Register hooks.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return void
	 */
	public function register_hooks(): void {
		// After OfferAttribution (priority 10), so it can replace a reward line's reference price.
		add_action( 'woocommerce_checkout_create_order_line_item', [ $this, 'record_countdown' ], 20, 4 );
	}

	/**
	 * Record the live timer on an order line.
	 *
	 * A reward line (BOGO gift, order bump) keeps its role: only its
	 * reference price is replaced with the price before the timer, so the
	 * whole discount goes to the reward. Any other line gets the percentage.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param WC_Order_Item  $item          Order line item being created.
	 * @param string         $cart_item_key Cart item key.
	 * @param array          $values        Cart item data.
	 * @param \WC_Order|null $order         Order being built.
	 *
	 * @return void
	 */
	public function record_countdown( $item, $cart_item_key, $values, $order = null ): void {
		if ( ! $item instanceof WC_Order_Item || OfferAttribution::is_subscription( $order ) ) {
			return;
		}

		$cart_product = $values['data'] ?? null;
		if ( ! $cart_product instanceof WC_Product ) {
			return;
		}

		// The variation id when there is one: the timer is saved per variation.
		$product_id = $cart_product->get_id();
		$pct        = self::live_percentage( $product_id );
		if ( ! $pct ) {
			return;
		}

		// The edit context skips the countdown price filter.
		$reference_price = OfferAttribution::reference_price( $cart_product, 'edit' );

		if ( ! empty( $values[ OfferAttribution::CAMPAIGN_ID ] ) ) {
			if ( '' !== $reference_price ) {
				$item->add_meta_data( OfferAttribution::REFERENCE_PRICE, $reference_price, true );
			}
			return;
		}

		$item->add_meta_data( OfferAttribution::COUNTDOWN_PCT, (string) $pct, true );

		// At 100% the charged price is 0, so the discount needs the price itself.
		if ( 100 === $pct && '' !== $reference_price ) {
			$item->add_meta_data( OfferAttribution::REFERENCE_PRICE, $reference_price, true );
		}
	}

	/**
	 * The timer percentage the price filter applies to a product now.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param int $product_id Product or variation id.
	 *
	 * @return int Percentage from 1 to 100, or 0 when no timer discount applies.
	 */
	private static function live_percentage( int $product_id ): int {
		return Helper::is_product_discountable( $product_id ) ? Helper::discount_percentage( $product_id ) : 0;
	}
}
