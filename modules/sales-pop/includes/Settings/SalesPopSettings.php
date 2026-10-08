<?php
/**
 * Sales Notification settings schema.
 *
 * @package StorePulse\StoreGrowth\Modules\SalesPop
 */

namespace StorePulse\StoreGrowth\Modules\SalesPop\Settings;

use StorePulse\StoreGrowth\Interfaces\SettingsPage;
use StorePulse\StoreGrowth\Interfaces\SettingsSchema;
use StorePulse\StoreGrowth\Modules\SalesPop\SalesPopModule;
use StorePulse\StoreGrowth\Settings\DisplaySettings;
use StorePulse\StoreGrowth\Settings\SettingsService;

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
class SalesPopSettings implements SettingsSchema, SettingsPage {

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
	 * Without pro (the radius fields need pro) the storefront uses these;
	 * with pro, picking a template writes them into the fields. The admin
	 * gets them from `AdminPage`.
	 *
	 * @since SPSG_VERSION
	 *
	 * @var array<int, int[]>
	 */
	const TEMPLATE_RADII = [
		1 => [ 999, 999 ],
		2 => [ 8, 999 ],
		3 => [ 0, 0 ],
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
	 * Field definitions keyed by option key, in page order: the settings
	 * page draws the fields from here. The admin draws some itself (product
	 * source and products, the name / location lists, the message with its
	 * token legend, the template picker, the radii and the text rows).
	 *
	 * @since SPSG_VERSION
	 *
	 * @return array<string, array<string, mixed>>
	 */
	public function get_fields(): array {
		$toggle = static function ( string $label, bool $value, bool $pro = false ): array {
			return [
				'type'    => 'toggle',
				'default' => $value,
				'pro'     => $pro,
				'label'   => $label,
			];
		};
		// No upper bounds: the old admin had none (ADR-004).
		$number  = static function ( string $label, int $value, int $min, string $suffix = '' ): array {
			$field = [
				'type'    => 'number',
				'default' => $value,
				'min'     => $min,
				'pro'     => true,
				'label'   => $label,
			];

			if ( '' !== $suffix ) {
				$field['suffix'] = $suffix;
			}

			return $field;
		};
		$seconds = __( 'sec', 'storegrowth-sales-booster' );

		// Notification Setting → General.
		$general = [
			'enable'            => $toggle( __( 'Enable Popup', 'storegrowth-sales-booster' ), false ),
			'enble_visibility'  => $toggle( __( 'Stop Popup Visibility On Close', 'storegrowth-sales-booster' ), false ),
			'mobile_view'       => $toggle( __( 'Popup in Mobile', 'storegrowth-sales-booster' ), false, true ),
			'show_close_button' => $toggle( __( 'Show Close Button', 'storegrowth-sales-booster' ), true ),
		];

		// → Products, then who and where (the shared targeting, in this page's words).
		$targeting = DisplaySettings::targeting_fields();
		$products  = [
			'product_random'               => $toggle( __( 'Product Show Random', 'storegrowth-sales-booster' ), false ),
			'external_link'                => $toggle( __( 'External Link', 'storegrowth-sales-booster' ), false, true ),
			'open_product_link_in_new_tab' => $toggle( __( 'Open Product Link in New Tab', 'storegrowth-sales-booster' ), false, true ),
			'link_image_to_product'        => $toggle( __( 'Link Image to Product Page', 'storegrowth-sales-booster' ), false, true ),
			// 0 recent orders, 1 selected products, 2 best sellers. The storefront
			// shows `popup_products`; the admin fills them for sources 0 and 2.
			'product_source'               => [
				'type'    => 'select',
				'default' => '1',
				'options' => [ '0', '1', '2' ],
				'label'   => __( 'Product Source', 'storegrowth-sales-booster' ),
				'labels'  => [
					'1' => __( 'Select Products', 'storegrowth-sales-booster' ),
					'0' => __( 'Recent Orders', 'storegrowth-sales-booster' ),
					'2' => __( 'Best Sellers', 'storegrowth-sales-booster' ),
				],
			],
			'number_of_orders'             => [
				'type'      => 'number',
				'default'   => 0,
				'min'       => 0,
				'label'     => __( 'Number of Products', 'storegrowth-sales-booster' ),
				'show_when' => [ 'product_source' => [ '0', '2' ] ],
			],
			// No stored cap: the old lite admin capped only products picked by
			// hand (the admin still does); Recent Orders could fill more.
			'popup_products'               => [
				'type'    => 'list',
				'item'    => 'int',
				'default' => [],
				'label'   => __( 'Select Popup Products', 'storegrowth-sales-booster' ),
			],
			'virtual_name'                 => [
				'type'           => 'list',
				'separator'      => ',',
				'default'        => [],
				'lite_max_items' => 5,
				'label'          => __( 'Virtual First Name', 'storegrowth-sales-booster' ),
				'help'           => __( 'Separate names with commas.', 'storegrowth-sales-booster' ),
				'placeholder'    => __( 'Name1, Name2, Name3', 'storegrowth-sales-booster' ),
			],
			'virtual_locations'            => [
				'type'      => 'list',
				'separator' => "\n",
				'default'   => [ 'New York City, New York, USA', 'Bernau, Freistaat Bayern, Germany' ],
				'label'     => __( 'Virtual Location', 'storegrowth-sales-booster' ),
				'help'      => __( 'One per line: City, State, Country.', 'storegrowth-sales-booster' ),
			],
			'banner_show_option'           => array_merge(
				$targeting['banner_show_option'],
				[ 'label' => __( 'Visibility Control', 'storegrowth-sales-booster' ) ]
			),
			'slected_page_option'          => $targeting['slected_page_option'],
			'user_type'                    => array_merge(
				$targeting['user_type'],
				[
					'label'  => __( 'Show To', 'storegrowth-sales-booster' ),
					'labels' => [
						'both'          => __( 'Everyone', 'storegrowth-sales-booster' ),
						'logged_in'     => __( 'Logged-in Users', 'storegrowth-sales-booster' ),
						'not_logged_in' => __( 'Guests', 'storegrowth-sales-booster' ),
					],
				]
			),
		];

		// → Message.
		$message = [
			'message_popup' => [
				'type'    => 'textarea',
				'default' => "{virtual_name}\n{product_title}\nFrom {location}\n{time}",
				'pro'     => true,
				'label'   => __( 'Message Popup', 'storegrowth-sales-booster' ),
				'rows'    => 4,
			],
		];

		// → Timing (seconds).
		$timing = [
			'loop'                  => $toggle( __( 'Loop', 'storegrowth-sales-booster' ), false, true ),
			'notification_per_page' => $number( __( 'Notification Per Page', 'storegrowth-sales-booster' ), 5, 0 ),
			'next_time_display'     => $number( __( 'Next Time Display', 'storegrowth-sales-booster' ), 5, 0, $seconds ),
			'initial_time_delay'    => $number( __( 'Initial Time Delay', 'storegrowth-sales-booster' ), 5, 0, $seconds ),
			'dispaly_time'          => $number( __( 'Display Time', 'storegrowth-sales-booster' ), 5, 0, $seconds ),
		];

		// Design → Template (the storefront draws each one).
		$template = [
			'template' => [
				'type'    => 'select',
				'default' => '4',
				'options' => [ '1', '2', '3', '4' ],
				'label'   => __( 'Template', 'storegrowth-sales-booster' ),
			],
		];

		// → Image Style.
		$image = [
			'image_style'               => $toggle( __( 'Image Style', 'storegrowth-sales-booster' ), true, true ),
			'spacing_around_image'      => $number( __( 'Image Spacing', 'storegrowth-sales-booster' ), 10, 0, 'px' ),
			'popup_image_border_radius' => $number( __( 'Image Radius', 'storegrowth-sales-booster' ), 6, 0, 'px' ),
			'image_position'            => [
				'type'    => 'select',
				'default' => 'left',
				'options' => [ 'left', 'right' ],
				'pro'     => true,
				'label'   => __( 'Image Position', 'storegrowth-sales-booster' ),
				'labels'  => [
					'left'  => __( 'Left', 'storegrowth-sales-booster' ),
					'right' => __( 'Right', 'storegrowth-sales-booster' ),
				],
			],
			'popup_image_width'         => $number( __( 'Image Width', 'storegrowth-sales-booster' ), 72, 0, 'px' ),
		];

		// → Popup Style.
		$popup = [
			'popup_style'         => $toggle( __( 'Popup Style', 'storegrowth-sales-booster' ), true ),
			'background_color'    => [
				'type'    => 'color',
				'default' => '#ffffff',
				'pro'     => true,
				'label'   => __( 'Background Color', 'storegrowth-sales-booster' ),
			],
			'popup_position'      => [
				'type'    => 'select',
				'default' => 'left_bottom',
				'options' => [ 'left_bottom', 'right_bottom', 'left_top', 'right_top' ],
				'pro'     => true,
				'label'   => __( 'Popup Position', 'storegrowth-sales-booster' ),
				'labels'  => [
					'left_bottom'  => __( 'Left Bottom', 'storegrowth-sales-booster' ),
					'right_bottom' => __( 'Right Bottom', 'storegrowth-sales-booster' ),
					'left_top'     => __( 'Left Top', 'storegrowth-sales-booster' ),
					'right_top'    => __( 'Right Top', 'storegrowth-sales-booster' ),
				],
			],
			'popup_border_radius' => $number( __( 'Border Radius', 'storegrowth-sales-booster' ), 8, 0, 'px' ),
			'popup_width'         => $number( __( 'Popup Width', 'storegrowth-sales-booster' ), 400, 0, 'px' ),
		];

		// → Text Style: one row per line of copy, drawn by the admin on the
		// colour key; size and weight are saved with it.
		$row_labels = [
			'normal_text'   => __( 'Normal Text', 'storegrowth-sales-booster' ),
			'product_title' => __( 'Product Name', 'storegrowth-sales-booster' ),
			'time_text'     => __( 'Time', 'storegrowth-sales-booster' ),
			'country_text'  => __( 'Country', 'storegrowth-sales-booster' ),
			'state_text'    => __( 'State', 'storegrowth-sales-booster' ),
			'city_text'     => __( 'City', 'storegrowth-sales-booster' ),
		];
		$text       = [
			'text_style' => $toggle( __( 'Text Style', 'storegrowth-sales-booster' ), true ),
		];
		$off_page   = [];

		foreach ( self::TEXT_ROWS as $prefix => [ $color_key, $pro, $color, $size, $weight ] ) {
			$row = [
				$color_key              => [
					'type'    => 'color',
					'default' => $color,
					'pro'     => $pro,
				],
				"{$prefix}_font_size"   => [
					'type'    => 'number',
					'default' => (int) $size,
					'min'     => 0,
					'pro'     => $pro,
				],
				"{$prefix}_font_weight" => [
					'type'    => 'select',
					'default' => $weight,
					'options' => [ '400', '500', '700' ],
					'pro'     => $pro,
				],
			];

			// `name_text` has no row: not on the page, not saved by it.
			if ( ! isset( $row_labels[ $prefix ] ) ) {
				$off_page = array_merge( $off_page, $row );
				continue;
			}

			$row[ $color_key ]['label']               = $row_labels[ $prefix ];
			$row[ "{$prefix}_font_size" ]['hidden']   = true;
			$row[ "{$prefix}_font_weight" ]['hidden'] = true;

			$text = array_merge( $text, $row );
		}

		return array_merge(
			DisplaySettings::place( $general, 'settings', 'general' ),
			DisplaySettings::place( $products, 'settings', 'products' ),
			DisplaySettings::place( $message, 'settings', 'message' ),
			DisplaySettings::place( $timing, 'settings', 'timing' ),
			DisplaySettings::place( $template, 'design', 'template' ),
			DisplaySettings::place( $image, 'design', 'image' ),
			DisplaySettings::place( $popup, 'design', 'popup' ),
			DisplaySettings::place( $text, 'design', 'text' ),
			$off_page
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
			'title' => __( 'Sales Notification', 'storegrowth-sales-booster' ),
			'tabs'  => [
				'settings' => [
					'label'    => __( 'Notification Setting', 'storegrowth-sales-booster' ),
					'sections' => [
						'general'  => [
							'title' => __( 'General', 'storegrowth-sales-booster' ),
							'help'  => __( 'Whether the popup shows at all, and where', 'storegrowth-sales-booster' ),
						],
						'products' => [
							'title'     => __( 'Products', 'storegrowth-sales-booster' ),
							'help'      => __( 'Which products the popup notifies about, and how they link', 'storegrowth-sales-booster' ),
							'collapsed' => true,
						],
						'message'  => [
							'title'     => __( 'Message', 'storegrowth-sales-booster' ),
							'help'      => __( 'The copy shown inside the popup', 'storegrowth-sales-booster' ),
							'collapsed' => true,
						],
						'timing'   => [
							'title'     => __( 'Timing', 'storegrowth-sales-booster' ),
							'help'      => __( 'How often and how long each popup shows', 'storegrowth-sales-booster' ),
							'collapsed' => true,
						],
					],
				],
				'design'   => [
					'label'    => __( 'Design', 'storegrowth-sales-booster' ),
					'sections' => [
						'template' => [
							'title' => __( 'Template', 'storegrowth-sales-booster' ),
							'help'  => __( 'What shows on the left of the popup', 'storegrowth-sales-booster' ),
						],
						'image'    => [
							'title'  => __( 'Image Style', 'storegrowth-sales-booster' ),
							'help'   => __( 'Size and shape of the template image', 'storegrowth-sales-booster' ),
							'toggle' => 'image_style',
							'card'   => true,
						],
						'popup'    => [
							'title'  => __( 'Popup Style', 'storegrowth-sales-booster' ),
							'help'   => __( 'The container the popup sits in', 'storegrowth-sales-booster' ),
							'toggle' => 'popup_style',
							'card'   => true,
						],
						'text'     => [
							'title'  => __( 'Text Style', 'storegrowth-sales-booster' ),
							'help'   => __( 'Colour, size and weight for every line of copy', 'storegrowth-sales-booster' ),
							'toggle' => 'text_style',
							'card'   => true,
						],
					],
				],
			],
		];
	}

	/**
	 * The stored settings with the defaults of every key not saved, in the
	 * stored shape the storefront reads. Saves write only changed keys, so
	 * the storefront must not rely on every key being there.
	 *
	 * A stored number that isn't numeric (old or third-party data) takes the
	 * default, so the template's arithmetic never fails. Without pro the
	 * template's radii apply (the radius fields need pro).
	 *
	 * @since SPSG_VERSION
	 *
	 * @param mixed $stored Stored option.
	 *
	 * @return array
	 */
	public function storefront_settings( $stored ): array {
		$settings = storegrowth_get_container()->get( SettingsService::class )->with_defaults( $this->get_module_id(), $stored );

		if ( ! sp_store_growth()->has_pro() ) {
			$radii = self::TEMPLATE_RADII[ absint( $settings['template'] ) ] ?? self::TEMPLATE_RADII[4];

			$settings['popup_border_radius']       = $radii[0];
			$settings['popup_image_border_radius'] = $radii[1];
		}

		return $settings;
	}
}
