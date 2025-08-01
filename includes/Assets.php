<?php
/**
 * Enqueue class.
 *
 * @package SBFW
 */

namespace STOREGROWTH\SPSB;

use STOREGROWTH\SPSB\Traits\Singleton;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Add styles of scripts files inside this class.
 */
class Assets {

	use Singleton;

	/**
	 * Modules page slug.
	 *
	 * @var string
	 */
	private $modules_page_hook = 'storegrowth_page_sgsb-modules';

	/**
	 * Module settings page slug.
	 *
	 * @var string
	 */
	private $settings_page_hook = 'storegrowth_page_sgsb-settings';

	/**
	 * Constructor of Enqueue class.
	 */
	private function __construct() {
		add_action( 'admin_enqueue_scripts', array( $this, 'admin_enqueue_scripts' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'admin_enqueue_styles' ) );
	}

	/**
	 * Add JS scripts to admin.
	 *
	 * @param string $hook page slug.
	 */
	public function admin_enqueue_scripts( $hook ) {
		if ( $this->modules_page_hook === $hook ) {
			$settings_file = require sgsb_plugin_path( 'assets/build/modules.asset.php' );

			wp_enqueue_script(
				'sgsb-modules-script',
				sgsb_assets_url( 'build/modules.js' ),
				$settings_file['dependencies'],
				$settings_file['version'],
				true
			);

			wp_localize_script(
				'sgsb-modules-script',
				'sgsbAdmin',
				array(
					'ajax_url' => admin_url( 'admin-ajax.php' ),
					'nonce'    => wp_create_nonce( 'sgsb_ajax_nonce' ),
					'isPro'    => is_plugin_active( 'storegrowth-sales-booster-pro/storegrowth-sales-booster-pro.php' ),
				)
			);
		}

		if ( $this->settings_page_hook === $hook ) {
			$settings_file = require sgsb_plugin_path( 'assets/build/settings.asset.php' );

			wp_enqueue_script(
				'sgsb-settings-script',
				sgsb_assets_url( 'build/settings.js' ),
				$settings_file['dependencies'],
				$settings_file['version'],
				true
			);

			wp_localize_script(
				'sgsb-settings-script',
				'sgsbAdmin',
				array(
					'ajax_url'       => admin_url( 'admin-ajax.php' ),
					'nonce'          => wp_create_nonce( 'sgsb_ajax_nonce' ),
					'isPro'          => is_plugin_active( 'storegrowth-sales-booster-pro/storegrowth-sales-booster-pro.php' ),
					'currencySymbol' => get_woocommerce_currency_symbol(),
				)
			);
		}
	}

	/**
	 * Add CSS files to admin.
	 *
	 * @param string $hook page slug.
	 */
	public function admin_enqueue_styles( $hook ) {
		if (
			$this->modules_page_hook === $hook
			|| $this->settings_page_hook === $hook
		) {
			wp_enqueue_style(
				'sgsb-admin-style',
				sgsb_assets_url( 'build/modules.css' ),
				array(),
				filemtime( sgsb_plugin_path( 'assets/build/modules.css' ) )
			);
		}
	}
}
