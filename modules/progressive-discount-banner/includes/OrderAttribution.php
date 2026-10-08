<?php
/**
 * Free Shipping Bar order attribution: tags the bar's discount and threshold on the order.
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Modules\ProgressiveDiscountBanner;

use StorePulse\StoreGrowth\Attribution\OfferAttribution;
use StorePulse\StoreGrowth\Helper as PluginHelper;
use StorePulse\StoreGrowth\Interfaces\HookRegistry;
use WC_Order;
use WC_Order_Item_Fee;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Records what the bar did for an order (ADR-012), with the CRUD API:
 * - Discount mode: the bar's discount fee line gets the source and the rule
 *   that earned it. A fee keeps only its name and amount on the order.
 * - Free-shipping mode: the order gets the threshold it met.
 *
 * Registered only while the module is active, like the fee itself. Nothing
 * is written to a subscription.
 *
 * @since SPSG_VERSION
 */
class OrderAttribution implements HookRegistry {

	/**
	 * `_spsg_campaign_type` value on the bar's discount fee line.
	 *
	 * @since SPSG_VERSION
	 */
	const CAMPAIGN_TYPE = 'progressive_discount';

	/**
	 * Fee-item key: threshold in force.
	 *
	 * @since SPSG_VERSION
	 */
	const THRESHOLD = '_spsg_fsb_threshold';

	/**
	 * Fee-item key: `fixed-amount` or `percentage`.
	 *
	 * @since SPSG_VERSION
	 */
	const MODE = '_spsg_fsb_mode';

	/**
	 * Fee-item key: the configured amount or percentage.
	 *
	 * @since SPSG_VERSION
	 */
	const VALUE = '_spsg_fsb_value';

	/**
	 * Fee-item key: cart subtotal that qualified.
	 *
	 * @since SPSG_VERSION
	 */
	const SUBTOTAL = '_spsg_fsb_subtotal';

	/**
	 * Register hooks.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return void
	 */
	public function register_hooks(): void {
		// Both checkouts create fee lines through WC_Checkout::create_order_fee_lines().
		add_action( 'woocommerce_checkout_create_order_fee_item', [ $this, 'tag_fee' ], 10, 4 );

		// After the fee lines exist: classic checkout, then the blocks Store API.
		add_action( 'woocommerce_checkout_create_order', [ $this, 'record_order' ] );
		add_action( 'woocommerce_store_api_checkout_update_order_from_request', [ $this, 'record_order' ] );
	}

	/**
	 * Tag the bar's discount fee line with the rule that earned it.
	 *
	 * The tag lives and dies with the fee line: both checkouts recreate a
	 * draft order's fee lines when the cart's fees change.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param WC_Order_Item_Fee $item    Fee line being created.
	 * @param string            $fee_key Fee id in the cart.
	 * @param object            $fee     Cart fee.
	 * @param WC_Order|null     $order   Order being built.
	 *
	 * @return void
	 */
	public function tag_fee( $item, $fee_key, $fee, $order = null ): void {
		if ( WoocommerceDiscount::FEE_ID !== $fee_key || ! $item instanceof WC_Order_Item_Fee || OfferAttribution::is_subscription( $order ) ) {
			return;
		}

		$settings = Helper::get_settings();

		$item->add_meta_data( OfferAttribution::CAMPAIGN_TYPE, self::CAMPAIGN_TYPE, true );
		$item->add_meta_data( self::THRESHOLD, self::threshold( $settings ), true );
		$item->add_meta_data( self::MODE, (string) PluginHelper::find_option_settings( $settings, 'discount_amount_mode', '' ), true );
		$item->add_meta_data( self::VALUE, (string) wc_format_decimal( PluginHelper::find_option_settings( $settings, 'discount_amount_value', 0 ) ), true );
		$item->add_meta_data( self::SUBTOTAL, self::cart_subtotal(), true );
	}

	/**
	 * Order-level record, on every checkout pass.
	 *
	 * Free-shipping mode: the threshold is set when the cart meets it and
	 * deleted otherwise, so a draft order never keeps a stale one. The
	 * subtotal on a tagged fee line is refreshed too: the blocks checkout
	 * keeps fee lines whose amount didn't change (a fixed discount) while
	 * the cart did.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param WC_Order $order Order being built.
	 *
	 * @return void
	 */
	public function record_order( $order ): void {
		if ( ! $order instanceof WC_Order || OfferAttribution::is_subscription( $order ) || ! function_exists( 'WC' ) || is_null( WC()->cart ) ) {
			return;
		}

		$settings  = Helper::get_settings();
		$threshold = self::threshold( $settings );
		$subtotal  = self::cart_subtotal();

		if ( 'free-shipping' === PluginHelper::find_option_settings( $settings, 'discount_type', '' ) && (float) $subtotal >= (float) $threshold ) {
			$order->update_meta_data( self::THRESHOLD, $threshold );
		} else {
			$order->delete_meta_data( self::THRESHOLD );
		}

		foreach ( $order->get_fees() as $fee ) {
			if ( self::CAMPAIGN_TYPE === $fee->get_meta( OfferAttribution::CAMPAIGN_TYPE ) ) {
				$fee->update_meta_data( self::SUBTOTAL, $subtotal );
			}
		}
	}

	/**
	 * Threshold in force.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array $settings Module settings.
	 *
	 * @return string
	 */
	private static function threshold( array $settings ): string {
		return (string) wc_format_decimal( PluginHelper::find_option_settings( $settings, 'cart_minimum_amount', 0 ) );
	}

	/**
	 * Cart subtotal, the figure the bar compares with its threshold.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return string
	 */
	private static function cart_subtotal(): string {
		return function_exists( 'WC' ) && WC()->cart ? (string) wc_format_decimal( WC()->cart->get_subtotal() ) : '';
	}
}
