<?php
/**
 * BOGO Validation class.
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Modules\BoGo;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Handle BOGO validation logic.
 * Integrates with BogoDataManager for unified data access.
 */
class BogoValidator {

	/**
	 * Check if BOGO is applicable for a product.
	 *
	 * @param int   $product_id Product ID to check.
	 * @param array $bogo_settings BOGO settings array from BogoDataManager.
	 * @return bool True if BOGO is applicable, false otherwise.
	 */
	public static function is_bogo_applicable( $product_id, $bogo_settings ) {
		// Check if BOGO is enabled
		if ( ! self::is_bogo_enabled( $bogo_settings ) ) {
			return false;
		}

		// Check if offer is active (status check)
		if ( ! self::is_offer_status_active( $bogo_settings ) ) {
			return false;
		}

		// Check date range (Pro feature)
		if ( ! self::is_date_range_valid( $bogo_settings ) ) {
			return false;
		}

		// Check schedule (Pro feature)
		if ( ! self::is_schedule_valid( $bogo_settings ) ) {
			return false;
		}

		return apply_filters( 'spsg_is_bogo_applicable_product', true, $product_id, $bogo_settings );
	}

	/**
	 * Check if BOGO is enabled in settings.
	 *
	 * @param array $bogo_settings BOGO settings array.
	 * @return bool True if BOGO is enabled, false otherwise.
	 */
	private static function is_bogo_enabled( $bogo_settings ) {
		return isset( $bogo_settings['status'] ) && 'active' === $bogo_settings['status'];
	}

	/**
	 * Check if offer status is active.
	 *
	 * @param array $bogo_settings BOGO settings array.
	 * @return bool True if status is active, false otherwise.
	 */
	private static function is_offer_status_active( $bogo_settings ) {
		$status = $bogo_settings['status'] ?? 'active';
		return 'active' === $status;
	}

	/**
	 * Check if current date is within offer date range.
	 *
	 * @param array $bogo_settings BOGO settings array.
	 * @return bool True if date range is valid, false otherwise.
	 */
	private static function is_date_range_valid( $bogo_settings ) {
		$is_pro = sp_store_growth()->has_pro();
		
		if ( ! $is_pro ) {
			return true; // No date restrictions for free version
		}

		$current_date = date( 'Y-m-d' );
		
		// Check offer start date
		$offer_start = $bogo_settings['offer_start'] ?? null;
		if ( ! empty( $offer_start ) && '0000-00-00' !== $offer_start ) {
			if ( $current_date < $offer_start ) {
				return false;
			}
		}

		// Check offer end date
		$offer_end = $bogo_settings['offer_end'] ?? null;
		if ( ! empty( $offer_end ) && '0000-00-00' !== $offer_end ) {
			if ( $current_date > $offer_end ) {
				return false;
			}
		}

		return true;
	}

	/**
	 * Check if current time matches offer schedule.
	 *
	 * @param array $bogo_settings BOGO settings array.
	 * @return bool True if schedule is valid, false otherwise.
	 */
	private static function is_schedule_valid( $bogo_settings ) {
		$is_pro = sp_store_growth()->has_pro();
		
		if ( ! $is_pro ) {
			return true; // No schedule restrictions for free version
		}

		$schedule = $bogo_settings['offer_schedule'] ?? array( 'daily' );
		return self::is_schedule_active( $schedule );
	}

	/**
	 * Check if the current time matches the offer schedule.
	 *
	 * @param array $schedule Schedule array.
	 * @return bool True if schedule is active, false otherwise.
	 */
	public static function is_schedule_active( $schedule ) {
		if ( empty( $schedule ) || in_array( 'daily', $schedule, true ) ) {
			return true; // Daily or no specific schedule means always active
		}

		$current_day = strtolower( date( 'l' ) ); // Get current day (monday, tuesday, etc.)
		$schedule_days = array_map( 'strtolower', $schedule );

		return in_array( $current_day, $schedule_days, true );
	}

	/**
	 * Validate if a product is eligible for BOGO offers.
	 *
	 * @param \WC_Product $product Product object.
	 * @return bool True if product is eligible, false otherwise.
	 */
	public static function is_product_eligible( $product ) {
		if ( ! $product ) {
			return false;
		}

		// Support both simple and variable products
		$is_simple_product = $product->is_type( 'simple' );
		$is_variable_product = $product->is_type( 'variable' );

		return $is_simple_product || $is_variable_product;
	}

	/**
	 * Check if current product matches offered products.
	 *
	 * @param int   $current_product_id Current product ID.
	 * @param mixed $offered_products Offered products (array or single ID).
	 * @return bool True if product is offered, false otherwise.
	 */
	public static function is_product_offered( $current_product_id, $offered_products ) {
		if ( empty( $offered_products ) ) {
			return false;
		}

		if ( is_array( $offered_products ) ) {
			return in_array( $current_product_id, $offered_products, true );
		}

		return (int) $offered_products === $current_product_id;
	}

	/**
	 * Check if current product categories match offered categories.
	 *
	 * @param array $current_product_category_ids Current product's category IDs.
	 * @param array $offered_categories Offered category IDs.
	 * @return bool True if categories match, false otherwise.
	 */
	public static function is_category_offered( $current_product_category_ids, $offered_categories ) {
		if ( empty( $offered_categories ) || empty( $current_product_category_ids ) ) {
			return false;
		}

		return ! empty( array_intersect( $current_product_category_ids, $offered_categories ) );
	}

	/**
	 * Get offer product ID from BOGO settings.
	 * Works with BogoDataManager formatted data structure.
	 *
	 * @param array $bogo_settings BOGO settings from BogoDataManager.
	 * @param int   $current_product_id Current product ID.
	 * @return int|null Offer product ID or null if not found.
	 */
	public static function get_offer_product_id( $bogo_settings, $current_product_id ) {
		$deal_type = $bogo_settings['bogo_deal_type'] ?? 'different';
		
		// For same deal type, return the current product
		if ( 'same' === $deal_type ) {
			return $current_product_id;
		}
		
		// For different deal type, check multiple possible field names in order of preference
		$possible_fields = array(
			'offer_product_id',           // Main field from BogoDataManager
			'get_different_product_field', // Legacy field name
		);

		foreach ( $possible_fields as $field ) {
			$offer_product_id = $bogo_settings[ $field ] ?? null;
			if ( ! empty( $offer_product_id ) ) {
				return (int) $offer_product_id;
			}
		}
		
		// Check for alternate products array
		$alternate_products = $bogo_settings['alternate_products'] ?? $bogo_settings['get_alternate_products'] ?? array();
		if ( ! empty( $alternate_products ) && is_array( $alternate_products ) ) {
			$first_alternate = $alternate_products[0] ?? null;
			if ( ! empty( $first_alternate ) ) {
				return (int) $first_alternate;
			}
		}
		
		return null;
	}

	/**
	 * Validate BOGO settings structure.
	 * Enhanced validation to catch common data issues.
	 *
	 * @param array $bogo_settings BOGO settings to validate.
	 * @param bool  $strict_mode Enable strict validation mode.
	 * @return array Validation result with 'valid' boolean, 'errors' array, and 'warnings' array.
	 */
	public static function validate_bogo_settings( $bogo_settings, $strict_mode = false ) {
		$errors = array();
		$warnings = array();
		$valid = true;

		// Check required fields
		if ( empty( $bogo_settings['status'] ) ) {
			$errors[] = 'BOGO status is required';
			$valid = false;
		}

		if ( empty( $bogo_settings['bogo_deal_type'] ) ) {
			$errors[] = 'BOGO deal type is required';
			$valid = false;
		}

		// Validate type consistency
		$type = $bogo_settings['type'] ?? '';
		if ( 'product' === $type ) {
			if ( empty( $bogo_settings['product_id'] ) ) {
				if ( $strict_mode ) {
					$errors[] = 'Product ID is required for product type BOGO';
					$valid = false;
				} else {
					$warnings[] = 'Product ID is empty for product type BOGO';
				}
			}
		} elseif ( 'global' === $type ) {
			// For global offers, check if offered products or categories are specified
			$has_products = ! empty( $bogo_settings['offered_products'] ) && is_array( $bogo_settings['offered_products'] );
			$has_categories = ! empty( $bogo_settings['offered_categories'] ) && is_array( $bogo_settings['offered_categories'] );
			
			if ( ! $has_products && ! $has_categories ) {
				if ( $strict_mode ) {
					$errors[] = 'Global BOGO must specify either offered products or categories';
					$valid = false;
				} else {
					$warnings[] = 'Global BOGO has no offered products or categories specified';
				}
			}
		}

		// Validate deal type specific requirements
		if ( isset( $bogo_settings['bogo_deal_type'] ) && 'different' === $bogo_settings['bogo_deal_type'] ) {
			$offer_product_id = self::get_offer_product_id( $bogo_settings, 0 );
			if ( ! $offer_product_id ) {
				$errors[] = 'Offer product ID is required for different deal type';
				$valid = false;
			}
		}

		// Validate offer type and discount amount
		if ( isset( $bogo_settings['offer_type'] ) && 'discount' === $bogo_settings['offer_type'] ) {
			$discount_amount = floatval( $bogo_settings['discount_amount'] ?? 0 );
			if ( $discount_amount <= 0 || $discount_amount > 100 ) {
				$errors[] = 'Discount amount must be between 1 and 100';
				$valid = false;
			}
		}

		// Validate date format and range
		$offer_start = $bogo_settings['offer_start'] ?? null;
		$offer_end = $bogo_settings['offer_end'] ?? null;

		// Check for invalid date formats
		if ( ! empty( $offer_start ) && '0000-00-00' === $offer_start ) {
			$warnings[] = 'Offer start date has invalid format (0000-00-00)';
			$offer_start = null; // Treat as empty
		}

		if ( ! empty( $offer_end ) && '0000-00-00' === $offer_end ) {
			$warnings[] = 'Offer end date has invalid format (0000-00-00)';
			$offer_end = null; // Treat as empty
		}

		// Validate date range
		if ( ! empty( $offer_start ) && ! empty( $offer_end ) ) {
			if ( $offer_start > $offer_end ) {
				$errors[] = 'Offer start date must be before end date';
				$valid = false;
			}
		}

		// Check for empty display messages (warnings only)
		if ( empty( $bogo_settings['product_page_message'] ) && empty( $bogo_settings['shop_page_message'] ) ) {
			$warnings[] = 'No display messages specified - users may not see BOGO offer information';
		}

		// Check for empty badge image
		if ( empty( $bogo_settings['bogo_badge_image'] ) ) {
			$warnings[] = 'No badge image specified - offer may not be visually prominent';
		}

		// Validate minimum quantity
		$min_qty = intval( $bogo_settings['minimum_quantity_required'] ?? 1 );
		if ( $min_qty < 1 ) {
			$errors[] = 'Minimum quantity required must be at least 1';
			$valid = false;
		}

		// Validate status field
		$status = $bogo_settings['status'] ?? 'active';
		if ( ! in_array( $status, array( 'active', 'inactive' ), true ) ) {
			$warnings[] = 'Invalid status value: ' . $status . ' (should be active or inactive)';
		}

		return array(
			'valid' => $valid,
			'errors' => $errors,
			'warnings' => $warnings,
		);
	}

	/**
	 * Check if BOGO offer should be displayed based on all conditions.
	 * Integrates with BogoDataManager data structure.
	 *
	 * @param array $bogo_settings BOGO settings from BogoDataManager.
	 * @param int   $current_product_id Current product ID.
	 * @param array $current_product_category_ids Current product's category IDs.
	 * @return bool True if offer should be displayed, false otherwise.
	 */
	public static function should_display_offer( $bogo_settings, $current_product_id, $current_product_category_ids = array() ) {
		// Check if BOGO is applicable
		if ( ! self::is_bogo_applicable( $current_product_id, $bogo_settings ) ) {
			return false;
		}

		// Check if current product is in the offered products list
		$offered_products = $bogo_settings['offered_products'] ?? array();
		$is_product_offered = self::is_product_offered( $current_product_id, $offered_products );

		// Check if current product categories match offered categories
		$offered_categories = $bogo_settings['offered_categories'] ?? array();
		$is_category_offered = self::is_category_offered( $current_product_category_ids, $offered_categories );

		// Must match either product or category criteria
		return $is_product_offered || $is_category_offered;
	}

	/**
	 * Get BOGO settings for a specific product using BogoDataManager.
	 *
	 * @param int $product_id Product ID.
	 * @param int $variation_id Variation ID (optional).
	 * @return array|null BOGO settings or null if not found.
	 */
	public static function get_product_bogo_settings( $product_id, $variation_id = 0 ) {
		return BogoDataManager::get_product_bogo_settings( $product_id, $variation_id );
	}

	/**
	 * Get all active global BOGO offers using BogoDataManager.
	 *
	 * @return array Array of active global BOGO offers.
	 */
	public static function get_active_global_offers() {
		return BogoDataManager::get_active_global_bogo_offers();
	}

	/**
	 * Validate and prepare BOGO settings for saving.
	 *
	 * @param array  $settings Raw settings data.
	 * @param string $type BOGO type ('product' or 'global').
	 * @param int    $product_id Product ID (for product type).
	 * @param int    $variation_id Variation ID (for product type).
	 * @return array Validation result with 'valid' boolean, 'errors' array, and 'data' array.
	 */
	public static function validate_and_prepare_settings( $settings, $type = 'global', $product_id = 0, $variation_id = 0 ) {
		$validation = self::validate_bogo_settings( $settings );
		
		if ( ! $validation['valid'] ) {
			return $validation;
		}

		// Prepare data for BogoDataManager
		$prepared_data = self::prepare_settings_for_save( $settings, $type, $product_id, $variation_id );

		return array(
			'valid' => true,
			'errors' => array(),
			'data' => $prepared_data,
		);
	}

	/**
	 * Prepare settings data for saving through BogoDataManager.
	 *
	 * @param array  $settings Raw settings data.
	 * @param string $type BOGO type.
	 * @param int    $product_id Product ID.
	 * @param int    $variation_id Variation ID.
	 * @return array Prepared settings data.
	 */
	private static function prepare_settings_for_save( $settings, $type, $product_id, $variation_id ) {
		$prepared = array(
			'bogo_deal_type' => $settings['bogo_deal_type'] ?? 'different',
			'offer_type' => $settings['offer_type'] ?? 'free',
			'discount_amount' => floatval( $settings['discount_amount'] ?? 0 ),
			'minimum_quantity_required' => intval( $settings['minimum_quantity_required'] ?? 1 ),
			'product_page_message' => sanitize_text_field( $settings['product_page_message'] ?? '' ),
			'shop_page_message' => sanitize_text_field( $settings['shop_page_message'] ?? '' ),
			'bogo_badge_image' => esc_url_raw( $settings['bogo_badge_image'] ?? '' ),
			'offer_start' => $settings['offer_start'] ?? null,
			'offer_end' => $settings['offer_end'] ?? null,
			'offer_schedule' => $settings['offer_schedule'] ?? array( 'daily' ),
			'status' => $settings['status'] ?? 'active',
		);

		// Handle offer product ID
		if ( isset( $settings['get_different_product_field'] ) ) {
			$prepared['get_different_product_field'] = intval( $settings['get_different_product_field'] );
		}

		// Handle alternate products
		if ( isset( $settings['get_alternate_products'] ) && is_array( $settings['get_alternate_products'] ) ) {
			$prepared['get_alternate_products'] = array_map( 'intval', $settings['get_alternate_products'] );
		}

		// Handle offered products and categories for global offers
		if ( 'global' === $type ) {
			$prepared['name_of_order_bogo'] = sanitize_text_field( $settings['name_of_order_bogo'] ?? '' );
			
			if ( isset( $settings['offered_products'] ) && is_array( $settings['offered_products'] ) ) {
				$prepared['offered_products'] = array_map( 'intval', $settings['offered_products'] );
			}
			
			if ( isset( $settings['offered_categories'] ) && is_array( $settings['offered_categories'] ) ) {
				$prepared['offered_categories'] = array_map( 'intval', $settings['offered_categories'] );
			}
		} else {
			// For product-specific offers
			$prepared['offered_products'] = array( $product_id );
		}

		return apply_filters( 'spsg_bogo_validator_prepared_settings', $prepared, $settings, $type, $product_id, $variation_id );
	}

	/**
	 * Check if a product has any active BOGO offers.
	 *
	 * @param int $product_id Product ID.
	 * @return bool True if product has active BOGO offers, false otherwise.
	 */
	public static function product_has_active_bogo( $product_id ) {
		$product_settings = self::get_product_bogo_settings( $product_id );
		
		if ( $product_settings && self::is_bogo_applicable( $product_id, $product_settings ) ) {
			return true;
		}

		// Check global offers
		$global_offers = self::get_active_global_offers();
		$product_categories = wp_get_post_terms( $product_id, 'product_cat', array( 'fields' => 'ids' ) );

		foreach ( $global_offers as $offer ) {
			if ( self::should_display_offer( $offer, $product_id, $product_categories ) ) {
				return true;
			}
		}

		return false;
	}
}
