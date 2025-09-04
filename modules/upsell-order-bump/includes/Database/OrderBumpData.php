<?php
/**
 * Order Bump Data Access Class.
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Modules\UpsellOrderBump\Database;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Handles all database operations for Order Bumps.
 */
class OrderBumpData {

	/**
	 * Table name for order bumps.
	 *
	 * @var string
	 */
	private $table_name;

	/**
	 * Constructor.
	 */
	public function __construct() {
		global $wpdb;
		$this->table_name = $wpdb->prefix . Migration::TABLE_NAME;
	}

	/**
	 * Get all order bumps.
	 *
	 * @since 1.0.0
	 * @param array $args Query arguments.
	 * @return array Array of order bumps.
	 */
	public function get_all( $args = array() ) {
		global $wpdb;

		$defaults = array(
			'status'      => 'active',
			'limit'       => -1,
			'offset'      => 0,
			'order_by'    => 'created_at',
			'order'       => 'DESC',
		);

		$args = wp_parse_args( $args, $defaults );

		$where_clause = '';
		$where_values = array();

		if ( ! empty( $args['status'] ) ) {
			$where_clause .= ' AND status = %s';
			$where_values[] = $args['status'];
		}

		$limit_clause = '';
		if ( $args['limit'] > 0 ) {
			$limit_clause = ' LIMIT %d';
			$where_values[] = $args['limit'];

			if ( $args['offset'] > 0 ) {
				$limit_clause .= ' OFFSET %d';
				$where_values[] = $args['offset'];
			}
		}

		$order_clause = sprintf( ' ORDER BY %s %s', $args['order_by'], $args['order'] );

		$sql = "SELECT * FROM {$this->table_name} WHERE 1=1{$where_clause}{$order_clause}{$limit_clause}";

		if ( ! empty( $where_values ) ) {
			$sql = $wpdb->prepare( $sql, $where_values );
		}

		$results = $wpdb->get_results( $sql, ARRAY_A );

		// Process results to decode JSON fields
		return array_map( array( $this, 'process_bump_data' ), $results );
	}

	/**
	 * Get a single order bump by ID.
	 *
	 * @since 1.0.0
	 * @param int $id Order bump ID.
	 * @return array|null Order bump data or null if not found.
	 */
	public function get_by_id( $id ) {
		global $wpdb;

		$sql = $wpdb->prepare(
			"SELECT * FROM {$this->table_name} WHERE id = %d",
			$id
		);

		$result = $wpdb->get_row( $sql, ARRAY_A );

		if ( $result ) {
			return $this->process_bump_data( $result );
		}

		return null;
	}

	/**
	 * Create a new order bump.
	 *
	 * @since 1.0.0
	 * @param array $data Order bump data.
	 * @return int|false Order bump ID on success, false on failure.
	 */
	public function create( $data ) {
		global $wpdb;

		// Validate required fields
		$required_fields = array( 'name', 'offer_product_id' );
		foreach ( $required_fields as $field ) {
			if ( empty( $data[ $field ] ) ) {
				return false;
			}
		}

		// Apply filters for user tracking fields
		$created_by = apply_filters( 'spsg_order_bump_created_by', $data['created_by'] ?? get_current_user_id(), $data );
		$updated_by = apply_filters( 'spsg_order_bump_updated_by', $data['updated_by'] ?? get_current_user_id(), $data );

		// Prepare data for insertion
		$insert_data = array(
			'name'                  => sanitize_text_field( $data['name'] ),
			'status'                => sanitize_text_field( $data['status'] ?? 'active' ),
			'target_type'           => sanitize_text_field( $data['target_type'] ?? 'products' ),
			'target_products'       => wp_json_encode( $data['target_products'] ?? array() ),
			'target_categories'     => wp_json_encode( $data['target_categories'] ?? array() ),
			'offer_product_id'      => intval( $data['offer_product_id'] ),
			'offer_type'            => sanitize_text_field( $data['offer_type'] ?? 'discount' ),
			'offer_amount'          => floatval( $data['offer_amount'] ?? 0 ),
			'offer_discount_title'  => sanitize_text_field( $data['offer_discount_title'] ?? '' ),
			'created_by'            => intval( $created_by ),
			'updated_by'            => intval( $updated_by ),
			'design_settings'       => wp_json_encode( $data['design_settings'] ?? array() ),
		);

		// Apply filter to allow modification of insert data before database operation
		$insert_data = apply_filters( 'spsg_order_bump_insert_data', $insert_data, $data );

		$result = $wpdb->insert(
			$this->table_name,
			$insert_data,
			array(
				'%s', // name
				'%s', // status
				'%s', // target_type
				'%s', // target_products
				'%s', // target_categories
				'%d', // offer_product_id
				'%s', // offer_type
				'%f', // offer_amount
				'%s', // offer_discount_title
				'%d', // created_by
				'%d', // updated_by
				'%s', // design_settings
			)
		);

		if ( $result ) {
			$insert_id = $wpdb->insert_id;
			
			// Fire action after successful creation
			do_action( 'spsg_order_bump_created', $insert_id, $insert_data, $data );
			
			return $insert_id;
		}

		return false;
	}

	/**
	 * Update an existing order bump.
	 *
	 * @since 1.0.0
	 * @param int   $id Order bump ID.
	 * @param array $data Order bump data.
	 * @return bool True on success, false on failure.
	 */
	public function update( $id, $data ) {
		global $wpdb;

		// Prepare data for update
		$update_data = array();

		if ( isset( $data['name'] ) ) {
			$update_data['name'] = sanitize_text_field( $data['name'] );
		}

		if ( isset( $data['status'] ) ) {
			$update_data['status'] = sanitize_text_field( $data['status'] );
		}

		if ( isset( $data['target_type'] ) ) {
			$update_data['target_type'] = sanitize_text_field( $data['target_type'] );
		}

		if ( isset( $data['target_products'] ) ) {
			$update_data['target_products'] = wp_json_encode( $data['target_products'] );
		}

		if ( isset( $data['target_categories'] ) ) {
			$update_data['target_categories'] = wp_json_encode( $data['target_categories'] );
		}

		if ( isset( $data['offer_product_id'] ) ) {
			$update_data['offer_product_id'] = intval( $data['offer_product_id'] );
		}

		if ( isset( $data['offer_type'] ) ) {
			$update_data['offer_type'] = sanitize_text_field( $data['offer_type'] );
		}

		if ( isset( $data['offer_amount'] ) ) {
			$update_data['offer_amount'] = floatval( $data['offer_amount'] );
		}

		if ( isset( $data['offer_discount_title'] ) ) {
			$update_data['offer_discount_title'] = sanitize_text_field( $data['offer_discount_title'] );
		}

		// Always update the updated_by field when updating
		$updated_by = apply_filters( 'spsg_order_bump_updated_by', get_current_user_id(), $data, $id );
		$update_data['updated_by'] = intval( $updated_by );

		if ( isset( $data['design_settings'] ) ) {
			$update_data['design_settings'] = wp_json_encode( $data['design_settings'] );
		}

		if ( empty( $update_data ) ) {
			return false;
		}

		// Apply filter to allow modification of update data before database operation
		$update_data = apply_filters( 'spsg_order_bump_update_data', $update_data, $data, $id );

		$result = $wpdb->update(
			$this->table_name,
			$update_data,
			array( 'id' => $id ),
			null,
			array( '%d' )
		);

		if ( $result !== false ) {
			// Fire action after successful update
			do_action( 'spsg_order_bump_updated', $id, $update_data, $data );
		}

		return $result !== false;
	}

	/**
	 * Delete an order bump.
	 *
	 * @since 1.0.0
	 * @param int $id Order bump ID.
	 * @return bool True on success, false on failure.
	 */
	public function delete( $id ) {
		global $wpdb;

		$result = $wpdb->delete(
			$this->table_name,
			array( 'id' => $id ),
			array( '%d' )
		);

		if ( $result !== false ) {
			// Fire action after successful deletion
			do_action( 'spsg_order_bump_deleted', $id );
		}

		return $result !== false;
	}

	/**
	 * Get order bumps that match cart products.
	 *
	 * @since 1.0.0
	 * @param array $cart_product_ids Array of product IDs in cart.
	 * @param array $cart_category_ids Array of category IDs in cart.
	 * @return array Array of matching order bumps.
	 */
	public function get_matching_bumps( $cart_product_ids, $cart_category_ids ) {
		global $wpdb;

		$sql = "SELECT * FROM {$this->table_name} WHERE status = 'active'";
		$results = $wpdb->get_results( $sql, ARRAY_A );

		$matching_bumps = array();

		foreach ( $results as $bump ) {
			$bump = $this->process_bump_data( $bump );

			if ( $bump['target_type'] === 'products' ) {
				// Check if any target products are in cart
				if ( ! empty( array_intersect( $cart_product_ids, $bump['target_products'] ) ) ) {
					$matching_bumps[] = $bump;
				}
			} else {
				// Check if any target categories are in cart
				if ( ! empty( array_intersect( $cart_category_ids, $bump['target_categories'] ) ) ) {
					$matching_bumps[] = $bump;
				}
			}
		}

		return $matching_bumps;
	}

	/**
	 * Process bump data to decode JSON fields.
	 *
	 * @since 1.0.0
	 * @param array $bump Raw bump data from database.
	 * @return array Processed bump data.
	 */
	private function process_bump_data( $bump ) {
		// Decode JSON arrays
		$bump['target_products'] = json_decode( $bump['target_products'], true );
		$bump['target_categories'] = json_decode( $bump['target_categories'], true );

		// Decode JSON design settings
		$bump['design_settings'] = json_decode( $bump['design_settings'], true );
		if ( ! is_array( $bump['design_settings'] ) ) {
			$bump['design_settings'] = array();
		}

		// Ensure arrays are arrays
		if ( ! is_array( $bump['target_products'] ) ) {
			$bump['target_products'] = array();
		}

		if ( ! is_array( $bump['target_categories'] ) ) {
			$bump['target_categories'] = array();
		}

		return $bump;
	}

	/**
	 * Get table name.
	 *
	 * @since 1.0.0
	 * @return string Table name.
	 */
	public function get_table_name() {
		return $this->table_name;
	}

	/**
	 * Check if table exists.
	 *
	 * @since 1.0.0
	 * @return bool True if table exists, false otherwise.
	 */
	public function table_exists() {
		global $wpdb;

		$table_name = $this->get_table_name();
		$result = $wpdb->get_var( $wpdb->prepare( "SHOW TABLES LIKE %s", $table_name ) );

		return $result === $table_name;
	}
}
