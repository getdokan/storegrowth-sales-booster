<?php
/**
 * Shared setup of the Smart Coupons tests.
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Test\SmartCoupons;

use StorePulse\StoreGrowth\Modules\BoGo\OrderBogo;
use StorePulse\StoreGrowth\Modules\CountdownTimer\CommonHooks;
use StorePulse\StoreGrowth\Modules\SmartCoupons\CouponGuard;
use StorePulse\StoreGrowth\Modules\SmartCoupons\CouponScreens;
use StorePulse\StoreGrowth\Modules\SmartCoupons\REST\SmartCouponsController;
use StorePulse\StoreGrowth\Modules\SmartCoupons\SmartCouponRepository;
use StorePulse\StoreGrowth\Offers\OfferLimits;
use StorePulse\StoreGrowth\Pricing\CouponAmount;
use StorePulse\StoreGrowth\Pricing\CouponGate;
use StorePulse\StoreGrowth\Pricing\Referee;
use StorePulse\StoreGrowth\Pricing\SmartCoupon;
use StorePulse\StoreGrowth\Test\StoreGrowthTestCase;
use WC_Coupon;
use WP_REST_Request;
use WP_REST_Server;

/**
 * An empty cart with the hooks of a live store and the module on; helpers to
 * save coupons and read totals. StoreGrowth Pro's campaign tests extend it.
 */
abstract class SmartCouponsTestCase extends StoreGrowthTestCase {

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
	protected bool $pro = true;

	/**
	 * Run on an empty cart with the hooks of a live store and the module on.
	 *
	 * @return void
	 */
	public function setUp(): void {
		parent::setUp();

		global $wp_rest_server;

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
	protected function product( float $price, int $discount = 0 ): \WC_Product_Simple {
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
	protected function save_coupon( string $code, array $values = [] ): WC_Coupon {
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
	protected function plain_coupon( string $code, string $type, float $amount ): WC_Coupon {
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
	protected function line_totals(): array {
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
	protected function rest( string $method, string $path, array $body = [] ): \WP_REST_Response {
		$request = new WP_REST_Request( $method, '/sales-booster/v1/smart-coupons' . $path );

		if ( $body ) {
			$request->set_header( 'Content-Type', 'application/json' );
			$request->set_body( wp_json_encode( $body ) );
		}

		return rest_do_request( $request );
	}
}
