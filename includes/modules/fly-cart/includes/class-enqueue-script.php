<?php
/**
 * Enqueue_Script class for Fly cart.
 *
 * @package SBFW
 */

namespace STOREGROWTH\SPSB\Modules\Fly_Cart;

use STOREGROWTH\SPSB\Traits\Singleton;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Add styles and scripts files of `Fly Cart` modules inside this class.
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
	 *
	 * Enqueue CSS and JS for fly cart.
	 */
	public function wp_enqueue_scripts() {
		if ( is_checkout() || is_cart() ) {
			return;
		}

		wp_enqueue_style(
			'flaticon',
			storepulse_sales_booster_modules_url( 'fly-cart/assets/font/flaticon.css' ),
			array(),
			filemtime( storepulse_sales_booster_modules_path( 'fly-cart/assets/font/flaticon.css' ) )
		);

		wp_enqueue_style(
			'storepulse_sales_booster-ffc-style',
			storepulse_sales_booster_modules_url( 'fly-cart/assets/css/wfc-style.css' ),
			array(),
			filemtime( storepulse_sales_booster_modules_path( 'fly-cart/assets/css/wfc-style.css' ) )
		);

		wp_enqueue_script(
			'wfc-flyto',
			storepulse_sales_booster_modules_url( 'fly-cart/assets/js/flyto.js' ),
			array( 'jquery', 'jquery-effects-shake' ),
			filemtime( storepulse_sales_booster_modules_path( 'fly-cart/assets/js/flyto.js' ) ),
			true
		);

		$this->frontend_widget_script();

		$this->inline_styles();

		/**
		 * Fast fly cart module wp_enqueue_scripts.
		 *
		 * @since 1.0.0
		 */
		do_action( 'storepulse_sales_booster_ffc_wp_enqueue_scripts' );
	}

	/**
	 * Add JS scripts to admin.
	 *
	 * @param string $hook Page slug.
	 */
	public function admin_enqueue_scripts( $hook ) {
		if ( 'sales-booster_page_storepulse_sales_booster-settings' === $hook ) {
			// Add the color picker css file.
			wp_enqueue_style( 'wp-color-picker' );

			$settings_file = require storepulse_sales_booster_modules_path( 'fly-cart/assets/build/settings.asset.php' );

			// Extra dependencies.
			$settings_file['dependencies'][] = 'wp-color-picker';

			wp_enqueue_script(
				'storepulse_sales_booster-fly-cart-settings',
				storepulse_sales_booster_modules_url( 'fly-cart/assets/build/settings.js' ),
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
		$settings        = get_option( 'storepulse_sales_booster_fly_cart_settings' );
		$wfc_color       = storepulse_sales_booster_find_option_setting( $settings, 'icon_color', '#2ecc71' );
		$wfc_btn_bgcolor = storepulse_sales_booster_find_option_setting( $settings, 'buttons_bg_color', '#2ecc71' );
		$widget_bg_color = storepulse_sales_booster_find_option_setting( $settings, 'widget_bg_color', '#fff' );

		$custom_css = "
			.wfc-cart-icon .wfc-icon {
				color: {$wfc_color};
			}
			.wfc-cart-icon .wfc-cart-countlocation {
				background-color: {$wfc_color};
			}
			.wfc-widget-sidebar {
				background-color: {$widget_bg_color};
			}
			.storepulse_sales_booster-cart-widget-buttons a {
				background-color: {$wfc_btn_bgcolor};
				border-color: {$wfc_btn_bgcolor};
			}
			.storepulse_sales_booster-cart-widget-buttons a.storepulse_sales_booster-cart-widget-shooping-button {
				color: {$wfc_btn_bgcolor};
				background-color: {$widget_bg_color};
			}
		";

		wp_add_inline_style( 'storepulse_sales_booster-ffc-style', $custom_css );
	}

	/**
	 * Enqueue frontend JS
	 */
	private function frontend_widget_script() {
		wp_enqueue_script(
			'wfc-script',
			storepulse_sales_booster_modules_url( 'fly-cart/assets/js/wfc-script.js' ),
			array( 'jquery' ),
			filemtime( storepulse_sales_booster_modules_path( 'fly-cart/assets/js/wfc-script.js' ) ),
			true
		);

		wp_localize_script(
			'wfc-script',
			'storepulse_sales_boosterFrontend',
			array(
				'ajaxUrl' => admin_url( 'admin-ajax.php' ),
				'nonce'   => wp_create_nonce( 'storepulse_sales_booster_frontend_ajax' ),
			)
		);
	}
}
