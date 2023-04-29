<?php
/**
 * Enqueue_Script class for Progressive Discount Banner.
 *
 * @package SBFW
 */

namespace WPCodal\SBFW\Modules\PD_Banner;

use WPCodal\SBFW\Traits\Singleton;

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
		$style_file = sbfw_modules_path( 'progressive-discount-banner/assets/css/progressive-discount-banner.css' );

		wp_enqueue_style(
			'sbfw-pd-banner-style',
			sbfw_modules_url( 'progressive-discount-banner/assets/css/progressive-discount-banner.css' ),
			array(),
			filemtime( $style_file )
		);

		$this->inline_styles();
	}

	/**
	 * Add JS scripts to admin.
	 *
	 * @param string $hook Page slug.
	 */
	public function admin_enqueue_scripts( $hook ) {
		if ( 'sales-booster_page_sbfw-settings' === $hook ) {
			$settings_file = require sbfw_modules_path( 'progressive-discount-banner/assets/build/settings.asset.php' );

			wp_enqueue_script(
				'sbfw-pd-banner-settings',
				sbfw_modules_url( 'progressive-discount-banner/assets/build/settings.js' ),
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
		$settings     = sbfw_pd_banner_get_settings();
		$bar_position = sbfw_find_option_setting( $settings, 'bar_position', 'top' );
		$bg_color     = sbfw_find_option_setting( $settings, 'background_color', '#2E5780' );
		$text_color   = sbfw_find_option_setting( $settings, 'text_color', '#ffffff' );
		$icon_color   = sbfw_find_option_setting( $settings, 'icon_color', '#ffffff' );

		if ( 'bottom' === $bar_position ) {
			$css = '
				.sbfw-pd-banner-bar-wrapper {
					top: auto;
					bottom: 0;
				}
			';
		} else {
			$css = '
				body.admin-bar .sbfw-pd-banner-bar-wrapper {
					top: 32px;
				}
				body {
					padding-top: 48px;
				}
			';
		}

		$css .= "
			.sbfw-pd-banner-bar-wrapper {
				background-color: {$bg_color};
				color: {$text_color};
			}
			.sbfw-pd-banner-bar-wrapper p svg {
				fill: {$icon_color};
			}
		";

		wp_add_inline_style( 'sbfw-pd-banner-style', $css );
	}

}
