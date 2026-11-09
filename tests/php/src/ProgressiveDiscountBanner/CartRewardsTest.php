<?php
/**
 * Cart Rewards (#307): thresholds, rewards, migration and the Store API.
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Test\ProgressiveDiscountBanner;

use Automattic\WooCommerce\StoreApi\Exceptions\RouteException;
use Automattic\WooCommerce\StoreApi\Utilities\CartController;
use StorePulse\StoreGrowth\Modules\ProgressiveDiscountBanner\Helper;
use StorePulse\StoreGrowth\Modules\ProgressiveDiscountBanner\Milestones;
use StorePulse\StoreGrowth\Modules\ProgressiveDiscountBanner\ProgressiveDiscountBannerModule;
use StorePulse\StoreGrowth\Modules\ProgressiveDiscountBanner\RewardGifts;
use StorePulse\StoreGrowth\Modules\ProgressiveDiscountBanner\RewardsBar;
use StorePulse\StoreGrowth\Modules\ProgressiveDiscountBanner\Settings\ProgressiveDiscountBannerSettings;
use StorePulse\StoreGrowth\Modules\ProgressiveDiscountBanner\WoocommerceDiscount;
use StorePulse\StoreGrowth\Modules\SmartCoupons\CouponGuard;
use StorePulse\StoreGrowth\Offers\OfferLimits;
use StorePulse\StoreGrowth\Offers\OfferVersions;
use StorePulse\StoreGrowth\Pricing\CartLine;
use StorePulse\StoreGrowth\Pricing\CouponGate;
use StorePulse\StoreGrowth\Pricing\Referee;
use StorePulse\StoreGrowth\Pricing\SmartCoupon;
use StorePulse\StoreGrowth\Settings\SettingsService;
use StorePulse\StoreGrowth\StoreApi\CartExtension;
use StorePulse\StoreGrowth\Test\StoreGrowthTestCase;
use WC_Coupon;
use WC_Shipping_Zone;
use WC_Tax;
use WP_REST_Request;

/**
 * Each acceptance criterion PHPUnit can reach.
 *
 * @group cart-rewards
 */
class CartRewardsTest extends StoreGrowthTestCase {

	/**
	 * Module settings option.
	 */
	const OPTION = 'spsg_progressive_discount_banner_settings';

	/**
	 * Whether Pro is active for the test.
	 *
	 * @var bool
	 */
	private bool $pro = true;

	/**
	 * An empty cart and the module's hooks, as on a live store.
	 *
	 * @return void
	 */
	public function setUp(): void {
		parent::setUp();

		$this->pro = true;

		add_filter(
			'storegrowth_pro_is_active',
			function () {
				return $this->pro;
			}
		);

		wc_load_cart();
		WC()->cart->empty_cart();
		WC()->session->set( 'chosen_shipping_methods', null );
		WC()->session->set( 'wc_notices', null );
		WC()->session->set( 'shipping_for_package_0', null );
		OfferLimits::flush();
		Referee::flush();

		WoocommerceDiscount::instance()->register_hooks();
		( new RewardGifts() )->register_hooks();
		( new RewardsBar() )->register_hooks();

		delete_option( ProgressiveDiscountBannerSettings::BACKUP_OPTION );
	}

	/**
	 * Restore tax settings and the cart.
	 *
	 * @return void
	 */
	public function tearDown(): void {
		WC()->cart->empty_cart();
		update_option( 'woocommerce_calc_taxes', 'no' );
		update_option( 'woocommerce_prices_include_tax', 'no' );
		update_option( 'woocommerce_tax_display_cart', 'excl' );
		delete_option( self::OPTION );
		OfferLimits::flush();

		parent::tearDown();
	}

	/**
	 * Saved settings with these milestones.
	 *
	 * @param array[] $rows      Milestones.
	 * @param array   $overrides Other keys.
	 *
	 * @return void
	 */
	private function set_rewards( array $rows, array $overrides = [] ): void {
		update_option(
			self::OPTION,
			array_merge(
				[
					'discount_type'           => 'free-shipping',
					'cart_minimum_amount'     => '80',
					'progressive_banner_text' => 'Add {remaining} more for {reward}',
					'goal_completion_text'    => 'All rewards unlocked',
					'milestones'              => $rows,
				],
				$overrides
			)
		);
		OfferLimits::flush();
	}

	/**
	 * One milestone row.
	 *
	 * @param float  $threshold Threshold.
	 * @param string $reward    Reward type.
	 * @param array  $extra     Other keys.
	 *
	 * @return array
	 */
	private function row( float $threshold, string $reward, array $extra = [] ): array {
		return Milestones::normalize_row(
			array_merge(
				[
					'id'        => 1,
					'threshold' => $threshold,
					'reward'    => $reward,
				],
				$extra
			)
		);
	}

	/**
	 * Add a product to the cart and work out its totals.
	 *
	 * @param float $price    Unit price.
	 * @param int   $quantity Quantity.
	 *
	 * @return string Cart item key.
	 */
	private function fill_cart( float $price, int $quantity = 1 ): string {
		$key = WC()->cart->add_to_cart( $this->create_product( $price )->get_id(), $quantity );
		WC()->cart->calculate_totals();

		return (string) $key;
	}

	/**
	 * Whether the WooCommerce Free shipping rate is in the package.
	 *
	 * @return bool
	 */
	private function has_free_shipping_rate(): bool {
		WC()->cart->calculate_shipping();

		foreach ( WC()->shipping()->get_packages()[0]['rates'] as $rate ) {
			if ( 'free_shipping' === $rate->method_id ) {
				return true;
			}
		}

		return false;
	}

	/**
	 * A zone for the US with Free shipping and Flat rate.
	 *
	 * @return void
	 */
	private function create_shipping_zone(): void {
		$zone = new WC_Shipping_Zone();
		$zone->set_zone_name( 'United States' );
		$zone->add_location( 'US', 'country' );
		$zone->save();
		$zone->add_shipping_method( 'free_shipping' );
		$zone->add_shipping_method( 'flat_rate' );

		WC()->customer->set_shipping_country( 'US' );
		WC()->customer->set_billing_country( 'US' );
	}

	/**
	 * Free shipping: hidden below the threshold, back above it, and the rate
	 * cache can't keep a stale answer through a threshold edit.
	 *
	 * @return void
	 */
	public function test_free_shipping_follows_the_threshold(): void {
		$this->set_rewards( [ $this->row( 80, Milestones::FREE_SHIPPING ) ] );
		$this->create_shipping_zone();

		$key = $this->fill_cart( 50, 2 );

		$this->assertTrue( $this->has_free_shipping_rate(), 'Above the threshold' );

		WC()->cart->set_quantity( $key, 1 );
		WC()->cart->calculate_totals();

		$this->assertFalse( $this->has_free_shipping_rate(), 'Dropped below' );

		WC()->cart->set_quantity( $key, 2 );
		WC()->cart->calculate_totals();

		$this->assertTrue( $this->has_free_shipping_rate(), 'Back above' );

		// A threshold edit changes nothing on the cart's lines.
		$this->set_rewards( [ $this->row( 150, Milestones::FREE_SHIPPING ) ] );
		WC()->cart->calculate_totals();

		$this->assertFalse( $this->has_free_shipping_rate(), 'The threshold edit recalculated the rates' );
	}

	/**
	 * Free shipping is pre-selected when the milestone is reached.
	 *
	 * @return void
	 */
	public function test_free_shipping_is_preselected_when_reached(): void {
		$this->set_rewards( [ $this->row( 80, Milestones::FREE_SHIPPING ) ] );
		$this->create_shipping_zone();
		$this->fill_cart( 50, 2 );

		$chosen = WC()->cart->get_shipping_packages() ? wc_get_chosen_shipping_method_ids() : [];

		$this->assertSame( [ 'free_shipping' ], $chosen );
	}

	/**
	 * The discount reward: on above the threshold, off below it, under the
	 * fee id 3.0 reports read.
	 *
	 * @return void
	 */
	public function test_discount_reward_follows_the_threshold(): void {
		$this->set_rewards(
			[
				$this->row(
					100,
					Milestones::DISCOUNT,
					[
						'discount_mode'  => 'fixed-amount',
						'discount_value' => 5,
					]
				),
			],
			[ 'discount_type' => 'discount-amount' ]
		);

		$key = $this->fill_cart( 60, 2 );
		$this->assertArrayHasKey( WoocommerceDiscount::FEE_ID, WC()->cart->get_fees() );

		WC()->cart->set_quantity( $key, 1 );
		WC()->cart->calculate_totals();
		$this->assertArrayNotHasKey( WoocommerceDiscount::FEE_ID, WC()->cart->get_fees(), 'Dropped below' );

		WC()->cart->set_quantity( $key, 2 );
		WC()->cart->calculate_totals();
		$this->assertArrayHasKey( WoocommerceDiscount::FEE_ID, WC()->cart->get_fees(), 'Back above' );
	}

	/**
	 * A gift milestone adds the gift at $0 and removes it below the threshold,
	 * without firing add-to-cart (BOGO and the counters listen there).
	 *
	 * @return void
	 */
	public function test_gift_comes_and_goes_with_the_threshold(): void {
		$gift = $this->create_product( 20 );
		$this->set_rewards( [ $this->row( 80, Milestones::GIFT, [ 'gift_product_id' => $gift->get_id() ] ) ] );

		$key   = $this->fill_cart( 50, 2 );
		$added = did_action( 'woocommerce_add_to_cart' );

		WC()->cart->calculate_totals();

		$this->assertSame( $added, did_action( 'woocommerce_add_to_cart' ), 'No add-to-cart fired' );
		$this->assertCount( 2, WC()->cart->get_cart() );
		$this->assertSame( 100.0, (float) WC()->cart->get_subtotal(), 'The gift costs nothing' );
		$this->assertTrue( $this->cart_has_reward_gift() );

		WC()->cart->set_quantity( $key, 1 );
		WC()->cart->calculate_totals();

		$this->assertCount( 1, WC()->cart->get_cart(), 'Removed below the threshold' );
		$this->assertFalse( $this->cart_has_reward_gift() );

		WC()->cart->set_quantity( $key, 2 );
		WC()->cart->calculate_totals();

		$this->assertTrue( $this->cart_has_reward_gift(), 'Back above' );
	}

	/**
	 * A gift line never counts towards a coupon: it's left out everywhere a
	 * BOGO gift is.
	 *
	 * @return void
	 */
	public function test_a_gift_line_is_a_gift_for_coupons(): void {
		$this->assertTrue( CartLine::is_gift( [ CartLine::REWARD_GIFT => 1 ] ) );
		$this->assertFalse( CartLine::is_gift( [] ) );
	}

	/**
	 * Whether the cart holds a reward gift line.
	 *
	 * @return bool
	 */
	private function cart_has_reward_gift(): bool {
		foreach ( WC()->cart->get_cart() as $item ) {
			if ( ! empty( $item[ CartLine::REWARD_GIFT ] ) ) {
				return true;
			}
		}

		return false;
	}

	/**
	 * A coupon milestone shows its code once reached and is never applied.
	 *
	 * @return void
	 */
	public function test_coupon_code_is_shown_when_reached(): void {
		$coupon = $this->create_smart_coupon(
			'NEXT10',
			[
				'type'   => 'percent',
				'amount' => 10,
				'title'  => '10% off your next item',
			]
		);
		$this->set_rewards( [ $this->row( 80, Milestones::COUPON, [ 'coupon_id' => $coupon->get_id() ] ) ] );

		$this->fill_cart( 50 );
		$this->assertSame( [], Milestones::progress( WC()->cart )['unlocked'], 'Below the threshold' );

		WC()->cart->empty_cart();
		$this->fill_cart( 50, 2 );

		$this->assertSame(
			[
				[
					'code'    => 'NEXT10',
					'message' => 'You unlocked 10% off your next item: NEXT10',
				],
			],
			Milestones::progress( WC()->cart )['unlocked']
		);
		$this->assertSame( [], WC()->cart->get_applied_coupons(), 'Never auto-applied' );
	}

	/**
	 * An automatic Smart Coupon's code can't be used, so it is never shown.
	 *
	 * @return void
	 */
	public function test_automatic_coupon_is_never_shown(): void {
		$coupon = $this->create_smart_coupon( 'autocode', [ 'method' => SmartCoupon::AUTOMATIC ] );
		$this->set_rewards( [ $this->row( 80, Milestones::COUPON, [ 'coupon_id' => $coupon->get_id() ] ) ] );
		$this->fill_cart( 50, 2 );

		$this->assertSame( [], Milestones::progress( WC()->cart )['unlocked'] );
	}

	/**
	 * Data for the tax modes the shopper can see.
	 *
	 * @return array
	 */
	public static function tax_modes(): array {
		return [
			'prices incl., shown incl.' => [ 'yes', 'incl' ],
			'prices incl., shown excl.' => [ 'yes', 'excl' ],
			'prices excl., shown incl.' => [ 'no', 'incl' ],
			'prices excl., shown excl.' => [ 'no', 'excl' ],
		];
	}

	/**
	 * Tax on, a 10% rate.
	 *
	 * @param string $prices_incl Prices include tax.
	 * @param string $display_tax Cart tax display.
	 *
	 * @return void
	 */
	private function use_tax( string $prices_incl, string $display_tax ): void {
		update_option( 'woocommerce_calc_taxes', 'yes' );
		update_option( 'woocommerce_prices_include_tax', $prices_incl );
		update_option( 'woocommerce_tax_display_cart', $display_tax );
		update_option( 'woocommerce_default_country', 'US:CA' );

		WC_Tax::_insert_tax_rate(
			[
				'tax_rate'          => '10.0000',
				'tax_rate_name'     => 'TAX',
				'tax_rate_priority' => '1',
				'tax_rate_order'    => '1',
				'tax_rate_country'  => '',
				'tax_rate_shipping' => '1',
				'tax_rate_class'    => '',
			]
		);

		WC()->cart->tax_display_cart = $display_tax;
	}

	/**
	 * "Add $X more" matches the subtotal the shopper sees, the figure
	 * WooCommerce's own free shipping minimum compares with.
	 *
	 * @dataProvider tax_modes
	 *
	 * @param string $prices_incl Prices include tax.
	 * @param string $display_tax Cart tax display.
	 *
	 * @return void
	 */
	public function test_subtotal_matches_what_the_shopper_sees( string $prices_incl, string $display_tax ): void {
		$this->use_tax( $prices_incl, $display_tax );
		$this->set_rewards( [ $this->row( 200, Milestones::FREE_SHIPPING ) ] );

		$coupon = new WC_Coupon();
		$coupon->set_code( 'minus5' );
		$coupon->set_discount_type( 'fixed_cart' );
		$coupon->set_amount( '5' );
		$coupon->save();

		$this->fill_cart( 50, 2 );
		WC()->cart->apply_coupon( 'minus5' );
		WC()->cart->calculate_totals();

		// The expression `WC_Shipping_Free_Shipping::is_available()` compares.
		$shown = WC()->cart->get_displayed_subtotal() - WC()->cart->get_discount_total();

		if ( WC()->cart->display_prices_including_tax() ) {
			$shown -= WC()->cart->get_discount_tax();
		}

		$this->assertEqualsWithDelta( $shown, Milestones::subtotal( WC()->cart ), 0.01 );
		$this->assertStringContainsString(
			html_entity_decode( wp_strip_all_tags( wc_price( 200 - round( $shown, 2 ) ) ), ENT_QUOTES ),
			html_entity_decode( wp_strip_all_tags( Helper::get_banner_text( Helper::get_settings() ) ), ENT_QUOTES )
		);
	}

	/**
	 * The zone warning lists zones without a Free shipping method.
	 *
	 * @return void
	 */
	public function test_zone_without_free_shipping_is_reported(): void {
		$with = new WC_Shipping_Zone();
		$with->set_zone_name( 'Has it' );
		$with->save();
		$with->add_shipping_method( 'free_shipping' );

		$without = new WC_Shipping_Zone();
		$without->set_zone_name( 'Has none' );
		$without->save();
		$without->add_shipping_method( 'flat_rate' );

		$zones = array_column( Milestones::shipping_zones(), 'has_free_shipping', 'name' );

		$this->assertTrue( $zones['Has it'] );
		$this->assertFalse( $zones['Has none'] );
	}

	/**
	 * A store from before 3.1 with no migration run: its threshold and reward
	 * are milestone 1, live, and the old keys aren't touched.
	 *
	 * @return void
	 */
	public function test_old_settings_work_with_no_migration_run(): void {
		update_option(
			self::OPTION,
			[
				'discount_type'         => 'discount-amount',
				'discount_amount_mode'  => 'percentage',
				'discount_amount_value' => '10',
				'cart_minimum_amount'   => '60',
			]
		);

		$rows = Milestones::active();

		$this->assertCount( 1, $rows );
		$this->assertSame( 60.0, $rows[0]['threshold'] );
		$this->assertSame( Milestones::DISCOUNT, $rows[0]['reward'] );
		$this->assertSame( 'percentage', $rows[0]['discount_mode'] );
		$this->assertSame( 10.0, $rows[0]['discount_value'] );
		$this->assertArrayNotHasKey( 'milestones', get_option( self::OPTION ), 'Nothing written' );

		$this->fill_cart( 50, 2 );
		$this->assertEqualsWithDelta( -10.0, WC()->cart->get_fee_total(), 0.001, 'The rule still applies' );
	}

	/**
	 * Saving keeps the old keys for milestone 1 and backs up first.
	 *
	 * @return void
	 */
	public function test_save_keeps_legacy_keys_and_backs_up(): void {
		$old = [
			'discount_type'       => 'free-shipping',
			'cart_minimum_amount' => '80',
		];
		update_option( self::OPTION, $old );

		$service = storegrowth_get_container()->get( SettingsService::class );
		$saved   = $service->save(
			ProgressiveDiscountBannerModule::get_id(),
			[
				'milestones' => [
					[
						'threshold' => 100,
						'reward'    => Milestones::FREE_SHIPPING,
					],
					[
						'threshold'       => 150,
						'reward'          => Milestones::GIFT,
						'gift_product_id' => 7,
					],
				],
			]
		);

		$this->assertIsArray( $saved );
		$this->assertSame( $old, get_option( ProgressiveDiscountBannerSettings::BACKUP_OPTION ) );

		$stored = get_option( self::OPTION );

		$this->assertSame( '100', $stored['cart_minimum_amount'] );
		$this->assertSame( 'free-shipping', $stored['discount_type'] );
		$this->assertSame( [ 1, 2 ], array_column( $stored['milestones'], 'id' ) );
	}

	/**
	 * The old admin's ajax save (legacy keys only) moves milestone 1.
	 *
	 * @return void
	 */
	public function test_legacy_save_moves_milestone_one(): void {
		$this->set_rewards( [ $this->row( 80, Milestones::FREE_SHIPPING ) ] );

		storegrowth_get_container()->get( SettingsService::class )->save( ProgressiveDiscountBannerModule::get_id(), [ 'cart_minimum_amount' => 120 ] );

		$this->assertSame( 120.0, get_option( self::OPTION )['milestones'][0]['threshold'] );
	}

	/**
	 * Never saved means off.
	 *
	 * @return void
	 */
	public function test_never_saved_store_has_no_rewards(): void {
		update_option(
			self::OPTION,
			[
				'default_banner_text'     => 'x',
				'progressive_banner_text' => 'y',
				'goal_completion_text'    => 'z',
			]
		);

		$this->assertSame( [], Milestones::active() );
		$this->assertArrayNotHasKey( 'milestones', get_option( self::OPTION ) );

		$this->fill_cart( 50, 3 );
		$this->assertSame( 0.0, (float) WC()->cart->get_fee_total() );
	}

	/**
	 * The Store API cart carries the extension data.
	 *
	 * @return void
	 */
	public function test_store_api_response_shape(): void {
		$this->set_rewards( [ $this->row( 200, Milestones::FREE_SHIPPING ) ] );
		$this->fill_cart( 50, 2 );

		$response = rest_do_request( new WP_REST_Request( 'GET', '/wc/store/v1/cart' ) );
		$data     = (array) $response->get_data()['extensions'];
		$data     = (array) $data[ CartExtension::IDENTIFIER ];

		$this->assertSame( 200, $response->get_status() );
		$this->assertSame( [ 'notices', 'coupon_labels', 'rewards' ], array_keys( $data ) );

		$rewards = $data['rewards'];

		$this->assertSame( 'both', $rewards['placement'] );
		$this->assertSame( 50, $rewards['percent'] );
		$this->assertStringContainsString( 'free shipping', $rewards['message'] );
		$this->assertFalse( $rewards['milestones'][0]['reached'] );
	}

	/**
	 * A cart line reports whether it is a reward gift.
	 *
	 * @return void
	 */
	public function test_store_api_cart_item_flags_a_reward_gift(): void {
		$gift = $this->create_product( 20 );
		$this->set_rewards( [ $this->row( 80, Milestones::GIFT, [ 'gift_product_id' => $gift->get_id() ] ) ] );
		$this->fill_cart( 50, 2 );

		$items = rest_do_request( new WP_REST_Request( 'GET', '/wc/store/v1/cart/items' ) )->get_data();
		$flags = array_map(
			static function ( array $item ) {
				return ( (array) ( (array) $item['extensions'] )[ CartExtension::IDENTIFIER ] )['is_reward_gift'];
			},
			$items
		);

		$this->assertEqualsCanonicalizing( [ true, false ], $flags );
	}

	/**
	 * StoreGrowth's notices leave the WooCommerce queue when the block cart
	 * takes them; other notices stay.
	 *
	 * @return void
	 */
	public function test_store_api_takes_only_storegrowth_notices(): void {
		wc_add_notice( 'Prices updated.', 'notice', [ CartLine::NOTICE_SOURCE => true ] );
		wc_add_notice( 'Someone else', 'notice' );

		$this->assertSame( [ 'Prices updated.' ], CartExtension::take_notices() );
		$this->assertSame( [ 'Someone else' ], wp_list_pluck( wc_get_notices( 'notice' ), 'notice' ) );
	}

	/**
	 * The gift-line notice from #303 reaches the block cart through the same
	 * tag.
	 *
	 * @return void
	 */
	public function test_cart_line_notices_are_tagged_for_the_block_cart(): void {
		$key = $this->fill_cart( 30 );

		CartLine::set_price( WC()->cart, $key, 10.0, 30.0 );

		$this->assertSame( [ 'Prices updated.' ], CartExtension::take_notices() );
	}

	/**
	 * Coupon messages from #306 reach the block cart: the Store API applies
	 * a code through the same check and reports the referee's message.
	 *
	 * @return void
	 */
	public function test_store_api_reports_the_coupon_clash_message(): void {
		update_option( 'spsg_active_module_ids', [ 'smart-coupons' ] );
		add_filter( 'spsg_offer_is_live', '__return_true', 99 );
		( new CouponGate() )->register_hooks();
		( new CouponGuard() )->register_hooks();

		$product = $this->create_product( 100 );

		$this->create_smart_coupon(
			'large',
			[
				'amount'      => 30,
				'product_ids' => [ $product->get_id() ],
			]
		);
		$this->create_smart_coupon(
			'small',
			[
				'amount'      => 5,
				'product_ids' => [ $product->get_id() ],
			]
		);

		WC()->cart->add_to_cart( $product->get_id() );
		WC()->cart->apply_coupon( 'large' );

		$this->expectException( RouteException::class );
		$this->expectExceptionMessage( 'Only one of these coupons can be used. We kept LARGE, which saves you more.' );

		try {
			( new CartController() )->apply_coupon( 'small' );
		} finally {
			update_option( 'spsg_active_module_ids', [] );
		}
	}

	/**
	 * An automatic coupon gets its name on the block cart, and a shopper
	 * removing it through the Store API can't keep it off: the referee applies
	 * it again on the next calculation (WooCommerce's remove chip can't be
	 * hidden through the `coupons` filter).
	 *
	 * @return void
	 */
	public function test_automatic_coupon_labelled_and_comes_back_after_removal(): void {
		update_option( 'spsg_active_module_ids', [ 'smart-coupons' ] );
		add_filter( 'spsg_offer_is_live', '__return_true', 99 );
		( new CouponGate() )->register_hooks();
		( new CouponGuard() )->register_hooks();

		$product = $this->create_product( 100 );

		$this->create_smart_coupon(
			'autogen',
			[
				'method'      => SmartCoupon::AUTOMATIC,
				'title'       => 'Summer sale',
				'product_ids' => [ $product->get_id() ],
			]
		);

		WC()->cart->add_to_cart( $product->get_id() );
		WC()->cart->calculate_totals();

		$this->assertContains( 'autogen', WC()->cart->get_applied_coupons() );
		$this->assertSame( [ 'autogen' => 'Summer sale' ], ( new CartExtension() )->cart_data()['coupon_labels'] );

		WC()->cart->remove_coupon( 'autogen' );
		WC()->cart->calculate_totals();

		$this->assertContains( 'autogen', WC()->cart->get_applied_coupons() );

		update_option( 'spsg_active_module_ids', [] );
	}

	/**
	 * Free plan: one milestone stays on and a second can't be added; a
	 * merchant whose Pro lapsed keeps the rows they have.
	 *
	 * @return void
	 */
	public function test_free_plan_keeps_one_milestone(): void {
		$this->pro = false;

		$this->set_rewards(
			[
				$this->row( 50, Milestones::FREE_SHIPPING ),
				$this->row( 100, Milestones::FREE_SHIPPING, [ 'id' => 2 ] ),
			]
		);

		$this->assertSame( [ 2 ], OfferLimits::paused_ids( OfferVersions::CART_REWARD ) );
		$this->assertCount( 1, Milestones::active() );

		$service = storegrowth_get_container()->get( SettingsService::class );
		$rows    = array_map(
			static function ( array $row ): array {
				return [
					'threshold' => $row['threshold'] + 5,
					'reward'    => $row['reward'],
					'id'        => $row['id'],
				];
			},
			get_option( self::OPTION )['milestones']
		);

		$this->assertIsArray( $service->save( ProgressiveDiscountBannerModule::get_id(), [ 'milestones' => $rows ] ), 'Two stored rows can still be edited' );

		$too_many = array_merge(
			$rows,
			[
				[
					'threshold' => 300,
					'reward'    => Milestones::FREE_SHIPPING,
				],
			]
		);

		$this->assertWPError( $service->save( ProgressiveDiscountBannerModule::get_id(), [ 'milestones' => $too_many ] ), 'A third is refused' );
	}

	/**
	 * Saving an empty list is refused: it would look like "no milestones".
	 *
	 * @return void
	 */
	public function test_saving_no_milestones_is_refused(): void {
		$this->set_rewards( [ $this->row( 50, Milestones::FREE_SHIPPING ) ] );

		$this->assertWPError(
			storegrowth_get_container()->get( SettingsService::class )->save( ProgressiveDiscountBannerModule::get_id(), [ 'milestones' => [] ] )
		);
	}
}
