<?php
/**
 * File for Upsell_Order_Bump class.
 *
 * @package SBFW
 */

namespace STOREGROWTH\SPSB\Modules\UpsellOrderBump;

use STOREGROWTH\SPSB\BaseModule;
use STOREGROWTH\SPSB\Modules\UpsellOrderBump\Includes\Providers\BootstrapServiceProvider;
use STOREGROWTH\SPSB\Helper as PluginHelper;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Sales Pop module initiator class.
 */
class UpsellOrderBumpModule extends BaseModule {

	protected $icon = 'upsell-order-bump';

	/**
	 * Unique ID for a module.
	 *
	 * @return string
	 */
	public static function get_id(): string {
		return 'upsell-order-bump';
	}

	/**
	 * Icon for a module.
	 *
	 * @return string
	 */
	public function get_icon(): string {
		return PluginHelper::get_modules_url( 'upsell-order-bump/assets/images/upsell-order-bump.svg' );
	}

	/**
	 * Banner for a module.
	 *
	 * @return string
	 */
	public function get_banner(): string {
		return PluginHelper::get_modules_url( 'upsell-order-bump/assets/images/upsell-order-bump-thumbnail.png' );
	}

	/**
	 * Unique name for a module.
	 *
	 * @return string
	 */
	public function get_name(): string {
		return 'Upsell Order Bump';
	}

	/**
	 * Description for the module.
	 *
	 * @return string
	 */
	public function get_description(): string {
		return 'Effortlessly boost sales. Offer relevant add-ons at checkout for increased order values and profit.';
	}

	/**
	 * Category for a module.
	 *
	 * @return string
	 */
	public function get_module_category(): string {
		return 'Upsell';
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

		/**
		 * Module initialized.
		 */
		do_action( 'storegrowth_upsell_order_bump_module_init' );
	}
}

// Create object and return.
return UpsellOrderBumpModule::instance();
