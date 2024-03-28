<?php
/**
 * File for QuickViewModule class.
 *
 * @package SBFW
 */

namespace STOREGROWTH\SPSB\Modules\QuickView;

use STOREGROWTH\SPSB\Interfaces\ModuleSkeleton;
use STOREGROWTH\SPSB\Traits\Singleton;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * `Stock Bar` module initiator class.
 */
class QuickViewModule implements ModuleSkeleton {

	use Singleton;

	/**
	 * Unique ID for a module.
	 *
	 * @return string
	 */
	public function get_id() {
		return 'quick-view';
	}

	/**
	 * Icon for a module.
	 *
	 * @return string
	 */
	public function get_icon() {
		return sgsb_modules_url( 'QuickView/assets/images/quickview-icon-blue.svg' );
	}

	/**
	 * Banner for a module.
	 *
	 * @return string
	 */
	public function get_banner() {
		return sgsb_modules_url( 'QuickView/assets/images/quick-view-module-img.webp' );
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
	 * @return void
	 */
	public function activate() {
		// TODO: Implement activate() method.
	}

	/**
	 * Module deactivation function.
	 *
	 * @return void
	 */
	public function deactivate() {
		// TODO: Implement deactivate() method.
	}

	/**
	 * Starting point of the module.
	 *
	 * @return void
	 */
	public function init() {
		// Include necessary classes for stock bar.
		Includes\EnqueueScript::instance();
		Includes\CommonHooks::instance();
		Includes\Ajax::instance();

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
