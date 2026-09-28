<?php
/**
 * Dokan admin scripts.
 *
 * @package StorePulse\StoreGrowth\Integrations\Dokan\Admin
 */

namespace StorePulse\StoreGrowth\Integrations\Dokan\Admin;

use StorePulse\StoreGrowth\Traits\Singleton;

/**
 * Admin EnqueueScript Class.
 *
 * Loads nothing since step 12: its last bundle (`spsg-dokan-countdown-timer`,
 * the Countdown Timer "Vendors" tab of the removed antd admin) is gone. Kept
 * for code that calls `EnqueueScript::instance()`.
 *
 * @package SBFW
 */
class EnqueueScript {

	use Singleton;

	/**
	 * Constructor of EnqueueScript Class.
	 *
	 * @since 1.12.0
	 */
	public function __construct() {
		$this->init_hooks();
	}

	/**
	 * Initialize Hooks.
	 *
	 * @since 1.12.0
	 *
	 * @return void
	 */
	private function init_hooks() {
	}

	/**
	 * Enqueue Scripts for Dokan Admin.
	 *
	 * @since 1.12.0
	 * @deprecated SPSG_VERSION The legacy Dokan admin bundles are removed; nothing is enqueued.
	 *
	 * @param string $hook Current admin screen hook suffix.
	 *
	 * @return void
	 */
	public function admin_enqueue_scripts( $hook = '' ) {
	}
}
