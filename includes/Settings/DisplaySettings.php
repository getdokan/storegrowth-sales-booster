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
				'label'   => __( 'Show', 'storegrowth-sales-booster' ),
				'labels'  => [
					'banner-show-everywhere' => __( 'Show Everywhere', 'storegrowth-sales-booster' ),
					'banner-show-selected'   => __( 'Show on Specific Pages', 'storegrowth-sales-booster' ),
				],
			],
			'slected_page_option' => [
				'type'      => 'list',
				'default'   => [],
				'options'   => self::PAGE_CONDITIONS,
				'pro'       => true,
				'label'     => __( 'Pages', 'storegrowth-sales-booster' ),
				'labels'    => [
					'is_front_page' => __( 'Front page', 'storegrowth-sales-booster' ),
					'is_home'       => __( 'Blog page', 'storegrowth-sales-booster' ),
					'is_singular'   => __( 'Any single post, page or product', 'storegrowth-sales-booster' ),
					'is_page'       => __( 'Pages', 'storegrowth-sales-booster' ),
					'is_attachment' => __( 'Attachment pages', 'storegrowth-sales-booster' ),
					'is_search'     => __( 'Search results', 'storegrowth-sales-booster' ),
					'is_404'        => __( '404 page', 'storegrowth-sales-booster' ),
					'is_archive'    => __( 'Archives', 'storegrowth-sales-booster' ),
					'is_category'   => __( 'Category archives', 'storegrowth-sales-booster' ),
					'is_tag'        => __( 'Tag archives', 'storegrowth-sales-booster' ),
				],
				'show_when' => [ 'banner_show_option' => 'banner-show-selected' ],
			],
			'user_type'           => [
				'type'    => 'select',
				'default' => 'both',
				'options' => [ 'both', 'logged_in', 'not_logged_in' ],
				'pro'     => true,
				'label'   => __( 'Who Can See', 'storegrowth-sales-booster' ),
				'labels'  => [
					'both'          => __( 'Everyone', 'storegrowth-sales-booster' ),
					'logged_in'     => __( 'Logged-in customers', 'storegrowth-sales-booster' ),
					'not_logged_in' => __( 'Guests only', 'storegrowth-sales-booster' ),
				],
			],
		];
	}

	/**
	 * Put shared fields on a tab and section of a module's settings page
	 * (`SettingsPage`); the fields keep their labels and conditions.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array  $fields  Field definitions keyed by option key.
	 * @param string $tab     Tab id.
	 * @param string $section Section id, or '' for no section.
	 *
	 * @return array<string, array<string, mixed>>
	 */
	public static function place( array $fields, string $tab, string $section = '' ): array {
		foreach ( $fields as $key => $field ) {
			$fields[ $key ]['tab'] = $tab;

			if ( '' !== $section ) {
				$fields[ $key ]['section'] = $section;
			}
		}

		return $fields;
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
		$color      = static function ( string $value, string $label ): array {
			return [
				'type'    => 'color',
				'default' => $value,
				'label'   => $label,
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

		$seconds = __( 'sec', 'storegrowth-sales-booster' );

		return [
			'bar_type'            => [
				'type'    => 'select',
				'default' => 'normal',
				'options' => [ 'normal', 'sticky' ],
				'label'   => __( 'Bar Type', 'storegrowth-sales-booster' ),
				'labels'  => [
					'normal' => __( 'Normal', 'storegrowth-sales-booster' ),
					'sticky' => __( 'Sticky', 'storegrowth-sales-booster' ),
				],
			],
			'bar_position'        => [
				'type'    => 'select',
				'default' => 'top',
				'options' => [ 'top', 'bottom' ],
				'pro'     => true,
				'label'   => __( 'Bar Position', 'storegrowth-sales-booster' ),
				'labels'  => [
					'top'    => __( 'Top', 'storegrowth-sales-booster' ),
					'bottom' => __( 'Bottom', 'storegrowth-sales-booster' ),
				],
			],
			// Desktop / Mobile checkboxes (`device`: options are desktop, mobile).
			'banner_device_view'  => [
				'type'    => 'list',
				'default' => [ 'banner-show-desktop' ],
				'options' => [ 'banner-show-desktop', 'banner-show-mobile' ],
				'pro'     => true,
				'variant' => 'device',
				'label'   => __( 'Show Bar', 'storegrowth-sales-booster' ),
			],
			// Delay, or scrolling past the bar's height then the scroll delay (seconds).
			'banner_trigger'      => [
				'type'    => 'select',
				'default' => 'after-few-seconds',
				'options' => [ 'after-few-seconds', 'after-scroll' ],
				'pro'     => true,
				'variant' => 'radio',
				'label'   => __( 'Trigger', 'storegrowth-sales-booster' ),
				'labels'  => [
					'after-few-seconds' => __( 'After a few seconds', 'storegrowth-sales-booster' ),
					'after-scroll'      => __( 'After scroll', 'storegrowth-sales-booster' ),
				],
			],
			// One delay shows at a time, by trigger.
			'banner_delay'        => array_merge(
				$pro_number( $delay, 0 ),
				[
					'label'     => __( 'Delay before showing', 'storegrowth-sales-booster' ),
					'suffix'    => $seconds,
					'show_when' => [ 'banner_trigger' => 'after-few-seconds' ],
				]
			),
			'scroll_banner_delay' => array_merge(
				$pro_number( $delay, 0 ),
				[
					'label'     => __( 'Delay after scrolling past the bar', 'storegrowth-sales-booster' ),
					'suffix'    => $seconds,
					'show_when' => [ 'banner_trigger' => 'after-scroll' ],
				]
			),
			'banner_height'       => array_merge(
				$pro_number( 60, 1 ),
				[
					'label'  => __( 'Banner Height', 'storegrowth-sales-booster' ),
					'suffix' => 'px',
				]
			),
			'font_size'           => array_merge(
				$pro_number( 20, 1 ),
				[
					'label'  => __( 'Font Size', 'storegrowth-sales-booster' ),
					'suffix' => 'px',
				]
			),
			'font_family'         => [
				'type'    => 'select',
				'default' => 'poppins',
				'options' => array_keys( self::BAR_FONTS ),
				'label'   => __( 'Font Family', 'storegrowth-sales-booster' ),
				'labels'  => self::BAR_FONTS,
			],
			'background_color'    => $color( '#0875FF', __( 'Background Color', 'storegrowth-sales-booster' ) ),
			'text_color'          => $color( '#ffffff', __( 'Text Color', 'storegrowth-sales-booster' ) ),
			'icon_color'          => $color( '#ffffff', __( 'Icon Color', 'storegrowth-sales-booster' ) ),
			'close_icon_color'    => $color( '#ffffff', __( 'Close Icon Color', 'storegrowth-sales-booster' ) ),
		];
	}
}
