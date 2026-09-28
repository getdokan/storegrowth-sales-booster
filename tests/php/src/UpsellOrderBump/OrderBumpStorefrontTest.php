<?php
/**
 * Order Bump at checkout: the add-to-cart match, prices and texts (step 11b).
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Test\UpsellOrderBump;

use StorePulse\StoreGrowth\Attribution\OfferAttribution;
use StorePulse\StoreGrowth\Modules\UpsellOrderBump\Blocks\OrderBumpCheckoutIntegration;
use StorePulse\StoreGrowth\Modules\UpsellOrderBump\Database\OrderBumpData;
use StorePulse\StoreGrowth\Modules\UpsellOrderBump\OrderBump;
use StorePulse\StoreGrowth\Modules\UpsellOrderBump\OrderBumpAjax;
use StorePulse\StoreGrowth\Test\StoreGrowthTestCase;
use WC_Product_Attribute;
use WC_Product_Variable;
use WC_Product_Variation;

/**
 * The storefront side of a bump, driven with a real cart.
 *
 * @group upsell-order-bump
 */
class OrderBumpStorefrontTest extends StoreGrowthTestCase {

	/**
	 * An empty bump table and cart.
	 *
	 * @return void
	 */
	public function setUp(): void {
		parent::setUp();

		global $wpdb;
		$wpdb->query( "TRUNCATE TABLE {$wpdb->prefix}spsg_order_bumps" ); // phpcs:ignore WordPress.DB

		wc_load_cart();
		WC()->cart->empty_cart();
	}

	/**
	 * Empty the cart.
	 *
	 * @return void
	 */
	public function tearDown(): void {
		WC()->cart->empty_cart();

		parent::tearDown();
	}

	/**
	 * A variable product with one variation.
	 *
	 * @param float $price        The variation's regular price.
	 * @param int[] $category_ids The parent's categories.
	 *
	 * @return WC_Product_Variation
	 */
	private function create_variation( float $price, array $category_ids = [] ): WC_Product_Variation {
		$attribute = new WC_Product_Attribute();
		$attribute->set_name( 'size' );
		$attribute->set_options( [ 'small', 'large' ] );
		$attribute->set_visible( true );
		$attribute->set_variation( true );

		$parent = new WC_Product_Variable();
		$parent->set_name( 'Hoodie' );
		$parent->set_status( 'publish' );
		$parent->set_attributes( [ $attribute ] );
		$parent->set_category_ids( $category_ids );
		$parent->save();

		$variation = new WC_Product_Variation();
		$variation->set_parent_id( $parent->get_id() );
		$variation->set_attributes( [ 'size' => 'large' ] );
		$variation->set_regular_price( (string) $price );
		$variation->set_status( 'publish' );
		$variation->save();

		return wc_get_product( $variation->get_id() );
	}

	/**
	 * Store a bump.
	 *
	 * @param array $data Bump data.
	 *
	 * @return int
	 */
	private function create_bump( array $data ): int {
		return (int) ( new OrderBumpData() )->create(
			array_merge(
				[
					'name'         => 'Bump',
					'offer_type'   => 'discount',
					'offer_amount' => 10,
				],
				$data
			)
		);
	}

	/**
	 * Bug 4: a bump offering a variation matches when the storefront sends
	 * the variation (it compared the stored variation with the parent's id
	 * and answered 403), at the variation's price, with its stamp.
	 *
	 * @return void
	 */
	public function test_variation_offer_is_found_and_priced_from_the_variation() {
		$target    = $this->create_product();
		$variation = $this->create_variation( 40 );
		$id        = $this->create_bump(
			[
				'target_products'  => [ $target->get_id() ],
				'offer_product_id' => $variation->get_id(),
				'offer_amount'     => 25,
			]
		);

		WC()->cart->add_to_cart( $target->get_id() );

		$offer = ( new OrderBumpAjax() )->find_offer( $variation->get_id() );
		$this->assertNotNull( $offer, 'the variation offer is found' );
		$this->assertSame( $id, (int) $offer['bump']['id'] );
		$this->assertSame( 30.0, $offer['price'], 'priced from the variation, not the parent' );
		$this->assertSame( 'discount', $offer['stamp'][ OfferAttribution::REWARD_TYPE ] );
		$this->assertSame( '10', $offer['stamp'][ OfferAttribution::DISCOUNT_VALUE ] );

		$this->assertNull( ( new OrderBumpAjax() )->find_offer( $variation->get_parent_id() ), 'the parent is not the offer' );
	}

	/**
	 * The price check, the stamp and the checkout box read the cart the same
	 * way: a variation in the cart whose category is only on its parent
	 * qualifies for a category bump (the price check didn't see the parent's
	 * categories, the stamp no variation ids).
	 *
	 * @return void
	 */
	public function test_parent_category_of_a_cart_variation_qualifies() {
		$category = self::factory()->term->create( [ 'taxonomy' => 'product_cat' ] );
		$in_cart  = $this->create_variation( 30, [ $category ] );
		$offer    = $this->create_product( 12 );

		$this->create_bump(
			[
				'target_type'       => 'categories',
				'target_categories' => [ $category ],
				'offer_product_id'  => $offer->get_id(),
				'offer_type'        => 'free',
				'offer_amount'      => 0,
			]
		);

		WC()->cart->add_to_cart( $in_cart->get_parent_id(), 1, $in_cart->get_id(), [ 'attribute_size' => 'large' ] );

		list( $product_ids, $category_ids ) = OrderBump::get_cart_targets();
		$this->assertContains( $in_cart->get_id(), $product_ids );
		$this->assertContains( $category, $category_ids );

		$found = ( new OrderBumpAjax() )->find_offer( $offer->get_id() );
		$this->assertNotNull( $found );
		$this->assertSame( 0.0, $found['price'] );
		$this->assertSame( 'free', $found['stamp'][ OfferAttribution::REWARD_TYPE ] );
		$this->assertSame( '12', $found['stamp'][ OfferAttribution::DISCOUNT_VALUE ] );
		$this->assertCount( 1, OrderBump::get_checkout_offers() );
	}

	/**
	 * Offer prices stay within bounds whatever is stored.
	 *
	 * @return void
	 */
	public function test_offer_price_is_bounded() {
		$this->assertSame( 0.0, OrderBump::calculate_offer_price( 'discount', 50, 150 ), 'over 100% is 100%' );
		$this->assertSame( 50.0, OrderBump::calculate_offer_price( 'discount', 50, -10 ), 'a negative discount is none' );
		$this->assertSame( 0.0, OrderBump::calculate_offer_price( 'price', 50, -3 ) );
		$this->assertSame( 7.5, OrderBump::calculate_offer_price( 'price', 50, 7.5 ) );
		$this->assertSame( 0.0, OrderBump::calculate_offer_price( 'free', 50, 9 ) );
		$this->assertSame( 45.0, OrderBump::calculate_offer_price( 'discount', 50, 10 ) );
	}

	/**
	 * The struck price is the regular price; the discount comes off the
	 * active price (a sale that hasn't started isn't used).
	 *
	 * @return void
	 */
	public function test_prices_use_the_regular_and_the_active_price() {
		$on_sale = $this->create_product( 100 );
		$on_sale->set_sale_price( '80' );
		$on_sale->save();

		$this->assertSame( 100.0, OrderBump::get_regular_price( $on_sale ) );
		$this->assertSame( 72.0, OrderBump::calculate_offer_price( 'discount', OrderBump::get_current_price( $on_sale ), 10 ) );

		$scheduled = $this->create_product( 100 );
		$scheduled->set_sale_price( '80' );
		$scheduled->set_date_on_sale_from( gmdate( 'Y-m-d', strtotime( '+1 week' ) ) );
		$scheduled->save();

		$this->assertSame( 90.0, OrderBump::calculate_offer_price( 'discount', OrderBump::get_current_price( wc_get_product( $scheduled->get_id() ) ), 10 ) );
	}

	/**
	 * The offer strip: a fixed price reads "2.00$ Just Only" (it read
	 * "2.00.00$ Just Only"), a discount "10% off", free "Free".
	 *
	 * @return void
	 */
	public function test_offer_label() {
		$design = [
			'offer_discount_title'    => '% off',
			'offer_fixed_price_title' => '$ Just Only',
		];

		$this->assertSame( '2.00$ Just Only', OrderBump::get_offer_label( 'price', '2.00', $design ) );
		$this->assertSame( '10% off', OrderBump::get_offer_label( 'discount', '10.00', $design ) );
		$this->assertSame( '12.5% off', OrderBump::get_offer_label( 'discount', '12.50', $design ) );
		$this->assertSame( 'Free', OrderBump::get_offer_label( 'free', '0.00', $design ) );
	}

	/**
	 * The classic checkout box prints the label, `wc_price()` prices and the
	 * design sanitized, whatever the row holds.
	 *
	 * @return void
	 */
	public function test_classic_box_output() {
		global $wpdb;

		$target = $this->create_product();
		$offer  = $this->create_product( 20 );
		$id     = $this->create_bump(
			[
				'target_products'  => [ $target->get_id() ],
				'offer_product_id' => $offer->get_id(),
				'offer_type'       => 'price',
				'offer_amount'     => 2,
			]
		);

		// A row stored before sanitizing, with the 2.x admin's encoding.
		$wpdb->update( // phpcs:ignore WordPress.DB
			$wpdb->prefix . 'spsg_order_bumps',
			[
				'design_settings' => wp_json_encode(
					[
						'box_border_color'        => 'red;background:url(https://evil.test/x)',
						'offer_fixed_price_title' => '&#36;&#32;Just&#32;Only',
						'offer_product_title'     => '<img src=x onerror=alert(1)>',
					]
				),
			],
			[ 'id' => $id ]
		);

		WC()->cart->add_to_cart( $target->get_id() );

		ob_start();
		( new OrderBump() )->bump_product_frontend_view();
		$html = ob_get_clean();

		$this->assertStringContainsString( '2.00$ Just Only', $html );
		$this->assertStringNotContainsString( '2.00.00', $html );
		$this->assertStringContainsString( wc_price( 20 ), $html );
		$this->assertStringContainsString( wc_price( 2 ), $html );
		$this->assertStringNotContainsString( 'evil.test', $html );
		$this->assertStringNotContainsString( '<img src=x', $html );
		$this->assertStringContainsString( 'bump-preview.svg', $html, 'no image: the fallback' );
	}

	/**
	 * The block gets the same offer, a variation as its parent plus its own
	 * id, the prices from `wc_price()`, and a fallback image in its design.
	 *
	 * @return void
	 */
	public function test_block_data_matches_the_classic_box() {
		$target    = $this->create_product();
		$variation = $this->create_variation( 40 );
		$this->create_bump(
			[
				'target_products'  => [ $target->get_id() ],
				'offer_product_id' => $variation->get_id(),
				'offer_amount'     => 25,
			]
		);

		WC()->cart->add_to_cart( $target->get_id() );

		$data = ( new OrderBumpCheckoutIntegration() )->get_script_data();
		$this->assertCount( 1, $data );
		$this->assertSame( $variation->get_parent_id(), $data[0]['offer_product_id'] );
		$this->assertSame( $variation->get_id(), $data[0]['variation_id'] );
		$this->assertSame( wc_price( 30 ), $data[0]['offer_price_html'] );
		$this->assertSame( wc_price( 40 ), $data[0]['regular_price_html'] );
		$this->assertSame( '25% off only for you!', $data[0]['offer_label'] );
		$this->assertStringContainsString( 'bump-preview.svg', $data[0]['design_settings']['fallback_image_url'] );
	}
}
