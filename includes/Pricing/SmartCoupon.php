<?php
/**
 * The Smart Coupon contract: the meta on a real WooCommerce coupon (ADR-014).
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Pricing;

use StorePulse\StoreGrowth\Offers\OfferVersions;
use WC_Coupon;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Every Smart Coupon, automatic included, is a real `shop_coupon` post. These
 * keys are what the referee reads from it; the Smart Coupons module writes them.
 *
 * @since 3.1.0
 */
class SmartCoupon {

	/**
	 * Meta key: `yes` on a coupon managed by Smart Coupons.
	 *
	 * @since 3.1.0
	 */
	const MANAGED = '_spsg_smart_coupon';

	/**
	 * Meta key: how the coupon is applied, `automatic`, `code` or `link`.
	 *
	 * @since 3.1.0
	 */
	const METHOD = '_spsg_coupon_method';

	/**
	 * Meta key: the name shoppers see in cart labels. Empty means the code.
	 *
	 * @since 3.1.0
	 */
	const TITLE = '_spsg_coupon_title';

	/**
	 * Meta key: `yes` for "Can combine with other StoreGrowth deals".
	 *
	 * @since 3.1.0
	 */
	const COMBINES = '_spsg_coupon_combines';

	/**
	 * Meta key: `yes` for "Allow with other coupons".
	 *
	 * @since 3.1.0
	 */
	const ALLOW_OTHERS = '_spsg_coupon_allow_others';

	/**
	 * Method value of a coupon the referee applies by itself.
	 *
	 * @since 3.1.0
	 */
	const AUTOMATIC = 'automatic';

	/**
	 * Method value of a coupon the shopper types.
	 *
	 * @since 3.1.0
	 */
	const CODE = 'code';

	/**
	 * Method value of a coupon applied from a link (Pro).
	 *
	 * @since 3.1.0
	 */
	const LINK = 'link';

	/**
	 * Meta key: the coupon's type, one of the `TYPE_*` values. WooCommerce's
	 * own discount type can't tell tiers or Buy X get Y from a percentage.
	 *
	 * @since 3.1.0
	 */
	const TYPE = '_spsg_coupon_type';

	/**
	 * Type value: percent off eligible products.
	 *
	 * @since 3.1.0
	 */
	const TYPE_PERCENTAGE = 'percentage';

	/**
	 * Type value: an amount off the cart.
	 *
	 * @since 3.1.0
	 */
	const TYPE_FIXED = 'fixed';

	/**
	 * Type value: Buy more save more, tiers by quantity or cart subtotal
	 * (StoreGrowth Pro prices it).
	 *
	 * @since 3.1.0
	 */
	const TYPE_TIERS = 'tiers';

	/**
	 * Type value: Buy X get Y, a deal defined by a BOGO rule.
	 *
	 * @since 3.1.0
	 */
	const TYPE_BUY_X_GET_Y = 'buy_x_get_y';

	/**
	 * Meta key: start of the coupon's dates, `Y-m-d H:i:s` in the site
	 * timezone. Its end is WooCommerce's own expiry date.
	 *
	 * @since 3.1.0
	 */
	const STARTS_AT = '_spsg_coupon_starts_at';

	/**
	 * Meta key: the smallest number of items the cart must hold.
	 *
	 * @since 3.1.0
	 */
	const MIN_QUANTITY = '_spsg_coupon_min_quantity';

	/**
	 * Meta key: who may use the coupon, one of `self::ELIGIBILITIES`.
	 *
	 * @since 3.1.0
	 */
	const ELIGIBILITY = '_spsg_coupon_eligibility';

	/**
	 * Who may use a coupon: all customers, specific roles, first-time or
	 * returning customers, or specific customers (WooCommerce's allowed
	 * emails).
	 *
	 * @since 3.1.0
	 */
	const ELIGIBILITIES = [ 'all', 'roles', 'first_time', 'returning', 'customers' ];

	/**
	 * The eligibilities only Pro offers.
	 *
	 * @since 3.1.0
	 */
	const PRO_ELIGIBILITIES = [ 'first_time', 'returning', 'customers' ];

	/**
	 * Meta key: the role slugs a `roles` coupon is for.
	 *
	 * @since 3.1.0
	 */
	const ROLES = '_spsg_coupon_roles';

	/**
	 * Meta key: a tiers coupon's rows, written and read by StoreGrowth Pro.
	 * StoreGrowth only keeps it (a save never clears it).
	 *
	 * @since 3.1.0
	 */
	const TIERS = '_spsg_coupon_tiers';

	/**
	 * Meta key: the BOGO rule of a Buy X get Y coupon.
	 *
	 * @since 3.1.0
	 */
	const BOGO_RULE = '_spsg_coupon_bogo_rule';

	/**
	 * Meta key: the `spsg_campaign_offers` row of a campaign-only coupon.
	 *
	 * @since 3.1.0
	 */
	const CAMPAIGN_OFFER = '_spsg_coupon_campaign_offer';

	/**
	 * Whether a coupon is managed by Smart Coupons.
	 *
	 * @since 3.1.0
	 *
	 * @param WC_Coupon $coupon Coupon.
	 *
	 * @return bool
	 */
	public static function is_smart( WC_Coupon $coupon ): bool {
		return 'yes' === $coupon->get_meta( self::MANAGED );
	}

	/**
	 * Whether a coupon is applied by the referee, never typed.
	 *
	 * @since 3.1.0
	 *
	 * @param WC_Coupon $coupon Coupon.
	 *
	 * @return bool
	 */
	public static function is_automatic( WC_Coupon $coupon ): bool {
		return self::is_smart( $coupon ) && self::AUTOMATIC === $coupon->get_meta( self::METHOD );
	}

	/**
	 * The name shoppers see for a coupon.
	 *
	 * @since 3.1.0
	 *
	 * @param WC_Coupon $coupon Coupon.
	 *
	 * @return string
	 */
	public static function name( WC_Coupon $coupon ): string {
		$title = (string) $coupon->get_meta( self::TITLE );

		return '' !== $title ? $title : strtoupper( $coupon->get_code() );
	}

	/**
	 * How a coupon is named when a shopper must recognise what they typed:
	 * its code, or its title for an automatic coupon, whose code means nothing.
	 *
	 * @since 3.1.0
	 *
	 * @param WC_Coupon $coupon Coupon.
	 *
	 * @return string
	 */
	public static function shown_code( WC_Coupon $coupon ): string {
		return self::is_automatic( $coupon ) ? self::name( $coupon ) : strtoupper( $coupon->get_code() );
	}

	/**
	 * Whether a coupon is a Buy X get Y coupon: it gives no discount of its
	 * own, its BOGO rule does.
	 *
	 * @since 3.1.0
	 *
	 * @param WC_Coupon $coupon Coupon.
	 *
	 * @return bool
	 */
	public static function is_buy_x_get_y( WC_Coupon $coupon ): bool {
		return self::is_smart( $coupon ) && self::TYPE_BUY_X_GET_Y === $coupon->get_meta( self::TYPE );
	}

	/**
	 * Whether a coupon uses an option only Pro offers: Buy more save more
	 * tiers, first-time, returning or specific customers, or more than one
	 * use per customer. Without a licence such a coupon pauses (the option
	 * is kept, so it never reaches more shoppers than meant) and resumes on
	 * renewal.
	 *
	 * @since 3.1.0
	 *
	 * @param WC_Coupon $coupon Coupon.
	 *
	 * @return bool
	 */
	public static function needs_pro( WC_Coupon $coupon ): bool {
		return self::TYPE_TIERS === $coupon->get_meta( self::TYPE )
			|| in_array( (string) $coupon->get_meta( self::ELIGIBILITY ), self::PRO_ELIGIBILITIES, true )
			|| (int) $coupon->get_usage_limit_per_user( 'edit' ) > 1;
	}

	/**
	 * Whether the Pro coupon options run: a valid licence AND StoreGrowth Pro
	 * answering for them (an older Pro doesn't, and its coupons stay paused
	 * rather than run without their rules).
	 *
	 * @since 3.1.0
	 *
	 * @return bool
	 */
	public static function pro_options_available(): bool {
		/**
		 * Filters whether StoreGrowth Pro runs the Pro coupon options (tiers,
		 * first-time / returning / specific customers, more uses per customer).
		 *
		 * @since 3.1.0
		 *
		 * @param bool $available False without StoreGrowth Pro.
		 */
		return sp_store_growth()->has_pro() && (bool) apply_filters( 'spsg_smart_coupon_pro_options', false );
	}

	/**
	 * Whether a coupon is paused for using a Pro option that doesn't run now.
	 * The option is kept: dropping it could give the discount to more
	 * shoppers than meant. It resumes when Pro runs again.
	 *
	 * @since 3.1.0
	 *
	 * @param WC_Coupon $coupon Coupon.
	 *
	 * @return bool
	 */
	public static function paused_for_pro( WC_Coupon $coupon ): bool {
		return self::needs_pro( $coupon ) && ! self::pro_options_available();
	}

	/**
	 * What applies to a coupon now: its saved values, or those of the
	 * campaign running over it. `live` says whether it is on at all.
	 *
	 * @since 3.1.0
	 *
	 * @param WC_Coupon $coupon Coupon.
	 *
	 * @return array{version: string, values: array, promotion_id: int, live: bool, chip: string}
	 */
	public static function effective( WC_Coupon $coupon ): array {
		$expires = $coupon->get_date_expires( 'edit' );

		return OfferVersions::effective_offer(
			[
				'offer_kind'        => OfferVersions::SMART_COUPON,
				'id'                => $coupon->get_id(),
				'campaign_offer_id' => (int) $coupon->get_meta( self::CAMPAIGN_OFFER ),
				'status'            => 'publish' === $coupon->get_status( 'edit' ) ? 'active' : 'inactive',
				'amount'            => (float) $coupon->get_amount( 'edit' ),
				'date_start'        => (string) $coupon->get_meta( self::STARTS_AT ),
				'date_end'          => $expires ? wp_date( 'Y-m-d H:i:s', $expires->getTimestamp() ) : '',
			]
		);
	}

	/**
	 * Whether a coupon can combine with other StoreGrowth deals.
	 *
	 * @since 3.1.0
	 *
	 * @param WC_Coupon $coupon Coupon.
	 *
	 * @return bool
	 */
	public static function combines( WC_Coupon $coupon ): bool {
		return 'yes' === $coupon->get_meta( self::COMBINES );
	}

	/**
	 * Whether a coupon can be used with coupons from outside StoreGrowth.
	 *
	 * @since 3.1.0
	 *
	 * @param WC_Coupon $coupon Coupon.
	 *
	 * @return bool
	 */
	public static function allows_others( WC_Coupon $coupon ): bool {
		return 'yes' === $coupon->get_meta( self::ALLOW_OTHERS );
	}

	/**
	 * The codes of every published automatic Smart Coupon.
	 *
	 * @since 3.1.0
	 *
	 * @return string[]
	 */
	public static function automatic_codes(): array {
		$ids = get_posts(
			[
				'post_type'   => 'shop_coupon',
				'post_status' => 'publish',
				'numberposts' => -1,
				'fields'      => 'ids',
				// phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query -- The automatic coupons have no other index; WP_Query caches the result.
				'meta_query'  => [
					[
						'key'   => self::MANAGED,
						'value' => 'yes',
					],
					[
						'key'   => self::METHOD,
						'value' => self::AUTOMATIC,
					],
				],
			]
		);

		return array_map( 'wc_get_coupon_code_by_id', $ids );
	}
}
