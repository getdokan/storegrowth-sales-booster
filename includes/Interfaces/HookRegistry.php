<?php
/**
 * Interface for classes that register WordPress hooks.
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Interfaces;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Defines a contract for registering WordPress actions and filters.
 *
 * Classes implementing this interface should encapsulate the logic
 * for hooking into WordPress using `add_action` and `add_filter`.
 */
interface HookRegistry {
	/**
	 * Register all WordPress hooks (actions and filters).
	 *
	 * @return void
	 */
	public function register_hooks(): void;
}