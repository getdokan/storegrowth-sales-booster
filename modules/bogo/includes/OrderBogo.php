<?php
/**
 * Post type class.
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Modules\BoGo;

use StorePulse\StoreGrowth\Traits\Singleton;
use StorePulse\StoreGrowth\Helper as HelperUtils;
use StorePulse\StoreGrowth\Interfaces\HookRegistry;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Load post type related functionality inside this class.
 */
class OrderBogo implements HookRegistry {

	use Singleton;

	/**
	 * Constructor of Woocommerce_Functionality class.
	 */
	public function register_hooks(): void {
		add_action( 'woocommerce_single_product_summary', array( $this, 'bogo_product_frontend_view' ), 6 );
		add_action( 'woocommerce_before_calculate_totals', array( $this, 'woocommerce_custom_price_to_cart_item' ) );

		add_action( 'woocommerce_add_to_cart', array( $this, 'add_offer_product_to_cart' ), 10, 6 );
		add_action( 'woocommerce_update_cart_action_cart_updated', array( $this, 'handle_cart_update' ) );
		add_action( 'woocommerce_after_cart_item_quantity_update', array( $this, 'handle_cart_update' ) );
		add_action( 'woocommerce_cart_loaded_from_session', array( $this, 'cleanup_cart_bogo_duplicates' ) );

		add_filter( 'woocommerce_product_data_tabs', array( $this, 'add_bogo_product_data_tab' ) );
		add_action( 'woocommerce_product_data_panels', array( $this, 'add_bogo_product_data_fields' ) );
		add_action( 'woocommerce_process_product_meta', array( $this, 'save_bogo_settings' ) );

		add_action( 'woocommerce_cart_item_removed', array( $this, 'remove_linked_bogo_product' ), 10, 2 );
		add_filter( 'woocommerce_cart_item_class', array( $this, 'add_custom_class_to_offer_product' ), 10, 3 );
		add_filter( 'woocommerce_cart_item_name', array( $this, 'add_custom_text_for_offer_product' ), 10, 3 );

		add_action( 'woocommerce_before_shop_loop_item_title', array( $this, 'display_bogo_floating_badge_on_product' ) );
		add_action( 'woocommerce_before_single_product_summary', array( $this, 'display_bogo_floating_badge_on_product' ) );
		add_filter( 'woocommerce_cart_item_price', array( $this, 'update_woocommerce_item_price' ), 10, 3 );

		// Store API validation for BOGO offers
		add_action( 'woocommerce_after_cart_item_quantity_update', array( $this, 'prevent_bogo_cart_item_qty_update' ), 10, 4 );

        // Prevent BOGO offers product removing option from the cart.
		add_action( 'woocommerce_remove_cart_item', array( $this, 'prevent_bogo_cart_item_remove' ), 10, 2 );
    }

    public function display_bogo_floating_badge_on_product() {
		global $product;

		// Validate product exists
		if ( ! $product || ! is_object( $product ) ) {
			return;
		}

		// Check badge display settings
		$show_shop_badge = Helper::get_bogo_settings_option( 'shop_page_bage_icon' );
		if ( is_shop() && ! $show_shop_badge ) {
			return;
		}

		$show_product_badge = Helper::get_bogo_settings_option( 'global_product_page_bage_icon' );
		if ( is_product() && ! $show_product_badge ) {
			return;
		}

		$product_id = $product->get_id();
		if ( ! $product_id ) {
			return;
		}

		// Check if product is eligible for BOGO offers
		if ( ! BogoValidator::is_product_eligible( $product ) ) {
			return;
		}

		// Initialize variables
		$offer_badge         = '';
		$shop_page_msg       = '';
		$selected_offer      = array();
		$offer_badge_url     = '';
		$product_page_msg    = '';

		// First, check for product-specific BOGO settings
		$product_settings = Helper::get_product_bogo_settings( $product_id );
		$product_bogo_status = ! empty( $product_settings['status'] ) ? esc_html( $product_settings['status'] ) : 'inactive';
		
		if ( $product_bogo_status === 'active' && BogoValidator::is_bogo_applicable( $product_id, $product_settings ) ) {
			// Use product-specific settings
			$selected_offer   = $product_settings;
			$shop_page_msg    = ! empty( $product_settings['shop_page_message'] ) ? esc_html( $product_settings['shop_page_message'] ) : '';
			$offer_badge_url  = ! empty( $product_settings['bogo_badge_image'] ) ? esc_url( $product_settings['bogo_badge_image'] ) : '';
			$product_page_msg = ! empty( $product_settings['product_page_message'] ) ? esc_html( $product_settings['product_page_message'] ) : '';
		} else {
			// Check for global BOGO offers
			$offers = Helper::get_global_offered_product_list();
			
			// Get product categories for category-based offers
			$product_categories = wp_get_post_terms( $product_id, 'product_cat', array( 'fields' => 'ids' ) );
			$product_category_ids = is_array( $product_categories ) ? $product_categories : array();

			foreach ( $offers as $offer ) {
				if ( ! isset( $offer['status'] ) || $offer['status'] !== 'active' ) {
					continue;
				}

				// Check if offer is applicable to this product
				if ( ! BogoValidator::should_display_offer( $offer, $product_id, $product_category_ids ) ) {
					continue;
				}

				// Validate the offer is currently applicable
				if ( ! BogoValidator::is_bogo_applicable( $product_id, $offer ) ) {
					continue;
				}

				$selected_offer = $offer;
				break;
			}

			if ( ! empty( $selected_offer ) ) {
				$shop_page_msg    = ! empty( $selected_offer['shop_page_message'] ) ? esc_html( $selected_offer['shop_page_message'] ) : '';
				$product_page_msg = ! empty( $selected_offer['product_page_message'] ) ? esc_html( $selected_offer['product_page_message'] ) : '';
			}
		}

		// If no applicable offer found, return early
		if ( empty( $selected_offer ) ) {
			return;
		}

		// Set badge icon and URL
		$is_pro = sp_store_growth()->has_pro();
		
		if ( ! empty( $selected_offer['enable_custom_badge_image'] ) ) {
			$offer_badge     = ! empty( $selected_offer['default_badge_icon_name'] ) ? esc_html( $selected_offer['default_badge_icon_name'] ) : '';
			$offer_badge_url = $is_pro && ! empty( $selected_offer['default_custom_badge_icon'] ) ? esc_url( $selected_offer['default_custom_badge_icon'] ) : '';
		} else {
			$offer_badge     = Helper::get_bogo_settings_option( 'default_badge_icon_name' );
			$offer_badge_url = $is_pro ? Helper::get_bogo_settings_option( 'default_custom_badge_icon' ) : '';
		}

		// If no badge icon or URL, don't display
		if ( empty( $offer_badge ) && empty( $offer_badge_url ) ) {
			return;
		}

		// Load and include the badge template
		$path = apply_filters( 'spsg_load_bogo_badge_content', __DIR__ . '/../templates/bogo-offer-badge.php', $selected_offer );
		if ( ! file_exists( $path ) ) {
			return;
		}

		include $path;
	}

	public function handle_cart_update() {
		// Early exit if cart is not available
		if ( ! WC()->cart || WC()->cart->is_empty() ) {
			return;
		}

		// Prevent recursion
		static $updating = false;
		if ( $updating ) {
			return;
		}
		$updating = true;

		try {
			// Get the cart items
			$cart_items = WC()->cart->get_cart();
			
			if ( empty( $cart_items ) || ! is_array( $cart_items ) ) {
				return;
			}

			// Iterate through the cart items.
			foreach ( $cart_items as $cart_item_key => $cart_item ) {
				// Validate cart item structure
				if ( ! is_array( $cart_item ) || empty( $cart_item_key ) ) {
					continue;
				}

				// Handle BOGO offer products with changed quantity
				if ( isset( $cart_item['changed_product_id'] ) ) {
					$this->handle_bogo_offer_quantity_update( $cart_item_key, $cart_item, $cart_items );
					continue;
				}

				// Skip if this is already a BOGO offer product
				if ( isset( $cart_item['bogo_offer'] ) && $cart_item['bogo_offer'] ) {
					continue;
				}

				// Handle regular products with BOGO eligibility
				$this->handle_regular_product_bogo_update( $cart_item_key, $cart_item, $cart_items );
			}
		} catch ( \Exception $e ) {
			// Log error but don't break the cart functionality
			wc_get_logger()->error( 'BOGO cart update error: ' . $e->getMessage() );
		} finally {
			$updating = false;
		}
	}

	/**
	 * Handle quantity update for BOGO offer products.
	 *
	 * @param string $cart_item_key Cart item key.
	 * @param array  $cart_item Cart item data.
	 * @param array  $cart_items All cart items.
	 */
	private function handle_bogo_offer_quantity_update( $cart_item_key, $cart_item, $cart_items ) {
		// Validate linked product key exists
		if ( empty( $cart_item['linked_to_product_key'] ) ) {
			return;
		}

		$linked_key = $cart_item['linked_to_product_key'];
		
		// Check if parent item still exists in cart
		if ( ! isset( $cart_items[ $linked_key ] ) || ! isset( WC()->cart->cart_contents[ $linked_key ] ) ) {
			// Parent item removed, remove this offer product too
			WC()->cart->remove_cart_item( $cart_item_key );
			return;
		}

		$parent_item = WC()->cart->cart_contents[ $linked_key ];
		
		// Validate parent item structure
		if ( ! is_array( $parent_item ) ) {
			return;
		}

		$product_id   = ! empty( $parent_item['product_id'] ) ? intval( $parent_item['product_id'] ) : 0;
		$variation_id = ! empty( $parent_item['variation_id'] ) ? intval( $parent_item['variation_id'] ) : 0;
		$parent_quantity = ! empty( $parent_item['quantity'] ) ? intval( $parent_item['quantity'] ) : 0;

		if ( $product_id <= 0 || $parent_quantity <= 0 ) {
			return;
		}

		$apply_able_product_id = ! empty( $variation_id ) ? $variation_id : $product_id;
		$bogo_settings = Helper::prepare_bogo_settings( $apply_able_product_id, $product_id, $variation_id );

		if ( empty( $bogo_settings ) ) {
			return;
		}

		$required_quantity = ! empty( $bogo_settings['minimum_quantity_required'] ) ? intval( $bogo_settings['minimum_quantity_required'] ) : 1;
		$required_quantity = max( 1, $required_quantity ); // Ensure minimum of 1
		
		$free_product_quantity = floor( $parent_quantity / $required_quantity ) * 1;
		
		// Update the offer product quantity
		if ( $free_product_quantity > 0 ) {
			WC()->cart->cart_contents[ $cart_item_key ]['quantity'] = $free_product_quantity;
		} else {
			// Remove offer product if parent quantity doesn't meet requirements
			WC()->cart->remove_cart_item( $cart_item_key );
		}
	}

	/**
	 * Handle BOGO update for regular products.
	 *
	 * @param string $cart_item_key Cart item key.
	 * @param array  $cart_item Cart item data.
	 * @param array  $cart_items All cart items.
	 */
	private function handle_regular_product_bogo_update( $cart_item_key, $cart_item, $cart_items ) {
		$product_id   = ! empty( $cart_item['product_id'] ) ? intval( $cart_item['product_id'] ) : 0;
		$variation_id = ! empty( $cart_item['variation_id'] ) ? intval( $cart_item['variation_id'] ) : 0;
		$quantity     = ! empty( $cart_item['quantity'] ) ? intval( $cart_item['quantity'] ) : 0;

		if ( $product_id <= 0 || $quantity <= 0 ) {
			return;
		}

		$apply_able_product_id = ! empty( $variation_id ) ? $variation_id : $product_id;
		$bogo_settings = Helper::prepare_bogo_settings( $apply_able_product_id, $product_id, $variation_id );

		if ( empty( $bogo_settings ) ) {
			return;
		}

		// Get offer product info.
		$offer_product_id = BogoValidator::get_offer_product_id( $bogo_settings, $product_id );
		if ( ! $offer_product_id ) {
			return;
		}
		
		$offer_product = wc_get_product( $offer_product_id );
		if ( ! $offer_product ) {
			return;
		}

		$free_product_quantity = apply_filters( 'spsg_free_product_quantity_for_cart_update', $quantity, $bogo_settings, $cart_item );
		
		// Validate the calculated quantity
		if ( ! is_numeric( $free_product_quantity ) || $free_product_quantity < 0 ) {
			return;
		}

		// Check for existing BOGO offer to prevent duplicates
		$existing_offer_key = $this->find_existing_bogo_offer( $cart_item_key, $product_id, $offer_product_id );
		
		if ( $existing_offer_key ) {
			// Update existing offer quantity
			if ( $free_product_quantity > 0 ) {
				WC()->cart->cart_contents[ $existing_offer_key ]['quantity'] = $free_product_quantity;
			} else {
				// Remove offer product if quantity is 0
				WC()->cart->remove_cart_item( $existing_offer_key );
				unset( WC()->cart->cart_contents[ $cart_item_key ]['child_key'] );
			}
		} elseif ( $free_product_quantity > 0 ) {
			// Add new offer product only if quantity is greater than 0 and no existing offer
			$this->add_offer_product_to_cart( $cart_item_key, $product_id, $free_product_quantity, $variation_id, array(), $cart_item );
		}
	}

	/**
	 * Clean up BOGO duplicates when cart is loaded from session.
	 * This helps clean up any duplicates that might have been created in previous sessions.
	 */
	public function cleanup_cart_bogo_duplicates() {
		if ( ! WC()->cart || WC()->cart->is_empty() ) {
			return;
		}

		$cart_items = WC()->cart->get_cart();
		$parent_offers = array(); // Track offers by parent product
		$keys_to_remove = array();

		// Group BOGO offers by parent product
		foreach ( $cart_items as $cart_key => $cart_item ) {
			if ( ! isset( $cart_item['bogo_offer'] ) || ! $cart_item['bogo_offer'] ) {
				continue;
			}

			if ( ! isset( $cart_item['bogo_product_for'] ) || ! isset( $cart_item['linked_to_product_key'] ) ) {
				// Invalid BOGO offer, remove it
				$keys_to_remove[] = $cart_key;
				continue;
			}

			$parent_product_id = intval( $cart_item['bogo_product_for'] );
			$parent_cart_key = $cart_item['linked_to_product_key'];
			$offer_product_id = intval( $cart_item['product_id'] );
			
			// Check if parent still exists
			if ( ! isset( $cart_items[ $parent_cart_key ] ) ) {
				$keys_to_remove[] = $cart_key;
				continue;
			}

			$key = $parent_cart_key . '_' . $parent_product_id . '_' . $offer_product_id;
			
			if ( isset( $parent_offers[ $key ] ) ) {
				// Duplicate found, mark for removal
				$keys_to_remove[] = $cart_key;
			} else {
				$parent_offers[ $key ] = $cart_key;
			}
		}

		// Remove duplicates
		foreach ( $keys_to_remove as $key_to_remove ) {
			WC()->cart->remove_cart_item( $key_to_remove );
		}
	}

	public function add_custom_text_for_offer_product( $product_name, $cart_item, $cart_item_key ) {
		if ( isset( $cart_item['bogo_offer'] ) && $cart_item['bogo_offer'] ) {
			$bogo_settings = Helper::prepare_bogo_settings( $cart_item['bogo_product_for'], $cart_item['product_id'], $cart_item['variation_id'] );
			if ( file_exists( __DIR__ . '/../templates/bogo-offer-products-popup.php' ) ) {
				ob_start();
				include __DIR__ . '/../templates/bogo-offer-products-popup.php';
				$product_name .= ob_get_clean();
			}
		}

		return $product_name;
	}

	public function is_bogo_applicable( $product_id, $bogo_settings ) {
		return BogoValidator::is_bogo_applicable( $product_id, $bogo_settings );
	}

	public function add_offer_product_to_cart( $cart_item_key, $product_id, $quantity, $variation_id, $variation, $cart_item ) {
		// Get apply product id.
		$apply_able_product_id = apply_filters( 'spsg_bogo_get_apply_able_product_id', $product_id, $variation_id );
		$bogo_settings         = Helper::prepare_bogo_settings( $apply_able_product_id, $product_id, $variation_id );

		// Apply BOGO product if not offer product, different apply & applicable.
		if ( empty( $cart_item['bogo_offer'] ) && ! empty( $bogo_settings ) &&
			( $bogo_settings['bogo_deal_type'] !== 'same' ) &&
			$this->is_bogo_applicable( $apply_able_product_id, $bogo_settings )
		) {
			// Clean up any duplicate BOGO offers before applying new one
			$this->clean_duplicate_bogo_offers( $cart_item_key, $apply_able_product_id );
			$this->apply_bogo_product( $bogo_settings, $apply_able_product_id, $cart_item_key, $quantity );
		}
	}

	/**
	 * Clean up duplicate BOGO offers for the same parent product.
	 *
	 * @param string $parent_cart_key Parent cart item key.
	 * @param int    $parent_product_id Parent product ID.
	 */
	private function clean_duplicate_bogo_offers( $parent_cart_key, $parent_product_id ) {
		$cart_items = WC()->cart->get_cart();
		$found_offers = array();
		$keys_to_remove = array();
		
		foreach ( $cart_items as $cart_key => $cart_item ) {
			// Skip if not a BOGO offer
			if ( ! isset( $cart_item['bogo_offer'] ) || ! $cart_item['bogo_offer'] ) {
				continue;
			}
			
			// Skip if not linked to the target parent
			if ( ! isset( $cart_item['linked_to_product_key'] ) || 
				 $cart_item['linked_to_product_key'] !== $parent_cart_key ||
				 ! isset( $cart_item['bogo_product_for'] ) ||
				 intval( $cart_item['bogo_product_for'] ) !== intval( $parent_product_id ) ) {
				continue;
			}
			
			$offer_product_id = intval( $cart_item['product_id'] );
			$offer_key = $parent_product_id . '_' . $offer_product_id;
			
			if ( isset( $found_offers[ $offer_key ] ) ) {
				// This is a duplicate, mark for removal
				$keys_to_remove[] = $cart_key;
			} else {
				// First occurrence of this offer
				$found_offers[ $offer_key ] = $cart_key;
			}
		}
		
		// Remove duplicate offers
		foreach ( $keys_to_remove as $key_to_remove ) {
			WC()->cart->remove_cart_item( $key_to_remove );
		}
		
		// Clean up child_key references from parent if multiple were found
		if ( count( $found_offers ) > 1 && isset( WC()->cart->cart_contents[ $parent_cart_key ] ) ) {
			unset( WC()->cart->cart_contents[ $parent_cart_key ]['child_key'] );
		}
	}

	public function apply_bogo_product( $settings, $product_id, $cart_item_key, $quantity = 1 ) {
		// Use BogoValidator instead of Helper for consistent offer product ID retrieval
		$offer_product_id = BogoValidator::get_offer_product_id( $settings, $product_id );
		$product = wc_get_product( $offer_product_id );

		// Check if product exists before accessing its methods
		if ( ! $product ) {
			return;
		}

		// Check if BOGO offer already exists for this parent product to prevent duplicates
		$existing_offer_key = $this->find_existing_bogo_offer( $cart_item_key, $product_id, $offer_product_id );
		if ( $existing_offer_key ) {
			// Update existing offer quantity instead of adding duplicate
			$this->update_existing_bogo_offer_quantity( $existing_offer_key, $quantity, $settings );
			return;
		}

		// Determine the cost of the offer product (if necessary)
		$offer_product_cost = 0; // Assume free by default
		if ( isset( $settings['offer_type'] ) && $settings['offer_type'] === 'discount' ) {
			$offer_product_cost = max( $product->get_price() - ( $product->get_price() * ( $settings['discount_amount'] / 100 ) ), 0 );
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

	/**
	 * Find existing BOGO offer for the same parent product.
	 *
	 * @param string $parent_cart_key Parent cart item key.
	 * @param int    $parent_product_id Parent product ID.
	 * @param int    $offer_product_id Offer product ID.
	 * @return string|false Existing offer cart key or false if not found.
	 */
	private function find_existing_bogo_offer( $parent_cart_key, $parent_product_id, $offer_product_id ) {
		$cart_items = WC()->cart->get_cart();
		
		foreach ( $cart_items as $cart_key => $cart_item ) {
			// Check if this is a BOGO offer product
			if ( ! isset( $cart_item['bogo_offer'] ) || ! $cart_item['bogo_offer'] ) {
				continue;
			}
			
			// Check if it's linked to the same parent product
			if ( isset( $cart_item['linked_to_product_key'] ) && 
				 $cart_item['linked_to_product_key'] === $parent_cart_key &&
				 isset( $cart_item['bogo_product_for'] ) &&
				 intval( $cart_item['bogo_product_for'] ) === intval( $parent_product_id ) &&
				 intval( $cart_item['product_id'] ) === intval( $offer_product_id ) ) {
				return $cart_key;
			}
		}
		
		return false;
	}

	/**
	 * Update existing BOGO offer quantity.
	 *
	 * @param string $offer_cart_key Offer cart item key.
	 * @param int    $new_quantity New quantity.
	 * @param array  $settings BOGO settings.
	 */
	private function update_existing_bogo_offer_quantity( $offer_cart_key, $new_quantity, $settings ) {
		// Get the parent item to calculate the correct quantity
		$cart_items = WC()->cart->get_cart();
		$offer_item = $cart_items[ $offer_cart_key ] ?? null;
		
		if ( ! $offer_item || ! isset( $offer_item['linked_to_product_key'] ) ) {
			return;
		}
		
		$parent_item = $cart_items[ $offer_item['linked_to_product_key'] ] ?? null;
		if ( ! $parent_item ) {
			return;
		}
		
		$parent_quantity = intval( $parent_item['quantity'] );
		$required_quantity = ! empty( $settings['minimum_quantity_required'] ) ? intval( $settings['minimum_quantity_required'] ) : 1;
		$required_quantity = max( 1, $required_quantity );
		
		// Calculate the correct offer quantity based on parent quantity
		$calculated_quantity = floor( $parent_quantity / $required_quantity ) * 1;
		
		if ( $calculated_quantity > 0 ) {
			WC()->cart->cart_contents[ $offer_cart_key ]['quantity'] = $calculated_quantity;
		} else {
			// Remove offer if parent quantity doesn't meet requirements
			WC()->cart->remove_cart_item( $offer_cart_key );
			// Also remove child_key reference from parent
			if ( isset( WC()->cart->cart_contents[ $offer_item['linked_to_product_key'] ]['child_key'] ) ) {
				unset( WC()->cart->cart_contents[ $offer_item['linked_to_product_key'] ]['child_key'] );
			}
		}
	}

	public function add_custom_class_to_offer_product( $class, $cart_item, $cart_item_key ) {
		// Check if the cart item is an offer product
		if ( isset( $cart_item['bogo_offer'] ) && $cart_item['bogo_offer'] ) {
			$can_remove_offer_product = Helper::get_bogo_settings_option( 'offer_remove_from_cart', false );
			// Append custom class for BOGO offered product.
			$class .= $can_remove_offer_product ? ' spsg-bogo-offer-applied' : ' spsg-bogo-offer-applied spsg-disable-bogo-offer-removed-option';
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
		$all_cart_products       = $woocommerce->cart->get_cart();
		$all_cart_product_ids    = array();
		$current_product_category_ids = array();
		$showed_bogo_product_id  = array();

		// Check if product is eligible for BOGO offers
		if ( ! BogoValidator::is_product_eligible( $product ) ) {
			return;
		}

		// Get cart product IDs
		foreach ( $all_cart_products as $cart_item ) {
			$product_id = $cart_item['product_id'];
			$all_cart_product_ids[] = $product_id;
		}

		// Get current product category IDs for category-based offers
		$product_categories = get_the_terms( $current_product_id, 'product_cat' );
		if ( $product_categories && ! is_wp_error( $product_categories ) ) {
			foreach ( $product_categories as $category ) {
				$current_product_category_ids[] = $category->term_id;
			}
		}

		// Check for product-specific BOGO settings first
		$product_bogo_settings = Helper::get_product_bogo_settings( $current_product_id );
		
		if ( $product_bogo_settings && isset( $product_bogo_settings['status'] ) && 'active' === $product_bogo_settings['status'] ) {
			$this->display_bogo_offer( $product_bogo_settings, $current_product_id, $current_product_id );
		}

		// Check for global BOGO offers
		$global_bogo_offers = Helper::get_global_offered_products();
		
		foreach ( $global_bogo_offers as $bogo_offer ) {

			// Use BogoValidator to check if offer should be displayed
			if ( ! BogoValidator::should_display_offer( $bogo_offer, $current_product_id, $current_product_category_ids ) ) {
				continue;
			}
			
			$offer_product_id = BogoValidator::get_offer_product_id( $bogo_offer, $current_product_id );
			
			if ( $offer_product_id && ! in_array( $offer_product_id, $showed_bogo_product_id, true ) ) {

				$this->display_bogo_offer( $bogo_offer, $current_product_id, $offer_product_id );
				$showed_bogo_product_id[] = $offer_product_id;
			}
		}
	}

	/**
	 * Display BOGO offer on frontend.
	 *
	 * @param array $bogo_settings BOGO settings.
	 * @param int   $current_product_id Current product ID.
	 * @param int   $offer_product_id Offer product ID.
	 */
	private function display_bogo_offer( $bogo_settings, $current_product_id, $offer_product_id ) {
		$deal_type       = $bogo_settings['bogo_deal_type'] ?? 'different';
		$bogo_status     = $bogo_settings['status'] ?? 'inactive';
		$offer_type      = $bogo_settings['offer_type'] ?? 'free';
		$discount_amount = $bogo_settings['discount_amount'] ?? 0;
		
		$image_url = get_the_post_thumbnail_url( $offer_product_id, 'full' );
		$_product  = wc_get_product( $offer_product_id );
		
		// Check if product exists before accessing its methods
		if ( ! $_product ) {
			return;
		}
		
		$regular_price = $_product->get_price();
		$offer_price   = Helper::calculate_offer_price( $offer_type, $regular_price, $discount_amount );
		
		// Prepare template variables
		$offered_product = $current_product_id; // The product that triggers the offer
		
		// Create bogo_info object with styling and settings
		$bogo_info = (object) array_merge( $bogo_settings, array(
			// Default styling values (can be overridden by settings)
			'box_border_style' => $bogo_settings['box_border_style'] ?? 'solid',
			'box_border_color' => $bogo_settings['box_border_color'] ?? '#e0e0e0',
			'box_top_margin' => $bogo_settings['box_top_margin'] ?? 10,
			'box_bottom_margin' => $bogo_settings['box_bottom_margin'] ?? 10,
			'discount_background_color' => $bogo_settings['discount_background_color'] ?? '#ff6b6b',
			'discount_text_color' => $bogo_settings['discount_text_color'] ?? '#ffffff',
			'discount_font_size' => $bogo_settings['discount_font_size'] ?? 14,
			'product_description_text_color' => $bogo_settings['product_description_text_color'] ?? '#333333',
			'product_description_font_size' => $bogo_settings['product_description_font_size'] ?? 12,
			'product_page_message' => $bogo_settings['product_page_message'] ?? '',
			'offered_products' => $bogo_settings['offered_products'][0] ?? $current_product_id,
		));
		
		// Include the appropriate template
		if ( $current_product_id === $offer_product_id ) {
			$template_path = __DIR__ . '/../templates/bogo-product-meta-front-view.php';
			if ( file_exists( $template_path ) ) {
				include $template_path;
			}
		} else {
			$template_path = __DIR__ . '/../templates/bogo-product-front-view.php';
			require $template_path;
		}
	}

	/**
	 * Get offer product ID from BOGO settings.
	 *
	 * @param array $bogo_settings BOGO settings.
	 * @param int   $current_product_id Current product ID.
	 * @return int|null Offer product ID or null if not found.
	 */
	private function get_offer_product_id_from_settings( $bogo_settings, $current_product_id ) {
		return BogoValidator::get_offer_product_id( $bogo_settings, $current_product_id );
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
		$show_regular_price = Helper::get_bogo_settings_option( 'regular_price_show' );
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

		// Check if product exists before accessing its methods
		if ( ! $product ) {
			return $product_data_tabs;
		}

		// Check if product is eligible for BOGO offers
		if ( ! BogoValidator::is_product_eligible( $product ) ) {
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
		if ( ! Helper::is_load_product_bogo_offer( $product_id ) ) {
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
		if ( ! isset( $_POST['_spsg_bogo_settings_nonce'] ) ) {
			return;
		}

		// Verify that the nonce is valid.
		if ( ! wp_verify_nonce( $_POST['_spsg_bogo_settings_nonce'], 'spsg_bogo_settings' ) ) {
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

		$bogo_enabled = isset( $_POST['bogo_status'] ) ? 'active' : 'inactive';
		$bogo_type    = isset( $_POST['bogo_type'] ) ? sanitize_text_field( wp_unslash( $_POST['bogo_type'] ) ) : 'same';
		$deal_type    = isset( $_POST['bogo_deal_type'] ) ? sanitize_text_field( wp_unslash( $_POST['bogo_deal_type'] ) ) : 'same';

		$bogo_settings_data = array(
			'bogo_type'      => $bogo_type,
			'status'    => $bogo_enabled,
			'bogo_deal_type' => $deal_type,
		);

		$current_product     = wc_get_product( $post_id );
		
		// Check if product exists before accessing its methods
		if ( ! $current_product ) {
			return;
		}
		
		$is_variable_product = $current_product->is_type( 'variable' );
		if ( ! $is_variable_product ) {
			$offer_type           = isset( $_POST['offer_type'] ) ? sanitize_text_field( wp_unslash( $_POST['offer_type'] ) ) : 'free';
			$get_product          = isset( $_POST['get_different_product_field'] ) ? sanitize_text_field( wp_unslash( $_POST['get_different_product_field'] ) ) : '';
			$bogo_products        = isset( $_POST['get_alternate_products'] ) ? wc_clean( wp_unslash( $_POST['get_alternate_products'] ) ) : array();
			$bogo_badge_image     = isset( $_POST['bogo_badge_image'] ) ? sanitize_url( $_POST['bogo_badge_image'] ) : '';
			$product_discount     = isset( $_POST['discount_amount'] ) ? sanitize_text_field( wp_unslash( $_POST['discount_amount'] ) ) : 0;
			$shop_page_message    = isset( $_POST['shop_page_message'] ) ? sanitize_text_field( wp_unslash( $_POST['shop_page_message'] ) ) : '';
			$product_page_message = isset( $_POST['product_page_message'] ) ? sanitize_text_field( wp_unslash( $_POST['product_page_message'] ) ) : '';
			$offer_schedule       = isset( $_POST['offer_schedule'] ) ? wc_clean( wp_unslash( $_POST['offer_schedule'] ) ) : array( 'daily' );
			$offer_start          = isset( $_POST['offer_start'] ) ? sanitize_text_field( wp_unslash( $_POST['offer_start'] ) ) : '';
			$offer_end            = isset( $_POST['offer_end'] ) ? sanitize_text_field( wp_unslash( $_POST['offer_end'] ) ) : '';

			$bogo_settings_data['offer_type']                  = $offer_type;
			$bogo_settings_data['discount_amount']             = $product_discount;
			$bogo_settings_data['bogo_badge_image']            = $bogo_badge_image;
			$bogo_settings_data['shop_page_message']           = $shop_page_message;
			$bogo_settings_data['product_page_message']        = $product_page_message;
			$bogo_settings_data['get_alternate_products']      = $bogo_products;
			$bogo_settings_data['get_different_product_field'] = $get_product;
			$bogo_settings_data['offer_schedule']              = $offer_schedule;
			$bogo_settings_data['offer_start']                 = $offer_start;
			$bogo_settings_data['offer_end']                   = $offer_end;
		}

		$bogo_settings_data['offered_products'] = [ $post_id ];

		$bogo_settings_data = apply_filters(
			'spsg_before_save_bogo_settings_data',
			$bogo_settings_data,
			$is_variable_product
		);

		\StorePulse\StoreGrowth\Modules\BoGo\BogoDataManager::save_product_bogo_settings( $post_id, 0, $bogo_settings_data );
		
		// Sync offer schedules between product and global offers
		\StorePulse\StoreGrowth\Modules\BoGo\BogoDataManager::sync_offer_schedules( $post_id );
	}

	/**
	 * Prevent quantity updates for BOGO offer products in cart.
	 *
	 * @param string $cart_item_key Cart item key.
	 * @param int    $quantity New quantity.
	 * @param int    $old_quantity Old quantity.
	 * @param WC_Cart $cart Cart object.
	 */
	public function prevent_bogo_cart_item_qty_update( $cart_item_key, $quantity, $old_quantity, $cart ) {
		$cart_item = $cart->get_cart_item( $cart_item_key );
		if ( isset( $cart_item['bogo_offer'] ) && $cart_item['bogo_offer'] && ! isset( $_POST['add-to-cart'] ) ) {

			// If someone is trying to change the quantity of a BOGO offer product
			if ( $old_quantity && $quantity != $old_quantity ) {
				// Add a notice to inform the user
				wc_add_notice( 
					__( 'The quantity of BOGO offer products cannot be changed manually. It is automatically managed based on your purchase.', 'storegrowth-sales-booster' ), 
					'error' 
				);

				$cart->cart_contents[ $cart_item_key ]['quantity'] = $old_quantity;
			}
		}
	}

    /**
     * Prevent quantity updates for BOGO offer products in cart.
     *
     * @since 1.28.14
     *
     * @param string   $cart_item_key Cart item key.
     * @param \WC_Cart $cart          WC Cart object.
     *
     * @retun void
     */
    public function prevent_bogo_cart_item_remove( $cart_item_key, $cart ) {
		// Check if a product is eligible for BOGO offers.
	    $server = HelperUtils::get_rest_request()->get_params();
	    $key    = $server['requests'][0]['body']['key'] ?? '';

		if ( ! $key ) {
			$key = $_REQUEST['remove_item'] ?? ''; // When try to remove from the Classic cart page.
		}

		// Prevent offered products removed from the cart.
	    $cart_item = $cart->get_cart_item( $key );
        if ( isset( $cart_item['bogo_offer'] ) && $cart_item['bogo_offer'] ) {
            $can_remove_offer_product = Helper::get_bogo_settings_option( 'offer_remove_from_cart', false );
            if ( ! $can_remove_offer_product ) {
	            throw new \Exception(
					esc_html__( 'The BOGO offer products cannot be removed manually. It will be automatically added based on your purchase.', 'storegrowth-sales-booster' )
	            );
            }
        }
    }
}
