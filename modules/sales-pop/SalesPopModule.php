<?php
/**
 * File for Sales Pop Module class.
 *
 * @package SBFW
 */

namespace STOREGROWTH\SPSB\Modules\SalesPop;

use STOREGROWTH\SPSB\BaseModule;
use STOREGROWTH\SPSB\Modules\SalesPop\Includes\Providers\BootstrapServiceProvider;

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
		return sgsb_modules_url( 'sales-pop/assets/images/sales-pop.svg' );
	}

	/**
	 * Banner for a module.
	 *
	 * @return string
	 */
	public function get_banner(): string {
		return sgsb_modules_url( 'sales-pop/assets/images/sales-pop-module-img.webp' );
	}

	/**
	 * Unique name for a module.
	 *
	 * @return string
	 */
	public function get_name(): string {
		return 'Sales Notification';
	}

	/**
	 * Description for the module.
	 *
	 * @return string
	 */
	public function get_description(): string {
		return 'Build trust, create urgency. Real-time sales notifications enhance credibility and drive conversions.';
	}

	/**
	 * Category for a module.
	 *
	 * @return string
	 */
	public function get_module_category(): string {
		return 'Sales';
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

// Create object and return.
return SalesPopModule::instance();
