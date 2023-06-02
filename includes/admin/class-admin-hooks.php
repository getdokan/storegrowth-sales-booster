<?php
/**
 * Implement admin related common hooks.
 *
 * @package SBFW
 */

namespace STOREGROWTH\SPSB\Admin;

use STOREGROWTH\SPSB\Traits\Singleton;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Add misc dashbaord end hooks inside this class.
 */
class Admin_Hooks {

	use Singleton;

	/**
	 * Constructor of Admin_Hooks class.
	 */
	private function __construct() {
		add_filter( 'plugin_action_links_' . STOREGROWTH_PLUGIN_BASENAME, array( $this, 'plugin_action_links' ) );
	}

	/**
	 * Show action links on the plugin screen.
	 *
	 * @param mixed $links Plugin Action links.
	 *
	 * @return array
	 */
	public function plugin_action_links( $links ) {
		$action_links = array(
			'modules'  => '<a href="' . admin_url( 'admin.php?page=sgsb-modules' ) . '">' . esc_html__( 'Modules', 'storegrowth-sales-booster' ) . '</a>',
			'settings' => '<a href="' . admin_url( 'admin.php?page=sgsb-settings' ) . '">' . esc_html__( 'Settings', 'storegrowth-sales-booster' ) . '</a>',
		);

		return array_merge( $action_links, $links );
	}

}
