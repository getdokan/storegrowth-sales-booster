<?php
/**
 * Stock Bar settings schema.
 *
 * @package StorePulse\StoreGrowth\Modules\StockBar
 */

namespace StorePulse\StoreGrowth\Modules\StockBar\Settings;

use StorePulse\StoreGrowth\Interfaces\SettingsSchema;

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
class StockBarSettings implements SettingsSchema {

	/**
	 * Module id.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return string
	 */
	public function get_module_id(): string {
		return 'stock-bar';
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
		return array(
			// Content.
			'total_sell_count_text'           => array(
				'type'    => 'text',
				'default' => __( 'Total Sold', 'storegrowth-sales-booster' ),
				'pro'     => true,
			),
			'available_item_count_text'       => array(
				'type'    => 'text',
				'default' => __( 'Available Item', 'storegrowth-sales-booster' ),
				'pro'     => true,
			),
			'stock_status_text'               => array(
				'type'    => 'text',
				'default' => __( 'Hurry! only {quantity} stocks left.', 'storegrowth-sales-booster' ),
				'pro'     => true,
			),

			// Configure.
			'product_page_stock_bar_enable'   => array(
				'type'    => 'toggle',
				'default' => true,
			),
			'shop_page_stock_bar_enable'      => array(
				'type'    => 'toggle',
				'default' => false,
				'pro'     => true,
			),
			'variation_page_stock_bar_enable' => array(
				'type'    => 'toggle',
				'default' => false,
				'pro'     => true,
			),
			'stock_display_format'            => array(
				'type'    => 'select',
				'default' => 'above',
				// `hide` is new: the template shows counts only for above/below.
				'options' => array( 'above', 'below', 'hide' ),
				'pro'     => true,
			),
			'show_stock_status'               => array(
				'type'    => 'toggle',
				'default' => true,
			),
			'status_quantity_required'        => array(
				'type'    => 'number',
				'default' => 10,
				'min'     => 0,
				'pro'     => true,
			),

			// Design.
			'stockbar_bg_color'               => array(
				'type'    => 'color',
				'default' => '#e7efff',
			),
			// Not `pro` on the server: templates write it in lite too, as the old
			// lite templates did. The admin locks the Bar Color field without pro.
			'stockbar_fg_color'               => array(
				'type'    => 'color',
				'default' => '#0875ff',
			),
			'stockbar_height'                 => array(
				'type'    => 'number',
				'default' => 10,
				'min'     => 1,
				'max'     => 100,
				'pro'     => true,
			),
			'stockbar_border_color'           => array(
				'type'    => 'color',
				'default' => '#dde6f9',
			),
			'status_text_color'               => array(
				'type'    => 'color',
				'default' => '#073B4C',
				'pro'     => true,
			),

			// New in the redesign (Design → Stock Bar Card).
			'stockbar_card_bg_color'          => array(
				'type'    => 'color',
				'default' => '#ffffff',
			),
			'font_family'                     => array(
				'type'    => 'select',
				'default' => 'inherit',
				'options' => array( 'inherit', 'Inter', 'Poppins', 'Roboto', 'Open Sans', 'Lato' ),
			),
			'count_text_size'                 => array(
				'type'    => 'number',
				'default' => 11,
				'min'     => 8,
				'max'     => 40,
			),
			'count_text_color'                => array(
				'type'    => 'color',
				'default' => '#25252d',
			),
			'status_text_size'                => array(
				'type'    => 'number',
				'default' => 11,
				'min'     => 8,
				'max'     => 40,
			),
			'stockbar_template'               => array(
				'type'    => 'select',
				'default' => 'stock_bar_one',
				'options' => array( 'stock_bar_one', 'stock_bar_two', 'stock_bar_three' ),
			),
		);
	}
}
