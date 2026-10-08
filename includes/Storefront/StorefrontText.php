<?php
/**
 * Storefront text tokens.
 *
 * @package StorePulse\StoreGrowth
 */

namespace StorePulse\StoreGrowth\Storefront;

defined( 'ABSPATH' ) || exit;

/**
 * One replacer for the text tokens every module uses (ADR-005 S5). Accepts
 * both `{token}` (canonical, shown in the admin) and the older `[token]`,
 * so texts saved as `[amount]` or `[discount]` keep working.
 *
 * Canonical tokens: `{amount}`, `{discount}`, `{quantity}`, `{product_title}`,
 * `{offered_product}`, `{virtual_name}`, `{location}`, `{time}`.
 *
 * Values are inserted as given: escape the result for its context, as today
 * (a `wc_price()` value is HTML and must pass through).
 *
 * @since SPSG_VERSION
 */
class StorefrontText {

	/**
	 * Replace `{token}` and `[token]` with their values. Unknown tokens are
	 * left as they are.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param string $text Text with tokens.
	 * @param array  $vars Token name (without brackets) → value.
	 *
	 * @return string
	 */
	public static function replace( string $text, array $vars ): string {
		$pairs = [];

		foreach ( $vars as $name => $value ) {
			if ( ! is_scalar( $value ) && null !== $value ) {
				continue;
			}

			$pairs[ '{' . $name . '}' ] = (string) $value;
			$pairs[ '[' . $name . ']' ] = (string) $value;
		}

		return $pairs ? strtr( $text, $pairs ) : $text;
	}
}
