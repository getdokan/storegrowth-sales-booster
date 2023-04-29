<?php
/**
 * Implement admin related common hooks.
 *
 * @package SBFW
 */

namespace WPCodal\SBFW\Admin;

use WPCodal\SBFW\Traits\Singleton;

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
		add_filter( 'plugin_action_links_' . WPCODAL_SBFW_PLUGIN_BASENAME, array( $this, 'plugin_action_links' ) );
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
			'modules'  => '<a href="' . admin_url( 'admin.php?page=sbfw-modules' ) . '">' . esc_html__( 'Modules', 'sbfw' ) . '</a>',
			'settings' => '<a href="' . admin_url( 'admin.php?page=sbfw-settings' ) . '">' . esc_html__( 'Settings', 'sbfw' ) . '</a>',
		);

		return array_merge( $action_links, $links );
	}

}
