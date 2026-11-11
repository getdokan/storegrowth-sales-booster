<?php
/**
 * Tests for the Smart Coupons module (#306, ADR-014).
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Test\SmartCoupons;

use StorePulse\StoreGrowth\Modules\BoGo\BogoDataManager;
use StorePulse\StoreGrowth\Modules\BoGo\OrderBogo;
use StorePulse\StoreGrowth\Modules\CountdownTimer\CommonHooks;
use StorePulse\StoreGrowth\Modules\SmartCoupons\CouponGuard;
use StorePulse\StoreGrowth\Modules\SmartCoupons\CouponScreens;
use StorePulse\StoreGrowth\Modules\SmartCoupons\LinkCoupons;
use StorePulse\StoreGrowth\Modules\SmartCoupons\REST\SmartCouponsController;
use StorePulse\StoreGrowth\Modules\SmartCoupons\SmartCouponRepository;
use StorePulse\StoreGrowth\Offers\CampaignRepository;
use StorePulse\StoreGrowth\Offers\OfferLimits;
use StorePulse\StoreGrowth\Offers\OfferVersions;
use StorePulse\StoreGrowth\Pricing\CouponAmount;
use StorePulse\StoreGrowth\Pricing\CouponGate;
use StorePulse\StoreGrowth\Pricing\Referee;
use StorePulse\StoreGrowth\Pricing\SmartCoupon;
use StorePulse\StoreGrowth\Test\StoreGrowthTestCase;
use WC_Coupon;
use WP_REST_Request;
use WP_REST_Server;

/**
 * Each acceptance criterion PHPUnit can reach, through the module's save path.
 */
class SmartCouponsTest extends StoreGrowthTestCase {

	/**
	 * Hooks a test run installs and removes again.
	 */
	const HOOKS = [
		'woocommerce_before_calculate_totals',
		'woocommerce_coupon_is_valid',
		'woocommerce_coupon_is_valid_for_sale_items',
		'woocommerce_coupon_get_items_to_apply',
		'woocommerce_coupon_get_amount',
		'woocommerce_coupon_validate_minimum_amount',
		'woocommerce_coupon_validate_expiry_date',
		'woocommerce_coupon_error',
		'woocommerce_get_item_data',
		'woocommerce_product_get_price',
		'woocommerce_product_is_on_sale',
		'woocommerce_cart_totals_coupon_label',
		'woocommerce_cart_totals_coupon_html',
		'woocommerce_coupon_discount_amount_html',
		'spsg_cart_deals',
		'spsg_referee_decided',
		'spsg_referee_observe_only',
		'spsg_offer_limits',
		'spsg_offer_is_live',
		'spsg_bogo_coupon_unlocks_rule',
		'storegrowth_pro_is_active',
		'woocommerce_price_trim_zeros',
	];

	/**
	 * Pro state for the test.
	 *
	 * @var bool
	 */
	private bool $pro = true;

	/**
	 * Run on an empty cart with the hooks of a live store and the module on.
	 *
	 * @return void
	 */
	public function setUp(): void {
		parent::setUp();

		global $wpdb, $wp_rest_server;

		foreach ( [ CampaignRepository::CAMPAIGNS, CampaignRepository::OFFERS ] as $table ) {
			$wpdb->query( "TRUNCATE TABLE {$wpdb->prefix}{$table}" ); // phpcs:ignore WordPress.DB
		}

		CampaignRepository::flush();
		OfferLimits::flush();
		Referee::flush();

		foreach ( self::HOOKS as $hook ) {
			remove_all_filters( $hook );
		}

		$this->pro = true;

		add_filter(
			'storegrowth_pro_is_active',
			function () {
				return $this->pro;
			}
		);
		add_filter( 'woocommerce_price_trim_zeros', '__return_true' );
		update_option( 'woocommerce_currency', 'USD' );
		update_option( 'woocommerce_enable_coupons', 'yes' );
		update_option( 'spsg_active_module_ids', [ 'smart-coupons', 'bogo' ] );

		$countdown = new CommonHooks();

		add_filter( 'woocommerce_product_get_price', [ $countdown, 'get_product_price' ], 10, 2 );
		add_filter( 'woocommerce_product_is_on_sale', [ $countdown, 'woocommerce_product_is_on_sale' ], 10, 2 );
		add_filter( 'spsg_cart_deals', [ $countdown, 'report_cart_deals' ], 10, 2 );
		add_action( 'woocommerce_before_calculate_totals', [ OrderBogo::instance(), 'woocommerce_custom_price_to_cart_item' ] );
		add_filter( 'spsg_cart_deals', [ OrderBogo::instance(), 'report_cart_deals' ], 10, 2 );
		add_action( 'spsg_referee_decided', [ OrderBogo::instance(), 'apply_referee_decision' ], 10, 2 );

		( new Referee() )->register_hooks();
		( new CouponGate() )->register_hooks();
		( new CouponAmount() )->register_hooks();
		( new CouponGuard() )->register_hooks();
		( new CouponScreens() )->register_hooks();

		$wp_rest_server = new WP_REST_Server(); // phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited
		add_action(
			'rest_api_init',
			static function () {
				( new SmartCouponsController() )->register_routes();
			}
		);
		/**
		 * Fires when preparing to serve a REST API request (WordPress core).
		 *
		 * @since 4.4.0
		 *
		 * @param WP_REST_Server $wp_rest_server Server object.
		 */
		do_action( 'rest_api_init', $wp_rest_server );

		wp_set_current_user( self::factory()->user->create( [ 'role' => 'administrator' ] ) );

		WC()->cart->empty_cart();
		wc_clear_notices();
	}

	/**
	 * Leave no hooks or cart behind.
	 *
	 * @return void
	 */
	public function tearDown(): void {
		global $wp_rest_server;

		WC()->cart->empty_cart();

		foreach ( self::HOOKS as $hook ) {
			remove_all_filters( $hook );
		}

		wc_clear_notices();
		Referee::flush();
		OfferLimits::flush();
		$wp_rest_server = null; // phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited

		parent::tearDown();
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
	 * Save a coupon through the module; a plain code coupon by default, live now.
	 *
	 * @param string $code   Code.
	 * @param array  $values Editor values.
	 *
	 * @return WC_Coupon
	 */
	private function save_coupon( string $code, array $values = [] ): WC_Coupon {
		$coupon = SmartCouponRepository::save(
			array_merge(
				[
					'method'        => SmartCoupon::CODE,
					'code'          => $code,
					'title'         => '' !== $code ? strtoupper( $code ) : 'Automatic deal',
					'discount_type' => SmartCoupon::TYPE_PERCENTAGE,
					'amount'        => 10,
					'date_start'    => wp_date( 'Y-m-d\TH:i', time() - HOUR_IN_SECONDS ),
				],
				$values
			)
		);

		$this->assertInstanceOf( WC_Coupon::class, $coupon, is_wp_error( $coupon ) ? $coupon->get_error_message() : '' );

		return $coupon;
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
	 * A REST request as the logged-in user.
	 *
	 * @param string $method HTTP method.
	 * @param string $path   Route after the namespace.
	 * @param array  $body   JSON body.
	 *
	 * @return \WP_REST_Response
	 */
	private function rest( string $method, string $path, array $body = [] ): \WP_REST_Response {
		$request = new WP_REST_Request( $method, '/sales-booster/v1/smart-coupons' . $path );

		if ( $body ) {
			$request->set_header( 'Content-Type', 'application/json' );
			$request->set_body( wp_json_encode( $body ) );
		}

		return rest_do_request( $request );
	}

	/**
	 * Native fields carry what WooCommerce has; Individual use stays off.
	 *
	 * @return void
	 */
	public function test_save_uses_native_fields_and_never_individual_use(): void {
		$jacket = $this->product( 120 );
		$end    = wp_date( 'Y-m-d\TH:i', time() + 2 * DAY_IN_SECONDS );

		$coupon = $this->save_coupon(
			'outerwear',
			[
				'amount'           => 30,
				'apply_to'         => 'products',
				'product_ids'      => [ $jacket->get_id() ],
				'minimum_type'     => 'subtotal',
				'minimum_amount'   => 50,
				'one_per_customer' => true,
				'skip_sale'        => true,
				'date_end'         => $end,
			]
		);

		$read = new WC_Coupon( $coupon->get_id() );

		$this->assertSame( 'percent', $read->get_discount_type() );
		$this->assertSame( '30', (string) $read->get_amount( 'edit' ) );
		$this->assertSame( [ $jacket->get_id() ], $read->get_product_ids() );
		$this->assertSame( '50', (string) $read->get_minimum_amount( 'edit' ) );
		$this->assertSame( 1, $read->get_usage_limit_per_user( 'edit' ) );
		$this->assertTrue( $read->get_exclude_sale_items() );
		$this->assertFalse( $read->get_individual_use() );
		$this->assertSame( $end, wp_date( 'Y-m-d\TH:i', $read->get_date_expires()->getTimestamp() ) );
		$this->assertSame( 'yes', $read->get_meta( SmartCoupon::MANAGED ) );
		$this->assertSame( 'yes', $read->get_meta( 'admin_coupons_enabled_for_vendor' ) );
		$this->assertSame( 'from_admin', $read->get_meta( 'coupon_commissions_type' ) );
	}

	/**
	 * A chosen Dokan funding type survives a save.
	 *
	 * @return void
	 */
	public function test_save_keeps_a_chosen_dokan_funding(): void {
		$coupon = $this->save_coupon( 'funded' );

		$coupon->update_meta_data( 'coupon_commissions_type', 'shared_coupon' );
		$coupon->save();

		SmartCouponRepository::save( [ 'title' => 'New title' ], new WC_Coupon( $coupon->get_id() ) );

		$this->assertSame( 'shared_coupon', ( new WC_Coupon( $coupon->get_id() ) )->get_meta( 'coupon_commissions_type' ) );
	}

	/**
	 * A vendor restriction set in Dokan's coupon panel survives a save.
	 *
	 * @return void
	 */
	public function test_save_keeps_a_dokan_vendor_restriction(): void {
		$coupon = $this->save_coupon( 'restricted' );

		$coupon->update_meta_data( 'admin_coupons_enabled_for_vendor', 'no' );
		$coupon->save();

		SmartCouponRepository::save( [ 'title' => 'New title' ], new WC_Coupon( $coupon->get_id() ) );

		$this->assertSame( 'no', ( new WC_Coupon( $coupon->get_id() ) )->get_meta( 'admin_coupons_enabled_for_vendor' ) );
	}

	/**
	 * A code appears in WooCommerce > Coupons, labelled, and edits in Smart Coupons.
	 *
	 * @return void
	 */
	public function test_code_coupon_is_labelled_and_edits_in_smart_coupons(): void {
		$coupon = $this->save_coupon( 'labelled' );
		$post   = get_post( $coupon->get_id() );

		/**
		 * The list table's post states (WordPress core).
		 *
		 * @since 2.8.0
		 *
		 * @param array    $post_states Post states.
		 * @param \WP_Post $post        Post.
		 */
		$states = apply_filters( 'display_post_states', [], $post );

		$this->assertContains( 'Managed by Smart Coupons', $states );
		$this->assertStringContainsString( 'page=storegrowth#/smart-coupons/' . $coupon->get_id(), (string) get_edit_post_link( $coupon->get_id(), 'raw' ) );
	}

	/**
	 * A coupon of WooCommerce's own keeps its links.
	 *
	 * @return void
	 */
	public function test_an_outside_coupon_keeps_its_woocommerce_edit_link(): void {
		$outside = $this->plain_coupon( 'outside', 'percent', 5 );

		$this->assertStringNotContainsString( 'smart-coupons', (string) get_edit_post_link( $outside->get_id(), 'raw' ) );
	}

	/**
	 * Automatic coupons are hidden from WooCommerce > Coupons.
	 *
	 * @return void
	 */
	public function test_automatic_coupons_are_hidden_from_the_coupon_list(): void {
		global $wp_the_query;

		$auto = $this->save_coupon( '', [ 'method' => SmartCoupon::AUTOMATIC ] );
		$code = $this->save_coupon( 'visible' );

		set_current_screen( 'edit-shop_coupon' );

		$query        = new \WP_Query();
		$wp_the_query = $query; // phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited
		$ids          = $query->query(
			[
				'post_type'   => 'shop_coupon',
				'post_status' => 'publish',
				'fields'      => 'ids',
			]
		);

		set_current_screen( 'front' );

		$this->assertContains( $code->get_id(), $ids );
		$this->assertNotContains( $auto->get_id(), $ids );
	}

	/**
	 * An automatic coupon can't be typed.
	 *
	 * @return void
	 */
	public function test_an_automatic_code_cannot_be_typed(): void {
		$key  = WC()->cart->add_to_cart( $this->product( 100 )->get_id() );
		$auto = $this->save_coupon( '', [ 'method' => SmartCoupon::AUTOMATIC ] );

		$this->assertFalse( WC()->cart->apply_coupon( $auto->get_code() ) );
		$this->assertTrue( wc_has_notice( esc_html( strtoupper( $auto->get_code() ) . " isn't a valid coupon right now." ), 'error' ) );

		$this->assertSame( 90.0, $this->line_totals()[ $key ] );
	}

	/**
	 * The referee applies an automatic coupon, under a readable label with no Remove.
	 *
	 * @return void
	 */
	public function test_automatic_coupon_shows_its_title_and_no_remove_link(): void {
		$auto = $this->save_coupon(
			'',
			[
				'method' => SmartCoupon::AUTOMATIC,
				'title'  => 'Autumn sale',
			]
		);
		$key  = WC()->cart->add_to_cart( $this->product( 100 )->get_id() );

		$this->assertSame( 90.0, $this->line_totals()[ $key ] );
		$this->assertContains( $auto->get_code(), WC()->cart->get_applied_coupons() );

		ob_start();
		wc_cart_totals_coupon_html( $auto );
		$html = (string) ob_get_clean();

		$this->assertSame( 'Autumn sale', wc_cart_totals_coupon_label( $auto, false ) );
		$this->assertStringNotContainsString( 'woocommerce-remove-coupon', $html );
	}

	/**
	 * A Smart Coupon is invalid while the module is off.
	 *
	 * @return void
	 */
	public function test_module_off_makes_a_coupon_invalid(): void {
		$coupon = $this->save_coupon( 'off-code' );

		update_option( 'spsg_active_module_ids', [] );
		WC()->cart->add_to_cart( $this->product( 100 )->get_id() );

		$this->assertFalse( WC()->cart->apply_coupon( 'off-code' ) );
		$this->assertTrue( wc_has_notice( esc_html( "OFF-CODE isn't a valid coupon right now." ), 'error' ) );
		$this->assertSame( 'off-code', $coupon->get_code() );
	}

	/**
	 * A start in the future, or no dates at all, keep a coupon off.
	 *
	 * @return void
	 */
	public function test_dates_keep_a_coupon_off(): void {
		$this->save_coupon( 'later', [ 'date_start' => wp_date( 'Y-m-d\TH:i', time() + DAY_IN_SECONDS ) ] );
		$this->save_coupon( 'no-dates', [ 'date_start' => '' ] );

		WC()->cart->add_to_cart( $this->product( 100 )->get_id() );

		$this->assertFalse( WC()->cart->apply_coupon( 'later' ) );
		$this->assertFalse( WC()->cart->apply_coupon( 'no-dates' ) );
		$this->assertTrue( wc_has_notice( esc_html( "LATER isn't a valid coupon right now." ), 'error' ) );
	}

	/**
	 * A code that doesn't exist reads the module's message.
	 *
	 * @return void
	 */
	public function test_a_missing_code_reads_the_message(): void {
		WC()->cart->add_to_cart( $this->product( 100 )->get_id() );

		$this->assertFalse( WC()->cart->apply_coupon( 'nope' ) );
		$this->assertTrue( wc_has_notice( esc_html( "NOPE isn't a valid coupon right now." ), 'error' ) );
	}

	/**
	 * Minimum quantity counts bought items, not gifts.
	 *
	 * @return void
	 */
	public function test_minimum_quantity_ignores_gifts(): void {
		$this->save_coupon(
			'two-items',
			[
				'minimum_type'     => 'quantity',
				'minimum_quantity' => 2,
			]
		);

		$book = $this->product( 20 );
		$gift = $this->product( 5 );

		$key = WC()->cart->add_to_cart( $book->get_id() );
		WC()->cart->add_to_cart(
			$gift->get_id(),
			1,
			0,
			[],
			[
				'bogo_offer'            => true,
				'linked_to_product_key' => $key,
			]
		);

		$this->assertFalse( WC()->cart->apply_coupon( 'two-items' ) );

		wc_clear_notices();
		WC()->cart->set_quantity( $key, 2 );

		$this->assertTrue( WC()->cart->apply_coupon( 'two-items' ) );
	}

	/**
	 * Entering a smaller code after a larger one keeps the larger, with the message.
	 *
	 * @return void
	 */
	public function test_smaller_code_after_a_larger_one_keeps_the_larger(): void {
		$this->save_coupon(
			'large',
			[
				'amount' => 30,
				'title'  => 'Thirty off',
			]
		);
		$this->save_coupon( 'small', [ 'amount' => 10 ] );

		$key = WC()->cart->add_to_cart( $this->product( 120 )->get_id() );

		$this->assertTrue( WC()->cart->apply_coupon( 'large' ) );
		$this->assertFalse( WC()->cart->apply_coupon( 'small' ) );
		$this->assertTrue( wc_has_notice( esc_html( 'Only one of these coupons can be used. We kept LARGE, which saves you more.' ), 'error' ) );
		$this->assertSame( [ 'large' ], array_values( WC()->cart->get_applied_coupons() ) );
		$this->assertSame( 84.0, $this->line_totals()[ $key ] );
	}

	/**
	 * A code that loses on every line is removed with the message.
	 *
	 * @return void
	 */
	public function test_a_code_losing_every_line_is_rejected_with_the_message(): void {
		$boots = $this->product( 95 );

		$this->create_global_offer(
			[
				'name_of_order_bogo'        => 'Buy 2 boots get 1 free',
				'bogo_deal_type'            => 'same',
				'offered_products'          => [ $boots->get_id() ],
				'minimum_quantity_required' => 2,
			]
		);
		$this->save_coupon(
			'save30',
			[
				'discount_type' => SmartCoupon::TYPE_FIXED,
				'amount'        => 30,
			]
		);

		WC()->cart->add_to_cart( $boots->get_id(), 2 );

		$this->assertFalse( WC()->cart->apply_coupon( 'save30' ) );
		$this->assertTrue( wc_has_notice( esc_html( "SAVE30 wasn't applied because Buy 2 boots get 1 free saves you more." ), 'error' ) );
	}

	/**
	 * A code that wins on some lines stays on those lines.
	 *
	 * @return void
	 */
	public function test_a_code_winning_on_some_lines_stays(): void {
		$boots  = $this->product( 95 );
		$jacket = $this->product( 120 );

		$this->create_global_offer(
			[
				'name_of_order_bogo'        => 'Buy 2 boots get 1 free',
				'bogo_deal_type'            => 'same',
				'offered_products'          => [ $boots->get_id() ],
				'minimum_quantity_required' => 2,
			]
		);
		$this->save_coupon(
			'save30',
			[
				'discount_type' => SmartCoupon::TYPE_FIXED,
				'amount'        => 30,
			]
		);

		$boots_key  = WC()->cart->add_to_cart( $boots->get_id(), 2 );
		$jacket_key = WC()->cart->add_to_cart( $jacket->get_id() );

		$this->assertTrue( WC()->cart->apply_coupon( 'save30' ) );

		$totals = $this->line_totals();

		$this->assertSame( 190.0, $totals[ $boots_key ] );
		$this->assertSame( 90.0, $totals[ $jacket_key ] );
	}

	/**
	 * A coupon from outside StoreGrowth with Individual use follows WooCommerce.
	 *
	 * @return void
	 */
	public function test_outside_individual_use_coupon_behaves_as_woocommerce(): void {
		$this->save_coupon( 'smart', [ 'amount' => 30 ] );

		$outside = $this->plain_coupon( 'solo', 'percent', 5 );
		$outside->set_individual_use( true );
		$outside->save();

		WC()->cart->add_to_cart( $this->product( 100 )->get_id() );

		$this->assertTrue( WC()->cart->apply_coupon( 'solo' ) );
		$this->assertFalse( WC()->cart->apply_coupon( 'smart' ) );
		$this->assertSame( [ 'solo' ], array_values( WC()->cart->get_applied_coupons() ) );

		wc_clear_notices();
		WC()->cart->remove_coupons();

		$this->assertTrue( WC()->cart->apply_coupon( 'smart' ) );
		$this->assertTrue( WC()->cart->apply_coupon( 'solo' ) );
		$this->assertSame( [ 'solo' ], array_values( WC()->cart->get_applied_coupons() ) );
	}

	/**
	 * "Skip products already on sale" skips a line with a Countdown price.
	 *
	 * @return void
	 */
	public function test_skip_sale_items_skips_a_countdown_price(): void {
		$this->save_coupon( 'skips', [ 'skip_sale' => true ] );

		$jacket = $this->product( 100, 10 );
		$boots  = $this->product( 100 );

		$jacket_key = WC()->cart->add_to_cart( $jacket->get_id() );
		$boots_key  = WC()->cart->add_to_cart( $boots->get_id() );

		$this->assertTrue( WC()->cart->apply_coupon( 'skips' ) );

		$totals = $this->line_totals();

		$this->assertSame( 90.0, $totals[ $jacket_key ] );
		$this->assertSame( 90.0, $totals[ $boots_key ] );
	}

	/**
	 * A fixed amount skipping sale items leaves the other lines the discount.
	 *
	 * @return void
	 */
	public function test_fixed_amount_skips_a_countdown_line_without_refusing_the_cart(): void {
		$this->save_coupon(
			'save30',
			[
				'discount_type' => SmartCoupon::TYPE_FIXED,
				'amount'        => 30,
				'skip_sale'     => true,
			]
		);

		$jacket = $this->product( 120, 10 );
		$boots  = $this->product( 95 );

		$jacket_key = WC()->cart->add_to_cart( $jacket->get_id() );
		$boots_key  = WC()->cart->add_to_cart( $boots->get_id() );

		$this->assertTrue( WC()->cart->apply_coupon( 'save30' ) );

		$totals = $this->line_totals();

		$this->assertSame( 108.0, $totals[ $jacket_key ] );
		$this->assertSame( 65.0, $totals[ $boots_key ] );
	}

	/**
	 * A coupon that reaches no line is refused rather than doing nothing.
	 *
	 * @return void
	 */
	public function test_a_coupon_reaching_no_line_is_refused(): void {
		$this->save_coupon( 'skips-all', [ 'skip_sale' => true ] );

		WC()->cart->add_to_cart( $this->product( 100, 10 )->get_id() );

		$this->assertFalse( WC()->cart->apply_coupon( 'skips-all' ) );
	}

	/**
	 * A fixed amount with "Applies to" stays on the products it applies to.
	 *
	 * @return void
	 */
	public function test_fixed_amount_stays_on_its_products(): void {
		$boots  = $this->product( 100 );
		$jacket = $this->product( 100 );

		$this->save_coupon(
			'boots20',
			[
				'discount_type' => SmartCoupon::TYPE_FIXED,
				'amount'        => 20,
				'apply_to'      => 'products',
				'product_ids'   => [ $boots->get_id() ],
			]
		);

		$boots_key  = WC()->cart->add_to_cart( $boots->get_id() );
		$jacket_key = WC()->cart->add_to_cart( $jacket->get_id() );

		$this->assertTrue( WC()->cart->apply_coupon( 'boots20' ) );

		$totals = $this->line_totals();

		$this->assertSame( 80.0, $totals[ $boots_key ] );
		$this->assertSame( 100.0, $totals[ $jacket_key ] );
	}

	/**
	 * A campaign changes the amount in its window; the saved coupon doesn't.
	 *
	 * @return void
	 */
	public function test_campaign_amount_applies_and_is_never_written(): void {
		$coupon = $this->save_coupon( 'weekly', [ 'amount' => 10 ] );

		CampaignRepository::attach(
			(int) CampaignRepository::save(
				[
					'name'      => 'Black Friday',
					'status'    => 'scheduled',
					'starts_at' => wp_date( 'Y-m-d H:i:s', time() - DAY_IN_SECONDS ),
					'ends_at'   => wp_date( 'Y-m-d H:i:s', time() + DAY_IN_SECONDS ),
				]
			),
			OfferVersions::SMART_COUPON,
			$coupon->get_id(),
			[ 'amount' => 25 ]
		);

		CampaignRepository::flush();

		$key = WC()->cart->add_to_cart( $this->product( 100 )->get_id() );

		$this->assertTrue( WC()->cart->apply_coupon( 'weekly' ) );
		$this->assertSame( 75.0, $this->line_totals()[ $key ] );

		$read = new WC_Coupon( $coupon->get_id() );

		$this->assertSame( '10', (string) $read->get_amount() );
		$this->assertSame( '10', (string) $read->get_amount( 'edit' ) );
		$this->assertSame( '10', (string) get_post_meta( $coupon->get_id(), 'coupon_amount', true ) );

		$rest = $this->rest( 'GET', '/' . $coupon->get_id() )->get_data();

		$this->assertSame( 10.0, $rest['amount'] );
		$this->assertSame( 'Everyday + Black Friday', $rest['used_in'] );
	}

	/**
	 * A pricing nested in another (a gift added mid-calculation) doesn't
	 * end the outer one.
	 *
	 * @return void
	 */
	public function test_nested_pricing_keeps_the_live_amount(): void {
		$coupon = $this->save_coupon( 'nested', [ 'amount' => 10 ] );

		CampaignRepository::attach(
			(int) CampaignRepository::save(
				[
					'name'      => 'Now',
					'status'    => 'scheduled',
					'starts_at' => wp_date( 'Y-m-d H:i:s', time() - DAY_IN_SECONDS ),
					'ends_at'   => wp_date( 'Y-m-d H:i:s', time() + DAY_IN_SECONDS ),
				]
			),
			OfferVersions::SMART_COUPON,
			$coupon->get_id(),
			[ 'amount' => 25 ]
		);

		CampaignRepository::flush();

		$pricing = new CouponAmount();

		$pricing->start_pricing();
		$pricing->start_pricing();
		$pricing->stop_pricing();

		$this->assertSame( '25', (string) ( new WC_Coupon( $coupon->get_id() ) )->get_amount() );

		$pricing->stop_pricing();

		$this->assertSame( '10', (string) ( new WC_Coupon( $coupon->get_id() ) )->get_amount() );
	}

	/**
	 * An automatic coupon that stops qualifying leaves without a notice.
	 *
	 * @return void
	 */
	public function test_an_automatic_coupon_that_stops_qualifying_leaves_silently(): void {
		$auto = $this->save_coupon( '', [ 'method' => SmartCoupon::AUTOMATIC ] );
		$key  = WC()->cart->add_to_cart( $this->product( 100 )->get_id() );

		$this->assertSame( 90.0, $this->line_totals()[ $key ] );

		update_option( 'spsg_active_module_ids', [] );

		$this->assertSame( 100.0, $this->line_totals()[ $key ] );
		$this->assertNotContains( $auto->get_code(), WC()->cart->get_applied_coupons() );
		$this->assertSame( 0, wc_notice_count( 'error' ) );
	}

	/**
	 * Outside the campaign window the saved amount applies.
	 *
	 * @return void
	 */
	public function test_saved_amount_applies_when_no_campaign_runs(): void {
		$coupon = $this->save_coupon( 'weekly', [ 'amount' => 10 ] );

		CampaignRepository::attach(
			(int) CampaignRepository::save(
				[
					'name'      => 'Later',
					'status'    => 'scheduled',
					'starts_at' => wp_date( 'Y-m-d H:i:s', time() + DAY_IN_SECONDS ),
					'ends_at'   => wp_date( 'Y-m-d H:i:s', time() + 2 * DAY_IN_SECONDS ),
				]
			),
			OfferVersions::SMART_COUPON,
			$coupon->get_id(),
			[ 'amount' => 25 ]
		);

		CampaignRepository::flush();

		$key = WC()->cart->add_to_cart( $this->product( 100 )->get_id() );

		$this->assertTrue( WC()->cart->apply_coupon( 'weekly' ) );
		$this->assertSame( 90.0, $this->line_totals()[ $key ] );
	}

	/**
	 * A campaign runs a coupon past its own expiry date.
	 *
	 * @return void
	 */
	public function test_campaign_dates_override_a_coupons_own(): void {
		$coupon = $this->save_coupon(
			'old',
			[
				'date_start' => wp_date( 'Y-m-d\TH:i', time() - 5 * DAY_IN_SECONDS ),
				'date_end'   => wp_date( 'Y-m-d\TH:i', time() - 2 * DAY_IN_SECONDS ),
			]
		);

		WC()->cart->add_to_cart( $this->product( 100 )->get_id() );

		$this->assertFalse( WC()->cart->apply_coupon( 'old' ) );
		$this->assertTrue( wc_has_notice( esc_html( "OLD isn't a valid coupon right now." ), 'error' ) );

		wc_clear_notices();

		CampaignRepository::attach(
			(int) CampaignRepository::save(
				[
					'name'      => 'Now',
					'status'    => 'scheduled',
					'starts_at' => wp_date( 'Y-m-d H:i:s', time() - DAY_IN_SECONDS ),
					'ends_at'   => wp_date( 'Y-m-d H:i:s', time() + DAY_IN_SECONDS ),
				]
			),
			OfferVersions::SMART_COUPON,
			$coupon->get_id()
		);

		CampaignRepository::flush();

		$this->assertTrue( WC()->cart->apply_coupon( 'old' ) );
	}

	/**
	 * A campaign-only coupon works only while its campaign runs.
	 *
	 * @return void
	 */
	public function test_a_campaign_only_coupon_is_offline_outside_its_campaign(): void {
		$promotion = (int) CampaignRepository::save(
			[
				'name'      => 'Black Friday',
				'status'    => 'scheduled',
				'starts_at' => wp_date( 'Y-m-d H:i:s', time() + DAY_IN_SECONDS ),
				'ends_at'   => wp_date( 'Y-m-d H:i:s', time() + 2 * DAY_IN_SECONDS ),
			]
		);
		$coupon    = $this->save_coupon( 'bf25', [ 'date_start' => '' ] );
		$row       = CampaignRepository::add_campaign_only( $promotion, OfferVersions::SMART_COUPON, [ 'code' => 'bf25' ] );

		$coupon->update_meta_data( SmartCoupon::CAMPAIGN_OFFER, $row );
		$coupon->save();
		CampaignRepository::flush();

		WC()->cart->add_to_cart( $this->product( 100 )->get_id() );

		$this->assertFalse( WC()->cart->apply_coupon( 'bf25' ) );

		$this->assertSame( 'Campaign-only: Black Friday', $this->rest( 'GET', '/' . $coupon->get_id() )->get_data()['used_in'] );
	}

	/**
	 * A Free store has one active everyday coupon; the newest pauses.
	 *
	 * @return void
	 */
	public function test_free_keeps_one_active_everyday_coupon(): void {
		$this->pro = false;

		$older = $this->save_coupon( 'older' );

		$this->assertFalse( SmartCouponRepository::can_create() );

		$blocked = $this->rest(
			'POST',
			'',
			[
				'method' => SmartCoupon::CODE,
				'code'   => 'blocked',
				'title'  => 'Blocked',
				'amount' => 5,
			]
		);

		$this->assertSame( 403, $blocked->get_status() );
		$this->assertSame( 'salesbooster_limit_exceeded', $blocked->get_data()['code'] );

		// Another coupon reaches the limit by being turned on from a draft.
		$this->pro = true;

		$newer = $this->save_coupon( 'newer', [ 'status' => 'inactive' ] );

		$this->pro = false;

		SmartCouponRepository::set_active( $newer, true );

		WC()->cart->add_to_cart( $this->product( 100 )->get_id() );

		$this->assertTrue( WC()->cart->apply_coupon( 'older' ) );
		WC()->cart->remove_coupons();

		$this->assertFalse( WC()->cart->apply_coupon( 'newer' ) );
		$this->assertTrue( wc_has_notice( esc_html( "NEWER isn't a valid coupon right now." ), 'error' ) );

		$this->assertSame( 'Paused: over Free limit', $this->rest( 'GET', '/' . $newer->get_id() )->get_data()['chip'] );
		$this->assertSame( '', $this->rest( 'GET', '/' . $older->get_id() )->get_data()['chip'] );
	}

	/**
	 * Coupons with Pro's options can't be saved, or used, without Pro.
	 *
	 * @return void
	 */
	public function test_pro_options_need_pro(): void {
		$with_pro = $this->save_coupon( 'firsts', [ 'eligibility' => 'first_time' ] );

		$this->pro = false;
		OfferLimits::flush();

		$refused = SmartCouponRepository::save(
			[
				'method'     => SmartCoupon::LINK,
				'code'       => 'LINK5',
				'title'      => 'Link',
				'amount'     => 5,
				'date_start' => wp_date( 'Y-m-d\TH:i', time() - HOUR_IN_SECONDS ),
			]
		);

		$this->assertSame( 'smart_coupon_needs_pro', $refused->get_error_code() );

		WC()->cart->add_to_cart( $this->product( 100 )->get_id() );

		$this->assertFalse( WC()->cart->apply_coupon( $with_pro->get_code() ) );

		$saved = SmartCouponRepository::save( [ 'title' => 'Renamed' ], new WC_Coupon( $with_pro->get_id() ) );

		$this->assertInstanceOf( WC_Coupon::class, $saved );
		$this->assertSame( 'Renamed', $saved->get_meta( SmartCoupon::TITLE ) );
	}

	/**
	 * Buy more save more gives the largest tier reached; below the first, nothing.
	 *
	 * @return void
	 */
	public function test_tiers_give_the_largest_reached_percent(): void {
		$this->save_coupon(
			'tiers',
			[
				'discount_type' => SmartCoupon::TYPE_TIERS,
				'tiers'         => [ '2:10', '4:25' ],
			]
		);

		$book = $this->product( 100 );
		$key  = WC()->cart->add_to_cart( $book->get_id() );

		$this->assertFalse( WC()->cart->apply_coupon( 'tiers' ) );

		wc_clear_notices();
		WC()->cart->set_quantity( $key, 2 );

		$this->assertTrue( WC()->cart->apply_coupon( 'tiers' ) );
		$this->assertSame( 180.0, $this->line_totals()[ $key ] );

		WC()->cart->set_quantity( $key, 4 );

		$this->assertSame( 300.0, $this->line_totals()[ $key ] );
	}

	/**
	 * First-time and returning eligibility follow the customer's paid orders.
	 *
	 * @return void
	 */
	public function test_first_time_and_returning_eligibility(): void {
		$this->save_coupon( 'firsts', [ 'eligibility' => 'first_time' ] );
		$this->save_coupon( 'returns', [ 'eligibility' => 'returning' ] );

		WC()->cart->add_to_cart( $this->product( 100 )->get_id() );

		$this->assertTrue( WC()->cart->apply_coupon( 'firsts' ) );
		$this->assertFalse( WC()->cart->apply_coupon( 'returns' ) );

		$order = wc_create_order( [ 'customer_id' => get_current_user_id() ] );
		$order->set_status( 'completed' );
		$order->save();

		wc_clear_notices();
		WC()->cart->remove_coupons();

		$this->assertFalse( WC()->cart->apply_coupon( 'firsts' ) );
		$this->assertTrue( WC()->cart->apply_coupon( 'returns' ) );
	}

	/**
	 * Role eligibility follows the logged-in customer.
	 *
	 * @return void
	 */
	public function test_role_eligibility(): void {
		$this->save_coupon(
			'staff',
			[
				'eligibility' => 'roles',
				'roles'       => [ 'editor' ],
			]
		);

		WC()->cart->add_to_cart( $this->product( 100 )->get_id() );

		$this->assertFalse( WC()->cart->apply_coupon( 'staff' ) );

		wp_set_current_user( self::factory()->user->create( [ 'role' => 'editor' ] ) );
		wc_clear_notices();

		$this->assertTrue( WC()->cart->apply_coupon( 'staff' ) );
	}

	/**
	 * Spike: a $0 Buy X get Y code applies, reads "Free item added", and
	 * unlocks its BOGO rule while it is in the cart.
	 *
	 * @return void
	 */
	public function test_buy_x_get_y_code_unlocks_its_rule_at_zero(): void {
		$boots = $this->product( 95 );
		$gift  = $this->product( 40 );
		$rule  = $this->create_global_offer(
			[
				'name_of_order_bogo'        => 'Boots and a gift',
				'bogo_deal_type'            => 'different',
				'offered_products'          => [ $boots->get_id() ],
				'get_alternate_products'    => [ $gift->get_id() ],
				'minimum_quantity_required' => 1,
				'offer_product_id'          => $gift->get_id(),
			]
		);

		$this->save_coupon(
			'boots-deal',
			[
				'discount_type' => SmartCoupon::TYPE_BUY_X_GET_Y,
				'bogo_rule'     => $rule,
			]
		);

		$this->assertTrue( (bool) BogoDataManager::get_bogo_offer( $rule )[ BogoDataManager::ONLY_WITH_COUPON ] );

		WC()->cart->add_to_cart( $boots->get_id() );

		$this->assertCount( 1, WC()->cart->get_cart(), 'The rule stays held back without its coupon.' );

		$this->assertTrue( WC()->cart->apply_coupon( 'boots-deal' ) );
		$this->assertContains( 'boots-deal', WC()->cart->get_applied_coupons() );
		$this->assertCount( 2, WC()->cart->get_cart(), 'Applying the coupon adds the gift.' );

		WC()->cart->calculate_totals();

		ob_start();
		wc_cart_totals_coupon_html( new WC_Coupon( 'boots-deal' ) );
		$html = (string) ob_get_clean();

		$this->assertStringContainsString( 'Free item added', $html );
		$this->assertSame( 0.0, (float) WC()->cart->get_coupon_discount_amount( 'boots-deal' ) );
	}

	/**
	 * A same-product Buy X get Y code adds its gift on applying, as Pro only
	 * adds those on an add or a quantity change, and takes it away on removal.
	 *
	 * @return void
	 */
	public function test_buy_x_get_y_code_adds_and_removes_a_same_product_gift(): void {
		$boots = $this->product( 95 );

		$this->save_coupon(
			'boots-same',
			[
				'discount_type' => SmartCoupon::TYPE_BUY_X_GET_Y,
				'bogo_rule'     => $this->create_global_offer(
					[
						'name_of_order_bogo'        => 'Buy 2 boots get 1 free',
						'bogo_deal_type'            => 'same',
						'offered_products'          => [ $boots->get_id() ],
						'minimum_quantity_required' => 2,
					]
				),
			]
		);

		WC()->cart->add_to_cart( $boots->get_id(), 2 );
		$this->assertCount( 1, WC()->cart->get_cart() );

		$this->assertTrue( WC()->cart->apply_coupon( 'boots-same' ) );
		WC()->cart->calculate_totals();

		$this->assertCount( 2, WC()->cart->get_cart(), 'Applying the code adds the gift.' );
		$this->assertSame( 190.0, (float) WC()->cart->get_total( 'edit' ), 'The gift is free.' );

		wc_clear_notices();

		$this->assertTrue( WC()->cart->remove_coupon( 'boots-same' ) );
		WC()->cart->calculate_totals();

		$this->assertCount( 1, WC()->cart->get_cart(), 'Removing the code takes the gift away.' );
		$this->assertEmpty( wc_get_notices( 'notice' ), 'The deal did not end: the shopper removed the code.' );
	}

	/**
	 * A code applied below the rule's quantity adds the gift once the line
	 * reaches it.
	 *
	 * @return void
	 */
	public function test_buy_x_get_y_code_applied_before_the_quantity_is_reached(): void {
		$boots = $this->product( 95 );
		$gift  = $this->product( 40 );

		$this->save_coupon(
			'boots-later',
			[
				'discount_type' => SmartCoupon::TYPE_BUY_X_GET_Y,
				'bogo_rule'     => $this->create_global_offer(
					[
						'name_of_order_bogo'        => 'Boots and a gift',
						'bogo_deal_type'            => 'different',
						'offered_products'          => [ $boots->get_id() ],
						'get_alternate_products'    => [ $gift->get_id() ],
						'minimum_quantity_required' => 2,
						'offer_product_id'          => $gift->get_id(),
					]
				),
			]
		);

		$key = WC()->cart->add_to_cart( $boots->get_id() );

		$this->assertTrue( WC()->cart->apply_coupon( 'boots-later' ) );
		$this->assertCount( 1, WC()->cart->get_cart(), 'No gift below the quantity.' );

		WC()->cart->set_quantity( $key, 2 );
		OrderBogo::instance()->handle_cart_update();

		$this->assertCount( 2, WC()->cart->get_cart(), 'The gift arrives at the quantity.' );
	}

	/**
	 * A product rule has no name of its own, so the clash message says "your deal".
	 *
	 * @return void
	 */
	public function test_clash_with_a_product_rule_reads_your_deal(): void {
		$boots = $this->product( 95 );
		$gift  = $this->product( 40 );

		BogoDataManager::save_product_bogo_settings(
			$boots->get_id(),
			0,
			[
				'get_different_product_field' => $gift->get_id(),
				'offer_type'                  => 'free',
				'minimum_quantity_required'   => 1,
			]
		);

		$this->save_coupon( 'ten10' );

		WC()->cart->add_to_cart( $boots->get_id() );

		$this->assertFalse( WC()->cart->apply_coupon( 'ten10' ) );
		$this->assertTrue( wc_has_notice( esc_html( "TEN10 wasn't applied because your deal saves you more." ), 'error' ) );
	}

	/**
	 * An automatic Buy X get Y leaves its rule on, for the BOGO to run itself.
	 *
	 * @return void
	 */
	public function test_automatic_buy_x_get_y_leaves_the_rule_on(): void {
		$rule = $this->create_global_offer( [ 'name_of_order_bogo' => 'Auto deal' ] );

		$this->save_coupon(
			'',
			[
				'method'        => SmartCoupon::AUTOMATIC,
				'discount_type' => SmartCoupon::TYPE_BUY_X_GET_Y,
				'bogo_rule'     => $rule,
			]
		);

		$this->assertArrayNotHasKey( BogoDataManager::ONLY_WITH_COUPON, BogoDataManager::get_bogo_offer( $rule ) );
	}

	/**
	 * Deleting a Buy X get Y code releases its rule.
	 *
	 * @return void
	 */
	public function test_deleting_a_buy_x_get_y_code_releases_its_rule(): void {
		$rule = $this->create_global_offer( [ 'name_of_order_bogo' => 'Coupon deal' ] );

		$coupon = $this->save_coupon(
			'releases',
			[
				'discount_type' => SmartCoupon::TYPE_BUY_X_GET_Y,
				'bogo_rule'     => $rule,
			]
		);

		$this->assertSame( 204, $this->rest( 'DELETE', '/' . $coupon->get_id() )->get_status() );
		$this->assertArrayNotHasKey( BogoDataManager::ONLY_WITH_COUPON, BogoDataManager::get_bogo_offer( $rule ) );
	}

	/**
	 * A code already used by another coupon is refused.
	 *
	 * @return void
	 */
	public function test_a_taken_code_is_refused(): void {
		$this->save_coupon( 'taken', [ 'status' => 'inactive' ] );

		$refused = SmartCouponRepository::save(
			[
				'method' => SmartCoupon::CODE,
				'code'   => 'TAKEN',
				'title'  => 'Other',
				'amount' => 5,
			]
		);

		$this->assertSame( 'smart_coupon_code_taken', $refused->get_error_code() );
	}

	/**
	 * Every route needs the capability.
	 *
	 * @return void
	 */
	public function test_routes_need_the_capability(): void {
		wp_set_current_user( self::factory()->user->create( [ 'role' => 'subscriber' ] ) );

		$this->assertSame( 403, $this->rest( 'GET', '' )->get_status() );
		$this->assertSame( 403, $this->rest( 'POST', '', [ 'title' => 'x' ] )->get_status() );
		$this->assertSame( 403, $this->rest( 'GET', '/editor' )->get_status() );
	}

	/**
	 * The list and editor routes answer in the shapes the admin reads.
	 *
	 * @return void
	 */
	public function test_list_and_editor_routes(): void {
		$coupon = $this->save_coupon( 'listed', [ 'amount' => 15 ] );

		$list = $this->rest( 'GET', '' );

		$this->assertSame( '1', $list->get_headers()['X-WP-Total'] );
		$this->assertSame( '1', $list->get_headers()['X-SPSG-Can-Create'] );
		$this->assertSame( $coupon->get_id(), $list->get_data()[0]['id'] );
		$this->assertSame( 'Everyday', $list->get_data()[0]['used_in'] );

		$editor = $this->rest( 'GET', '/editor' )->get_data();

		$this->assertArrayHasKey( 'bogo_rules', $editor );
		$this->assertSame( 'select', ( (array) $editor['schema'] )['method']['type'] );

		$status = $this->rest( 'POST', '/' . $coupon->get_id() . '/status', [ 'status' => 'inactive' ] );

		$this->assertSame( 'inactive', $status->get_data()['status'] );
		$this->assertSame( 'draft', get_post_status( $coupon->get_id() ) );

		// The record list's switch sends `yes` / `no`.
		$status = $this->rest( 'POST', '/' . $coupon->get_id() . '/status', [ 'status' => 'yes' ] );

		$this->assertSame( 'active', $status->get_data()['status'] );
		$this->assertSame( 'publish', get_post_status( $coupon->get_id() ) );

		$status = $this->rest( 'POST', '/' . $coupon->get_id() . '/status', [ 'status' => 'no' ] );

		$this->assertSame( 'inactive', $status->get_data()['status'] );
	}

	/**
	 * A link coupon waits in the session for a cart that holds something.
	 *
	 * @return void
	 */
	public function test_a_link_coupon_waits_for_the_cart(): void {
		$coupon = $this->save_coupon(
			'LINK20',
			[
				'method' => SmartCoupon::LINK,
				'amount' => 20,
			]
		);

		$this->assertSame( 'link20', $coupon->get_code(), 'the merchant sets a link coupon\'s code' );

		// `read_link()` sets a cookie, which the test run's output prevents.
		WC()->session->set( LinkCoupons::SESSION_KEY, $coupon->get_code() );

		$links = new LinkCoupons();
		$links->apply_pending_coupon();

		$this->assertSame( [], WC()->cart->get_applied_coupons() );

		$key = WC()->cart->add_to_cart( $this->product( 100 )->get_id() );
		$links->apply_pending_coupon();

		$this->assertSame( 80.0, $this->line_totals()[ $key ] );
	}
}
