<?php
/**
 * File for FlyCartModule class.
 *
 * @package SBFW
 */

namespace STOREGROWTH\SPSB\Modules\FlyCart;

use STOREGROWTH\SPSB\BaseModule;
use STOREGROWTH\SPSB\Modules\FlyCart\Includes\Providers\BootstrapServiceProvider;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Fly Cart module initiator class.
 */
class FlyCartModule extends BaseModule {

	protected $icon = 'icon-fast-cart-module';

	/**
	 * Unique ID for a module.
	 *
	 * @return string
	 */
	public static function get_id(): string {
		return 'fly-cart';
	}

	/**
	 * Icon for a module.
	 *
	 * @return string
	 */
	public function get_icon(): string {
		return Helper::get_modules_url( 'fly-cart/assets/images/icon-fast-cart-module.svg' );
	}

	/**
	 * Banner for a module.
	 *
	 * @return string
	 */
	public function get_banner(): string {
		return Helper::get_modules_url( 'fly-cart/assets/images/fly-cart-thumbnail.png' );
	}

	/**
	 * Unique name for a module.
	 *
	 * @return string
	 */
	public function get_name(): string {
		return 'Fly Cart';
	}

	/**
	 * Description for the module.
	 *
	 * @return string
	 */
	public function get_description(): string {
		return 'Streamline shopping effortlessly. Add and review items without leaving your page, simplifying the experience.';
	}

	/**
	 * Category for a module.
	 *
	 * @return string
	 */
	public function get_module_category(): string {
		return 'Fly Cart';
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
		 * Fast fly cart module init.
		 *
		 * @since 1.0.0
		 */
		do_action( 'storegrowth_quick_cart_module_init' );
	}
}

// Create object and return.
return FlyCartModule::instance();
