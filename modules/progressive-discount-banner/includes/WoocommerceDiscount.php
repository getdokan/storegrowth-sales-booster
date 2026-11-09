<?php
/**
 * WoocommerceDiscount class for Progressive Discount Banner.
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Modules\ProgressiveDiscountBanner;

use StorePulse\StoreGrowth\Analytics\Counter;
use StorePulse\StoreGrowth\Interfaces\HookRegistry;
use StorePulse\StoreGrowth\Traits\Singleton;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Add or Remove discount when product add/remove to cart.
 */
class WoocommerceDiscount implements HookRegistry {

	use Singleton;

	/**
	 * Cart fee id of the bar's discount.
	 *
	 * @since 3.0.0
	 */
	const FEE_ID = 'spsg-pd-banner-discount';

	/**
	 * WooCommerce session key: the cart reached the threshold this session.
	 *
	 * @since 3.0.0
	 */
	const REACHED_SESSION_KEY = 'spsg_fsb_reached';

	/**
	 * Shipping package key holding the reward tier, so a change in it
	 * recalculates the rates.
	 *
	 * @since SPSG_VERSION
	 */
	const PACKAGE_KEY = 'spsg_cart_reward_tier';

	/**
	 * Register Hooks.
	 *
	 * @since 2.0.0
	 *
	 * @return void
	 */
	public function register_hooks(): void {
		add_action( 'woocommerce_cart_calculate_fees', [ $this, 'woocommerce_cart_calculate_fees' ], 22 );

		// After Dokan splits the cart into one package per vendor, at 10.
		add_filter( 'woocommerce_cart_shipping_packages', [ $this, 'add_reward_tier_to_packages' ], 20 );
		add_filter( 'woocommerce_package_rates', [ $this, 'hide_free_shipping_below_threshold' ], 10, 2 );
		add_filter( 'woocommerce_shipping_chosen_method', [ $this, 'prefer_free_shipping' ], 10, 2 );
	}

	/**
	 * Free shipping used to be picked here, once, when an item was added.
	 * The shipping rates decide on every calculation now.
	 *
	 * @deprecated SPSG_VERSION Nothing is picked on add-to-cart any more.
	 *
	 * @return void
	 */
	public function woocommerce_added_to_cart() {
		_deprecated_function( __METHOD__, 'SPSG_VERSION' );
	}

	/**
	 * Put the reward tier into each shipping package. WooCommerce only filters
	 * rates again when a package's hash changes, and neither a threshold edit
	 * nor a reward coming and going changes a line.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array $packages Shipping packages.
	 *
	 * @return array
	 */
	public function add_reward_tier_to_packages( $packages ) {
		$state = WC()->cart ? Milestones::free_shipping_state( WC()->cart ) : null;

		if ( ! $state ) {
			return $packages;
		}

		foreach ( $packages as $index => $package ) {
			$packages[ $index ][ self::PACKAGE_KEY ] = $state;
		}

		return $packages;
	}

	/**
	 * Hide WooCommerce's Free shipping rate while the cart is below the
	 * lowest free-shipping milestone.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array $rates   Shipping rates.
	 * @param array $package Shipping package.
	 *
	 * @return array
	 */
	public function hide_free_shipping_below_threshold( $rates, $package ) {
		if ( ! isset( $package[ self::PACKAGE_KEY ] ) || $package[ self::PACKAGE_KEY ]['reached'] ) {
			return $rates;
		}

		return array_filter(
			$rates,
			static function ( $rate ): bool {
				return 'free_shipping' !== $rate->method_id;
			}
		);
	}

	/**
	 * Pre-select Free shipping when the cart reaches its milestone, as adding
	 * to cart used to. WooCommerce asks only when the available methods change,
	 * so a method the shopper picks afterwards stays.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param string $default_method Default method id.
	 * @param array  $rates          Available rates.
	 *
	 * @return string
	 */
	public function prefer_free_shipping( $default_method, $rates ) {
		$state = WC()->cart ? Milestones::free_shipping_state( WC()->cart ) : null;

		if ( ! $state || ! $state['reached'] ) {
			return $default_method;
		}

		foreach ( $rates as $rate_id => $rate ) {
			if ( 'free_shipping' === $rate->method_id ) {
				return (string) $rate_id;
			}
		}

		return $default_method;
	}

	/**
	 * Count a reached cart once per session and apply a discount milestone.
	 */
	public function woocommerce_cart_calculate_fees() {
		if ( ! Milestones::reached( wc()->cart ) ) {
			return;
		}

		// Counted once per session: fees are calculated on every cart change.
		if ( Counter::first_in_session( self::REACHED_SESSION_KEY, 0 ) ) {
			Counter::bump( ProgressiveDiscountBannerModule::get_id(), 'reached', Counter::MODULE, 0 );
		}

		$discount = Milestones::discount_reached( wc()->cart );

		if ( $discount ) {
			$this->set_discount_amount( $discount );
		}
	}

	/**
	 * Add a discount milestone's fee. A percentage is of the subtotal before
	 * discounts, as it always was.
	 *
	 * @param array $discount Discount milestone.
	 */
	private function set_discount_amount( array $discount ) {
		$discount_amount = 'percentage' === $discount['discount_mode']
			? wc()->cart->get_subtotal() * $discount['discount_value'] / 100
			: $discount['discount_value'];

		if ( ! $discount_amount ) {
			return;
		}

		// Add discount as fee.
		wc()->cart->fees_api()->add_fee(
			[
				'id'     => self::FEE_ID,
				'name'   => 'Discount',
				'amount' => - $discount_amount, // Negative value to decrease the total.
			]
		);
	}
}
