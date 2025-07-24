<?php
/**
 * File for FlyCartModule class.
 *
 * @package SBFW
 */

namespace STOREGROWTH\SPSB\Modules\FlyCart;

use STOREGROWTH\SPSB\BaseModule;
use STOREGROWTH\SPSB\Modules\FlyCart\Includes\Providers\BootstrapServiceProvider;
use STOREGROWTH\SPSB\Traits\Singleton;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Fly Cart module initiator class.
 */
class FlyCartModule extends BaseModule {

	use Singleton;

	protected $icon = 'icon-fast-cart-module';

	/**
	 * Unique ID for a module.
	 *
	 * @return string
	 */
	public static function get_id() {
		return 'fly-cart';
	}

	/**
	 * Icon for a module.
	 *
	 * @return string
	 */
	public function get_icon() {
		return sgsb_modules_url( 'fly-cart/assets/images/icon-fast-cart-module.svg' );
	}

	/**
	 * Banner for a module.
	 *
	 * @return string
	 */
	public function get_banner() {
		return sgsb_modules_url( 'fly-cart/assets/images/quick-cart-module-img.webp' );
	}

	/**
	 * Unique name for a module.
	 *
	 * @return string
	 */
	public function get_name() {
		return 'Fly Cart';
	}

	/**
	 * Description for the module.
	 *
	 * @return string
	 */
	public function get_description() {
		return 'Streamline shopping effortlessly. Add and review items without leaving your page, simplifying the experience.';
	}

	/**
	 * Category for a module.
	 *
	 * @return string
	 */
	public function get_module_category() {
		return 'Fly Cart';
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
		 * Fast fly cart module init.
		 *
		 * @since 1.0.0
		 */
		do_action( 'storegrowth_quick_cart_module_init' );
	}
}

// Create object and return.
return FlyCartModule::instance();
