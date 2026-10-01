<?php
/**
 * Settings schema contract.
 *
 * @package StorePulse\StoreGrowth
 */

namespace StorePulse\StoreGrowth\Interfaces;

defined( 'ABSPATH' ) || exit;

/**
 * Describes one module's settings: which option holds them and the type,
 * default and tier of every key.
 *
 * Implementations are registered with `add_with_implements_tags()` in the
 * module's always-loaded `ServiceProvider`, so the settings REST route can
 * read and save a module's settings whether the module is active or not.
 *
 * Field definition (array keyed by the option's existing key):
 *
 *     'stockbar_height' => [
 *         'type'    => 'number',  // text | textarea | number | toggle | color | select | box | list | url | date
 *         'default' => 10,        // in API shape (int, bool, string, array)
 *         'pro'     => true,      // optional; saved only while pro is active
 *         'min'     => 1,         // number, box: optional bounds; number: step
 *         'max'     => 100,
 *         'step'    => 1,
 *         'options' => [ 'above', 'below' ], // select, list: allowed values
 *     ]
 *
 * `list` also takes `item` (`int` or `text`), `separator` (how the old admin
 * stored it as a string, e.g. `,`), `max_items` and `lite_max_items` (the cap
 * while pro is inactive). `number` takes `allow_empty` (the old admin stored
 * `''` for "not set"). `url` is a web address or `''`; `date` is `Y-m-d` or `''`.
 * `text` and `textarea` take `html` (keep the markup `wp_kses_post` allows,
 * for text the storefront prints with it) instead of stripping all tags.
 *
 * Keys and their spellings are the ones already stored; never rename them.
 *
 * Fields an extension (pro) adds through the `spsg_settings_schema` filter
 * also say where and how the settings page draws them (plugin-ui
 * `SettingsElement` attributes; the page lays out its own fields by hand):
 *
 *     'spsg_pro_bar_animation' => [
 *         'type'     => 'select',
 *         'default'  => 'slide',
 *         'options'  => [ 'none', 'slide', 'fade' ],
 *         'pro'      => true,
 *         'tab'      => 'design',                  // page tab it shows on
 *         'label'    => __( 'Animation', '…' ),
 *         'help'     => __( 'How the bar enters.', '…' ),
 *         'labels'   => [ 'none' => __( 'None', '…' ) ], // option labels
 *         'variant'  => 'my_animation_picker',     // optional custom control
 *         'priority' => 10,                        // order within the tab
 *     ]
 *
 * Also `placeholder`, `prefix`, `suffix`. Without a `variant` the control
 * follows the type (text, url, date → text; textarea; number; toggle →
 * switch; color → color_picker; select; list → multicheck; `box` needs a
 * custom variant). A custom variant renders
 * through the JS filter `storegrowth_settings_{variant}_field`.
 *
 * @since SPSG_VERSION
 */
interface SettingsSchema {

	/**
	 * Module id, e.g. `stock-bar`. Also the `{module}` in
	 * `sales-booster/v1/settings/{module}`.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return string
	 */
	public function get_module_id(): string;

	/**
	 * Option that stores the settings, e.g. `spsg_stock_bar_settings`. Empty
	 * when each key is its own option (standalone, not autoloaded), e.g. the
	 * global `spsg_remove_data_on_uninstall`.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return string
	 */
	public function get_option_name(): string;

	/**
	 * Field definitions keyed by option key.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return array<string, array<string, mixed>>
	 */
	public function get_fields(): array;
}
