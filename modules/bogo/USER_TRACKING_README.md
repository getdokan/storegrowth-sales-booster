# BOGO User Tracking Implementation

This document describes the implementation of user tracking for BOGO (Buy One Get One) settings in the StoreGrowth Sales Booster plugin.

## Overview

The BOGO settings table (`spsg_bogo_settings`) has been enhanced with two new fields:
- `created_by` - Stores the user ID who created the BOGO setting (set once, never changed)
- `updated_by` - Stores the user ID who last updated the BOGO setting (updated on every change)

## Database Changes

### New Columns Added

```sql
ALTER TABLE `spsg_bogo_settings` 
ADD COLUMN `created_by` BIGINT DEFAULT NULL AFTER `status`,
ADD COLUMN `updated_by` BIGINT DEFAULT NULL AFTER `created_by`;
```

### New Indexes Added

```sql
ALTER TABLE `spsg_bogo_settings` 
ADD INDEX `idx_created_by` (`created_by`),
ADD INDEX `idx_updated_by` (`updated_by`);
```

## Code Changes

### BogoDataManager.php

The following methods have been updated to include user tracking:

1. **`save_product_bogo_settings()`** - Sets `created_by` for new records and `updated_by` for updates
2. **`create_global_offer()`** - Sets both `created_by` and `updated_by` for new global offers
3. **`update_global_offer()`** - Sets `updated_by` when updating existing offers
4. **`set_bogo_status()`** - Sets `updated_by` when changing offer status

### Code Refactoring

The code has been refactored to eliminate duplication between product and global BOGO methods:

- **`map_bogo_data()`** - Unified method that handles data mapping for both product and global BOGO types
- **Reduced Code Duplication** - Common fields are now mapped in one place
- **Consistent Data Structure** - Both types use the same mapping logic with type-specific variations

### Filters for Extensibility

All user tracking fields support WordPress filters for maximum extensibility:

- **`spsg_bogo_created_by`** - Filter for the user ID who created the record
- **`spsg_bogo_updated_by`** - Filter for the user ID who last updated the record

### Migration Support

The existing migration system automatically adds these columns when:
- A new BOGO table is created
- An existing table is migrated

## Usage Examples

### Creating a New BOGO Setting

```php
$settings = array(
    'bogo_status' => 'yes',
    'bogo_deal_type' => 'different',
    // ... other settings
);

// This will automatically set created_by and updated_by to current user
$result = BogoDataManager::save_product_bogo_settings($product_id, 0, $settings);
```

**Important**: The `created_by` field is set only once when the record is created and is never changed during updates.

### Updating an Existing BOGO Setting

```php
$settings = array(
    'bogo_status' => 'no',
    // ... other settings
);

// This will automatically set updated_by to current user
$result = BogoDataManager::update_global_offer($offer_id, $settings);
```

### Querying by User

```php
// Get all BOGO offers created by a specific user
$offers = $wpdb->get_results($wpdb->prepare(
    "SELECT * FROM {$table} WHERE created_by = %d",
    $user_id
));

// Get all BOGO offers updated by a specific user
$offers = $wpdb->get_results($wpdb->prepare(
    "SELECT * FROM {$table} WHERE updated_by = %d",
    $user_id
));
```

### Unified Data Mapping

The `map_bogo_data()` method provides a single point for mapping BOGO settings to database fields:

```php
/**
 * Map BOGO settings to database fields.
 *
 * @param array  $data        BOGO settings data.
 * @param string $type        BOGO type ('product' or 'global').
 * @param int    $product_id  Product ID (for product type).
 * @param int    $variation_id Variation ID (for product type).
 * @return array Mapped data for database operations.
 */
private static function map_bogo_data( $data, $type, $product_id = 0, $variation_id = 0 )
```

This method handles:
- Common fields (bogo_status, offer_type, discount_amount, etc.)
- Type-specific fields (product_id, variation_id for products; offered_categories for global)
- JSON encoding of array fields
- Default values for missing fields

### Using Filters for Custom Logic

The filters allow you to implement custom user tracking logic:

```php
// Override the created_by user ID
add_filter('spsg_bogo_created_by', function($user_id, $product_id, $variation_id, $settings) {
    // Custom logic to determine who should be credited with creating this BOGO
    if (isset($settings['_custom_creator'])) {
        return $settings['_custom_creator'];
    }
    return $user_id;
}, 10, 4);

// Override the updated_by user ID
add_filter('spsg_bogo_updated_by', function($user_id, $record_id, $data) {
    // Custom logic to determine who should be credited with updating this BOGO
    if (isset($data['_custom_updater'])) {
        return $data['_custom_updater'];
    }
    return $user_id;
}, 10, 3);

// Log all BOGO user tracking changes
add_filter('spsg_bogo_created_by', function($user_id, $product_id, $variation_id, $settings) {
    error_log("BOGO created by user {$user_id} for product {$product_id}");
    return $user_id;
}, 10, 4);

add_filter('spsg_bogo_updated_by', function($user_id, $record_id, $data) {
    error_log("BOGO updated by user {$user_id} for record {$record_id}");
    return $user_id;
}, 10, 3);
```

## Migration

### Automatic Migration

The new columns are automatically added when:
1. The plugin is activated
2. The BOGO table is created for the first time
3. The existing migration system runs

### Manual Migration

If you need to manually add the columns to an existing table, you can run the SQL commands directly:

```sql
-- Add created_by column
ALTER TABLE `wp_spsg_bogo_settings` 
ADD COLUMN `created_by` BIGINT DEFAULT NULL AFTER `status`;

-- Add updated_by column  
ALTER TABLE `wp_spsg_bogo_settings` 
ADD COLUMN `updated_by` BIGINT DEFAULT NULL AFTER `created_by`;

-- Add indexes for performance
ALTER TABLE `wp_spsg_bogo_settings` 
ADD INDEX `idx_created_by` (`created_by`),
ADD INDEX `idx_updated_by` (`updated_by`);

-- Update existing records with default user ID (replace 1 with your admin user ID)
UPDATE `wp_spsg_bogo_settings` SET `created_by` = 1, `updated_by` = 1 
WHERE `created_by` IS NULL OR `updated_by` IS NULL;
```

**Note**: Replace `wp_` with your actual database prefix if different.



## Backward Compatibility

- Existing records will have `created_by` and `updated_by` set to NULL initially
- The migration system will update existing records with a default user ID (admin user)
- All existing functionality continues to work without changes
- New records automatically include user tracking

## Security Considerations

- User IDs are stored as BIGINT values
- The `created_by` field is set only once when a record is created
- The `updated_by` field is updated every time a record is modified
- User IDs are validated using WordPress's `get_current_user_id()` function
- Indexes are added for performance when querying by user

## Performance Impact

- Minimal performance impact due to efficient indexing
- New columns are nullable, so they don't affect existing queries
- Indexes on `created_by` and `updated_by` improve query performance
- No changes to existing query patterns

## Troubleshooting

### Common Issues

1. **Columns not added**: Ensure the migration has run successfully
2. **User ID not set**: Check if `get_current_user_id()` returns a valid user ID
3. **Performance issues**: Verify that indexes are properly created

### Debugging

Check if the columns exist by running this SQL query:

```sql
SHOW COLUMNS FROM `wp_spsg_bogo_settings` LIKE 'created_by';
SHOW COLUMNS FROM `wp_spsg_bogo_settings` LIKE 'updated_by';
```

### Logs

Check WordPress debug logs for any migration-related errors or warnings.

## Future Enhancements

Potential future improvements could include:
- User activity logging for BOGO changes
- Audit trail functionality
- User permission checks based on creation/update history
- Bulk user assignment for migrated data
