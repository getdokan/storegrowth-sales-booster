<?php
/**
 * The referee: decides how a cart's deals combine (ADR-014).
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Pricing;

use DateTimeImmutable;
use StorePulse\StoreGrowth\Interfaces\HookRegistry;
use StorePulse\StoreGrowth\Offers\OfferVersions;
use StorePulse\StoreGrowth\Support\Money;
use StorePulse\StoreGrowth\Support\SiteTime;
use WC_Cart;
use WC_Coupon;
use WC_Discounts;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Decides which deals apply to each cart line. It only acts on a cart with a
 * Smart Coupon or a campaign deal; every other cart takes the 3.0 path.
 *
 * Decisions are built on demand (`for_cart()`), because cart fragments render
 * labels without running totals, and from the deal list alone, so what the
 * decision does to the cart can't change the decision.
 *
 * @since SPSG_VERSION
 */
class Referee implements HookRegistry {

	/**
	 * Runs after the modules price their lines.
	 *
	 * @since SPSG_VERSION
	 */
	const PRIORITY = 100;

	/**
	 * Decisions made in this request, by cart state.
	 *
	 * @var array<string, Decision>
	 */
	private static array $decisions = [];

	/**
	 * Decisions already logged in this request.
	 *
	 * @var string[]
	 */
	private static array $logged = [];

	/**
	 * Whether a decision is being applied to the cart.
	 *
	 * @var bool
	 */
	private static bool $applying = false;

	/**
	 * Whether an automatic coupon is being checked against WooCommerce's rules.
	 *
	 * @var bool
	 */
	private static bool $resolving = false;

	/**
	 * Register hooks.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return void
	 */
	public function register_hooks(): void {
		add_action( 'woocommerce_before_calculate_totals', [ $this, 'apply_decision' ], self::PRIORITY );
		add_filter( 'woocommerce_get_item_data', [ $this, 'add_line_labels' ], 20, 2 );
	}

	/**
	 * Decide for this calculation and tell the modules.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param WC_Cart $cart Cart.
	 *
	 * @return void
	 */
	public function apply_decision( WC_Cart $cart ): void {
		// Adding or removing a gift recalculates totals.
		if ( self::$applying ) {
			return;
		}

		self::flush();

		$decision = self::for_cart( $cart );

		if ( self::is_observing() ) {
			self::log( $decision );

			return;
		}

		self::$applying = true;

		try {
			self::sync_automatic_coupons( $cart, $decision );

			/**
			 * Fires with the referee's decision, for the modules to apply it.
			 *
			 * @since SPSG_VERSION
			 *
			 * @param Decision $decision Decision.
			 * @param WC_Cart  $cart     Cart.
			 */
			do_action( 'spsg_referee_decided', $decision, $cart );
		} finally {
			self::$applying = false;
		}
	}

	/**
	 * Show a line's label and price steps.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array $item_data Item data.
	 * @param array $cart_item Cart item.
	 *
	 * @return array
	 */
	public function add_line_labels( $item_data, $cart_item ) {
		if ( self::is_observing() || empty( $cart_item['key'] ) || ! WC()->cart ) {
			return $item_data;
		}

		$line = self::for_cart( WC()->cart )->line( (string) $cart_item['key'] );

		if ( ! $line ) {
			return $item_data;
		}

		$item_data   = (array) $item_data;
		$item_data[] = [
			'key'   => __( 'Deal', 'storegrowth-sales-booster' ),
			'value' => $line['label'],
		];

		if ( count( $line['steps'] ) > 1 ) {
			$item_data[] = [
				'key'   => __( 'Price', 'storegrowth-sales-booster' ),
				'value' => self::format_steps( $line['steps'], $cart_item['data'] ),
			];
		}

		return $item_data;
	}

	/**
	 * The decision for a cart.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param WC_Cart        $cart      Cart.
	 * @param WC_Coupon|null $candidate A coupon being entered, not in the cart yet.
	 *
	 * @return Decision
	 */
	public static function for_cart( WC_Cart $cart, ?WC_Coupon $candidate = null ): Decision {
		$signature = self::signature( $cart, $candidate );

		if ( ! isset( self::$decisions[ $signature ] ) ) {
			self::$decisions[ $signature ] = self::decide( $cart, $candidate );
		}

		return self::$decisions[ $signature ];
	}

	/**
	 * Whether a coupon beat the BOGO deal on a bought line, for the paths that
	 * add a gift: no gift is added while one did. Never true in observe-only.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param string $key Bought line's cart item key.
	 *
	 * @return bool
	 */
	public static function coupon_won( string $key ): bool {
		return ! self::is_observing() && function_exists( 'WC' ) && WC()->cart && self::for_cart( WC()->cart )->coupon_won( $key );
	}

	/**
	 * Whether the referee only logs what it would decide.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return bool
	 */
	public static function is_observing(): bool {
		/**
		 * Filters whether the referee only logs its decisions. In this mode
		 * it changes no price, gift, coupon or label; decisions are logged
		 * through `wc_get_logger()`, source `spsg-referee`.
		 *
		 * @since SPSG_VERSION
		 *
		 * @param bool $observe_only Whether to observe only.
		 */
		return (bool) apply_filters( 'spsg_referee_observe_only', false );
	}

	/**
	 * Whether an automatic coupon is being checked, so the coupon gate lets
	 * the check through: the referee is about to judge that coupon itself.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return bool
	 */
	public static function is_resolving(): bool {
		return self::$resolving;
	}

	/**
	 * Forget this request's decisions.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return void
	 */
	public static function flush(): void {
		self::$decisions = [];
	}

	/**
	 * What makes one cart state different from another.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param WC_Cart        $cart      Cart.
	 * @param WC_Coupon|null $candidate Candidate coupon.
	 *
	 * @return string
	 */
	private static function signature( WC_Cart $cart, ?WC_Coupon $candidate ): string {
		$lines = [];

		foreach ( $cart->get_cart() as $key => $item ) {
			$lines[ $key ] = [ $item['product_id'], $item['variation_id'] ?? 0, $item['quantity'] ];
		}

		return md5( (string) wp_json_encode( [ $lines, self::coupon_codes( $cart, $candidate ) ] ) );
	}

	/**
	 * The codes in play: the applied ones, then a candidate.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param WC_Cart        $cart      Cart.
	 * @param WC_Coupon|null $candidate Candidate coupon.
	 *
	 * @return string[]
	 */
	private static function coupon_codes( WC_Cart $cart, ?WC_Coupon $candidate ): array {
		$codes = $cart->get_applied_coupons();

		if ( $candidate && ! in_array( $candidate->get_code(), $codes, true ) ) {
			$codes[] = $candidate->get_code();
		}

		return $codes;
	}

	/**
	 * Decide for a cart state.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param WC_Cart        $cart      Cart.
	 * @param WC_Coupon|null $candidate Candidate coupon.
	 *
	 * @return Decision
	 */
	private static function decide( WC_Cart $cart, ?WC_Coupon $candidate ): Decision {
		$coupons = self::candidates( $cart, $candidate );

		$has_smart = ! empty(
			array_filter(
				$coupons,
				static function ( WC_Coupon $coupon ): bool {
					return SmartCoupon::is_smart( $coupon );
				}
			)
		);

		// Rule 1: anything else takes the path it took before 3.1.
		if ( ! $has_smart && ! self::has_running_campaign() ) {
			return new Decision();
		}

		// A coupon's campaign amount and tier apply here too, not only in totals.
		return CouponAmount::while_pricing(
			static function () use ( $cart, $coupons ): Decision {
				return self::judge( DealList::for_cart( $cart, $coupons ) );
			}
		);
	}

	/**
	 * The coupons in play: those applied, a candidate, and the automatic
	 * Smart Coupons the cart qualifies for. A coupon from outside StoreGrowth
	 * with "Individual use" stands alone: WooCommerce's own rules decide, so
	 * nothing competes with it.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param WC_Cart        $cart      Cart.
	 * @param WC_Coupon|null $candidate Candidate coupon.
	 *
	 * @return array<string, WC_Coupon>
	 */
	private static function candidates( WC_Cart $cart, ?WC_Coupon $candidate ): array {
		$coupons = [];

		foreach ( self::coupon_codes( $cart, $candidate ) as $code ) {
			$coupon = new WC_Coupon( $code );

			/**
			 * Filters whether the referee leaves a coupon out of its decision,
			 * so it neither competes with deals nor is rejected or limited.
			 *
			 * @since SPSG_VERSION
			 *
			 * @param bool      $ignored Whether to leave the coupon out.
			 * @param WC_Coupon $coupon  Coupon.
			 */
			if ( apply_filters( 'spsg_referee_ignores_coupon', false, $coupon ) ) {
				continue;
			}

			// An automatic coupon that stopped qualifying leaves without a notice.
			if ( SmartCoupon::is_automatic( $coupon ) && ! self::meets_coupon_rules( $cart, $coupon ) ) {
				continue;
			}

			$coupons[ $code ] = $coupon;

			if ( $coupon->get_individual_use() && ! SmartCoupon::is_smart( $coupon ) ) {
				return [ $code => $coupon ];
			}
		}

		foreach ( SmartCoupon::automatic_codes() as $code ) {
			if ( isset( $coupons[ $code ] ) ) {
				continue;
			}

			$coupon = new WC_Coupon( $code );

			if ( self::meets_coupon_rules( $cart, $coupon ) ) {
				$coupons[ $code ] = $coupon;
			}
		}

		return $coupons;
	}

	/**
	 * Whether a coupon passes WooCommerce's own checks for a cart.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param WC_Cart   $cart   Cart.
	 * @param WC_Coupon $coupon Coupon.
	 *
	 * @return bool
	 */
	private static function meets_coupon_rules( WC_Cart $cart, WC_Coupon $coupon ): bool {
		self::$resolving = true;

		try {
			return true === ( new WC_Discounts( $cart ) )->is_coupon_valid( $coupon );
		} finally {
			self::$resolving = false;
		}
	}

	/**
	 * Whether a campaign is running over a deal the cart could hold.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return bool
	 */
	private static function has_running_campaign(): bool {
		$now = SiteTime::now();

		if ( OfferVersions::running_campaign_offers( OfferVersions::BOGO, $now ) || OfferVersions::running_campaign_offers( OfferVersions::ORDER_BUMP, $now ) ) {
			return true;
		}

		/**
		 * Filters whether a campaign sets product prices at a moment, so the
		 * referee decides carts that may hold a campaign price.
		 *
		 * @since SPSG_VERSION
		 *
		 * @param bool              $running Whether a campaign price is running.
		 * @param DateTimeImmutable $now     Moment checked.
		 */
		return (bool) apply_filters( 'spsg_campaign_prices_running', false, $now );
	}

	/**
	 * Apply rules 2 to 8 to the deal list.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array[] $lines Lines from `DealList::for_cart()`.
	 *
	 * @return Decision
	 */
	private static function judge( array $lines ): Decision {
		$coupons  = self::group_coupons( $lines );
		$reported = array_keys( $coupons );
		$winners  = [];
		$rejected = [];

		// Rule 3: a whole BOGO deal against a Smart Coupon that can't combine.
		foreach ( $coupons as $code => $coupon ) {
			if ( ! $coupon['smart'] || $coupon['combines'] ) {
				continue;
			}

			foreach ( $coupon['amounts'] as $key => $amount ) {
				$bogo = self::find_deal( $lines[ $key ], DealList::BOGO );

				if ( $bogo && Money::compare( $amount, (float) $bogo['amount'] ) <= 0 ) {
					unset( $coupons[ $code ]['amounts'][ $key ] );

					$coupons[ $code ]['lost'][ $key ] = $bogo['shown'] ?? $bogo['name'];
					$winners[ $key ]                  = $bogo['name'];
				}
			}

			if ( empty( $coupons[ $code ]['amounts'] ) ) {
				$rejected[ $code ] = sprintf(
					/* translators: %1$s: coupon code, %2$s: deal name. */
					__( '%1$s wasn\'t applied because %2$s saves you more.', 'storegrowth-sales-booster' ),
					strtoupper( (string) $code ),
					current( $coupons[ $code ]['lost'] )
				);
			}
		}

		$kept = self::resolve_clashes( $coupons, $rejected, $winners );

		// A coupon still on a line beat that line's BOGO deal, unless it combines.
		$coupon_won = [];

		foreach ( $kept as $code ) {
			foreach ( array_keys( $coupons[ $code ]['amounts'] ) as $key ) {
				if ( $coupons[ $code ]['smart'] && ! $coupons[ $code ]['combines'] && self::find_deal( $lines[ $key ], DealList::BOGO ) && ! isset( $coupon_won[ $key ] ) ) {
					$coupon_won[ $key ] = $coupons[ $code ]['name'];
					$winners[ $key ]    = $coupons[ $code ]['name'];
				}
			}
		}

		$lost_lines = [];

		foreach ( $coupons as $code => $coupon ) {
			if ( ! empty( $coupon['lost'] ) && ! isset( $rejected[ $code ] ) ) {
				$lost_lines[ (string) $code ] = array_map( 'strval', array_keys( $coupon['lost'] ) );
			}
		}

		return new Decision( self::line_views( $lines, $coupons, $kept, $winners ), $coupon_won, $rejected, $lost_lines, array_map( 'strval', $reported ), self::credited_promotions( $lines, $coupons, $kept, $coupon_won ) );
	}

	/**
	 * The campaigns behind the deals that stayed, largest saving first.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array[]  $lines      Lines.
	 * @param array    $coupons    Coupons by code.
	 * @param string[] $kept       Codes that stay.
	 * @param array    $coupon_won Bought lines whose BOGO deal lost.
	 *
	 * @return array<int, float>
	 */
	private static function credited_promotions( array $lines, array $coupons, array $kept, array $coupon_won ): array {
		$credits = [];

		foreach ( $lines as $key => $line ) {
			foreach ( $line['deals'] as $deal ) {
				$id = (int) ( $deal['promotion_id'] ?? 0 );

				if ( ! $id ) {
					continue;
				}

				$stayed = true;

				if ( DealList::BOGO === $deal['kind'] ) {
					$stayed = ! isset( $coupon_won[ $key ] );
				} elseif ( DealList::COUPON === $deal['kind'] ) {
					$stayed = in_array( $deal['code'], $kept, true ) && isset( $coupons[ $deal['code'] ]['amounts'][ $key ] );
				}

				if ( $stayed ) {
					$credits[ $id ] = ( $credits[ $id ] ?? 0.0 ) + (float) $deal['amount'];
				}
			}
		}

		arsort( $credits );

		return $credits;
	}

	/**
	 * Collect the coupon deals of every line, by code.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array[] $lines Lines.
	 *
	 * @return array<string, array{smart: bool, combines: bool, others: bool, name: string, shown: string, split: float|null, amounts: array, units: array, lost: array}>
	 */
	private static function group_coupons( array $lines ): array {
		$coupons = [];

		foreach ( $lines as $key => $line ) {
			foreach ( $line['deals'] as $deal ) {
				if ( DealList::COUPON !== $deal['kind'] ) {
					continue;
				}

				if ( ! isset( $coupons[ $deal['code'] ] ) ) {
					$coupons[ $deal['code'] ] = [
						'smart'    => $deal['smart'],
						'combines' => $deal['combines'],
						'others'   => $deal['others'],
						'name'     => $deal['name'],
						'shown'    => $deal['shown'],
						'split'    => $deal['split'],
						'amounts'  => [],
						'units'    => [],
						'lost'     => [],
					];
				}

				$coupons[ $deal['code'] ]['amounts'][ $key ] = (float) $deal['amount'];
				$coupons[ $deal['code'] ]['units'][ $key ]   = $line['quantity'];
			}
		}

		return $coupons;
	}

	/**
	 * Rules 4 and 8: coupons that can't be used together compete over what
	 * each still gives. The larger total stays, the coupon entered first on a
	 * tie. Two coupons that share no line don't clash.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array $coupons  Coupons by code; a loser's lines are moved to `lost`.
	 * @param array $rejected Rejections by code, added to.
	 * @param array $winners  Line winners by key, added to.
	 *
	 * @return string[] The codes that stay.
	 */
	private static function resolve_clashes( array &$coupons, array &$rejected, array &$winners ): array {
		$codes = array_map( 'strval', array_keys( $coupons ) );
		$order = array_flip( $codes );

		usort(
			$codes,
			static function ( string $first, string $second ) use ( $coupons, $order ): int {
				$by_total = Money::compare( array_sum( $coupons[ $second ]['amounts'] ), array_sum( $coupons[ $first ]['amounts'] ) );

				return 0 !== $by_total ? $by_total : $order[ $first ] <=> $order[ $second ];
			}
		);

		$kept = [];

		foreach ( $codes as $code ) {
			if ( isset( $rejected[ $code ] ) ) {
				continue;
			}

			$beaten_by = self::find_clash( $code, $kept, $coupons );

			if ( '' === $beaten_by ) {
				$kept[] = $code;
				continue;
			}

			$rejected[ $code ] = sprintf(
				/* translators: %s: coupon name. */
				__( 'Only one of these coupons can be used. We kept %s, which saves you more.', 'storegrowth-sales-booster' ),
				$coupons[ $beaten_by ]['shown']
			);

			foreach ( array_keys( array_intersect_key( $coupons[ $code ]['amounts'], $coupons[ $beaten_by ]['amounts'] ) ) as $key ) {
				$winners[ $key ] = $coupons[ $beaten_by ]['name'];
			}
		}

		return $kept;
	}

	/**
	 * The first kept coupon a coupon can't be used with on a shared line.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param string   $code    Coupon code.
	 * @param string[] $kept    Codes that stay.
	 * @param array    $coupons Coupons by code.
	 *
	 * @return string Empty when it clashes with none.
	 */
	private static function find_clash( string $code, array $kept, array $coupons ): string {
		foreach ( $kept as $other ) {
			if ( ! empty( array_intersect_key( $coupons[ $code ]['amounts'], $coupons[ $other ]['amounts'] ) ) && ! self::can_stack( $coupons[ $code ], $coupons[ $other ] ) ) {
				return $other;
			}
		}

		return '';
	}

	/**
	 * Whether two coupons can be used on the same line. A Smart Coupon stacks
	 * with another only when both can combine, and with one from outside
	 * StoreGrowth only when it allows other coupons. Two from outside
	 * follow WooCommerce's own rules.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array $first  Coupon.
	 * @param array $second Coupon.
	 *
	 * @return bool
	 */
	private static function can_stack( array $first, array $second ): bool {
		if ( $first['smart'] && $second['smart'] ) {
			return $first['combines'] && $second['combines'];
		}

		if ( $first['smart'] ) {
			return $first['others'];
		}

		return $second['smart'] ? $second['others'] : true;
	}

	/**
	 * What each line shows. A line is labelled when it has two or more deals
	 * and the cart holds a Smart Coupon or campaign deal.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array[]  $lines   Lines.
	 * @param array    $coupons Coupons by code.
	 * @param string[] $kept    Codes that stay.
	 * @param string[] $winners Line winners by key.
	 *
	 * @return array[]
	 */
	private static function line_views( array $lines, array $coupons, array $kept, array $winners ): array {
		if ( ! self::holds_qualifying_deal( $lines ) ) {
			return [];
		}

		$views = [];

		foreach ( $lines as $key => $line ) {
			if ( count( $line['deals'] ) < 2 ) {
				continue;
			}

			$winner = $winners[ $key ] ?? '';

			$views[ $key ] = [
				'label'  => '' !== $winner
					/* translators: %s: deal name. */
					? sprintf( __( 'Larger deal applied: %s', 'storegrowth-sales-booster' ), $winner )
					: __( 'Deals combined', 'storegrowth-sales-booster' ),
				'winner' => $winner,
				'steps'  => self::steps( (string) $key, $line, $coupons, $kept ),
			];
		}

		return $views;
	}

	/**
	 * Whether a line holds a Smart Coupon or campaign deal.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array[] $lines Lines.
	 *
	 * @return bool
	 */
	private static function holds_qualifying_deal( array $lines ): bool {
		foreach ( $lines as $line ) {
			foreach ( $line['deals'] as $deal ) {
				if ( ! empty( $deal['smart'] ) || ! empty( $deal['promotion_id'] ) ) {
					return true;
				}
			}
		}

		return false;
	}

	/**
	 * A line's unit price, deal by deal. A fixed-cart coupon is shown as
	 * WooCommerce charges it: split per unit over the lines it stayed on.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param string $key     Cart item key.
	 * @param array  $line    Line.
	 * @param array  $coupons Coupons by code.
	 * @param array  $kept    Codes that stay.
	 *
	 * @return array[]
	 */
	private static function steps( string $key, array $line, array $coupons, array $kept ): array {
		$steps = [
			[
				'label' => '',
				'price' => $line['start'],
			],
		];
		$price = $line['start'];

		foreach ( [ DealList::BASE, DealList::BUMP ] as $kind ) {
			$deal = self::find_deal( $line, $kind );

			if ( $deal && isset( $deal['price'] ) ) {
				$price   = (float) $deal['price'];
				$steps[] = [
					'label' => $deal['name'],
					'price' => $price,
				];
			}
		}

		foreach ( $kept as $code ) {
			if ( ! isset( $coupons[ $code ]['amounts'][ $key ] ) ) {
				continue;
			}

			$coupon  = $coupons[ $code ];
			$off     = null !== $coupon['split'] ? $coupon['split'] / array_sum( array_intersect_key( $coupon['units'], $coupon['amounts'] ) ) : $coupon['amounts'][ $key ] / $line['quantity'];
			$price   = max( 0.0, $price - min( $line['unit'], $off ) );
			$steps[] = [
				'label' => $coupon['name'],
				'price' => $price,
			];
		}

		return $steps;
	}

	/**
	 * The first deal of a kind on a line.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array  $line Line.
	 * @param string $kind Deal kind.
	 *
	 * @return array|null
	 */
	private static function find_deal( array $line, string $kind ): ?array {
		foreach ( $line['deals'] as $deal ) {
			if ( $kind === $deal['kind'] ) {
				return $deal;
			}
		}

		return null;
	}

	/**
	 * Apply or remove automatic coupons without a notice: one applies while
	 * it reaches a line and hasn't been rejected.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param WC_Cart  $cart     Cart.
	 * @param Decision $decision Decision.
	 *
	 * @return void
	 */
	private static function sync_automatic_coupons( WC_Cart $cart, Decision $decision ): void {
		$applied = $cart->get_applied_coupons();
		$added   = [];

		foreach ( SmartCoupon::automatic_codes() as $code ) {
			$wins       = $decision->reported( $code ) && '' === $decision->rejection( $code );
			$is_applied = in_array( $code, $applied, true );

			if ( $wins && ! $is_applied ) {
				$added[] = $code;
			}

			// WooCommerce's own removal: what a coupon left on the lines is
			// cleared on its `woocommerce_removed_coupon`. Dokan pays vendors
			// from that data.
			if ( ! $wins && $is_applied ) {
				$cart->remove_coupon( $code );
			}
		}

		if ( $added ) {
			$cart->set_applied_coupons( array_merge( $cart->get_applied_coupons(), $added ) );
		}
	}

	/**
	 * A line's price steps as the shopper reads them.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array[]     $steps   Steps.
	 * @param \WC_Product $product Line's product.
	 *
	 * @return string
	 */
	private static function format_steps( array $steps, $product ): string {
		$parts = [];

		foreach ( $steps as $step ) {
			$price   = html_entity_decode( wp_strip_all_tags( Money::price_html( $product, (float) $step['price'], 'cart' ) ), ENT_QUOTES, 'UTF-8' );
			$parts[] = trim( $price . ' ' . $step['label'] );
		}

		return implode( ' → ', $parts );
	}

	/**
	 * Log a decision once per request.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param Decision $decision Decision.
	 *
	 * @return void
	 */
	private static function log( Decision $decision ): void {
		$entry = (string) wp_json_encode( $decision->to_array() );

		if ( $decision->is_empty() || in_array( $entry, self::$logged, true ) ) {
			return;
		}

		self::$logged[] = $entry;

		wc_get_logger()->info( $entry, [ 'source' => 'spsg-referee' ] );
	}
}
