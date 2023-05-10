<?php
/**
 * Enqueue class.
 *
 * @package SBFW
 */

namespace WPCodal\SBFW;

use WPCodal\SBFW\Traits\Singleton;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Add styles of scripts files inside this class.
 */
class Enqueue {

	use Singleton;

	/**
	 * Modules page slug.
	 *
	 * @var string
	 */
	private $modules_page_hook = 'sales-booster_page_spsb-modules';

	/**
	 * Module settings page slug.
	 *
	 * @var string
	 */
	private $settings_page_hook = 'sales-booster_page_spsb-settings';

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
			$settings_file = require spsb_plugin_path( 'assets/build/modules.asset.php' );

			wp_enqueue_script(
				'spsb-modules-script',
				spsb_assets_url( 'build/modules.js' ),
				$settings_file['dependencies'],
				$settings_file['version'],
				true
			);

			wp_localize_script(
				'spsb-modules-script',
				'spsbAdmin',
				array(
					'ajax_url' => admin_url( 'admin-ajax.php' ),
					'nonce'    => wp_create_nonce( 'spsb_ajax_nonce' ),
					'isPro'    => is_plugin_active( 'sales-boster-for-woocommerce-pro/sales-booster-for-wcoommerce-pro.php' ),
				)
			);
		}

		if ( $this->settings_page_hook === $hook ) {
			$settings_file = require spsb_plugin_path( 'assets/build/settings.asset.php' );

			wp_enqueue_script(
				'spsb-settings-script',
				spsb_assets_url( 'build/settings.js' ),
				$settings_file['dependencies'],
				$settings_file['version'],
				true
			);

			wp_localize_script(
				'spsb-settings-script',
				'spsbAdmin',
				array(
					'ajax_url'       => admin_url( 'admin-ajax.php' ),
					'nonce'          => wp_create_nonce( 'spsb_ajax_nonce' ),
					'isPro'          => is_plugin_active( 'sales-boster-for-woocommerce-pro/sales-booster-for-wcoommerce-pro.php' ),
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
				'spsb-admin-style',
				spsb_assets_url( 'build/modules.css' ),
				array(),
				filemtime( spsb_plugin_path( 'assets/build/modules.css' ) )
			);
		}
	}
}
