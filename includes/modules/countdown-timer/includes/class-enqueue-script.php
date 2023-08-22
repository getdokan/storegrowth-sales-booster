<?php
/**
 * Enqueue_Script class for `Countdown Timer` module.
 *
 * @package SBFW
 */

namespace STOREGROWTH\SPSB\Modules\Countdown_Timer;

use STOREGROWTH\SPSB\Traits\Singleton;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Add styles and scripts files of `Countdown Timer` module inside this class.
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
			'sgsb-cd-timer-custom-style',
			sgsb_modules_url( 'countdown-timer/assets/scripts/wpbs-style.css' ),
			array(),
			filemtime( sgsb_modules_path( 'countdown-timer/assets/scripts/wpbs-style.css' ) )
		);

		wp_enqueue_script(
			'sgsb-jquery-countdown',
			sgsb_modules_url( 'countdown-timer/assets/scripts/jquery.countdown.min.js' ),
			array( 'jquery' ),
			filemtime( sgsb_modules_path( 'countdown-timer/assets/scripts/jquery.countdown.min.js' ) ),
			true
		);

		wp_enqueue_script(
			'wpbsc_custom_script',
			sgsb_modules_url( 'countdown-timer/assets/scripts/custom.js' ),
			array( 'jquery', 'sgsb-jquery-countdown' ),
			filemtime( sgsb_modules_path( 'countdown-timer/assets/scripts/custom.js' ) ),
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

		$settings_file = require sgsb_modules_path( 'countdown-timer/assets/build/settings.asset.php' );
		$style_file    = require sgsb_modules_path( 'countdown-timer/assets/build/settings.asset.php' );

		wp_enqueue_script(
			'sgsb-countdown-timer-settings',
			sgsb_modules_url( 'countdown-timer/assets/build/settings.js' ),
			$settings_file['dependencies'],
			$settings_file['version'],
			false
		);

		wp_enqueue_style(
			'sgsb-countdown-timer-style',
			sgsb_modules_url( 'countdown-timer/assets/build/settings.css' ),
			array(),
			filemtime( sgsb_modules_path( 'countdown-timer/assets/build/settings.css' ) )
		);
	}

	/**
	 * All inline styles
	 */
	private function inline_styles() {
		// Get settings options.
		$settings = get_option( 'sgsb_countdown_timer_settings' );

		$widget_bg_color    = sgsb_find_option_setting( $settings, 'widget_background_color', '#ffffff' );
		$border_color       = sgsb_find_option_setting( $settings, 'border_color', '#cccccc' );
		$heading_text_color = sgsb_find_option_setting( $settings, 'heading_text_color', '#000000' );
		$selected_theme     = sgsb_find_option_setting( $settings, 'selected_theme', 'ct-custom' );
		if ( 'ct-custom' === $selected_theme ) {
			$custom_css = "
			.sgsb-countdown-timer.ct-custom{
				border-color: {$border_color};
				background-color: {$widget_bg_color};
			}
			.sgsb-countdown-timer-heading.ct-custom{
				color: {$heading_text_color};
		";
		} else {
			$custom_css = '';
		}

		wp_add_inline_style( 'sgsb-cd-timer-custom-style', $custom_css );
	}
}
