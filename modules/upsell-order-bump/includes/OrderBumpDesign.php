<?php
/**
 * An order bump's `design_settings`: defaults and per-key sanitizing.
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Modules\UpsellOrderBump;

use StorePulse\StoreGrowth\Helper;
use WC_Product;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * The keys of an order bump's `design_settings` column, as the 2.x admin
 * stored them and the checkout box reads them. Used on save (REST) and on
 * render, so a row stored before sanitizing is still printed safely.
 *
 * @since SPSG_VERSION
 */
class OrderBumpDesign {

	/**
	 * Colour keys.
	 *
	 * @since SPSG_VERSION
	 *
	 * @var string[]
	 */
	const COLOR_KEYS = [
		'box_border_color',
		'discount_background_color',
		'discount_text_color',
		'product_description_text_color',
		'accept_offer_background_color',
		'accept_offer_text_color',
		'offer_description_background_color',
		'offer_description_text_color',
	];

	/**
	 * Margin keys, in px (stored as integers).
	 *
	 * @since SPSG_VERSION
	 *
	 * @var string[]
	 */
	const MARGIN_KEYS = [
		'box_top_margin',
		'box_bottom_margin',
	];

	/**
	 * Font size keys, in px (stored as numeric strings).
	 *
	 * @since SPSG_VERSION
	 *
	 * @var string[]
	 */
	const FONT_SIZE_KEYS = [
		'discount_font_size',
		'product_description_font_size',
		'accept_offer_font_size',
		'offer_description_font_size',
	];

	/**
	 * Plain text keys (the checkout block prints some of them as HTML).
	 *
	 * @since SPSG_VERSION
	 *
	 * @var string[]
	 */
	const TEXT_KEYS = [
		'offer_product_title',
		'offer_discount_title',
		'offer_fixed_price_title',
		'product_description',
		'selection_title',
		'offer_description',
	];

	/**
	 * Largest margin, in px.
	 *
	 * @since SPSG_VERSION
	 *
	 * @var int
	 */
	const MAX_MARGIN = 200;

	/**
	 * Largest font size, in px.
	 *
	 * @since SPSG_VERSION
	 *
	 * @var int
	 */
	const MAX_FONT_SIZE = 100;

	/**
	 * The box's border styles.
	 *
	 * @since SPSG_VERSION
	 *
	 * @var string[]
	 */
	const BORDER_STYLES = [ 'solid', 'dashed', 'dotted', 'no_border' ];

	/**
	 * Days a bump can run on (`bump_schedule`); `daily` is every day.
	 *
	 * @since SPSG_VERSION
	 *
	 * @var string[]
	 */
	const SCHEDULE = [ 'daily', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday' ];

	/**
	 * The 2.x admin's defaults for a new bump.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return array
	 */
	public static function get_defaults() {
		return [
			'box_border_style'                   => 'solid',
			'box_border_color'                   => '#32DBBE',
			'box_top_margin'                     => 1,
			'box_bottom_margin'                  => 1,
			'discount_background_color'          => '#E1FFF4',
			'discount_text_color'                => '#02AC6E',
			'discount_font_size'                 => '13',
			'product_description_text_color'     => '#080814',
			'product_description_font_size'      => '18',
			'accept_offer_background_color'      => '#e08b22ff',
			'accept_offer_text_color'            => '#000000',
			'accept_offer_font_size'             => '14',
			'offer_description_background_color' => '#8fa68bff',
			'offer_description_text_color'       => '#000000',
			'offer_description_font_size'        => '14',
			'offer_discount_title'               => '% off only for you!',
			'offer_fixed_price_title'            => '$ Just Only',
			'product_description'                => 'Add product description please',
			'selection_title'                    => 'Add selection title please',
			'offer_description'                  => 'Add offer description please',
			// A bump stored without it runs every day too (`runs_on()`).
			'bump_schedule'                      => [ 'daily' ],
		];
	}

	/**
	 * Sanitize design settings key by key. A colour, size or border style that
	 * isn't valid falls back to the default; keys this class doesn't know are
	 * kept as sanitized text.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array $design Design settings.
	 *
	 * @return array
	 */
	public static function sanitize( array $design ) {
		$defaults  = self::get_defaults();
		$sanitized = [];

		foreach ( $design as $key => $value ) {
			$key = sanitize_key( $key );

			if ( in_array( $key, self::COLOR_KEYS, true ) ) {
				$sanitized[ $key ] = Helper::sanitize_css_color( $value, $defaults[ $key ] );
			} elseif ( in_array( $key, self::MARGIN_KEYS, true ) ) {
				$sanitized[ $key ] = is_numeric( $value ) ? self::clamp( $value, self::MAX_MARGIN ) : $defaults[ $key ];
			} elseif ( in_array( $key, self::FONT_SIZE_KEYS, true ) ) {
				$sanitized[ $key ] = is_numeric( $value ) ? (string) self::clamp( $value, self::MAX_FONT_SIZE ) : $defaults[ $key ];
			} elseif ( 'box_border_style' === $key ) {
				$sanitized[ $key ] = Helper::sanitize_css_keyword( $value, self::BORDER_STYLES, $defaults[ $key ] );
			} elseif ( 'offer_image_url' === $key ) {
				$sanitized[ $key ] = is_scalar( $value ) ? esc_url_raw( (string) $value ) : '';
			} elseif ( 'offer_product_regular_price' === $key ) {
				$sanitized[ $key ] = is_numeric( $value ) ? wc_format_decimal( $value ) : '';
			} elseif ( 'bump_schedule' === $key ) {
				$sanitized[ $key ] = self::sanitize_schedule( $value );
			} elseif ( in_array( $key, self::TEXT_KEYS, true ) ) {
				$sanitized[ $key ] = self::sanitize_text( $value );
			} elseif ( is_scalar( $value ) || is_array( $value ) ) {
				$sanitized[ $key ] = map_deep( $value, [ self::class, 'sanitize_value' ] );
			}
		}

		return $sanitized;
	}

	/**
	 * A schedule as a list of `SCHEDULE` days: unknown values dropped, and
	 * `[ 'daily' ]` when it's empty or has `daily` (every day).
	 *
	 * @since SPSG_VERSION
	 *
	 * @param mixed $value Days: a list, or a comma-separated string.
	 *
	 * @return string[]
	 */
	public static function sanitize_schedule( $value ) {
		if ( is_string( $value ) ) {
			$value = explode( ',', $value );
		}

		$days = array_values( array_intersect( self::SCHEDULE, array_map( 'sanitize_key', array_filter( (array) $value, 'is_scalar' ) ) ) );

		return ! $days || in_array( 'daily', $days, true ) ? [ 'daily' ] : $days;
	}

	/**
	 * Whether a bump runs on a day: always without a schedule (bumps saved
	 * before it existed) or with `daily`, else on the listed days.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array       $design The bump's `design_settings`.
	 * @param string|null $day    A day (`monday`, …); null for today in the site's timezone.
	 *
	 * @return bool
	 */
	public static function runs_on( array $design, $day = null ) {
		if ( ! isset( $design['bump_schedule'] ) ) {
			return true;
		}

		$schedule = self::sanitize_schedule( $design['bump_schedule'] );

		return in_array( 'daily', $schedule, true ) || in_array( $day ?? self::today(), $schedule, true );
	}

	/**
	 * Today's day in the site's timezone (`monday`, …).
	 *
	 * @since SPSG_VERSION
	 *
	 * @return string
	 */
	public static function today() {
		// `N` (1 = Monday), not `l`: `wp_date()` translates day names.
		return self::SCHEDULE[ (int) wp_date( 'N' ) ];
	}

	/**
	 * The offer product's copies the checkout box reads from
	 * `design_settings`: its title, image and regular price.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param WC_Product $product Offer product.
	 *
	 * @return array
	 */
	public static function offer_product_copies( WC_Product $product ) {
		$image_url = $product->get_image_id() ? wp_get_attachment_url( $product->get_image_id() ) : '';

		return [
			'offer_product_title'         => $product->get_name(),
			'offer_image_url'             => $image_url ? $image_url : '',
			'offer_product_regular_price' => $product->get_regular_price(),
		];
	}

	/**
	 * A size in whole px from 0 to `$max` (a negative size is 0, not its
	 * absolute value).
	 *
	 * @since SPSG_VERSION
	 *
	 * @param mixed $value Numeric value.
	 * @param int   $max   Largest size.
	 *
	 * @return int
	 */
	private static function clamp( $value, $max ) {
		return min( $max, max( 0, (int) round( (float) $value ) ) );
	}

	/**
	 * A value of a key this class doesn't know: strings as plain text,
	 * booleans and numbers as they are.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param mixed $value Value.
	 *
	 * @return mixed
	 */
	public static function sanitize_value( $value ) {
		return is_string( $value ) ? self::sanitize_text( $value ) : $value;
	}

	/**
	 * A text as plain text: the 2.x admin's entities (`&#37;&#32;off`)
	 * decoded, then tags and line breaks stripped.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param mixed $value Text.
	 *
	 * @return string
	 */
	public static function sanitize_text( $value ) {
		if ( ! is_scalar( $value ) ) {
			return '';
		}

		return sanitize_text_field( html_entity_decode( (string) $value, ENT_QUOTES | ENT_HTML5, 'UTF-8' ) );
	}
}
