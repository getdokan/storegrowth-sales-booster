<?php
/**
 * Ajax class for `Upsell Order Bogo`.
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Modules\BoGo;

use StorePulse\StoreGrowth\Interfaces\HookRegistry;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Load sample ajax functionality inside this class.
 */
class Ajax implements HookRegistry {

	/**
	 * Register Hooks.
	 *
	 * @since 2.0.0
	 *
	 * @return void
	 */
	public function register_hooks(): void {
        add_action( 'wp_ajax_bogo_category_msg_create', array( $this, 'bogo_category_msg_create' ) );
        add_action( 'wp_ajax_nopriv_bogo_category_msg_create', array( $this, 'bogo_category_msg_create' ) );

        add_action( 'wp_ajax_bogo_category_msg_list', array( $this, 'bogo_category_msg_list' ) );
        add_action( 'wp_ajax_nopriv_bogo_category_msg_list', array( $this, 'bogo_category_msg_list' ) );

		add_action( 'wp_ajax_spsg_bogo_general_save_settings', array( $this, 'save_settings' ) );
		add_action( 'wp_ajax_spsg_bogo_general_get_settings', array( $this, 'get_settings' ) );

		add_action( 'wp_ajax_offer_product_add_to_cart', array( $this, 'offer_product_add_to_cart' ) );
		add_action( 'wp_ajax_nopriv_offer_product_add_to_cart', array( $this, 'offer_product_add_to_cart' ) );

		add_action( 'wp_ajax_update_offer_product', array( $this, 'handle_update_offer_product' ) );
		add_action( 'wp_ajax_nopriv_update_offer_product', array( $this, 'handle_update_offer_product' ) );
	}

	protected function get_bogo(): BogoDataWrapper {
		return new BogoDataWrapper();
	}

	public function handle_update_offer_product() {
		check_ajax_referer( 'ajd_protected' );

		$data = ! empty( $_POST['data'] ) ? wc_clean( $_POST['data'] ) : array();
		if ( empty( $data ) ) {
			wp_send_json_error( 'Choose able product data can\'t be empty.' );
		}

		$item_key            = isset( $data['cart_item_key'] ) ? intval( $data['cart_item_key'] ) : 0;
		$main_product_id     = isset( $data['main_product_id'] ) ? intval( $data['main_product_id'] ) : 0;
		$product_link_key    = isset( $data['product_link_key'] ) ? esc_html( $data['product_link_key'] ) : '';
		$offer_product_cost  = isset( $data['offer_product_cost'] ) ? floatval( $data['offer_product_cost'] ) : 0;
		$selected_product_id = isset( $data['selected_product_id'] ) ? intval( $data['selected_product_id'] ) : 0;

		if ( ! $selected_product_id || ! $main_product_id ) {
			wp_send_json_error( 'Invalid product ID.' );
		}

		// Logic to remove the existing offer product and add the new one.
		$offer_product_quantity = 1;
		foreach ( WC()->cart->get_cart() as $cart_item_key => $cart_item ) {
			if ( isset( $cart_item['bogo_offer'] ) && $cart_item['bogo_product_for'] == $main_product_id ) {
				$offer_product_quantity = $cart_item['quantity'];
				WC()->cart->remove_cart_item( $cart_item_key );
				break;
			}
		}

		// Add the selected product as the new offer product
		$free_product_key = WC()->cart->add_to_cart(
			$selected_product_id,
			$offer_product_quantity,
			'',
			'',
			array(
				'bogo_offer'            => true,
                'parent_key'            => $item_key,
                'bogo_product_for'      => $main_product_id,
				'bogo_offer_price'      => $offer_product_cost,
                'changed_product_id'    => $selected_product_id,
                'linked_to_product_key' => $product_link_key,
			)
		);

        if ( $free_product_key && isset( WC()->cart->cart_contents[ $item_key ] ) ) {
            WC()->cart->cart_contents[ $item_key ]['child_key'] = $free_product_key;
        }

		wp_send_json_success( 'Product updated successfully.' );
	}

	/**
	 * Ajax action for save settings
	 */
	public function save_settings() {
		check_ajax_referer( 'spsg_ajax_nonce' );

		if ( ! isset( $_POST['data'] ) ) {
			wp_send_json_error();
		}

		// Decode the JSON data.
		$data = isset( $_POST['data'] ) ? json_decode( wp_unslash( $_POST['data'] ), true ) : array(); // phpcs: ignore.

		if ( isset( $data['bogo_general_settings_data'] ) ) {
			$bogo_general_settings_data = $data['bogo_general_settings_data'];

			update_option( 'spsg_bogo_general_settings', $bogo_general_settings_data );
			wp_send_json_success( maybe_unserialize( \StorePulse\StoreGrowth\Helper::get_settings( 'spsg_bogo_general_settings' ) ) );
		}
	}


	/**
	 * Ajax action for get settings.
	 */
	public function get_settings() {
		check_ajax_referer( 'spsg_ajax_nonce' );

		$form_data = \StorePulse\StoreGrowth\Helper::get_settings( 'spsg_bogo_general_settings', array() );

		wp_send_json_success( $form_data );
	}

    /**
     * Bogo category message creation.
     */
    public function bogo_category_msg_create() {
        check_ajax_referer( 'ajd_protected' );

        if ( empty( $_POST['data'] ) || empty( $_POST['data']['id'] ) ) {
            wp_send_json_error( __( 'Category message id can\'nt be empty.' ) );
        }

        $data          = ! empty( $_POST['data'] ) ? wc_clean( $_POST['data'] ) : array();
        $bogo_settings = \StorePulse\StoreGrowth\Helper::get_settings( 'spsg_bogo_general_settings', array() );
        $cat_ids       = ! empty( $bogo_settings['bogo_category_messages'] ) ? wp_list_pluck( $bogo_settings['bogo_category_messages'], 'id' ) : array();
        if ( ! empty( $data['editableId'] ) && in_array( $data['editableId'], $cat_ids ) ) {
            $index = array_search( $data['editableId'], $cat_ids );

            $bogo_settings['bogo_category_messages'][ $index ]['id']             = $data['id'];
            $bogo_settings['bogo_category_messages'][ $index ]['message']        = $data['message'];
            $bogo_settings['bogo_category_messages'][ $index ]['categoryStatus'] = $data['categoryStatus'];
        } else {
            $bogo_settings['bogo_category_messages'][] = $data;
        }

        $status = update_option( 'spsg_bogo_general_settings', $bogo_settings );
        wp_send_json_success( $status );
    }

    /**
     * Bogo category message list.
     */
    public function bogo_category_msg_list() {
        check_ajax_referer( 'ajd_protected' );

        $bogo_settings = \StorePulse\StoreGrowth\Helper::get_settings( 'spsg_bogo_general_settings', array() );
        if ( empty( $bogo_settings['bogo_category_messages'] ) ) {
            wp_send_json_error( __( 'Category message not found.' ) );
        }

        wp_send_json_success(
            array(
                'success'          => true,
                'categoryDataList' => $bogo_settings['bogo_category_messages']
            )
        );
    }

	/**
	 * Bogo product add to cart.
	 */
	public function offer_product_add_to_cart() {
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

		$bogo_price       = isset( $_POST['data']['bogo_price'] ) ? floatval( wp_unslash( $_POST['data']['bogo_price'] ) ) : null;
		$checked          = isset( $_POST['data']['checked'] ) ? boolval( wp_unslash( $_POST['data']['checked'] ) ) : null;
		$offer_product_id = isset( $_POST['data']['offer_product_id'] ) ? intval( wp_unslash( $_POST['data']['offer_product_id'] ) ) : null;

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
			$custom_price = $bogo_price;
			// Cart item data to send & save in order.
			$cart_item_data = array( 'custom_price' => $custom_price );
			// Woocommerce function to add product into cart check its documentation also.
			$woocommerce->cart->add_to_cart( $offer_product_id, 1, $variation_id = 0, $variation = array(), $cart_item_data );
			// Calculate totals.
			$woocommerce->cart->calculate_totals();
			// Save cart to session.
			$woocommerce->cart->set_session();
			// Maybe set cart cookies.
			$woocommerce->cart->maybe_set_cart_cookies();

		}

		die();
	}
}
