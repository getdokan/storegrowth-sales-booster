<?php
/**
 * Tests for the deal referee (ADR-014), with the epic's test catalogue.
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Test\Pricing;

use StorePulse\StoreGrowth\Analytics\Schema;
use StorePulse\StoreGrowth\Modules\BoGo\BogoDataManager;
use StorePulse\StoreGrowth\Modules\BoGo\OrderBogo;
use StorePulse\StoreGrowth\Modules\CountdownTimer\CommonHooks;
use StorePulse\StoreGrowth\Modules\UpsellOrderBump\Database\OrderBumpData;
use StorePulse\StoreGrowth\Modules\UpsellOrderBump\OrderBump;
use StorePulse\StoreGrowth\Modules\UpsellOrderBump\OrderBumpAjax;
use StorePulse\StoreGrowth\Offers\OfferLimits;
use StorePulse\StoreGrowth\Offers\OfferVersions;
use StorePulse\StoreGrowth\Pricing\CouponGate;
use StorePulse\StoreGrowth\Pricing\Referee;
use StorePulse\StoreGrowth\Test\StoreGrowthTestCase;
use WC_Coupon;

/**
 * Each deal applies exactly where the rules allow, and the cart explains it.
 */
class RefereeTest extends StoreGrowthTestCase {

	/**
	 * Hooks a test run installs and removes again.
	 */
	const HOOKS = [
		'woocommerce_before_calculate_totals',
		'woocommerce_coupon_is_valid',
		'woocommerce_coupon_get_items_to_apply',
		'woocommerce_coupon_validate_minimum_amount',
		'woocommerce_coupon_error',
		'woocommerce_get_item_data',
		'woocommerce_product_get_price',
		'woocommerce_product_is_on_sale',
		'spsg_cart_deals',
		'spsg_referee_decided',
		'spsg_referee_ignores_coupon',
		'spsg_referee_observe_only',
		'storegrowth_pro_is_active',
		'woocommerce_price_trim_zeros',
		'woocommerce_logger_log_message',
		'spsg_running_campaign_offers',
		'spsg_offer_campaign_row',
	];

	/**
	 * Run the referee, gate and module hooks on an empty cart.
	 *
	 * @return void
	 */
	public function setUp(): void {
		parent::setUp();

		global $wpdb;

		foreach ( [ 'spsg_order_bumps', Schema::DAILY ] as $table ) {
			$wpdb->query( "TRUNCATE TABLE {$wpdb->prefix}{$table}" ); // phpcs:ignore WordPress.DB
		}

		OfferLimits::flush();
		Referee::flush();

		foreach ( self::HOOKS as $hook ) {
			remove_all_filters( $hook );
		}

		add_filter( 'storegrowth_pro_is_active', '__return_true' );
		add_filter( 'woocommerce_price_trim_zeros', '__return_true' );
		update_option( 'woocommerce_currency', 'USD' );

		$this->register_price_hooks();
		$this->register_referee();

		WC()->cart->empty_cart();
		wc_clear_notices();
	}

	/**
	 * Leave no hooks or cart behind.
	 *
	 * @return void
	 */
	public function tearDown(): void {
		WC()->cart->empty_cart();

		foreach ( self::HOOKS as $hook ) {
			remove_all_filters( $hook );
		}

		wc_clear_notices();
		Referee::flush();

		parent::tearDown();
	}

	/**
	 * The hooks modules use to price lines and report deals.
	 *
	 * @return void
	 */
	private function register_price_hooks(): void {
		$countdown = new CommonHooks();
		$bump      = new OrderBump();

		add_filter( 'woocommerce_product_get_price', [ $countdown, 'get_product_price' ], 10, 2 );
		add_filter( 'woocommerce_product_is_on_sale', [ $countdown, 'woocommerce_product_is_on_sale' ], 10, 2 );
		add_filter( 'spsg_cart_deals', [ $countdown, 'report_cart_deals' ], 10, 2 );
		add_action( 'woocommerce_before_calculate_totals', [ OrderBogo::instance(), 'woocommerce_custom_price_to_cart_item' ] );
		add_action( 'woocommerce_before_calculate_totals', [ $bump, 'woocommerce_custom_price_to_cart_item' ] );
		add_filter( 'spsg_cart_deals', [ OrderBogo::instance(), 'report_cart_deals' ], 10, 2 );
		add_filter( 'spsg_cart_deals', [ $bump, 'report_cart_deals' ], 10, 2 );
		add_action( 'spsg_referee_decided', [ OrderBogo::instance(), 'apply_referee_decision' ], 10, 2 );
	}

	/**
	 * The referee's own hooks.
	 *
	 * @return void
	 */
	private function register_referee(): void {
		( new Referee() )->register_hooks();
		( new CouponGate() )->register_hooks();
	}

	/**
	 * A catalogue product with an optional active Countdown.
	 *
	 * @param float $price    Price.
	 * @param int   $discount Countdown percent; 0 for none.
	 *
	 * @return \WC_Product_Simple
	 */
	private function product( float $price, int $discount = 0 ): \WC_Product_Simple {
		$product = $this->create_product( $price );

		if ( $discount ) {
			update_post_meta( $product->get_id(), '_spsg_countdown_timer_discount_amount', $discount );
			update_post_meta( $product->get_id(), '_spsg_countdown_timer_discount_start', gmdate( 'Y-m-d', strtotime( '-2 days' ) ) );
			update_post_meta( $product->get_id(), '_spsg_countdown_timer_discount_end', gmdate( 'Y-m-d', strtotime( '+2 days' ) ) );
		}

		return $product;
	}

	/**
	 * The catalogue's BOGO: buying two boots earns one free.
	 *
	 * @param \WC_Product $boots Boots.
	 *
	 * @return int Offer id.
	 */
	private function boots_bogo( $boots ): int {
		return $this->create_global_offer(
			[
				'name_of_order_bogo'        => 'Buy 2 boots get 1 free',
				'bogo_deal_type'            => 'same',
				'offered_products'          => [ $boots->get_id() ],
				'minimum_quantity_required' => 2,
			]
		);
	}

	/**
	 * Add a product and its gift, as the Pro add path does.
	 *
	 * @param \WC_Product $product  Bought product.
	 * @param int         $offer_id Offer id.
	 * @param int         $quantity Quantity.
	 * @param int         $gifts    Gifts to add.
	 *
	 * @return string The bought line's key.
	 */
	private function add_with_gift( $product, int $offer_id, int $quantity, int $gifts = 1 ): string {
		$key = WC()->cart->add_to_cart( $product->get_id(), $quantity );

		OrderBogo::instance()->apply_bogo_product( BogoDataManager::get_bogo_offer( $offer_id ), $product->get_id(), $key, $gifts );

		return $key;
	}

	/**
	 * The gift line keys of the cart.
	 *
	 * @return string[]
	 */
	private function gift_keys(): array {
		$keys = [];

		foreach ( WC()->cart->get_cart() as $key => $item ) {
			if ( ! empty( $item['bogo_offer'] ) ) {
				$keys[] = $key;
			}
		}

		return $keys;
	}

	/**
	 * A cart line's labels, by item data key.
	 *
	 * @param string $key Cart item key.
	 *
	 * @return array<string, string>
	 */
	private function labels( string $key ): array {
		$labels = [];

		/**
		 * WooCommerce's cart line data, as `wc_get_formatted_cart_item_data()` runs it.
		 *
		 * @since 2.1.0
		 *
		 * @param array $item_data Item data.
		 * @param array $cart_item Cart item.
		 */
		$item_data = apply_filters( 'woocommerce_get_item_data', [], WC()->cart->get_cart_item( $key ) );

		foreach ( $item_data as $data ) {
			$labels[ $data['key'] ] = $data['value'];
		}

		return $labels;
	}

	/**
	 * Every line's total, by key.
	 *
	 * @return array<string, float>
	 */
	private function line_totals(): array {
		WC()->cart->calculate_totals();

		$totals = [];

		foreach ( WC()->cart->get_cart() as $key => $item ) {
			$totals[ $key ] = (float) $item['line_total'];
		}

		return $totals;
	}

	/**
	 * A plain WooCommerce coupon.
	 *
	 * @param string $code   Code.
	 * @param string $type   Discount type.
	 * @param float  $amount Amount.
	 *
	 * @return WC_Coupon
	 */
	private function plain_coupon( string $code, string $type, float $amount ): WC_Coupon {
		$coupon = new WC_Coupon();
		$coupon->set_code( $code );
		$coupon->set_discount_type( $type );
		$coupon->set_amount( (string) $amount );
		$coupon->save();

		return $coupon;
	}

	/**
	 * The BOGO `add_to_cart` count for an offer today.
	 *
	 * @param int $offer_id Offer id.
	 *
	 * @return int
	 */
	private function gift_count( int $offer_id ): int {
		global $wpdb;

		return (int) $wpdb->get_var( $wpdb->prepare( "SELECT SUM(count) FROM {$wpdb->prefix}" . Schema::DAILY . " WHERE metric = 'add_to_cart' AND object_id = %d", $offer_id ) ); // phpcs:ignore WordPress.DB
	}

	/**
	 * Scenario 1: the $95 free boot beats 30% off two boots, and the coupon
	 * never reaches the cart.
	 *
	 * @return void
	 */
	public function test_bogo_beats_the_coupon_on_the_bought_line(): void {
		$boots = $this->product( 95 );
		$offer = $this->boots_bogo( $boots );

		$this->create_smart_coupon(
			'outerwear',
			[
				'amount'      => 30,
				'method'      => 'automatic',
				'title'       => '30% off Outerwear',
				'product_ids' => [ $boots->get_id() ],
			]
		);

		$key    = $this->add_with_gift( $boots, $offer, 2 );
		$totals = $this->line_totals();

		$this->assertSame( 190.0, $totals[ $key ] );
		$this->assertSame( 0.0, $totals[ $this->gift_keys()[0] ] );
		$this->assertSame( [], WC()->cart->get_applied_coupons() );
		$this->assertSame( 'Larger deal applied: Buy 2 boots get 1 free', $this->labels( $key )['Deal'] );
		$this->assertArrayNotHasKey( 'Price', $this->labels( $key ) );
		$this->assertEmpty( wc_get_notices() );
	}

	/**
	 * Scenario 2: the jacket takes 30% off its Countdown price, combined.
	 *
	 * @return void
	 */
	public function test_coupon_combines_with_a_countdown_price(): void {
		$boots  = $this->product( 95 );
		$jacket = $this->product( 120, 10 );
		$offer  = $this->boots_bogo( $boots );

		$this->create_smart_coupon(
			'outerwear',
			[
				'amount'      => 30,
				'method'      => 'automatic',
				'title'       => '30% off Outerwear',
				'product_ids' => [ $boots->get_id(), $jacket->get_id() ],
			]
		);

		$this->add_with_gift( $boots, $offer, 2 );
		$key    = WC()->cart->add_to_cart( $jacket->get_id() );
		$totals = $this->line_totals();

		$this->assertSame( 75.6, round( $totals[ $key ], 2 ) );
		$this->assertSame( 'Deals combined', $this->labels( $key )['Deal'] );
		$this->assertSame( '$120 → $108 Countdown 10% → $75.60 30% off Outerwear', $this->labels( $key )['Price'] );
	}

	/**
	 * Scenario 3: the bump comes off the Countdown price and never competes.
	 *
	 * @return void
	 */
	public function test_bump_stacks_on_a_countdown_price(): void {
		$jacket = $this->product( 120, 10 );
		$gloves = $this->product( 40, 20 );

		( new OrderBumpData() )->create(
			[
				'name'             => 'Add Leather Gloves',
				'target_products'  => [ $jacket->get_id() ],
				'offer_product_id' => $gloves->get_id(),
				'offer_type'       => 'discount',
				'offer_amount'     => 25,
			]
		);

		$this->create_smart_coupon(
			'outerwear',
			[
				'amount'      => 30,
				'method'      => 'automatic',
				'title'       => '30% off Outerwear',
				'product_ids' => [ $jacket->get_id() ],
			]
		);

		WC()->cart->add_to_cart( $jacket->get_id() );

		$ajax   = new OrderBumpAjax();
		$key    = $ajax->add_offer_to_cart( $ajax->find_offer( $gloves->get_id() ) );
		$totals = $this->line_totals();

		$this->assertSame( 24.0, $totals[ $key ] );
		$this->assertSame( 'Deals combined', $this->labels( $key )['Deal'] );
		$this->assertSame( '$40 → $32 Countdown 20% → $24 bump', $this->labels( $key )['Price'] );
	}

	/**
	 * Scenario 4: SAVE30's share of the boots moves to the jacket, and
	 * removing the jacket removes the coupon with the shopper's message.
	 *
	 * @return void
	 */
	public function test_fixed_cart_share_moves_to_the_lines_it_still_applies_to(): void {
		$boots  = $this->product( 95 );
		$jacket = $this->product( 120, 10 );
		$offer  = $this->boots_bogo( $boots );

		$this->create_smart_coupon(
			'save30',
			[
				'type'   => 'fixed_cart',
				'amount' => 30,
			]
		);

		$boots_key  = $this->add_with_gift( $boots, $offer, 2 );
		$jacket_key = WC()->cart->add_to_cart( $jacket->get_id() );

		$this->assertTrue( WC()->cart->apply_coupon( 'save30' ) );

		$totals = $this->line_totals();

		$this->assertSame( 190.0, $totals[ $boots_key ] );
		$this->assertSame( 78.0, $totals[ $jacket_key ] );
		$this->assertSame( 'Larger deal applied: Buy 2 boots get 1 free', $this->labels( $boots_key )['Deal'] );
		$this->assertSame( 'Deals combined', $this->labels( $jacket_key )['Deal'] );
		$this->assertSame( '$120 → $108 Countdown 10% → $78 SAVE30', $this->labels( $jacket_key )['Price'] );

		WC()->cart->remove_cart_item( $jacket_key );
		WC()->cart->check_cart_coupons();

		$this->assertSame( [], WC()->cart->get_applied_coupons() );
		$this->assertTrue( wc_has_notice( esc_html( "SAVE30 wasn't applied because Buy 2 boots get 1 free saves you more." ), 'error' ) );
	}

	/**
	 * A code that loses on every line is rejected as it is entered.
	 *
	 * @return void
	 */
	public function test_losing_code_is_rejected_when_entered(): void {
		$boots = $this->product( 95 );
		$offer = $this->boots_bogo( $boots );

		$this->create_smart_coupon(
			'save30',
			[
				'type'   => 'fixed_cart',
				'amount' => 30,
			]
		);

		$this->add_with_gift( $boots, $offer, 2 );

		$this->assertFalse( WC()->cart->apply_coupon( 'save30' ) );
		$this->assertTrue( wc_has_notice( esc_html( "SAVE30 wasn't applied because Buy 2 boots get 1 free saves you more." ), 'error' ) );
		$this->assertSame( [], WC()->cart->get_applied_coupons() );
	}

	/**
	 * Scenario 5: without a Smart Coupon or campaign, totals and labels are
	 * exactly what they are without the referee.
	 *
	 * @return void
	 */
	public function test_a_cart_without_a_qualifying_deal_is_untouched(): void {
		$trigger = $this->product( 100, 10 );
		$gift    = $this->product( 40 );
		$target  = $this->product( 50 );
		$offer   = $this->create_global_offer(
			[
				'name_of_order_bogo'          => 'Buy one get a gift',
				'offered_products'            => [ $trigger->get_id() ],
				'get_different_product_field' => $gift->get_id(),
				'offer_product_id'            => $gift->get_id(),
			]
		);

		( new OrderBumpData() )->create(
			[
				'name'             => 'Bump',
				'target_products'  => [ $target->get_id() ],
				'offer_product_id' => $gift->get_id(),
				'offer_type'       => 'discount',
				'offer_amount'     => 10,
			]
		);

		$this->plain_coupon( 'plain', 'percent', 10 );

		$key = $this->add_with_gift( $trigger, $offer, 1 );
		WC()->cart->add_to_cart( $target->get_id() );
		WC()->cart->apply_coupon( 'plain' );

		$with_referee = $this->line_totals();
		$labels       = $this->labels( $key );
		$total        = WC()->cart->get_total( 'edit' );

		remove_all_filters( 'woocommerce_coupon_is_valid' );
		remove_all_filters( 'woocommerce_coupon_get_items_to_apply' );
		remove_all_filters( 'woocommerce_coupon_validate_minimum_amount' );
		remove_all_filters( 'woocommerce_coupon_error' );
		remove_all_filters( 'woocommerce_get_item_data' );
		remove_all_filters( 'spsg_referee_decided' );

		$this->assertSame( $with_referee, $this->line_totals() );
		$this->assertSame( $total, WC()->cart->get_total( 'edit' ) );
		$this->assertSame( [], $labels );
	}

	/**
	 * A running campaign's deal makes the referee act without a Smart Coupon.
	 * The campaign comes through StoreGrowth's campaign filters, as Pro
	 * supplies it.
	 *
	 * @return void
	 */
	public function test_a_running_campaign_labels_a_line_with_two_deals(): void {
		$boots = $this->product( 95, 10 );
		$offer = $this->boots_bogo( $boots );

		add_filter(
			'spsg_running_campaign_offers',
			static function ( $rows, string $kind ) use ( $offer ) {
				return OfferVersions::BOGO === $kind
					? [
						[
							'id'           => 1,
							'promotion_id' => 9,
							'offer_id'     => $offer,
							'values'       => [],
							'overrides'    => [],
						],
					]
					: $rows;
			},
			10,
			2
		);
		add_filter(
			'spsg_offer_campaign_row',
			static function ( $row, string $kind, int $offer_id ) use ( $offer ) {
				return OfferVersions::BOGO === $kind && $offer === $offer_id
					? [
						'promotion_id' => 9,
						'overrides'    => [],
					]
					: $row;
			},
			10,
			3
		);

		$key = $this->add_with_gift( $boots, $offer, 2 );
		$this->line_totals();

		$this->assertSame( 'Deals combined', $this->labels( $key )['Deal'] );
	}

	/**
	 * A coupon that beats the BOGO takes the gift out; it returns when the
	 * coupon goes, and neither move counts a new gift.
	 *
	 * @return void
	 */
	public function test_gift_leaves_and_returns_without_inflating_the_counter(): void {
		$boots = $this->product( 95 );
		$offer = $this->boots_bogo( $boots );

		$this->create_smart_coupon(
			'big60',
			[
				'amount' => 60,
				'title'  => 'Big 60',
			]
		);

		$key = $this->add_with_gift( $boots, $offer, 2 );
		$this->assertSame( 1, $this->gift_count( $offer ) );

		$this->assertTrue( WC()->cart->apply_coupon( 'big60' ) );
		$this->line_totals();

		$this->assertCount( 0, $this->gift_keys() );
		$this->assertSame( 76.0, $this->line_totals()[ $key ] );
		$this->assertSame( 'Larger deal applied: Big 60', $this->labels( $key )['Deal'] );

		// A gift added back by another path (Pro 3.0) leaves on the next run.
		OrderBogo::instance()->apply_bogo_product( BogoDataManager::get_bogo_offer( $offer ), $boots->get_id(), $key, 1 );
		WC()->cart->add_to_cart(
			$boots->get_id(),
			1,
			0,
			[],
			[
				'bogo_offer'            => true,
				'parent_key'            => $key,
				'bogo_product_for'      => $boots->get_id(),
				'linked_to_product_key' => $key,
			]
		);
		$this->assertCount( 0, $this->gift_keys() );

		$this->assertTrue( WC()->cart->remove_coupon( 'big60' ) );
		WC()->cart->calculate_totals();
		WC()->cart->calculate_totals();
		WC()->cart->calculate_totals();

		$gifts = $this->gift_keys();

		$this->assertCount( 1, $gifts );
		$this->assertSame( 0.0, $this->line_totals()[ $gifts[0] ] );
		$this->assertSame( $gifts[0], WC()->cart->get_cart_item( $key )['child_key'] );
		$this->assertSame( 1, $this->gift_count( $offer ) );
	}

	/**
	 * A gift that arrives first because a coupon left is new, and counts once.
	 *
	 * @return void
	 */
	public function test_first_gift_after_a_coupon_counts_once(): void {
		$boots = $this->product( 95 );
		$offer = $this->boots_bogo( $boots );

		$this->create_smart_coupon( 'big60', [ 'amount' => 60 ] );

		$key = WC()->cart->add_to_cart( $boots->get_id(), 2 );
		$this->assertTrue( WC()->cart->apply_coupon( 'big60' ) );
		OrderBogo::instance()->apply_bogo_product( BogoDataManager::get_bogo_offer( $offer ), $boots->get_id(), $key, 1 );

		$this->assertCount( 0, $this->gift_keys() );

		WC()->cart->remove_coupon( 'big60' );

		$this->assertCount( 1, $this->gift_keys() );
		$this->assertSame( 1, $this->gift_count( $offer ) );
	}

	/**
	 * Repeated calculations leave a decided cart as it is.
	 *
	 * @return void
	 */
	public function test_repeated_totals_keep_the_same_result(): void {
		$boots  = $this->product( 95 );
		$jacket = $this->product( 120, 10 );
		$offer  = $this->boots_bogo( $boots );

		$this->create_smart_coupon(
			'save30',
			[
				'type'   => 'fixed_cart',
				'amount' => 30,
			]
		);

		$boots_key  = $this->add_with_gift( $boots, $offer, 2 );
		$jacket_key = WC()->cart->add_to_cart( $jacket->get_id() );
		WC()->cart->apply_coupon( 'save30' );

		$first = $this->line_totals();
		$this->assertSame( $first, $this->line_totals() );
		$this->assertSame( $first, $this->line_totals() );
		$this->assertCount( 1, $this->gift_keys() );
		$this->assertSame( 78.0, $first[ $jacket_key ] );
		$this->assertSame( 1, $this->gift_count( $offer ) );
		$this->assertSame( 'Larger deal applied: Buy 2 boots get 1 free', $this->labels( $boots_key )['Deal'] );
	}

	/**
	 * Dokan's rejection of a fixed-cart coupon on a 2+ vendor cart stands,
	 * with its own message, and runs before the referee's.
	 *
	 * @return void
	 */
	public function test_dokan_rejection_of_a_fixed_cart_coupon_stands(): void {
		$jacket = $this->product( 100 );

		$this->create_smart_coupon(
			'save30',
			[
				'type'   => 'fixed_cart',
				'amount' => 30,
			]
		);

		add_filter(
			'woocommerce_coupon_is_valid',
			static function () {
				throw new \Exception( 'This coupon is invalid for multiple vendors.' );
			},
			10
		);

		WC()->cart->add_to_cart( $jacket->get_id() );

		$this->assertFalse( WC()->cart->apply_coupon( 'save30' ) );
		$this->assertTrue( wc_has_notice( 'This coupon is invalid for multiple vendors.', 'error' ) );
	}

	/**
	 * A gift of a gift can't stay in the cart.
	 *
	 * @return void
	 */
	public function test_a_gift_linked_to_a_gift_is_removed(): void {
		$boots = $this->product( 95 );
		$offer = $this->boots_bogo( $boots );

		$this->add_with_gift( $boots, $offer, 2 );
		$first_gift = $this->gift_keys()[0];

		WC()->cart->add_to_cart(
			$boots->get_id(),
			1,
			0,
			[],
			[
				'bogo_offer'            => true,
				'parent_key'            => $first_gift,
				'bogo_product_for'      => $boots->get_id(),
				'linked_to_product_key' => $first_gift,
			]
		);

		WC()->cart->calculate_totals();

		$this->assertCount( 1, $this->gift_keys() );
	}

	/**
	 * A coupon that can combine stacks with the BOGO deal.
	 *
	 * @return void
	 */
	public function test_a_combining_coupon_stacks_with_bogo(): void {
		$boots = $this->product( 95 );
		$offer = $this->boots_bogo( $boots );

		$this->create_smart_coupon(
			'stack10',
			[
				'amount'   => 10,
				'combines' => true,
			]
		);

		$key = $this->add_with_gift( $boots, $offer, 2 );
		WC()->cart->apply_coupon( 'stack10' );

		$this->assertCount( 1, $this->gift_keys() );
		$this->assertSame( 171.0, $this->line_totals()[ $key ] );
		$this->assertSame( 'Deals combined', $this->labels( $key )['Deal'] );
	}

	/**
	 * Entering a smaller code after a larger one keeps the larger.
	 *
	 * @return void
	 */
	public function test_two_coupons_keep_the_larger(): void {
		$jacket = $this->product( 120 );

		$this->create_smart_coupon( 'large', [ 'amount' => 30 ] );
		$this->create_smart_coupon( 'small', [ 'amount' => 10 ] );

		$key = WC()->cart->add_to_cart( $jacket->get_id() );

		$this->assertTrue( WC()->cart->apply_coupon( 'large' ) );
		$this->assertFalse( WC()->cart->apply_coupon( 'small' ) );
		$this->assertTrue( wc_has_notice( esc_html( 'Only one of these coupons can be used. We kept LARGE, which saves you more.' ), 'error' ) );
		$this->assertSame( [ 'large' ], WC()->cart->get_applied_coupons() );
		$this->assertSame( 84.0, $this->line_totals()[ $key ] );
	}

	/**
	 * Entering a larger code after a smaller one replaces it, at the check
	 * WooCommerce runs on every cart and checkout view.
	 *
	 * @return void
	 */
	public function test_a_larger_code_replaces_a_smaller_one(): void {
		$jacket = $this->product( 120 );

		$this->create_smart_coupon( 'small', [ 'amount' => 10 ] );
		$this->create_smart_coupon( 'large', [ 'amount' => 30 ] );

		$key = WC()->cart->add_to_cart( $jacket->get_id() );

		$this->assertTrue( WC()->cart->apply_coupon( 'small' ) );
		$this->assertTrue( WC()->cart->apply_coupon( 'large' ) );

		WC()->cart->check_cart_coupons();

		$this->assertSame( [ 'large' ], array_values( WC()->cart->get_applied_coupons() ) );
		$this->assertSame( 84.0, $this->line_totals()[ $key ] );
	}

	/**
	 * Rule 8: an outside coupon competes unless the Smart Coupon allows it,
	 * and stacks when it does.
	 *
	 * @return void
	 */
	public function test_outside_coupon_stacks_only_when_allowed(): void {
		$jacket = $this->product( 100 );

		$this->create_smart_coupon( 'closed', [ 'amount' => 20 ] );
		$this->create_smart_coupon(
			'open',
			[
				'amount'       => 20,
				'allow_others' => true,
			]
		);
		$this->plain_coupon( 'outside', 'percent', 10 );

		$key = WC()->cart->add_to_cart( $jacket->get_id() );

		WC()->cart->apply_coupon( 'closed' );
		$this->assertFalse( WC()->cart->apply_coupon( 'outside' ) );
		$this->assertSame( 80.0, $this->line_totals()[ $key ] );

		WC()->cart->remove_coupon( 'closed' );
		wc_clear_notices();
		$this->assertTrue( WC()->cart->apply_coupon( 'open' ) );
		$this->assertTrue( WC()->cart->apply_coupon( 'outside' ) );
		$this->assertSame( 70.0, $this->line_totals()[ $key ] );
	}

	/**
	 * A plain coupon with Individual use keeps automatic coupons out.
	 *
	 * @return void
	 */
	public function test_individual_use_keeps_automatic_coupons_out(): void {
		$jacket = $this->product( 100 );

		$this->create_smart_coupon(
			'auto20',
			[
				'amount' => 20,
				'method' => 'automatic',
			]
		);

		$plain = $this->plain_coupon( 'solo', 'percent', 10 );
		$plain->set_individual_use( true );
		$plain->save();

		$key = WC()->cart->add_to_cart( $jacket->get_id() );

		$this->assertTrue( WC()->cart->apply_coupon( 'solo' ) );
		$this->assertSame( 90.0, $this->line_totals()[ $key ] );
		$this->assertSame( [ 'solo' ], array_values( WC()->cart->get_applied_coupons() ) );
	}

	/**
	 * An automatic coupon is applied silently, and leaves silently.
	 *
	 * @return void
	 */
	public function test_automatic_coupon_comes_and_goes_without_a_notice(): void {
		$jacket = $this->product( 100 );
		$boots  = $this->product( 95 );

		$this->create_smart_coupon(
			'auto20',
			[
				'amount'      => 20,
				'method'      => 'automatic',
				'product_ids' => [ $jacket->get_id() ],
			]
		);

		$boots_key = WC()->cart->add_to_cart( $boots->get_id() );
		$this->line_totals();
		$this->assertSame( [], WC()->cart->get_applied_coupons() );

		$key = WC()->cart->add_to_cart( $jacket->get_id() );
		$this->assertSame( 80.0, $this->line_totals()[ $key ] );
		$this->assertSame( [ 'auto20' ], array_values( WC()->cart->get_applied_coupons() ) );

		$removed = did_action( 'woocommerce_removed_coupon' );

		WC()->cart->remove_cart_item( $key );
		$this->assertSame( 95.0, $this->line_totals()[ $boots_key ] );
		$this->assertSame( [], WC()->cart->get_applied_coupons() );
		$this->assertEmpty( wc_get_notices() );
		$this->assertSame( $removed + 1, did_action( 'woocommerce_removed_coupon' ), 'Dokan clears a coupon\'s line data on this action.' );
	}

	/**
	 * A coupon the referee is told to ignore stacks with a coupon that
	 * doesn't combine, instead of losing to it on every cart load.
	 *
	 * @return void
	 */
	public function test_an_ignored_coupon_stacks_with_a_coupon_that_does_not_combine(): void {
		$jacket = $this->product( 100 );

		$this->create_smart_coupon( 'big20', [ 'amount' => 20 ] );
		$this->plain_coupon( 'vendor10', 'percent', 10 );

		add_filter(
			'spsg_referee_ignores_coupon',
			static function ( $ignored, $coupon ) {
				return 'vendor10' === $coupon->get_code();
			},
			10,
			2
		);

		$key = WC()->cart->add_to_cart( $jacket->get_id() );

		$this->assertTrue( WC()->cart->apply_coupon( 'big20' ) );
		$this->assertTrue( WC()->cart->apply_coupon( 'vendor10' ) );
		$this->assertSame( 70.0, $this->line_totals()[ $key ] );
		$this->assertSame( [ 'big20', 'vendor10' ], array_values( WC()->cart->get_applied_coupons() ) );
	}

	/**
	 * Gift lines don't help a Smart Coupon reach its minimum spend.
	 *
	 * @return void
	 */
	public function test_gift_lines_do_not_count_towards_minimum_spend(): void {
		$trigger = $this->product( 40 );
		$gift    = $this->product( 40 );
		$offer   = $this->create_global_offer(
			[
				'name_of_order_bogo'          => 'Half price gift',
				'offer_type'                  => 'discount',
				'discount_amount'             => 50,
				'offered_products'            => [ $trigger->get_id() ],
				'get_different_product_field' => $gift->get_id(),
				'offer_product_id'            => $gift->get_id(),
			]
		);

		$this->create_smart_coupon(
			'minimum',
			[
				'type'           => 'percent',
				'amount'         => 5,
				'minimum_amount' => 50,
				'combines'       => true,
			]
		);

		$key = $this->add_with_gift( $trigger, $offer, 1 );
		WC()->cart->calculate_totals();

		$this->assertFalse( WC()->cart->apply_coupon( 'minimum' ) );
		$this->assertSame( 40.0, $this->line_totals()[ $key ] );
	}

	/**
	 * A Smart Coupon's share leaves discounted gifts alone, so a gift's
	 * price can't move the coupon that decides whether it exists.
	 *
	 * @return void
	 */
	public function test_smart_coupon_skips_discounted_gift_lines(): void {
		$trigger = $this->product( 100 );
		$gift    = $this->product( 40 );
		$offer   = $this->create_global_offer(
			[
				'name_of_order_bogo'          => 'Half price gift',
				'offer_type'                  => 'discount',
				'discount_amount'             => 50,
				'offered_products'            => [ $trigger->get_id() ],
				'get_different_product_field' => $gift->get_id(),
				'offer_product_id'            => $gift->get_id(),
			]
		);

		$this->create_smart_coupon(
			'stack',
			[
				'amount'   => 10,
				'combines' => true,
			]
		);

		$key = $this->add_with_gift( $trigger, $offer, 1 );
		WC()->cart->apply_coupon( 'stack' );

		$totals = $this->line_totals();

		$this->assertSame( 90.0, $totals[ $key ] );
		$this->assertSame( 20.0, $totals[ $this->gift_keys()[0] ] );
	}

	/**
	 * The winner is the same for every tax setting: the gift is taxed and the
	 * bought line isn't, so a comparison of display amounts would differ.
	 *
	 * @return void
	 */
	public function test_winner_is_the_same_in_every_tax_setting(): void {
		update_option( 'woocommerce_calc_taxes', 'yes' );
		\WC_Tax::_insert_tax_rate(
			[
				'tax_rate_country'  => '',
				'tax_rate'          => '20.0000',
				'tax_rate_name'     => 'VAT',
				'tax_rate_priority' => 1,
				'tax_rate_order'    => 1,
				'tax_rate_class'    => '',
			]
		);

		$trigger = $this->product( 100 );
		$trigger->set_tax_class( 'zero-rate' );
		$trigger->save();

		$gift  = $this->product( 28 );
		$offer = $this->create_global_offer(
			[
				'name_of_order_bogo'          => 'Gift worth 28',
				'offered_products'            => [ $trigger->get_id() ],
				'get_different_product_field' => $gift->get_id(),
				'offer_product_id'            => $gift->get_id(),
			]
		);

		$coupon = $this->create_smart_coupon( 'thirty', [ 'amount' => 30 ] );
		$key    = $this->add_with_gift( $trigger, $offer, 1 );

		foreach ( [ 'yes', 'no' ] as $include_tax ) {
			foreach ( [ 'incl', 'excl' ] as $display ) {
				update_option( 'woocommerce_prices_include_tax', $include_tax );
				update_option( 'woocommerce_tax_display_cart', $display );
				Referee::flush();

				$this->assertTrue( Referee::for_cart( WC()->cart, $coupon )->coupon_won( $key ), "prices_include_tax={$include_tax}, display={$display}" );
			}
		}

		update_option( 'woocommerce_calc_taxes', 'no' );
	}

	/**
	 * Observe-only logs what the referee would do and changes nothing.
	 *
	 * @return void
	 */
	public function test_observe_only_logs_and_changes_nothing(): void {
		$boots = $this->product( 95 );
		$offer = $this->boots_bogo( $boots );

		$this->create_smart_coupon(
			'big60',
			[
				'amount' => 60,
				'title'  => 'Big 60',
			]
		);

		$logged = [];
		add_filter(
			'woocommerce_logger_log_message',
			static function ( $message, $level, $context ) use ( &$logged ) {
				if ( 'spsg-referee' === ( $context['source'] ?? '' ) ) {
					$logged[] = $message;
				}

				return $message;
			},
			10,
			3
		);

		add_filter( 'spsg_referee_observe_only', '__return_true' );

		$key = $this->add_with_gift( $boots, $offer, 2 );
		$this->assertTrue( WC()->cart->apply_coupon( 'big60' ) );

		$totals = $this->line_totals();
		$this->assertSame( 76.0, $totals[ $key ] );
		$this->assertSame( 0.0, $totals[ $this->gift_keys()[0] ] );
		$this->assertCount( 1, $this->gift_keys() );
		$this->assertSame( [], $this->labels( $key ) );
		$this->assertNotEmpty( $logged );
	}

	/**
	 * Labels are worked out for a cart whose totals never ran, as in cart
	 * fragments.
	 *
	 * @return void
	 */
	public function test_labels_need_no_totals_run(): void {
		$boots = $this->product( 95 );
		$offer = $this->boots_bogo( $boots );

		$this->create_smart_coupon(
			'outerwear',
			[
				'amount'      => 30,
				'method'      => 'automatic',
				'title'       => '30% off Outerwear',
				'product_ids' => [ $boots->get_id() ],
			]
		);

		$key = $this->add_with_gift( $boots, $offer, 2 );

		Referee::flush();
		WC()->cart->set_totals();

		$this->assertSame( 'Larger deal applied: Buy 2 boots get 1 free', $this->labels( $key )['Deal'] );
	}
}
