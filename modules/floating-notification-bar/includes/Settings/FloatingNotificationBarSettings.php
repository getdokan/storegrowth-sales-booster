<?php
/**
 * Floating Bar settings schema.
 *
 * @package StorePulse\StoreGrowth\Modules\FloatingNotificationBar
 */

namespace StorePulse\StoreGrowth\Modules\FloatingNotificationBar\Settings;

use StorePulse\StoreGrowth\Interfaces\GatedSettingsSchema;
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
class FloatingNotificationBarSettings implements GatedSettingsSchema {

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

		$fields = [
			// Content.
			// Printed with wp_kses_post; the old admin stored markup.
			'default_banner_text'        => [
				'type'    => 'text',
				'default' => __( 'Shop More Than $100 to get Free Shipping', 'storegrowth-sales-booster' ),
				'html'    => true,
			],
			'default_banner_icon_name'   => $pro(
				[
					'type'    => 'select',
					'default' => 'notify-bar-icon-1',
					'options' => [ '', 'notify-bar-icon-1', 'notify-bar-icon-2', 'notify-bar-icon-3' ],
				]
			),
			'default_banner_custom_icon' => $pro(
				[
					'type'    => 'url',
					'default' => '',
				]
			),

			// Configure → Button.
			'button_enable'              => $toggle( true ),
			'button_action'              => [
				'type'    => 'select',
				'default' => 'ba-close',
				'options' => [ 'ba-close', 'ba-url-redirect' ],
			],
			'button_view'                => [
				'type'    => 'list',
				'default' => [ 'button-desktop-enable' ],
				'options' => [ 'button-desktop-enable', 'button-mobile-enable' ],
			],
			// Pro-only in the old admin; lite in the design (spec §4).
			'ac_button_text'             => [
				'type'    => 'text',
				'default' => __( 'Shop Now', 'storegrowth-sales-booster' ),
				'html'    => true,
			],
			'redirect_url'               => [
				'type'    => 'url',
				'default' => '',
			],
			'new_tab_enable'             => $toggle( false, true ),

			// Configure → Coupon and Countdown.
			'show_cupon'                 => $toggle( false, true ),
			'cupon_code'                 => $pro(
				[
					'type'    => 'text',
					'default' => '',
				]
			),
			'countdown_show_enable'      => $toggle( false, true ),
			'countdown_start_date'       => $pro(
				[
					'type'    => 'date',
					'default' => '',
				]
			),
			'countdown_end_date'         => $pro(
				[
					'type'    => 'date',
					'default' => '',
				]
			),

			// Design.
			'button_color'               => [
				'type'    => 'color',
				'default' => '#ffffff',
			],
			'button_text_color'          => [
				'type'    => 'color',
				'default' => '#000000',
			],
			// Templates are presets (colours); the first is the old one.
			'notify_template'            => [
				'type'    => 'select',
				'default' => 'notify_bar_one',
				'options' => [ 'notify_bar_one', 'notify_bar_dark', 'notify_bar_red', 'notify_bar_amber' ],
			],
		];

		return array_merge( $fields, DisplaySettings::bar_fields( 1 ), DisplaySettings::targeting_fields() );
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
