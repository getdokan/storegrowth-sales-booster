<?php
/**
 * Dokan fields on the Fly Cart settings page.
 *
 * @package StorePulse\StoreGrowth\Integrations\Dokan
 */

namespace StorePulse\StoreGrowth\Integrations\Dokan;

use StorePulse\StoreGrowth\Modules\FlyCart\FlyCartModule;
use StorePulse\StoreGrowth\Traits\Singleton;

defined( 'ABSPATH' ) || exit;

/**
 * Adds the vendor store name / link switches to the Fly Cart settings
 * (extension fields, ADR-007). The storefront reads them in `Frontend`.
 *
 * @since SPSG_VERSION
 */
class FlyCartFields {

	use Singleton;

	/**
	 * Constructor.
	 *
	 * @since SPSG_VERSION
	 */
	private function __construct() {
		add_filter( 'spsg_settings_schema', [ $this, 'add_fields' ], 10, 2 );
	}

	/**
	 * Append the Dokan fields to the Fly Cart General tab.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array  $fields    Field definitions keyed by option key.
	 * @param string $module_id Module id.
	 *
	 * @return array
	 */
	public function add_fields( $fields, $module_id ) {
		if ( FlyCartModule::get_id() !== $module_id ) {
			return $fields;
		}

		return array_merge(
			(array) $fields,
			[
				'show_quick_cart_dokan_store_names'   => [
					'type'    => 'toggle',
					'default' => true,
					'tab'     => 'general',
					'label'   => __( 'Show Store Names', 'storegrowth-sales-booster' ),
					'help'    => __( 'The vendor store under each cart item (Dokan)', 'storegrowth-sales-booster' ),
				],
				'enable_quick_cart_dokan_store_links' => [
					'type'    => 'toggle',
					'default' => true,
					'tab'     => 'general',
					'label'   => __( 'Enable Store Links', 'storegrowth-sales-booster' ),
					'help'    => __( 'Link the store name to the vendor store', 'storegrowth-sales-booster' ),
				],
			]
		);
	}
}
