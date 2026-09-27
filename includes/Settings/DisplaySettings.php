<?php
/**
 * Settings shared by the storefront bars and popups.
 *
 * @package StorePulse\StoreGrowth
 */

namespace StorePulse\StoreGrowth\Settings;

use StorePulse\StoreGrowth\Storefront\StorefrontFonts;

defined( 'ABSPATH' ) || exit;

/**
 * Field definitions several module schemas share, so the keys, values and
 * tiers stay the same in each:
 *
 * - `targeting_fields()`: page and audience targeting, which pro 2.2.0
 *   evaluates (Sales Notification, Free Shipping bar, Floating Bar);
 * - `bar_fields()`: the look, devices and trigger of the two storefront bars.
 *
 * Keys, values and typos are the ones already stored; tiers are the old
 * admin's.
 *
 * @since SPSG_VERSION
 */
class DisplaySettings {

	/**
	 * Page conditions pro 2.2.0 evaluates for "Show on Specific Pages".
	 *
	 * @since SPSG_VERSION
	 *
	 * @var string[]
	 */
	const PAGE_CONDITIONS = [ 'is_front_page', 'is_home', 'is_singular', 'is_page', 'is_attachment', 'is_search', 'is_404', 'is_archive', 'is_category', 'is_tag' ];

	/**
	 * Bar fonts: stored slug → CSS family. The five old ones are bundled
	 * (`@font-face` in the bars' stylesheets); Inter and Open Sans load
	 * through StorefrontFonts.
	 *
	 * @since SPSG_VERSION
	 *
	 * @var array<string, string>
	 */
	const BAR_FONTS = [
		'poppins'       => 'Poppins',
		'inter'         => 'Inter',
		'roboto'        => 'Roboto',
		'open_sans'     => 'Open Sans',
		'lato'          => 'Lato',
		'montserrat'    => 'Montserrat',
		'ibm_plex_sans' => 'IBM Plex Sans',
	];

	/**
	 * CSS family of a stored bar font, asking StorefrontFonts for the ones
	 * the bars don't bundle.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param mixed $slug Stored font.
	 *
	 * @return string Family, or '' for an unknown slug.
	 */
	public static function bar_font( $slug ): string {
		$family = self::BAR_FONTS[ is_string( $slug ) ? $slug : '' ] ?? '';

		if ( in_array( $family, [ 'Inter', 'Open Sans' ], true ) ) {
			StorefrontFonts::request( $family );
		}

		return $family;
	}

	/**
	 * Page and audience targeting (pro).
	 *
	 * @since SPSG_VERSION
	 *
	 * @return array<string, array<string, mixed>>
	 */
	public static function targeting_fields(): array {
		return [
			'banner_show_option'  => [
				'type'    => 'select',
				'default' => 'banner-show-everywhere',
				'options' => [ 'banner-show-everywhere', 'banner-show-selected' ],
				'pro'     => true,
			],
			'slected_page_option' => [
				'type'    => 'list',
				'default' => [],
				'options' => self::PAGE_CONDITIONS,
				'pro'     => true,
			],
			'user_type'           => [
				'type'    => 'select',
				'default' => 'both',
				'options' => [ 'both', 'logged_in', 'not_logged_in' ],
				'pro'     => true,
			],
		];
	}

	/**
	 * The storefront bars' look, devices and trigger.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param int $delay Seconds before the bar shows (both triggers); the
	 *                   modules' old defaults differ.
	 *
	 * @return array<string, array<string, mixed>>
	 */
	public static function bar_fields( int $delay ): array {
		$color      = static function ( string $value ): array {
			return [
				'type'    => 'color',
				'default' => $value,
			];
		};
		$pro_number = static function ( int $value, int $min ): array {
			return [
				'type'    => 'number',
				'default' => $value,
				'min'     => $min,
				'pro'     => true,
			];
		};

		return [
			'bar_type'            => [
				'type'    => 'select',
				'default' => 'normal',
				'options' => [ 'normal', 'sticky' ],
			],
			'bar_position'        => [
				'type'    => 'select',
				'default' => 'top',
				'options' => [ 'top', 'bottom' ],
				'pro'     => true,
			],
			'banner_device_view'  => [
				'type'    => 'list',
				'default' => [ 'banner-show-desktop' ],
				'options' => [ 'banner-show-desktop', 'banner-show-mobile' ],
				'pro'     => true,
			],
			// Delay, or scrolling past the bar's height then the scroll delay (seconds).
			'banner_trigger'      => [
				'type'    => 'select',
				'default' => 'after-few-seconds',
				'options' => [ 'after-few-seconds', 'after-scroll' ],
				'pro'     => true,
			],
			'banner_delay'        => $pro_number( $delay, 0 ),
			'scroll_banner_delay' => $pro_number( $delay, 0 ),
			'banner_height'       => $pro_number( 60, 1 ),
			'font_size'           => $pro_number( 20, 1 ),
			'font_family'         => [
				'type'    => 'select',
				'default' => 'poppins',
				'options' => array_keys( self::BAR_FONTS ),
			],
			'background_color'    => $color( '#0875FF' ),
			'text_color'          => $color( '#ffffff' ),
			'icon_color'          => $color( '#ffffff' ),
			'close_icon_color'    => $color( '#ffffff' ),
		];
	}
}
