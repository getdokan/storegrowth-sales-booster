<?php
/**
 * Enqueue_Script class for Progressive Discount Banner.
 *
 * @package SBFW
 */

namespace STOREPULSE\SPSB\Modules\PD_Banner;

use STOREPULSE\SPSB\Traits\Singleton;

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
		$style_file = storepulse_sales_booster_modules_path( 'progressive-discount-banner/assets/css/progressive-discount-banner.css' );

		wp_enqueue_style(
			'storepulse_sales_booster-pd-banner-style',
			storepulse_sales_booster_modules_url( 'progressive-discount-banner/assets/css/progressive-discount-banner.css' ),
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
		if ( 'sales-booster_page_storepulse_sales_booster-settings' === $hook ) {
			$settings_file = require storepulse_sales_booster_modules_path( 'progressive-discount-banner/assets/build/settings.asset.php' );

			wp_enqueue_script(
				'storepulse_sales_booster-pd-banner-settings',
				storepulse_sales_booster_modules_url( 'progressive-discount-banner/assets/build/settings.js' ),
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
		$settings     = storepulse_sales_booster_pd_banner_get_settings();
		$bar_position = storepulse_sales_booster_find_option_setting( $settings, 'bar_position', 'top' );
		$bg_color     = storepulse_sales_booster_find_option_setting( $settings, 'background_color', '#2E5780' );
		$text_color   = storepulse_sales_booster_find_option_setting( $settings, 'text_color', '#ffffff' );
		$icon_color   = storepulse_sales_booster_find_option_setting( $settings, 'icon_color', '#ffffff' );

		if ( 'bottom' === $bar_position ) {
			$css = '
				.storepulse_sales_booster-pd-banner-bar-wrapper {
					top: auto;
					bottom: 0;
				}
			';
		} else {
			$css = '
				body.admin-bar .storepulse_sales_booster-pd-banner-bar-wrapper {
					top: 32px;
				}
				body {
					padding-top: 48px;
				}
			';
		}

		$css .= "
			.storepulse_sales_booster-pd-banner-bar-wrapper {
				background-color: {$bg_color};
				color: {$text_color};
			}
			.storepulse_sales_booster-pd-banner-bar-wrapper p svg {
				fill: {$icon_color};
			}
		";

		wp_add_inline_style( 'storepulse_sales_booster-pd-banner-style', $css );
	}

}
