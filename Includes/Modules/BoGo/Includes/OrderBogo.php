<?php
/**
 * Post type class.
 *
 * @package SBFW
 */

namespace STOREGROWTH\SPSB\Modules\BoGo\Includes;

use STOREGROWTH\SPSB\Traits\Singleton;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Load post type related functionality inside this class.
 */
class OrderBogo {

	use Singleton;

	/**
	 * Constructor of Woocommerce_Functionality class.
	 */
	public function __construct() {
		add_action( 'woocommerce_before_add_to_cart_form', array( $this, 'bogo_product_frontend_view' ) );
		add_action( 'woocommerce_before_calculate_totals', array( $this, 'woocommerce_custom_price_to_cart_item' ) );

		add_filter( 'woocommerce_product_data_tabs', array( $this, 'add_bogo_product_data_tab' ) );
		add_action( 'woocommerce_product_data_panels', array( $this, 'add_bogo_product_data_fields' ) );
		add_action( 'woocommerce_process_product_meta', array( $this, 'save_bogo_settings' ) );
	}

	/**
	 * Bogo offer product for frontend.
	 */
	public function bogo_product_frontend_view() {

		global $woocommerce;
		$all_cart_products      = $woocommerce->cart->get_cart();
		$all_cart_product_ids   = array();
		$all_cart_category_ids  = array();
		$args_bogo              = array(
			'post_type'      => 'sgsb_bogo',
			'posts_per_page' => -1,
		);
		$bogo_list              = get_posts( $args_bogo );
		$showed_bogo_product_id = array();
		error_log( print_r( $bogo_list, 1 ) );
		foreach ( $all_cart_products as $value ) {
			$cat_ids = $value['data']->get_category_ids();
			foreach ( $cat_ids as $cat_id ) {
				$all_cart_category_ids[] = $cat_id;
			}
			$all_cart_product_ids[] = $value['product_id'];
		}

		foreach ( $bogo_list as $bogo ) {
			$bogo_info        = maybe_unserialize( $bogo->post_excerpt );
			$bogo_info        = (object) $bogo_info;
			$offer_product_id = $bogo_info->offer_product;
			$offer_type       = $bogo_info->offer_type;
			$offer_amount     = $bogo_info->offer_amount;

			$checked = '';
			if ( in_array( (int) $offer_product_id, $all_cart_product_ids, true ) ) {
				$checked = 'checked';
			}

			$_product      = wc_get_product( $offer_product_id );
			$regular_price = $_product->get_regular_price();
			if ( 'discount' === $offer_type ) {
				$offer_price = ( $regular_price - ( $regular_price * $offer_amount / 100 ) );
			} else {
				$offer_price = $offer_amount;
			}

			$cart                            = WC()->cart;
			$product_already_added_from_shop = false;
			foreach ( $cart->get_cart() as $cart_item_key => $cart_item ) {
				$product    = $cart_item['data'];
				$product_id = $product->get_id();
				if ( absint( $product_id ) !== absint( $offer_product_id ) ) {
					continue;
				}
				$price = $product->get_price();
				if ( floatval( $price ) !== floatval( $offer_price ) ) {
					$product_already_added_from_shop = true;
				}
				break;
			}
			if ( $product_already_added_from_shop ) {
				// don't show the offer if the 'offer product' is already added in the cart from the shop page with regular price.
				continue;
			}
			if (
				$bogo_info->target_products
				&&
				count( $all_cart_product_ids ) !== count( array_diff( $all_cart_product_ids, $bogo_info->target_products ) )
				&&
				! in_array( $offer_product_id, $showed_bogo_product_id, true )
			) {

				include __DIR__ . '/../templates/bogo-product-front-view.php';

				$showed_bogo_product_id[] = $offer_product_id;
			}

			if (
				isset( $bogo_info->target_categories )
				&& count( $all_cart_category_ids ) !== count( array_diff( $all_cart_category_ids, $bogo_info->target_categories ) )
				&& ! in_array( $offer_product_id, $showed_bogo_product_id, true )
			) {

				include __DIR__ . '/../templates/bogo-product-front-view.php';

				$showed_bogo_product_id[] = $offer_product_id;
			}
		}
	}


	/**
	 * Product custom price.
	 *
	 * @param object $cart_object is all product of cart.
	 */
	public function woocommerce_custom_price_to_cart_item( $cart_object ) {
		if ( ! WC()->session->__isset( 'reload_checkout' ) ) {
			foreach ( $cart_object->cart_contents as $key => $value ) {
				if ( isset( $value['custom_price'] ) ) {
					$value['data']->set_price( $value['custom_price'] );
				}
			}
		}
	}

	/**
	 * Add buy one, get one settings tab for product.
	 *
	 * @since 1.0.2
	 *
	 * @param array $product_data_tabs
	 *
	 * @return array
	 */
	public function add_bogo_product_data_tab( $product_data_tabs ) {
		global $post;

		if ( Helper::sgsb_is_load_product_bogo_offer( $post->ID ) ) {
			$product_data_tabs['bogo_tab'] = array(
				'label'  => __( 'BOGO', 'storegrowth-sales-booster' ),
				'target' => 'bogo_product_data',
				'class'  => array( 'usage_limit_options' ),
			);
		}

		return $product_data_tabs;
	}

	/**
	 * Add buy one, get one tab settings.
	 *
	 * @since 1.0.2
	 *
	 * @return void
	 */
	public function add_bogo_product_data_fields() {
		if ( ! file_exists( __DIR__ . '/../templates/product-bogo-settings.php' ) ) {
			return;
		}

		global $post;

		if ( ! Helper::sgsb_is_load_product_bogo_offer( $post->ID ) ) {
			return;
		}

		include __DIR__ . '/../templates/product-bogo-settings.php';
	}

	/**
	 * Add buy one, get one tab settings.
	 *
	 * @since 1.0.2
	 *
	 * @return void
	 */
	public function save_bogo_settings( $post_id ) {
		// Check if nonce is set.
		if ( ! isset( $_POST['_sgsb_bogo_settings_nonce'] ) ) {
			return;
		}

		// Verify that the nonce is valid.
		if ( ! wp_verify_nonce( $_POST['_sgsb_bogo_settings_nonce'], 'sgsb_bogo_settings' ) ) {
			return;
		}

		// Check this isn't an autosave.
		if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
			return;
		}

		// Check the user's permissions.
		if ( ! current_user_can( 'edit_product', $post_id ) ) {
			return;
		}

		$bogo_enabled = isset( $_POST['bogo_status'] ) ? 'yes' : 'no';
		$bogo_type    = isset( $_POST['bogo_type'] ) ? sanitize_text_field( wp_unslash( $_POST['bogo_type'] ) ) : 'same';
		$deal_type    = isset( $_POST['bogo_deal_type'] ) ? sanitize_text_field( wp_unslash( $_POST['bogo_deal_type'] ) ) : 'same';

		$bogo_settings_data = array(
			'bogo_type'      => $bogo_type,
			'bogo_status'    => $bogo_enabled,
			'bogo_deal_type' => $deal_type,
		);

		$current_product     = wc_get_product( $post_id );
		$is_variable_product = $current_product->is_type( 'variable' );
		if ( ! $is_variable_product ) {
			$offer_type           = isset( $_POST['offer_type'] ) ? sanitize_text_field( wp_unslash( $_POST['offer_type'] ) ) : 'free';
			$get_product          = isset( $_POST['get_different_product_field'] ) ? sanitize_text_field( wp_unslash( $_POST['get_different_product_field'] ) ) : '';
			$bogo_products        = isset( $_POST['get_alternate_products'] ) ? wc_clean( wp_unslash( $_POST['get_alternate_products'] ) ) : array();
			$offer_schedule       = isset( $_POST['offer_schedule'] ) ? wc_clean( wp_unslash( $_POST['offer_schedule'] ) ) : array( 'daily' );
			$offer_end_date       = isset( $_POST['offer_end'] ) ? sanitize_text_field( wp_unslash( $_POST['offer_end'] ) ) : '';
			$bogo_categories      = isset( $_POST['offered_categories'] ) ? wc_clean( wp_unslash( $_POST['offered_categories'] ) ) : array();
			$bogo_badge_image     = isset( $_POST['bogo_badge_image'] ) ? sanitize_url( $_POST['bogo_badge_image'] ) : '';
			$offer_start_date     = isset( $_POST['offer_start'] ) ? sanitize_text_field( wp_unslash( $_POST['offer_start'] ) ) : '';
			$product_discount     = isset( $_POST['discount_amount'] ) ? sanitize_text_field( wp_unslash( $_POST['discount_amount'] ) ) : 0;
			$minimum_quantity     = isset( $_POST['minimum_quantity_required'] ) ? sanitize_text_field( wp_unslash( $_POST['minimum_quantity_required'] ) ) : 0;
			$shop_page_message    = isset( $_POST['shop_page_message'] ) ? sanitize_text_field( wp_unslash( $_POST['shop_page_message'] ) ) : '';
			$product_page_message = isset( $_POST['product_page_message'] ) ? sanitize_text_field( wp_unslash( $_POST['product_page_message'] ) ) : '';

			$bogo_settings_data['offer_end']                   = $offer_end_date;
			$bogo_settings_data['offer_type']                  = $offer_type;
			$bogo_settings_data['offer_start']                 = $offer_start_date;
			$bogo_settings_data['offer_schedule']              = $offer_schedule;
			$bogo_settings_data['discount_amount']             = $product_discount;
			$bogo_settings_data['bogo_badge_image']            = $bogo_badge_image;
			$bogo_settings_data['shop_page_message']           = $shop_page_message;
			$bogo_settings_data['offered_categories']          = $bogo_categories;
			$bogo_settings_data['product_page_message']        = $product_page_message;
			$bogo_settings_data['get_alternate_products']      = $bogo_products;
			$bogo_settings_data['minimum_quantity_required']   = $minimum_quantity;
			$bogo_settings_data['get_different_product_field'] = $get_product;
		}

		$bogo_settings_data = apply_filters(
			'sgsb_before_save_bogo_settings_data',
			$bogo_settings_data,
			$is_variable_product
		);

		update_post_meta( $post_id, 'sgsb_product_bogo_settings', $bogo_settings_data );
	}
}
