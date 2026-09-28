<?php
/**
 * Stock Bar settings schema.
 *
 * @package StorePulse\StoreGrowth\Modules\StockBar
 */

namespace StorePulse\StoreGrowth\Modules\StockBar\Settings;

use StorePulse\StoreGrowth\Interfaces\SettingsPage;
use StorePulse\StoreGrowth\Interfaces\SettingsSchema;
use StorePulse\StoreGrowth\Modules\StockBar\StockBarModule;

defined( 'ABSPATH' ) || exit;

/**
 * Fields of `spsg_stock_bar_settings` (docs/redesign/modules/stock-bar.md §4).
 *
 * Defaults of the existing keys are the storefront's fallbacks, so unsaved
 * colours and texts stay as they were. The keys new in the redesign (card
 * background, font, text sizes, count colour) default to the design's card.
 * `shop_page_countdown_enable` / `product_page_countdown_enable` are unused and
 * left out on purpose: they stay in the option untouched.
 *
 * `stockbar_fg_color` may hold a CSS gradient (written by the old third
 * template). It survives saves (unchanged values are never rewritten) and the
 * storefront keeps rendering it; the colour picker can't re-create it.
 *
 * @since SPSG_VERSION
 */
class StockBarSettings implements SettingsSchema, SettingsPage {

	/**
	 * Module id.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return string
	 */
	public function get_module_id(): string {
		return StockBarModule::get_id();
	}

	/**
	 * Option holding the settings.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return string
	 */
	public function get_option_name(): string {
		return 'spsg_stock_bar_settings';
	}

	/**
	 * Field definitions keyed by option key.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return array<string, array<string, mixed>>
	 */
	public function get_fields(): array {
		// In page order: the settings page draws the fields from here.
		return [
			// Content.
			'total_sell_count_text'           => [
				'type'    => 'text',
				'default' => __( 'Total Sold', 'storegrowth-sales-booster' ),
				'pro'     => true,
				'tab'     => 'content',
				'label'   => __( 'Total Sold Count Text', 'storegrowth-sales-booster' ),
			],
			'available_item_count_text'       => [
				'type'    => 'text',
				'default' => __( 'Available Item', 'storegrowth-sales-booster' ),
				'pro'     => true,
				'tab'     => 'content',
				'label'   => __( 'Available Item Count Text', 'storegrowth-sales-booster' ),
			],
			'stock_status_text'               => [
				'type'    => 'text',
				'default' => __( 'Hurry! only {quantity} stocks left.', 'storegrowth-sales-booster' ),
				'pro'     => true,
				'tab'     => 'content',
				'label'   => __( 'Stock Status Text', 'storegrowth-sales-booster' ),
				'help'    => __( 'Use {quantity} for the number of items left.', 'storegrowth-sales-booster' ),
			],

			// Configure.
			'shop_page_stock_bar_enable'      => [
				'type'    => 'toggle',
				'default' => false,
				'pro'     => true,
				'tab'     => 'configure',
				'section' => 'where',
				'variant' => 'checkbox',
				'label'   => __( 'Display on Shop Page', 'storegrowth-sales-booster' ),
			],
			'product_page_stock_bar_enable'   => [
				'type'    => 'toggle',
				'default' => true,
				'tab'     => 'configure',
				'section' => 'where',
				'variant' => 'checkbox',
				'label'   => __( 'Display on Product Page', 'storegrowth-sales-booster' ),
			],
			'variation_page_stock_bar_enable' => [
				'type'    => 'toggle',
				'default' => false,
				'pro'     => true,
				'tab'     => 'configure',
				'section' => 'where',
				'variant' => 'checkbox',
				'label'   => __( 'Display on Variation Product Page', 'storegrowth-sales-booster' ),
			],
			'stock_display_format'            => [
				'type'    => 'select',
				'default' => 'above',
				// `hide` is new: the template shows counts only for above/below.
				'options' => [ 'above', 'below', 'hide' ],
				'pro'     => true,
				'tab'     => 'configure',
				'label'   => __( 'Stock Display Format', 'storegrowth-sales-booster' ),
				'labels'  => [
					'above' => __( 'Above Stock Bar', 'storegrowth-sales-booster' ),
					'below' => __( 'Below Stock Bar', 'storegrowth-sales-booster' ),
					'hide'  => __( 'Hide Counts', 'storegrowth-sales-booster' ),
				],
			],
			'show_stock_status'               => [
				'type'    => 'toggle',
				'default' => true,
				'tab'     => 'configure',
				'label'   => __( 'Stock Status', 'storegrowth-sales-booster' ),
			],
			'status_quantity_required'        => [
				'type'    => 'number',
				'default' => 10,
				'min'     => 0,
				'pro'     => true,
				'tab'     => 'configure',
				'label'   => __( 'Minimum Quantity Required', 'storegrowth-sales-booster' ),
			],

			// Design.
			'stockbar_bg_color'               => [
				'type'    => 'color',
				'default' => '#e7efff',
				'tab'     => 'design',
				'section' => 'bar',
				'label'   => __( 'Foreground Color', 'storegrowth-sales-booster' ),
			],
			// Not `pro` on the server: templates write it in lite too, as the old
			// lite templates did. `pro_ui` locks the Bar Color field without pro.
			'stockbar_fg_color'               => [
				'type'    => 'color',
				'default' => '#0875ff',
				'pro_ui'  => true,
				'tab'     => 'design',
				'section' => 'bar',
				'label'   => __( 'Bar Color', 'storegrowth-sales-booster' ),
			],
			'stockbar_height'                 => [
				'type'    => 'number',
				'default' => 10,
				'min'     => 1,
				'max'     => 100,
				'pro'     => true,
				'tab'     => 'design',
				'section' => 'bar',
				'label'   => __( 'Stock Bar Height', 'storegrowth-sales-booster' ),
				'suffix'  => 'px',
			],
			// Card: new in the redesign, except the border and status colours.
			'stockbar_card_bg_color'          => [
				'type'    => 'color',
				'default' => '#ffffff',
				'tab'     => 'design',
				'section' => 'card',
				'label'   => __( 'Background Color', 'storegrowth-sales-booster' ),
			],
			'stockbar_border_color'           => [
				'type'    => 'color',
				'default' => '#dde6f9',
				'tab'     => 'design',
				'section' => 'card',
				'label'   => __( 'Border Color', 'storegrowth-sales-booster' ),
			],
			'font_family'                     => [
				'type'    => 'select',
				'default' => 'inherit',
				'options' => [ 'inherit', 'Inter', 'Poppins', 'Roboto', 'Open Sans', 'Lato' ],
				'tab'     => 'design',
				'section' => 'card',
				'label'   => __( 'Font Family', 'storegrowth-sales-booster' ),
				'labels'  => [ 'inherit' => __( 'Theme font', 'storegrowth-sales-booster' ) ],
			],
			'count_text_size'                 => [
				'type'    => 'number',
				'default' => 11,
				'min'     => 8,
				'max'     => 40,
				'tab'     => 'design',
				'section' => 'card',
				'label'   => __( 'Count Text Size', 'storegrowth-sales-booster' ),
				'suffix'  => 'px',
			],
			'count_text_color'                => [
				'type'    => 'color',
				'default' => '#25252d',
				'tab'     => 'design',
				'section' => 'card',
				'label'   => __( 'Count Text Color', 'storegrowth-sales-booster' ),
			],
			'status_text_size'                => [
				'type'    => 'number',
				'default' => 11,
				'min'     => 8,
				'max'     => 40,
				'tab'     => 'design',
				'section' => 'card',
				'label'   => __( 'Status Text Size', 'storegrowth-sales-booster' ),
				'suffix'  => 'px',
			],
			'status_text_color'               => [
				'type'    => 'color',
				'default' => '#073B4C',
				'pro'     => true,
				'tab'     => 'design',
				'section' => 'card',
				'label'   => __( 'Stock Status Color', 'storegrowth-sales-booster' ),
			],
			// Drawn by the page (template picker: a preset sets several keys).
			'stockbar_template'               => [
				'type'    => 'select',
				'default' => 'stock_bar_one',
				'options' => [ 'stock_bar_one', 'stock_bar_two', 'stock_bar_three' ],
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
			'title' => __( 'Stock Bar', 'storegrowth-sales-booster' ),
			'tabs'  => [
				'content'   => [
					'label' => __( 'Content', 'storegrowth-sales-booster' ),
				],
				'configure' => [
					'label'    => __( 'Configure', 'storegrowth-sales-booster' ),
					'sections' => [
						'where' => [
							'title' => __( 'Where It Shows', 'storegrowth-sales-booster' ),
							'help'  => __( 'Pages the stock bar appears on', 'storegrowth-sales-booster' ),
						],
					],
				],
				'design'    => [
					'label'    => __( 'Design', 'storegrowth-sales-booster' ),
					'sections' => [
						'bar'      => [
							'title' => __( 'Stock Bar', 'storegrowth-sales-booster' ),
							'help'  => __( 'The progress bar itself', 'storegrowth-sales-booster' ),
						],
						'card'     => [
							'title' => __( 'Stock Bar Card', 'storegrowth-sales-booster' ),
							'help'  => __( 'The container and the text around the bar', 'storegrowth-sales-booster' ),
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
}
