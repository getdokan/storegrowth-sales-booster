<?php
/**
 * File for Direct_Checkout_Module class.
 *
 * @package SBFW
 */

namespace STOREGROWTH\SPSB\Modules\DirectCheckout;

use STOREGROWTH\SPSB\BaseModule;
use STOREGROWTH\SPSB\Traits\Singleton;
use STOREGROWTH\SPSB\Modules\DirectCheckout\Includes\Providers\BootstrapServiceProvider;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * `Direct Checkout` module initiator class.
 */
class DirectCheckoutModule extends BaseModule {

	use Singleton;

	protected $icon = 'direct-checkout';

	/**
	 * Unique ID for a module.
	 *
	 * @return string
	 */
	public static function get_id() {
		return 'direct-checkout';
	}

	/**
	 * Icon for a module.
	 *
	 * @return string
	 */
	public function get_icon() {
		return sgsb_modules_url( 'direct-checkout/assets/images/direct-checkout.svg' );
	}

	/**
	 * Banner for a module.
	 *
	 * @return string
	 */
	public function get_banner() {
		return sgsb_modules_url( 'direct-checkout/assets/images/direct-checkout-module-img.webp' );
	}

	/**
	 * Unique name for a module.
	 *
	 * @return string
	 */
	public function get_name() {
		return 'Direct Checkout';
	}

	/**
	 * Description for the module.
	 *
	 * @return string
	 */
	public function get_description() {
		return 'Simplify the purchase process. Enable customers to check out directly, reducing cart abandonment and enhancing convenience';
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
	}
}

// Create object and return.
return DirectCheckoutModule::instance();
