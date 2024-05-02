<?php
/**
 * Enqueue_Script class for `Upsell Order Bump`.
 *
 * @package SBFW
 */

namespace STOREGROWTH\SPSB\Modules\FrequentlyBought\Includes;

use STOREGROWTH\SPSB\Traits\Singleton;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Add styles and scripts files of `Upsell Order Bump` Modules inside this class.
 */
class EnqueueScript {


	use Singleton;

	/**
	 * Constructor of Enqueue class.
	 */
	private function __construct() {
		add_action( 'admin_enqueue_scripts', array( $this, 'admin_enqueue_scripts' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'admin_enqueue_styles' ) );
	}


	/**
	 * Add JS scripts to admin.
	 *
	 * @param string $hook screen name.
	 */
	public function admin_enqueue_scripts( $hook ) {

		if ( 'storegrowth_page_sgsb-settings' === $hook ) {

			$settings_file                   = require sgsb_modules_path( 'FrequentlyBought/assets/build/settings.asset.php' );
			$settings_file['dependencies'][] = 'jquery';

			wp_enqueue_script(
				'sgsb-frequently-bought-settings',
				sgsb_modules_url( 'FrequentlyBought/assets/build/settings.js' ),
				$settings_file['dependencies'],
				$settings_file['version'],
				true
			);

			$action                      = 'ajd_protected';
			$ajd_nonce                   = wp_create_nonce( $action );
			$product_and_categories_data = array();
			$fbt_product_and_categories  = apply_filters( 'sgsb_fbt_product_and_categories_info', $product_and_categories_data );
			
			wp_localize_script(
				'sgsb-frequently-bought-settings',
				'products_and_categories',
				$fbt_product_and_categories
			);

			wp_localize_script(
				'sgsb-frequently-bought-settings',
				'fbt_save_url',
				array(
					'ajax_url'     => admin_url( 'admin-ajax.php' ),
					'ajd_nonce'    => $ajd_nonce,
					'image_folder' => sgsb_modules_url( 'FrequentlyBought/assets/images' ),
				)
			);
		}
	}

	/**
	 * Add CSS scripts to admin.
	 */
	public function admin_enqueue_styles() {
		$ftime          = filemtime( sgsb_modules_path( 'FrequentlyBought/assets/css/frequently-bought-custom-admin.css' ) );
		$ftime_template = filemtime( sgsb_modules_path( 'FrequentlyBought/assets/css/frequently-bought-template.css' ) );

		wp_enqueue_style(
			'sgsb-frequently-bought-custom-admin-css',
			sgsb_modules_url( 'FrequentlyBought/assets/css/frequently-bought-custom-admin.css' ),
			null,
			$ftime
		);

		wp_enqueue_style(
			'sgsb-frequently-bought-template-css',
			sgsb_modules_url( 'FrequentlyBought/assets/css/frequently-bought-template.css' ),
			null,
			$ftime_template
		);
	}
}
