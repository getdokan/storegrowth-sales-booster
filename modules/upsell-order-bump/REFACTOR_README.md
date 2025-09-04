# Upsell Order Bump Module - Refactoring Documentation

## Overview

This document outlines the complete refactoring of the Upsell Order Bump module from using WordPress post types to a custom table architecture with REST API endpoints.

## Key Changes

### 1. Database Architecture

#### Before
- Used WordPress post type `sgsb_order_bump`
- Stored complex data in `post_excerpt` as serialized arrays
- Limited querying capabilities
- Performance issues with large datasets

#### After
- Custom table `wp_sgsb_order_bumps`
- JSON fields for structured data storage
- Optimized database schema with proper indexes
- Better performance and querying capabilities

#### New Table Structure
```sql
CREATE TABLE wp_sgsb_order_bumps (
    id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
    name varchar(255) NOT NULL,
    status varchar(20) NOT NULL DEFAULT 'active',
    target_type varchar(20) NOT NULL DEFAULT 'products',
    target_products json,
    target_categories json,
    offer_product_id bigint(20) unsigned NOT NULL,
    offer_type varchar(20) NOT NULL DEFAULT 'discount',
    offer_amount decimal(10,2) NOT NULL DEFAULT 0.00,
    design_settings json,
    created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY status (status),
    KEY offer_product_id (offer_product_id),
    KEY target_type (target_type)
);
```

### 2. Data Access Layer

#### New Classes
- `OrderBumpData`: Centralized data access class
- `Migration`: Handles database migration and data transfer
- `TestMigration`: Testing utilities for the new architecture

#### Key Features
- Type-safe data operations
- Automatic JSON encoding/decoding
- Error handling and validation
- Migration from old post type data

### 3. REST API Implementation

#### New Endpoints
- `GET /wp-json/sgsb/v1/order-bumps` - List all order bumps
- `GET /wp-json/sgsb/v1/order-bumps/{id}` - Get single order bump
- `POST /wp-json/sgsb/v1/order-bumps` - Create new order bump
- `PUT /wp-json/sgsb/v1/order-bumps/{id}` - Update order bump
- `DELETE /wp-json/sgsb/v1/order-bumps/{id}` - Delete order bump
- `GET /wp-json/sgsb/v1/order-bumps/matching` - Get matching bumps for cart

#### Features
- Full CRUD operations
- JSON Schema validation
- Proper HTTP status codes
- Permission checks
- Error handling

### 4. Frontend Refactoring

#### New API Service
- `OrderBumpApi.js`: Centralized API service for frontend
- Replaces all jQuery AJAX calls
- Promise-based architecture
- Error handling and notifications

#### Updated Components
- `CreateBump.js`: Uses REST API for CRUD operations
- `OrderBumpList.js`: Uses REST API for listing and deletion
- All components now use modern async/await patterns

### 5. Service Provider Updates

#### New Service Providers
- `RestApi\ServiceProvider`: Manages REST API registration
- `RestApi\OrderBumpAjax`: Handles frontend AJAX operations

#### Updated Providers
- `ServiceProvider`: Registers all new services
- `BootstrapServiceProvider`: Removed old AJAX dependencies

## Migration Process

### Automatic Migration
The migration process automatically:
1. Creates the new custom table
2. Migrates existing data from post types
3. Preserves all existing functionality
4. Maintains data integrity

### Data Transformation
- Post title → `name` field
- Post excerpt (serialized) → JSON fields
- Post date → `created_at`
- Post modified → `updated_at`

## Benefits

### Performance
- Faster queries with proper indexing
- Reduced database load
- Better caching capabilities
- Optimized data retrieval

### Maintainability
- Clean separation of concerns
- Type-safe data operations
- Consistent API patterns
- Better error handling

### Scalability
- JSON fields allow flexible data structure
- REST API enables future integrations
- Modular architecture supports extensions
- Better testing capabilities

## File Structure

```
modules/upsell-order-bump/
├── includes/
│   ├── Database/
│   │   ├── Migration.php          # Database migration
│   │   ├── OrderBumpData.php      # Data access layer
│   │   └── TestMigration.php      # Testing utilities
│   ├── RestApi/
│   │   ├── OrderBumpController.php # REST API controller
│   │   ├── OrderBumpAjax.php      # Frontend AJAX handler
│   │   └── ServiceProvider.php    # REST API service provider
│   ├── Providers/
│   │   ├── ServiceProvider.php    # Main service provider
│   │   └── BootstrapServiceProvider.php # Bootstrap services
│   └── OrderBump.php              # Updated frontend logic
├── assets/src/
│   ├── services/
│   │   └── OrderBumpApi.js        # Frontend API service
│   └── components/                # Updated React components
└── templates/                     # Frontend templates (unchanged)
```

## Testing

### Test Coverage
- Database operations (CRUD)
- Data migration
- REST API endpoints
- Frontend API integration
- Error handling

### Running Tests
```php
// Run migration tests
StorePulse\StoreGrowth\Modules\UpsellOrderBump\Database\TestMigration::run_tests();
```

## Breaking Changes

### Removed
- `includes/Ajax.php` - Replaced by REST API
- jQuery AJAX calls in frontend
- Post type dependencies

### Changed
- Data storage format (serialized → JSON)
- API endpoints (AJAX → REST)
- Frontend data fetching patterns

## Backward Compatibility

The refactoring maintains backward compatibility by:
- Preserving all existing functionality
- Maintaining the same frontend interface
- Keeping template compatibility
- Supporting existing data migration

## Future Enhancements

### Potential Improvements
- GraphQL API support
- Real-time updates with WebSockets
- Advanced caching strategies
- Bulk operations
- Data analytics and reporting

### Extension Points
- Custom field support via JSON
- Plugin hooks for data manipulation
- REST API filters and actions
- Custom validation rules

## Conclusion

This refactoring modernizes the Upsell Order Bump module with:
- Better performance and scalability
- Cleaner, more maintainable code
- Modern API architecture
- Improved developer experience
- Future-ready foundation

The new architecture provides a solid foundation for future enhancements while maintaining all existing functionality and improving overall system performance.
