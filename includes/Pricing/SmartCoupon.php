<?php
/**
 * The Smart Coupon contract: the meta on a real WooCommerce coupon (ADR-014).
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Pricing;

use WC_Coupon;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Every Smart Coupon, automatic included, is a real `shop_coupon` post. These
 * keys are what the referee reads from it; the Smart Coupons module writes them.
 *
 * @since SPSG_VERSION
 */
class SmartCoupon {

	/**
	 * Meta key: `yes` on a coupon managed by Smart Coupons.
	 *
	 * @since SPSG_VERSION
	 */
	const MANAGED = '_spsg_smart_coupon';

	/**
	 * Meta key: how the coupon is applied, `automatic`, `code` or `link`.
	 *
	 * @since SPSG_VERSION
	 */
	const METHOD = '_spsg_coupon_method';

	/**
	 * Meta key: the name shoppers see in cart labels. Empty means the code.
	 *
	 * @since SPSG_VERSION
	 */
	const TITLE = '_spsg_coupon_title';

	/**
	 * Meta key: `yes` for "Can combine with other StoreGrowth deals".
	 *
	 * @since SPSG_VERSION
	 */
	const COMBINES = '_spsg_coupon_combines';

	/**
	 * Meta key: `yes` for "Allow with other coupons".
	 *
	 * @since SPSG_VERSION
	 */
	const ALLOW_OTHERS = '_spsg_coupon_allow_others';

	/**
	 * Method value of a coupon the referee applies by itself.
	 *
	 * @since SPSG_VERSION
	 */
	const AUTOMATIC = 'automatic';

	/**
	 * Whether a coupon is managed by Smart Coupons.
	 *
	 * @since SPSG_VERSION
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
	 * @since SPSG_VERSION
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
	 * @since SPSG_VERSION
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
	 * Whether a coupon can combine with other StoreGrowth deals.
	 *
	 * @since SPSG_VERSION
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
	 * @since SPSG_VERSION
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
	 * @since SPSG_VERSION
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
