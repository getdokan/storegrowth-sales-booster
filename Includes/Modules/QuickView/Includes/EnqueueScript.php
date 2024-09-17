<?php
/**
 * Enqueue_Script class for `Stock Bar` module.
 *
 * @package SBFW
 */

namespace STOREGROWTH\SPSB\Modules\QuickView\Includes;

use STOREGROWTH\SPSB\Traits\Singleton;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Add styles and scripts files of `Stock Bar` module inside this class.
 */
class EnqueueScript {

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
	 * Enqueue CSS and JS for fly cart.
	 */
	public function wp_enqueue_scripts() {

		$settings            = get_option( 'sgsb_quick_view_settings' );
		$modal_effect        = sgsb_find_option_setting( $settings, 'modal_animation_effect', 'mfp-3d-unfold' );
		$enable_close_button = sgsb_find_option_setting( $settings, 'enable_close_button', true );
		$enable_in_mobile    = sgsb_find_option_setting( $settings, 'enable_in_mobile', true );
		$enable_zoom_box     = sgsb_find_option_setting( $settings, 'enable_zoom_box', false );
		$cart_redirect       = sgsb_find_option_setting( $settings, 'cart_url_redirection', false );
		$fly_cart_open       = sgsb_find_option_setting( $settings, 'auto_open_fly_cart', false );
		// Pass AJAX URL to script.
		wp_localize_script( 'sgsb-quick-view-custom-script', 'ajax_object', array( 'ajax_url' => admin_url( 'admin-ajax.php' ) ) );

		wp_enqueue_script( 'wc-add-to-cart-variation' );
		wp_enqueue_script( 'wc-add-to-cart' );

		// slick.
		wp_enqueue_style(
			'slick',
			sgsb_modules_url( 'QuickView/assets/libs/slick/slick.css' ),
			array(),
			filemtime( sgsb_modules_path( 'QuickView/assets/libs/slick/slick.css' ) )
		);
		wp_enqueue_script(
			'slick',
			sgsb_modules_url( 'QuickView/assets/libs/slick/slick.min.js' ),
			array( 'jquery' ),
			filemtime( sgsb_modules_path( 'QuickView/assets/libs/slick/slick.min.js' ) ),
			true
		);

		wp_enqueue_script(
			'zoom',
			sgsb_modules_url( 'QuickView/assets/libs/zoom/jquery.zoom.min.js' ),
			array( 'jquery' ),
			filemtime( sgsb_modules_path( 'QuickView/assets/libs/zoom/jquery.zoom.min.js' ) ),
			true
		);
			// magnific.
			wp_enqueue_style(
				'magnific-popup',
				sgsb_modules_url( 'QuickView/assets/libs/magnific-popup/magnific-popup.css' ),
				array(),
				filemtime( sgsb_modules_path( 'QuickView/assets/libs/magnific-popup/magnific-popup.css' ) )
			);
			wp_enqueue_script(
				'magnific-popup',
				sgsb_modules_url( 'QuickView/assets/libs/magnific-popup/jquery.magnific-popup.min.js' ),
				array( 'jquery' ),
				filemtime( sgsb_modules_path( 'QuickView/assets/libs/magnific-popup/jquery.magnific-popup.min.js' ) ),
				true
			);

		// feather icons.
		wp_enqueue_style(
			'sgsbqcv-feather',
			sgsb_modules_url( 'QuickView/assets/libs/feather/feather.css' ),
			array(),
			filemtime( sgsb_modules_path( 'QuickView/assets/libs/feather/feather.css' ) )
		);

		// main style & js.
		wp_enqueue_style(
			'sgsbqcv-frontend',
			sgsb_modules_url( 'QuickView/assets/scripts/frontend.css' ),
			array(),
			filemtime( sgsb_modules_path( 'QuickView/assets/scripts/frontend.css' ) )
		);
		wp_enqueue_script(
			'sgsbqcv-frontend',
			sgsb_modules_url( 'QuickView/assets/scripts/frontend.js' ),
			array(
				'jquery',
				'wc-add-to-cart-variation',
			),
			filemtime( sgsb_modules_path( 'QuickView/assets/scripts/frontend.js' ) ),
			true
		);
		wp_localize_script(
			'sgsbqcv-frontend',
			'sgsbqcv_vars',
			array(
				'ajax_url'                => admin_url( 'admin-ajax.php' ),
				'nonce'                   => wp_create_nonce( 'sgsbqcv-security' ),
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
					'sgsbqcv_related_slick_params',
					wp_json_encode(
						apply_filters(
							'sgsbqcv_related_slick_params_arr',
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
					'sgsbqcv_thumbnails_slick_params',
					wp_json_encode(
						apply_filters(
							'sgsbqcv_thumbnails_slick_params_arr',
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
					'sgsbqcv_thumbnails_zoom_params',
					wp_json_encode(
						apply_filters(
							'sgsbqcv_thumbnails_zoom_params_arr',
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

		return apply_filters( 'sgsbqcv_localization_' . $key, $str );
	}

	/**
	 * Add JS scripts to admin.
	 *
	 * @param string $hook Page slug.
	 */
	public function admin_enqueue_scripts( $hook ) {
		if ( 'storegrowth_page_sgsb-settings' !== $hook ) {
			return;
		}

		$settings_file = require sgsb_modules_path( 'QuickView/assets/build/settings.asset.php' );

		wp_enqueue_script(
			'sgsb-quick-view-settings',
			sgsb_modules_url( 'QuickView/assets/build/settings.js' ),
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
		$settings = get_option( 'sgsb_quick_view_settings' );

		$modal_bg_color       = sgsb_find_option_setting( $settings, 'modal_background_color', '#ffffff' );
		$button_color         = sgsb_find_option_setting( $settings, 'button_color', '#000000' );
		$button_text_color    = sgsb_find_option_setting( $settings, 'button_text_color', '#ffffff' );
		$button_border_radius = sgsb_find_option_setting( $settings, 'button_border_radius', 4 );
		$show_image           = sgsb_find_option_setting( $settings, 'show_image', 4 );

		$custom_css = "
			.sgsbqcv-btn {
				border-radius: {$button_border_radius}px !important;
				background-color: {$button_color} !important;
				color: {$button_text_color} !important;
			}
			.sgsbqcv-product > .product .summary {
				background-color: {$modal_bg_color};
		} 
		";
		if ( ! $show_image ) {
			$custom_css .= ' .sgsbqcv-popup.mfp-with-anim .thumbnails{
				display:none;
			}';
		}
		$custom_css = apply_filters( 'sgsb_qcv_inline_styles', $custom_css );
		wp_add_inline_style( 'sgsbqcv-frontend', $custom_css );
	}
}
