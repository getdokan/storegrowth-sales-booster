<?php
/**
 * StoreGrowth's data on the Store API cart (ADR-015).
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\StoreApi;

use Automattic\WooCommerce\StoreApi\Schemas\V1\CartItemSchema;
use Automattic\WooCommerce\StoreApi\Schemas\V1\CartSchema;
use StorePulse\StoreGrowth\Interfaces\HookRegistry;
use StorePulse\StoreGrowth\Pricing\CartLine;
use StorePulse\StoreGrowth\Pricing\SmartCoupon;
use WC_Cart;
use WC_Coupon;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Exposes the shopper's notices, automatic coupon names and each module's
 * data to the block cart, mini-cart and checkout. Line labels and price steps
 * aren't here: the Store API reads `woocommerce_get_item_data` for those.
 *
 * @since SPSG_VERSION
 */
class CartExtension implements HookRegistry {

	/**
	 * Namespace of the extension data.
	 *
	 * @since SPSG_VERSION
	 */
	const IDENTIFIER = 'storegrowth';

	/**
	 * Notices taken from the queue for the cart a page embeds, not delivered yet.
	 *
	 * @since SPSG_VERSION
	 *
	 * @var string[]
	 */
	private array $held = [];

	/**
	 * Whether this request draws a block cart or checkout.
	 *
	 * @since SPSG_VERSION
	 *
	 * @var bool
	 */
	private bool $has_notice_area = false;

	/**
	 * Register hooks.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return void
	 */
	public function register_hooks(): void {
		if ( did_action( 'woocommerce_blocks_loaded' ) ) {
			$this->register_endpoint_data();
		} else {
			add_action( 'woocommerce_blocks_loaded', [ $this, 'register_endpoint_data' ] );
		}

		add_action( 'woocommerce_blocks_cart_block_registration', [ $this, 'register_integration' ] );
		add_action( 'woocommerce_blocks_checkout_block_registration', [ $this, 'register_integration' ] );
		add_action( 'woocommerce_blocks_mini-cart_block_registration', [ $this, 'register_integration' ] );
		add_action( 'woocommerce_blocks_enqueue_cart_block_scripts_before', [ $this, 'hold_notices_for_page' ] );
		add_action( 'woocommerce_blocks_enqueue_checkout_block_scripts_before', [ $this, 'hold_notices_for_page' ] );
		// Before WooCommerce saves the session, at 20.
		add_action( 'shutdown', [ $this, 'release_held_notices' ], 10 );
	}

	/**
	 * A block cart or checkout is about to embed the cart. WooCommerce empties
	 * the notice queue for that and puts it back afterwards, so what is queued
	 * has to be taken out first or it never reaches the page. Totals run first:
	 * a calculation between here and the embed (Dokan Pro's vendor discount is
	 * one) would raise its notices too late for this page.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return void
	 */
	public function hold_notices_for_page(): void {
		if ( WC()->cart ) {
			WC()->cart->calculate_totals();
		}

		$this->has_notice_area = true;
		$this->held            = array_merge( $this->held, self::take_notices() );
	}

	/**
	 * Back in the queue with any notice this page didn't embed, for the next
	 * page that shows notices.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return void
	 */
	public function release_held_notices(): void {
		foreach ( $this->held as $notice ) {
			CartLine::notice( $notice );
		}

		$this->held = [];
	}

	/**
	 * Add the block script to a block's integrations.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param \Automattic\WooCommerce\Blocks\Integrations\IntegrationRegistry $registry Integration registry.
	 *
	 * @return void
	 */
	public function register_integration( $registry ): void {
		$registry->register( new CartBlocksIntegration() );
	}

	/**
	 * Register the data on the cart and cart item endpoints.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return void
	 */
	public function register_endpoint_data(): void {
		if ( ! function_exists( 'woocommerce_store_api_register_endpoint_data' ) ) {
			return;
		}

		woocommerce_store_api_register_endpoint_data(
			[
				'endpoint'        => CartSchema::IDENTIFIER,
				'namespace'       => self::IDENTIFIER,
				'data_callback'   => [ $this, 'cart_data' ],
				'schema_callback' => [ $this, 'cart_schema' ],
				'schema_type'     => ARRAY_A,
			]
		);

		woocommerce_store_api_register_endpoint_data(
			[
				'endpoint'        => CartItemSchema::IDENTIFIER,
				'namespace'       => self::IDENTIFIER,
				'data_callback'   => [ $this, 'cart_item_data' ],
				'schema_callback' => [ $this, 'cart_item_schema' ],
				'schema_type'     => ARRAY_A,
			]
		);
	}

	/**
	 * The extension data of the Store API cart.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return array
	 */
	public function cart_data(): array {
		$cart = WC()->cart;

		if ( ! $cart instanceof WC_Cart ) {
			return [];
		}

		$data = [
			'notices'       => $this->notices_for_response(),
			'coupon_labels' => self::automatic_coupon_labels( $cart ),
		];

		/**
		 * Filters StoreGrowth's data on the Store API cart, for a module to add
		 * its own, e.g. Cart Rewards' bar under `rewards`.
		 *
		 * @since SPSG_VERSION
		 *
		 * @param array   $data Data under `extensions.storegrowth`.
		 * @param WC_Cart $cart Cart.
		 */
		return (array) apply_filters( 'spsg_store_api_cart_data', $data, $cart );
	}

	/**
	 * Schema of the extension data.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return array
	 */
	public function cart_schema(): array {
		return [
			'notices'       => [
				'description' => __( 'Notices for the shopper.', 'storegrowth-sales-booster' ),
				'type'        => 'array',
				'context'     => [ 'view', 'edit' ],
				'readonly'    => true,
				'items'       => [ 'type' => 'string' ],
			],
			'coupon_labels' => [
				'description' => __( 'Names of automatic coupons, by code.', 'storegrowth-sales-booster' ),
				'type'        => 'object',
				'context'     => [ 'view', 'edit' ],
				'readonly'    => true,
			],
			'rewards'       => [
				'description' => __( 'The Cart Rewards bar.', 'storegrowth-sales-booster' ),
				'type'        => [ 'object', 'null' ],
				'context'     => [ 'view', 'edit' ],
				'readonly'    => true,
			],
		];
	}

	/**
	 * Per cart line, for the block cart's own line controls.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array $cart_item Cart item.
	 *
	 * @return array
	 */
	public function cart_item_data( $cart_item ): array {
		return [ 'is_reward_gift' => ! empty( $cart_item[ CartLine::REWARD_GIFT ] ) ];
	}

	/**
	 * Schema of the per-line data.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return array
	 */
	public function cart_item_schema(): array {
		return [
			'is_reward_gift' => [
				'description' => __( 'Whether the line is a Cart Rewards free gift.', 'storegrowth-sales-booster' ),
				'type'        => 'boolean',
				'context'     => [ 'view', 'edit' ],
				'readonly'    => true,
			],
		];
	}

	/**
	 * The notices for this cart response. A real REST request takes the queue.
	 * The cart a page embeds while rendering (hydration) takes what the page
	 * held back plus what this response raised, which WooCommerce would
	 * otherwise throw away, but only a block cart or checkout can show them.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return string[]
	 */
	private function notices_for_response(): array {
		if ( self::is_rest_request() ) {
			return self::take_notices();
		}

		$this->held = array_merge( $this->held, self::take_notices() );

		if ( ! $this->has_notice_area ) {
			return [];
		}

		$notices    = array_values( array_unique( $this->held ) );
		$this->held = [];

		return $notices;
	}

	/**
	 * Whether this is a real REST request.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return bool
	 */
	private static function is_rest_request(): bool {
		return defined( 'REST_REQUEST' ) && REST_REQUEST;
	}

	/**
	 * Take StoreGrowth's notices out of the WooCommerce queue, so a later
	 * classic page doesn't print them again.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return string[]
	 */
	public static function take_notices(): array {
		if ( ! WC()->session ) {
			return [];
		}

		$notices  = (array) WC()->session->get( 'wc_notices', [] );
		$messages = [];

		foreach ( (array) ( $notices['notice'] ?? [] ) as $index => $notice ) {
			if ( ! empty( $notice['data'][ CartLine::NOTICE_SOURCE ] ) ) {
				$messages[] = wp_strip_all_tags( (string) $notice['notice'] );
				unset( $notices['notice'][ $index ] );
			}
		}

		if ( $messages ) {
			$notices['notice'] = array_values( $notices['notice'] );

			WC()->session->set( 'wc_notices', $notices );
		}

		return $messages;
	}

	/**
	 * The names automatic coupons go by, by code: their codes mean nothing.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param WC_Cart $cart Cart.
	 *
	 * @return array<string, string>
	 */
	private static function automatic_coupon_labels( WC_Cart $cart ): array {
		$labels = [];

		foreach ( $cart->get_applied_coupons() as $code ) {
			$coupon = new WC_Coupon( $code );

			if ( SmartCoupon::is_automatic( $coupon ) ) {
				$labels[ $code ] = SmartCoupon::name( $coupon );
			}
		}

		return $labels;
	}
}
