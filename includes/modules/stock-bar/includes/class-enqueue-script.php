<?php
/**
 * Enqueue_Script class for `Stock Bar` module.
 *
 * @package SBFW
 */

namespace STOREGROWTH\SPSB\Modules\Stock_Bar;

use STOREGROWTH\SPSB\Traits\Singleton;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Add styles and scripts files of `Stock Bar` module inside this class.
 */
class Enqueue_Script {

	use Singleton;

	/**
	 * Constructor of Enqueue_Script class.
	 */
	private function __construct() {
		add_action( 'wp_enqueue_scripts', array( $this, 'wp_enqueue_scripts' ) );

		add_action( 'admin_enqueue_scripts', array( $this, 'admin_enqueue_scripts' ) );
	}

	/**
	 * Add JS scripts to frontend.
	 *
	 * Enqueue CSS and JS for fly cart.
	 */
	public function wp_enqueue_scripts() {
		if ( ! is_product() && ! is_shop() ) {
			return;
		}

		wp_enqueue_style(
			'sgsb-stock-cd-custom-style',
			sgsb_modules_url( 'stock-bar/assets/scripts/sgsb-stockbar-style.css' ),
			array(),
			filemtime( sgsb_modules_path( 'stock-bar/assets/scripts/sgsb-stockbar-style.css' ) )
		);

		wp_enqueue_script(
			'stockbar_jqmeter',
			sgsb_modules_url( 'stock-bar/assets/scripts/jqmeter.min.js' ),
			array( 'jquery' ),
			filemtime( sgsb_modules_path( 'stock-bar/assets/scripts/jqmeter.min.js' ) ),
			true
		);

		wp_enqueue_script(
			'stockbar_custom_script',
			sgsb_modules_url( 'stock-bar/assets/scripts/sgsb-stock-bar.js' ),
			array( 'jquery', 'stockbar_jqmeter' ),
			filemtime( sgsb_modules_path( 'stock-bar/assets/scripts/sgsb-stock-bar.js' ) ),
			true
		);

		$this->inline_styles();
	}

	/**
	 * Add JS scripts to admin.
	 *
	 * @param string $hook Page slug.
	 */
	public function admin_enqueue_scripts( $hook ) {
		if ( 'sales-booster_page_sgsb-settings' !== $hook ) {
			return;
		}

		$settings_file = require sgsb_modules_path( 'stock-bar/assets/build/settings.asset.php' );

		wp_enqueue_script(
			'sgsb-stock-bar-settings',
			sgsb_modules_url( 'stock-bar/assets/build/settings.js' ),
			$settings_file['dependencies'],
			$settings_file['version'],
			false
		);
	}

	/**
	 * All inline styles
	 */
	private function inline_styles() {
		// Get settings options.
		$settings = get_option( 'sgsb_stock_bar_settings' );

		$bar_height   = sgsb_find_option_setting( $settings, 'stockbar_height', '10' );
		$bg_color     = sgsb_find_option_setting( $settings, 'stockbar_bg_color', '#e7efff' );
		$fg_color     = sgsb_find_option_setting( $settings, 'stockbar_fg_color', '#0875ff' );
		$border_color = sgsb_find_option_setting( $settings, 'stockbar_border_color', '#dde6f9' );

		$custom_css = "
			.sgsb-stock-progress-bar-section {
				border: 2px solid {$border_color};
			}
			.sgsb-stock-progress {
				height: {$bar_height}px;
				background-color: {$fg_color};
			}
			.sgsb-stock-progress-bar {
				background-color: {$bg_color};
			}
		";

		wp_add_inline_style( 'sgsb-stock-cd-custom-style', $custom_css );
	}
}
