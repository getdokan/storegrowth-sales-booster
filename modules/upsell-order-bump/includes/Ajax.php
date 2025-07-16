<?php
/**
 * Ajax class for `Upsell Order Bump`.
 *
 * @package SBFW
 */

namespace STOREGROWTH\SPSB\Modules\UpsellOrderBump\Includes;

use STOREGROWTH\SPSB\Traits\Singleton;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Load sample ajax functionality inside this class.
 */
class Ajax {

	use Singleton;

	/**
	 * Constructor of Bootstrap class.
	 */
	private function __construct() {
		add_action( 'wp_ajax_bump_create', array( $this, 'bump_create' ) );
		add_action( 'wp_ajax_nopriv_bump_create', array( $this, 'bump_create' ) );

		add_action( 'wp_ajax_bump_list', array( $this, 'bump_list' ) );
		add_action( 'wp_ajax_nopriv_bump_list', array( $this, 'bump_list' ) );

		add_action( 'wp_ajax_bump_delete', array( $this, 'bump_delete' ) );
		add_action( 'wp_ajax_nopriv_bump_delete', array( $this, 'bump_delete' ) );

		add_action( 'wp_ajax_upsell_offer_product_add_to_cart', array( $this, 'upsell_offer_product_add_to_cart' ) );
		add_action( 'wp_ajax_nopriv_upsell_offer_product_add_to_cart', array( $this, 'upsell_offer_product_add_to_cart' ) );
	}

	/**
	 * Order bump creation.
	 */
	public function bump_create() {
		check_ajax_referer( 'ajd_protected' );

		$bump_detail = $this->get_sanitized_create_bump_data();

		$my_post = array(
			'post_title'   => $bump_detail['name_of_order_bump'],
			'post_status'  => 'publish',
			'post_type'    => 'sgsb_order_bump',
			'post_excerpt' => maybe_serialize( $bump_detail ),
			'post_content' => 'Not defined',

		);
		if ( 0 === $bump_detail['offer_product_id'] ) {
			$args_bump = array(
				'post_type'      => 'sgsb_order_bump',
				'posts_per_page' => - 1,
			);
			$bump_list = get_posts( $args_bump );
			if ( is_array( $bump_list ) && count( $bump_list ) >= 2 && ! SGSB_PRO_ACTIVE ) {
				// don't allow creating more than 2 bumps.
				return;
			}
			echo esc_attr( wp_insert_post( $my_post ) );
		} elseif ( ! empty( $bump_detail['offer_product_id'] ) ) {
			$my_post['ID'] = $bump_detail['offer_product_id'];
			wp_update_post( $my_post );
		}

		die();
	}

	/**
	 * Order bump list.
	 */
	public function bump_list() {
		check_ajax_referer( 'ajd_protected' );
		$bump_id = isset( $_POST['data'] ) ? intval( wp_unslash( $_POST['data'] ) ) : null;

		if ( $bump_id ) {
			$bump = get_post( $bump_id );
			wp_send_json_success( maybe_unserialize( $bump->post_excerpt ) );
		} else {
			$args_bump = array(
				'post_type'      => 'sgsb_order_bump',
				'posts_per_page' => - 1,
			);
			$bump_list = get_posts( $args_bump );
			$bumps     = array();
			foreach ( $bump_list as $bump ) {
				$post_excerpt       = maybe_unserialize( $bump->post_excerpt );
				$post_excerpt['id'] = $bump->ID;

				$bumps[] = $post_excerpt;
			}
			wp_send_json_success( $bumps );
		}
	}

	/**
	 * Bump product delete.
	 */
	public function bump_delete() {
		check_ajax_referer( 'ajd_protected' );
		$bump_id = isset( $_POST['data'] ) ? intval( wp_unslash( $_POST['data'] ) ) : null;
		wp_delete_post( $bump_id, true );
		wp_send_json_success( 'yes' );
	}

	/**
	 * Bump product add to cart.
	 */
	public function upsell_offer_product_add_to_cart() {
		check_ajax_referer( 'ajd_protected' );
		global $woocommerce;
		$all_cart_products = $woocommerce->cart->get_cart();

		foreach ( $all_cart_products as $value ) {
			$cat_ids = $value['data']->get_category_ids();
			foreach ( $cat_ids as $cat_id ) {
				$all_cart_category_ids[] = $cat_id;
			}
			$all_cart_product_ids[] = $value['product_id'];
		}

		$bump_price         = isset( $_POST['data']['bump_price'] ) ? floatval( wp_unslash( $_POST['data']['bump_price'] ) ) : null;
		$checked            = isset( $_POST['data']['checked'] ) ? boolval( wp_unslash( $_POST['data']['checked'] ) ) : null;
		$offer_product_id   = isset( $_POST['data']['offer_product_id'] ) ? intval( wp_unslash( $_POST['data']['offer_product_id'] ) ) : null;
		$offer_variation_id = isset( $_POST['data']['offer_variation_id'] ) ? intval( wp_unslash( $_POST['data']['offer_variation_id'] ) ) : null;
		if ( $checked ) {
			$product_id      = $offer_product_id;
			$product_cart_id = WC()->cart->generate_cart_id( $product_id );
			$cart_item_key   = WC()->cart->find_product_in_cart( $product_cart_id );
			foreach ( WC()->cart->get_cart() as $cart_item_key => $cart_item ) {
				if ( $cart_item['product_id'] === $offer_product_id ) {
					WC()->cart->remove_cart_item( $cart_item_key );
				}
			}
		} else {
			$custom_price = $bump_price;
			// Cart item data to send & save in order.
			$cart_item_data = array( 'custom_price' => $custom_price );
			// Woocommerce function to add product into cart check its documentation also.
			$woocommerce->cart->add_to_cart( $offer_product_id, 1, $offer_variation_id, $variation = array(), $cart_item_data );
			// Calculate totals.
			$woocommerce->cart->calculate_totals();
			// Save cart to session.
			$woocommerce->cart->set_session();
			// Maybe set cart cookies.
			$woocommerce->cart->maybe_set_cart_cookies();

		}

		wp_send_json_success( $offer_variation_id );
		die();
	}

	/**
	 * Sanitize create order bump data.
	 *
	 * @return array
	 */
	private function get_sanitized_create_bump_data() {
		if ( ! isset( $_POST['data'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Missing
			return array();
		}

		$data = $_POST['data']; // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.MissingUnslash, WordPress.Security.ValidatedSanitizedInput.InputNotSanitized, WordPress.Security.NonceVerification.Missing

		if ( empty( $data['target_products'] ) ) {
			$data['target_products'] = array();
		}

		if ( empty( $data['target_categories'] ) ) {
			$data['target_categories'] = array();
		}

		$data['name_of_order_bump']                 = sanitize_text_field( $data['name_of_order_bump'] );
		$data['target_products']                    = array_map( 'intval', $data['target_products'] );
		$data['target_categories']                  = array_map( 'intval', $data['target_categories'] );
		$data['bump_schedule']                      = array_map( 'sanitize_text_field', $data['bump_schedule'] );
		$data['smart_offer']                        = sanitize_text_field( $data['smart_offer'] );
		$data['offer_product']                      = intval( $data['offer_product'] );
		$data['offer_type']                         = sanitize_text_field( $data['offer_type'] );
		$data['offer_amount']                       = sanitize_text_field( $data['offer_amount'] );
		$data['box_border_style']                   = sanitize_text_field( $data['box_border_style'] );
		$data['box_border_color']                   = sanitize_text_field( $data['box_border_color'] );
		$data['box_top_margin']                     = sanitize_text_field( $data['box_top_margin'] );
		$data['box_bottom_margin']                  = sanitize_text_field( $data['box_bottom_margin'] );
		$data['discount_background_color']          = sanitize_text_field( $data['discount_background_color'] );
		$data['discount_text_color']                = sanitize_text_field( $data['discount_text_color'] );
		$data['discount_font_size']                 = sanitize_text_field( $data['discount_font_size'] );
		$data['product_description_text_color']     = sanitize_text_field( $data['product_description_text_color'] );
		$data['product_description_font_size']      = sanitize_text_field( $data['product_description_font_size'] );
		$data['accept_offer_background_color']      = sanitize_text_field( $data['accept_offer_background_color'] );
		$data['accept_offer_text_color']            = sanitize_text_field( $data['accept_offer_text_color'] );
		$data['accept_offer_font_size']             = sanitize_text_field( $data['accept_offer_font_size'] );
		$data['offer_description_background_color'] = sanitize_text_field( $data['offer_description_background_color'] );
		$data['offer_description_text_color']       = sanitize_text_field( $data['offer_description_text_color'] );
		$data['offer_description_font_size']        = sanitize_text_field( $data['offer_description_font_size'] );
		$data['offer_image_url']                    = esc_url_raw( $data['offer_image_url'] );
		$data['offer_product_title']                = sanitize_text_field( $data['offer_product_title'] );
		$data['offer_product_id']                   = intval( $data['offer_product_id'] );
		$data['offer_discount_title']               = sanitize_text_field( $data['offer_discount_title'] );
		$data['offer_fixed_price_title']            = sanitize_text_field( $data['offer_fixed_price_title'] );
		$data['product_description']                = sanitize_text_field( $data['product_description'] );
		$data['selection_title']                    = sanitize_text_field( $data['selection_title'] );
		$data['offer_description']                  = sanitize_text_field( $data['offer_description'] );
		$data['offer_product_regular_price']        = sanitize_text_field( $data['offer_product_regular_price'] );

		return $data;
	}
}
