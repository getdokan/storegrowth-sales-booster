<?php
/**
 * Countdown Timer settings schema.
 *
 * @package StorePulse\StoreGrowth\Modules\CountdownTimer
 */

namespace StorePulse\StoreGrowth\Modules\CountdownTimer\Settings;

use StorePulse\StoreGrowth\Interfaces\SettingsPage;
use StorePulse\StoreGrowth\Interfaces\SettingsSchema;
use StorePulse\StoreGrowth\Modules\CountdownTimer\CountdownTimerModule;
use StorePulse\StoreGrowth\Modules\CountdownTimer\Helper;

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
class CountdownTimerSettings implements SettingsSchema, SettingsPage {

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
		return CountdownTimerModule::get_id();
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

		$weights = [
			'400' => __( 'Regular', 'storegrowth-sales-booster' ),
			'500' => __( 'Medium', 'storegrowth-sales-booster' ),
			'600' => __( 'Semi Bold', 'storegrowth-sales-booster' ),
			'700' => __( 'Bold', 'storegrowth-sales-booster' ),
		];

		// In page order: the settings page draws the fields from here.
		return [
			// Configure.
			'countdown_heading'             => [
				'type'    => 'text',
				'default' => __( 'Last chance! [discount]% OFF', 'storegrowth-sales-booster' ),
				'tab'     => 'configure',
				'label'   => __( 'Countdown Heading', 'storegrowth-sales-booster' ),
				'help'    => __( "Use [discount] for the product's discount.", 'storegrowth-sales-booster' ),
			],
			'shop_page_countdown_enable'    => [
				'type'    => 'toggle',
				'default' => false,
				'pro'     => true,
				'tab'     => 'configure',
				'variant' => 'switch_card',
				'label'   => __( 'Shop Page Display', 'storegrowth-sales-booster' ),
				'help'    => __( 'The sales countdown will show on the shop page', 'storegrowth-sales-booster' ),
			],
			'product_page_countdown_enable' => [
				'type'    => 'toggle',
				'default' => true,
				'tab'     => 'configure',
				'variant' => 'switch_card',
				'label'   => __( 'Product Page Display', 'storegrowth-sales-booster' ),
				'help'    => __( 'The sales countdown will show on the product page', 'storegrowth-sales-booster' ),
			],

			// Design → Heading.
			'font_family'                   => [
				'type'    => 'select',
				'default' => 'roboto',
				'options' => self::FONTS,
				'tab'     => 'design',
				'section' => 'heading',
				'label'   => __( 'Font Family', 'storegrowth-sales-booster' ),
				'labels'  => Helper::FONT_FAMILIES,
			],
			'heading_font_weight'           => [
				'type'    => 'select',
				'default' => '500',
				'options' => self::WEIGHTS,
				'tab'     => 'design',
				'section' => 'heading',
				'label'   => __( 'Font Weight', 'storegrowth-sales-booster' ),
				'labels'  => $weights,
			],
			'heading_letter_spacing'        => [
				'type'    => 'number',
				'default' => 0,
				'min'     => -5,
				'max'     => 20,
				'tab'     => 'design',
				'section' => 'heading',
				'label'   => __( 'Letter Spacing', 'storegrowth-sales-booster' ),
				'suffix'  => 'px',
				'width'   => 'half',
			],
			'heading_line_height'           => [
				'type'    => 'number',
				'default' => 24,
				'min'     => 10,
				'max'     => 80,
				'tab'     => 'design',
				'section' => 'heading',
				'label'   => __( 'Line Height', 'storegrowth-sales-booster' ),
				'suffix'  => 'px',
				'width'   => 'half',
			],
			'heading_text_color'            => [
				'type'    => 'color',
				'default' => '#008DFF',
				'tab'     => 'design',
				'section' => 'heading',
				'label'   => __( 'Heading Color', 'storegrowth-sales-booster' ),
			],

			// Design → Container and Layout.
			'widget_background_color'       => [
				'type'    => 'color',
				'default' => '#FFFFFF',
				'tab'     => 'design',
				'section' => 'container',
				'label'   => __( 'Widget Background Color', 'storegrowth-sales-booster' ),
			],
			'border_color'                  => [
				'type'    => 'color',
				'default' => '#1677FF',
				'tab'     => 'design',
				'section' => 'container',
				'label'   => __( 'Border Color', 'storegrowth-sales-booster' ),
			],
			'widget_radius'                 => [
				'type'    => 'number',
				'default' => 10,
				'min'     => 0,
				'max'     => 60,
				'tab'     => 'design',
				'section' => 'container',
				'label'   => __( 'Widget Radius', 'storegrowth-sales-booster' ),
				'suffix'  => 'px',
			],
			'widget_alignment'              => [
				'type'    => 'select',
				'default' => 'left',
				'options' => $align,
				'tab'     => 'design',
				'section' => 'container',
				'variant' => 'alignment',
				'label'   => __( 'Alignment', 'storegrowth-sales-booster' ),
				'name'    => __( 'Container alignment', 'storegrowth-sales-booster' ),
			],
			// Today's 25px gap before the add-to-cart form.
			'widget_margin'                 => [
				'type'    => 'box',
				'default' => array_merge( $box( 0 ), [ 'bottom' => 25 ] ),
				'max'     => 200,
				'tab'     => 'design',
				'section' => 'container',
				'label'   => __( 'Margin', 'storegrowth-sales-booster' ),
			],
			'widget_padding'                => [
				'type'    => 'box',
				'default' => $box( 10 ),
				'max'     => 200,
				'tab'     => 'design',
				'section' => 'container',
				'label'   => __( 'Padding', 'storegrowth-sales-booster' ),
			],

			// Design → Counter/Timer (Box). The one "Digit Text Color" field
			// (drawn by the page on `day_text_color`) writes the four per-unit
			// keys, which pro's styles filter reads.
			'day_text_color'                => [
				'type'    => 'color',
				'default' => '#1B1B50',
				'pro'     => true,
				'tab'     => 'design',
				'section' => 'counter',
				'label'   => __( 'Digit Text Color', 'storegrowth-sales-booster' ),
			],
			'hour_text_color'               => [
				'type'    => 'color',
				'default' => '#1B1B50',
				'pro'     => true,
				'tab'     => 'design',
				'section' => 'counter',
				'hidden'  => true,
			],
			'minute_text_color'             => [
				'type'    => 'color',
				'default' => '#1B1B50',
				'pro'     => true,
				'tab'     => 'design',
				'section' => 'counter',
				'hidden'  => true,
			],
			'second_text_color'             => [
				'type'    => 'color',
				'default' => '#1B1B50',
				'pro'     => true,
				'tab'     => 'design',
				'section' => 'counter',
				'hidden'  => true,
			],
			'counter_label_color'           => [
				'type'    => 'color',
				'default' => '#64748B',
				'pro'     => true,
				'tab'     => 'design',
				'section' => 'counter',
				'label'   => __( 'Label Text Color', 'storegrowth-sales-booster' ),
				'help'    => __( 'The DAYS / HOURS / MIN / SEC captions.', 'storegrowth-sales-booster' ),
			],
			'counter_separator_color'       => [
				'type'    => 'color',
				'default' => '#1E293B',
				'pro'     => true,
				'tab'     => 'design',
				'section' => 'counter',
				'label'   => __( 'Separator Color', 'storegrowth-sales-booster' ),
			],
			'counter_background_color'      => [
				'type'    => 'color',
				'default' => '#FFFFFF',
				'pro'     => true,
				'tab'     => 'design',
				'section' => 'counter',
				'label'   => __( 'Background Color', 'storegrowth-sales-booster' ),
			],
			'counter_border_color'          => [
				'type'    => 'color',
				'default' => '#ECEDF0',
				'pro'     => true,
				'tab'     => 'design',
				'section' => 'counter',
				'label'   => __( 'Border Color', 'storegrowth-sales-booster' ),
			],
			'counter_radius'                => [
				'type'    => 'number',
				'default' => 6,
				'min'     => 0,
				'max'     => 40,
				'pro'     => true,
				'tab'     => 'design',
				'section' => 'counter',
				'label'   => __( 'Box Radius', 'storegrowth-sales-booster' ),
				'suffix'  => 'px',
			],
			'counter_alignment'             => [
				'type'    => 'select',
				'default' => 'left',
				'options' => $align,
				'pro'     => true,
				'tab'     => 'design',
				'section' => 'counter',
				'variant' => 'alignment',
				'label'   => __( 'Alignment', 'storegrowth-sales-booster' ),
				'name'    => __( 'Counter alignment', 'storegrowth-sales-booster' ),
			],
			'counter_margin'                => [
				'type'    => 'box',
				'default' => $box( 0 ),
				'max'     => 200,
				'pro'     => true,
				'tab'     => 'design',
				'section' => 'counter',
				'label'   => __( 'Margin', 'storegrowth-sales-booster' ),
				'name'    => __( 'Counter margin', 'storegrowth-sales-booster' ),
			],
			'counter_padding'               => [
				'type'    => 'box',
				'default' => $box( 6 ),
				'max'     => 200,
				'pro'     => true,
				'tab'     => 'design',
				'section' => 'counter',
				'label'   => __( 'Padding', 'storegrowth-sales-booster' ),
				'name'    => __( 'Counter padding', 'storegrowth-sales-booster' ),
			],

			// Design → Counter Text.
			'counter_font_family'           => [
				'type'    => 'select',
				'default' => 'roboto',
				'options' => self::FONTS,
				'pro'     => true,
				'tab'     => 'design',
				'section' => 'counter_text',
				'label'   => __( 'Font Family', 'storegrowth-sales-booster' ),
				'labels'  => Helper::FONT_FAMILIES,
			],
			'counter_font_weight'           => [
				'type'    => 'select',
				'default' => '500',
				'options' => self::WEIGHTS,
				'pro'     => true,
				'tab'     => 'design',
				'section' => 'counter_text',
				'label'   => __( 'Font Weight', 'storegrowth-sales-booster' ),
				'labels'  => $weights,
			],
			'counter_letter_spacing'        => [
				'type'    => 'number',
				'default' => 0,
				'min'     => -5,
				'max'     => 20,
				'pro'     => true,
				'tab'     => 'design',
				'section' => 'counter_text',
				'label'   => __( 'Letter Spacing', 'storegrowth-sales-booster' ),
				'suffix'  => 'px',
			],

			// Design → Select Template (writes the colours above). Drawn by
			// the page (template picker: a preset sets several keys).
			'selected_theme'                => [
				'type'    => 'select',
				'default' => 'ct-layout-1',
				'options' => [ 'ct-blue', 'ct-dark', 'ct-red', 'ct-gray', 'ct-cyan', 'ct-orange', 'ct-layout-1', 'ct-layout-2' ],
				'tab'     => 'design',
				'section' => 'template',
				'label'   => __( 'Template', 'storegrowth-sales-booster' ),
			],
		];
	}

	/**
	 * The settings page: title, tabs and sections.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return array<string, mixed>
	 */
	public function get_page(): array {
		return [
			'title' => __( 'Countdown Timer', 'storegrowth-sales-booster' ),
			'tabs'  => [
				'configure' => [
					'label' => __( 'Configure', 'storegrowth-sales-booster' ),
				],
				'design'    => [
					'label'    => __( 'Design', 'storegrowth-sales-booster' ),
					'sections' => [
						'heading'      => [
							'title' => __( 'Heading', 'storegrowth-sales-booster' ),
							'help'  => __( 'The line above the timer', 'storegrowth-sales-booster' ),
						],
						'container'    => [
							'title'     => __( 'Container and Layout', 'storegrowth-sales-booster' ),
							'help'      => __( 'The box around the countdown', 'storegrowth-sales-booster' ),
							'collapsed' => true,
						],
						'counter'      => [
							'title'     => __( 'Counter/Timer (Box)', 'storegrowth-sales-booster' ),
							'help'      => __( 'The day, hour, minute and second boxes', 'storegrowth-sales-booster' ),
							'collapsed' => true,
						],
						'counter_text' => [
							'title'     => __( 'Counter Text', 'storegrowth-sales-booster' ),
							'help'      => __( 'Font of the numbers and their labels', 'storegrowth-sales-booster' ),
							'collapsed' => true,
						],
						'template'     => [
							'title'     => __( 'Select Template', 'storegrowth-sales-booster' ),
							'help'      => __( 'Presets that fill the colour fields above', 'storegrowth-sales-booster' ),
							'collapsed' => true,
						],
					],
				],
			],
		];
	}
}
