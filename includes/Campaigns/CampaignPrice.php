<?php
/**
 * A campaign's price on products (ADR-016).
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Campaigns;

use DateTimeImmutable;
use StorePulse\StoreGrowth\Interfaces\HookRegistry;
use StorePulse\StoreGrowth\Modules\CountdownTimer\Helper as CountdownHelper;
use StorePulse\StoreGrowth\Offers\CampaignRepository;
use StorePulse\StoreGrowth\Offers\OfferVersions;
use StorePulse\StoreGrowth\Pricing\SmartCoupon;
use StorePulse\StoreGrowth\Support\SiteTime;
use WC_Coupon;
use WC_Product_Variable;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * The "% off these products" a running campaign sets through the Countdown
 * module. It replaces a product's own Countdown discount while the campaign
 * runs; nothing is written to the product, so its own setting returns after.
 *
 * @since SPSG_VERSION
 */
class CampaignPrice implements HookRegistry {

	/**
	 * Register hooks.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return void
	 */
	public function register_hooks(): void {
		add_filter( 'woocommerce_coupon_get_exclude_sale_items', [ $this, 'exclude_sale_items' ], 10, 2 );
	}

	/**
	 * A coupon a campaign runs over skips sale items when the merchant chose
	 * Exclude for that campaign. Read in the view context only, so the saved
	 * coupon is never changed.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param bool      $exclude Whether the coupon skips sale items.
	 * @param WC_Coupon $coupon  Coupon.
	 *
	 * @return bool
	 */
	public function exclude_sale_items( $exclude, $coupon ) {
		if ( $exclude || ! SmartCoupon::is_smart( $coupon ) ) {
			return $exclude;
		}

		$promotion_id = (int) SmartCoupon::effective( $coupon )['promotion_id'];

		foreach ( CampaignRepository::running() as $campaign ) {
			if ( (int) $campaign['id'] === $promotion_id ) {
				return ! empty( $campaign['settings']['exclude_on_sale'] );
			}
		}

		return $exclude;
	}

	/**
	 * Whether a product is on sale of its own accord: its sale price or its
	 * own Countdown. The edit context leaves out any campaign's price.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param int $product_id Product or variation id.
	 *
	 * @return bool
	 */
	private static function already_on_sale( int $product_id ): bool {
		$product = wc_get_product( $product_id );

		// A variable product's own answer reads its price ranges, which carry
		// the campaign's price; its variations' answers don't.
		if ( $product instanceof WC_Product_Variable ) {
			return CountdownHelper::is_product_discountable( $product_id ) || array_filter( $product->get_children(), [ self::class, 'already_on_sale' ] );
		}

		return $product && ( $product->is_on_sale( 'edit' ) || CountdownHelper::is_product_discountable( $product_id ) );
	}

	/**
	 * Whether a Dokan vendor sells a product. A campaign price lowers the line,
	 * and Dokan pays vendors from line prices, so the store's campaign would
	 * come out of the vendor's earnings.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param int $product_id Product or variation id.
	 *
	 * @return bool
	 */
	private static function is_vendor_product( int $product_id ): bool {
		$parent_id = wp_get_post_parent_id( $product_id );

		return OfferVersions::is_vendor_deal( [ 'created_by' => get_post_field( 'post_author', $parent_id ? $parent_id : $product_id ) ] );
	}

	/**
	 * Whether a running campaign sets a campaign price.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param DateTimeImmutable|null $now Moment to check.
	 *
	 * @return bool
	 */
	public static function any_running( ?DateTimeImmutable $now = null ): bool {
		return (bool) self::running_prices( $now );
	}

	/**
	 * What the running campaigns set on prices, by campaign id. Anything that
	 * changes a product's campaign price is in here.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param DateTimeImmutable|null $now Moment to check.
	 *
	 * @return array<int, array{price: array, exclude_on_sale: bool}>
	 */
	public static function running_prices( ?DateTimeImmutable $now = null ): array {
		$prices = [];

		foreach ( CampaignRepository::running( $now ) as $campaign ) {
			if ( ! empty( $campaign['settings']['campaign_price']['percent'] ) ) {
				$prices[ (int) $campaign['id'] ] = [
					'price'           => $campaign['settings']['campaign_price'],
					'exclude_on_sale' => ! empty( $campaign['settings']['exclude_on_sale'] ),
				];
			}
		}

		return $prices;
	}

	/**
	 * The campaign price on a product.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param int                    $product_id Product or variation id.
	 * @param DateTimeImmutable|null $now        Moment to check, the current one by default.
	 *
	 * @return array{percent: int, promotion_id: int}|null
	 */
	public static function for_product( int $product_id, ?DateTimeImmutable $now = null ): ?array {
		$now = $now ?? SiteTime::now();

		foreach ( CampaignRepository::running( $now ) as $campaign ) {
			$price   = (array) ( $campaign['settings']['campaign_price'] ?? [] );
			$percent = (int) ( $price['percent'] ?? 0 );

			if ( $percent <= 0 || $percent > 100 ) {
				continue;
			}

			$scope = [
				'all'        => false,
				'products'   => array_map( 'intval', (array) ( $price['products'] ?? [] ) ),
				'categories' => array_map( 'intval', (array) ( $price['categories'] ?? [] ) ),
			];

			if ( ! empty( $campaign['settings']['exclude_on_sale'] ) && self::already_on_sale( $product_id ) ) {
				continue;
			}

			if ( CampaignProducts::contains( $scope, $product_id ) && ! self::is_vendor_product( $product_id ) ) {
				return [
					'percent'      => $percent,
					'promotion_id' => (int) $campaign['id'],
				];
			}
		}

		return null;
	}
}
