<?php
/**
 * File for ModuleSkeleton interface.
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Interfaces;

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
	public static function get_id(): string;

	/**
	 * Icon for a module.
	 *
	 * @return string
	 */
	public function get_banner(): string;

	/**
	 * Icon for a module.
	 *
	 * @return string
	 */
	public function get_icon(): string;

	/**
	 * Unique name for a module.
	 *
	 * @return string
	 */
	public function get_name(): string;

	/**
	 * Description for the module.
	 *
	 * @return string
	 */
	public function get_description(): string;

	/**
	 * Category for the module.
	 *
	 * @return string
	 */
	public function get_module_category(): string;

	/**
	 * Module is active function.
	 *
	 * @return bool
	 */
	public function is_active(): bool;

	/**
	 * Module activation function.
	 *
	 * @return bool
	 */
	public function activate(): bool;

	/**
	 * Module deactivation function.
	 *
	 * @return bool
	 */
	public function deactivate(): bool;

	/**
	 * Boot the module.
	 *
	 * @return void
	 */
	public function boot(): void;


	/**
	 * Get the documentation link for the module.
	 *
	 * @return string
	 */
	public function get_doc_link(): string;
}
