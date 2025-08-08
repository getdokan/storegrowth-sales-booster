<?php
/**
 * File for StockBarModule class.
 *
 * @package SBFW
 */

namespace STOREGROWTH\SPSB\Modules\StockBar;

use STOREGROWTH\SPSB\BaseModule;
use STOREGROWTH\SPSB\Modules\StockBar\Includes\Providers\BootstrapServiceProvider;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * `Stock Bar` module initiator class.
 */
class StockBarModule extends BaseModule {

	protected $icon = 'stock-bar-icon';

	/**
	 * Unique ID for a module.
	 *
	 * @return string
	 */
	public static function get_id(): string {
		return 'stock-bar';
	}

	/**
	 * Icon for a module.
	 *
	 * @return string
	 */
	public function get_icon(): string {
		return sgsb_modules_url( 'stock-bar/assets/images/stock-bar-icon.svg' );
	}

	/**
	 * Banner for a module.
	 *
	 * @return string
	 */
	public function get_banner(): string {
		return sgsb_modules_url( 'stock-bar/assets/images/stock-bar-thumbnail.png' );
	}

	/**
	 * Unique name for a module.
	 *
	 * @return string
	 */
	public function get_name(): string {
		return 'Stock Bar';
	}

	/**
	 * Description for the module.
	 *
	 * @return string
	 */
	public function get_description(): string {
		return 'Drive FOMO effectively. Visually indicate low stock or scarcity to encourage immediate action.';
	}

	/**
	 * Category for a module.
	 *
	 * @return string
	 */
	public function get_module_category(): string {
		return 'Stock';
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
		 *
		 * @since 1.0.0
		 */
		do_action( 'storegrowth_stock_bar_module_init' );
	}
}

// Create object and return.
return StockBarModule::instance();
