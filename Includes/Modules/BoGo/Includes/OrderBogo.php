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
		add_filter( 'woocommerce_cart_item_price', array( $this, 'update_woocommerce_item_price' ), 10, 3 );
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
		$shop_page_msg       = '';
		$selected_offer      = array();
		$offer_badge_url     = '';
		$product_page_msg    = '';
		$product_bogo_status = ! empty( $product_settings['bogo_status'] ) ? esc_html( $product_settings['bogo_status'] ) : 'no';
		if ( $product_bogo_status === 'yes' ) {
			$shop_page_msg    = ! empty( $product_settings['shop_page_message'] ) ? esc_html( $product_settings['shop_page_message'] ) : $shop_page_msg;
			$offer_badge_url  = ! empty( $product_settings['bogo_badge_image'] ) ? esc_url( $product_settings['bogo_badge_image'] ) : $offer_badge_url;
			$product_page_msg = ! empty( $product_settings['product_page_message'] ) ? esc_html( $product_settings['product_page_message'] ) : $product_page_msg;
		} else {
			$offers = Helper::sgsb_get_global_offered_product_list();
			foreach ( $offers as $offer ) {
				if ( ( intval( $offer['offered_products'] ) === $product_id ) && ( $offer['bogo_status'] === 'yes' ) ) {
					$selected_offer = $offer;
					break;
				}
			}

			$shop_page_msg    = ! empty( $selected_offer['shop_page_message'] ) ? esc_html( $selected_offer['shop_page_message'] ) : $shop_page_msg;
			$product_page_msg = ! empty( $selected_offer['product_page_message'] ) ? esc_html( $selected_offer['product_page_message'] ) : $product_page_msg;
			if ( ! empty( $selected_offer ) ) {
				$is_pro = is_plugin_active( 'storegrowth-sales-booster-pro/storegrowth-sales-booster-pro.php' );
				if ( ! empty( $selected_offer['enable_custom_badge_image'] ) ) {
					$offer_badge     = ! empty( $selected_offer['default_badge_icon_name'] ) ? esc_html( $selected_offer['default_badge_icon_name'] ) : '';
					$offer_badge_url = $is_pro && ! empty( $selected_offer['default_custom_badge_icon'] ) ? esc_url( $selected_offer['default_custom_badge_icon'] ) : '';
				} else {
					$offer_badge     = Helper::sgsb_get_bogo_settings_option( 'default_badge_icon_name' );
					$offer_badge_url = $is_pro ? Helper::sgsb_get_bogo_settings_option( 'default_custom_badge_icon' ) : '';
				}
			}
		}

		$path = apply_filters( 'sgsb_load_bogo_badge_content', __DIR__ . '/../templates/bogo-offer-badge.php', $selected_offer );
		if ( ! file_exists( $path ) ) {
			return;
		}

		include $path;
	}

	public function handle_cart_update() {
		// Get the cart items
		$cart_items = WC()->cart->get_cart();

		// Iterate through the cart items.
		foreach ( $cart_items as $cart_item_key => $cart_item ) {
			if ( isset( $cart_item['changed_product_id'] ) ) {
				$parent_item  = WC()->cart->cart_contents[ $cart_item['linked_to_product_key'] ];
				$product_id   = ! empty( $parent_item['product_id'] ) ? intval( $parent_item['product_id'] ) : 0;
				$variation_id = ! empty( $parent_item['variation_id'] ) ? intval( $parent_item['variation_id'] ) : 0;

				$apply_able_product_id = ! empty( $variation_id ) ? $variation_id : $product_id;
				$bogo_settings         = Helper::sgsb_prepare_bogo_settings( $apply_able_product_id, $product_id, $variation_id );

				$required_quantity     = ! empty( $bogo_settings['minimum_quantity_required'] ) ? $bogo_settings['minimum_quantity_required'] : 1;
				$free_product_quantity = floor( $parent_item['quantity'] / $required_quantity ) * 1;

				WC()->cart->set_quantity( $cart_item_key, $free_product_quantity );
				continue;
			}

			$product_id   = ! empty( $cart_item['product_id'] ) ? intval( $cart_item['product_id'] ) : 0;
			$variation_id = ! empty( $cart_item['variation_id'] ) ? intval( $cart_item['variation_id'] ) : 0;

			$apply_able_product_id = ! empty( $variation_id ) ? $variation_id : $product_id;
			$bogo_settings         = Helper::sgsb_prepare_bogo_settings( $apply_able_product_id, $product_id, $variation_id );

			// Get offer product info.
			$offer_product_id = Helper::sgsb_get_offer_product_id( $bogo_settings, $product_id );
			$offer_product    = wc_get_product( $offer_product_id );
			if ( ! $offer_product ) {
				continue;
			}

			$free_product_quantity = apply_filters( 'sgsb_free_product_quantity_for_cart_update', $cart_item['quantity'], $bogo_settings, $cart_item );
			if ( isset( $cart_item['child_key'] ) && array_key_exists( $cart_item['child_key'], $cart_items ) ) {
				WC()->cart->set_quantity( $cart_item['child_key'], $free_product_quantity );
			} else {
				$this->add_offer_product_to_cart( $cart_item_key, $product_id, $free_product_quantity, $variation_id, array(), $cart_item );
			}
		}
	}

	public function add_custom_text_for_offer_product( $product_name, $cart_item, $cart_item_key ) {
		if ( isset( $cart_item['bogo_offer'] ) && $cart_item['bogo_offer'] ) {
			$bogo_settings = Helper::sgsb_prepare_bogo_settings( $cart_item['bogo_product_for'], $cart_item['product_id'], $cart_item['variation_id'] );
			if ( file_exists( __DIR__ . '/../templates/bogo-offer-products-popup.php' ) ) {
				ob_start();
				include __DIR__ . '/../templates/bogo-offer-products-popup.php';
				$product_name .= ob_get_clean();
			}
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
		$is_pro       = is_plugin_active( 'storegrowth-sales-booster-pro/storegrowth-sales-booster-pro.php' );
		if ( $is_pro && isset( $bogo_settings['offer_start'] ) && $current_date < $bogo_settings['offer_start'] ) {
			return false;
		}

		if ( $is_pro && isset( $bogo_settings['offer_end'] ) && $current_date > $bogo_settings['offer_end'] ) {
			return false;
		}

		return apply_filters( 'sgsb_is_bogo_applicable_product', true, $product_id, $bogo_settings );
	}

	public function add_offer_product_to_cart( $cart_item_key, $product_id, $quantity, $variation_id, $variation, $cart_item ) {
		// Get apply product id.
		$apply_able_product_id = apply_filters( 'sgsb_bogo_get_apply_able_product_id', $product_id, $variation_id );
		$bogo_settings         = Helper::sgsb_prepare_bogo_settings( $apply_able_product_id, $product_id, $variation_id );

		// Apply BOGO product if not offer product, different apply & applicable.
		if ( empty( $cart_item['bogo_offer'] ) && ! empty( $bogo_settings ) &&
			( $bogo_settings['bogo_deal_type'] !== 'same' ) &&
			$this->is_bogo_applicable( $apply_able_product_id, $bogo_settings )
		) {
			$this->apply_bogo_product( $bogo_settings, $apply_able_product_id, $cart_item_key, $quantity );
		}
	}

	public function apply_bogo_product( $settings, $product_id, $cart_item_key, $quantity = 1 ) {
		$offer_product_id = Helper::sgsb_get_offer_product_id( $settings, $product_id );
		$product          = wc_get_product( $offer_product_id );

		// Determine the cost of the offer product (if necessary)
		$offer_product_cost = 0; // Assume free by default
		if ( isset( $settings['offer_type'] ) && $settings['offer_type'] === 'discount' ) {
			$offer_product_cost = max( $product->get_price() - ( $product->get_price() * ( $settings['discount_amount'] / 100 ) ), 0 );
		}

		// Initialize the total quantity count to 0.
		$total_quantity = 0;

		// Logic to remove the existing offer product and add the new one.
		foreach ( WC()->cart->get_cart() as $cart_item ) {
			if ( ( $cart_item['product_id'] == $product_id ) ) {
				$total_quantity += $cart_item['quantity'];
			}

			if ( isset( $cart_item['changed_product_id'] ) && $cart_item['bogo_product_for'] == $product_id ) {
				$quantity_required = ! empty( $settings['minimum_quantity_required'] ) ? $settings['minimum_quantity_required'] : 1;
				$total_quantity    = floor( $total_quantity / $quantity_required ) * 1;
				WC()->cart->set_quantity( $cart_item['key'], $total_quantity );
				return;
			}
		}

		// Add the offer product to the cart for different offer.
		$free_product_key = WC()->cart->add_to_cart(
			$offer_product_id,
			$quantity, // Quantity of the offer product
			'',
			'',
			array(
				'parent_key'            => $cart_item_key,
				'bogo_offer'            => true,
				'bogo_product_for'      => $product_id,
				'bogo_offer_price'      => $offer_product_cost,
				'linked_to_product_key' => $cart_item_key,
			)
		);

		if ( $free_product_key && isset( WC()->cart->cart_contents[ $cart_item_key ] ) ) {
			WC()->cart->cart_contents[ $cart_item_key ]['child_key'] = $free_product_key;
		}
	}

	public function add_custom_class_to_offer_product( $class, $cart_item, $cart_item_key ) {
		// Check if the cart item is an offer product
		if ( isset( $cart_item['bogo_offer'] ) && $cart_item['bogo_offer'] ) {
			$can_remove_offer_product = Helper::sgsb_get_bogo_settings_option( 'offer_remove_from_cart', false );
			// Append custom class for BOGO offered product.
			$class .= $can_remove_offer_product ? ' sgsb-bogo-offer-applied' : ' sgsb-bogo-offer-applied sgsb-disable-bogo-offer-removed-option';
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
			$offer_product_id = empty( $offer_product_id ) && ! empty( $bogo_info->get_alternate_products[0] ) ?
				intval( $bogo_info->get_alternate_products[0] ) : $offer_product_id;

			if ( ! $offer_product_id ) {
				return;
			}

			$offer_type      = $bogo_info->offer_type;
			$discount_amount = $bogo_info->discount_amount;
			$image_url       = get_the_post_thumbnail_url( $offer_product_id, 'full' );
			$_product        = wc_get_product( $offer_product_id );
			$regular_price   = $_product->get_price();
			$offer_price     = Helper::calculate_offer_price( $offer_type, $regular_price, $discount_amount );

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
	 * Product custom price.
	 *
	 * @param object $price is all product of cart.
	 * @param object $cart_item is all product of cart.
	 * @param object $cart_item_key is all product of cart.
	 */

	public function update_woocommerce_item_price( $price, $cart_item, $cart_item_key ) {
		$product            = $cart_item['data'];
		$show_regular_price = Helper::sgsb_get_bogo_settings_option( 'regular_price_show' );
		if ( isset( $cart_item['bogo_offer_price'] ) ) {
			$regular_price = $product->get_regular_price();
			if ( $show_regular_price ) {
				$price .= '<br><span class="regular-price"><s>' . wc_price( $regular_price ) . '</s></span>';
			}
		}
		return $price;
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
