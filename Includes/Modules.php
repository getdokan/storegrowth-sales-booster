<?php
/**
 * File for Modules class.
 *
 * @package SBFW
 */

namespace STOREGROWTH\SPSB;

use STOREGROWTH\SPSB\Interfaces\ModuleSkeleton;
use STOREGROWTH\SPSB\Traits\Singleton;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Add necessary actions for module inside this class.
 */
class Modules {

	use Singleton;

	/**
	 * All Modules.
	 *
	 * @var array
	 */
	private $modules = array();

	/**
	 * Constructor of Modules class.
	 */
	private function __construct() {
		$this->load_active_modules();
	}

	/**
	 * Get Modules
	 *
	 * @return ModuleSkeleton[]
	 */
	private function get_all_modules() {
		if ( $this->modules ) {
			return $this->modules;
		}

		$list_modules = glob( __DIR__ . '/Modules/*/*.php' );

		foreach ( $list_modules as $module_file ) {
			// Handle modules namespaces for dynamic autoload.
			$module_class     = str_replace( '.php', '', basename( $module_file ) );
			$class_namespace  = str_replace( 'Module', '', $module_class );
			$module_namespace = "STOREGROWTH\\SPSB\\Modules\\{$class_namespace}\\{$module_class}";

			// Hold modules instance & store it.
			$module = $module_namespace::instance();

			$this->modules[ $module->get_id() ] = $module;
		}

		return $this->modules;
	}

	/**
	 * List Modules for frontend.
	 *
	 * @return array
	 */
	public function list_all_modules() {
		$modules = $this->get_all_modules();

		$all_modules = array();
		$active_ids  = $this->get_active_module_ids();

		foreach ( $modules as $module ) {
			$module_id = $module->get_id();

			$all_modules[] = array(
				'id'          => $module_id,
				'name'        => $module->get_name(),
				'icon'        => $module->get_icon(),
				'banner'      => $module->get_banner(),
				'description' => $module->get_description(),
				'category'    => $module->get_module_category(),
				'status'      => isset( $active_ids[ $module_id ] ),
			);
		}

		return $all_modules;
	}

	/**
	 * Get active module ids
	 *
	 * @return array
	 */
	public function get_active_module_ids() {
		$ids = get_option( 'sgsb_active_module_ids', array() );

		if ( ! $ids ) {
			return array();
		}

		return (array) $ids;
	}

	/**
	 * Get module by ID.
	 *
	 * @param string $module_id Module unique slug.
	 *
	 * @return ModuleSkeleton|null
	 */
	public function get_module_by_id( $module_id ) {
		$modules = $this->get_all_modules();

		if ( isset( $modules[ $module_id ] ) ) {
			return $modules[ $module_id ];
		}

		return null;
	}

	/**
	 * Update active module ids.
	 *
	 * @param array $ids Array of module unique slug.
	 *
	 * @return bool
	 */
	public function update_active_module_ids( $ids ) {
		return update_option( 'sgsb_active_module_ids', (array) $ids );
	}

	/**
	 * Load functionality of active Modules.
	 */
	private function load_active_modules() {
		foreach ( $this->get_active_modules() as $module ) {
			$module->init();
		}
	}

	/**
	 * Get active module ids
	 *
	 * @return ModuleSkeleton[]
	 */
	private function get_active_modules() {
		$modules        = $this->get_all_modules();
		$active_modules = array();
		$active_ids     = $this->get_active_module_ids();

		foreach ( $modules as $module ) {
			if ( in_array( $module->get_id(), $active_ids, true ) ) {
				$active_modules[] = $module;
			}
		}

		return $active_modules;
	}
}
