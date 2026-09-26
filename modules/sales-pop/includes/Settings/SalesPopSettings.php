<?php
/**
 * Sales Notification settings schema.
 *
 * @package StorePulse\StoreGrowth\Modules\SalesPop
 */

namespace StorePulse\StoreGrowth\Modules\SalesPop\Settings;

use StorePulse\StoreGrowth\Interfaces\SettingsSchema;
use StorePulse\StoreGrowth\Modules\SalesPop\SalesPopModule;

defined( 'ABSPATH' ) || exit;

/**
 * Fields of `spsg_popup_products` (docs/redesign/modules/sales-pop.md §4).
 *
 * - Defaults are the old admin's (`helper.js`), so stores keep their look;
 *   the storefront fills unsaved keys from them (`storefront_settings()`).
 * - Typos in keys stay (`enble_visibility`, `dispaly_time`,
 *   `slected_page_option`); dead keys stay stored but out of the schema.
 * - `virtual_name` / `virtual_locations` were stored as a comma / newline
 *   string (or an array); both read as lists and save as arrays, which the
 *   storefront already accepts.
 * - `name_text_*` has no field in the design, but the storefront reads it.
 * - Bounds are no stricter than the old admin (templates wrote radius 100).
 *
 * @since SPSG_VERSION
 */
class SalesPopSettings implements SettingsSchema {

	/**
	 * Page conditions pro 2.2.0 evaluates for "Show on Specific Pages".
	 *
	 * @since SPSG_VERSION
	 *
	 * @var string[]
	 */
	const PAGE_CONDITIONS = [ 'is_front_page', 'is_home', 'is_singular', 'is_page', 'is_attachment', 'is_search', 'is_404', 'is_archive', 'is_category', 'is_tag' ];

	/**
	 * Text rows of the Text Style card: key prefix of `<prefix>_font_size` /
	 * `<prefix>_font_weight` → [ colour key, pro, colour, size, weight ].
	 * `name_text` has no row in the design; the storefront still reads it.
	 *
	 * @since SPSG_VERSION
	 *
	 * @var array<string, array{0: string, 1: bool, 2: string, 3: string, 4: string}>
	 */
	const TEXT_ROWS = [
		'normal_text'   => [ 'normal_text_color', true, '#1B1B50', '10', '400' ],
		'product_title' => [ 'product_title_color', false, '#1B1B50', '16', '500' ],
		'time_text'     => [ 'time_text_color', false, '#989FAB', '10', '500' ],
		'country_text'  => [ 'country_text_color', false, '#1B1B50', '10', '400' ],
		'state_text'    => [ 'state_text_color', true, '#1B1B50', '10', '400' ],
		'city_text'     => [ 'city_text_color', true, '#1B1B50', '10', '400' ],
		'name_text'     => [ 'name_text_color', false, '#000000', '10', '500' ],
	];

	/**
	 * Corner radii each template draws with: `template` → [ popup, image ].
	 * A template sets them in lite too, where the radius fields need pro;
	 * with pro, saved radii win. The admin gets them from `AdminPage`.
	 *
	 * @since SPSG_VERSION
	 *
	 * @var array<int, int[]>
	 */
	const TEMPLATE_RADII = [
		1 => [ 999, 999 ],
		2 => [ 8, 999 ],
		3 => [ 2, 2 ],
		4 => [ 8, 8 ],
	];

	/**
	 * Module id.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return string
	 */
	public function get_module_id(): string {
		return SalesPopModule::get_id();
	}

	/**
	 * Option holding the settings.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return string
	 */
	public function get_option_name(): string {
		return 'spsg_popup_products';
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
		$number = static function ( int $value, int $min, int $max ): array {
			return [
				'type'    => 'number',
				'default' => $value,
				'min'     => $min,
				'max'     => $max,
				'pro'     => true,
			];
		};

		$fields = [
			// Notification Setting → General.
			'enable'                       => $toggle( false ),
			'enble_visibility'             => $toggle( false ),
			'mobile_view'                  => $toggle( false, true ),
			'show_close_button'            => $toggle( true ),

			// → Products.
			'product_random'               => $toggle( false ),
			'external_link'                => $toggle( false, true ),
			'open_product_link_in_new_tab' => $toggle( false, true ),
			'link_image_to_product'        => $toggle( false, true ),
			// 0 recent orders, 1 selected products, 2 best sellers. The storefront
			// shows `popup_products`; the admin fills them for sources 0 and 2.
			'product_source'               => [
				'type'    => 'select',
				'default' => '1',
				'options' => [ '0', '1', '2' ],
			],
			'number_of_orders'             => [
				'type'    => 'number',
				'default' => 0,
				'min'     => 0,
				'max'     => 100,
			],
			'popup_products'               => [
				'type'           => 'list',
				'item'           => 'int',
				'default'        => [],
				'lite_max_items' => 5,
			],
			'virtual_name'                 => [
				'type'           => 'list',
				'separator'      => ',',
				'default'        => [],
				'lite_max_items' => 5,
			],
			'virtual_locations'            => [
				'type'      => 'list',
				'separator' => "\n",
				'default'   => [ 'New York City, New York, USA', 'Bernau, Freistaat Bayern, Germany' ],
			],
			'banner_show_option'           => [
				'type'    => 'select',
				'default' => 'banner-show-everywhere',
				'options' => [ 'banner-show-everywhere', 'banner-show-selected' ],
				'pro'     => true,
			],
			'slected_page_option'          => [
				'type'    => 'list',
				'default' => [],
				'options' => self::PAGE_CONDITIONS,
				'pro'     => true,
			],
			'user_type'                    => [
				'type'    => 'select',
				'default' => 'both',
				'options' => [ 'both', 'logged_in', 'not_logged_in' ],
				'pro'     => true,
			],

			// → Message.
			'message_popup'                => [
				'type'    => 'textarea',
				'default' => "{virtual_name}\n{product_title}\nFrom {location}\n{time}",
				'pro'     => true,
			],

			// → Timing (seconds).
			'loop'                         => $toggle( false, true ),
			'notification_per_page'        => $number( 5, 0, 1000 ),
			'next_time_display'            => $number( 5, 0, 3600 ),
			'initial_time_delay'           => $number( 5, 0, 3600 ),
			'dispaly_time'                 => $number( 5, 1, 3600 ),

			// Design → Template (the storefront draws each one).
			'template'                     => [
				'type'    => 'select',
				'default' => '4',
				'options' => [ '1', '2', '3', '4' ],
			],

			// → Image Style.
			'image_style'                  => $toggle( true, true ),
			'spacing_around_image'         => $number( 10, 0, 100 ),
			'popup_image_border_radius'    => $number( 6, 0, 999 ),
			'image_position'               => [
				'type'    => 'select',
				'default' => 'left',
				'options' => [ 'left', 'right' ],
				'pro'     => true,
			],
			'popup_image_width'            => $number( 72, 0, 1000 ),

			// → Popup Style.
			'popup_style'                  => $toggle( true ),
			'background_color'             => [
				'type'    => 'color',
				'default' => '#ffffff',
				'pro'     => true,
			],
			'popup_position'               => [
				'type'    => 'select',
				'default' => 'left_bottom',
				'options' => [ 'left_bottom', 'right_bottom', 'left_top', 'right_top' ],
				'pro'     => true,
			],
			'popup_border_radius'          => $number( 8, 0, 999 ),
			'popup_width'                  => $number( 400, 0, 2000 ),

			// → Text Style.
			'text_style'                   => $toggle( true ),
		];

		foreach ( self::TEXT_ROWS as $prefix => [ $color_key, $pro, $color, $size, $weight ] ) {
			$fields[ $color_key ]              = [
				'type'    => 'color',
				'default' => $color,
				'pro'     => $pro,
			];
			$fields[ "{$prefix}_font_size" ]   = [
				'type'    => 'number',
				'default' => (int) $size,
				'min'     => 0,
				'max'     => 200,
				'pro'     => $pro,
			];
			$fields[ "{$prefix}_font_weight" ] = [
				'type'    => 'select',
				'default' => $weight,
				'options' => [ '400', '500', '700' ],
				'pro'     => $pro,
			];
		}

		return $fields;
	}

	/**
	 * The stored settings with the defaults of every key not saved, in the
	 * stored shape the storefront reads. Saves write only changed keys, so
	 * the storefront must not rely on every key being there.
	 *
	 * The template's radii apply without pro, and with pro to radii never
	 * saved.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param mixed $stored Stored option.
	 *
	 * @return array
	 */
	public function storefront_settings( $stored ): array {
		$stored   = is_array( $stored ) ? $stored : [];
		$defaults = array_map(
			static function ( $field ) {
				return $field['default'];
			},
			$this->get_fields()
		);

		$template = absint( $stored['template'] ?? $defaults['template'] );
		$radii    = self::TEMPLATE_RADII[ $template ] ?? self::TEMPLATE_RADII[4];
		$radii    = [
			'popup_border_radius'       => $radii[0],
			'popup_image_border_radius' => $radii[1],
		];

		return sp_store_growth()->has_pro() ? $stored + $radii + $defaults : array_merge( $stored + $defaults, $radii );
	}
}
