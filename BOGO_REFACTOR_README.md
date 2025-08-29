# BOGO Module Refactoring - Unified Data Source

## Overview

This refactoring addresses the issue of having two separate data sources for BOGO settings:
1. **Product Meta**: Individual product BOGO settings stored in `sgsb_product_bogo_settings` meta field
2. **Custom Post Type**: Global BOGO offers stored in `sgsb_bogo` post type

## Problem

The dual data source approach created several issues:
- **Source of Truth Violation**: Same BOGO settings could exist in both sources
- **Maintenance Complexity**: Two different data management systems
- **Performance Issues**: Multiple queries to different data sources
- **Data Inconsistency**: Risk of conflicting settings between sources

## Solution

### Single Table Approach

Created a unified `sgsb_bogo_settings` table that stores both product-specific and global BOGO settings:

```sql
CREATE TABLE sgsb_bogo_settings (
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
);
```

### Key Features

1. **Type Field**: Distinguishes between 'product' and 'global' BOGO settings
2. **JSON Fields**: Flexible storage for arrays (target_products, target_categories, alternate_products)
3. **Proper Indexing**: Optimized for common query patterns
4. **Backward Compatibility**: Maintains existing data structure through formatting layer

## New Classes

### BogoDataManager

Unified data access layer that provides:
- `get_product_bogo_settings()` - Get BOGO settings for a product
- `save_product_bogo_settings()` - Save product-specific BOGO settings
- `get_global_bogo_offers()` - Get all global BOGO offers
- `create_global_offer()` - Create new global BOGO offer
- `update_global_offer()` - Update existing global BOGO offer
- `delete_bogo_offer()` - Delete BOGO offer
- `set_bogo_status()` - Set BOGO offer status

### BogoMigration

Migration utilities for transitioning from old to new system:
- `migrate_to_single_table()` - Complete migration process
- `rollback_migration()` - Rollback migration if needed
- `is_migration_needed()` - Check if migration is required
- `get_migration_status()` - Get current migration status
- `cleanup_old_data()` - Remove old data after successful migration

## Migration Process

### Automatic Migration

The migration runs automatically when the plugin is activated if:
1. New table doesn't exist, OR
2. New table exists but is empty AND old data exists

### Manual Migration

```php
// Check migration status
$status = \STOREGROWTH\SPSB\Modules\BoGo\BogoMigration::get_migration_status();

// Run migration
$results = \STOREGROWTH\SPSB\Modules\BoGo\BogoMigration::migrate_to_single_table();

// Rollback if needed
$rollback_results = \STOREGROWTH\SPSB\Modules\BoGo\BogoMigration::rollback_migration();
```

## Backward Compatibility

The refactoring maintains full backward compatibility:

1. **Helper Class**: Updated to use new data manager with fallback to old methods
2. **OrderBogo Class**: Updated to save settings using new data manager
3. **Ajax Class**: Updated to use new data manager for CRUD operations
4. **Data Format**: Maintains existing data structure through formatting layer

## Benefits

1. **Single Source of Truth**: All BOGO data in one place
2. **Better Performance**: Optimized queries and indexing
3. **Easier Maintenance**: Unified codebase and data structure
4. **Data Integrity**: Proper constraints and validation
5. **Scalability**: Better database schema for future growth
6. **Backward Compatibility**: No breaking changes for existing functionality

## Testing

### Migration Testing

1. **Pre-migration**: Verify old data exists and is accessible
2. **Migration**: Run migration and verify data transfer
3. **Post-migration**: Verify new data is accessible and functional
4. **Rollback**: Test rollback functionality if needed

### Functionality Testing

1. **Product BOGO Settings**: Create, read, update, delete product-specific settings
2. **Global BOGO Offers**: Create, read, update, delete global offers
3. **Frontend Display**: Verify BOGO offers display correctly
4. **Cart Functionality**: Verify BOGO logic works in cart
5. **Admin Interface**: Verify admin forms work correctly

## Rollback Plan

If issues arise, the system can be rolled back:

1. **Automatic Backup**: Migration creates backup of old data
2. **Rollback Function**: `BogoMigration::rollback_migration()`
3. **Data Restoration**: Old data can be restored from backup

## Future Considerations

1. **Cleanup**: Remove old data sources after successful migration
2. **Performance Monitoring**: Monitor query performance improvements
3. **Feature Extensions**: Leverage new schema for additional features
4. **Documentation**: Update developer documentation

## Files Modified

- `modules/bogo/includes/BogoDataManager.php` (NEW)
- `modules/bogo/includes/BogoMigration.php` (NEW)
- `modules/bogo/includes/Helper.php` (UPDATED)
- `modules/bogo/includes/OrderBogo.php` (UPDATED)
- `modules/bogo/includes/Ajax.php` (UPDATED)
- `storegrowth-sales-booster.php` (UPDATED)

## Database Changes

- **New Table**: `sgsb_bogo_settings`
- **Old Data**: Preserved in backup during migration
- **Indexes**: Optimized for common query patterns
- **Constraints**: Proper data integrity constraints
