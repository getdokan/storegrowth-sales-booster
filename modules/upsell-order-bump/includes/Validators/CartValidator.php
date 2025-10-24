<?php

namespace StorePulse\StoreGrowth\Modules\UpsellOrderBump\Validators;

use StorePulse\StoreGrowth\Interfaces\HookRegistry;
use WP_Error;

class CartValidator implements HookRegistry {

	private array $errors = [];

	public function register_hooks(): void {
		add_filter( 'woocommerce_cart_item_quantity', [ $this, 'maybe_disable_cart_item_quantity' ], 8, 3 );
		add_action( 'woocommerce_after_checkout_validation', [ $this, 'after_checkout_validation' ], 10, 2 );
		add_action( 'woocommerce_store_api_cart_errors', [ $this, 'maybe_render_validation_error' ] );
	}

	/**
	 * Remove the quantity field
	 *
	 * @param $quantity
	 * @param $cart_item_key
	 * @param $cart_item
	 *
	 * @return string
	 */
	public function maybe_disable_cart_item_quantity( $quantity, $cart_item_key, $cart_item ) {
		// Check if custom data exists
		if ( isset( $cart_item['_spsg_order_bump_product'] ) ) {
			// Show non-editable quantity
			return sprintf( '<span class="fixed-qty">%d</span>', $cart_item['quantity'] );
		}

		return $quantity;
	}

	public function after_checkout_validation( $data, WP_Error $error ) {
		$this->maybe_render_validation_error( $error );
	}

	/**
	 * Check if the cart is invalid
	 *
	 * @return bool
	 */
	public function is_invalid_cart(): bool {
		foreach ( WC()->cart->get_cart() as $cart_item_key => $cart_item ) {
			if ( isset( $cart_item['_spsg_order_bump_product'] ) && $cart_item['quantity'] > 1 ) {

				$this->errors[] = [
					'type'    => 'error',
					'message' => sprintf( 'Maximum allowed quantity for %s', $this->get_product_with_link( $cart_item['product_id'] ) )
				];

				return true;
			}
		}

		return false;
	}

	protected function get_product_with_link( $product_id ): string {
		$product = wc_get_product( $product_id );

		return wp_kses(
			"<a href='{$product->get_permalink()}'>{$product->get_title()}</a>",
			[
				'a' => [
					'href'  => [],
					'title' => [],
				],
			]
		);
	}

	/**
	 * Handle the block api validation error
	 *
	 * @param WP_Error $wp_error
	 *
	 * @return void
	 */
	public function maybe_render_validation_error( WP_Error $wp_error ) {
		if ( $this->is_invalid_cart() ) {
			foreach ( $this->errors as $error ) {
				$wp_error->add( $error['type'], $error['message'] );
			}
		}
	}
}
