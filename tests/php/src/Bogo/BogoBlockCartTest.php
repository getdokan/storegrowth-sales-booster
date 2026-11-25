<?php
/**
 * BOGO offer lines on the block cart.
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Test\Bogo;

use StorePulse\StoreGrowth\Modules\BoGo\OrderBogo;
use StorePulse\StoreGrowth\StoreApi\CartExtension;
use StorePulse\StoreGrowth\Test\StoreGrowthTestCase;
use WC_Product_Simple;

/**
 * The block cart offers no quantity buttons or remove button on a BOGO
 * offer line, as the classic cart doesn't (pro#356).
 */
class BogoBlockCartTest extends StoreGrowthTestCase {

	/**
	 * A BOGO offer line is locked and flagged; a bought line isn't.
	 *
	 * @return void
	 */
	public function test_a_bogo_offer_line_is_locked_on_the_block_cart(): void {
		$product   = new WC_Product_Simple();
		$bogo      = new OrderBogo();
		$extension = new CartExtension();
		$gift      = [ 'bogo_offer' => true ];
		$bought    = [];

		$this->assertFalse( $bogo->lock_block_gift_quantity( true, $product, $gift ) );
		$this->assertTrue( $bogo->lock_block_gift_quantity( true, $product, $bought ) );
		$this->assertTrue( $extension->cart_item_data( $gift )['is_bogo_gift'] );
		$this->assertFalse( $extension->cart_item_data( $bought )['is_bogo_gift'] );
	}
}
