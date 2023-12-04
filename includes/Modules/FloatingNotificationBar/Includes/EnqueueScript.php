<?php
/**
 * Enqueue_Script class for Progressive Discount Banner.
 *
 * @package SBFW
 */

namespace STOREGROWTH\SPSB\Modules\FloatingNotificationBar\Includes;

use STOREGROWTH\SPSB\Traits\Singleton;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Add styles and scripts files of `Progressive Discount Banner` Modules inside this class.
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
	 */
	public function wp_enqueue_scripts() {
		// On WooCommerce v7.8 wc-cart-fragments has been removed from all pages, So we added it here.
		if ( is_cart() || is_checkout() ) {
			wp_enqueue_script( 'wc-cart-fragments' );
		}

		$style_file = sgsb_modules_path( 'FloatingNotificationBar/assets/css/floating-notification-bar.css' );

		wp_enqueue_style(
			'sgsb-floating-notification-bar-style',
			sgsb_modules_url( 'FloatingNotificationBar/assets/css/floating-notification-bar.css' ),
			array(),
			filemtime( $style_file )
		);

		wp_enqueue_script(
			'sgsb-floating-notification-bar-remove',
			sgsb_modules_url( 'FloatingNotificationBar/assets/js/sgsb-pd-banner-bar-remove.js' ),
			array( 'jquery' ),
			filemtime( sgsb_modules_path( 'FloatingNotificationBar/assets/js/sgsb-pd-banner-bar-remove.js' ) ),
			true
		);
		$localized_fnb_data = Helper::sgsb_floating_notification_bar_get_settings();

		// Use wp_localize_script to pass the data to your script.
		wp_localize_script( 'sgsb-floating-notification-bar-remove', 'sgsb_fnb_data', $localized_fnb_data );
		$this->inline_styles();
	}

	/**
	 * Add JS scripts to admin.
	 *
	 * @param string $hook Page slug.
	 */
	public function admin_enqueue_scripts( $hook ) {
		if ( 'storegrowth_page_sgsb-settings' === $hook ) {
			$settings_file = require sgsb_modules_path( 'FloatingNotificationBar/assets/build/settings.asset.php' );

			wp_enqueue_media();
			wp_enqueue_script(
				'sgsb-floating-notification-bar-settings',
				sgsb_modules_url( 'FloatingNotificationBar/assets/build/settings.js' ),
				$settings_file['dependencies'],
				$settings_file['version'],
				false
			);

            $localized_fnb_data = Helper::available_coupon_codes();

			// Use wp_localize_script to pass the data to your script.
			wp_localize_script( 'sgsb-floating-notification-bar-settings', 'sgsb_fnb_coupon_data', $localized_fnb_data );
		}
	}

    /**
     * Retrieves the label corresponding to a given value from an array of objects.
     *
     * This function iterates through the array of objects and matches the provided
     * value to the 'value' property of each object. If a match is found, it returns
     * the corresponding 'label' property; otherwise, it returns an empty string.
     *
     * @param mixed[] $value An array of objects where each object has 'value' and 'label' properties.
     * @param mixed   $object_array       The value to search for within the array of objects.
     *
     * @return string The label corresponding to the provided value, or an empty string if not found.
     */
	private function get_label_by_value( $value, $object_array ) {
		foreach ( $object_array as $object ) {
			if ( $object['value'] === $value ) {
				return $object['label'];
			}
		}
		return '';
	}

	/**
	 * All inline styles
	 */
	private function inline_styles() {
		$font_family_arr = array(
			array(
				'value' => 'poppins',
				'label' => 'Poppins',
			),
			array(
				'value' => 'roboto',
				'label' => 'Roboto',
			),
			array(
				'value' => 'lato',
				'label' => 'Lato',
			),
			array(
				'value' => 'montserrat',
				'label' => 'Montserrat',
			),
			array(
				'value' => 'ibm_plex_sans',
				'label' => 'IBM Plex Sans',
			),
		);
		// Get style options.
		$settings          = Helper::sgsb_floating_notification_bar_get_settings();
		$bar_position      = sgsb_find_option_setting( $settings, 'bar_position', 'top' );
		$bar_type          = sgsb_find_option_setting( $settings, 'bar_type', 'normal' );
		$bg_color          = sgsb_find_option_setting( $settings, 'background_color', '#008DFF' );
		$text_color        = sgsb_find_option_setting( $settings, 'text_color', '#ffffff' );
		$icon_color        = sgsb_find_option_setting( $settings, 'icon_color', '#ffffff' );
		$close_icon_color  = sgsb_find_option_setting( $settings, 'close_icon_color', '#ffffff' );
		$banner_height     = sgsb_find_option_setting( $settings, 'banner_height', 60 );
		$font_size         = sgsb_find_option_setting( $settings, 'font_size', 20 );
		$button_color      = sgsb_find_option_setting( $settings, 'button_color', '#ffffff' );
		$button_text_color = sgsb_find_option_setting( $settings, 'button_text_color', '#ffffff' );
		$font_family       = sgsb_find_option_setting( $settings, 'font_family', 'poppins' );
		$selected_font     = $this->get_label_by_value( $font_family, $font_family_arr );

		if ( 'bottom' === $bar_position ) {
			$css = '
				.sgsb-floating-notification-bar-wrapper {
					top: auto !important;
					bottom: 0;
				}
				body.admin-bar .sgsb-floating-notification-bar-wrapper {
					top: ' . ( 0 ) . 'px;
			}
			body {
				padding-top: ' . ( 0 ) . 'px;
		}
			';
		} else {
			$css = '
			body {
					padding-top: ' . ( $banner_height + 10 ) . 'px;
			}
	';
		}

		$css .= "
			.sgsb-floating-notification-bar-wrapper {
				background-color: {$bg_color};
				color: {$text_color};
				height: {$banner_height}px;
			}
			.sgsb-floating-notification-bar-wrapper .sgsb-floating-notification-bar-icon svg {
				fill: {$icon_color};
			}
			.sgsb-floating-notification-bar-wrapper .sgsb-floating-notification-bar-remove svg {
				fill: {$close_icon_color};
			}
			.sgsb-floating-notification-bar-text {
				font-size: {$font_size}px;
				font-family: {$selected_font};
			}
			.fn-bar-action-button {
				background-color: {$button_color};
    		color: {$button_text_color};
			}
		";
		if ( 'sticky' === $bar_type ) {
			$css .= '
			.sgsb-floating-notification-bar-wrapper {
				position: fixed;
			}';
		} elseif ( 'normal' === $bar_type ) {
			if ( 'bottom' === $bar_position ) {
				$css .= '
			.sgsb-floating-notification-bar-wrapper {
				position: inherit;
			}';
			} else {
				$css .= '
			.sgsb-floating-notification-bar-wrapper {
				position: absolute;
			}';
			}
		}

		wp_add_inline_style( 'sgsb-floating-notification-bar-style', $css );
	}
}
