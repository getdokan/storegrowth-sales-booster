<?php
/**
 * Test script for Order Bump migration and functionality.
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Modules\UpsellOrderBump\Database;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Test class for Order Bump functionality.
 */
class TestMigration {

	/**
	 * Run basic tests for the new architecture.
	 *
	 * @since 1.0.0
	 * @return void
	 */
	public static function run_tests() {
		// Test 1: Check if table exists
		$order_bump_data = new OrderBumpData();
		if ( ! $order_bump_data->table_exists() ) {
			error_log( 'Order Bump: Custom table does not exist' );
			return;
		}

		// Test 2: Test creating an order bump
		$test_data = array(
			'name'              => 'Test Order Bump',
			'status'            => 'active',
			'target_type'       => 'products',
			'target_products'   => array( 1, 2, 3 ),
			'target_categories' => array( 5, 6 ),
			'offer_product_id'  => 10,
			'offer_type'        => 'discount',
			'offer_amount'      => 20.00,
			'design_settings'   => array(
				'box_border_style' => 'solid',
				'box_border_color' => '#000000',
				'discount_background_color' => '#ff6b6b',
				'discount_text_color' => '#ffffff',
			),
		);

		$bump_id = $order_bump_data->create( $test_data );
		if ( ! $bump_id ) {
			error_log( 'Order Bump: Failed to create test order bump' );
			return;
		}

		// Test 3: Test retrieving the order bump
		$retrieved_bump = $order_bump_data->get_by_id( $bump_id );
		if ( ! $retrieved_bump ) {
			error_log( 'Order Bump: Failed to retrieve test order bump' );
			return;
		}

		// Test 4: Test updating the order bump
		$update_data = array(
			'name' => 'Updated Test Order Bump',
			'offer_amount' => 25.00,
		);

		$update_result = $order_bump_data->update( $bump_id, $update_data );
		if ( ! $update_result ) {
			error_log( 'Order Bump: Failed to update test order bump' );
			return;
		}

		// Test 5: Test getting all order bumps
		$all_bumps = $order_bump_data->get_all();
		if ( empty( $all_bumps ) ) {
			error_log( 'Order Bump: Failed to retrieve all order bumps' );
			return;
		}

		// Test 6: Test matching bumps functionality
		$matching_bumps = $order_bump_data->get_matching_bumps( array( 1, 2 ), array( 5, 6 ) );
		if ( empty( $matching_bumps ) ) {
			error_log( 'Order Bump: Failed to find matching bumps' );
			return;
		}

		// Test 7: Clean up - delete the test order bump
		$delete_result = $order_bump_data->delete( $bump_id );
		if ( ! $delete_result ) {
			error_log( 'Order Bump: Failed to delete test order bump' );
			return;
		}

		error_log( 'Order Bump: All tests passed successfully!' );
	}
}
