<?php
/**
 * File for StockBarModule class.
 *
 * @package SBFW
 */

namespace STOREGROWTH\SPSB\Modules\StockBar;

use STOREGROWTH\SPSB\BaseModule;
use STOREGROWTH\SPSB\Modules\StockBar\Includes\Providers\BootstrapServiceProvider;
use STOREGROWTH\SPSB\Traits\Singleton;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * `Stock Bar` module initiator class.
 */
class StockBarModule extends BaseModule {

	use Singleton;

	protected $icon = 'stock-bar-icon';

	/**
	 * Unique ID for a module.
	 *
	 * @return string
	 */
	public static function get_id() {
		return 'stock-bar';
	}

	/**
	 * Icon for a module.
	 *
	 * @return string
	 */
	public function get_icon() {
		return sgsb_modules_url( 'stock-bar/assets/images/stock-bar-icon.svg' );
	}

	/**
	 * Banner for a module.
	 *
	 * @return string
	 */
	public function get_banner() {
		return sgsb_modules_url( 'stock-bar/assets/images/stock-bar-module-img.webp' );
	}

	/**
	 * Unique name for a module.
	 *
	 * @return string
	 */
	public function get_name() {
		return 'Stock Bar';
	}

	/**
	 * Description for the module.
	 *
	 * @return string
	 */
	public function get_description() {
		return 'Drive FOMO effectively. Visually indicate low stock or scarcity to encourage immediate action.';
	}

	/**
	 * Category for a module.
	 *
	 * @return string
	 */
	public function get_module_category() {
		return 'Stock';
	}

	/**
	 * Module activation function.
	 *
	 * @return bool
	 */
	public function activate(): bool {
		$activated = parent::activate();

//		( new Installer() )->run();

		return $activated;
	}

	/**
	 * Module deactivation function.
	 *
	 * @return void
	 */
//	public function deactivate() {
//		// TODO: Implement deactivate() method.
//	}

	/**
	 * Starting point of the module.
	 *
	 * @return void
	 */
	public function boot() {
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
