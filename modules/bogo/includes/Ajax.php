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

        add_action( 'wp_ajax_bogo_category_msg_list', array( $this, 'bogo_category_msg_list' ) );

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
		check_ajax_referer( 'spsg_frontend_ajax_nonce' );

		$data = ! empty( $_POST['data'] ) ? wc_clean( $_POST['data'] ) : array();
		if ( empty( $data ) ) {
			wp_send_json_error( 'Choose able product data can\'t be empty.' );
		}

		$item_key            = isset( $data['cart_item_key'] ) ? intval( $data['cart_item_key'] ) : 0;
		$main_product_id     = isset( $data['main_product_id'] ) ? intval( $data['main_product_id'] ) : 0;
		$product_link_key    = isset( $data['product_link_key'] ) ? esc_html( $data['product_link_key'] ) : '';
		$selected_product_id = isset( $data['selected_product_id'] ) ? intval( $data['selected_product_id'] ) : 0;

		if ( ! $selected_product_id || ! $main_product_id ) {
			wp_send_json_error( 'Invalid product ID.' );
		}

		// The gift price is derived from the offer configuration server-side; any
		// client-sent `offer_product_cost` is ignored. Authorise the swap before
		// touching the cart so a rejected request leaves the current gift intact.
		$offer_product_cost = $this->resolve_authorized_bogo_price( $selected_product_id );
		if ( null === $offer_product_cost ) {
			wp_send_json_error( __( 'This gift is not available for your cart.', 'storegrowth-sales-booster' ), 403 );
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

		// Handle variable product gifts - resolve variation.
		$variation_id         = 0;
		$variation_attributes = array();
		$selected_product     = wc_get_product( $selected_product_id );

		/** @var WC_Product_Variable $selected_product */
		if ( $selected_product && $selected_product->is_type( 'variable' ) ) {
			$posted_variation_id = isset( $data['variation_id'] ) ? intval( $data['variation_id'] ) : 0;
			$posted_attributes   = isset( $data['variation_attributes'] ) && is_array( $data['variation_attributes'] )
				? array_map( 'sanitize_text_field', $data['variation_attributes'] )
				: array();

			// 1. Use the posted variation_id if valid.
			if ( $posted_variation_id ) {
				$variation_product = wc_get_product( $posted_variation_id );
				if ( $variation_product && $variation_product->get_parent_id() === $selected_product_id ) {
					$variation_id         = $posted_variation_id;
					$variation_attributes = $variation_product->get_variation_attributes();
				}
			}

			// 2. Try to resolve from posted attributes.
			if ( ! $variation_id && ! empty( $posted_attributes ) ) {
				$data_store = \WC_Data_Store::load( 'product' );
				$matched_id = $data_store->find_matching_product_variation( $selected_product, $posted_attributes );

				if ( $matched_id ) {
					$variation_id         = $matched_id;
					$variation_attributes = $posted_attributes;
				}
			}

			// 3. Fallback: default variation, then first available.
			if ( ! $variation_id ) {
				$available_variations = $selected_product->get_available_variations();
				if ( ! empty( $available_variations ) ) {
					$default_variation_id = 0;
					$default_attributes   = $selected_product->get_default_attributes();

					if ( ! empty( $default_attributes ) ) {
						$prefixed_defaults    = array_combine(
							array_map( fn( $key ) => 'attribute_' . $key, array_keys( $default_attributes ) ),
							array_values( $default_attributes )
						);
						$data_store           = \WC_Data_Store::load( 'product' );
						$default_variation_id = $data_store->find_matching_product_variation( $selected_product, $prefixed_defaults );
					}

					if ( $default_variation_id ) {
						$default_variation_product = wc_get_product( $default_variation_id );
						if ( $default_variation_product ) {
							$variation_id         = $default_variation_id;
							$variation_attributes = $default_variation_product->get_variation_attributes();
						}
					} else {
						$variation_id         = $available_variations[0]['variation_id'];
						$variation_attributes = $available_variations[0]['attributes'];
					}
				}
			}

			if ( ! $variation_id ) {
				wp_send_json_error( __( 'No available variation found for this product.', 'storegrowth-sales-booster' ) );
			}
		}

		// Refine the derived price for the resolved variation (variation prices
		// differ from the parent). Authorisation already passed above.
		if ( $variation_id ) {
			$variation_price = $this->resolve_authorized_bogo_price( $selected_product_id, $variation_id );
			if ( null !== $variation_price ) {
				$offer_product_cost = $variation_price;
			}
		}

		// Add the selected product as the new offer product
		$free_product_key = WC()->cart->add_to_cart(
			$selected_product_id,
			$offer_product_quantity,
			$variation_id,
			$variation_attributes,
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
		check_ajax_referer( 'spsg_admin_ajax_nonce' );

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( __( 'You are not allowed to perform this action.', 'storegrowth-sales-booster' ), 403 );
		}

        if ( empty( $_POST['data'] ) || empty( $_POST['data']['id'] ) ) {
            wp_send_json_error( __( 'Category message id can\'nt be empty.' ) );
        }

		$data          = ! empty( $_POST['data'] ) ? wc_clean( wp_unslash( $_POST['data'] ) ) : array();
        $bogo_settings = \StorePulse\StoreGrowth\Helper::get_settings( 'spsg_bogo_general_settings', array() );
        $cat_ids       = ! empty( $bogo_settings['bogo_category_messages'] ) ? wp_list_pluck( $bogo_settings['bogo_category_messages'], 'id' ) : array();

		// Ids are term ids — keep them integers. Existing rows may still hold
		// numeric strings, so normalize both sides before comparing.
		$data['id'] = absint( $data['id'] );
		$cat_ids    = array_map( 'absint', $cat_ids );

		if ( ! empty( $data['editableId'] ) ) {
			$data['editableId'] = absint( $data['editableId'] );
		}

		if ( ! empty( $data['editableId'] ) && in_array( $data['editableId'], $cat_ids, true ) ) {
			$index = array_search( $data['editableId'], $cat_ids, true );

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
		check_ajax_referer( 'spsg_admin_ajax_nonce' );

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( __( 'You are not allowed to perform this action.', 'storegrowth-sales-booster' ), 403 );
		}

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
	 *
	 * The reward price is derived server-side from the offer configuration; any
	 * `bogo_price` in the request is ignored. The request is rejected — nothing
	 * added — unless an active offer the current cart qualifies for authorises
	 * this product as its reward.
	 */
	public function offer_product_add_to_cart() {
		check_ajax_referer( 'spsg_frontend_ajax_nonce' );

		global $woocommerce;

		$checked          = isset( $_POST['data']['checked'] ) ? boolval( wp_unslash( $_POST['data']['checked'] ) ) : null;
		$offer_product_id = isset( $_POST['data']['offer_product_id'] ) ? intval( wp_unslash( $_POST['data']['offer_product_id'] ) ) : null;

		if ( $checked ) {
			foreach ( WC()->cart->get_cart() as $cart_item_key => $cart_item ) {
				if ( $cart_item['product_id'] === $offer_product_id ) {
					WC()->cart->remove_cart_item( $cart_item_key );
				}
			}

			die();
		}

		if ( ! $offer_product_id ) {
			wp_send_json_error( array( 'message' => __( 'Invalid product.', 'storegrowth-sales-booster' ) ), 400 );
		}

		$offer_price = $this->resolve_authorized_bogo_price( $offer_product_id );
		if ( null === $offer_price ) {
			wp_send_json_error( array( 'message' => __( 'This offer is not available.', 'storegrowth-sales-booster' ) ), 403 );
		}

		// Use the BOGO price key so OrderBogo prices the gift — never
		// `custom_price`, which is the Upsell Order Bump key and left the gift
		// full-priced whenever that module was inactive.
		$cart_item_data = array( 'bogo_offer_price' => $offer_price );
		$woocommerce->cart->add_to_cart( $offer_product_id, 1, 0, array(), $cart_item_data );
		$woocommerce->cart->calculate_totals();
		$woocommerce->cart->set_session();
		$woocommerce->cart->maybe_set_cart_cookies();

		die();
	}

	/**
	 * Resolve the price a BOGO reward may be added at, deriving it from the
	 * offer configuration instead of trusting the client.
	 *
	 * Returns null when no active offer that the current cart qualifies for
	 * authorises adding this product as its reward, so callers add nothing.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param int $offer_product_id Requested reward product id (parent id for a
	 *                              variable gift).
	 * @param int $variation_id     Resolved variation id, if any.
	 *
	 * @return float|null Authorised price, or null when unauthorised.
	 */
	private function resolve_authorized_bogo_price( int $offer_product_id, int $variation_id = 0 ) {
		if ( ! function_exists( 'WC' ) || ! WC()->cart ) {
			return null;
		}

		$price_product = wc_get_product( $variation_id ? $variation_id : $offer_product_id );
		if ( ! $price_product ) {
			return null;
		}

		foreach ( WC()->cart->get_cart() as $cart_item ) {
			$trigger_product_id = (int) $cart_item['product_id'];

			$settings = BogoValidator::get_product_bogo_settings( $trigger_product_id );
			if ( empty( $settings ) ) {
				continue;
			}

			$trigger_category_ids = $cart_item['data'] instanceof \WC_Product ? $cart_item['data']->get_category_ids() : array();
			if ( ! BogoValidator::should_display_offer( $settings, $trigger_product_id, $trigger_category_ids ) ) {
				continue;
			}

			// The trigger must meet the offer's minimum quantity condition.
			$min_qty = max( 1, intval( $settings['minimum_quantity_required'] ?? 1 ) );
			if ( (int) $cart_item['quantity'] < $min_qty ) {
				continue;
			}

			// The requested product must be this offer's configured reward or one
			// of its configured alternates.
			$reward_id  = (int) BogoValidator::get_offer_product_id( $settings, $trigger_product_id );
			$alternates = $settings['alternate_products'] ?? $settings['get_alternate_products'] ?? array();
			$authorized = array_map( 'intval', array_merge( array( $reward_id ), (array) $alternates ) );

			if ( ! in_array( (int) $offer_product_id, $authorized, true ) ) {
				continue;
			}

			// Price derived from the offer, matching OrderBogo::apply_bogo_product()
			// and OrderBogo.php:531 exactly (filtered product price).
			if ( isset( $settings['offer_type'] ) && 'discount' === $settings['offer_type'] ) {
				return (float) max( $price_product->get_price() - ( $price_product->get_price() * ( $settings['discount_amount'] / 100 ) ), 0 );
			}

			return 0.0; // Free offer.
		}

		return null;
	}
}
