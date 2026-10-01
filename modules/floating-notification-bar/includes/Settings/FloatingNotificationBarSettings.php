<?php
/**
 * Floating Bar settings schema.
 *
 * @package StorePulse\StoreGrowth\Modules\FloatingNotificationBar
 */

namespace StorePulse\StoreGrowth\Modules\FloatingNotificationBar\Settings;

use StorePulse\StoreGrowth\Interfaces\GatedSettingsSchema;
use StorePulse\StoreGrowth\Interfaces\SettingsPage;
use StorePulse\StoreGrowth\Modules\FloatingNotificationBar\FloatingNotificationBarModule;
use StorePulse\StoreGrowth\Settings\DisplaySettings;
use StorePulse\StoreGrowth\Settings\SettingsService;

defined( 'ABSPATH' ) || exit;

/**
 * Fields of `spsg_floating_notification_bar_settings`
 * (docs/redesign/modules/floating-notification-bar.md §4).
 *
 * - Defaults are the old admin's, so stores keep their bar.
 * - Keys, values and typos stay as stored (`show_cupon`, `cupon_code`,
 *   `slected_page_option`, `ba-url-redirect` / `ba-close`,
 *   `notify-bar-icon-1..3`).
 * - `button_enable` is new: the design's button "Show" switch (on by default,
 *   so today's bars are unchanged).
 * - A store that never saved (empty option) shows no bar, as today
 *   (`storefront_settings()`); its first save writes every key sent.
 *
 * @since SPSG_VERSION
 */
class FloatingNotificationBarSettings implements GatedSettingsSchema, SettingsPage {

	/**
	 * Module id.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return string
	 */
	public function get_module_id(): string {
		return FloatingNotificationBarModule::get_id();
	}

	/**
	 * Option holding the settings.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return string
	 */
	public function get_option_name(): string {
		return 'spsg_floating_notification_bar_settings';
	}

	/**
	 * Field definitions keyed by option key.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return array<string, array<string, mixed>>
	 */
	public function get_fields(): array {
		$toggle = static function ( bool $value, bool $pro = false ): array {
			return [
				'type'    => 'toggle',
				'default' => $value,
				'pro'     => $pro,
			];
		};
		$pro    = static function ( array $field ): array {
			return array_merge( $field, [ 'pro' => true ] );
		};

		$bar       = DisplaySettings::bar_fields( 1 );
		$targeting = DisplaySettings::targeting_fields();
		$redirect  = [ 'button_action' => 'ba-url-redirect' ];

		// In page order: the settings page draws the fields from here.
		$content = [
			// Printed with wp_kses_post; the old admin stored markup.
			'default_banner_text'        => [
				'type'    => 'text',
				'default' => __( 'Shop More Than $100 to get Free Shipping', 'storegrowth-sales-booster' ),
				'html'    => true,
				'variant' => 'textarea',
				'rows'    => 2,
				'label'   => __( 'Default Banner Text', 'storegrowth-sales-booster' ),
			],
			// Drawn by the page (icon picker, with the custom icon below).
			'default_banner_icon_name'   => $pro(
				[
					'type'    => 'select',
					'default' => 'notify-bar-icon-1',
					'options' => [ '', 'notify-bar-icon-1', 'notify-bar-icon-2', 'notify-bar-icon-3' ],
					'label'   => __( 'Banner Icon', 'storegrowth-sales-booster' ),
				]
			),
			// Written by the icon picker.
			'default_banner_custom_icon' => $pro(
				[
					'type'    => 'url',
					'default' => '',
					'hidden'  => true,
				]
			),
		];

		$button = [
			// The section's header switch.
			'button_enable'  => $toggle( true ),
			'button_action'  => [
				'type'    => 'select',
				'default' => 'ba-close',
				'options' => [ 'ba-close', 'ba-url-redirect' ],
				'label'   => __( 'Button Action', 'storegrowth-sales-booster' ),
				'labels'  => [
					'ba-close'        => __( 'Banner Close', 'storegrowth-sales-booster' ),
					'ba-url-redirect' => __( 'Open Link', 'storegrowth-sales-booster' ),
				],
			],
			'button_view'    => [
				'type'    => 'list',
				'default' => [ 'button-desktop-enable' ],
				'options' => [ 'button-desktop-enable', 'button-mobile-enable' ],
				'variant' => 'device',
				'label'   => __( 'Show Button', 'storegrowth-sales-booster' ),
			],
			// Pro-only in the old admin; lite in the design (spec §4).
			'ac_button_text' => [
				'type'    => 'text',
				'default' => __( 'Shop Now', 'storegrowth-sales-booster' ),
				'html'    => true,
				'label'   => __( 'Button Text', 'storegrowth-sales-booster' ),
			],
			'redirect_url'   => [
				'type'        => 'url',
				'default'     => '',
				'label'       => __( 'Button Link', 'storegrowth-sales-booster' ),
				'placeholder' => 'https://',
				'show_when'   => $redirect,
			],
			'new_tab_enable' => array_merge(
				$toggle( false, true ),
				[
					'label'     => __( 'Open in a New Tab', 'storegrowth-sales-booster' ),
					'show_when' => $redirect,
				]
			),
		];

		$countdown = [
			// The section's header switch.
			'countdown_show_enable' => $toggle( false, true ),
			'countdown_start_date'  => $pro(
				[
					'type'    => 'date',
					'default' => '',
					'label'   => __( 'Start Date', 'storegrowth-sales-booster' ),
					'width'   => 'half',
				]
			),
			'countdown_end_date'    => $pro(
				[
					'type'    => 'date',
					'default' => '',
					'label'   => __( 'End Date', 'storegrowth-sales-booster' ),
					'width'   => 'half',
				]
			),
		];

		$advanced = [
			'show_cupon' => array_merge(
				$toggle( false, true ),
				[ 'label' => __( 'Show Coupon', 'storegrowth-sales-booster' ) ]
			),
			// Drawn by the page: a select of the store's coupons.
			'cupon_code' => $pro(
				[
					'type'      => 'text',
					'default'   => '',
					'label'     => __( 'Coupon Code', 'storegrowth-sales-booster' ),
					'show_when' => [ 'show_cupon' => true ],
				]
			),
		];

		$colors = [
			'background_color'  => $bar['background_color'],
			'text_color'        => $bar['text_color'],
			'icon_color'        => $bar['icon_color'],
			'button_color'      => [
				'type'    => 'color',
				'default' => '#ffffff',
				'label'   => __( 'Button Color', 'storegrowth-sales-booster' ),
			],
			'button_text_color' => [
				'type'    => 'color',
				'default' => '#000000',
				'label'   => __( 'Button Text Color', 'storegrowth-sales-booster' ),
			],
			'close_icon_color'  => $bar['close_icon_color'],
		];

		$template = [
			// Drawn by the page (template picker: a preset sets the colours).
			// Templates are presets (colours); the first is the old one.
			'notify_template' => [
				'type'    => 'select',
				'default' => 'notify_bar_one',
				'options' => [ 'notify_bar_one', 'notify_bar_dark', 'notify_bar_red', 'notify_bar_amber' ],
				'label'   => __( 'Template', 'storegrowth-sales-booster' ),
			],
		];

		return array_merge(
			DisplaySettings::place( $content, 'content' ),
			DisplaySettings::place(
				[
					'bar_position' => $bar['bar_position'],
					'bar_type'     => $bar['bar_type'],
				],
				'configure'
			),
			DisplaySettings::place( $button, 'configure', 'button' ),
			DisplaySettings::place( $countdown, 'configure', 'countdown' ),
			DisplaySettings::place(
				[
					'banner_trigger'      => $bar['banner_trigger'],
					'banner_delay'        => $bar['banner_delay'],
					'scroll_banner_delay' => $bar['scroll_banner_delay'],
				],
				'configure',
				'trigger'
			),
			DisplaySettings::place(
				array_merge( [ 'banner_device_view' => $bar['banner_device_view'] ], $targeting ),
				'configure',
				'targeting'
			),
			DisplaySettings::place( $advanced, 'configure', 'advanced' ),
			DisplaySettings::place(
				[
					'banner_height' => $bar['banner_height'],
					'font_family'   => $bar['font_family'],
					'font_size'     => $bar['font_size'],
				],
				'design',
				'bar'
			),
			DisplaySettings::place( $colors, 'design', 'colors' ),
			DisplaySettings::place( $template, 'design', 'template' )
		);
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
			'title' => __( 'Floating Bar', 'storegrowth-sales-booster' ),
			'tabs'  => [
				'content'   => [
					'label' => __( 'Content', 'storegrowth-sales-booster' ),
				],
				'configure' => [
					'label'    => __( 'Configure', 'storegrowth-sales-booster' ),
					'sections' => [
						'button'    => [
							'title'  => __( 'Button', 'storegrowth-sales-booster' ),
							'toggle' => 'button_enable',
						],
						'countdown' => [
							'title'  => __( 'Countdown', 'storegrowth-sales-booster' ),
							'toggle' => 'countdown_show_enable',
						],
						'trigger'   => [
							'title' => __( 'Trigger', 'storegrowth-sales-booster' ),
							'help'  => __( 'When the bar appears', 'storegrowth-sales-booster' ),
						],
						'targeting' => [
							'title' => __( 'Page Targeting', 'storegrowth-sales-booster' ),
							'help'  => __( 'Where the bar shows, and to whom', 'storegrowth-sales-booster' ),
						],
						'advanced'  => [
							'title'     => __( 'Advanced', 'storegrowth-sales-booster' ),
							'help'      => __( 'A coupon code shoppers can copy', 'storegrowth-sales-booster' ),
							'collapsed' => true,
						],
					],
				],
				'design'    => [
					'label'    => __( 'Design', 'storegrowth-sales-booster' ),
					'sections' => [
						'bar'      => [
							'title' => __( 'Bar', 'storegrowth-sales-booster' ),
							'help'  => __( 'Size and typography of the floating bar', 'storegrowth-sales-booster' ),
						],
						'colors'   => [
							'title' => __( 'Colors', 'storegrowth-sales-booster' ),
							'help'  => __( 'Every colour on the floating bar', 'storegrowth-sales-booster' ),
						],
						'template' => [
							'title' => __( 'Template', 'storegrowth-sales-booster' ),
							'help'  => __( 'Presets that fill the colour fields above', 'storegrowth-sales-booster' ),
						],
					],
				],
			],
		];
	}

	/**
	 * Saved from the admin: the option isn't empty.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param mixed $stored Stored option.
	 *
	 * @return bool
	 */
	public function is_saved( $stored ): bool {
		return is_array( $stored ) && (bool) $stored;
	}

	/**
	 * The stored settings with the defaults of every key not saved, for the
	 * storefront (saves write only changed keys). An option the admin never
	 * saved (empty) is returned as it is, so the bar stays off, as before.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param mixed $stored Stored option.
	 *
	 * @return array
	 */
	public function storefront_settings( $stored ): array {
		return storegrowth_get_container()->get( SettingsService::class )->with_defaults( $this->get_module_id(), $stored );
	}
}
