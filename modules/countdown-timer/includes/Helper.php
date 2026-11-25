<?php
/**
 * Helper functions for countdown timer module.
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Modules\CountdownTimer;

use StorePulse\StoreGrowth\Helper as PluginHelper;
use StorePulse\StoreGrowth\Support\SiteTime;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class Helper.
 */
class Helper {

	/**
	 * Stored font slug → CSS family.
	 *
	 * @since 3.0.0
	 *
	 * @var array<string, string>
	 */
	const FONT_FAMILIES = [
		'roboto'        => 'Roboto',
		'inter'         => 'Inter',
		'open_sans'     => 'Open Sans',
		'lato'          => 'Lato',
		'poppins'       => 'Poppins',
		'montserrat'    => 'Montserrat',
		'ibm_plex_sans' => 'IBM Plex Sans',
		'merienda'      => 'Merienda',
	];

	/**
	 * Colours of each template (`selected_theme`), in this order: widget
	 * background, widget border, heading | counter background, counter border,
	 * digits, labels, separators. The old layouts set only the counter.
	 *
	 * The admin's presets get them from here (AdminPage). On the storefront a
	 * template's counter colours also apply in lite, where their fields need
	 * pro; with pro, saved values win.
	 *
	 * @since 3.0.0
	 *
	 * @var array<string, array<int, string|null>>
	 */
	const TEMPLATES = [
		'ct-layout-1' => [ null, null, null, '#FFFFFF', '#ECEDF0', '#1B1B50', '#64748B', '#1E293B' ],
		'ct-layout-2' => [ null, null, null, 'transparent', 'transparent', '#FFFFFF', '#FFFFFF', '#FFFFFF' ],
		'ct-blue'     => [ '#FFFFFF', '#3B82F6', '#1D4ED8', '#FFFFFF', '#E2E8F0', '#1E293B', '#64748B', '#1E293B' ],
		'ct-dark'     => [ '#0F172A', '#1E293B', '#EF4444', '#1E293B', '#334155', '#FFFFFF', '#94A3B8', '#FFFFFF' ],
		'ct-red'      => [ '#E90F31', '#E90F31', '#1F2938', '#CA0D2B', '#CA0D2B', '#FFFFFF', '#FFE4E6', '#FFFFFF' ],
		'ct-gray'     => [ '#EFEFF2', '#E2E8F0', '#0F172A', '#FFFFFF', '#FFFFFF', '#1E293B', '#64748B', '#1E293B' ],
		'ct-cyan'     => [ '#00ACF9', '#00ACF9', '#0F172A', '#27BCFA', '#5BCDFB', '#FFFFFF', '#ECFDF5', '#FFFFFF' ],
		'ct-orange'   => [ '#FFBD00', '#FFBD00', '#AD0000', '#FEF3C7', '#FDE68A', '#78350F', '#B45309', '#78350F' ],
	];

	/**
	 * Counter colour settings (pro fields) a template sets.
	 *
	 * @since 3.0.0
	 *
	 * @var string[]
	 */
	const COUNTER_KEYS = [
		'counter_background_color',
		'counter_border_color',
		'day_text_color',
		'hour_text_color',
		'minute_text_color',
		'second_text_color',
		'counter_label_color',
		'counter_separator_color',
	];

	/**
	 * CSS family of a stored font slug; other values pass through.
	 *
	 * @since 3.0.0
	 *
	 * @param mixed $slug Stored font.
	 *
	 * @return string
	 */
	public static function font_family( $slug ): string {
		$slug = is_scalar( $slug ) ? (string) $slug : '';

		return self::FONT_FAMILIES[ $slug ] ?? $slug;
	}

	/**
	 * The settings a template sets, setting key → colour. Unknown ids (e.g.
	 * the old `ct-custom`) get the first layout's.
	 *
	 * @since 3.0.0
	 *
	 * @param mixed $theme Template id.
	 *
	 * @return array<string, string>
	 */
	public static function template_colors( $theme ): array {
		$colors = self::TEMPLATES[ is_string( $theme ) ? $theme : '' ] ?? self::TEMPLATES['ct-layout-1'];
		$digits = $colors[5];
		$keys   = [ 'widget_background_color', 'border_color', 'heading_text_color', 'counter_background_color', 'counter_border_color', 'day_text_color', 'counter_label_color', 'counter_separator_color' ];

		return array_merge(
			array_filter( array_combine( $keys, $colors ), 'is_string' ),
			[
				'hour_text_color'   => $digits,
				'minute_text_color' => $digits,
				'second_text_color' => $digits,
			]
		);
	}

	/**
	 * A discount date as stored: the start at 00:00:00 of its day, the end
	 * at 23:59:59, so the sale runs through its End date.
	 *
	 * @since 3.0.0
	 *
	 * @param string $date Date from a product form (`Y-m-d`), or empty.
	 * @param bool   $end  Whether it is the end date.
	 *
	 * @return string The stored date, or empty for no date.
	 */
	public static function discount_date( $date, $end = false ) {
		if ( ! $date ) {
			return '';
		}

		return gmdate( $end ? 'Y-m-d 23:59:59' : 'Y-m-d 00:00:00', strtotime( $date ) );
	}

	/**
	 * Check if product is discountable.
	 *
	 * @since 1.0.2
	 *
	 * @param int $product_id Product post ID.
	 *
	 * @return bool
	 */
	public static function is_product_discountable( $product_id ) {
		$discount_amount = get_post_meta( $product_id, '_spsg_countdown_timer_discount_amount', true );
		$start_date      = get_post_meta( $product_id, '_spsg_countdown_timer_discount_start', true );
		$end_date        = get_post_meta( $product_id, '_spsg_countdown_timer_discount_end', true );

		// If data is not set.
		if ( ! $discount_amount || ! SiteTime::parse( $end_date, true ) ) {
			return false;
		}

		return SiteTime::is_within( $start_date, $end_date );
	}

	/**
	 * The campaign price running on a product, which replaces the product's
	 * own timer discount while it runs.
	 *
	 * @since 3.1.0
	 *
	 * @param int $product_id Product or variation id.
	 *
	 * @return array{percent: int, promotion_id: int}|null
	 */
	public static function campaign_price( int $product_id ): ?array {
		/**
		 * Filters the campaign price running on a product. StoreGrowth has no
		 * campaigns itself; StoreGrowth Pro supplies them.
		 *
		 * @since 3.1.0
		 *
		 * @param array|null $price      Null for none, or `percent` (1–100) and `promotion_id`.
		 * @param int        $product_id Product or variation id.
		 */
		$price = apply_filters( 'spsg_campaign_price', null, $product_id );

		return is_array( $price ) && ! empty( $price['percent'] ) ? $price : null;
	}

	/**
	 * Everything the running campaigns set on prices, for the cart hash: a
	 * change in it changes the shopper's prices.
	 *
	 * @since 3.1.0
	 *
	 * @return array
	 */
	public static function campaign_prices(): array {
		/**
		 * Filters what the running campaigns set on product prices.
		 *
		 * @since 3.1.0
		 *
		 * @param array $prices Campaign prices by campaign id; empty without campaigns.
		 */
		return (array) apply_filters( 'spsg_campaign_prices', [] );
	}

	/**
	 * When the campaign controlling a product's timer ends, if one does.
	 *
	 * @since 3.1.0
	 *
	 * @param int $product_id Product id.
	 *
	 * @return string|null Site-time date, or null for the product's own timer.
	 */
	public static function campaign_countdown_end( int $product_id ): ?string {
		/**
		 * Filters the end of the campaign a product's countdown shows.
		 *
		 * @since 3.1.0
		 *
		 * @param string|null $end        Null for the product's own timer.
		 * @param int         $product_id Product id.
		 */
		$end = apply_filters( 'spsg_countdown_campaign_end', null, $product_id );

		return is_string( $end ) && '' !== $end ? $end : null;
	}

	/**
	 * A stored end date as the storefront timer reads it: milliseconds since
	 * the epoch, so it ends at the same moment as the price for every shopper.
	 *
	 * @since 3.1.0
	 *
	 * @param mixed $end_date Stored end date.
	 *
	 * @return int Milliseconds, or 0 without a readable date.
	 */
	public static function timer_end( $end_date ): int {
		$end = SiteTime::parse( $end_date, true );

		return $end ? $end->getTimestamp() * 1000 : 0;
	}

	/**
	 * The product's timer discount as the price filter reads it, whether or
	 * not the timer is live.
	 *
	 * Same `intval()` as `CommonHooks::get_product_price()`, which doesn't
	 * range-check; a value outside 1–100 gives no timer discount here.
	 *
	 * @since 3.0.0
	 *
	 * @param int $product_id Product or variation id.
	 *
	 * @return int Percentage from 1 to 100, or 0 for none.
	 */
	public static function discount_percentage( int $product_id ): int {
		$pct = intval( get_post_meta( $product_id, '_spsg_countdown_timer_discount_amount', true ) );

		return ( $pct > 0 && $pct <= 100 ) ? $pct : 0;
	}

	/**
	 * Whether a Countdown Timer vendor setting (Dokan) is on: stored as a
	 * bool by the settings engine, as `on` / `off` by older versions; on
	 * when never saved.
	 *
	 * @since 3.0.0
	 *
	 * @param string $key `vendor_can_create_countdown_discount` or `vendor_can_create_schedule_timer`.
	 *
	 * @return bool
	 */
	public static function vendor_can( string $key ): bool {
		$settings = PluginHelper::get_settings( 'spsg_countdown_timer_settings', [] );
		$value    = $settings[ $key ] ?? true;

		return ! in_array( $value, [ false, 'off', '', 0, '0' ], true );
	}
}
