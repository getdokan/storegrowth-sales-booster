<?php
/**
 * Enqueue_Script class for Fly cart.
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Modules\FlyCart;

use StorePulse\StoreGrowth\Interfaces\HookRegistry;
use StorePulse\StoreGrowth\Traits\Singleton;
use StorePulse\StoreGrowth\Helper as PluginHelper;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Add styles and scripts files of `Countdown Timer` module inside this class.
 */
class EnqueueScript implements HookRegistry {
	use Singleton;

	/**
	 * Register Hooks.
	 *
	 * @since 2.0.0
	 *
	 * @return void
	 */
	public function register_hooks(): void {
		add_action( 'wp_enqueue_scripts', array( $this, 'wp_enqueue_scripts' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'admin_enqueue_scripts' ) );
	}

	/**
	 * Add JS scripts to frontend.
	 *
	 * Enqueue CSS and JS for fly cart.
	 */
	public function wp_enqueue_scripts() {
		$settings = \StorePulse\StoreGrowth\Helper::get_settings( 'spsg_fly_cart_settings' );
		$layout   = \StorePulse\StoreGrowth\Helper::find_option_settings( $settings, 'layout', 'side' );
		if ( is_checkout() || is_cart() ) {
			return;
		}

		wp_enqueue_style(
			'flaticon',
			PluginHelper::get_modules_url( 'fly-cart/assets/font/flaticon.css' ),
			array(),
			filemtime( PluginHelper::get_modules_path( 'fly-cart/assets/font/flaticon.css' ) )
		);

		wp_enqueue_style(
			'spsg-ffc-style',
			PluginHelper::get_modules_url( 'fly-cart/assets/css/wfc-style.css' ),
			array(),
			filemtime( PluginHelper::get_modules_path( 'fly-cart/assets/css/wfc-style.css' ) )
		);

		wp_enqueue_script(
			'wfc-flyto',
			PluginHelper::get_modules_url( 'fly-cart/assets/js/flyto.js' ),
			array( 'jquery', 'jquery-effects-shake' ),
			filemtime( PluginHelper::get_modules_path( 'fly-cart/assets/js/flyto.js' ) ),
			true
		);

		$this->frontend_widget_script();
		$this->qc_basic_inline_styles();

		if ( 'center' === $layout && sp_store_growth()->has_pro() ) {
				do_action( 'spsg_ffc_wp_enqueue_scripts' );
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
		if ( 'storegrowth_page_spsg-settings' === $hook ) {
			// Add the color picker css file.
			wp_enqueue_style( 'wp-color-picker' );

			$settings_file = require PluginHelper::get_modules_path( 'fly-cart/assets/build/settings.asset.php' );

			// Extra dependencies.
			$settings_file['dependencies'][] = 'wp-color-picker';

			wp_enqueue_script(
				'spsg-fly-cart-settings',
				PluginHelper::get_modules_url( 'fly-cart/assets/build/settings.js' ),
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
		$settings              = \StorePulse\StoreGrowth\Helper::get_settings( 'spsg_fly_cart_settings' );
		$wfc_color             = \StorePulse\StoreGrowth\Helper::find_option_settings( $settings, 'icon_color', '#fff' );
		$widget_bg_color       = \StorePulse\StoreGrowth\Helper::find_option_settings( $settings, 'widget_bg_color', '#fff' );
		$product_card_bg_color = \StorePulse\StoreGrowth\Helper::find_option_settings( $settings, 'product_card_bg_color', '#fff' );
		$wfc_btn_bgcolor       = \StorePulse\StoreGrowth\Helper::find_option_settings( $settings, 'buttons_bg_color', '#0875FF' );
		$shop_btn_bgcolor      = \StorePulse\StoreGrowth\Helper::find_option_settings( $settings, 'shopping_button_bg_color', '#073B4C' );

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
			.spsg-cart-widget-buttons a {
				background-color: {$wfc_btn_bgcolor};
				border-color: {$wfc_btn_bgcolor};
			}
			.spsg-cart-widget-buttons .spsg-cart-widget-shooping-button {
				background-color: {$shop_btn_bgcolor};
			}
			.spsg-widget-shopping-cart-content .spsg-woocommerce-cart-form .spsg-fly-cart-table tr.woocommerce-cart-form__cart-item.cart_item {
				background-color: {$product_card_bg_color};
			}
			.wfc-widget-sidebar .promocode-form button.spsg-apply-coupon {
                background: {$wfc_btn_bgcolor} !important;
            }
		";

		wp_add_inline_style( 'spsg-ffc-style', $custom_css );
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
            .spsg-widget-shopping-cart-content-wrapper{
                width:460px;
            }
        ';

		wp_add_inline_style( 'spsg-ffc-style', $custom_css );
	}

	/**
	 * Enqueue frontend JS
	 */
	private function frontend_widget_script() {
		// Get checkout redirection data.
		$qcart_settings           = \StorePulse\StoreGrowth\Helper::get_settings( 'spsg_fly_cart_settings' );
		$dir_checkout_settings    = \StorePulse\StoreGrowth\Helper::get_settings( 'spsg_direct_checkout_settings' );
		$cart_layout_type         = \StorePulse\StoreGrowth\Helper::find_option_settings( $qcart_settings, 'layout', 'side' );
		$is_add_to_qcart_redirect = \StorePulse\StoreGrowth\Helper::find_option_settings( $qcart_settings, 'enable_add_to_cart_redirect', true );
		$checkout_redirect        = \StorePulse\StoreGrowth\Helper::find_option_settings( $dir_checkout_settings, 'checkout_redirect', 'legacy-checkout' );

		$is_checkout_redirect = ( 'quick-cart-checkout' === $checkout_redirect );

		wp_enqueue_script(
			'wfc-script',
			PluginHelper::get_modules_url( 'fly-cart/assets/js/wfc-script.js' ),
			array( 'jquery', 'wfc-flyto' ),
			filemtime( PluginHelper::get_modules_path( 'fly-cart/assets/js/wfc-script.js' ) ),
			true
		);

		wp_localize_script(
			'wfc-script',
			'spsgFrontend',
			array(
				'checkoutRedirect'  => $is_checkout_redirect,
				'quickCartRedirect' => $is_add_to_qcart_redirect,
				'cartLayoutType'    => $cart_layout_type,
				'checkoutUrl'       => wc_get_checkout_url(),
				'ajaxUrl'           => admin_url( 'admin-ajax.php' ),
				'nonce'             => wp_create_nonce( 'spsg_frontend_ajax' ),
				'isPro'             => sp_store_growth()->has_pro(),
			)
		);
	}
}
