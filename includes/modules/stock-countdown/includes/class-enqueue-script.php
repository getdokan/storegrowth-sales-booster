<?php
/**
 * Enqueue_Script class for `Stock Countdown` module.
 *
 * @package SBFW
 */

namespace STOREGROWTH\SPSB\Modules\Stock_Countdown;

use STOREGROWTH\SPSB\Traits\Singleton;

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
			'storepulse_sales_booster-stock-cd-custom-style',
			storepulse_sales_booster_modules_url( 'stock-countdown/assets/scripts/wpbs-style.css' ),
			array(),
			filemtime( storepulse_sales_booster_modules_path( 'stock-countdown/assets/scripts/wpbs-style.css' ) )
		);

		wp_enqueue_script(
			'wpbsc_jqmeter',
			storepulse_sales_booster_modules_url( 'stock-countdown/assets/scripts/jqmeter.min.js' ),
			array( 'jquery' ),
			filemtime( storepulse_sales_booster_modules_path( 'stock-countdown/assets/scripts/jqmeter.min.js' ) ),
			true
		);

		wp_enqueue_script(
			'storepulse_sales_booster-jquery-countdown',
			storepulse_sales_booster_modules_url( 'stock-countdown/assets/scripts/jquery.countdown.min.js' ),
			array( 'jquery' ),
			filemtime( storepulse_sales_booster_modules_path( 'stock-countdown/assets/scripts/jquery.countdown.min.js' ) ),
			true
		);

		wp_enqueue_script(
			'wpbsc_custom_script',
			storepulse_sales_booster_modules_url( 'stock-countdown/assets/scripts/custom.js' ),
			array( 'jquery' ),
			filemtime( storepulse_sales_booster_modules_path( 'stock-countdown/assets/scripts/custom.js' ) ),
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
		if ( 'sales-booster_page_storepulse_sales_booster-settings' !== $hook ) {
			return;
		}

		$settings_file = require storepulse_sales_booster_modules_path( 'stock-countdown/assets/build/settings.asset.php' );

		wp_enqueue_script(
			'storepulse_sales_booster-stock-countdown-settings',
			storepulse_sales_booster_modules_url( 'stock-countdown/assets/build/settings.js' ),
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
		$settings = get_option( 'storepulse_sales_booster_stock_countdown_settings' );

		$widget_bg_color = storepulse_sales_booster_find_option_setting( $settings, 'widget_background_color', '#ffffff' );
		$border_color    = storepulse_sales_booster_find_option_setting( $settings, 'border_color', '#cccccc' );

		$custom_css = "
			.storepulse_sales_booster-stock-counter-and-bar {
				border-color: {$border_color};
				background-color: {$widget_bg_color};
			}
		";

		wp_add_inline_style( 'storepulse_sales_booster-stock-cd-custom-style', $custom_css );
	}

}
