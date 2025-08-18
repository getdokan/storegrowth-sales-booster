<?php
/**
 * File for Sales Pop Module class.
 *
 * @package SBFW
 */

namespace STOREGROWTH\SPSB\Modules\SalesPop;

use STOREGROWTH\SPSB\BaseModule;
use STOREGROWTH\SPSB\Modules\SalesPop\Providers\BootstrapServiceProvider;
use STOREGROWTH\SPSB\Helper as PluginHelper;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Sales Pop module initiator class.
 */
class SalesPopModule extends BaseModule {

	protected $icon = 'sales-pop';

	/**
	 * Unique ID for a module.
	 *
	 * @return string
	 */
	public static function get_id(): string {
		return 'sales-pop';
	}

	/**
	 * Icon for a module.
	 *
	 * @return string
	 */
	public function get_icon(): string {
		return PluginHelper::get_modules_url( 'sales-pop/assets/images/sales-pop.svg' );
	}

	/**
	 * Banner for a module.
	 *
	 * @return string
	 */
	public function get_banner(): string {
		return PluginHelper::get_modules_url( 'sales-pop/assets/images/sales-pop-thumbnail.png' );
	}

	/**
	 * Unique name for a module.
	 *
	 * @return string
	 */
	public function get_name(): string {
		return __( 'Sales Notification', 'storegrowth-sales-booster' );
	}

	/**
	 * Description for the module.
	 *
	 * @return string
	 */
	public function get_description(): string {
		return __( 'Build trust, create urgency. Real-time sales notifications enhance credibility and drive conversions.', 'storegrowth-sales-booster' );
	}

	/**
	 * Category for a module.
	 *
	 * @return string
	 */
	public function get_module_category(): string {
		return __( 'Sales', 'storegrowth-sales-booster' );
	}

	/**
	 * Module activation method.
	 *
	 * @return bool
	 */
	public function activate(): bool {
		$activated = parent::activate();

		return $activated;
	}

	/**
	 * Module deactivation method.
	 *
	 * @return bool
	 */
	public function deactivate(): bool {
		$deactivated = parent::deactivate();

		return $deactivated;
	}

	/**
	 * Starting point of the module.
	 *
	 * @return void
	 */
	public function boot(): void {
		storegrowth_get_container()->addServiceProvider( new BootstrapServiceProvider() );

		do_action( 'storegrowth_sales_pop_module_init' );
	}
}
