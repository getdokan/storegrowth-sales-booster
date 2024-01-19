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

		wp_enqueue_style( 'bootstrap', 'https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css', array(), '4.3.1' );
		wp_enqueue_script( 'bootstrap', 'https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js', array( 'jquery' ), '4.3.1', true );

		wp_enqueue_style(
			'sgsb-quick-view-custom-style',
			sgsb_modules_url( 'QuickView/assets/scripts/sgsb-quick-view-style.css' ),
			array(),
			filemtime( sgsb_modules_path( 'QuickView/assets/scripts/sgsb-quick-view-style.css' ) )
		);

		// Pass AJAX URL to script
		wp_localize_script( 'sgsb-quick-view-custom-script', 'ajax_object', array( 'ajax_url' => admin_url( 'admin-ajax.php' ) ) );

		wp_enqueue_script( 'wc-add-to-cart-variation' );

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

					// fancybox
		// if ( self::get_setting( 'content_image_lightbox', 'no' ) === 'yes' ) {
		// wp_enqueue_style( 'fancybox', WOOSQ_URI . 'assets/libs/fancybox/jquery.fancybox.min.css' );
		// wp_enqueue_script( 'fancybox', WOOSQ_URI . 'assets/libs/fancybox/jquery.fancybox.min.js', array( 'jquery' ), WOOSQ_VERSION, true );
		// }

					// zoom
		// if ( self::get_setting( 'content_image_lightbox', 'no' ) === 'zoom' ) {
		// wp_enqueue_script( 'zoom', WOOSQ_URI . 'assets/libs/zoom/jquery.zoom.min.js', array( 'jquery' ), WOOSQ_VERSION, true );
		// }

					// perfect srollbar
		// if ( self::get_setting( 'perfect_scrollbar', 'yes' ) === 'yes' ) {
		// wp_enqueue_style( 'perfect-scrollbar', WOOSQ_URI . 'assets/libs/perfect-scrollbar/css/perfect-scrollbar.min.css' );
		// wp_enqueue_style( 'perfect-scrollbar-wpc', WOOSQ_URI . 'assets/libs/perfect-scrollbar/css/custom-theme.css' );
		// wp_enqueue_script( 'perfect-scrollbar', WOOSQ_URI . 'assets/libs/perfect-scrollbar/js/perfect-scrollbar.jquery.min.js', array( 'jquery' ), WOOSQ_VERSION, true );
		// }

			// magnific
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

		// feather icons
		wp_enqueue_style(
			'sgsbqcv-feather',
			sgsb_modules_url( 'QuickView/assets/libs/feather/feather.css' ),
			array(),
			filemtime( sgsb_modules_path( 'QuickView/assets/libs/feather/feather.css' ) )
		);

		// if ( self::get_setting( 'button_icon', 'no' ) !== 'no' ) {
		// wp_enqueue_style( 'woosq-icons', WOOSQ_URI . 'assets/css/icons.css', array(), WOOSQ_VERSION );
		// }

		// main style & js
		wp_enqueue_style(
			'sgsbqcv-frontend',
			sgsb_modules_url( 'QuickView/assets/scripts/frontend.css' ),
			array(),
			filemtime( sgsb_modules_path( 'QuickView/assets/scripts/frontend.css' ) )
		);
		wp_enqueue_script(
			'sgsbqcv-frontend',
			sgsb_modules_url( 'QuickView/assets/scripts/quick-view.js' ),
			array(
				'jquery',
				'wc-add-to-cart-variation',
			),
			filemtime( sgsb_modules_path( 'QuickView/assets/scripts/quick-view.js' ) ),
			true
		);
					wp_localize_script(
						'sgsbqcv-frontend',
						'sgsbqcv_vars',
						array(
							'ajax_url'                => admin_url( 'admin-ajax.php' ),
							'nonce'                   => wp_create_nonce( 'woosq-security' ),
							'view'                    => 'popup',
							'effect'                  => 'mfp-3d-unfold',
							'scrollbar'               => 'yes',
							'auto_close'              => 'yes',
							'hashchange'              => apply_filters( 'woosq_hashchange', 'no' ),
							'cart_redirect'           => get_option( 'woocommerce_cart_redirect_after_add' ),
							'cart_url'                => apply_filters( 'woocommerce_add_to_cart_redirect', wc_get_cart_url(), null ),
							'close'                   => self::localization( 'close', esc_html__( 'Close (Esc)', 'woo-smart-quick-view' ) ),
							'next_prev'               => 'yes',
							'next'                    => self::localization( 'next', esc_html__( 'Next (Right arrow key)', 'woo-smart-quick-view' ) ),
							'prev'                    => self::localization( 'prev', esc_html__( 'Previous (Left arrow key)', 'woo-smart-quick-view' ) ),
							'thumbnails_effect'       => 'no',
							'related_slick_params'    => apply_filters(
								'woosq_related_slick_params',
								json_encode(
									apply_filters(
										'woosq_related_slick_params_arr',
										array(
											'slidesToShow' => 2,
											'slidesToScroll' => 2,
											'dots'         => true,
											'arrows'       => false,
											'adaptiveHeight' => true,
											'rtl'          => is_rtl(),
										)
									)
								)
							),
							'thumbnails_slick_params' => apply_filters(
								'woosq_thumbnails_slick_params',
								json_encode(
									apply_filters(
										'woosq_thumbnails_slick_params_arr',
										array(
											'slidesToShow' => 1,
											'slidesToScroll' => 1,
											'dots'         => true,
											'arrows'       => true,
											'adaptiveHeight' => false,
											'rtl'          => is_rtl(),
										)
									)
								)
							),
							'thumbnails_zoom_params'  => apply_filters(
								'woosq_thumbnails_zoom_params',
								json_encode(
									apply_filters(
										'woosq_thumbnails_zoom_params_arr',
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

		// $this->inline_styles();
	}

	public static function localization( $key = '', $default = '' ) {
		$str = '';

		if ( ! empty( $key ) && ! empty( self::$localization[ $key ] ) ) {
			$str = self::$localization[ $key ];
		} elseif ( ! empty( $default ) ) {
			$str = $default;
		}

		return apply_filters( 'woosq_localization_' . $key, $str );
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

		$bar_height   = sgsb_find_option_setting( $settings, 'stockbar_height', '10' );
		$bg_color     = sgsb_find_option_setting( $settings, 'stockbar_bg_color', '#e7efff' );
		$fg_color     = sgsb_find_option_setting( $settings, 'stockbar_fg_color', '#0875ff' );
		$border_color = sgsb_find_option_setting( $settings, 'stockbar_border_color', '#dde6f9' );

		$theme               = wp_get_theme();
		$is_twenty_one_theme = ! empty( $theme->name ) ? $theme->name === 'Twenty Twenty-One' : false;

		$custom_css = "
			.sgsb-stock-progress-bar-section {
				border: 2px solid {$border_color};
			}
			.sgsb-stock-progress {
				height: {$bar_height}px;
				background: {$fg_color};
			}
			.sgsb-stock-progress-bar {
				background-color: {$bg_color};
			}
		";

		if ( $is_twenty_one_theme ) {
			$custom_css .= '
                .sgsb-stock-counter-and-bar {
                    margin-top: 18px;
                }
            ';
		}

		wp_add_inline_style( 'sgsb-stock-cd-custom-style', $custom_css );
	}
}
