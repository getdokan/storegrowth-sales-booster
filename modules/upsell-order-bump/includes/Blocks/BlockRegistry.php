<?php

namespace StorePulse\StoreGrowth\Modules\UpsellOrderBump\Blocks;

use StorePulse\StoreGrowth\Interfaces\HookRegistry;

class BlockRegistry implements HookRegistry {

	public function register_hooks(): void {
		add_action( 'woocommerce_blocks_mini-cart_block_registration', [ $this, 'cart_checkout_block_support' ] );
		add_action( 'woocommerce_blocks_cart_block_registration', [ $this, 'cart_checkout_block_support' ] );
		add_action( 'woocommerce_blocks_checkout_block_registration', [ $this, 'cart_checkout_block_support' ] );
	}

	public function cart_checkout_block_support( $integration_registry ): void {
		$integration_registry->register( new OrderBumpCheckoutIntegration() );
	}
}
