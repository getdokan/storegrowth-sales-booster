<?php
/**
 * Enqueue class.
 *
 * @package SBFW
 */

namespace WPCodal\SBFW\Modules\Sales_Pop;

use WPCodal\SBFW\Traits\Singleton;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Add styles of scripts files inside this class.
 */
class Enqueue {

	use Singleton;

	/**
	 * Constructor of Bootstrap class.
	 */
	private function __construct() {
		// Assets for frontend.
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_scripts' ) );
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_styles' ) );

		// Assets for Admin Panel.
		add_action( 'admin_enqueue_scripts', array( $this, 'admin_enqueue_scripts' ) );
	}

	/**
	 * Add JS scripts.
	 */
	public function enqueue_scripts() {
		wp_enqueue_script( 'popup-custom-js', sbfw_modules_url( 'sales-pop/assets/js/popup-custom.js' ), array( 'jquery' ), time(), true );
		$args             = array(
			'post_type'      => 'product',
			'posts_per_page' => -1,
		);
		$products         = get_posts( $args );
		$popup_properties = maybe_unserialize( get_option( 'sbfw_popup_products', true ) );
		$popup_products   = $popup_properties['popup_products'];

		$product_list      = array();
		$product_url       = array();
		$product_image_url = array();
		if ( $popup_products ) {
			foreach ( $products as $product ) {
				if ( in_array( $product->ID, $popup_products, true ) ) {
					$product_list[]      = $product->post_title;
					$image_url           = wp_get_attachment_image_src( get_post_thumbnail_id( $product->ID ), 'single-post-thumbnail' );
					$product_image_url[] = $image_url[0];
					$product_url[]       = get_permalink( $product->ID );

				}
			}
		}

		$state_without_city = maybe_unserialize( get_option( 'sbfw_state_without_city', true ) );
		$virtual_state      = $popup_properties['virtual_state'] ? $popup_properties['virtual_state'] : array();

		$popup_state_without_city = array_intersect( $state_without_city, $virtual_state );

		$country_name_by_code = array();

		if ( isset( $popup_properties['countries'] ) ) {
			foreach ( $popup_properties['countries'] as $country ) {
				$country_name_by_code[ $country['value'] ] = $country['label'];
			}
		}

		$state_by_country = $popup_properties['state_by_country'] ? $popup_properties['state_by_country'] : array();
		foreach ( $state_by_country as $state ) {
			$state_by_code[ $state['value'] ] = $state['label'];
		}

		$coutry_state_for_popup = array();
		$virtual_city           = $popup_properties['virtual_city'] ? $popup_properties['virtual_city'] : array();
		foreach ( $virtual_city as $value ) {
			$country_state_city       = explode( '#', $value );
			$state_code               = $country_state_city[0] . '#' . $country_state_city[1];
			$country_state_city[0]    = $country_name_by_code[ $country_state_city[0] ];
			$country_state_city[1]    = $state_by_code[ $state_code ];
			$coutry_state_for_popup[] = $country_state_city;

		}

		$popup_location_without_city = array();
		foreach ( $popup_state_without_city as $value ) {
			$country_and_state             = explode( '#', $value );
			$popup_location_without_city[] = array( $country_name_by_code[ $country_and_state[0] ], $state_by_code[ $value ] );
		}

		$popup_location_with_and_without_city = array_merge( $popup_location_without_city, $coutry_state_for_popup );

		$final_popup_country = array();

		foreach ( $popup_location_with_and_without_city as $value ) {
			$final_popup_country[] = implode( ', ', array_reverse( $value ) );
		}

		$countries            = $popup_properties['countries'] ? $popup_properties['countries'] : array();
		$selected_countries   = isset( $popup_properties['selected_countries'] ) ? $popup_properties['selected_countries'] : null;
		$random_popup_country = array();

		foreach ( $countries as $country_info ) {
			if ( $selected_countries && in_array( $country_info['value'], $selected_countries, true ) ) {
				$random_popup_country[] = $country_info['label'];
			}
		}

		$virtual_name = array();

		if ( isset( $popup_properties['virtual_name'] ) ) {
			if ( is_string( $popup_properties['virtual_name'] ) ) {
				$virtual_name = explode( ',', $popup_properties['virtual_name'] );
			}

			if ( is_array( $popup_properties['virtual_name'] ) ) {
				$virtual_name = $popup_properties['virtual_name'];
			}
		}

		$popup_info = array(
			'product_list'         => $product_list,
			'product_url'          => $product_url,
			'product_image_url'    => $product_image_url,
			'random_popup_country' => $final_popup_country,
			'virtual_name'         => $virtual_name,
			'popup_all_properties' => $popup_properties,
		);

		wp_localize_script( 'popup-custom-js', 'popup_info', $popup_info );
	}

	/**
	 * Add CSS files.
	 */
	public function enqueue_styles() {
		$ftime = filemtime( sbfw_modules_path( 'sales-pop/assets/css/popup-custom.css' ) );
		wp_enqueue_style(
			'popup-custom-css',
			sbfw_modules_url( 'sales-pop/assets/css/popup-custom.css' ),
			null,
			$ftime
		);
		wp_enqueue_style( 'font-awesome-css', '//stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css', null, '1.0' );
	}

	/**
	 * Add Admin JS scripts.
	 *
	 * @param string $screen name of screen.
	 */
	public function admin_enqueue_scripts( $screen ) {
		$popup_properties = maybe_unserialize( get_option( 'sbfw_popup_products', true ) );

		if ( 'sales-booster_page_sbfw-settings' === $screen ) {

			$settings_file = require sbfw_modules_path( 'sales-pop/assets/build/settings.asset.php' );

			wp_enqueue_script(
				'sbfw-sales-pop-settings',
				sbfw_modules_url( 'sales-pop/assets/build/settings.js' ),
				$settings_file['dependencies'],
				$settings_file['version'],
				false
			);

			wp_localize_script(
				'sbfw-sales-pop-settings',
				'sales_pop_data',
				array(
					'ajax_url'     => admin_url( 'admin-ajax.php' ),
					'ajd_nonce'    => wp_create_nonce( 'ajd_protected' ),
					'image_folder' => sbfw_modules_url( 'upsell-order-bump/assets/images' ),
					'product_list' => $this->prodcut_list(),
				)
			);
		}
	}

	/**
	 * Product list for pop up selection.
	 */
	public function prodcut_list() {
		$args = array(
			'post_type'      => 'product',
			'posts_per_page' => -1,
		);

		$products                = get_posts( $args );
		$product_list_for_select = array();
		$product_title_by_id     = array();

		foreach ( $products as $product ) {
			$product_list_for_select[] = array(
				'value' => $product->ID,
				'label' => $product->post_title,
			);

			$product_title_by_id[ $product->ID ] = $product->post_title;
		}

		$product_info['productListForSelect'] = $product_list_for_select;
		$product_info['productTitleById']     = $product_title_by_id;

		return $product_info;
	}
}
