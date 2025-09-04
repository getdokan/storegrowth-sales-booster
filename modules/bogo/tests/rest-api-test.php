<?php
/**
 * REST API Test File for BOGO Module
 * 
 * This file contains simple tests to verify the REST API functionality
 * 
 * @package SBFW
 */

// Prevent direct access
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Test class for BOGO REST API
 */
class BogoRestApiTest {

    /**
     * Test REST API endpoints
     */
    public static function test_endpoints() {
        $base_url = rest_url( 'sales-booster/v1/bogo/offers' );
        
        echo "<h2>BOGO REST API Tests</h2>";
        
        // Test 1: Check if endpoints are registered
        self::test_endpoint_registration( $base_url );
        
        // Test 2: Test GET all offers
        self::test_get_offers( $base_url );
        
        // Test 3: Test permission checks
        self::test_permissions( $base_url );
        
        echo "<h3>Tests completed!</h3>";
    }
    
    /**
     * Test if endpoints are properly registered
     */
    private static function test_endpoint_registration( $base_url ) {
        echo "<h3>1. Testing Endpoint Registration</h3>";
        
        $response = wp_remote_get( $base_url );
        
        if ( is_wp_error( $response ) ) {
            echo "<p style='color: red;'>❌ Error: " . $response->get_error_message() . "</p>";
            return;
        }
        
        $status_code = wp_remote_retrieve_response_code( $response );
        
        if ( $status_code === 200 || $status_code === 401 ) {
            echo "<p style='color: green;'>✅ Endpoint is accessible (Status: {$status_code})</p>";
        } else {
            echo "<p style='color: red;'>❌ Endpoint not accessible (Status: {$status_code})</p>";
        }
    }
    
    /**
     * Test GET all offers endpoint
     */
    private static function test_get_offers( $base_url ) {
        echo "<h3>2. Testing GET All Offers</h3>";
        
        // Test without authentication (should fail)
        $response = wp_remote_get( $base_url );
        
        if ( is_wp_error( $response ) ) {
            echo "<p style='color: red;'>❌ Error: " . $response->get_error_message() . "</p>";
            return;
        }
        
        $status_code = wp_remote_retrieve_response_code( $response );
        $body = wp_remote_retrieve_body( $response );
        $data = json_decode( $body, true );
        
        if ( $status_code === 401 ) {
            echo "<p style='color: green;'>✅ Authentication required (Status: {$status_code})</p>";
        } elseif ( $status_code === 200 ) {
            echo "<p style='color: green;'>✅ Successfully retrieved offers (Status: {$status_code})</p>";
            if ( is_array( $data ) ) {
                echo "<p>📊 Found " . count( $data ) . " offers</p>";
            }
        } else {
            echo "<p style='color: red;'>❌ Unexpected response (Status: {$status_code})</p>";
        }
    }
    
    /**
     * Test permission checks
     */
    private static function test_permissions( $base_url ) {
        echo "<h3>3. Testing Permissions</h3>";
        
        // Test with non-admin user (should fail)
        $current_user = wp_get_current_user();
        
        if ( current_user_can( 'manage_options' ) ) {
            echo "<p style='color: green;'>✅ Current user has admin privileges</p>";
            
            // Test authenticated request
            $response = wp_remote_get( $base_url, array(
                'headers' => array(
                    'X-WP-Nonce' => wp_create_nonce( 'wp_rest' ),
                ),
            ) );
            
            if ( is_wp_error( $response ) ) {
                echo "<p style='color: red;'>❌ Error: " . $response->get_error_message() . "</p>";
                return;
            }
            
            $status_code = wp_remote_retrieve_response_code( $response );
            
            if ( $status_code === 200 ) {
                echo "<p style='color: green;'>✅ Authenticated request successful</p>";
            } else {
                echo "<p style='color: red;'>❌ Authenticated request failed (Status: {$status_code})</p>";
            }
        } else {
            echo "<p style='color: orange;'>⚠️ Current user is not admin - permission tests limited</p>";
        }
    }
}

// Run tests if accessed directly
if ( isset( $_GET['test_bogo_rest_api'] ) && current_user_can( 'manage_options' ) ) {
    BogoRestApiTest::test_endpoints();
}
