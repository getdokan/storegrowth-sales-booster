<?php
/**
 * Post type class.
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Modules\BoGo;

use StorePulse\StoreGrowth\Analytics\Counter;
use StorePulse\StoreGrowth\Attribution\OfferAttribution;
use StorePulse\StoreGrowth\Pricing\CartLine;
use StorePulse\StoreGrowth\Pricing\Decision;
use StorePulse\StoreGrowth\Pricing\DealList;
use StorePulse\StoreGrowth\Pricing\Referee;
use StorePulse\StoreGrowth\Traits\Singleton;
use StorePulse\StoreGrowth\Helper as HelperUtils;
use StorePulse\StoreGrowth\Interfaces\HookRegistry;
use StorePulse\StoreGrowth\Offers\OfferVersions;
use StorePulse\StoreGrowth\Support\Money;

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
	 * Whether the cart itself is removing a gift.
	 *
	 * @since SPSG_VERSION
	 *
	 * @var bool
	 */
	private $removing_gift = false;

	/**
	 * Cart item key on a bought line: its gift is out while a coupon wins.
	 *
	 * @since SPSG_VERSION
	 */
	const GIFT_HELD = '_spsg_gift_held';

	/**
	 * Cart item key on a bought line: its gift was already counted.
	 *
	 * @since SPSG_VERSION
	 */
	const GIFT_COUNTED = '_spsg_gift_counted';

	/**
	 * Whether a held gift is being returned to the cart.
	 *
	 * @since SPSG_VERSION
	 *
	 * @var bool
	 */
	private $returning_gift = false;

	/**
	 * Constructor of Woocommerce_Functionality class.
	 */
	public function register_hooks(): void {
		add_action( 'woocommerce_single_product_summary', array( $this, 'bogo_product_frontend_view' ), 6 );
		add_action( 'woocommerce_before_calculate_totals', array( $this, 'woocommerce_custom_price_to_cart_item' ) );
		add_filter( 'spsg_cart_deals', [ $this, 'report_cart_deals' ], 10, 2 );
		add_action( 'spsg_referee_decided', [ $this, 'apply_referee_decision' ], 10, 2 );

		add_action( 'woocommerce_add_to_cart', array( $this, 'add_offer_product_to_cart' ), 10, 6 );
		add_action( 'woocommerce_update_cart_action_cart_updated', array( $this, 'handle_cart_update' ) );
		add_action( 'woocommerce_after_cart_item_quantity_update', array( $this, 'handle_cart_update' ) );
		add_action( 'woocommerce_cart_loaded_from_session', array( $this, 'cleanup_cart_bogo_duplicates' ) );

		add_filter( 'woocommerce_product_data_tabs', array( $this, 'add_bogo_product_data_tab' ) );
		add_action( 'woocommerce_product_data_panels', array( $this, 'add_bogo_product_data_fields' ) );
		add_action( 'woocommerce_process_product_meta', array( $this, 'save_bogo_settings' ) );
		add_action( 'admin_notices', array( $this, 'show_bogo_product_save_notice' ) );

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

		// FlyCart integration: show BOGO badge and original price on free items.
		add_action( 'spsg_fly_cart_item_bogo_badge', array( $this, 'display_bogo_badge_in_fly_cart' ), 10, 3 );
		add_filter( 'spsg_fly_cart_item_price_html', array( $this, 'modify_fly_cart_bogo_price_html' ), 10, 3 );
    }

	/**
	 * Show a one-time admin notice when a product BOGO could not be enabled on save
	 * (e.g. "Enable BOGO" was checked but no offer product was selected).
	 */
	public function show_bogo_product_save_notice() {
		$key     = 'spsg_bogo_product_notice_' . get_current_user_id();
		$message = get_transient( $key );

		if ( empty( $message ) ) {
			return;
		}

		delete_transient( $key );
		printf(
			'<div class="notice notice-warning is-dismissible"><p>%s</p></div>',
			esc_html( $message )
		);
	}

	/**
	 * The rule a badge reads: the one a running campaign puts on the product,
	 * or the everyday one, as `effective_offer` says applies now.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param mixed $offer      The everyday rule, if any (older readers may return false).
	 * @param int   $product_id Product id.
	 *
	 * @return array Empty when no rule is live.
	 */
	private static function effective_badge_offer( $offer, int $product_id ): array {
		$rule = BogoDataManager::with_campaign_rule( is_array( $offer ) ? $offer : null, $product_id );

		if ( empty( $rule ) ) {
			return [];
		}

		$effective = OfferVersions::effective_offer( array_merge( $rule, [ 'offer_kind' => OfferVersions::BOGO ] ) );

		return $effective['live'] ? $effective['values'] : [];
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

		// The badge follows the version that applies now, a campaign's included.
		$selected_offer = self::effective_badge_offer( ! empty( $selected_offer ) ? $selected_offer : null, (int) $product_id );

		// If no applicable offer found, return early
		if ( empty( $selected_offer ) ) {
			return;
		}

		$shop_page_msg    = ! empty( $selected_offer['shop_page_message'] ) ? esc_html( $selected_offer['shop_page_message'] ) : $shop_page_msg;
		$product_page_msg = ! empty( $selected_offer['product_page_message'] ) ? esc_html( $selected_offer['product_page_message'] ) : $product_page_msg;

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

		$free_product_quantity = Helper::get_offer_quantity( $bogo_settings, $parent_quantity );
		
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

		// An offer that isn't live gives nothing new; the next calculation removes its gift.
		if ( empty( $bogo_settings ) || ! BogoValidator::is_offer_live( $bogo_settings ) ) {
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

		/**
		 * Filters how many offer products a cart line's quantity earns on a cart update.
		 *
		 * @since 2.0.0
		 *
		 * @param int   $free_product_quantity Offer quantity: whole multiples of the minimum quantity.
		 * @param array $bogo_settings         The BOGO offer.
		 * @param array $cart_item             The target cart item.
		 */
		$free_product_quantity = apply_filters( 'spsg_free_product_quantity_for_cart_update', Helper::get_offer_quantity( $bogo_settings, $quantity ), $bogo_settings, $cart_item );
		
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

			// Gifts for the line's whole quantity (an add to an existing line
			// passes only the added amount), one per minimum quantity.
			$line_quantity = WC()->cart->cart_contents[ $cart_item_key ]['quantity'] ?? $quantity;
			$this->apply_bogo_product( $bogo_settings, $apply_able_product_id, $cart_item_key, Helper::get_offer_quantity( $bogo_settings, $line_quantity ) );
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
		// A larger coupon won this line: no gift while it does.
		if ( Referee::coupon_won( (string) $cart_item_key ) ) {
			return;
		}

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

		// Below the minimum quantity: no gift yet.
		if ( $quantity < 1 ) {
			return;
		}

		$variation_id         = 0;
		$variation_attributes = array();
		$price_product        = $product; // Product used for price calculation.

		// Handle variable gift products - resolve the variation to add.
		if ( $product->is_type( 'variable' ) ) {
			$resolved = $this->resolve_gift_variation( $offer_product_id, $product );

			if ( empty( $resolved ) ) {
				return; // No purchasable variation available.
			}

			$variation_id         = $resolved['variation_id'];
			$variation_attributes = $resolved['attributes'];
			$price_product        = wc_get_product( $variation_id );

			if ( ! $price_product ) {
				return;
			}
		}

		// Cart item data (the deal, never a price: see
		// woocommerce_custom_price_to_cart_item()), plus additive campaign attribution keys for revenue reporting.
		$cart_item_data = array(
			'parent_key'            => $cart_item_key,
			'bogo_offer'            => true,
			'bogo_product_for'      => $product_id,
			'linked_to_product_key' => $cart_item_key,
		);
		$cart_item_data = array_merge( $cart_item_data, Helper::build_offer_stamp( $settings, $price_product ) );

		// Add the offer product to the cart for different offer.
		$free_product_key = WC()->cart->add_to_cart(
			$offer_product_id,
			$quantity, // Quantity of the offer product
			$variation_id,
			$variation_attributes,
			$cart_item_data
		);

		if ( $free_product_key && isset( WC()->cart->cart_contents[ $cart_item_key ] ) ) {
			WC()->cart->cart_contents[ $cart_item_key ]['child_key'] = $free_product_key;
		}

		if ( $free_product_key && ! empty( $settings['id'] ) && $this->is_new_gift( (string) $cart_item_key ) ) {
			Counter::bump( BoGoModule::get_id(), 'add_to_cart', Counter::CAMPAIGN, (int) $settings['id'] );

			WC()->cart->cart_contents[ $cart_item_key ][ self::GIFT_COUNTED ] = true;
		}
	}

	/**
	 * Whether a gift being added counts as a new one: every gift the shopper
	 * earns, but not one coming back after a coupon held it.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param string $trigger_key Bought line's cart item key.
	 *
	 * @return bool
	 */
	private function is_new_gift( string $trigger_key ): bool {
		return ! $this->returning_gift || empty( WC()->cart->cart_contents[ $trigger_key ][ self::GIFT_COUNTED ] );
	}

	/**
	 * Report this cart's BOGO deals: one per bought line that has earned a
	 * gift, whether the gift is in the cart or held back. The amount is the
	 * gift's whole discount at fresh prices, so what happens to the gift line
	 * can't change it.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array[]  $deals Deals.
	 * @param \WC_Cart $cart  Cart.
	 *
	 * @return array[]
	 */
	public function report_cart_deals( $deals, $cart ) {
		foreach ( $cart->get_cart() as $key => $item ) {
			if ( ! Helper::is_gift_line( $item ) ) {
				$deals = $this->add_line_deal( $deals, $cart, (string) $key, $item );
			}
		}

		return $deals;
	}

	/**
	 * Add one bought line's BOGO deal, if it has one.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array[]  $deals Deals.
	 * @param \WC_Cart $cart  Cart.
	 * @param string   $key   Bought line's cart item key.
	 * @param array    $item  Bought line.
	 *
	 * @return array[]
	 */
	private function add_line_deal( array $deals, $cart, string $key, array $item ): array {
		$effective = $this->get_trigger_effective( $item );
		$settings  = $effective['values'] ?? null;
		$earned    = $settings ? $this->get_earned_gifts( $settings, $item ) : 0;

		if ( $earned < 1 ) {
			return $deals;
		}

		$gift_key = $this->find_gift_key( $cart, $key );
		$apply_id = ! empty( $item['variation_id'] ) ? (int) $item['variation_id'] : (int) $item['product_id'];
		$gift_id  = $gift_key ? $cart->cart_contents[ $gift_key ]['data']->get_id() : BogoValidator::get_offer_product_id( $settings, $apply_id );
		$gift     = wc_get_product( $gift_id );

		if ( ! $gift ) {
			return $deals;
		}

		$unit_price = (float) $gift->get_price();
		$name       = $this->get_merchant_offer_name( $settings );

		$deals[] = [
			'line'         => $key,
			'kind'         => DealList::BOGO,
			'name'         => $this->get_deal_name( $settings ),
			'shown'        => '' !== $name ? $name : __( 'your deal', 'storegrowth-sales-booster' ),
			'amount'       => ( $unit_price - (float) Helper::calculate_offer_price( $settings['offer_type'] ?? 'free', $unit_price, $settings['discount_amount'] ?? 0 ) ) * $earned,
			'promotion_id' => (int) ( $effective['promotion_id'] ?? 0 ),
		];

		return $deals;
	}

	/**
	 * The merchant's name for an offer. Product offers have only a generated
	 * one, except a campaign-only rule, which keeps the name it was given.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array $settings The offer.
	 *
	 * @return string
	 */
	private function get_merchant_offer_name( array $settings ): string {
		return 'global' === ( $settings['type'] ?? '' ) || ! empty( $settings['campaign_offer_id'] ) ? (string) ( $settings['name_of_order_bogo'] ?? '' ) : '';
	}

	/**
	 * The name a deal goes by in the cart.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array $settings The offer.
	 *
	 * @return string
	 */
	private function get_deal_name( array $settings ): string {
		$name = $this->get_merchant_offer_name( $settings );

		return '' !== $name ? $name : __( 'BOGO deal', 'storegrowth-sales-booster' );
	}

	/**
	 * The gift line of a bought line.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param \WC_Cart $cart Cart.
	 * @param string   $key  Bought line's cart item key.
	 *
	 * @return string Empty without one.
	 */
	private function find_gift_key( $cart, string $key ): string {
		foreach ( $cart->cart_contents as $gift_key => $item ) {
			$linked_key = $item['linked_to_product_key'] ?? '';

			if ( $key === $linked_key ) {
				return (string) $gift_key;
			}
		}

		return '';
	}

	/**
	 * Apply the referee's decision: a bought line whose coupon won loses its
	 * gift, and a held gift comes back once no coupon beats it.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param Decision $decision Decision.
	 * @param \WC_Cart $cart     Cart.
	 *
	 * @return void
	 */
	public function apply_referee_decision( Decision $decision, $cart ): void {
		foreach ( $cart->cart_contents as $key => $item ) {
			if ( ! isset( $cart->cart_contents[ $key ] ) || Helper::is_gift_line( $item ) ) {
				continue;
			}

			if ( $decision->coupon_won( (string) $key ) ) {
				$this->hold_gift( $cart, (string) $key );
			} elseif ( ! empty( $item[ self::GIFT_HELD ] ) ) {
				unset( $cart->cart_contents[ $key ][ self::GIFT_HELD ] );
				$this->return_gift( $cart, (string) $key, $item );
			}
		}
	}

	/**
	 * Take a bought line's gift out of the cart while a coupon wins. No
	 * notice: the line's label explains it.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param \WC_Cart $cart Cart.
	 * @param string   $key  Bought line's cart item key.
	 *
	 * @return void
	 */
	private function hold_gift( $cart, string $key ): void {
		$gift_key = $this->find_gift_key( $cart, $key );

		while ( '' !== $gift_key ) {
			$this->remove_gift( $cart, $gift_key );
			$gift_key = $this->find_gift_key( $cart, $key );
		}

		$cart->cart_contents[ $key ][ self::GIFT_HELD ] = true;
	}

	/**
	 * Bring a held gift back, priced, when the deal is still earned. WooCommerce
	 * would total the cart on each add; this runs inside a calculation already.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param \WC_Cart $cart Cart.
	 * @param string   $key  Bought line's cart item key.
	 * @param array    $item Bought line.
	 *
	 * @return void
	 */
	private function return_gift( $cart, string $key, array $item ): void {
		$settings = $this->get_trigger_offer( $item );
		$earned   = $settings ? $this->get_earned_gifts( $settings, $item ) : 0;

		if ( $earned < 1 ) {
			return;
		}

		/**
		 * Filters the product id a cart line's BOGO offer is looked up by.
		 *
		 * @since 2.0.0
		 *
		 * @param int $product_id   Product id.
		 * @param int $variation_id Variation id.
		 */
		$apply_id = (int) apply_filters( 'spsg_bogo_get_apply_able_product_id', (int) $item['product_id'], (int) ( $item['variation_id'] ?? 0 ) );

		remove_action( 'woocommerce_add_to_cart', [ $cart, 'calculate_totals' ], 20 );

		$this->returning_gift = true;
		$this->apply_bogo_product( $settings, $apply_id, $key, $earned );
		$this->returning_gift = false;

		add_action( 'woocommerce_add_to_cart', [ $cart, 'calculate_totals' ], 20, 0 );

		$this->woocommerce_custom_price_to_cart_item( $cart );
	}

	/**
	 * Add the gifts a rule's bought lines have earned, for a coupon that just
	 * unlocked it. Works for every deal type: Pro adds a same-product gift only
	 * when a product is added or a quantity changes.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param int $rule_id BOGO rule id.
	 *
	 * @return void
	 */
	public function add_gifts_for_rule( int $rule_id ): void {
		$cart = WC()->cart;

		if ( ! $cart ) {
			return;
		}

		foreach ( $cart->get_cart() as $key => $item ) {
			$settings = Helper::is_gift_line( $item ) ? null : $this->get_trigger_offer( $item );

			if ( $settings && (int) ( $settings['id'] ?? 0 ) === $rule_id && '' === $this->find_gift_key( $cart, (string) $key ) ) {
				$this->return_gift( $cart, (string) $key, $item );
			}
		}
	}

	/**
	 * Resolve the variation to use for a variable gift product.
	 *
	 * Priority: user-selected variation → default variation → first available variation.
	 *
	 * @param int         $offer_product_id The parent variable product ID.
	 * @param \WC_Product $product          The variable product object.
	 * @return array|null Array with 'variation_id' and 'attributes', or null if none available.
	 */
	private function resolve_gift_variation( $offer_product_id, $product ) {
		$variation_id         = 0;
		$variation_attributes = array();

		// Check if user selected a variation via the frontend form.
		// phpcs:disable WordPress.Security.NonceVerification.Missing -- Nonce verified by WooCommerce add-to-cart flow.
		$posted_gift_product_id = ! empty( $_POST['bogo_gift_product_id'] ) ? intval( $_POST['bogo_gift_product_id'] ) : 0;

		if ( $posted_gift_product_id === $offer_product_id ) {
			$variation_id         = ! empty( $_POST['bogo_gift_variation_id'] ) ? intval( $_POST['bogo_gift_variation_id'] ) : 0;
			$variation_attributes = ! empty( $_POST['bogo_gift_variation'] ) ? wc_clean( wp_unslash( $_POST['bogo_gift_variation'] ) ) : array();
			$variation_attributes = is_array( $variation_attributes ) ? $variation_attributes : array();
		}
		// phpcs:enable WordPress.Security.NonceVerification.Missing

		// Validate the posted variation belongs to this product.
		if ( $variation_id ) {
			$variation_product = wc_get_product( $variation_id );
			if ( ! $variation_product || $variation_product->get_parent_id() !== $offer_product_id ) {
				$variation_id         = 0;
				$variation_attributes = array();
			}
		}

		// Fallback: use the default variation, or first available.
		if ( ! $variation_id ) {
			$available_variations = $product->get_available_variations();
			if ( ! empty( $available_variations ) ) {
				$default_variation_id = 0;
				$default_attributes   = $product->get_default_attributes();

				if ( ! empty( $default_attributes ) ) {
					$prefixed_defaults    = array_combine(
						array_map( fn( $key ) => 'attribute_' . $key, array_keys( $default_attributes ) ),
						array_values( $default_attributes )
					);
					$data_store           = \WC_Data_Store::load( 'product' );
					$default_variation_id = $data_store->find_matching_product_variation( $product, $prefixed_defaults );
				}

				if ( $default_variation_id ) {
					$default_variation_product = wc_get_product( $default_variation_id );
					if ( ! $default_variation_product ) {
						return null;
					}
					$variation_id         = $default_variation_id;
					$variation_attributes = $default_variation_product->get_variation_attributes();
				} else {
					$variation_id         = $available_variations[0]['variation_id'];
					$variation_attributes = $available_variations[0]['attributes'];
				}
			}
		}

		if ( ! $variation_id ) {
			return null;
		}

		return array(
			'variation_id' => $variation_id,
			'attributes'   => $variation_attributes,
		);
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
		
		// Calculate the correct offer quantity based on parent quantity
		$calculated_quantity = Helper::get_offer_quantity( $settings, intval( $parent_item['quantity'] ) );
		
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

		// A product-specific (type=product) offer takes precedence: if one is active,
		// show ONLY it and do not also render global offers for this product.
		$product_offers = \StorePulse\StoreGrowth\Modules\BoGo\BogoDataManager::get_bogo_offers(
			array(
				'type'         => 'product',
				'product_id'   => $current_product_id,
				'variation_id' => 0,
				'status'       => 'active',
			)
		);

		$product_bogo_settings = BogoDataManager::with_campaign_rule( ! empty( $product_offers ) ? $product_offers[0] : null, (int) $current_product_id );

		if ( $product_bogo_settings ) {
			// An offer the cart wouldn't apply right now (outside its dates or
			// weekdays, or of an unknown type) isn't advertised either; the
			// product offer still takes precedence, as in the cart.
			if ( ! BogoValidator::is_bogo_applicable( $current_product_id, $product_bogo_settings ) ) {
				return;
			}

			// Resolve the actual gift product. For a "Buy X Get Y" offer this is a
			// different product; passing the current product id would render the wrong
			// same-product template and hide the gift product on the product page.
			$offer_product_id = BogoValidator::get_offer_product_id( $product_bogo_settings, $current_product_id );

			if ( $offer_product_id ) {
				$this->display_bogo_offer( $product_bogo_settings, $current_product_id, $offer_product_id );
				return; // Product offer shown; it overrides any global offer.
			}
			// Active product offer without a usable gift product: fall through to
			// global offers instead of showing nothing.
		}

		// No applicable product-specific offer → show global BOGO offers.
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
		// Fall back to WooCommerce's standard "no image" placeholder (not the
		// upsell-bump graphic) when the offer product has no featured image.
		if ( empty( $image_url ) ) {
			$image_url = wc_placeholder_img_src( 'woocommerce_thumbnail' );
		}
		$_product = wc_get_product( $offer_product_id );
		
		// Check if product exists before accessing its methods
		if ( ! $_product ) {
			return;
		}
		
		// The offer comes off the price the shopper would pay (a sale price
		// included); the box strikes through the regular price.
		$offer_price   = Helper::calculate_offer_price( $offer_type, $_product->get_price(), $discount_amount );
		$regular_price = '' !== (string) $_product->get_regular_price() ? $_product->get_regular_price() : $_product->get_price();
		
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
		
		// Counts the offer's views (the box carries `data-spsg-track`); prints in the footer.
		wp_enqueue_script( 'spsg-storefront-tracker' );

		// Include the appropriate template
		if ( $current_product_id === $offer_product_id ) {
			// The same-product ("Buy X Get X") template guards on $product, which is
			// the current/offer product here. Without it the box renders nothing.
			$product = $_product;

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
	 * Work out every gift line again on each cart calculation: free or
	 * discounted while its offer is live and earned, removed otherwise.
	 *
	 * @param object $cart_object is all product of cart.
	 */
	public function woocommerce_custom_price_to_cart_item( $cart_object ) {
		if ( WC()->session->__isset( 'reload_checkout' ) ) {
			return;
		}

		foreach ( $cart_object->cart_contents as $key => $value ) {
			// Removing a line recalculates totals, which can remove others.
			if ( isset( $cart_object->cart_contents[ $key ] ) && Helper::is_gift_line( $value ) ) {
				$this->price_gift_line( $cart_object, $key, $value );
			}
		}
	}

	/**
	 * Price one gift line, or remove it when it's no longer earned.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param \WC_Cart $cart Cart.
	 * @param string   $key  Gift's cart item key.
	 * @param array    $item Gift's cart item.
	 *
	 * @return void
	 */
	private function price_gift_line( $cart, string $key, array $item ): void {
		$trigger_key = (string) ( $item['linked_to_product_key'] ?? '' );

		// A gift from before 3.1 that was never linked to its trigger.
		if ( '' === $trigger_key ) {
			$authorized  = Helper::find_authorized_trigger( (int) $item['product_id'] );
			$trigger_key = (string) ( $authorized['key'] ?? '' );

			$cart->cart_contents[ $key ]['linked_to_product_key'] = $trigger_key;
		}

		$trigger = $cart->cart_contents[ $trigger_key ] ?? null;

		// Its trigger left the cart: the shopper did that, no notice needed.
		// A gift of a gift is Pro 3.0's add path running on a returned gift line.
		if ( ( null === $trigger && ! empty( $item['linked_to_product_key'] ) ) || ( $trigger && Helper::is_gift_line( $trigger ) ) ) {
			$this->remove_gift( $cart, $key );

			return;
		}

		$settings = $trigger ? $this->get_trigger_offer( $trigger ) : null;
		$earned   = $settings ? $this->get_earned_gifts( $settings, $trigger ) : 0;
		$product  = wc_get_product( $item['data']->get_id() );

		if ( $earned < 1 || ! $product ) {
			// A rule waiting for its code didn't end: the shopper has no code in the cart.
			$is_waiting = $trigger && ! BogoValidator::is_coupon_requirement_met( $this->get_trigger_settings( $trigger ) );

			$this->remove_gift( $cart, $key, $is_waiting ? '' : $this->get_gift_ended_message( $item, $settings ) );

			return;
		}

		if ( (int) $item['quantity'] > $earned ) {
			$cart->cart_contents[ $key ]['quantity'] = $earned;
		}

		// A freshly loaded product: the line's own object may already carry
		// this request's price, and Countdown only applies to an unset price.
		$cart->cart_contents[ $key ] = array_merge( $cart->cart_contents[ $key ], Helper::build_offer_stamp( $settings, $product ) );

		$price = Helper::calculate_offer_price( $settings['offer_type'] ?? 'free', $product->get_price(), $settings['discount_amount'] ?? 0 );

		CartLine::set_price( $cart, $key, (float) $price, $item['bogo_offer_price'] ?? null );
	}

	/**
	 * The live offer behind a trigger line.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array $trigger Trigger's cart item.
	 *
	 * @return array|null Null when no offer applies right now.
	 */
	private function get_trigger_offer( array $trigger ): ?array {
		$effective = $this->get_trigger_effective( $trigger );

		return $effective ? $effective['values'] : null;
	}

	/**
	 * How many gifts a bought line's quantity earns.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array $settings The BOGO offer.
	 * @param array $trigger  Bought line.
	 *
	 * @return int
	 */
	private function get_earned_gifts( array $settings, array $trigger ): int {
		/**
		 * Filters how many offer products a cart line's quantity earns.
		 *
		 * @since 2.0.0
		 *
		 * @param int   $free_product_quantity Offer quantity.
		 * @param array $settings              The BOGO offer.
		 * @param array $trigger               The target cart item.
		 */
		return (int) apply_filters( 'spsg_free_product_quantity_for_cart_update', Helper::get_offer_quantity( $settings, (int) $trigger['quantity'] ), $settings, $trigger );
	}

	/**
	 * The offer stored for a trigger line, live or not.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array $trigger Trigger's cart item.
	 *
	 * @return array|null
	 */
	private function get_trigger_settings( array $trigger ) {
		$product_id   = (int) $trigger['product_id'];
		$variation_id = (int) ( $trigger['variation_id'] ?? 0 );

		/**
		 * Filters the product id a cart line's BOGO offer is looked up by.
		 *
		 * @since 2.0.0
		 *
		 * @param int $product_id   Product id.
		 * @param int $variation_id Variation id.
		 */
		$apply_id = apply_filters( 'spsg_bogo_get_apply_able_product_id', $product_id, $variation_id );

		return Helper::prepare_bogo_settings( $apply_id, $product_id, $variation_id );
	}

	/**
	 * The live offer behind a trigger line and the version it runs under.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array $trigger Trigger's cart item.
	 *
	 * @return array|null `effective_offer()`'s answer; null when no offer applies right now.
	 */
	private function get_trigger_effective( array $trigger ): ?array {
		$settings = $this->get_trigger_settings( $trigger );

		// Buy X Get X is a Pro deal: without a valid licence it gives nothing.
		if ( 'same' === ( $settings['bogo_deal_type'] ?? '' ) && ! sp_store_growth()->has_pro() ) {
			return null;
		}

		if ( empty( $settings ) ) {
			return null;
		}

		$effective = OfferVersions::effective_offer( array_merge( $settings, [ 'offer_kind' => OfferVersions::BOGO ] ) );

		return $effective['live'] ? $effective : null;
	}

	/**
	 * Remove a gift the shopper no longer gets, past the guard that stops
	 * shoppers removing gifts themselves.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param \WC_Cart $cart    Cart.
	 * @param string   $key     Gift's cart item key.
	 * @param string   $message Notice for the shopper; empty for none.
	 *
	 * @return void
	 */
	private function remove_gift( $cart, string $key, string $message = '' ): void {
		$trigger_key = $cart->cart_contents[ $key ]['linked_to_product_key'] ?? '';

		$this->removing_gift = true;
		CartLine::remove( $cart, $key, $message );
		$this->removing_gift = false;

		if ( isset( $cart->cart_contents[ $trigger_key ] ) ) {
			unset( $cart->cart_contents[ $trigger_key ]['child_key'] );
		}
	}

	/**
	 * The notice for a gift that was removed.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array      $item     Gift's cart item.
	 * @param array|null $settings The offer, when it's still live.
	 *
	 * @return string
	 */
	private function get_gift_ended_message( array $item, ?array $settings ): string {
		if ( ! $settings ) {
			$offer_id = (int) substr( (string) strrchr( (string) ( $item[ OfferAttribution::CAMPAIGN_ID ] ?? '' ), ':' ), 1 );
			$settings = $offer_id ? BogoDataManager::get_bogo_offer( $offer_id ) : null;
		}

		$name = $this->get_merchant_offer_name( (array) $settings );

		return sprintf(
			/* translators: %s: deal name. */
			__( '%s ended. Your free item was removed.', 'storegrowth-sales-booster' ),
			'' !== $name ? $name : __( 'Your deal', 'storegrowth-sales-booster' )
		);
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
		if ( Helper::is_gift_line( $cart_item ) ) {
			$regular_price = $product->get_regular_price();
			if ( $show_regular_price ) {
				$price .= '<br><span class="regular-price"><s>' . Money::price_html( $product, (float) $regular_price, 'cart' ) . '</s></span>';
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

		// Validate an enabled "Buy X Get Y" offer like the admin BOGO form: it must
		// have an offer product. Otherwise force it inactive so we never create an
		// active-but-empty product offer that silently shadows global offers, and
		// surface a notice so the merchant knows it was not enabled.
		if ( ! $is_variable_product && 'active' === $bogo_enabled && 'same' !== $deal_type
			&& empty( $bogo_settings_data['get_different_product_field'] ) ) {
			$bogo_enabled                 = 'inactive';
			$bogo_settings_data['status'] = 'inactive';
			set_transient(
				'spsg_bogo_product_notice_' . get_current_user_id(),
				__( 'BOGO was not enabled for this product — please select an offer product for a "Buy X Get Y" offer.', 'storegrowth-sales-booster' ),
				60
			);
		}

		// Only persist a product BOGO when the merchant has actually configured one.
		// Without this guard a row was written on every product create/update, leaving
		// empty "inactive" BOGO entries for products that never used the feature.
		// An already-existing row is still saved so it can be edited or disabled.
		$is_bogo_enabled   = ( 'active' === $bogo_enabled );
		$has_offer_product = ! empty( $bogo_settings_data['get_different_product_field'] );
		$has_existing_bogo = ! empty(
			\StorePulse\StoreGrowth\Modules\BoGo\BogoDataManager::get_bogo_offers(
				array(
					'type'         => 'product',
					'product_id'   => $post_id,
					'variation_id' => 0,
					'status'       => '',
				)
			)
		);

		/**
		 * Filters whether a product-specific BOGO offer should be saved on product save.
		 *
		 * @param bool  $should_save         Whether to persist the product BOGO.
		 * @param int   $post_id             Product ID.
		 * @param array $bogo_settings_data  BOGO settings being saved.
		 * @param bool  $is_variable_product Whether the product is variable.
		 */
		$should_save_bogo = apply_filters(
			'spsg_should_save_product_bogo',
			$is_bogo_enabled || $has_offer_product || $has_existing_bogo,
			$post_id,
			$bogo_settings_data,
			$is_variable_product
		);

		if ( ! $should_save_bogo ) {
			return;
		}

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
		// The cart itself is removing a gift that's no longer earned.
		if ( $this->removing_gift ) {
			return;
		}

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
	/**
	 * Display the BOGO badge on free items shown in the FlyCart.
	 *
	 * Hooked into `spsg_fly_cart_item_bogo_badge` (action) by the BOGO module so that
	 * the FlyCart template does not need any direct knowledge of BOGO logic.
	 *
	 * @param array      $cart_item     Cart item data.
	 * @param string     $cart_item_key Cart item key.
	 * @param WC_Product $_product      Product object.
	 */
	public function display_bogo_badge_in_fly_cart( $cart_item, $cart_item_key, $_product ) {
		if ( empty( $cart_item['bogo_offer'] ) ) {
			return;
		}

		/**
		 * Controls whether the BOGO badge is shown on items in the FlyCart.
		 * Defaults to false: the "Show BOGO Badge" control is a Pro feature, so
		 * the badge stays hidden in the free plugin. Pro hooks here to honor the
		 * `fly_cart_badge_icon` setting.
		 *
		 * @since 2.1.0
		 *
		 * @param bool  $enabled      Whether the badge should be displayed.
		 * @param array $cart_item    Cart item data.
		 * @param string $cart_item_key Cart item key.
		 */
		if ( ! apply_filters( 'spsg_bogo_fly_cart_badge_enabled', false, $cart_item, $cart_item_key ) ) {
			return;
		}

		$is_pro          = sp_store_growth()->has_pro();
		$offer_badge     = '';
		$offer_badge_url = '';
		$shop_page_msg   = '';
		$product_page_msg = '';

		// Try to load badge settings from the parent product's BOGO offer.
		$parent_product_id = ! empty( $cart_item['bogo_product_for'] ) ? intval( $cart_item['bogo_product_for'] ) : 0;
		if ( $parent_product_id ) {
			$bogo_settings = self::effective_badge_offer( Helper::get_product_bogo_settings( $parent_product_id ), $parent_product_id );
			if ( ! empty( $bogo_settings ) ) {
				if ( ! empty( $bogo_settings['enable_custom_badge_image'] ) ) {
					$offer_badge     = ! empty( $bogo_settings['default_badge_icon_name'] ) ? esc_html( $bogo_settings['default_badge_icon_name'] ) : '';
					$offer_badge_url = $is_pro && ! empty( $bogo_settings['default_custom_badge_icon'] ) ? esc_url( $bogo_settings['default_custom_badge_icon'] ) : '';
				} else {
					$offer_badge     = Helper::get_bogo_settings_option( 'default_badge_icon_name' );
					$offer_badge_url = $is_pro ? Helper::get_bogo_settings_option( 'default_custom_badge_icon' ) : '';
				}
				$shop_page_msg    = ! empty( $bogo_settings['shop_page_message'] ) ? esc_html( $bogo_settings['shop_page_message'] ) : '';
				$product_page_msg = ! empty( $bogo_settings['product_page_message'] ) ? esc_html( $bogo_settings['product_page_message'] ) : '';
			}
		}

		// Fallback to global BOGO badge settings.
		if ( empty( $offer_badge ) && empty( $offer_badge_url ) ) {
			$offer_badge     = Helper::get_bogo_settings_option( 'default_badge_icon_name' );
			$offer_badge_url = $is_pro ? Helper::get_bogo_settings_option( 'default_custom_badge_icon' ) : '';
		}

		if ( empty( $offer_badge ) && empty( $offer_badge_url ) ) {
			return;
		}

		$path = apply_filters( 'spsg_load_bogo_badge_content', __DIR__ . '/../templates/bogo-offer-badge.php', array() );
		if ( ! file_exists( $path ) ) {
			return;
		}

		include $path;
	}

	/**
	 * Show the original (regular) price with strikethrough alongside the free offer
	 * price for BOGO items displayed inside the FlyCart.
	 *
	 * Hooked into `spsg_fly_cart_item_price_html` (filter) so that the FlyCart template
	 * does not need any direct knowledge of BOGO logic.
	 *
	 * @param string     $price_html Current price HTML (already computed by the template).
	 * @param array      $cart_item  Cart item data.
	 * @param WC_Product $_product   Product object.
	 *
	 * @return string Modified price HTML.
	 */
	public function modify_fly_cart_bogo_price_html( $price_html, $cart_item, $_product ) {
		if ( empty( $cart_item['bogo_offer'] ) ) {
			return $price_html;
		}

		$regular_price = floatval( $_product->get_regular_price() );
		if ( $regular_price <= 0 ) {
			return $price_html;
		}

		$quantity = intval( $cart_item['quantity'] );

		// Honor the store's tax display setting so the struck-through original
		// matches the tax-in/exclusive prices shown elsewhere in the cart.
		$display_price = wc_get_price_to_display(
			$_product,
			array(
				'price' => $regular_price,
				'qty'   => $quantity,
			)
		);
		$original_html = wc_price( $display_price );

		return '<span class="spsg-bogo-fly-cart-original-price"><s>' . $original_html . '</s></span>'
			. '<span class="spsg-bogo-fly-cart-offer-price">' . $price_html . '</span>';
	}

}
