<?php
/**
 * Storefront style renderer: module settings → scoped CSS variables.
 *
 * @package StorePulse\StoreGrowth
 */

namespace StorePulse\StoreGrowth\Storefront;

use StorePulse\StoreGrowth\Helper;

defined( 'ABSPATH' ) || exit;

/**
 * Turns a module's settings into CSS custom properties on its root class
 * (ADR-005 S1/S3):
 *
 *     StorefrontStyle::render( 'stock-bar', array(
 *         'bar-bg'     => array( 'value' => $s['stockbar_bg_color'], 'type' => 'color', 'default' => '#e7efff' ),
 *         'bar-height' => array( 'value' => $s['stockbar_height'], 'type' => 'px', 'default' => 10 ),
 *     ) );
 *     // → .spsg-stock-bar{--spsg-stock-bar-bar-bg:#e7efff;--spsg-stock-bar-bar-height:10px;}
 *
 * The module's static CSS reads them with today's value as the fallback
 * (`var(--spsg-stock-bar-bar-bg, #e7efff)`), so an unsaved site renders as
 * before. Every value is sanitized for the CSS context; an invalid value
 * falls back to the token's default, never to empty.
 *
 * @since SPSG_VERSION
 */
class StorefrontStyle {

	/**
	 * CSS rule with a module's variables.
	 *
	 * Token types:
	 * - `color`: any colour `Helper::sanitize_css_color()` accepts (hex, rgb/hsl, keywords);
	 * - `px`: integer, printed with `px`;
	 * - `number`: plain number (e.g. line-height);
	 * - `font`: font family; `inherit` stays a keyword, names are quoted;
	 * - `keyword`: one of the token's `allowed` values.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param string $module Module id; the rule targets `.spsg-<module>`.
	 * @param array  $tokens Token name → `{ value, type, default?, allowed? }`.
	 *
	 * @return string CSS, or '' when no token has a value.
	 */
	public static function render( string $module, array $tokens ): string {
		$module = sanitize_key( $module );
		$vars   = array();

		foreach ( $tokens as $name => $token ) {
			$name = sanitize_key( (string) $name );

			if ( '' === $name || ! is_array( $token ) ) {
				continue;
			}

			$value = self::css_value( $token );

			if ( '' !== $value ) {
				$vars[] = "--spsg-{$module}-{$name}:{$value};";
			}
		}

		return $vars ? ".spsg-{$module}{" . implode( '', $vars ) . '}' : '';
	}

	/**
	 * Add a module's variables after one of its stylesheets.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param string $handle Registered stylesheet handle.
	 * @param string $module Module id.
	 * @param array  $tokens Tokens, as for `render()`.
	 *
	 * @return void
	 */
	public static function attach( string $handle, string $module, array $tokens ): void {
		$css = self::render( $module, $tokens );

		if ( '' !== $css ) {
			wp_add_inline_style( $handle, $css );
		}
	}

	/**
	 * One token's sanitized CSS value.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array $token `{ value, type, default?, allowed? }`.
	 *
	 * @return string
	 */
	private static function css_value( array $token ): string {
		$type    = $token['type'] ?? '';
		$default = $token['default'] ?? '';
		$value   = $token['value'] ?? $default;

		switch ( $type ) {
			case 'color':
				$fallback = Helper::sanitize_css_color( $default );

				return Helper::sanitize_css_color( $value, $fallback );

			case 'px':
				if ( ! is_numeric( $value ) ) {
					$value = $default;
				}

				return is_numeric( $value ) ? (int) $value . 'px' : '';

			case 'number':
				if ( ! is_numeric( $value ) ) {
					$value = $default;
				}

				return is_numeric( $value ) ? (string) ( 0 + $value ) : '';

			case 'font':
				return self::font_value( $value, (string) $default );

			case 'keyword':
				$allowed = array_map( 'strtolower', (array) ( $token['allowed'] ?? array() ) );

				return Helper::sanitize_css_keyword( $value, $allowed, Helper::sanitize_css_keyword( $default, $allowed ) );

			default:
				return '';
		}
	}

	/**
	 * A font family for CSS: `inherit` stays a keyword, a family name is
	 * quoted. Only letters, digits, spaces and hyphens are allowed.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param mixed  $value    Stored family.
	 * @param string $fallback Fallback family.
	 *
	 * @return string
	 */
	private static function font_value( $value, string $fallback ): string {
		$family = is_scalar( $value ) ? trim( (string) $value ) : '';

		if ( ! preg_match( '/^[A-Za-z0-9 \-]+$/', $family ) ) {
			$family = $fallback;
		}

		if ( '' === $family || ! preg_match( '/^[A-Za-z0-9 \-]+$/', $family ) ) {
			return '';
		}

		return 'inherit' === strtolower( $family ) ? 'inherit' : "'{$family}'";
	}
}
