<?php
/**
 * What shoppers see of the automatic coupons before they apply: a badge on
 * the product page and a nudge in the cart (pro#341).
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Modules\SmartCoupons;

use StorePulse\StoreGrowth\Helper;
use StorePulse\StoreGrowth\Interfaces\HookRegistry;
use StorePulse\StoreGrowth\Pricing\CartLine;
use StorePulse\StoreGrowth\Pricing\DealList;
use StorePulse\StoreGrowth\Pricing\SmartCoupon;
use WC_Cart;
use WC_Coupon;
use WC_Product;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * An automatic coupon applies on its own, so shoppers learn of it here: the
 * product page says what it gives, and the cart says how far a minimum is.
 * Code and link coupons need the shopper to act, so they show neither.
 *
 * @since 3.1.0
 */
class CouponPromos implements HookRegistry {

	/**
	 * Stylesheet handle.
	 *
	 * @since 3.1.0
	 */
	const STYLE = 'spsg-coupon-promos';

	/**
	 * The automatic coupons the shopper may use, this request.
	 *
	 * @since 3.1.0
	 *
	 * @var WC_Coupon[]|null
	 */
	private static $live = null;

	/**
	 * Register hooks.
	 *
	 * @since 3.1.0
	 *
	 * @return void
	 */
	public function register_hooks(): void {
		add_action( 'wp_enqueue_scripts', [ $this, 'enqueue_style' ] );
		// Under the price (10), above the excerpt (20).
		add_action( 'woocommerce_single_product_summary', [ $this, 'render_badge' ], 11 );
		add_action( 'woocommerce_before_cart_table', [ $this, 'render_nudge' ] );
		add_filter( 'spsg_store_api_cart_data', [ $this, 'add_nudge_to_cart_data' ], 10, 2 );
		add_action( 'save_post_shop_coupon', [ self::class, 'flush' ] );
	}

	/**
	 * The automatic coupons running now that the current shopper may use.
	 *
	 * @since 3.1.0
	 *
	 * @return WC_Coupon[]
	 */
	public static function live_coupons(): array {
		// Read once a request: the product page, the cart and the Store API ask.
		if ( null !== self::$live ) {
			return self::$live;
		}

		self::$live = [];

		foreach ( SmartCoupon::automatic_codes() as $code ) {
			$coupon = new WC_Coupon( $code );

			if ( SmartCoupon::is_automatic( $coupon ) && ! SmartCoupon::paused_for_pro( $coupon ) && SmartCoupon::effective( $coupon )['live'] && CouponGuard::customer_may_use( $coupon ) && self::has_uses_left( $coupon ) ) {
				self::$live[] = $coupon;
			}
		}

		return self::$live;
	}

	/**
	 * Forget this request's coupons, after one is saved.
	 *
	 * @since 3.1.0
	 *
	 * @return void
	 */
	public static function flush(): void {
		self::$live = null;
	}

	/**
	 * Whether the current shopper can still use a coupon under WooCommerce's
	 * own limits: total uses, uses per customer and allowed emails. A guest
	 * is known only by the cart, so a per-customer or email limit is left to
	 * the checkout, but a coupon limited to emails isn't shown to guests.
	 *
	 * @since 3.1.0
	 *
	 * @param WC_Coupon $coupon Coupon.
	 *
	 * @return bool
	 */
	private static function has_uses_left( WC_Coupon $coupon ): bool {
		$limit = (int) $coupon->get_usage_limit();

		if ( $limit > 0 && (int) $coupon->get_usage_count() >= $limit ) {
			return false;
		}

		$user   = wp_get_current_user();
		$emails = (array) $coupon->get_email_restrictions();

		if ( $emails && ( ! $user->exists() || ! WC()->cart || ! WC()->cart->is_coupon_emails_allowed( [ $user->user_email ], $emails ) ) ) {
			return false;
		}

		$per_user = (int) $coupon->get_usage_limit_per_user();
		$store    = $coupon->get_data_store();

		return ! ( $per_user > 0 && $user->exists() && $store && (int) $store->get_usage_by_user_id( $coupon, $user->ID ) >= $per_user );
	}

	/**
	 * What a coupon gives, in a few words: "30% off", "$5 off", "Buy more,
	 * save more", "a free item".
	 *
	 * @since 3.1.0
	 *
	 * @param WC_Coupon $coupon Coupon.
	 *
	 * @return string
	 */
	public static function deal_text( WC_Coupon $coupon ): string {
		$amount = (float) ( SmartCoupon::effective( $coupon )['values']['amount'] ?? $coupon->get_amount() );

		switch ( (string) $coupon->get_meta( SmartCoupon::TYPE ) ) {
			case SmartCoupon::TYPE_FIXED:
				/* translators: %s: amount, e.g. "$5.00". */
				return sprintf( __( '%s off', 'storegrowth-sales-booster' ), self::money( $amount ) );
			case SmartCoupon::TYPE_TIERS:
				return __( 'Buy more, save more', 'storegrowth-sales-booster' );
			case SmartCoupon::TYPE_BUY_X_GET_Y:
				return __( 'a free item', 'storegrowth-sales-booster' );
			default:
				/* translators: %s: percent number. */
				return sprintf( __( '%s%% off', 'storegrowth-sales-booster' ), wc_format_localized_decimal( wc_trim_zeros( (string) $amount ) ) );
		}
	}

	/**
	 * The product page badge of a coupon on a product, or '' when it doesn't
	 * reach the product.
	 *
	 * @since 3.1.0
	 *
	 * @param WC_Coupon  $coupon  Coupon.
	 * @param WC_Product $product Product.
	 *
	 * @return string
	 */
	public static function badge_text( WC_Coupon $coupon, WC_Product $product ): string {
		// A Buy X get Y coupon's deal is its BOGO rule, which shows its own message.
		if ( SmartCoupon::is_buy_x_get_y( $coupon ) || ! DealList::coupon_applies( $coupon, $product, [] ) ) {
			return '';
		}

		$deal     = self::deal_text( $coupon );
		$minimum  = (float) $coupon->get_minimum_amount();
		$quantity = (int) $coupon->get_meta( SmartCoupon::MIN_QUANTITY );

		if ( $minimum > 0 ) {
			/* translators: 1: deal, e.g. "30% off", 2: amount, e.g. "$50.00". */
			return sprintf( __( '%1$s on orders of %2$s or more', 'storegrowth-sales-booster' ), $deal, self::money( $minimum ) );
		}

		if ( $quantity > 1 ) {
			/* translators: 1: deal, e.g. "30% off", 2: number of items. */
			return sprintf( __( '%1$s when you buy %2$d or more', 'storegrowth-sales-booster' ), $deal, $quantity );
		}

		/* translators: %s: deal, e.g. "30% off". */
		return sprintf( __( '%s in your cart', 'storegrowth-sales-booster' ), $deal );
	}

	/**
	 * The badge under the price of the product page.
	 *
	 * @since 3.1.0
	 *
	 * @return void
	 */
	public function render_badge(): void {
		global $product;

		if ( ! $product instanceof WC_Product ) {
			return;
		}

		foreach ( self::live_coupons() as $coupon ) {
			$text = self::badge_text( $coupon, $product );

			if ( '' !== $text ) {
				printf(
					'<p class="spsg-coupon-badge"><span class="spsg-coupon-badge__deal">%1$s</span> <span class="spsg-coupon-badge__name">%2$s</span></p>',
					esc_html( $text ),
					esc_html( SmartCoupon::name( $coupon ) )
				);

				// One badge: the first coupon that reaches the product.
				return;
			}
		}
	}

	/**
	 * The nudge for the automatic coupon closest to its minimum, among those
	 * not in the cart that reach one of its lines; '' when there is none.
	 *
	 * @since 3.1.0
	 *
	 * @param WC_Cart $cart Cart.
	 *
	 * @return string
	 */
	public static function nudge_text( WC_Cart $cart ): string {
		$applied  = $cart->get_applied_coupons();
		$subtotal = DealList::subtotal_without_gifts( $cart );
		$quantity = 0;
		$lines    = [];

		foreach ( $cart->get_cart() as $item ) {
			if ( ! CartLine::is_gift( $item ) && isset( $item['data'] ) && $item['data'] instanceof WC_Product ) {
				$quantity += (int) $item['quantity'];
				$lines[]   = $item;
			}
		}

		if ( ! $lines ) {
			return '';
		}

		$best = null;

		foreach ( self::live_coupons() as $coupon ) {
			if ( SmartCoupon::is_buy_x_get_y( $coupon ) || in_array( $coupon->get_code(), $applied, true ) || ! self::reaches_a_line( $coupon, $lines ) ) {
				continue;
			}

			$minimum = (float) $coupon->get_minimum_amount();
			$items   = (int) $coupon->get_meta( SmartCoupon::MIN_QUANTITY );

			if ( $minimum > $subtotal ) {
				$share = ( $minimum - $subtotal ) / $minimum;
				/* translators: 1: amount still to add, e.g. "$20.00", 2: deal, e.g. "30% off". */
				$text = sprintf( __( 'Add %1$s more to unlock %2$s', 'storegrowth-sales-booster' ), self::money( $minimum - $subtotal ), self::deal_text( $coupon ) );
			} elseif ( $items > $quantity ) {
				$share = ( $items - $quantity ) / $items;
				/* translators: 1: number of items still to add, 2: deal, e.g. "30% off". */
				$text = sprintf( _n( 'Add %1$d more item to unlock %2$s', 'Add %1$d more items to unlock %2$s', $items - $quantity, 'storegrowth-sales-booster' ), $items - $quantity, self::deal_text( $coupon ) );
			} else {
				continue;
			}

			// The one the shopper is closest to.
			if ( null === $best || $share < $best[0] ) {
				$best = [ $share, $text ];
			}
		}

		return $best ? $best[1] : '';
	}

	/**
	 * The nudge above the classic cart table.
	 *
	 * @since 3.1.0
	 *
	 * @return void
	 */
	public function render_nudge(): void {
		$text = WC()->cart ? self::nudge_text( WC()->cart ) : '';

		if ( '' !== $text ) {
			printf( '<div class="woocommerce-info spsg-coupon-nudge">%s</div>', esc_html( $text ) );
		}
	}

	/**
	 * The nudge on the Store API cart, for the block cart (ADR-015).
	 *
	 * @since 3.1.0
	 *
	 * @param array   $data Data under `extensions.storegrowth`.
	 * @param WC_Cart $cart Cart.
	 *
	 * @return array
	 */
	public function add_nudge_to_cart_data( $data, $cart ): array {
		$data = (array) $data;
		$text = $cart instanceof WC_Cart ? self::nudge_text( $cart ) : '';

		$data['coupon_nudge'] = '' !== $text ? $text : null;

		return $data;
	}

	/**
	 * Whether a coupon reaches one of these cart lines.
	 *
	 * @since 3.1.0
	 *
	 * @param WC_Coupon $coupon Coupon.
	 * @param array[]   $lines  Cart lines.
	 *
	 * @return bool
	 */
	private static function reaches_a_line( WC_Coupon $coupon, array $lines ): bool {
		foreach ( $lines as $item ) {
			if ( DealList::coupon_applies( $coupon, $item['data'], $item ) ) {
				return true;
			}
		}

		return false;
	}

	/**
	 * An amount as plain text in the store's currency format.
	 *
	 * @since 3.1.0
	 *
	 * @param float $amount Amount.
	 *
	 * @return string
	 */
	private static function money( float $amount ): string {
		return html_entity_decode( wp_strip_all_tags( wc_price( $amount ) ), ENT_QUOTES, 'UTF-8' );
	}

	/**
	 * The badge's stylesheet, on product pages.
	 *
	 * @since 3.1.0
	 *
	 * @return void
	 */
	public function enqueue_style(): void {
		if ( ! is_product() ) {
			return;
		}

		$path = Helper::get_modules_path( 'smart-coupons/assets/css/coupon-promos.css' );

		wp_enqueue_style( self::STYLE, Helper::get_modules_url( 'smart-coupons/assets/css/coupon-promos.css' ), [], (string) filemtime( $path ) );
	}
}
