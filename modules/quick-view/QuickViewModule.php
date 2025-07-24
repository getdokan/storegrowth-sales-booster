<?php
/**
 * File for QuickViewModule class.
 *
 * @package SBFW
 */

namespace STOREGROWTH\SPSB\Modules\QuickView;

use STOREGROWTH\SPSB\BaseModule;
use STOREGROWTH\SPSB\Modules\QuickView\Includes\Providers\BootstrapServiceProvider;
use STOREGROWTH\SPSB\Traits\Singleton;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * `Stock Bar` module initiator class.
 */
class QuickViewModule extends BaseModule {

	use Singleton;

	protected $icon = 'quickview-icon-blue';

	/**
	 * Unique ID for a module.
	 *
	 * @return string
	 */
	public static function get_id() {
		return 'quick-view';
	}

	/**
	 * Icon for a module.
	 *
	 * @return string
	 */
	public function get_icon() {
		return sgsb_modules_url( 'quick-view/assets/images/quickview-icon-blue.svg' );
	}

	/**
	 * Banner for a module.
	 *
	 * @return string
	 */
	public function get_banner() {
		return sgsb_modules_url( 'quick-view/assets/images/quick-view-module-img.webp' );
	}

	/**
	 * Unique name for a module.
	 *
	 * @return string
	 */
	public function get_name() {
		return 'Quick View';
	}

	/**
	 * Description for the module.
	 *
	 * @return string
	 */
	public function get_description() {
		return 'Explore product details instantly. Get a sneak peek of product photos, descriptions, and pricing at a glance - all from your shop page.';
	}

	/**
	 * Category for a module.
	 *
	 * @return string
	 */
	public function get_module_category() {
		return 'Quick View';
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
		do_action( 'storegrowth_quick_view_module_init' );
	}
}

// Create object and return.
return QuickViewModule::instance();
