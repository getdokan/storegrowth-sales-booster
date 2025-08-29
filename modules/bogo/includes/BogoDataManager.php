<?php
/**
 * BogoDataManager - Unified data access layer for BOGO settings.
 *
 * @package SBFW
 */

namespace STOREGROWTH\SPSB\Modules\BoGo;

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
			 AND (target_products LIKE %s OR target_categories LIKE %s)",
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
			'status'                  => 'active',
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
	public static function get_global_bogo_offers() {
		global $wpdb;

		$table = self::get_table_name();

		$results = $wpdb->get_results(
			"SELECT * FROM {$table} WHERE type = 'global' AND status = 'active'"
		);

		return array_map( array( self::class, 'format_settings' ), $results );
	}

	/**
	 * Get global BOGO offers as list (for backward compatibility).
	 *
	 * @return array Array of global BOGO offers in old format.
	 */
	public static function get_global_offered_product_list() {
		$offers = self::get_global_bogo_offers();
		return array_map( function( $offer ) {
			return array(
				'offered_products' => $offer['target_products'][0] ?? null,
				'bogo_status'      => $offer['bogo_status'],
				'shop_page_message' => $offer['shop_page_message'],
				'product_page_message' => $offer['product_page_message'],
				'default_badge_icon_name' => $offer['default_badge_icon_name'] ?? '',
				'default_custom_badge_icon' => $offer['default_custom_badge_icon'] ?? '',
				'enable_custom_badge_image' => $offer['enable_custom_badge_image'] ?? false,
				'target_categories' => $offer['target_categories'] ?? array(),
			);
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

		$insert_data = array(
			'type'                    => 'global',
			'name'                    => $data['name_of_order_bogo'],
			'target_products'         => \wp_json_encode( $data['target_products'] ?? array() ),
			'target_categories'       => \wp_json_encode( $data['target_categories'] ?? array() ),
			'bogo_status'             => $data['bogo_status'] ?? 'no',
			'bogo_deal_type'          => $data['bogo_deal_type'] ?? 'different',
			'offer_type'              => $data['offer_type'] ?? 'free',
			'discount_amount'         => $data['discount_amount'] ?? 0,
			'offer_product_id'        => $data['get_different_product_field'] ?? null,
			'alternate_products'      => \wp_json_encode( $data['get_alternate_products'] ?? array() ),
			'offer_start'             => $data['offer_start'] ?? null,
			'offer_end'               => $data['offer_end'] ?? null,
			'product_page_message'    => $data['product_page_message'] ?? '',
			'shop_page_message'       => $data['shop_page_message'] ?? '',
			'bogo_badge_image'        => $data['bogo_badge_image'] ?? '',
			'minimum_quantity_required' => $data['minimum_quantity_required'] ?? 1,
			'status'                  => 'active',
		);

		return $wpdb->insert( $table, $insert_data );
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
			'target_products'         => \wp_json_encode( $data['target_products'] ?? array() ),
			'target_categories'       => \wp_json_encode( $data['target_categories'] ?? array() ),
			'bogo_status'             => $data['bogo_status'] ?? 'no',
			'bogo_deal_type'          => $data['bogo_deal_type'] ?? 'different',
			'offer_type'              => $data['offer_type'] ?? 'free',
			'discount_amount'         => $data['discount_amount'] ?? 0,
			'offer_product_id'        => $data['get_different_product_field'] ?? null,
			'alternate_products'      => \wp_json_encode( $data['get_alternate_products'] ?? array() ),
			'offer_start'             => $data['offer_start'] ?? null,
			'offer_end'               => $data['offer_end'] ?? null,
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
		if ( $settings['target_products'] ) {
			$settings['target_products'] = json_decode( $settings['target_products'], true );
		}
		if ( $settings['target_categories'] ) {
			$settings['target_categories'] = json_decode( $settings['target_categories'], true );
		}
		if ( $settings['alternate_products'] ) {
			$settings['alternate_products'] = json_decode( $settings['alternate_products'], true );
		}

		// Add backward compatibility fields.
		if ( $settings['type'] === 'product' ) {
			$settings['get_different_product_field'] = $settings['offer_product_id'];
			$settings['get_alternate_products']      = $settings['alternate_products'];
		} else {
			$settings['offered_products'] = $settings['target_products'][0] ?? null;
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
			target_products JSON DEFAULT NULL,
			target_categories JSON DEFAULT NULL,
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
			status ENUM('active', 'inactive') DEFAULT 'active',
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			INDEX idx_type_status (type, status),
			INDEX idx_product (product_id, variation_id),
			INDEX idx_global_targets (type, target_products(100), target_categories(100)),
			UNIQUE KEY unique_product_variation (product_id, variation_id)
		) {$charset_collate};";

		require_once( \ABSPATH . 'wp-admin/includes/upgrade.php' );
		\dbDelta( $sql );
	}
}
