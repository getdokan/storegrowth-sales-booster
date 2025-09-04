<?php
/**
 * BogoDataManager - Unified data access layer for BOGO settings.
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Modules\BoGo;

use Exception;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class BogoDataManager.
 * 
 * Provides unified access to BOGO settings from a single table,
 * replacing the dual data source approach (product meta + custom post type).
 */
class BogoDataManager {

	/**
	 * Table name for BOGO settings.
	 *
	 * @var string
	 */
	private static $table_name = 'spsg_bogo_settings';

	/**
	 * Get the full table name with prefix.
	 *
	 * @return string
	 */
	private static function get_table_name() {
		global $wpdb;
		return $wpdb->prefix . self::$table_name;
	}

	/**
	 * Build WHERE clause for BOGO offers queries.
	 *
	 * @param array $conditions Conditions to filter results.
	 * @param array $options    Query options (used by filters).
	 * @return array Array containing 'clause' and 'values' for the WHERE clause.
	 */
	private static function build_where_clause( array $conditions = [], array $options = [] ) {
		$where_parts = array();
		$where_values = array();

		$conditions = apply_filters( 'spsg_bogo_query_args', $conditions, $options );

		// Build WHERE clause based on conditions
		if ( ! empty( $conditions ) ) {
			foreach ( $conditions as $field => $value ) {
				if ( $value !== null && $value !== '' ) {
					// Handle special cases for JSON fields
					if ( in_array( $field, ['offered_products', 'offered_categories'] ) && is_numeric( $value ) ) {
						$where_parts[] = "%i LIKE %s";
						$where_values[] = $field;
						$where_values[] = '%"' . $value . '"%';
					} else {
						// Use appropriate placeholder based on value type
						$placeholder = is_numeric( $value ) ? '%d' : '%s';
						$where_parts[] = "%i = {$placeholder}";
						$where_values[] = $field;
						$where_values[] = $value;
					}
				}
			}
		}

		return [
			'clause' => ! empty( $where_parts ) ? 'WHERE ' . implode( ' AND ', $where_parts ) : '',
			'values' => $where_values
		];
	}

	/**
	 * Unified method to get BOGO offers with flexible conditions.
	 *
	 * @param array $conditions Query conditions (type, product_id, variation_id, status, etc.).
	 * @param array $options Query options (order_by, limit, offset).
	 * @return array Array of BOGO offers.
	 */
	public static function get_bogo_offers( array $conditions = [], array $options = [] ) {
		global $wpdb;

		$table = self::get_table_name();
		$options = wp_parse_args( $options, [
			'order_by' => 'created_at DESC',
			'limit' => 20,
			'offset' => 0,
		]);

		// Build WHERE clause using shared method
		$where_data = self::build_where_clause( $conditions, $options );
		$where_clause = $where_data['clause'];
		$where_values = $where_data['values'];
		
		// Set default options
		$order_by = $options['order_by'] ?? 'created_at DESC';
		$limit = isset( $options['limit'] ) ? 'LIMIT ' . intval( $options['limit'] ) : '';
		$offset = isset( $options['offset'] ) ? 'OFFSET ' . intval( $options['offset'] ) : '';

		// Parse order_by to separate field and direction
		$order_parts = explode( ' ', trim( $order_by ) );
		$order_field = $order_parts[0] ?? 'created_at';
		$order_direction = isset( $order_parts[1] ) ? ' ' . strtoupper( trim( $order_parts[1] ) ) : ' DESC';

		$query = "SELECT * FROM %i {$where_clause} ORDER BY %i{$order_direction} {$limit} {$offset}";
		$query = trim( $query );

		// Prepare the query with table name, field names, and order by field
		$prepared_query = $wpdb->prepare( $query, array_merge( [ $table ], $where_values, [ $order_field ] ) );

		$results = $wpdb->get_results( $prepared_query );

		return array_map( array( self::class, 'format_settings' ), $results );
	}

	/**
	 * Get BOGO settings for a product.
	 *
	 * @param int $product_id   Product ID.
	 * @param int $variation_id Variation ID (default 0).
	 * @return array|null BOGO settings or null if not found.
	 */
	public static function get_product_bogo_settings( $product_id, $variation_id = 0, array $query_args = [] ) {

		$filter_args = wp_parse_args( $query_args, [
			'type' => 'product',
			'product_id' => $product_id,
			'variation_id' => $variation_id,
			'status' => 'active'
		]);

		if (isset($query_args['status']) && ! $query_args['status'] ) {
			unset( $filter_args['status'] );
		}
		// First check for product-specific settings
		$product_settings = self::get_bogo_offers( $filter_args );


		if ( ! empty( $product_settings ) ) {
			return $product_settings[0];
		}

		// Fallback to global settings that include this product
		$global_settings = self::get_bogo_offers( [
			'type' => 'global',
			'status' => 'active'
		] );

		// Filter global settings to find those that include the current product
		foreach ( $global_settings as $setting ) {
			if ( self::product_in_global_offer( $setting, $product_id ) ) {
				return $setting;
			}
		}

		return null;
	}

	/**
	 * Check if a product is included in a global BOGO offer.
	 *
	 * @param array $offer Global BOGO offer data.
	 * @param int   $product_id Product ID to check.
	 * @return bool Whether the product is included.
	 */
	private static function product_in_global_offer( $offer, $product_id ) {
		// Check offered products
		if ( ! empty( $offer['offered_products'] ) && is_array( $offer['offered_products'] ) ) {
			if ( in_array( $product_id, $offer['offered_products'] ) ) {
				return true;
			}
		}

		// Check offered categories
		if ( ! empty( $offer['offered_categories'] ) && is_array( $offer['offered_categories'] ) ) {
			$product_categories = wp_get_post_terms( $product_id, 'product_cat', array( 'fields' => 'ids' ) );
			if ( ! empty( array_intersect( $offer['offered_categories'], $product_categories ) ) ) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Normalize date field to ensure null values instead of invalid dates.
	 *
	 * @param mixed $date_value The date value to normalize.
	 * @return string|null Normalized date value or null.
	 */
	private static function normalize_date_field( $date_value ) {
		if ( $date_value === null || $date_value === '' ) {
			return null;
		}

		// Convert string values
		if ( is_string( $date_value ) ) {
			$date_value = trim( $date_value );
			
			// Check for invalid date formats
			if ( $date_value === '0000-00-00' || $date_value === '0000-00-00 00:00:00' || empty( $date_value ) ) {
				return null;
			}

			// Validate the date format
			$timestamp = strtotime( $date_value );
			if ( $timestamp === false ) {
				return null;
			}
		}

		return $date_value;
	}

	/**
	 * Map BOGO settings to database fields.
	 *
	 * @param array  $data        BOGO settings data.
	 * @param string $type        BOGO type ('product' or 'global').
	 * @param int    $product_id  Product ID (for product type).
	 * @param int    $variation_id Variation ID (for product type).
	 * @return array Mapped data for database operations.
	 */
	private static function map_bogo_data( $data, $type, $product_id = 0, $variation_id = 0 ) {
		$mapped_data = array(
			'type'                    => $type,
			'bogo_deal_type'          => $data['bogo_deal_type'] ?? 'different',
			'offer_type'              => $data['offer_type'] ?? 'free',
			'discount_amount'         => $data['discount_amount'] ?? 0,
			'offer_product_id'        => $data['get_different_product_field'] ?? null,
			'alternate_products'      => wp_json_encode( $data['get_alternate_products'] ?? array() ),
			'product_page_message'    => $data['product_page_message'] ?? '',
			'shop_page_message'       => $data['shop_page_message'] ?? '',
			'bogo_badge_image'        => $data['bogo_badge_image'] ?? '',
			'minimum_quantity_required' => $data['minimum_quantity_required'] ?? 1,
			'offer_start'             => self::normalize_date_field( $data['offer_start'] ?? null ),
			'offer_end'               => self::normalize_date_field( $data['offer_end'] ?? null ),
			'offer_schedule'          => wp_json_encode( $data['offer_schedule'] ?? array( 'daily' ) ),
			'status'                  => apply_filters( 'spsg_bogo_status',  $data['status'] ?? 'active', $type, $product_id, $variation_id ),
			// Design settings as JSON
			'design_settings'         => wp_json_encode( array(
				'box_border_style'        => $data['box_border_style'] ?? 'solid',
				'box_border_color'        => $data['box_border_color'] ?? '#e0e0e0',
				'box_top_margin'          => $data['box_top_margin'] ?? 10,
				'box_bottom_margin'       => $data['box_bottom_margin'] ?? 10,
				'discount_background_color' => $data['discount_background_color'] ?? '#ff6b6b',
				'discount_text_color'     => $data['discount_text_color'] ?? '#ffffff',
				'discount_font_size'      => $data['discount_font_size'] ?? 14,
				'product_description_text_color' => $data['product_description_text_color'] ?? '#333333',
				'product_description_font_size' => $data['product_description_font_size'] ?? 12,
			) ),
		);

		// Add type-specific fields
		if ( 'product' === $type ) {
			$mapped_data['name'] = 'Product BOGO - ' . $product_id;
			$mapped_data['product_id'] = $product_id;
			$mapped_data['variation_id'] = $variation_id;
			$mapped_data['offered_products'] = wp_json_encode( $data['offered_products'] ?? array() );
		} else {
			$mapped_data['name'] = $data['name_of_order_bogo'] ?? '';
			$mapped_data['offered_products'] = wp_json_encode( $data['offered_products'] ?? array() );
			$mapped_data['offered_categories'] = wp_json_encode( $data['offered_categories'] ?? array() );
		}

		return apply_filters( 'spsg_bogo_mapped_data', $mapped_data, $type, $product_id, $variation_id );
	}

	/**
	 * Save product-specific BOGO settings.
	 *
	 * @param int   $product_id   Product ID.
	 * @param int   $variation_id Variation ID.
	 * @param array $settings     BOGO settings.
	 * @return bool|int Success status or insert ID.
	 */
	public static function save_product_bogo_settings( $product_id, $variation_id, $settings ) {
		global $wpdb;

		$table = self::get_table_name();

		// Map the data using the unified method
		$data = self::map_bogo_data( $settings, 'product', $product_id, $variation_id );

		$existing = $wpdb->get_var( $wpdb->prepare(
			"SELECT id FROM {$table} WHERE type = 'product' AND product_id = %d AND variation_id = %d",
			$product_id,
			$variation_id
		) );

		if ( $existing ) {
			// For updates, only set updated_by, never change created_by
			$data['updated_by'] = apply_filters( 'spsg_bogo_updated_by', get_current_user_id(), $existing, $settings );
			return $wpdb->update( $table, $data, array( 'id' => $existing ) );
		} else {
			// For new records, set both created_by and updated_by
			$data['created_by'] = apply_filters( 'spsg_bogo_created_by', get_current_user_id(), $product_id, $variation_id, $settings );
			$data['updated_by'] = apply_filters( 'spsg_bogo_updated_by', get_current_user_id(), 0, $settings );
			return $wpdb->insert( $table, $data );
		}
	}

	/**
	 * Get all global BOGO offers.
	 *
	 * @param array $conditions Additional conditions.
	 * @return array Array of global BOGO offers.
	 */
	public static function get_global_bogo_offers( array $conditions = [] ) {
		$conditions['type'] = 'global';
		return self::get_bogo_offers( $conditions );
	}

	/**
	 * Get active global BOGO offers only (for cart/frontend use).
	 *
	 * @param array $conditions Additional conditions.
	 * @return array Array of active global BOGO offers.
	 */
	public static function get_active_global_bogo_offers( array $conditions = [] ) {
		$conditions['type'] = 'global';
		$conditions['status'] = 'active';
		return self::get_bogo_offers( $conditions );
	}

	/**
	 * Get global BOGO offers as list (for backward compatibility).
	 *
	 * @return array Array of global BOGO offers in old format.
	 */
	public static function get_global_offered_product_list() {
		$offers = self::get_active_global_bogo_offers();
		return array_map( function( $offer ) {
			// Use the same formatting as get_bogo_offer for consistency
			$formatted_offer = array(
				'offered_products' => $offer['offered_products'] ?? null,
				'bogo_deal_type'   => $offer['bogo_deal_type'] ?? 'different',
				'offer_type'       => $offer['offer_type'] ?? 'free',
				'discount_amount'  => $offer['discount_amount'] ?? 0,
				'minimum_quantity_required' => $offer['minimum_quantity_required'] ?? 1,
				'get_different_product_field' => $offer['offer_product_id'] ?? null,
				'get_alternate_products' => $offer['alternate_products'] ?? array(),
				'shop_page_message' => $offer['shop_page_message'],
				'product_page_message' => $offer['product_page_message'],
				'offered_categories' => $offer['offered_categories'] ?? array(),
			);
			
			// Extract design settings from JSON
			$design_settings = self::get_design_settings( $offer['design_settings'] ?? null );
			$formatted_offer = array_merge( $formatted_offer, $design_settings );
			
			// Add backward compatibility fields
			$formatted_offer['name_of_order_bogo'] = $offer['name'] ?? '';
			
			return $formatted_offer;
		}, $offers );
	}

	/**
	 * Create global BOGO offer.
	 *
	 * @param array $data BOGO offer data.
	 * @return bool|int Success status or insert ID.
	 */
	public static function create_global_offer( $data ) {
		global $wpdb;

		$table = self::get_table_name();

		// Map the data using the unified method
		$insert_data = self::map_bogo_data( $data, 'global' );
		
		// Add user tracking with filters
		$insert_data['created_by'] = apply_filters( 'spsg_bogo_created_by', $data['created_by'] ?? get_current_user_id(), 0, $data );
		$insert_data['updated_by'] = apply_filters( 'spsg_bogo_updated_by', get_current_user_id(), 0, $data );

		$result  = $wpdb->insert( $table, $insert_data );

		if ( ! $result ) {
			throw new Exception( 'Failed to insert BOGO offer: ' . $wpdb->last_error , 400 );
		}

		return $wpdb->insert_id;
	}

	/**
	 * Update global BOGO offer.
	 *
	 * @param int   $id   BOGO offer ID.
	 * @param array $data Updated data.
	 * @return bool Success status.
	 */
	public static function update_global_offer( $id, $data ) {
		global $wpdb;

		$table = self::get_table_name();

		// Map the data using the unified method (excluding type and status)
		$update_data = self::map_bogo_data( $data, 'global' );
		unset( $update_data['type'], $update_data['status'] );
		
		// Add user tracking with filter
		$update_data['updated_by'] = apply_filters( 'spsg_bogo_updated_by', get_current_user_id(), $id, $data );

		return $wpdb->update( $table, $update_data, array( 'id' => $id ) );
	}

	/**
	 * Delete BOGO offer.
	 *
	 * @param int $id BOGO offer ID.
	 * @return bool Success status.
	 */
	public static function delete_bogo_offer( $id ) {
		global $wpdb;

		$table = self::get_table_name();

		return $wpdb->delete( $table, array( 'id' => $id ) );
	}

	/**
	 * Set BOGO offer status.
	 *
	 * @param int    $id     BOGO offer ID.
	 * @param string $status Status ('active' or 'inactive').
	 * @return bool Success status.
	 */
	public static function set_bogo_status( $id, $status ) {
		global $wpdb;

		$table = self::get_table_name();

		$update_data = array(
			'status' => $status,
			'updated_by' => apply_filters( 'spsg_bogo_updated_by', get_current_user_id(), $id, array( 'status' => $status ) ),
		);

		return $wpdb->update( $table, $update_data, array( 'id' => $id ) );
	}

	/**
	 * Get total count of BOGO offers matching the conditions.
	 *
	 * @param array $conditions Conditions to filter offers.
	 * @return int Total count of matching offers.
	 */
	public static function get_bogo_offers_count( array $conditions = [] ) {
		global $wpdb;

		$table = self::get_table_name();

		// Build WHERE clause using shared method
		$where_data = self::build_where_clause( $conditions, [] );
		$where_clause = $where_data['clause'];
		$where_values = $where_data['values'];
		
		$query = "SELECT COUNT(*) FROM %i {$where_clause}";
		$query = trim( $query );

		// Prepare the query with table name and where values
		$prepared_query = $wpdb->prepare( $query, array_merge( [ $table ], $where_values ) );

		return (int) $wpdb->get_var( $prepared_query );
	}

	/**
	 * Get BOGO offer by ID.
	 *
	 * @param int $id BOGO offer ID.
	 * @return array|null BOGO offer data or null if not found.
	 */
	public static function get_bogo_offer( $id ) {
		$offers = self::get_bogo_offers( [ 'id' => $id ] );
		return ! empty( $offers ) ? $offers[0] : null;
	}

	/**
	 * Format settings for backward compatibility.
	 *
	 * @param object $row Database row.
	 * @return array Formatted settings.
	 */
	private static function format_settings( $row ) {
		$settings = (array) $row;

		// Convert JSON fields back to arrays.
		if ( $settings['offered_products'] ) {
			$settings['offered_products'] = json_decode( $settings['offered_products'], true );
		}
		if ( $settings['offered_categories'] ) {
			$settings['offered_categories'] = json_decode( $settings['offered_categories'], true );
		}
		if ( $settings['alternate_products'] ) {
			$settings['alternate_products'] = json_decode( $settings['alternate_products'], true );
		}
		if ( isset( $settings['offer_schedule'] ) && $settings['offer_schedule'] ) {
			$settings['offer_schedule'] = json_decode( $settings['offer_schedule'], true );
		} else {
			$settings['offer_schedule'] = array( 'daily' );
		}

		// Add backward compatibility fields.
		if ( $settings['type'] === 'product' ) {
			$settings['get_different_product_field'] = $settings['offer_product_id'];
			$settings['get_alternate_products']      = $settings['alternate_products'];
		} else {
			// For global offers, use offered_ prefix consistently
			$settings['offered_products'] = $settings['offered_products'];
			$settings['offered_categories'] = $settings['offered_categories'];
			$settings['name_of_order_bogo'] = $settings['name'];
		}

		return $settings;
	}

	/**
	 * Create the BOGO settings table.
	 *
	 * @return void
	 */
	public static function create_table() {
		global $wpdb;

		$table = self::get_table_name();
		$charset_collate = $wpdb->get_charset_collate();

		$sql = "CREATE TABLE IF NOT EXISTS {$table} (
			id BIGINT PRIMARY KEY AUTO_INCREMENT,
			type VARCHAR(50) NOT NULL DEFAULT 'product',
			name VARCHAR(255) NOT NULL,
			product_id BIGINT DEFAULT NULL,
			variation_id BIGINT DEFAULT 0,
			offered_products TEXT DEFAULT NULL,
			offered_categories TEXT DEFAULT NULL,
			bogo_deal_type VARCHAR(50) NOT NULL DEFAULT 'different',
			offer_type VARCHAR(50) NOT NULL DEFAULT 'free',
			discount_amount DECIMAL(5,2) DEFAULT 0.00,
			minimum_quantity_required INT DEFAULT 1,
			offer_product_id BIGINT DEFAULT NULL,
			alternate_products TEXT DEFAULT NULL,
			product_page_message TEXT DEFAULT NULL,
			shop_page_message TEXT DEFAULT NULL,
			bogo_badge_image VARCHAR(500) DEFAULT NULL,
			offer_start DATE DEFAULT NULL,
			offer_end DATE DEFAULT NULL,
			offer_schedule TEXT DEFAULT NULL,
			status VARCHAR(50) NOT NULL DEFAULT 'active',
			design_settings TEXT DEFAULT NULL,
			created_by BIGINT DEFAULT NULL,
			updated_by BIGINT DEFAULT NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			INDEX idx_type_status (type, status),
			INDEX idx_product (product_id, variation_id),
			INDEX idx_created_by (created_by),
			INDEX idx_updated_by (updated_by),
			UNIQUE KEY unique_product_variation (product_id, variation_id)
		) {$charset_collate};";

		require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );
		dbDelta( $sql );
	}


	/**
	 * Sync offer schedules between product and global offers.
	 *
	 * @param int $product_id Product ID to sync schedules for.
	 * @return bool Success status.
	 */
	public static function sync_offer_schedules( $product_id ) {
		global $wpdb;

		$table = self::get_table_name();

		// Get product BOGO settings
		$product_settings = self::get_product_bogo_settings( $product_id );

		if ( ! $product_settings ) {
			return false;
		}

		// Get global offers that include this product
		$global_offers = self::get_bogo_offers( [
			'type' => 'global'
		] );

		$product_schedule = $product_settings['offer_schedule'] ?? array( 'daily' );

		foreach ( $global_offers as $offer ) {
			// Check if this global offer includes the product
			if ( ! self::product_in_global_offer( $offer, $product_id ) ) {
				continue;
			}

			$global_schedule = $offer['offer_schedule'] ?? array( 'daily' );
			
			// Merge schedules (product schedule takes priority)
			$merged_schedule = array_unique( array_merge( $product_schedule, $global_schedule ) );
			
			// Update global offer with merged schedule
			$wpdb->update( 
				$table, 
				array( 'offer_schedule' => wp_json_encode( $merged_schedule ) ),
				array( 'id' => $offer['id'] )
			);
		}

		return true;
	}

	/**
	 * Extract design settings from JSON with defaults.
	 *
	 * @param string|array $design_settings_json JSON string or decoded array.
	 * @return array Design settings with defaults.
	 */
	public static function get_design_settings( $design_settings_json ) {
		$design_settings = array();
		
		if ( is_string( $design_settings_json ) ) {
			$design_settings = json_decode( $design_settings_json, true ) ?: array();
		} elseif ( is_array( $design_settings_json ) ) {
			$design_settings = $design_settings_json;
		}
		
		return array_merge( array(
			'box_border_style'        => 'solid',
			'box_border_color'        => '#e0e0e0',
			'box_top_margin'          => 10,
			'box_bottom_margin'       => 10,
			'discount_background_color' => '#ff6b6b',
			'discount_text_color'     => '#ffffff',
			'discount_font_size'      => 14,
			'product_description_text_color' => '#333333',
			'product_description_font_size' => 12,
		), $design_settings );
	}

	/**
	 * Get offer schedule for a specific product.
	 *
	 * @param int $product_id Product ID.
	 * @return array Array of schedule days.
	 */
	public static function get_product_offer_schedule( $product_id ) {
		$product_settings = self::get_product_bogo_settings( $product_id );
		
		if ( ! $product_settings ) {
			return array( 'daily' );
		}

		return $product_settings['offer_schedule'] ?? array( 'daily' );
	}

	/**
	 * Check if BOGO offer is active based on schedule.
	 *
	 * @param array $schedule Offer schedule array.
	 * @return bool Whether the offer is active.
	 */
	public static function is_offer_active_by_schedule( $schedule ) {
		if ( empty( $schedule ) ) {
			$schedule = array( 'daily' );
		}

		// Check if daily is in schedule
		if ( in_array( 'daily', $schedule ) ) {
			return true;
		}

		// Check if current day is in schedule
		$current_day = strtolower( date( 'l' ) );
		return in_array( $current_day, $schedule );
	}
}
