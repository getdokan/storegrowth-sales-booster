<?php
/**
 * BOGO vendor settings schema and page (Dokan).
 *
 * @package StorePulse\StoreGrowth\Integrations\Dokan
 */

namespace StorePulse\StoreGrowth\Integrations\Dokan\Settings;

use StorePulse\StoreGrowth\Integrations\Dokan\BogoVendorRules;
use StorePulse\StoreGrowth\Interfaces\SettingsPage;
use StorePulse\StoreGrowth\Interfaces\SettingsSchema;
use StorePulse\StoreGrowth\Modules\BoGo\BoGoModule;

defined( 'ABSPATH' ) || exit;

/**
 * Fields and page of `spsg_bogo_dokan_vendors_settings`: what Dokan vendors
 * may do with BOGO (docs/redesign/modules/bogo.md, 10f). Its own option, so
 * its own page, `#/settings?module=bogo-vendors` in BOGO's frame, registered
 * through `spsg_settings_schemas` while Dokan is active and linked from the
 * BOGO settings page (`add_link()`).
 *
 * The option's other keys (`vendors_can_schedule_offers`, …, never used) stay
 * out of the schema; saves merge, so they're kept.
 *
 * @since SPSG_VERSION
 */
class BogoVendorSettings implements SettingsSchema, SettingsPage {

	/**
	 * Page id.
	 *
	 * @since SPSG_VERSION
	 *
	 * @var string
	 */
	const ID = 'bogo-vendors';

	/**
	 * Page id: the `module` in `#/settings?module=…` and the REST route.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return string
	 */
	public function get_module_id(): string {
		return self::ID;
	}

	/**
	 * Option holding the settings.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return string
	 */
	public function get_option_name(): string {
		return BogoVendorRules::OPTION;
	}

	/**
	 * Fields.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return array<string, array<string, mixed>>
	 */
	public function get_fields(): array {
		return [
			// Off until saved: how the vendor dashboard and the REST rules read it.
			'vendors_can_create_buy_x_get_x' => [
				'type'    => 'toggle',
				'default' => false,
				'section' => 'offers',
				'label'   => __( 'Vendors Can Create Buy X Get X', 'storegrowth-sales-booster' ),
				'help'    => __( 'Vendors can create offers that give the same product they sell (Buy X Get X).', 'storegrowth-sales-booster' ),
			],
		];
	}

	/**
	 * `spsg_settings_page`: a "Vendors" link on the BOGO settings page.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array  $page      Page.
	 * @param string $module_id Page id.
	 *
	 * @return array
	 */
	public static function add_link( $page, $module_id ) {
		$page = (array) $page;

		if ( BoGoModule::get_id() !== $module_id ) {
			return $page;
		}

		$page['links']   = (array) ( $page['links'] ?? [] );
		$page['links'][] = [
			'label' => __( 'Vendors', 'storegrowth-sales-booster' ),
			'route' => '/settings?module=' . self::ID,
		];

		return $page;
	}

	/**
	 * The settings page: one card, one section.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return array<string, mixed>
	 */
	public function get_page(): array {
		return [
			'title'    => __( 'BOGO Vendor Settings', 'storegrowth-sales-booster' ),
			// In BOGO's frame (feature rail).
			'module'   => BoGoModule::get_id(),
			'sections' => [
				'offers' => [
					'title' => __( 'Vendor Offers', 'storegrowth-sales-booster' ),
					'help'  => __( 'What Dokan vendors can create from their dashboard', 'storegrowth-sales-booster' ),
				],
			],
		];
	}
}
