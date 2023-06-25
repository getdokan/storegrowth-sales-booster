<?php
/**
 * All necessary custom functions will be here.
 *
 * @package WPBP
 */

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! function_exists( 'sgsb_assets_url' ) ) {
	/**
	 * Get plugin assets url.
	 *
	 * @param string $path Plugin path.
	 */
	function sgsb_assets_url( $path ) {
		return STOREGROWTH_PLUGIN_DIR_URL . 'assets/' . $path;
	}
}

if ( ! function_exists( 'sgsb_modules_url' ) ) {
	/**
	 * Get modules url.
	 *
	 * @param string $path Module internal path.
	 */
	function sgsb_modules_url( $path ) {
		return STOREGROWTH_PLUGIN_DIR_URL . 'includes/modules/' . $path;
	}
}

if ( ! function_exists( 'sgsb_modules_path' ) ) {
	/**
	 * Get modules path.
	 *
	 * @param string $path Module internal path.
	 */
	function sgsb_modules_path( $path ) {
		return STOREGROWTH_PLUGIN_DIR_PATH . 'includes/modules/' . $path;
	}
}

if ( ! function_exists( 'sgsb_plugin_path' ) ) {
	/**
	 * Get plugin file path.
	 *
	 * @param string $path Plugin path.
	 */
	function sgsb_plugin_path( $path ) {
		return STOREGROWTH_PLUGIN_DIR_PATH . $path;
	}
}

if ( ! function_exists( 'sgsb_get_file_content' ) ) {
	/**
	 * Get plugin file path.
	 *
	 * @param string $path Plugin path.
	 */
	function sgsb_get_file_content( $path ) {
		ob_start();

		require STOREGROWTH_PLUGIN_DIR_PATH . $path;

		return ob_get_clean();
	}
}

if ( ! function_exists( 'sgsb_find_option_setting' ) ) {
	/**
	 * Find a settings value from array.
	 *
	 * @param array  $settings WP option array.
	 * @param string $key Key from option array.
	 * @param string $default1 Default value.
	 */
	function sgsb_find_option_setting( $settings, $key, $default1 = '' ) {
		if ( isset( $settings[ $key ] ) ) {
			return $settings[ $key ];
		}

		return $default1;
	}
}

if ( ! function_exists( 'sgsb_sanitize_form_fields' ) ) {
	/**
	 * Sanitize form text fields.
	 *
	 * @param string $value User input.
	 */
	function sgsb_sanitize_form_fields( $value ) {
		$value = sanitize_text_field( $value );

		if ( 'true' === $value ) {
			return true;
		}

		if ( 'false' === $value ) {
			return false;
		}

		return $value;
	}
}

if ( ! function_exists( 'sgsb_sanitize_svg_icon_fields' ) ) {
	/**
	 * Sanitize form SVG field xml.
	 *
	 * @param string $value SVG string.
	 */
	function sgsb_sanitize_svg_icon_fields( $value ) {
		$icon_allowed_html = array(
			'svg'  => array(
				'viewbox' => true,
				'height'  => true,
				'width'   => true,
			),
			'path' => array(
				'd' => true,
			),
			'g'    => array(),
		);

		return wp_kses( $value, $icon_allowed_html );
	}
}


  	/**
    * This function allows you to track usage of your plugin
    */
   if( ! function_exists( 'storegrowth_sales_booster_start_plugin_tracking' ) ) {
      function storegrowth_sales_booster_start_plugin_tracking() {
          if( ! class_exists( 'WPInsights_Storegrowth_Sales_Booster') ) {
              require_once dirname( __FILE__ ) . '/admin/class-wpinsights-storegrowth-sales-booster.php';
          }
        $tracker = WPInsights_Storegrowth_Sales_Booster::get_instance( STOREGROWTH_PLUGIN_DIR_PATH, [
        'opt_in'       => true,
        'goodbye_form' => true,
        'item_id'      => 'cdabb75e4451684da3a3'
      ] );
      $tracker->set_notice_options(array(
        'notice' => __( 'Want to help make <strong>StoreGrowth</strong> even more awesome? Be the first to get access to <strong>StoreGrowth PRO</strong> with a huge <strong>50% Early Bird Discount</strong> if you allow us to track the non-sensitive usage data.', 'storegrowth-sales-booster' ),
        'extra_notice' => __( 'We collect non-sensitive diagnostic data and plugin usage information. 
        Your site URL, WordPress & PHP version, plugins & themes and email address to send you the 
        discount coupon. This data lets us make sure this plugin always stays compatible with the most 
        popular plugins and themes. No spam, I promise.', 'storegrowth-sales-booster' ),
      ));
      $tracker->init();
      }
      storegrowth_sales_booster_start_plugin_tracking();
  }