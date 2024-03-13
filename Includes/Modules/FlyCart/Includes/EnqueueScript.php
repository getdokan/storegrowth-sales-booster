<?php
/**
 * Enqueue_Script class for Fly cart.
 *
 * @package SBFW
 */

namespace STOREGROWTH\SPSB\Modules\FlyCart\Includes;

use STOREGROWTH\SPSB\Traits\Singleton;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Add styles and scripts files of `Fly Cart` Modules inside this class.
 */
class EnqueueScript {

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
		$settings = get_option( 'sgsb_fly_cart_settings' );
		$layout   = sgsb_find_option_setting( $settings, 'layout', 'side' );
		if ( is_checkout() || is_cart() ) {
			return;
		}

		wp_enqueue_style(
			'flaticon',
			sgsb_modules_url( 'FlyCart/assets/font/flaticon.css' ),
			array(),
			filemtime( sgsb_modules_path( 'FlyCart/assets/font/flaticon.css' ) )
		);

		wp_enqueue_style(
			'sgsb-ffc-style',
			sgsb_modules_url( 'FlyCart/assets/css/wfc-style.css' ),
			array(),
			filemtime( sgsb_modules_path( 'FlyCart/assets/css/wfc-style.css' ) )
		);

		wp_enqueue_script(
			'wfc-flyto',
			sgsb_modules_url( 'FlyCart/assets/js/flyto.js' ),
			array( 'jquery', 'jquery-effects-shake' ),
			filemtime( sgsb_modules_path( 'FlyCart/assets/js/flyto.js' ) ),
			true
		);

		$this->frontend_widget_script();
		$this->qc_basic_inline_styles();

		if ( 'center' === $layout && SGSB_PRO_ACTIVE ) {
				do_action( 'sgsb_ffc_wp_enqueue_scripts' );
		} else {
				$this->qc_side_cart_styles();
		}

		/**
		 * Fast fly cart module wp_enqueue_scripts.
		 *
		 * @since 1.0.0
		 */
	}

	/**
	 * Add JS scripts to admin.
	 *
	 * @param string $hook Page slug.
	 */
	public function admin_enqueue_scripts( $hook ) {
		if ( 'storegrowth_page_sgsb-settings' === $hook ) {
			// Add the color picker css file.
			wp_enqueue_style( 'wp-color-picker' );

			$settings_file = require sgsb_modules_path( 'FlyCart/assets/build/settings.asset.php' );

			// Extra dependencies.
			$settings_file['dependencies'][] = 'wp-color-picker';

			wp_enqueue_script(
				'sgsb-fly-cart-settings',
				sgsb_modules_url( 'FlyCart/assets/build/settings.js' ),
				$settings_file['dependencies'],
				$settings_file['version'],
				false
			);
		}
	}

	/**
	 * All inline styles
	 */
	private function qc_basic_inline_styles() {
		// Get style options.
		$settings              = get_option( 'sgsb_fly_cart_settings' );
		$wfc_color             = sgsb_find_option_setting( $settings, 'icon_color', '#fff' );
		$widget_bg_color       = sgsb_find_option_setting( $settings, 'widget_bg_color', '#fff' );
		$product_card_bg_color = sgsb_find_option_setting( $settings, 'product_card_bg_color', '#fff' );
		$wfc_btn_bgcolor       = sgsb_find_option_setting( $settings, 'buttons_bg_color', '#0875FF' );
		$shop_btn_bgcolor      = sgsb_find_option_setting( $settings, 'shopping_button_bg_color', '#073B4C' );

		$custom_css = "
			.wfc-cart-icon .wfc-icon {
				color: {$wfc_color};
			}
			.wfc-cart-icon .wfc-cart-countlocation {
				background-color: {$wfc_color};
				color: {$wfc_btn_bgcolor};
			}
			.wfc-widget-sidebar {
				background-color: {$widget_bg_color};
			}
			.sgsb-cart-widget-buttons a {
				background-color: {$wfc_btn_bgcolor};
				border-color: {$wfc_btn_bgcolor};
			}
			.sgsb-cart-widget-buttons .sgsb-cart-widget-shooping-button {
				background-color: {$shop_btn_bgcolor};
			}
			.sgsb-widget-shopping-cart-content .sgsb-woocommerce-cart-form .sgsb-fly-cart-table tr.woocommerce-cart-form__cart-item.cart_item {
				background-color: {$product_card_bg_color};
			}
			.wfc-widget-sidebar .promocode-form button.sgsb-apply-coupon {
                background: {$wfc_btn_bgcolor} !important;
            }
		";

		wp_add_inline_style( 'sgsb-ffc-style', $custom_css );
	}

	/**
	 * Fly Cart Side cart design
	 *
	 * @return void
	 */
	private function qc_side_cart_styles() {

		$custom_css = '
            .wfc-widget-sidebar {
                top: 0;
                right: 0;
            }
            .sgsb-widget-shopping-cart-content-wrapper{
                width:460px;
            }
        ';

		wp_add_inline_style( 'sgsb-ffc-style', $custom_css );
	}

	/**
	 * Enqueue frontend JS
	 */
	private function frontend_widget_script() {
		// Get checkout redirection data.
		$qcart_settings           = get_option( 'sgsb_fly_cart_settings' );
		$dir_checkout_settings    = get_option( 'sgsb_direct_checkout_settings' );
		$cart_layout_type         = sgsb_find_option_setting( $qcart_settings, 'layout', 'side' );
		$is_add_to_qcart_redirect = sgsb_find_option_setting( $qcart_settings, 'enable_add_to_cart_redirect', true );
		$checkout_redirect        = sgsb_find_option_setting( $dir_checkout_settings, 'checkout_redirect', 'legacy-checkout' );

		$is_checkout_redirect = ( 'quick-cart-checkout' === $checkout_redirect );

		wp_enqueue_script(
			'wfc-script',
			sgsb_modules_url( 'FlyCart/assets/js/wfc-script.js' ),
			array( 'jquery' ),
			filemtime( sgsb_modules_path( 'FlyCart/assets/js/wfc-script.js' ) ),
			true
		);

		wp_localize_script(
			'wfc-script',
			'sgsbFrontend',
			array(
				'checkoutRedirect'  => $is_checkout_redirect,
				'quickCartRedirect' => $is_add_to_qcart_redirect,
				'cartLayoutType'    => $cart_layout_type,
				'checkoutUrl'       => wc_get_checkout_url(),
				'ajaxUrl'           => admin_url( 'admin-ajax.php' ),
				'nonce'             => wp_create_nonce( 'sgsb_frontend_ajax' ),
				'isPro'             => is_plugin_active( 'storegrowth-sales-booster-pro/storegrowth-sales-booster-pro.php' ),
			)
		);
	}
}
