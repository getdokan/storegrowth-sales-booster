<?php
/**
 * Keeps WooCommerce from accepting a Smart Coupon that isn't on.
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Modules\SmartCoupons;

use DateTimeImmutable;
use Exception;
use StorePulse\StoreGrowth\Helper;
use StorePulse\StoreGrowth\Interfaces\HookRegistry;
use StorePulse\StoreGrowth\Modules\BoGo\BoGoModule;
use StorePulse\StoreGrowth\Modules\BoGo\OrderBogo;
use StorePulse\StoreGrowth\Offers\OfferVersions;
use StorePulse\StoreGrowth\Pricing\CartLine;
use StorePulse\StoreGrowth\Pricing\CouponAmount;
use StorePulse\StoreGrowth\Pricing\DealList;
use StorePulse\StoreGrowth\Pricing\Referee;
use StorePulse\StoreGrowth\Pricing\SmartCoupon;
use StorePulse\StoreGrowth\Support\SiteTime;
use WC_Cart;
use WC_Coupon;
use WC_Discounts;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Smart Coupons are real WooCommerce coupons, so WooCommerce keeps accepting
 * them unless told otherwise. Always loaded, also while the module is off:
 * this is what makes a coupon invalid when the module is off, over the Free
 * limit or a campaign-only coupon offline, and it checks what WooCommerce has
 * no field for (start date, minimum quantity, who may use it).
 *
 * @since 3.1.0
 */
class CouponGuard implements HookRegistry {

	/**
	 * Register hooks.
	 *
	 * @since 3.1.0
	 *
	 * @return void
	 */
	public function register_hooks(): void {
		// After Dokan's check at 10, before the referee's at 20.
		add_filter( 'woocommerce_coupon_is_valid', [ $this, 'check_coupon' ], 15, 3 );
		add_filter( 'woocommerce_coupon_validate_expiry_date', [ $this, 'ignore_expiry_in_campaign' ], 10, 2 );
		// WooCommerce 11.1+: without it a fixed amount is refused outright by one sale line.
		add_filter( 'woocommerce_coupon_is_valid_for_sale_items', [ $this, 'skip_sale_items' ], 10, 2 );
		add_filter( 'woocommerce_coupon_error', [ $this, 'explain_unavailable_coupon' ], 10, 3 );
		add_filter( 'spsg_offer_limits', [ $this, 'add_free_limit' ] );
		add_filter( 'spsg_offer_is_live', [ $this, 'check_dates' ], 10, 4 );
		add_filter( 'spsg_bogo_coupon_unlocks_rule', [ $this, 'unlock_bogo_rule' ], 10, 2 );
		add_action( 'woocommerce_applied_coupon', [ $this, 'add_unlocked_gifts' ] );
	}

	/**
	 * Reject a Smart Coupon that can't be used right now.
	 *
	 * @since 3.1.0
	 *
	 * @param bool         $valid     Whether the coupon is valid.
	 * @param WC_Coupon    $coupon    Coupon.
	 * @param WC_Discounts $discounts Discounts.
	 *
	 * @return bool
	 *
	 * @throws Exception The shopper's message when the coupon can't be used.
	 */
	public function check_coupon( $valid, $coupon, $discounts ) {
		if ( ! $valid || ! SmartCoupon::is_smart( $coupon ) ) {
			return $valid;
		}

		if ( ! $this->can_use( $coupon, $discounts ) ) {
			throw new Exception( esc_html( self::unavailable_message( $coupon ) ) );
		}

		return $valid;
	}

	/**
	 * Whether a Smart Coupon can be used on these items.
	 *
	 * @since 3.1.0
	 *
	 * @param WC_Coupon    $coupon    Coupon.
	 * @param WC_Discounts $discounts Discounts.
	 *
	 * @return bool
	 */
	private function can_use( WC_Coupon $coupon, WC_Discounts $discounts ): bool {
		if ( ! Helper::is_module_active( SmartCouponsModule::get_id() ) ) {
			return false;
		}

		// A coupon using a Pro option pauses without Pro (fail closed): the
		// option is kept, so it never reaches more shoppers than meant.
		if ( SmartCoupon::paused_for_pro( $coupon ) ) {
			return false;
		}

		if ( ! SmartCoupon::effective( $coupon )['live'] ) {
			return false;
		}

		$cart = $discounts->get_object();

		if ( ! $cart instanceof WC_Cart ) {
			return true;
		}

		return ! $this->is_typed_automatic_code( $coupon, $cart )
			&& $this->meets_min_quantity( $coupon, $cart )
			&& $this->reaches_a_line( $coupon, $discounts )
			&& $this->customer_may_use( $coupon );
	}

	/**
	 * Whether a shopper is entering an automatic coupon's code: it is neither
	 * being checked by the referee nor already in the cart.
	 *
	 * @since 3.1.0
	 *
	 * @param WC_Coupon $coupon Coupon.
	 * @param WC_Cart   $cart   Cart.
	 *
	 * @return bool
	 */
	private function is_typed_automatic_code( WC_Coupon $coupon, WC_Cart $cart ): bool {
		return SmartCoupon::is_automatic( $coupon ) && ! Referee::is_resolving() && ! in_array( $coupon->get_code(), $cart->get_applied_coupons(), true );
	}

	/**
	 * Whether the cart holds the coupon's minimum quantity, gift lines left out.
	 *
	 * @since 3.1.0
	 *
	 * @param WC_Coupon $coupon Coupon.
	 * @param WC_Cart   $cart   Cart.
	 *
	 * @return bool
	 */
	private function meets_min_quantity( WC_Coupon $coupon, WC_Cart $cart ): bool {
		$minimum = (int) $coupon->get_meta( SmartCoupon::MIN_QUANTITY );

		if ( $minimum < 1 ) {
			return true;
		}

		$quantity = 0;

		foreach ( $cart->get_cart() as $item ) {
			if ( ! CartLine::is_gift( $item ) ) {
				$quantity += (int) $item['quantity'];
			}
		}

		return $quantity >= $minimum;
	}

	/**
	 * Whether the coupon gives something on at least one line. Without this,
	 * a coupon restricted away from every line (sale items, say) would be
	 * accepted and do nothing.
	 *
	 * @since 3.1.0
	 *
	 * @param WC_Coupon    $coupon    Coupon.
	 * @param WC_Discounts $discounts Discounts.
	 *
	 * @return bool
	 */
	private function reaches_a_line( WC_Coupon $coupon, WC_Discounts $discounts ): bool {
		if ( SmartCoupon::is_buy_x_get_y( $coupon ) ) {
			return true;
		}

		$reaches = false;

		foreach ( $discounts->get_items() as $item ) {
			if ( ! CartLine::is_gift( (array) $item->object ) && DealList::coupon_applies( $coupon, $item->product, (array) $item->object ) ) {
				$reaches = true;
				break;
			}
		}

		if ( ! $reaches || SmartCoupon::TYPE_TIERS !== $coupon->get_meta( SmartCoupon::TYPE ) ) {
			return $reaches;
		}

		return CouponAmount::tier_percent( SmartCoupon::effective( $coupon )['values'], $coupon ) > 0;
	}

	/**
	 * Whether the current customer may use the coupon: everyone, or the
	 * coupon's roles. StoreGrowth Pro judges its own eligibilities
	 * (first-time, returning, specific customers); without it they fail
	 * closed.
	 *
	 * @since 3.1.0
	 *
	 * @param WC_Coupon $coupon Coupon.
	 *
	 * @return bool
	 */
	private function customer_may_use( WC_Coupon $coupon ): bool {
		$eligibility = (string) $coupon->get_meta( SmartCoupon::ELIGIBILITY );

		if ( 'roles' === $eligibility ) {
			return (bool) array_intersect( (array) wp_get_current_user()->roles, (array) $coupon->get_meta( SmartCoupon::ROLES ) );
		}

		if ( in_array( $eligibility, SmartCoupon::PRO_ELIGIBILITIES, true ) ) {
			/**
			 * Filters whether the current customer may use a coupon limited to
			 * first-time, returning or specific customers.
			 *
			 * @since 3.1.0
			 *
			 * @param bool      $may_use     False without StoreGrowth Pro.
			 * @param WC_Coupon $coupon      Coupon.
			 * @param string    $eligibility `first_time`, `returning` or `customers`.
			 */
			return (bool) apply_filters( 'spsg_smart_coupon_customer_may_use', false, $coupon, $eligibility );
		}

		return true;
	}

	/**
	 * Ignore a coupon's own expiry while a campaign runs it: the campaign's
	 * dates apply then.
	 *
	 * @since 3.1.0
	 *
	 * @param bool      $expired Whether the coupon has expired.
	 * @param WC_Coupon $coupon  Coupon.
	 *
	 * @return bool
	 */
	public function ignore_expiry_in_campaign( $expired, $coupon ) {
		if ( ! $expired || ! SmartCoupon::is_smart( $coupon ) ) {
			return $expired;
		}

		$effective = SmartCoupon::effective( $coupon );

		return ! ( OfferVersions::CAMPAIGN === $effective['version'] && $effective['live'] );
	}

	/**
	 * Let a Smart Coupon's "Skip products already on sale" skip sale lines
	 * instead of refusing the whole cart, as WooCommerce would for a fixed amount.
	 *
	 * @since 3.1.0
	 *
	 * @param bool      $valid  Whether the coupon is valid.
	 * @param WC_Coupon $coupon Coupon.
	 *
	 * @return bool
	 */
	public function skip_sale_items( $valid, $coupon ) {
		return $valid || SmartCoupon::is_smart( $coupon );
	}

	/**
	 * Give a code that doesn't exist or isn't active the same message a
	 * Smart Coupon that isn't on shows. Coupons from outside StoreGrowth keep
	 * WooCommerce's message for everything else.
	 *
	 * @since 3.1.0
	 *
	 * @param string    $message Error message.
	 * @param int       $code    Error code.
	 * @param WC_Coupon $coupon  Coupon.
	 *
	 * @return string
	 */
	public function explain_unavailable_coupon( $message, $code, $coupon ) {
		if ( ! $coupon instanceof WC_Coupon ) {
			return $message;
		}

		$is_missing = WC_Coupon::E_WC_COUPON_NOT_EXIST === (int) $code && Helper::is_module_active( SmartCouponsModule::get_id() );
		$is_expired = WC_Coupon::E_WC_COUPON_EXPIRED === (int) $code && SmartCoupon::is_smart( $coupon );

		return $is_missing || $is_expired ? esc_html( self::unavailable_message( $coupon ) ) : $message;
	}

	/**
	 * The message for a coupon that can't be used right now.
	 *
	 * @since 3.1.0
	 *
	 * @param WC_Coupon $coupon Coupon.
	 *
	 * @return string
	 */
	private static function unavailable_message( WC_Coupon $coupon ): string {
		/* translators: %s: coupon code. */
		return sprintf( __( '%s isn\'t a valid coupon right now.', 'storegrowth-sales-booster' ), strtoupper( $coupon->get_code() ) );
	}

	/**
	 * Register the Free plan's limit on active automatic coupons (code and
	 * link coupons are unlimited).
	 *
	 * @since 3.1.0
	 *
	 * @param array $limits Limits by kind.
	 *
	 * @return array
	 */
	public function add_free_limit( $limits ) {
		$limits[ OfferVersions::SMART_COUPON ] = [
			'limit'  => SmartCouponRepository::FREE_LIMIT,
			'offers' => [ SmartCouponRepository::class, 'active_automatic' ],
		];

		return $limits;
	}

	/**
	 * Whether a Smart Coupon's dates make it live. With no dates at all it
	 * stays off; while a campaign runs it, the campaign's dates apply.
	 *
	 * @since 3.1.0
	 *
	 * @param bool              $live   Whether the offer is live.
	 * @param string            $kind   Offer kind.
	 * @param array             $values Offer values.
	 * @param DateTimeImmutable $now    Moment checked.
	 *
	 * @return bool
	 */
	public function check_dates( $live, $kind, $values, $now ) {
		if ( ! $live || OfferVersions::SMART_COUPON !== $kind || ! empty( $values['dates_from_campaign'] ) ) {
			return $live;
		}

		$start = (string) ( $values['date_start'] ?? '' );
		$end   = (string) ( $values['date_end'] ?? '' );

		return ( '' !== $start || '' !== $end ) && SiteTime::is_within( $start, $end, $now );
	}

	/**
	 * Unlock a BOGO rule while its Buy X get Y coupon is in the cart and on.
	 *
	 * @since 3.1.0
	 *
	 * @param bool  $unlocked Whether the rule may apply.
	 * @param array $rule     The rule.
	 *
	 * @return bool
	 */
	public function unlock_bogo_rule( $unlocked, $rule ) {
		$rule_id = (int) ( $rule['id'] ?? 0 );

		if ( $unlocked || ! $rule_id || ! WC()->cart || ! Helper::is_module_active( SmartCouponsModule::get_id() ) ) {
			return $unlocked;
		}

		foreach ( WC()->cart->get_applied_coupons() as $code ) {
			$coupon = new WC_Coupon( $code );

			if ( SmartCoupon::is_buy_x_get_y( $coupon ) && $rule_id === (int) $coupon->get_meta( SmartCoupon::BOGO_RULE ) && SmartCoupon::effective( $coupon )['live'] ) {
				return true;
			}
		}

		return $unlocked;
	}

	/**
	 * Add the gifts of a rule a coupon just unlocked: BOGO only adds gifts
	 * when a product is added or a quantity changes.
	 *
	 * @since 3.1.0
	 *
	 * @param string $code Coupon code.
	 *
	 * @return void
	 */
	public function add_unlocked_gifts( $code ): void {
		$coupon = new WC_Coupon( $code );

		if ( SmartCoupon::is_buy_x_get_y( $coupon ) && Helper::is_module_active( BoGoModule::get_id() ) ) {
			OrderBogo::instance()->add_gifts_for_rule( (int) $coupon->get_meta( SmartCoupon::BOGO_RULE ) );
		}
	}
}
