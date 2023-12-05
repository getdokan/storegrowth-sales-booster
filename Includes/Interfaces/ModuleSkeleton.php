<?php
/**
 * File for ModuleSkeleton interface.
 *
 * @package SBFW
 */

namespace STOREGROWTH\SPSB\Interfaces;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Set the required structure for a module.
 */
interface ModuleSkeleton {

	/**
	 * Unique ID for a module.
	 *
	 * @return string
	 */
	public function get_id();

	/**
	 * Icon for a module.
	 *
	 * @return string
	 */
	public function get_banner();

	/**
	 * Icon for a module.
	 *
	 * @return string
	 */
	public function get_icon();

	/**
	 * Unique name for a module.
	 *
	 * @return string
	 */
	public function get_name();

	/**
	 * Description for the module.
	 *
	 * @return string
	 */
	public function get_description();

	/**
	 * Category for the module.
	 *
	 * @return string
	 */
	public function get_module_category();

	/**
	 * Module activation function.
	 *
	 * @return void
	 */
	public function activate();

	/**
	 * Module deactivation function.
	 *
	 * @return void
	 */
	public function deactivate();

	/**
	 * Starting point of the module.
	 *
	 * @return void
	 */
	public function init();
}
