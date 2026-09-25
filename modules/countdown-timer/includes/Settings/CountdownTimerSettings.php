<?php
/**
 * Countdown Timer settings schema.
 *
 * @package StorePulse\StoreGrowth\Modules\CountdownTimer
 */

namespace StorePulse\StoreGrowth\Modules\CountdownTimer\Settings;

use StorePulse\StoreGrowth\Interfaces\SettingsSchema;

defined( 'ABSPATH' ) || exit;

/**
 * Fields of `spsg_countdown_timer_settings`
 * (docs/redesign/modules/countdown-timer.md §4).
 *
 * - Existing keys keep today's defaults, so saved sites keep their colours.
 * - Keys new in the redesign default to the design.
 * - Fonts are stored as the existing slugs (`roboto`, `merienda`, …); every
 *   slug stays valid, so older choices still save.
 * - `selected_theme` keeps the two old layouts valid next to the six new
 *   presets.
 * - Counter styling is pro, heading and container are lite.
 * - The Dokan keys (`vendor_can_create_*`) stay out: they store `'on'/'off'`
 *   and belong to the integrations step.
 *
 * @since SPSG_VERSION
 */
class CountdownTimerSettings implements SettingsSchema {

	/**
	 * Font slugs (stored value) the countdown accepts.
	 *
	 * @since SPSG_VERSION
	 *
	 * @var string[]
	 */
	const FONTS = [ 'roboto', 'inter', 'open_sans', 'lato', 'poppins', 'montserrat', 'ibm_plex_sans', 'merienda' ];

	/**
	 * Font weights.
	 *
	 * @since SPSG_VERSION
	 *
	 * @var string[]
	 */
	const WEIGHTS = [ '400', '500', '600', '700' ];

	/**
	 * Module id.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return string
	 */
	public function get_module_id(): string {
		return 'countdown-timer';
	}

	/**
	 * Option holding the settings.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return string
	 */
	public function get_option_name(): string {
		return 'spsg_countdown_timer_settings';
	}

	/**
	 * Field definitions keyed by option key.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return array<string, array<string, mixed>>
	 */
	public function get_fields(): array {
		$box = static function ( int $size ): array {
			return [
				'top'    => $size,
				'right'  => $size,
				'bottom' => $size,
				'left'   => $size,
			];
		};

		$align = [ 'left', 'center', 'right' ];

		return [
			// Configure.
			'countdown_heading'             => [
				'type'    => 'text',
				'default' => __( 'Last chance! [discount]% OFF', 'storegrowth-sales-booster' ),
			],
			'shop_page_countdown_enable'    => [
				'type'    => 'toggle',
				'default' => false,
				'pro'     => true,
			],
			'product_page_countdown_enable' => [
				'type'    => 'toggle',
				'default' => true,
			],

			// Design → Heading.
			'font_family'                   => [
				'type'    => 'select',
				'default' => 'roboto',
				'options' => self::FONTS,
			],
			'heading_font_weight'           => [
				'type'    => 'select',
				'default' => '500',
				'options' => self::WEIGHTS,
			],
			'heading_letter_spacing'        => [
				'type'    => 'number',
				'default' => 0,
				'min'     => -5,
				'max'     => 20,
			],
			'heading_line_height'           => [
				'type'    => 'number',
				'default' => 24,
				'min'     => 10,
				'max'     => 80,
			],
			'heading_text_color'            => [
				'type'    => 'color',
				'default' => '#008DFF',
			],

			// Design → Container and Layout.
			'widget_background_color'       => [
				'type'    => 'color',
				'default' => '#FFFFFF',
			],
			'border_color'                  => [
				'type'    => 'color',
				'default' => '#1677FF',
			],
			'widget_radius'                 => [
				'type'    => 'number',
				'default' => 10,
				'min'     => 0,
				'max'     => 60,
			],
			'widget_alignment'              => [
				'type'    => 'select',
				'default' => 'left',
				'options' => $align,
			],
			'widget_margin'                 => [
				'type'    => 'box',
				'default' => $box( 0 ),
			],
			'widget_padding'                => [
				'type'    => 'box',
				'default' => $box( 10 ),
			],

			// Design → Counter/Timer (Box). The one "Digit Text Color" field
			// writes the four per-unit keys, which pro's styles filter reads.
			'day_text_color'                => [
				'type'    => 'color',
				'default' => '#1B1B50',
				'pro'     => true,
			],
			'hour_text_color'               => [
				'type'    => 'color',
				'default' => '#1B1B50',
				'pro'     => true,
			],
			'minute_text_color'             => [
				'type'    => 'color',
				'default' => '#1B1B50',
				'pro'     => true,
			],
			'second_text_color'             => [
				'type'    => 'color',
				'default' => '#1B1B50',
				'pro'     => true,
			],
			'counter_label_color'           => [
				'type'    => 'color',
				'default' => '#64748B',
				'pro'     => true,
			],
			'counter_separator_color'       => [
				'type'    => 'color',
				'default' => '#1E293B',
				'pro'     => true,
			],
			'counter_background_color'      => [
				'type'    => 'color',
				'default' => '#FFFFFF',
				'pro'     => true,
			],
			'counter_border_color'          => [
				'type'    => 'color',
				'default' => '#ECEDF0',
				'pro'     => true,
			],
			'counter_radius'                => [
				'type'    => 'number',
				'default' => 6,
				'min'     => 0,
				'max'     => 40,
				'pro'     => true,
			],
			'counter_alignment'             => [
				'type'    => 'select',
				'default' => 'center',
				'options' => $align,
				'pro'     => true,
			],
			'counter_margin'                => [
				'type'    => 'box',
				'default' => $box( 0 ),
				'pro'     => true,
			],
			'counter_padding'               => [
				'type'    => 'box',
				'default' => $box( 6 ),
				'pro'     => true,
			],

			// Design → Counter Text.
			'counter_font_family'           => [
				'type'    => 'select',
				'default' => 'roboto',
				'options' => self::FONTS,
				'pro'     => true,
			],
			'counter_font_weight'           => [
				'type'    => 'select',
				'default' => '500',
				'options' => self::WEIGHTS,
				'pro'     => true,
			],
			'counter_letter_spacing'        => [
				'type'    => 'number',
				'default' => 0,
				'min'     => -5,
				'max'     => 20,
				'pro'     => true,
			],

			// Design → Select Template (writes the colours above).
			'selected_theme'                => [
				'type'    => 'select',
				'default' => 'ct-layout-1',
				'options' => [ 'ct-blue', 'ct-dark', 'ct-red', 'ct-gray', 'ct-cyan', 'ct-orange', 'ct-layout-1', 'ct-layout-2' ],
			],
		];
	}
}
