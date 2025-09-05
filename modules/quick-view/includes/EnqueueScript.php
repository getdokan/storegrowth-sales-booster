<?php
/**
 * Enqueue_Script class for `Stock Bar` module.
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Modules\QuickView;

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

		$settings            = \StorePulse\StoreGrowth\Helper::get_settings( 'spsg_quick_view_settings' );
		$modal_effect        = \StorePulse\StoreGrowth\Helper::find_option_settings( $settings, 'modal_animation_effect', 'mfp-3d-unfold' );
		$enable_close_button = \StorePulse\StoreGrowth\Helper::find_option_settings( $settings, 'enable_close_button', true );
		$enable_in_mobile    = \StorePulse\StoreGrowth\Helper::find_option_settings( $settings, 'enable_in_mobile', true );
		$enable_zoom_box     = \StorePulse\StoreGrowth\Helper::find_option_settings( $settings, 'enable_zoom_box', false );
		$cart_redirect       = \StorePulse\StoreGrowth\Helper::find_option_settings( $settings, 'cart_url_redirection', false );
		$fly_cart_open       = \StorePulse\StoreGrowth\Helper::find_option_settings( $settings, 'auto_open_fly_cart', false );
		// Pass AJAX URL to script.
		wp_localize_script( 'spsg-quick-view-custom-script', 'ajax_object', array( 'ajax_url' => admin_url( 'admin-ajax.php' ) ) );

		wp_enqueue_script( 'wc-add-to-cart-variation' );
		wp_enqueue_script( 'wc-add-to-cart' );

		// slick.
		wp_enqueue_style(
			'slick',
			PluginHelper::get_modules_url( 'quick-view/assets/libs/slick/slick.css' ),
			array(),
			filemtime( PluginHelper::get_modules_path( 'quick-view/assets/libs/slick/slick.css' ) )
		);
		wp_enqueue_script(
			'slick',
			PluginHelper::get_modules_url( 'quick-view/assets/libs/slick/slick.min.js' ),
			array( 'jquery' ),
			filemtime( PluginHelper::get_modules_path( 'quick-view/assets/libs/slick/slick.min.js' ) ),
			true
		);

		wp_enqueue_script(
			'zoom',
			PluginHelper::get_modules_url( 'quick-view/assets/libs/zoom/jquery.zoom.min.js' ),
			array( 'jquery' ),
			filemtime( PluginHelper::get_modules_path( 'quick-view/assets/libs/zoom/jquery.zoom.min.js' ) ),
			true
		);
			// magnific.
			wp_enqueue_style(
				'magnific-popup',
				PluginHelper::get_modules_url( 'quick-view/assets/libs/magnific-popup/magnific-popup.css' ),
				array(),
				filemtime( PluginHelper::get_modules_path( 'quick-view/assets/libs/magnific-popup/magnific-popup.css' ) )
			);
			wp_enqueue_script(
				'magnific-popup',
				PluginHelper::get_modules_url( 'quick-view/assets/libs/magnific-popup/jquery.magnific-popup.min.js' ),
				array( 'jquery' ),
				filemtime( PluginHelper::get_modules_path( 'quick-view/assets/libs/magnific-popup/jquery.magnific-popup.min.js' ) ),
				true
			);

		// feather icons.
		wp_enqueue_style(
			'spsgqcv-feather',
			PluginHelper::get_modules_url( 'quick-view/assets/libs/feather/feather.css' ),
			array(),
			filemtime( PluginHelper::get_modules_path( 'quick-view/assets/libs/feather/feather.css' ) )
		);

		// main style & js.
		wp_enqueue_style(
			'spsgqcv-frontend',
			PluginHelper::get_modules_url( 'quick-view/assets/scripts/frontend.css' ),
			array(),
			filemtime( PluginHelper::get_modules_path( 'quick-view/assets/scripts/frontend.css' ) )
		);
		wp_enqueue_script(
			'spsgqcv-frontend',
			PluginHelper::get_modules_url( 'quick-view/assets/scripts/frontend.js' ),
			array(
				'jquery',
				'wc-add-to-cart-variation',
			),
			filemtime( PluginHelper::get_modules_path( 'quick-view/assets/scripts/frontend.js' ) ),
			true
		);
		wp_localize_script(
			'spsgqcv-frontend',
			'spsgqcv_vars',
			array(
				'ajax_url'                => admin_url( 'admin-ajax.php' ),
				'nonce'                   => wp_create_nonce( 'spsgqcv-security' ),
				'effect'                  => $modal_effect,
				'enable_close_button'     => $enable_close_button,
				'enable_in_mobile'        => $enable_in_mobile,
				'hashchange'              => 'yes',
				'cart_redirect'           => $cart_redirect,
				'fly_cart_auto_open'      => $fly_cart_open,
				'cart_url'                => apply_filters( 'woocommerce_add_to_cart_redirect', wc_get_cart_url(), null ),
				'failed_to_add'           => __( 'Failed to add the product to the cart.', 'storegrowth-sales-booster' ),
				'close'                   => self::localization( 'close', esc_html__( 'Close (Esc)', 'storegrowth-sales-booster' ) ),
				'next_prev'               => 'yes',
				'next'                    => self::localization( 'next', esc_html__( 'Next (Right arrow key)', 'storegrowth-sales-booster' ) ),
				'prev'                    => self::localization( 'prev', esc_html__( 'Previous (Left arrow key)', 'storegrowth-sales-booster' ) ),
				'thumbnails_effect'       => $enable_zoom_box,
				'related_slick_params'    => apply_filters(
					'spsgqcv_related_slick_params',
					wp_json_encode(
						apply_filters(
							'spsgqcv_related_slick_params_arr',
							array(
								'slidesToShow'   => 2,
								'slidesToScroll' => 2,
								'dots'           => true,
								'arrows'         => false,
								'adaptiveHeight' => true,
								'rtl'            => is_rtl(),
							)
						)
					)
				),
				'thumbnails_slick_params' => apply_filters(
					'spsgqcv_thumbnails_slick_params',
					wp_json_encode(
						apply_filters(
							'spsgqcv_thumbnails_slick_params_arr',
							array(
								'slidesToShow'   => 1,
								'slidesToScroll' => 1,
								'dots'           => true,
								'arrows'         => true,
								'adaptiveHeight' => false,
								'rtl'            => is_rtl(),
							)
						)
					)
				),
				'thumbnails_zoom_params'  => apply_filters(
					'spsgqcv_thumbnails_zoom_params',
					wp_json_encode(
						apply_filters(
							'spsgqcv_thumbnails_zoom_params_arr',
							array(
								'duration' => 120,
								'magnify'  => 1,
							)
						)
					)
				),
				'quick_view'              => isset( $_REQUEST['quick-view'] ) ? absint( sanitize_key( $_REQUEST['quick-view'] ) ) : 0,
			)
		);

		$this->inline_styles();
	}

	/**
	 * Localization.
	 *
	 * @param string $key key.
	 * @param string $defaul .
	 */
	public static function localization( $key = '', $defaul = '' ) {
		$str = '';

		if ( ! empty( $key ) && ! empty( self::$localization[ $key ] ) ) {
			$str = self::$localization[ $key ]; // phpcs: ignore.
		} elseif ( ! empty( $defaul ) ) {
			$str = $defaul;
		}

		return apply_filters( 'spsgqcv_localization_' . $key, $str );
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

		$settings_file = require PluginHelper::get_modules_path( 'quick-view/assets/build/settings.asset.php' );

		wp_enqueue_script(
			'spsg-quick-view-settings',
			PluginHelper::get_modules_url( 'quick-view/assets/build/settings.js' ),
			$settings_file['dependencies'],
			$settings_file['version'],
			false
		);
	}

	/**
	 * All inline styles
	 */
	private function inline_styles() {
		// Get settings options.
		$settings = \StorePulse\StoreGrowth\Helper::get_settings( 'spsg_quick_view_settings' );

		$modal_bg_color       = \StorePulse\StoreGrowth\Helper::find_option_settings( $settings, 'modal_background_color', '#ffffff' );
		$button_color         = \StorePulse\StoreGrowth\Helper::find_option_settings( $settings, 'button_color', '#0875FF' );
		$button_text_color    = \StorePulse\StoreGrowth\Helper::find_option_settings( $settings, 'button_text_color', '#ffffff' );
		$button_border_radius = \StorePulse\StoreGrowth\Helper::find_option_settings( $settings, 'button_border_radius', 4 );
		$show_image           = \StorePulse\StoreGrowth\Helper::find_option_settings( $settings, 'show_image', 4 );

		$custom_css = "
			.spsgqcv-btn {
				border-radius: {$button_border_radius}px !important;
				background-color: {$button_color} !important;
				color: {$button_text_color} !important;
			}
			.spsgqcv-product > .product .summary {
				background-color: {$modal_bg_color};
		} 
		";
		if ( ! $show_image ) {
			$custom_css .= ' .spsgqcv-popup.mfp-with-anim .thumbnails{
				display:none;
			}';
		}
		$custom_css = apply_filters( 'spsg_qcv_inline_styles', $custom_css );
		wp_add_inline_style( 'spsgqcv-frontend', $custom_css );
	}
}
