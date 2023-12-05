<?php
/**
 * Bootstrap class.
 *
 * @package SBFW
 */

namespace STOREGROWTH\SPSB;

use STOREGROWTH\SPSB\Admin\AdminMenu;
use STOREGROWTH\SPSB\Traits\Singleton;
use STOREGROWTH\SPSB\Admin\AdminHooks;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Load core functionality inside this class.
 */
class Bootstrap {

	use Singleton;

	/**
	 * Constructor of Bootstrap class.
	 */
	private function __construct() {
		// Include module classes.
		$this->load_module_classes();

		// Include asset method.
		$this->load_scripts();

		// Include ajax classes.
		$this->load_ajax_classes();

		// Include admin classes.
		$this->load_admin_classes();
	}

	/**
	 * Load scripts and styles.
	 */
	private function load_scripts() {
		Assets::instance();
	}

	/**
	 * Load ajax classes
	 */
	private function load_ajax_classes() {
		Ajax::instance();
	}

	/**
	 * Load admin classes
	 */
	private function load_admin_classes() {
		AdminMenu::instance();
		AdminHooks::instance();
	}

	/**
	 * Load module classes
	 */
	private function load_module_classes() {
		Modules::instance();
	}
}
