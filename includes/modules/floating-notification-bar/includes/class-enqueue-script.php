<?php
/**
 * Enqueue_Script class for Progressive Discount Banner.
 *
 * @package SBFW
 */

namespace STOREGROWTH\SPSB\Modules\Floating_Notification_Bar;

use STOREGROWTH\SPSB\Traits\Singleton;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Add styles and scripts files of `Progressive Discount Banner` modules inside this class.
 */
class Enqueue_Script {

	use Singleton;

	/**
	 * Constructor of Enqueue class.
	 */
	private function __construct() {
		add_action( 'wp_enqueue_scripts', array( $this, 'wp_enqueue_scripts' ) );

		add_action( 'admin_enqueue_scripts', array( $this, 'admin_enqueue_scripts' ) );
	}

	/**
	 * Add JS scripts to frontend.
	 */
	public function wp_enqueue_scripts() {
		// On WooCommerce v7.8 wc-cart-fragments has been removed from all pages, So we added it here.
		if ( is_cart() || is_checkout() ) {
			wp_enqueue_script( 'wc-cart-fragments' );
		}

		$style_file = sgsb_modules_path( 'floating-notification-bar/assets/css/floating-notification-bar.css' );

		wp_enqueue_style(
			'sgsb-floating-notification-bar-style',
			sgsb_modules_url( 'floating-notification-bar/assets/css/floating-notification-bar.css' ),
			array(),
			filemtime( $style_file )
		);

		wp_enqueue_script(
			'sgsb-floating-notification-bar-remove',
			sgsb_modules_url( 'floating-notification-bar/assets/js/sgsb-pd-banner-bar-remove.js' ),
			array( 'jquery' ),
			filemtime( sgsb_modules_path( 'floating-notification-bar/assets/js/sgsb-pd-banner-bar-remove.js' ) ),
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
		if ( 'sales-booster_page_sgsb-settings' === $hook ) {
			$settings_file = require sgsb_modules_path( 'floating-notification-bar/assets/build/settings.asset.php' );

			wp_enqueue_script(
				'sgsb-floating-notification-bar-settings',
				sgsb_modules_url( 'floating-notification-bar/assets/build/settings.js' ),
				$settings_file['dependencies'],
				$settings_file['version'],
				false
			);
		}
	}

	/**
	 * All inline styles
	 */
	private function inline_styles() {
		// Get style options.
		$settings     = sgsb_floating_notification_bar_get_settings();
		$bar_position = sgsb_find_option_setting( $settings, 'bar_position', 'top' );
		$bg_color     = sgsb_find_option_setting( $settings, 'background_color', '#008DFF' );
		$text_color   = sgsb_find_option_setting( $settings, 'text_color', '#ffffff' );
		$icon_color   = sgsb_find_option_setting( $settings, 'icon_color', '#ffffff' );

		if ( ( ! isset( $settings['default_banner'] ) && ! isset( $settings['discount_banner'] ) )
			|| ( ! $settings['default_banner'] && ! $settings['discount_banner'] ) ) {
			return false;
		}

		if ( 'bottom' === $bar_position ) {
			$css = '
				.sgsb-floating-notification-bar-wrapper {
					top: auto;
					bottom: 0;
				}
			';
		} else {
			$css = '
				body.admin-bar .sgsb-floating-notification-bar-wrapper {
					top: 100px;
				}
				body {
					padding-top: 100px;
				}
			';
		}

		$css .= "
			.sgsb-floating-notification-bar-wrapper {
				background-color: {$bg_color};
				color: {$text_color};
			}
			.sgsb-floating-notification-bar-wrapper .sgsb-floating-notification-bar-icon svg {
				fill: {$icon_color};
			}
		";

		wp_add_inline_style( 'sgsb-floating-notification-bar-style', $css );
	}
}
