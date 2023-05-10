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
		add_filter( 'plugin_action_links_' . INVIZO_PLUGIN_BASENAME, array( $this, 'plugin_action_links' ) );
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
			'modules'  => '<a href="' . admin_url( 'admin.php?page=spsb-modules' ) . '">' . esc_html__( 'Modules', 'spsb' ) . '</a>',
			'settings' => '<a href="' . admin_url( 'admin.php?page=spsb-settings' ) . '">' . esc_html__( 'Settings', 'spsb' ) . '</a>',
		);

		return array_merge( $action_links, $links );
	}

}
