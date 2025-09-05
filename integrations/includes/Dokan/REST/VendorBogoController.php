<?php

namespace StorePulse\StoreGrowth\Integrations\Dokan\REST;

use StorePulse\StoreGrowth\Modules\BoGo\REST\BogoController;
use StorePulse\StoreGrowth\Modules\BoGo\BogoDataManager;
use WP_Error;
use WP_REST_Request;
use WP_REST_Response;

defined( 'ABSPATH' ) || exit();

/**
 * VendorBogoController Class.
 *
 * @package SBFW
 */
class VendorBogoController extends BogoController {

    /**
     * Class Constructor.
     *
     * @return void
     */
    public function __construct() {
        parent::__construct();
        $this->rest_base = 'bogo/offers/vendor';
    }

    /**
     * Permission Checker.
     *
     * @since 1.12.0
     *
     * @param WP_REST_Request $request Rest Request.
     *
     * @return bool|WP_Error
     */
    public function check_permission( $request ) {
        if ( current_user_can( 'dokandar' ) ) {
            return true;
        }

        return new WP_Error(
            'salesbooster_permission_failure',
            __( 'Sorry! You are not permitted to do the current action.', 'storegrowth-sales-booster' ),
            [ 'status' => 403 ]
        );
    }

    /**
     * Override query filters to filter offers by current vendor.
     *
     * @since 1.12.0
     * @param WP_REST_Request $request Rest Request.
     * @return array Query filters for BogoDataManager.
     */
    protected function get_query_filters( $request ) {
        // Filter offers by the current vendor's ID
        $vendor_id = dokan_get_current_user_id();
        
        return ['created_by' => $vendor_id];
    }

    /**
     * Override query options to customize ordering for vendor offers.
     *
     * @since 1.12.0
     * @param WP_REST_Request $request Rest Request.
     * @return array Query options for BogoDataManager.
     */
    protected function get_query_options( $request ) {
        // Get the default pagination options from parent
        $options = parent::get_query_options( $request );
        
        // Customize ordering for vendor offers if needed
        $options['order_by'] = 'created_at DESC';
        
        return $options;
    }



    /**
     * Override permission check for single item access.
     * Ensures vendors can only access their own BOGO offers.
     *
     * @since 1.12.0
     * @param array $item The BOGO offer data.
     * @param WP_REST_Request $request Rest Request.
     * @return bool|WP_Error True if permission granted, WP_Error otherwise.
     */
    protected function check_single_item_permission( $item, $request ) {
        $vendor_id = dokan_get_current_user_id();
        
        // Check if the current vendor owns this offer
        if ( ! isset( $item['created_by'] ) || (int) $item['created_by'] !== $vendor_id ) {
            return new WP_Error(
                'salesbooster_permission_failure',
                __( 'You do not have permission to access this BOGO offer.', 'storegrowth-sales-booster' ),
                [ 'status' => 403 ]
            );
        }
        
        return true;
    }

    /**
     * Override data preparation to automatically set the created_by field to current vendor.
     *
     * @since 1.12.0
     * @param array $data The validated request data.
     * @param WP_REST_Request $request Rest Request.
     * @return array Modified data for creation.
     */
    protected function prepare_data_for_creation( $data, $request ) {
        // Ensure the offer is created for the current vendor
        $data['created_by'] = dokan_get_current_user_id();
        
        return $data;
    }

    /**
     * Override creation limitations to check vendor-specific limits.
     *
     * @since 1.12.0
     * @param array $data The validated request data.
     * @param WP_REST_Request $request Rest Request.
     * @return bool|WP_Error True if allowed, WP_Error otherwise.
     */
    protected function check_creation_limitations( $data, $request ) {
        // Check for free version limitations specific to vendor
        if ( ! sp_store_growth()->has_pro() ) {
            $vendor_id = dokan_get_current_user_id();
            $existing_offers = BogoDataManager::get_bogo_offers(['created_by' => $vendor_id]);
            if ( count( $existing_offers ) >= 2 ) {
                return new WP_Error(
                    'salesbooster_limit_exceeded',
                    __( 'BOGO limit exceeded. Upgrade to PRO for unlimited offers.', 'storegrowth-sales-booster' ),
                    [ 'status' => 403 ]
                );
            }
        }

        return true;
    }
}
