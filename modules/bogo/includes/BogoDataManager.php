<?php
/**
 * BogoDataManager - Unified data access layer for BOGO settings.
 *
 * @package SBFW
 */

namespace STOREGROWTH\SPSB\Modules\BoGo;

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
	private static $table_name = 'sgsb_bogo_settings';

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
	 * Get BOGO settings for a product.
	 *
	 * @param int $product_id   Product ID.
	 * @param int $variation_id Variation ID (default 0).
	 * @return array|null BOGO settings or null if not found.
	 */
	public static function get_product_bogo_settings( $product_id, $variation_id = 0 ) {
		global $wpdb;

		$table = self::get_table_name();

		// First check for product-specific settings.
		$product_settings = $wpdb->get_row( $wpdb->prepare(
			"SELECT * FROM {$table} 
			 WHERE type = 'product' 
			 AND product_id = %d 
			 AND variation_id = %d 
			 AND status = 'active'",
			$product_id,
			$variation_id
		) );

		if ( $product_settings ) {
			return self::format_settings( $product_settings );
		}

		// Fallback to global settings.
		$global_settings = $wpdb->get_row( $wpdb->prepare(
			"SELECT * FROM {$table} 
			 WHERE type = 'global' 
			 AND status = 'active'
			 AND (offered_products LIKE %s OR offered_categories LIKE %s)",
			'%"' . $product_id . '"%',
			'%"' . $product_id . '"%'
		) );

		return $global_settings ? self::format_settings( $global_settings ) : null;
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

		$data = array(
			'type'                    => 'product',
			'name'                    => 'Product BOGO - ' . $product_id,
			'product_id'              => $product_id,
			'variation_id'            => $variation_id,
			'bogo_status'             => $settings['bogo_status'] ?? 'no',
			'bogo_deal_type'          => $settings['bogo_deal_type'] ?? 'different',
			'offer_type'              => $settings['offer_type'] ?? 'free',
			'discount_amount'         => $settings['discount_amount'] ?? 0,
			'offer_product_id'        => $settings['get_different_product_field'] ?? null,
			'alternate_products'      => \wp_json_encode( $settings['get_alternate_products'] ?? array() ),
			'product_page_message'    => $settings['product_page_message'] ?? '',
			'shop_page_message'       => $settings['shop_page_message'] ?? '',
			'bogo_badge_image'        => $settings['bogo_badge_image'] ?? '',
			'minimum_quantity_required' => $settings['minimum_quantity_required'] ?? 1,
			'offer_start'             => $settings['offer_start'] ?? null,
			'offer_end'               => $settings['offer_end'] ?? null,
			'offer_schedule'          => wp_json_encode( $settings['offer_schedule'] ?? array( 'daily' ) ),
			'status'                  => 'active',
			'offered_products'        => wp_json_encode( $settings['offered_products'] ?? array() ),
		);

		$existing = $wpdb->get_var( $wpdb->prepare(
			"SELECT id FROM {$table} WHERE type = 'product' AND product_id = %d AND variation_id = %d",
			$product_id,
			$variation_id
		) );

		if ( $existing ) {
			return $wpdb->update( $table, $data, array( 'id' => $existing ) );
		} else {
			return $wpdb->insert( $table, $data );
		}
	}

	/**
	 * Get all global BOGO offers.
	 *
	 * @return array Array of global BOGO offers.
	 */
	public static function get_global_bogo_offers( array $conditions = [] ) {
		global $wpdb;

		$table = self::get_table_name();

		$where_parts = array( "type = 'global'" );
		$where_values = array();

		// Build WHERE clause based on conditions
		if ( ! empty( $conditions ) ) {
			foreach ( $conditions as $field => $value ) {
				if ( $value !== null ) {
					// Use %i for field name and appropriate placeholder for value
					$value_placeholder = is_numeric( $value ) ? '%d' : '%s';
					$where_parts[] = "%i = {$value_placeholder}";
					$where_values[] = $field;
					$where_values[] = $value;
				}
			}
		}

		$where_clause = 'WHERE ' . implode( ' AND ', $where_parts );
		$query = "SELECT * FROM {$table} {$where_clause} ORDER BY created_at DESC";

		$results = $wpdb->get_results(
			$wpdb->prepare( $query, $where_values )
		);

		return array_map( array( self::class, 'format_settings' ), $results );
	}

	/**
	 * Get active global BOGO offers only (for cart/frontend use).
	 *
	 * @param array $conditions Additional conditions.
	 * @return array Array of active global BOGO offers.
	 */
	public static function get_active_global_bogo_offers( array $conditions = [] ) {
		$conditions['status'] = 'active';
		return self::get_global_bogo_offers( $conditions );
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
				'bogo_status'      => $offer['bogo_status'],
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

		// Use offered_ prefix for consistency
		$offered_products = $data['offered_products'] ?? array();
		$offered_categories = $data['offered_categories'] ?? array();
		
		$insert_data = array(
			'type'                    => 'global',
			'name'                    => $data['name_of_order_bogo'],
			'offered_products'         => wp_json_encode( $offered_products ),
			'offered_categories'       => wp_json_encode( $offered_categories ),
			'bogo_status'             => $data['bogo_status'] ?? 'no',
			'bogo_deal_type'          => $data['bogo_deal_type'] ?? 'different',
			'offer_type'              => $data['offer_type'] ?? 'free',
			'discount_amount'         => $data['discount_amount'] ?? 0,
			'offer_product_id'        => $data['get_different_product_field'] ?? null,
			'alternate_products'      => wp_json_encode( $data['get_alternate_products'] ?? array() ),
			'offer_start'             => $data['offer_start'] ?? null,
			'offer_end'               => $data['offer_end'] ?? null,
			'offer_schedule'          => wp_json_encode( $data['offer_schedule'] ?? array( 'daily' ) ),
			'product_page_message'    => $data['product_page_message'] ?? '',
			'shop_page_message'       => $data['shop_page_message'] ?? '',
			'bogo_badge_image'        => $data['bogo_badge_image'] ?? '',
			'minimum_quantity_required' => $data['minimum_quantity_required'] ?? 1,
			'status'                  => 'active',
		);

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

		$update_data = array(
			'name'                    => $data['name_of_order_bogo'] ?? '',
			'offered_products'         => wp_json_encode( $data['offered_products'] ?? array() ),
			'offered_categories'       => wp_json_encode( $data['offered_categories'] ?? array() ),
			'bogo_status'             => $data['bogo_status'] ?? 'no',
			'bogo_deal_type'          => $data['bogo_deal_type'] ?? 'different',
			'offer_type'              => $data['offer_type'] ?? 'free',
			'discount_amount'         => $data['discount_amount'] ?? 0,
			'offer_product_id'        => $data['get_different_product_field'] ?? null,
			'alternate_products'      => wp_json_encode( $data['get_alternate_products'] ?? array() ),
			'offer_start'             => $data['offer_start'] ?? null,
			'offer_end'               => $data['offer_end'] ?? null,
			'offer_schedule'          => wp_json_encode( $data['offer_schedule'] ?? array( 'daily' ) ),
			'product_page_message'    => $data['product_page_message'] ?? '',
			'shop_page_message'       => $data['shop_page_message'] ?? '',
			'bogo_badge_image'        => $data['bogo_badge_image'] ?? '',
			'minimum_quantity_required' => $data['minimum_quantity_required'] ?? 1,
		);

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

		return $wpdb->update( $table, array( 'status' => $status ), array( 'id' => $id ) );
	}

	/**
	 * Get BOGO offer by ID.
	 *
	 * @param int $id BOGO offer ID.
	 * @return array|null BOGO offer data or null if not found.
	 */
	public static function get_bogo_offer( $id ) {
		global $wpdb;

		$table = self::get_table_name();

		$result = $wpdb->get_row( $wpdb->prepare(
			"SELECT * FROM {$table} WHERE id = %d",
			$id
		) );

		return $result ? self::format_settings( $result ) : null;
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

		$sql = "CREATE TABLE {$table} (
			id BIGINT PRIMARY KEY AUTO_INCREMENT,
			type ENUM('product', 'global') NOT NULL,
			name VARCHAR(255) NOT NULL,
			product_id BIGINT DEFAULT NULL,
			variation_id BIGINT DEFAULT 0,
			offered_products JSON DEFAULT NULL,
			offered_categories JSON DEFAULT NULL,
			bogo_status ENUM('yes', 'no') DEFAULT 'no',
			bogo_deal_type ENUM('same', 'different') DEFAULT 'different',
			offer_type ENUM('free', 'discount') DEFAULT 'free',
			discount_amount DECIMAL(5,2) DEFAULT 0.00,
			minimum_quantity_required INT DEFAULT 1,
			offer_product_id BIGINT DEFAULT NULL,
			alternate_products JSON DEFAULT NULL,
			product_page_message TEXT DEFAULT NULL,
			shop_page_message TEXT DEFAULT NULL,
			bogo_badge_image VARCHAR(500) DEFAULT NULL,
			offer_start DATE DEFAULT NULL,
			offer_end DATE DEFAULT NULL,
			offer_schedule JSON DEFAULT NULL,
			status ENUM('active', 'inactive') DEFAULT 'active',
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			INDEX idx_type_status (type, status),
			INDEX idx_product (product_id, variation_id),
			UNIQUE KEY unique_product_variation (product_id, variation_id)
		) {$charset_collate};";

		require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );
		dbDelta( $sql );

		// Run migration to add offer_schedule column if it doesn't exist
		self::migrate_offer_schedule_column();
	}

	/**
	 * Migrate to add offer_schedule column if it doesn't exist.
	 *
	 * @return void
	 */
	private static function migrate_offer_schedule_column() {
		global $wpdb;

		$table = self::get_table_name();
		
		// Check if offer_schedule column exists
		$column_exists = $wpdb->get_results( $wpdb->prepare(
			"SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = %s AND TABLE_NAME = %s AND COLUMN_NAME = %s",
			DB_NAME,
			$table,
			'offer_schedule'
		) );

		if ( empty( $column_exists ) ) {
			$wpdb->query( "ALTER TABLE {$table} ADD COLUMN offer_schedule JSON DEFAULT NULL AFTER offer_end" );
			
			// Update existing records with default schedule
			$wpdb->query( "UPDATE {$table} SET offer_schedule = '[\"daily\"]' WHERE offer_schedule IS NULL" );
		}
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
		$global_offers = $wpdb->get_results( $wpdb->prepare(
			"SELECT * FROM {$table} WHERE type = 'global' AND offered_products LIKE %s",
			'%' . $product_id . '%'
		) );

		$product_schedule = $product_settings['offer_schedule'] ?? array( 'daily' );

		foreach ( $global_offers as $offer ) {
			$global_schedule = json_decode( $offer->offer_schedule, true ) ?? array( 'daily' );
			
			// Merge schedules (product schedule takes priority)
			$merged_schedule = array_unique( array_merge( $product_schedule, $global_schedule ) );
			
			// Update global offer with merged schedule
			$wpdb->update( 
				$table, 
				array( 'offer_schedule' => wp_json_encode( $merged_schedule ) ),
				array( 'id' => $offer->id )
			);
		}

		return true;
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
