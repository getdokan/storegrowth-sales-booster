<?php
/**
 * Dokan fields on the Countdown Timer settings page.
 *
 * @package StorePulse\StoreGrowth\Integrations\Dokan
 */

namespace StorePulse\StoreGrowth\Integrations\Dokan;

use StorePulse\StoreGrowth\Modules\CountdownTimer\CountdownTimerModule;
use StorePulse\StoreGrowth\Traits\Singleton;

defined( 'ABSPATH' ) || exit;

/**
 * Adds the vendor switches to the Countdown Timer settings (extension
 * fields, ADR-007). They were stored as bools by the old admin; the vendor
 * product form reads them (`templates/dokan-countdown-timer-fields.php`).
 *
 * @since SPSG_VERSION
 */
class CountdownTimerFields {

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
	 * Append the Dokan fields to the Countdown Timer Configure tab.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array  $fields    Field definitions keyed by option key.
	 * @param string $module_id Module id.
	 *
	 * @return array
	 */
	public function add_fields( $fields, $module_id ) {
		if ( CountdownTimerModule::get_id() !== $module_id ) {
			return $fields;
		}

		return array_merge(
			(array) $fields,
			[
				'vendor_can_create_countdown_discount' => [
					'type'    => 'toggle',
					'default' => true,
					'tab'     => 'configure',
					'label'   => __( 'Vendors Can Create Countdown Timer', 'storegrowth-sales-booster' ),
					'help'    => __( 'Vendors set a countdown discount on their products (Dokan)', 'storegrowth-sales-booster' ),
				],
				'vendor_can_create_schedule_timer'     => [
					'type'      => 'toggle',
					'default'   => true,
					'tab'       => 'configure',
					'label'     => __( 'Vendors Can Schedule Timers', 'storegrowth-sales-booster' ),
					'help'      => __( 'Vendors set the countdown start and end dates', 'storegrowth-sales-booster' ),
					'show_when' => [ 'vendor_can_create_countdown_discount' => true ],
				],
			]
		);
	}
}
