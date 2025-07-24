<?php
/**
 * File for BoGo class.
 *
 * @package SBFW
 */

namespace STOREGROWTH\SPSB\Modules\BoGo;

use STOREGROWTH\SPSB\BaseModule;
use STOREGROWTH\SPSB\Modules\BoGo\Includes\Providers\BootstrapServiceProvider;
use STOREGROWTH\SPSB\Traits\Singleton;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Sales Pop module initiator class.
 */
class BoGoModule extends BaseModule {

	use Singleton;

	protected $icon = 'upsell-order-bump';

	/**
	 * Unique ID for a module.
	 *
	 * @return string
	 */
	public static function get_id() {
		return 'bogo';
	}

	/**
	 * Icon for a module.
	 *
	 * @return string
	 */
	public function get_icon() {
		return sgsb_modules_url( 'bogo/assets/images/upsell-order-bump.svg' );
	}

	/**
	 * Banner for a module.
	 *
	 * @return string
	 */
	public function get_banner() {
		return sgsb_modules_url( 'bogo/assets/images/bogo-module-img.webp' );
	}

	/**
	 * Unique name for a module.
	 *
	 * @return string
	 */
	public function get_name() {
		return 'BOGO';
	}

	/**
	 * Description for the module.
	 *
	 * @return string
	 */
	public function get_description() {
		return 'Effortlessly boost sales. Offer relevant add-ons at checkout for increased order values and profit.';
	}

	/**
	 * Category for a module.
	 *
	 * @return string
	 */
	public function get_module_category() {
		return 'Upsell';
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
		 * @since 1.0.2
		 */
		do_action( 'storegrowth_bogo_module_init' );
	}
}

// Create object and return.
return BoGoModule::instance();
