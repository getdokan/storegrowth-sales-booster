<?php
/**
 * Enqueue_Script class for `Stock Bar` module.
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Modules\DirectCheckout;

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
	 * Enqueue CSS and JS for direct checkout.
	 */
	public function wp_enqueue_scripts() {
		wp_enqueue_style(
			'spsg-button-style',
			PluginHelper::get_modules_url( 'direct-checkout/assets/css/spsg-dc-style.css' ),
			array(),
			filemtime( PluginHelper::get_modules_path( 'direct-checkout/assets/css/spsg-dc-style.css' ) )
		);

		$this->dc_button_inline_styles();

		wp_enqueue_script(
			'spsg-dc-script',
			PluginHelper::get_modules_url( 'direct-checkout/assets/js/spsg-dc-script.js' ),
			array( 'jquery' ),
			filemtime( PluginHelper::get_modules_path( 'direct-checkout/assets/js/spsg-dc-script.js' ) ),
			true
		);

		$dir_checkout_settings = \StorePulse\StoreGrowth\Helper::get_settings( 'spsg_direct_checkout_settings' );
		$checkout_redirect     = \StorePulse\StoreGrowth\Helper::find_option_settings( $dir_checkout_settings, 'checkout_redirect', 'legacy-checkout' );
		$is_checkout_redirect  = ( 'quick-cart-checkout' === $checkout_redirect );
		wp_localize_script(
			'spsg-dc-script',
			'spsgDcFrontend',
			array(
				'isQuickCartCheckout' => $is_checkout_redirect,
				'isPro'               => sp_store_growth()->has_pro(),
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
		if ( 'storegrowth_page_spsg-settings' !== $hook ) {
			return;
		}

		$settings_file = require PluginHelper::get_modules_path( 'direct-checkout/assets/build/settings.asset.php' );

		wp_enqueue_script(
			'spsg-direct-checkout-settings',
			PluginHelper::get_modules_url( 'direct-checkout/assets/build/settings.js' ),
			$settings_file['dependencies'],
			$settings_file['version'],
			false
		);
		$modules        = storegrowth_get_container()->get( \StorePulse\StoreGrowth\ModuleManager::class );
		$is_quick_cart_activated = ! $modules->is_active_module('fly-cart');
		wp_localize_script(
			'spsg-direct-checkout-settings',
			'spsgAdminQuickCartValidate',
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
		$settings             = \StorePulse\StoreGrowth\Helper::get_settings( 'spsg_direct_checkout_settings' );
		$button_style         = \StorePulse\StoreGrowth\Helper::find_option_settings( $settings, 'button_style', true );
        if ( ! $button_style ) {
            return;
        }
		$button_color         = \StorePulse\StoreGrowth\Helper::find_option_settings( $settings, 'button_color', '#008dff' );
		$text_color           = \StorePulse\StoreGrowth\Helper::find_option_settings( $settings, 'text_color', '#ffffff' );
		$font_size            = \StorePulse\StoreGrowth\Helper::find_option_settings( $settings, 'font_size', '16' );
		$button_border_radius = \StorePulse\StoreGrowth\Helper::find_option_settings( $settings, 'button_border_radius', '5' );

		$theme                 = wp_get_theme();
		$is_avada_theme        = ! empty( $theme->name ) ? $theme->name === 'Avada' : false;
		$is_ocean_wp_theme     = ! empty( $theme->name ) ? $theme->name === 'OceanWP' : false;
		$is_elementor_theme    = ! empty( $theme->name ) ? $theme->name === 'Hello Elementor' : false;
		$is_twenty_one_theme   = ! empty( $theme->name ) ? $theme->name === 'Twenty Twenty-One' : false;
		$is_twenty_two_theme   = ! empty( $theme->name ) ? $theme->name === 'Twenty Twenty-Two' : false;
		$is_twenty_three_theme = ! empty( $theme->name ) ? $theme->name === 'Twenty Twenty-Three' : false;
		$is_twenty_four_theme  = ! empty( $theme->name ) ? $theme->name === 'Twenty Twenty-Four' : false;
		$button_margin         = $is_ocean_wp_theme ? '20px 0 0' : '0 0 10px 10px';
		$custom_css            = "
		.button.product_type_simple.spsg_buy_now_button, 
		.button.product_type_simple.spsg_buy_now_button_product_page {
			background-color: {$button_color} !important;
			border-radius: {$button_border_radius}px;
			font-size: {$font_size}px !important;
			color: {$text_color} !important;
			margin: {$button_margin};
		} ";

		if ( $is_avada_theme ) {
			$custom_css .= '
			.products .product-buttons-container {
			    display: flex;
                flex-wrap: wrap;
                align-items: center;
			}
			.product_type_simple.add_to_cart_button {
			    order: 1;
			}
            .button.product_type_simple.spsg_buy_now_button {
                order: 3;
                padding: 10px 20px;
                margin: 12px 0 0 0 !important;
            }
            .button.product_type_simple.spsg_buy_now_button::before {
                content: "";
            }
            .show_details_button {
                order: 2;
                margin-left: auto;
            }
            ';
		}

		if ( $is_elementor_theme ) {
			$custom_css .= '
                .spsg-fly-cart-table .product-remove a {
                    margin-right: 0 !important;
                }
            ';
		}

		if ( $is_twenty_four_theme ) {
			$custom_css .= '
                .button.spsg_buy_now_button {
                    display: block;
                    padding-left: 1rem;
                    padding-top: 0.6rem;
                    padding-right: 1rem;
                    padding-bottom: 0.6rem;
                    margin: 0 auto !important;
                }
                .button.spsg_buy_now_button_product_page {
                    float: none !important;
                }
            ';
		}

		if ( $is_twenty_one_theme ) {
			$custom_css .= '
                .button.spsg_buy_now_button {
                    margin: 16px 0 0 0 !important;
                }
            ';
		}
		if ( $is_twenty_two_theme || $is_twenty_three_theme ) {
			$custom_css .= '
                .button.product_type_simple.spsg_buy_now_button {
										display:block;
                    margin: auto;
                }
            ';
		}

		wp_add_inline_style(
            'spsg-button-style',
            apply_filters(
                'spsg_direct_checkout_button_inline_styles',
                $custom_css,
                $settings
            )
        );
	}
}
