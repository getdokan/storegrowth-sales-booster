<?php

namespace StorePulse\StoreGrowth\Modules\UpsellOrderBump\Database;

/**
 * Test migration for order bumps.
 *
 * @since 2.0.0
 */
class TestMigration {

    /**
     * Run test migration.
     *
     * @since 2.0.0
     *
     * @return void
     */
    public static function run_test(): void {
        // Create table first
        Migration::run_migration();

        // Test data
        $test_data = [
            'name' => 'Test Order Bump',
            'status' => 'active',
            'target_type' => 'products',
            'target_products' => wp_json_encode([1, 2, 3]),
            'target_categories' => wp_json_encode([4, 5, 6]),
            'offer_product_id' => 10,
            'offer_type' => 'percentage',
            'offer_amount' => 20.00,
            'offer_discount_title' => 'Special Offer!',
            'created_by' => get_current_user_id(),
            'updated_by' => get_current_user_id(),
            'design_settings' => wp_json_encode([
                'description' => 'Add this product to your order',
                'button_text' => 'Add to Order',
                'background_color' => '#ffffff',
                'text_color' => '#000000',
                'button_color' => '#007cba',
                'button_text_color' => '#ffffff'
            ])
        ];

        $order_bump_data = new OrderBumpData();

        // Test create
        $created_id = $order_bump_data->create($test_data);
        error_log("Test: Created order bump with ID: $created_id");

        // Test get
        $retrieved = $order_bump_data->get($created_id);
        error_log("Test: Retrieved order bump: " . print_r($retrieved, true));

        // Test update
        $update_data = [
            'name' => 'Updated Test Order Bump',
            'offer_amount' => 25.00
        ];
        $updated = $order_bump_data->update($created_id, $update_data);
        error_log("Test: Updated order bump: " . ($updated ? 'Success' : 'Failed'));

        // Test get all
        $all_bumps = $order_bump_data->get_all();
        error_log("Test: Retrieved " . count($all_bumps) . " order bumps");

        // Test get matching bumps
        $matching_bumps = $order_bump_data->get_matching_bumps([1, 2], []);
        error_log("Test: Found " . count($matching_bumps) . " matching bumps for products [1, 2]");

        // Test delete
        $deleted = $order_bump_data->delete($created_id);
        error_log("Test: Deleted order bump: " . ($deleted ? 'Success' : 'Failed'));

        error_log("Test migration completed successfully!");
    }
}
