<?php
/**
 * Enqueue_Script class for `Stock Countdown` module.
 *
 * @package SBFW
 */

namespace WPCodal\SBFW\Modules\Stock_Countdown;

use WPCodal\SBFW\Traits\Singleton;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Add styles and scripts files of `Stock Countdown` module inside this class.
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
			'sbfw-stock-cd-custom-style',
			sbfw_modules_url( 'stock-countdown/assets/scripts/wpbs-style.css' ),
			array(),
			filemtime( sbfw_modules_path( 'stock-countdown/assets/scripts/wpbs-style.css' ) )
		);

		wp_enqueue_script(
			'wpbsc_jqmeter',
			sbfw_modules_url( 'stock-countdown/assets/scripts/jqmeter.min.js' ),
			array( 'jquery' ),
			filemtime( sbfw_modules_path( 'stock-countdown/assets/scripts/jqmeter.min.js' ) ),
			true
		);

		wp_enqueue_script(
			'sbfw-jquery-countdown',
			sbfw_modules_url( 'stock-countdown/assets/scripts/jquery.countdown.min.js' ),
			array( 'jquery' ),
			filemtime( sbfw_modules_path( 'stock-countdown/assets/scripts/jquery.countdown.min.js' ) ),
			true
		);

		wp_enqueue_script(
			'wpbsc_custom_script',
			sbfw_modules_url( 'stock-countdown/assets/scripts/custom.js' ),
			array( 'jquery' ),
			filemtime( sbfw_modules_path( 'stock-countdown/assets/scripts/custom.js' ) ),
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
		if ( 'sales-booster_page_sbfw-settings' !== $hook ) {
			return;
		}

		$settings_file = require sbfw_modules_path( 'stock-countdown/assets/build/settings.asset.php' );

		wp_enqueue_script(
			'sbfw-stock-countdown-settings',
			sbfw_modules_url( 'stock-countdown/assets/build/settings.js' ),
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
		$settings = get_option( 'sbfw_stock_countdown_settings' );

		$widget_bg_color = sbfw_find_option_setting( $settings, 'widget_background_color', '#ffffff' );
		$border_color    = sbfw_find_option_setting( $settings, 'border_color', '#cccccc' );

		$custom_css = "
			.sbfw-stock-counter-and-bar {
				border-color: {$border_color};
				background-color: {$widget_bg_color};
			}
		";

		wp_add_inline_style( 'sbfw-stock-cd-custom-style', $custom_css );
	}

}
