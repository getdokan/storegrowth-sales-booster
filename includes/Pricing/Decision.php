<?php
/**
 * What the referee decided for a cart (ADR-014).
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Pricing;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * The referee's answer for one cart. Reads only; nothing here touches the
 * cart. `to_array()` is the shape the Store API extension exposes.
 *
 * @since 3.1.0
 */
class Decision {

	/**
	 * Per line: `label`, `winner` and the `steps` of its price.
	 *
	 * @var array<string, array{label: string, winner: string, steps: array[]}>
	 */
	private array $lines;

	/**
	 * Bought lines whose BOGO deal lost to a coupon: line key => coupon name.
	 *
	 * @var array<string, string>
	 */
	private array $coupon_won;

	/**
	 * Coupons out of the cart: code => message.
	 *
	 * @var array<string, string>
	 */
	private array $rejected;

	/**
	 * Lines a coupon lost, while it stays on others: code => line keys.
	 *
	 * @var array<string, string[]>
	 */
	private array $lost_lines;

	/**
	 * Codes reported on at least one line.
	 *
	 * @var string[]
	 */
	private array $reported;

	/**
	 * Campaigns behind the deals that stayed: promotion id => what they saved.
	 *
	 * @var array<int, float>
	 */
	private array $promotions;

	/**
	 * Hold a decision.
	 *
	 * @since 3.1.0
	 *
	 * @param array $lines      Per line: label, winner, steps.
	 * @param array $coupon_won Bought lines whose BOGO lost: key => coupon name.
	 * @param array $rejected   Coupons out of the cart: code => message.
	 * @param array $lost_lines Lines a coupon lost: code => keys.
	 * @param array $reported   Codes reported on a line.
	 * @param array $promotions Campaigns behind the deals that stayed: id => saving.
	 */
	public function __construct( array $lines = [], array $coupon_won = [], array $rejected = [], array $lost_lines = [], array $reported = [], array $promotions = [] ) {
		$this->lines      = $lines;
		$this->coupon_won = $coupon_won;
		$this->rejected   = $rejected;
		$this->lost_lines = $lost_lines;
		$this->reported   = $reported;
		$this->promotions = $promotions;
	}

	/**
	 * The campaigns behind the deals that stayed, largest saving first.
	 *
	 * @since 3.1.0
	 *
	 * @return array<int, float> Promotion id => what its deals saved.
	 */
	public function promotions(): array {
		return $this->promotions;
	}

	/**
	 * What a cart line shows.
	 *
	 * @since 3.1.0
	 *
	 * @param string $key Cart item key.
	 *
	 * @return array{label: string, winner: string, steps: array[]}|null Null without a label.
	 */
	public function line( string $key ): ?array {
		return $this->lines[ $key ] ?? null;
	}

	/**
	 * Whether a Smart Coupon beat the BOGO deal on a bought line.
	 *
	 * @since 3.1.0
	 *
	 * @param string $key Bought line's cart item key.
	 *
	 * @return bool
	 */
	public function coupon_won( string $key ): bool {
		return isset( $this->coupon_won[ $key ] );
	}

	/**
	 * Why a coupon is out of the cart.
	 *
	 * @since 3.1.0
	 *
	 * @param string $code Coupon code.
	 *
	 * @return string Message; empty when it stays.
	 */
	public function rejection( string $code ): string {
		return $this->rejected[ $code ] ?? '';
	}

	/**
	 * Whether a coupon lost a line while staying on others.
	 *
	 * @since 3.1.0
	 *
	 * @param string $code Coupon code.
	 * @param string $key  Cart item key.
	 *
	 * @return bool
	 */
	public function lost_line( string $code, string $key ): bool {
		return in_array( $key, $this->lost_lines[ $code ] ?? [], true );
	}

	/**
	 * Whether a coupon reached any line of the cart.
	 *
	 * @since 3.1.0
	 *
	 * @param string $code Coupon code.
	 *
	 * @return bool
	 */
	public function reported( string $code ): bool {
		return in_array( $code, $this->reported, true );
	}

	/**
	 * Whether there is nothing to apply or show.
	 *
	 * @since 3.1.0
	 *
	 * @return bool
	 */
	public function is_empty(): bool {
		return empty( $this->lines ) && empty( $this->coupon_won ) && empty( $this->rejected ) && empty( $this->lost_lines ) && empty( $this->reported );
	}

	/**
	 * The decision as data, for logs and the Store API.
	 *
	 * @since 3.1.0
	 *
	 * @return array{lines: array, coupon_won: array, rejected: array, lost_lines: array}
	 */
	public function to_array(): array {
		return [
			'lines'      => $this->lines,
			'coupon_won' => $this->coupon_won,
			'rejected'   => $this->rejected,
			'lost_lines' => $this->lost_lines,
		];
	}
}
