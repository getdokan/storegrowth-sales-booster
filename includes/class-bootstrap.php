<?php
/**
 * Bootstrap class.
 *
 * @package SBFW
 */

namespace WPCodal\SBFW;

use WPCodal\SBFW\Ajax\Admin_Ajax;
use WPCodal\SBFW\Admin\Admin_Menu;
use WPCodal\SBFW\Traits\Singleton;

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
		// Include custom function files.
		$this->custom_functions();

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
	 * Load custom functions.
	 */
	private function custom_functions() {
		require_once __DIR__ . '/custom-functions.php';
	}

	/**
	 * Load scripts and styles.
	 */
	private function load_scripts() {
		require_once __DIR__ . '/class-enqueue.php';

		Enqueue::instance();
	}

	/**
	 * Load ajax classes
	 */
	private function load_ajax_classes() {
		require_once __DIR__ . '/ajax/class-admin-ajax.php';

		Admin_Ajax::instance();
	}

	/**
	 * Load admin classes
	 */
	private function load_admin_classes() {
		require_once __DIR__ . '/admin/class-admin-menu.php';
		require_once __DIR__ . '/admin/class-admin-hooks.php';

		Admin_Menu::instance();
		Admin\Admin_Hooks::instance();
	}

	/**
	 * Load module classes
	 */
	private function load_module_classes() {
		require_once __DIR__ . '/interfaces/interface-module-skeleton.php';
		require_once __DIR__ . '/class-modules.php';

		Modules::instance();
	}

}
