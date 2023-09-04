<?php
/**
 * Enqueue class.
 *
 * @package SBFW
 */

namespace STOREGROWTH\SPSB\Modules\Sales_Pop;

use STOREGROWTH\SPSB\Traits\Singleton;

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
		wp_enqueue_script( 'popup-custom-js', sgsb_modules_url( 'sales-pop/assets/js/popup-custom.js' ), array( 'jquery' ), time(), true );
		$args             = array(
			'post_type'      => 'product',
			'posts_per_page' => -1,
		);
		$products         = get_posts( $args );
		$popup_properties = get_option( 'sgsb_popup_products', false );

		if ( false !== $popup_properties ) {
			$popup_properties  = maybe_unserialize( $popup_properties );
			$popup_products    = $popup_properties['popup_products'];
			$product_list      = array();
			$product_url       = array();
			$product_image_url = array();
			if ( $popup_products ) {
				foreach ( $products as $product ) {
					if ( ! in_array( $product->ID, $popup_products, true ) ) {
						continue;
					}
					if ( $popup_properties['external_link'] || ( ! $popup_properties['external_link'] && ! wc_get_product( $product->ID )->is_type( 'external' ) ) ) {
						$product_list[]      = $product->post_title;
						$image_url           = wp_get_attachment_image_src( get_post_thumbnail_id( $product->ID ), 'single-post-thumbnail' );
						$product_image_url[] = isset( $image_url[0] ) ? $image_url[0] : false;
						$product_url[]       = get_permalink( $product->ID );

					}
				}
			}
		} else {
			return;
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

		$virtual_locations = isset( $popup_properties['virtual_locations'] ) ? $popup_properties['virtual_locations'] : '';
		$virtual_locations = explode( "\n", $virtual_locations );

		$popup_info = array(
			'product_list'         => $product_list,
			'product_url'          => $product_url,
			'product_image_url'    => $product_image_url,
			'virtual_locations'    => $virtual_locations,
			'virtual_name'         => $virtual_name,
			'popup_all_properties' => $popup_properties,
			'fallback_image_url'   => $default_product_image_url = plugin_dir_url( __DIR__ ) . 'assets/images/sale_product.png',
		);

		wp_localize_script( 'popup-custom-js', 'popup_info', $popup_info );
	}

	/**
	 * Add CSS files.
	 */
	public function enqueue_styles() {
		$ftime = filemtime( sgsb_modules_path( 'sales-pop/assets/css/popup-custom.css' ) );
		wp_enqueue_style(
			'popup-custom-css',
			sgsb_modules_url( 'sales-pop/assets/css/popup-custom.css' ),
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
		$popup_properties = maybe_unserialize( get_option( 'sgsb_popup_products', true ) );

		if ( 'sales-booster_page_sgsb-settings' === $screen ) {
			add_action( 'admin_head', array( $this, 'admin_css' ) );
			$settings_file = require sgsb_modules_path( 'sales-pop/assets/build/settings.asset.php' );

			wp_enqueue_script(
				'sgsb-sales-pop-settings',
				sgsb_modules_url( 'sales-pop/assets/build/settings.js' ),
				$settings_file['dependencies'],
				$settings_file['version'],
				false
			);

			wp_localize_script(
				'sgsb-sales-pop-settings',
				'sales_pop_data',
				array(
					'ajax_url'     => admin_url( 'admin-ajax.php' ),
					'ajd_nonce'    => wp_create_nonce( 'ajd_protected' ),
					'image_folder' => sgsb_modules_url( 'upsell-order-bump/assets/images' ),
					'product_list' => $this->product_list(),
				)
			);
		}
	}

	/**
	 * Add css for admin panel.
	 */
	public function admin_css() {
		?>
		<style type="text/css">
			.ant-tabs-tabpane-hidden{
				display: none;
			}
		</style>
		<?php
	}

	/**
	 * Product list for pop up selection.
	 */
	public function product_list() {
		$args = array(
			'post_type'      => 'product',
			'posts_per_page' => -1,
		);

		$products                = get_posts( $args );
		$product_info            = array();
		$product_list_for_select = array();
		$product_title_by_id     = array();
		$external_products_ids   = array();

		foreach ( $products as $product ) {
			$product_id                = $product->ID;
			$product_list_for_select[] = array(
				'value' => $product_id,
				'label' => $product->post_title,
			);

			$product_title_by_id[ $product_id ] = $product->post_title;
			$product_obj                        = wc_get_product( $product_id );
			if ( $product_obj && $product_obj->is_type( 'external' ) ) {
				$external_products_ids[] = $product_id;
			}
		}

		$product_info['productListForSelect'] = $product_list_for_select;
		$product_info['productTitleById']     = $product_title_by_id;
		$product_info['externalProductsIds']  = $external_products_ids;

		return $product_info;
	}
}
