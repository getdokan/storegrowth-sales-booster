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
 *         'type'    => 'number',  // text | textarea | number | toggle | color | select | box | list
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
 * while pro is inactive).
 *
 * Keys and their spellings are the ones already stored; never rename them.
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
	 * Option that stores the settings, e.g. `spsg_stock_bar_settings`.
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
