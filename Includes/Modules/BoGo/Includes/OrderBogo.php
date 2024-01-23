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
		add_action( 'woocommerce_single_product_summary', array( $this, 'bogo_product_frontend_view' ), 6 );
		add_action( 'woocommerce_before_calculate_totals', array( $this, 'woocommerce_custom_price_to_cart_item' ) );

		add_action( 'woocommerce_add_to_cart', array( $this, 'add_offer_product_to_cart' ), 10, 6 );
		add_action( 'woocommerce_update_cart_action_cart_updated', array( $this, 'handle_cart_update' ) );

		add_filter( 'woocommerce_product_data_tabs', array( $this, 'add_bogo_product_data_tab' ) );
		add_action( 'woocommerce_product_data_panels', array( $this, 'add_bogo_product_data_fields' ) );
		add_action( 'woocommerce_process_product_meta', array( $this, 'save_bogo_settings' ) );

		add_action( 'woocommerce_cart_item_removed', array( $this, 'remove_linked_bogo_product' ), 10, 2 );
		add_filter( 'woocommerce_cart_item_class', array( $this, 'add_custom_class_to_offer_product' ), 10, 3 );
		add_filter( 'woocommerce_cart_item_name', array( $this, 'add_custom_text_for_offer_product' ), 10, 3 );

		add_action( 'woocommerce_before_shop_loop_item_title', array( $this, 'display_bogo_floating_badge_on_product' ) );
		add_action( 'woocommerce_before_single_product_summary', array( $this, 'display_bogo_floating_badge_on_product' ) );
	}

	public function display_bogo_floating_badge_on_product() {
		global $product;

		$show_shop_badge = Helper::sgsb_get_bogo_settings_option( 'shop_page_bage_icon' );
		if ( is_shop() && ! $show_shop_badge ) {
			return;
		}

		$show_product_badge = Helper::sgsb_get_bogo_settings_option( 'global_product_page_bage_icon' );
		if ( is_product() && ! $show_product_badge ) {
			return;
		}

		$product_id       = $product->get_id();
		$product_settings = Helper::sgsb_get_product_bogo_settings( $product_id );

		$offer_badge         = '';
		$offer_badge_url     = '';
		$product_bogo_status = ! empty( $product_settings['bogo_status'] ) ? esc_html( $product_settings['bogo_status'] ) : 'no';
		if ( $product_bogo_status === 'yes' ) {
			$offer_badge_url = ! empty( $product_settings['bogo_badge_image'] ) ? esc_url( $product_settings['bogo_badge_image'] ) : $offer_badge_url;
		} else {
			$selected_offer = array();
			$offers         = Helper::sgsb_get_global_offered_product_list();

			foreach ( $offers as $offer ) {
				if ( ( intval( $offer['offered_products'] ) === $product_id ) && ( $offer['bogo_status'] === 'yes' ) ) {
					$selected_offer = $offer;
					break;
				}
			}

			if ( ! empty( $selected_offer ) ) {
				if ( ! empty( $selected_offer['enable_custom_badge_image'] ) ) {
					$offer_badge     = ! empty( $selected_offer['default_badge_icon_name'] ) ? esc_html( $selected_offer['default_badge_icon_name'] ) : '';
					$offer_badge_url = ! empty( $selected_offer['default_custom_badge_icon'] ) ? esc_url( $selected_offer['default_custom_badge_icon'] ) : '';
				} else {
					$offer_badge     = Helper::sgsb_get_bogo_settings_option( 'default_badge_icon_name' );
					$offer_badge_url = Helper::sgsb_get_bogo_settings_option( 'default_custom_badge_icon' );
				}
			}
		}

		if ( ! file_exists( __DIR__ . '/../templates/bogo-offer-badge.php' ) ) {
			return;
		}

		include __DIR__ . '/../templates/bogo-offer-badge.php';
	}

	public function handle_cart_update() {
		$product_quantities = array();
		foreach ( WC()->cart->get_cart() as $cart_item_key => $cart_item ) {
			$item_id       = ! empty( $cart_item['variation_id'] ) ? intval( $cart_item['variation_id'] ) : intval( $cart_item['product_id'] );
			$item_quantity = $cart_item['quantity'];

			$product_quantities[ $item_id ] = $item_quantity;
			if ( ! ( isset( $cart_item['bogo_offer'] ) || isset( $cart_item['bogo_product_for'] ) ) ) {
				continue;
			}

			WC()->cart->set_quantity( $cart_item_key, $product_quantities[ $cart_item['bogo_product_for'] ] );
		}
	}

	public function add_custom_text_for_offer_product( $product_name, $cart_item, $cart_item_key ) {
		// error_log( $product_name );
		// error_log( print_r( $cart_item, 1 ) );
		// error_log( $cart_item_key );
		if ( isset( $cart_item['bogo_offer'] ) && $cart_item['bogo_offer'] ) {
			$bogo_settings = get_post_meta( $cart_item['bogo_product_for'], 'sgsb_product_bogo_settings', true );
			// $custom_text   = '<p><a href="#" class="custom-choose-product">Choose Product</a></p>';
			// error_log( print_r( $bogo_settings, 1 ) );
			if ( file_exists( __DIR__ . '/../templates/bogo-offer-products-popup.php' ) ) {
				ob_start();
				include __DIR__ . '/../templates/bogo-offer-products-popup.php';
				$product_name .= ob_get_clean();
			}

			// return $product_name . $custom_text;
		}

		return $product_name;
	}

	public function is_bogo_applicable( $product_id, $bogo_settings ) {
		// Check if BOGO is enabled
		if ( isset( $bogo_settings['bogo_status'] ) && $bogo_settings['bogo_status'] !== 'yes' ) {
			return false;
		}

		// Check offer dates
		$current_date = date( 'Y-m-d' );
		if ( isset( $bogo_settings['offer_start'] ) && $current_date < $bogo_settings['offer_start'] ) {
			return false;
		}

		if ( isset( $bogo_settings['offer_end'] ) && $current_date > $bogo_settings['offer_end'] ) {
			return false;
		}

		return apply_filters( 'sgsb_is_bogo_applicable_product', true, $product_id, $bogo_settings );
	}

	public function add_offer_product_to_cart( $cart_item_key, $product_id, $quantity, $variation_id, $variation, $cart_item ) {
		// Get apply product id.
		$apply_able_product_id = apply_filters( 'sgsb_bogo_get_apply_able_product_id', $product_id, $variation_id );

		// Prepare settings for BOGO apply.
		$bogo_settings = Helper::sgsb_get_product_bogo_settings_for_cart( $apply_able_product_id );
		$bogo_settings = apply_filters( 'sgsb_get_bogo_settings_for_cart', $bogo_settings, $product_id, $variation_id );

		// Apply BOGO product if applicable.
		if ( ! empty( $bogo_settings ) && $this->is_bogo_applicable( $apply_able_product_id, $bogo_settings ) ) {
			foreach ( WC()->cart->get_cart() as $cart_key => $cart_item ) {
				if ( isset( $cart_item['linked_to_product_key'] ) && sanitize_key( $cart_item['linked_to_product_key'] ) === $cart_item_key ) {
					WC()->cart->set_quantity( $cart_key, ( $cart_item['quantity'] + 1 ) );
					return;
				}
			}

			$this->apply_bogo_product( $bogo_settings, $apply_able_product_id, $cart_item_key );
		}
	}

	public function apply_bogo_product( $settings, $product_id, $cart_item_key, $quantity = 1 ) {
		$offer_product_id = Helper::sgsb_get_offer_product_id( $settings, $product_id );
		$product          = wc_get_product( $offer_product_id );
		if ( ! $product ) {
			return;
		}

		// Determine the cost of the offer product (if necessary)
		$offer_product_cost = 0; // Assume free by default
		if ( isset( $settings['offer_type'] ) && $settings['offer_type'] === 'discount' ) {
			$offer_product_cost = max( $product->get_price() - ( $product->get_price() * ( $settings['discount_amount'] / 100 ) ), 0 );
		}

		// Add the offer product to the cart
		WC()->cart->add_to_cart(
			$offer_product_id,
			$quantity, // Quantity of the offer product
			'',
			'',
			array(
				'bogo_offer'            => true,
				'bogo_product_for'      => $product_id,
				'bogo_offer_price'      => $offer_product_cost,
				'linked_to_product_key' => $cart_item_key,
			)
		);
	}

	public function add_custom_class_to_offer_product( $class, $cart_item, $cart_item_key ) {
		// Check if the cart item is an offer product
		if ( isset( $cart_item['bogo_offer'] ) && $cart_item['bogo_offer'] ) {
			$can_remove_offer_product = Helper::sgsb_get_bogo_settings_option( 'offer_remove_from_cart', false );
			// Append custom class for BOGO offered product.
			$class .= $can_remove_offer_product ? ' sgsb-bogo-offer-applied sgsb-disable-bogo-offer-removed-option' : ' sgsb-bogo-offer-applied';
		}

		return $class;
	}

	public function remove_linked_bogo_product( $removed_cart_item_key, $cart ) {
		foreach ( $cart->get_cart() as $cart_item_key => $cart_item ) {
			// Check if the cart item is linked to the removed item
			if ( isset( $cart_item['linked_to_product_key'] ) && $cart_item['linked_to_product_key'] == $removed_cart_item_key ) {
				$cart->remove_cart_item( $cart_item_key );
			}
		}
	}

	/**
	 * Bogo offer product for frontend.
	 */
	public function bogo_product_frontend_view() {

		global $woocommerce;
		global $product;
		$current_product_id      = $product->get_id();
		$bogo_custom_field_value = (object) get_post_meta( $current_product_id, 'sgsb_product_bogo_settings', true );
		$is_custom_field_present = $bogo_custom_field_value;
		$all_cart_products       = $woocommerce->cart->get_cart();
		$all_cart_product_ids    = array();
		$all_cart_category_ids   = array();
		$bogo_list               = Helper::sgsb_get_global_offered_products();
		$showed_bogo_product_id  = array();
		$is_simple_product       = $product->is_type( 'simple' );

		if ( ! $is_simple_product ) {
			return;
		}

		if ( $is_custom_field_present && isset( $bogo_custom_field_value->bogo_status ) && 'yes' === $bogo_custom_field_value->bogo_status ) {
				$bogo_global_info = (object) $bogo_custom_field_value;
				$bogo_info        = $bogo_global_info;
				$deal_type        = $bogo_info->bogo_deal_type;
				$bogo_status      = $bogo_info->bogo_status;
				$target_product   = $current_product_id;
				$offer_product_id = 'same' === $deal_type ? $target_product : $bogo_info->get_different_product_field;
				$offer_type       = $bogo_info->offer_type;
				$discount_amount  = $bogo_info->discount_amount;
				$image_url        = get_the_post_thumbnail_url( $offer_product_id, 'full' );
				$_product         = wc_get_product( $offer_product_id );
				$regular_price    = $_product->get_price();
				$offer_price      = Helper::calculate_offer_price( $offer_type, $regular_price, $discount_amount );

			if (
				$current_product_id === (int) $target_product && 'yes' === $bogo_status
				) {
				include __DIR__ . '/../templates/bogo-product-meta-front-view.php';
			}
		} else {
			foreach ( $bogo_list as $bogo ) {
				$bogo_global_info = (object) maybe_unserialize( $bogo->post_excerpt );
				$bogo_info        = $bogo_global_info;
				$deal_type        = $bogo_info->bogo_deal_type;
				$bogo_status      = $bogo_info->bogo_status;
				$target_product   = $bogo_info->offered_products;
				$offer_product_id = 'same' === $deal_type ? $target_product : $bogo_info->get_different_product_field;
				$offer_type       = $bogo_info->offer_type;
				$discount_amount  = $bogo_info->discount_amount;
				$image_url        = get_the_post_thumbnail_url( $offer_product_id, 'full' );
				$_product         = wc_get_product( $offer_product_id );
				$regular_price    = $_product->get_price();
				$offer_price      = Helper::calculate_offer_price( $offer_type, $regular_price, $discount_amount );

				if (
				$current_product_id === (int) $target_product && 'yes' === $bogo_status
				) {

					include __DIR__ . '/../templates/bogo-product-front-view.php';
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
	}

	/**
	 * Product custom price.
	 *
	 * @param object $cart_object is all product of cart.
	 */
	public function woocommerce_custom_price_to_cart_item( $cart_object ) {
		if ( ! WC()->session->__isset( 'reload_checkout' ) ) {
			foreach ( $cart_object->cart_contents as $key => $value ) {
				if ( isset( $value['bogo_offer_price'] ) ) {
					$value['data']->set_price( $value['bogo_offer_price'] );
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

		$product_id = ! empty( $post->ID ) ? intval( $post->ID ) : 0;
		$product    = wc_get_product( $product_id );

		// Check BOGO tab availability via current product type.
		$is_available_bogo = $product->is_type( 'simple' ) || $product->is_type( 'variable' );
		if ( ! $is_available_bogo ) {
			return $product_data_tabs;
		}

		$product_data_tabs['bogo_tab'] = array(
			'label'  => __( 'BOGO', 'storegrowth-sales-booster' ),
			'class'  => array( 'usage_limit_options' ),
			'target' => 'bogo_product_data',
		);

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
		global $post;

		$product_id = ! empty( $post->ID ) ? intval( $post->ID ) : 0;
		if ( ! Helper::sgsb_is_load_product_bogo_offer( $product_id ) ) {
			include __DIR__ . '/../templates/bogo-upgrade-notice.php';
			return;
		}

		if ( ! file_exists( __DIR__ . '/../templates/product-bogo-settings.php' ) ) {
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
			$bogo_badge_image     = isset( $_POST['bogo_badge_image'] ) ? sanitize_url( $_POST['bogo_badge_image'] ) : '';
			$product_discount     = isset( $_POST['discount_amount'] ) ? sanitize_text_field( wp_unslash( $_POST['discount_amount'] ) ) : 0;
			$shop_page_message    = isset( $_POST['shop_page_message'] ) ? sanitize_text_field( wp_unslash( $_POST['shop_page_message'] ) ) : '';
			$product_page_message = isset( $_POST['product_page_message'] ) ? sanitize_text_field( wp_unslash( $_POST['product_page_message'] ) ) : '';

			$bogo_settings_data['offer_type']                  = $offer_type;
			$bogo_settings_data['discount_amount']             = $product_discount;
			$bogo_settings_data['bogo_badge_image']            = $bogo_badge_image;
			$bogo_settings_data['shop_page_message']           = $shop_page_message;
			$bogo_settings_data['product_page_message']        = $product_page_message;
			$bogo_settings_data['get_alternate_products']      = $bogo_products;
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
