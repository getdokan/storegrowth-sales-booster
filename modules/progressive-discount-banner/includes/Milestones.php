<?php
/**
 * Cart Rewards milestones: stored shape, the cart's subtotal and progress.
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Modules\ProgressiveDiscountBanner;

use StorePulse\StoreGrowth\Helper as PluginHelper;
use StorePulse\StoreGrowth\Offers\OfferLimits;
use StorePulse\StoreGrowth\Offers\OfferVersions;
use StorePulse\StoreGrowth\Pricing\CartLine;
use StorePulse\StoreGrowth\Pricing\CouponAmount;
use StorePulse\StoreGrowth\Pricing\SmartCoupon;
use StorePulse\StoreGrowth\Storefront\DisplayRules;
use StorePulse\StoreGrowth\Support\Money;
use WC_Cart;
use WC_Coupon;
use WC_Discounts;
use WC_Shipping_Zone;
use WC_Shipping_Zones;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * The milestones of a store and what a cart has reached. A store from before
 * 3.1 has no `milestones` key: its threshold and reward are milestone 1,
 * worked out live from the old keys (`with_derived()` on the schema).
 *
 * @since 3.1.0
 */
class Milestones {

	/**
	 * Free plan: one active everyday milestone.
	 *
	 * @since 3.1.0
	 */
	const FREE_LIMIT = 1;

	/**
	 * Reward: the store's Free shipping method.
	 *
	 * @since 3.1.0
	 */
	const FREE_SHIPPING = 'free-shipping';

	/**
	 * Reward: a coupon, shown as a code to use.
	 *
	 * @since 3.1.0
	 */
	const COUPON = 'coupon';

	/**
	 * Reward: a free gift line.
	 *
	 * @since 3.1.0
	 */
	const GIFT = 'gift';

	/**
	 * Reward: a discount on the cart, the fee 3.0 stores already give.
	 *
	 * @since 3.1.0
	 */
	const DISCOUNT = 'discount-amount';

	/**
	 * The old keys that carry milestone 1.
	 *
	 * @since 3.1.0
	 *
	 * @var string[]
	 */
	const LEGACY_KEYS = [ 'cart_minimum_amount', 'discount_type', 'discount_amount_mode', 'discount_amount_value' ];

	/**
	 * Cart-minimum default of a store that never set one.
	 *
	 * @since 3.1.0
	 */
	const DEFAULT_THRESHOLD = 10;

	/**
	 * One stored row as it should be, or null when it isn't valid.
	 *
	 * @since 3.1.0
	 *
	 * @param array $row Milestone.
	 *
	 * @return array{id: int, threshold: float, reward: string, coupon_id: int, gift_product_id: int, discount_mode: string, discount_value: float}|null
	 */
	public static function normalize_row( array $row ): ?array {
		$reward    = (string) ( $row['reward'] ?? '' );
		$threshold = $row['threshold'] ?? null;

		if ( ! in_array( $reward, [ self::FREE_SHIPPING, self::COUPON, self::GIFT, self::DISCOUNT ], true ) || ! is_numeric( $threshold ) || (float) $threshold < 0 ) {
			return null;
		}

		$coupon_id = self::COUPON === $reward ? absint( $row['coupon_id'] ?? 0 ) : 0;
		$gift_id   = self::GIFT === $reward ? absint( $row['gift_product_id'] ?? 0 ) : 0;

		if ( ( self::COUPON === $reward && ! $coupon_id ) || ( self::GIFT === $reward && ! $gift_id ) ) {
			return null;
		}

		return [
			'id'              => absint( $row['id'] ?? 0 ),
			'threshold'       => (float) $threshold,
			'reward'          => $reward,
			'coupon_id'       => $coupon_id,
			'gift_product_id' => $gift_id,
			'discount_mode'   => 'percentage' === ( $row['discount_mode'] ?? '' ) ? 'percentage' : 'fixed-amount',
			'discount_value'  => is_numeric( $row['discount_value'] ?? null ) ? max( 0.0, (float) $row['discount_value'] ) : 0.0,
		];
	}

	/**
	 * Milestone 1 from the old keys of a store from before 3.1. A store whose
	 * discount type isn't one of the known values gave no reward.
	 *
	 * @since 3.1.0
	 *
	 * @param array $stored Stored settings.
	 *
	 * @return array[]
	 */
	public static function derive( array $stored ): array {
		$type = $stored['discount_type'] ?? self::FREE_SHIPPING;

		if ( self::FREE_SHIPPING !== $type && self::DISCOUNT !== $type ) {
			return [];
		}

		$row = self::normalize_row(
			[
				'id'             => 1,
				'threshold'      => is_numeric( $stored['cart_minimum_amount'] ?? null ) ? $stored['cart_minimum_amount'] : self::DEFAULT_THRESHOLD,
				'reward'         => $type,
				'discount_mode'  => $stored['discount_amount_mode'] ?? 'fixed-amount',
				'discount_value' => $stored['discount_amount_value'] ?? 0,
			]
		);

		return $row ? [ $row ] : [];
	}

	/**
	 * The old keys that hold a milestone (the first one): Pro 3.0 reads them.
	 * A gift or coupon has no old form, so the old discount keys stay.
	 *
	 * @since 3.1.0
	 *
	 * @param array $row Milestone.
	 *
	 * @return array<string, string>
	 */
	public static function legacy_keys( array $row ): array {
		$keys = [ 'cart_minimum_amount' => (string) $row['threshold'] ];

		if ( self::FREE_SHIPPING === $row['reward'] ) {
			$keys['discount_type'] = self::FREE_SHIPPING;
		}

		if ( self::DISCOUNT === $row['reward'] ) {
			$keys['discount_type']         = self::DISCOUNT;
			$keys['discount_amount_mode']  = $row['discount_mode'];
			$keys['discount_amount_value'] = (string) $row['discount_value'];
		}

		return $keys;
	}

	/**
	 * Milestones after the old keys were saved on their own (the old admin's
	 * ajax save): the first milestone follows them.
	 *
	 * @since 3.1.0
	 *
	 * @param array[] $rows     Stored milestones, first one first.
	 * @param array   $settings Settings after the save.
	 *
	 * @return array[]
	 */
	public static function with_legacy_keys( array $rows, array $settings ): array {
		$derived = self::derive( $settings );

		if ( $derived ) {
			$derived[0]['id'] = $rows[0]['id'];
			$rows[0]          = array_merge( $rows[0], array_diff_key( $derived[0], [ 'id' => true ] ) );
		}

		return $rows;
	}

	/**
	 * Sort rows by threshold and give new ones an id.
	 *
	 * @since 3.1.0
	 *
	 * @param array[] $rows Milestones.
	 *
	 * @return array[]
	 */
	public static function sorted_with_ids( array $rows ): array {
		usort(
			$rows,
			static function ( array $first, array $second ): int {
				return $first['threshold'] <=> $second['threshold'];
			}
		);

		$next = max( array_merge( [ 0 ], array_column( $rows, 'id' ) ) ) + 1;

		foreach ( $rows as $index => $row ) {
			if ( ! $row['id'] ) {
				$rows[ $index ]['id'] = $next;
				++$next;
			}
		}

		return $rows;
	}

	/**
	 * A store's active milestones, lowest threshold first, without those over
	 * the Free limit. Empty for a store that never saved.
	 *
	 * @since 3.1.0
	 *
	 * @param array|null $settings Module settings (default: read them).
	 *
	 * @return array[]
	 */
	public static function active( ?array $settings = null ): array {
		$settings = $settings ?? Helper::get_settings();
		$rows     = [];

		foreach ( self::rows_from( $settings ) as $row ) {
			if ( ! OfferLimits::is_paused( OfferVersions::CART_REWARD, $row['id'] ) ) {
				$rows[] = $row;
			}
		}

		usort(
			$rows,
			static function ( array $first, array $second ): int {
				return $first['threshold'] <=> $second['threshold'];
			}
		);

		return $rows;
	}

	/**
	 * Every saved milestone, oldest first, for the Free limit: `id` and `name`.
	 *
	 * @since 3.1.0
	 *
	 * @return array[]
	 */
	public static function active_oldest_first(): array {
		$rows = self::rows_from( Helper::get_settings() );

		usort(
			$rows,
			static function ( array $first, array $second ): int {
				return $first['id'] <=> $second['id'];
			}
		);

		return array_map(
			static function ( array $row ): array {
				return [
					'id'   => $row['id'],
					'name' => self::format_price_text( $row['threshold'] ) . ': ' . self::reward_label( $row ),
				];
			},
			$rows
		);
	}

	/**
	 * Valid rows held by settings.
	 *
	 * @since 3.1.0
	 *
	 * @param array $settings Module settings.
	 *
	 * @return array[]
	 */
	private static function rows_from( array $settings ): array {
		return array_values( array_filter( array_map( [ self::class, 'normalize_stored' ], (array) ( $settings['milestones'] ?? [] ) ) ) );
	}

	/**
	 * A stored row, or null when it isn't one.
	 *
	 * @since 3.1.0
	 *
	 * @param mixed $row Stored row.
	 *
	 * @return array|null
	 */
	private static function normalize_stored( $row ): ?array {
		return is_array( $row ) ? self::normalize_row( $row ) : null;
	}

	/**
	 * The cart's subtotal after discounts, in the store's tax display, as the
	 * shopper reads it. Worked out from the lines, because totals are zeroed
	 * before `woocommerce_before_calculate_totals`. The module's own fee never
	 * counts: it isn't a line.
	 *
	 * @since 3.1.0
	 *
	 * @param WC_Cart $cart Cart.
	 *
	 * @return float
	 */
	public static function subtotal( WC_Cart $cart ): float {
		if ( $cart->is_empty() ) {
			return 0.0;
		}

		// Gift and bump lines get their price while the cart calculates.
		if ( ! did_action( 'woocommerce_before_calculate_totals' ) ) {
			$cart->calculate_totals();
		}

		$by_line = CouponAmount::while_pricing(
			static function () use ( $cart ): array {
				$discounts = new WC_Discounts( $cart );

				foreach ( $cart->get_coupons() as $coupon ) {
					$discounts->apply_coupon( $coupon );
				}

				return $discounts->get_discounts_by_item();
			}
		);

		$subtotal = 0.0;

		foreach ( $cart->get_cart() as $key => $item ) {
			$line      = (float) $item['data']->get_price() * (int) $item['quantity'] - (float) ( $by_line[ $key ] ?? 0 );
			$subtotal += Money::display_amount( $item['data'], max( 0.0, $line ), 'cart' );
		}

		return $subtotal;
	}

	/**
	 * The active milestones a cart has reached. A cart holding only its gift
	 * lines reaches nothing.
	 *
	 * @since 3.1.0
	 *
	 * @param WC_Cart $cart Cart.
	 *
	 * @return array[]
	 */
	public static function reached( WC_Cart $cart ): array {
		$has_purchase = false;

		foreach ( $cart->get_cart() as $item ) {
			if ( empty( $item[ CartLine::REWARD_GIFT ] ) ) {
				$has_purchase = true;
				break;
			}
		}

		if ( ! $has_purchase ) {
			return [];
		}

		$subtotal = self::subtotal( $cart );

		return array_values(
			array_filter(
				self::active(),
				static function ( array $row ) use ( $subtotal ): bool {
					return self::is_reached( $row, $subtotal );
				}
			)
		);
	}

	/**
	 * Whether a subtotal meets a milestone, at the store's rounding.
	 *
	 * @since 3.1.0
	 *
	 * @param array $row      Milestone.
	 * @param float $subtotal Cart subtotal.
	 *
	 * @return bool
	 */
	private static function is_reached( array $row, float $subtotal ): bool {
		return Money::compare( $subtotal, $row['threshold'] ) >= 0;
	}

	/**
	 * The free shipping state of a cart: the lowest free-shipping threshold
	 * and whether it is met; null when no milestone gives free shipping.
	 *
	 * @since 3.1.0
	 *
	 * @param WC_Cart $cart Cart.
	 *
	 * @return array{threshold: float, reached: bool}|null
	 */
	public static function free_shipping_state( WC_Cart $cart ): ?array {
		foreach ( self::active() as $row ) {
			if ( self::FREE_SHIPPING === $row['reward'] ) {
				return [
					'threshold' => $row['threshold'],
					'reached'   => self::is_reached( $row, self::subtotal( $cart ) ),
				];
			}
		}

		return null;
	}

	/**
	 * The discount milestone a cart earns: the highest it reached.
	 *
	 * @since 3.1.0
	 *
	 * @param WC_Cart $cart Cart.
	 *
	 * @return array|null
	 */
	public static function discount_reached( WC_Cart $cart ): ?array {
		$discount = null;

		foreach ( self::reached( $cart ) as $row ) {
			if ( self::DISCOUNT === $row['reward'] ) {
				$discount = $row;
			}
		}

		return $discount;
	}

	/**
	 * The first milestone a subtotal hasn't met.
	 *
	 * @since 3.1.0
	 *
	 * @param array[] $rows     Milestones, lowest threshold first.
	 * @param float   $subtotal Cart subtotal.
	 *
	 * @return array|null Null when every milestone is met.
	 */
	public static function next( array $rows, float $subtotal ): ?array {
		foreach ( $rows as $row ) {
			if ( ! self::is_reached( $row, $subtotal ) ) {
				return $row;
			}
		}

		return null;
	}

	/**
	 * The bar's copy for the next milestone: `[amount]` and `{remaining}` for
	 * what is left to spend, `{reward}` for what it unlocks.
	 *
	 * @since 3.1.0
	 *
	 * @param string $copy     Copy.
	 * @param array  $row      Next milestone.
	 * @param float  $subtotal Cart subtotal.
	 *
	 * @return string May hold the markup of `wc_price()`.
	 */
	public static function fill_copy( string $copy, array $row, float $subtotal ): string {
		$remaining = wc_price( $row['threshold'] - $subtotal );

		return str_replace( [ '[amount]', '{remaining}', '{reward}' ], [ $remaining, $remaining, self::reward_label( $row ) ], $copy );
	}

	/**
	 * What a milestone gives, as the shopper reads it.
	 *
	 * @since 3.1.0
	 *
	 * @param array $row Milestone.
	 *
	 * @return string
	 */
	public static function reward_label( array $row ): string {
		switch ( $row['reward'] ) {
			case self::GIFT:
				$product = wc_get_product( $row['gift_product_id'] );

				/* translators: %s: product name. */
				return $product ? sprintf( __( 'a free %s', 'storegrowth-sales-booster' ), $product->get_name() ) : __( 'a free gift', 'storegrowth-sales-booster' );

			case self::COUPON:
				$coupon = self::coupon( $row );

				return $coupon ? self::coupon_title( $coupon ) : __( 'a coupon', 'storegrowth-sales-booster' );

			case self::DISCOUNT:
				return 'percentage' === $row['discount_mode']
					/* translators: %s: percentage. */
					? sprintf( __( '%s%% off', 'storegrowth-sales-booster' ), wc_format_localized_decimal( $row['discount_value'] ) )
					/* translators: %s: amount. */
					: sprintf( __( '%s off', 'storegrowth-sales-booster' ), self::format_price_text( $row['discount_value'] ) );

			default:
				return __( 'free shipping', 'storegrowth-sales-booster' );
		}
	}

	/**
	 * The coupon of a coupon milestone. An automatic Smart Coupon has a code
	 * nobody can use, so it is never shown.
	 *
	 * @since 3.1.0
	 *
	 * @param array $row Milestone.
	 *
	 * @return WC_Coupon|null
	 */
	public static function coupon( array $row ): ?WC_Coupon {
		$coupon = new WC_Coupon( $row['coupon_id'] );

		return $coupon->get_id() && ! SmartCoupon::is_automatic( $coupon ) ? $coupon : null;
	}

	/**
	 * The name a coupon goes by. A coupon from outside Smart Coupons goes by
	 * its description.
	 *
	 * @since 3.1.0
	 *
	 * @param WC_Coupon $coupon Coupon.
	 *
	 * @return string
	 */
	private static function coupon_title( WC_Coupon $coupon ): string {
		$title = SmartCoupon::is_smart( $coupon ) ? (string) $coupon->get_meta( SmartCoupon::TITLE ) : $coupon->get_description();

		return '' !== $title ? $title : __( 'a coupon', 'storegrowth-sales-booster' );
	}

	/**
	 * What a reached coupon milestone tells the shopper.
	 *
	 * @since 3.1.0
	 *
	 * @param array $row Reached coupon milestone.
	 *
	 * @return array{code: string, message: string}|null
	 */
	public static function coupon_unlocked( array $row ): ?array {
		$coupon = self::COUPON === $row['reward'] ? self::coupon( $row ) : null;

		if ( ! $coupon ) {
			return null;
		}

		$code = strtoupper( $coupon->get_code() );

		return [
			'code'    => $code,
			/* translators: %1$s: coupon name, %2$s: coupon code. */
			'message' => sprintf( __( 'You unlocked %1$s: %2$s', 'storegrowth-sales-booster' ), self::coupon_title( $coupon ), $code ),
		];
	}

	/**
	 * The rewards bar for a cart, the same data for the classic and block
	 * carts. Null when there is nothing to show.
	 *
	 * @since 3.1.0
	 *
	 * @param WC_Cart $cart Cart.
	 *
	 * @return array{placement: string, message: string, percent: int, percent_width: string, milestones: array[], unlocked: array[]}|null
	 */
	public static function progress( WC_Cart $cart ): ?array {
		$settings = Helper::get_settings();
		$rows     = self::active( $settings );

		if ( ! $rows || $cart->is_empty() ) {
			return null;
		}

		$subtotal   = self::subtotal( $cart );
		$next       = self::next( $rows, $subtotal );
		$milestones = [];
		$unlocked   = [];

		foreach ( $rows as $row ) {
			$reached = self::is_reached( $row, $subtotal );
			$price   = self::format_price_text( $row['threshold'] );
			$label   = self::reward_label( $row );

			$milestones[] = [
				'threshold' => $price,
				'label'     => $label,
				'text'      => $price . ' · ' . $label,
				'reached'   => $reached,
			];

			$coupon = $reached ? self::coupon_unlocked( $row ) : null;

			if ( $coupon ) {
				$unlocked[] = $coupon;
			}
		}

		$percent = $next && $next['threshold'] > 0 ? (int) min( 100, floor( $subtotal / $next['threshold'] * 100 ) ) : 100;

		// A running campaign's copy, on the module's own milestones.
		$campaign_copy = DisplayRules::campaign_copy( 'cart_rewards', (array) $settings );

		return [
			'placement'     => (string) PluginHelper::find_option_settings( $settings, 'bar_placement', 'both' ),
			'message'       => '' !== $campaign_copy ? $campaign_copy : self::plain_text( $next ? self::fill_copy( (string) PluginHelper::find_option_settings( $settings, 'progressive_banner_text' ), $next, $subtotal ) : (string) PluginHelper::find_option_settings( $settings, 'goal_completion_text' ) ),
			'percent'       => $percent,
			'percent_width' => $percent . '%',
			'milestones'    => $milestones,
			'unlocked'      => $unlocked,
		];
	}

	/**
	 * Every shipping zone and whether it has an enabled Free shipping method,
	 * "Rest of the world" included when the store ships there.
	 *
	 * @since 3.1.0
	 *
	 * @return array<int, array{name: string, has_free_shipping: bool}>
	 */
	public static function shipping_zones(): array {
		$zones = array_map(
			static function ( array $zone ): WC_Shipping_Zone {
				return new WC_Shipping_Zone( (int) $zone['id'] );
			},
			WC_Shipping_Zones::get_zones()
		);

		// Not in the list above; only a zone with methods is really shipped to.
		$rest = new WC_Shipping_Zone( 0 );

		if ( $rest->get_shipping_methods( true ) ) {
			$zones[] = $rest;
		}

		$result = [];

		foreach ( $zones as $zone ) {
			$has_free = false;

			foreach ( $zone->get_shipping_methods( true ) as $method ) {
				if ( 'free_shipping' === $method->id ) {
					$has_free = true;
					break;
				}
			}

			$result[] = [
				'name'              => $zone->get_zone_name(),
				'has_free_shipping' => $has_free,
			];
		}

		return $result;
	}

	/**
	 * A price as plain text, as the shopper reads it.
	 *
	 * @since 3.1.0
	 *
	 * @param float $amount Amount.
	 *
	 * @return string
	 */
	private static function format_price_text( float $amount ): string {
		return self::plain_text( wc_price( $amount ) );
	}

	/**
	 * Copy as plain text, for the Store API and block carts.
	 *
	 * @since 3.1.0
	 *
	 * @param string $html Copy that may hold markup.
	 *
	 * @return string
	 */
	private static function plain_text( string $html ): string {
		return html_entity_decode( wp_strip_all_tags( $html ), ENT_QUOTES, 'UTF-8' );
	}
}
