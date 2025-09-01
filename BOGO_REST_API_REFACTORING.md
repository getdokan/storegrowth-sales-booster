# BOGO Ajax to REST API Refactoring

## Overview

This document outlines the refactoring of the BOGO (Buy One Get One) module from Ajax-based communication to WordPress REST API. This refactoring improves code maintainability, follows modern WordPress development practices, and provides better error handling and response formatting.

## Changes Made

### 1. REST API Utility (`storegrowth-sales-booster/modules/bogo/assets/src/utils/restApi.js`)

Created a new utility file that provides:
- Centralized REST API communication functions using WordPress `wp.apiFetch`
- Automatic handling of `wp-json` prefix and nonce authentication
- Proper error handling and response formatting
- Legacy Ajax compatibility wrapper for gradual migration
- Support for all CRUD operations (Create, Read, Update, Delete)

**Key Functions:**
- `getBogoOffers()` - Fetch all BOGO offers
- `getBogoOffer(id)` - Fetch single BOGO offer
- `createBogoOffer(data)` - Create new BOGO offer
- `updateBogoOffer(id, data)` - Update existing BOGO offer
- `deleteBogoOffer(id)` - Delete BOGO offer
- `updateBogoStatus(id, status)` - Update BOGO offer status
- `legacyAjaxWrapper()` - Compatibility layer for existing Ajax calls

### 2. REST API Controller Updates (`storegrowth-sales-booster/modules/bogo/includes/REST/BogoController.php`)

Enhanced the existing REST controller with:
- New status update endpoint (`/wp-json/sales-booster/v1/bogo/offers/{id}/status`)
- Improved error handling and response formatting
- Better parameter validation

**New Endpoints:**
- `PUT /wp-json/sales-booster/v1/bogo/offers/{id}/status` - Update BOGO status

### 3. Frontend Component Updates

#### CreateBogo Component (`storegrowth-sales-booster/modules/bogo/assets/src/components/CreateBogo.jsx`)
- Replaced jQuery Ajax calls with REST API functions
- Added proper error handling with user notifications
- Improved loading state management

#### BogoList Component (`storegrowth-sales-booster/modules/bogo/assets/src/components/BogoList.jsx`)
- Updated list fetching to use REST API
- Replaced status update Ajax calls with REST API
- Enhanced error handling and user feedback

#### CreateBogoButton Component (`storegrowth-sales-booster/modules/bogo/assets/src/components/CreateBogoButton.jsx`)
- Updated data fetching to use REST API
- Improved error handling

### 4. Backend Integration Updates

#### EnqueueScript Updates (`storegrowth-sales-booster/modules/bogo/includes/EnqueueScript.php`)
- Added REST API nonce (`rest_nonce`) to frontend localization
- Maintained backward compatibility with existing Ajax nonce

## API Endpoints

### Base URL
`/wp-json/sales-booster/v1/bogo/offers`

### Available Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all BOGO offers |
| POST | `/` | Create new BOGO offer |
| GET | `/{id}` | Get specific BOGO offer |
| PUT | `/{id}` | Update BOGO offer |
| DELETE | `/{id}` | Delete BOGO offer |
| PUT | `/{id}/status` | Update BOGO offer status |

### Request/Response Format

**Create/Update Request:**
```json
{
  "name_of_order_bogo": "BOGO Offer Name",
  "offered_products": [1, 2, 3],
  "offered_categories": [4, 5, 6],
  "bogo_status": "yes",
  "bogo_deal_type": "different",
  "offer_type": "free",
  "discount_amount": "10",
  "offer_schedule": ["daily"],
  "smart_offer": false
}
```

**Status Update Request:**
```json
{
  "status": "yes"
}
```

**Response Format:**
```json
{
  "id": 123,
  "name_of_order_bogo": "BOGO Offer Name",
  "offered_products": [1, 2, 3],
  "bogo_status": "yes",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

## Migration Strategy

### Phase 1: Parallel Implementation
- REST API endpoints are implemented alongside existing Ajax endpoints
- Frontend components updated to use REST API
- Legacy Ajax wrapper provides fallback for unsupported operations

### Phase 2: Gradual Deprecation
- Monitor usage and performance
- Remove Ajax endpoints once REST API is stable
- Update any remaining Ajax calls

### Phase 3: Complete Migration
- Remove Ajax-related code
- Clean up legacy compatibility layers

## Benefits

### 1. Modern WordPress Standards
- Follows WordPress REST API best practices
- Better integration with WordPress core
- Improved security with proper nonce validation

### 2. Enhanced Error Handling
- Consistent error response format
- Better user feedback and notifications
- Improved debugging capabilities

### 3. Performance Improvements
- Reduced server load with proper HTTP methods
- Better caching opportunities
- Improved response times

### 4. Developer Experience
- Cleaner, more maintainable code
- Better separation of concerns
- Easier testing and debugging

### 5. Future-Proofing
- Ready for headless WordPress implementations
- Better integration with external services
- Support for mobile applications

## Testing

### Manual Testing Checklist
- [ ] Create new BOGO offer
- [ ] Update existing BOGO offer
- [ ] Delete BOGO offer
- [ ] Update BOGO status
- [ ] List all BOGO offers
- [ ] Get single BOGO offer
- [ ] Error handling for invalid requests
- [ ] Permission validation
- [ ] Nonce validation

### Automated Testing
- Unit tests for REST API endpoints
- Integration tests for frontend components
- End-to-end tests for complete workflows

## Security Considerations

### Authentication & Authorization
- Proper nonce validation for all requests
- User capability checks (`manage_options`)
- Input sanitization and validation

### Data Validation
- Server-side parameter validation
- Type checking and sanitization
- SQL injection prevention

### Error Handling
- No sensitive information in error responses
- Proper HTTP status codes
- Consistent error message format

## Rollback Plan

If issues arise during deployment:

1. **Immediate Rollback**: Revert to Ajax-based implementation
2. **Gradual Rollback**: Use legacy Ajax wrapper for problematic operations
3. **Partial Rollback**: Keep REST API for read operations, revert write operations

## Future Enhancements

### Planned Improvements
- API versioning support
- Rate limiting
- Advanced filtering and pagination
- Bulk operations
- Webhook support

### Integration Opportunities
- Mobile app support
- Third-party integrations
- Headless WordPress setups
- E-commerce platform integrations

## Conclusion

The refactoring from Ajax to REST API represents a significant improvement in code quality, maintainability, and adherence to modern WordPress development practices. The implementation provides a solid foundation for future enhancements while maintaining backward compatibility during the transition period.

## Support

For questions or issues related to this refactoring:
1. Check the WordPress REST API documentation
2. Review the error logs for specific issues
3. Test with the provided manual testing checklist
4. Contact the development team for technical support
