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
		$style_file = spsb_modules_path( 'progressive-discount-banner/assets/css/progressive-discount-banner.css' );

		wp_enqueue_style(
			'spsb-pd-banner-style',
			spsb_modules_url( 'progressive-discount-banner/assets/css/progressive-discount-banner.css' ),
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
		if ( 'sales-booster_page_spsb-settings' === $hook ) {
			$settings_file = require spsb_modules_path( 'progressive-discount-banner/assets/build/settings.asset.php' );

			wp_enqueue_script(
				'spsb-pd-banner-settings',
				spsb_modules_url( 'progressive-discount-banner/assets/build/settings.js' ),
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
		$settings     = spsb_pd_banner_get_settings();
		$bar_position = spsb_find_option_setting( $settings, 'bar_position', 'top' );
		$bg_color     = spsb_find_option_setting( $settings, 'background_color', '#2E5780' );
		$text_color   = spsb_find_option_setting( $settings, 'text_color', '#ffffff' );
		$icon_color   = spsb_find_option_setting( $settings, 'icon_color', '#ffffff' );

		if ( 'bottom' === $bar_position ) {
			$css = '
				.spsb-pd-banner-bar-wrapper {
					top: auto;
					bottom: 0;
				}
			';
		} else {
			$css = '
				body.admin-bar .spsb-pd-banner-bar-wrapper {
					top: 32px;
				}
				body {
					padding-top: 48px;
				}
			';
		}

		$css .= "
			.spsb-pd-banner-bar-wrapper {
				background-color: {$bg_color};
				color: {$text_color};
			}
			.spsb-pd-banner-bar-wrapper p svg {
				fill: {$icon_color};
			}
		";

		wp_add_inline_style( 'spsb-pd-banner-style', $css );
	}

}
