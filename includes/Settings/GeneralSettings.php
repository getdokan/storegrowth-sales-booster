<?php
/**
 * Global settings schema and page.
 *
 * @package StorePulse\StoreGrowth
 */

namespace StorePulse\StoreGrowth\Settings;

use StorePulse\StoreGrowth\Interfaces\SettingsPage;
use StorePulse\StoreGrowth\Interfaces\SettingsSchema;
use StorePulse\StoreGrowth\Uninstaller;

defined( 'ABSPATH' ) || exit;

/**
 * The plugin's global settings, the page `#/settings` opens without a
 * module. Each key is its own existing option (no option name), not
 * autoloaded; the old `sales-booster/v1/settings` route reads and writes the
 * same option.
 *
 * @since SPSG_VERSION
 */
class GeneralSettings implements SettingsSchema, SettingsPage {

	/**
	 * Page id: `#/settings?module=general`, `sales-booster/v1/settings/general`.
	 *
	 * @since SPSG_VERSION
	 *
	 * @var string
	 */
	const ID = 'general';

	/**
	 * Page id.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return string
	 */
	public function get_module_id(): string {
		return self::ID;
	}

	/**
	 * No option name: each key is its own option.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return string
	 */
	public function get_option_name(): string {
		return '';
	}

	/**
	 * Field definitions keyed by option name.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return array<string, array<string, mixed>>
	 */
	public function get_fields(): array {
		return [
			Uninstaller::DATA_REMOVAL_OPTION => [
				'type'    => 'toggle',
				'default' => false,
				'label'   => __( 'Remove data on uninstall', 'storegrowth-sales-booster' ),
				'help'    => __( 'Delete every StoreGrowth setting, offer and table when the plugin is deleted. This cannot be undone.', 'storegrowth-sales-booster' ),
			],
		];
	}

	/**
	 * The settings page: one card of fields, no tabs.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return array<string, mixed>
	 */
	public function get_page(): array {
		return [
			'title' => __( 'Settings', 'storegrowth-sales-booster' ),
		];
	}
}
