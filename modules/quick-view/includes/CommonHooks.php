<?php
/**
 * Common_Hooks class for `Stock Bar` module.
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
 * Miscellaneous hooks implementation.
 */
class CommonHooks {

	use Singleton;

	/**
	 * Constructor of Common_Hooks class.
	 */
	private function __construct() {
		add_filter( 'woocommerce_add_to_cart_redirect', array( $this, 'add_to_cart_redirect' ) );
		$this->button_positon_hooks();
		$this->content_loader_hooks();
	}

		/**
		 * Hook for Content Loader.
		 *
		 * @since 1.0.0
		 */
	public function content_loader_hooks() {
		$settings = get_option( 'sgsb_quick_view_settings' );

		$actions = array(
			'show_title'       => array(
				'action'   => 'woocommerce_template_single_title',
				'priority' => 5,
			),
			'show_rating'      => array(
				'action'   => 'woocommerce_template_single_rating',
				'priority' => 10,
			),
			'show_excerpt'     => array(
				'action'   => 'woocommerce_template_single_excerpt',
				'priority' => 15,
			),
			'show_price'       => array(
				'action'   => 'woocommerce_template_single_price',
				'priority' => 20,
			),
			'show_add_to_cart' => array(
				'action'   => array( $this, 'add_to_cart' ),
				'priority' => 25,
			),
			'show_meta'        => array(
				'action'   => 'woocommerce_template_single_meta',
				'priority' => 30,
			),
			'show_description' => array(
				'action'   => array( $this, 'show_single_product_description' ),
				'priority' => 35,
			),
		);

		foreach ( $actions as $setting => $data ) {
			if ( sgsb_find_option_setting( $settings, $setting, true ) ) {
					add_action( 'sgsbqcv_product_summary', $data['action'], $data['priority'] );
			}
		}
	}

		/**
		 * Hook for WooCommerce loop add to cart link.
		 *
		 * @since 1.0.0
		 */
	public function show_single_product_description() {
		include __DIR__ . '/../templates/description-template.php';
	}
		/**
		 * Hook for WooCommerce loop add to cart link.
		 *
		 * @since 1.0.0
		 */
	public function show_quick_view_button_shop() {
		echo esc_html( $this->display_buy_now_button() );
	}
		/**
		 * Hook for button postion.
		 *
		 * @since 1.1.3
		 */
	public function button_positon_hooks() {
		$settings        = get_option( 'sgsb_quick_view_settings' );
		$button_position = sgsb_find_option_setting( $settings, 'button_position', 'after_add_to_cart' );
		$hook            = 'woocommerce_after_shop_loop_item';
		$priority        = ( 'after_add_to_cart' === $button_position ) ? 15 : 10;

		add_action( $hook, array( $this, 'show_quick_view_button_shop' ), $priority );
	}

		/**
		 * Function to display the Buy Now button.
		 */
	private function display_buy_now_button() {
		global $product;

		$product_id                    = get_the_ID();
		$direct_checkout_button_layout = get_post_meta( $product_id, '_sgsb_direct_checkout_button_layout', true );
		$settings                      = get_option( 'sgsb_quick_view_settings' );

		include __DIR__ . '/../templates/quick-view-button.php';
	}

	/**
	 * Hook for WooCommerce loop add to cart link.
	 *
	 * @since 1.1.3
	 */
	public function add_to_cart() {
		woocommerce_template_single_add_to_cart();
	}

	/**
	 * Hook for WooCommerce add-to-cart link redirection
	 *
	 * @since 1.25.7
	 */
	public function add_to_cart_redirect( $url ) {
		if ( apply_filters( 'sgsbqcv_redirect', true ) ) {
			if ( ! empty( $_REQUEST['sgsbqcv-redirect'] ) ) {
				return apply_filters( 'sgsbqcv_redirect_url', add_query_arg( 'added_to_cart', '1', sanitize_url( $_REQUEST['sgsbqcv-redirect'] ) ) );
			}
		}
		return $url;
	}
}
