<?php
/**
 * Enqueue_Script class for `Stock Bar` module.
 *
 * @package SBFW
 */

namespace STOREGROWTH\SPSB\Modules\Direct_Checkout;

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
	 * Enqueue CSS and JS for direct checkout.
	 */
	public function wp_enqueue_scripts() {
		wp_enqueue_style(
			'sgsb-button-style',
			sgsb_modules_url( 'direct-checkout/assets/css/sgsb-dc-style.css' ),
			array(),
			filemtime( sgsb_modules_path( 'direct-checkout/assets/css/sgsb-dc-style.css' ) )
		);

		$this->dc_button_inline_styles();

		wp_enqueue_script(
			'sgsb-dc-script',
			sgsb_modules_url( 'direct-checkout/assets/js/sgsb-dc-script.js' ),
			array( 'jquery' ),
			filemtime( sgsb_modules_path( 'direct-checkout/assets/js/sgsb-dc-script.js' ) ),
			true
		);

		$dir_checkout_settings = get_option( 'sgsb_direct_checkout_settings' );
		$checkout_redirect     = sgsb_find_option_setting( $dir_checkout_settings, 'checkout_redirect', 'legacy-checkout' );
		$is_checkout_redirect  = ( $checkout_redirect === 'quick-cart-checkout' );
		wp_localize_script(
			'sgsb-dc-script',
			'sgsbDcFrontend',
			array(
				'isQuickCartCheckout' => $is_checkout_redirect,
				'isPro'               => is_plugin_active(
					'storegrowth-sales-booster-pro/storegrowth-sales-booster-pro.php',
				),
				'ajax_url'            => '/wp-admin/admin-ajax.php',
			)
		);
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

		$settings_file = require sgsb_modules_path( 'direct-checkout/assets/build/settings.asset.php' );

		wp_enqueue_script(
			'sgsb-direct-checkout-settings',
			sgsb_modules_url( 'direct-checkout/assets/build/settings.js' ),
			$settings_file['dependencies'],
			$settings_file['version'],
			false
		);
		$sgsb_active_module_ids  = get_option( 'sgsb_active_module_ids' );
		$is_quick_cart_activated = array_key_exists( 'fly-cart', $sgsb_active_module_ids );
		wp_localize_script(
			'sgsb-direct-checkout-settings',
			'sgsbAdminQuickCartValidate',
			array(
				'isQuickCartActivated' => $is_quick_cart_activated,
			)
		);
	}

		/**
		 * All inline styles
		 */
	private function dc_button_inline_styles() {
		// Get style options.
		$settings             = get_option( 'sgsb_direct_checkout_settings' );
		$button_color         = sgsb_find_option_setting( $settings, 'button_color', '#008dff' );
		$text_color           = sgsb_find_option_setting( $settings, 'text_color', '#ffffff' );
		$font_size            = sgsb_find_option_setting( $settings, 'font_size', '16' );
		$button_border_radius = sgsb_find_option_setting( $settings, 'button_border_radius', '5' );

		$custom_css = "
		.button.product_type_simple.sgsb_buy_now_button, 
		.button.product_type_simple.sgsb_buy_now_button_product_page {
			background-color: {$button_color} !important;
			border-radius: {$button_border_radius}px;
			font-size: {$font_size}px !important;
			color: {$text_color} !important;
			margin-bottom: 10px !important;
		}
	
			";

		wp_add_inline_style( 'sgsb-button-style', $custom_css );
	}
}
