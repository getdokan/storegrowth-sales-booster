<?php
/**
 * Enqueue_Script class for Progressive Discount Banner.
 *
 * @package SBFW
 */

namespace STOREGROWTH\SPSB\Modules\PD_Banner;

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
		$style_file = sgsb_modules_path( 'progressive-discount-banner/assets/css/progressive-discount-banner.css' );

		wp_enqueue_style(
			'sgsb-pd-banner-style',
			sgsb_modules_url( 'progressive-discount-banner/assets/css/progressive-discount-banner.css' ),
			array(),
			filemtime( $style_file )
		);

		wp_enqueue_script(
			'sgsb-pd-banner-bar-remove',
			sgsb_modules_url( 'progressive-discount-banner/assets/js/sgsb-pd-banner-bar-remove.js' ),
			array( 'jquery' ),
			filemtime( sgsb_modules_path( 'progressive-discount-banner/assets/js/sgsb-pd-banner-bar-remove.js' ) ),
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
			$settings_file = require sgsb_modules_path( 'progressive-discount-banner/assets/build/settings.asset.php' );

			wp_enqueue_script(
				'sgsb-pd-banner-settings',
				sgsb_modules_url( 'progressive-discount-banner/assets/build/settings.js' ),
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
		$settings     = sgsb_pd_banner_get_settings();
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
				.sgsb-pd-banner-bar-wrapper {
					top: auto;
					bottom: 0;
				}
			';
		} else {
			$css = '
				body.admin-bar .sgsb-pd-banner-bar-wrapper {
					top: 32px;
				}
				body {
					padding-top: 57px;
				}
			';
		}

		$css .= "
			.sgsb-pd-banner-bar-wrapper {
				background-color: {$bg_color};
				color: {$text_color};
			}
			.sgsb-pd-banner-bar-wrapper .sgsb-pd-banner-bar-icon svg {
				fill: {$icon_color};
			}
		";

		wp_add_inline_style( 'sgsb-pd-banner-style', $css );
	}

}
