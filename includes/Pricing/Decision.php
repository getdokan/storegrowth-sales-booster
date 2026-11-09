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
 * @since SPSG_VERSION
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
	 * Hold a decision.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array $lines      Per line: label, winner, steps.
	 * @param array $coupon_won Bought lines whose BOGO lost: key => coupon name.
	 * @param array $rejected   Coupons out of the cart: code => message.
	 * @param array $lost_lines Lines a coupon lost: code => keys.
	 * @param array $reported   Codes reported on a line.
	 */
	public function __construct( array $lines = [], array $coupon_won = [], array $rejected = [], array $lost_lines = [], array $reported = [] ) {
		$this->lines      = $lines;
		$this->coupon_won = $coupon_won;
		$this->rejected   = $rejected;
		$this->lost_lines = $lost_lines;
		$this->reported   = $reported;
	}

	/**
	 * What a cart line shows.
	 *
	 * @since SPSG_VERSION
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
	 * @since SPSG_VERSION
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
	 * @since SPSG_VERSION
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
	 * @since SPSG_VERSION
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
	 * @since SPSG_VERSION
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
	 * @since SPSG_VERSION
	 *
	 * @return bool
	 */
	public function is_empty(): bool {
		return empty( $this->lines ) && empty( $this->coupon_won ) && empty( $this->rejected ) && empty( $this->lost_lines ) && empty( $this->reported );
	}

	/**
	 * The decision as data, for logs and the Store API.
	 *
	 * @since SPSG_VERSION
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
