<?php
/**
 * BogoDataWrapper - Wrapper class for BOGO data operations.
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Modules\BoGo;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class BogoDataWrapper.
 * 
 * Wrapper class that provides a consistent interface for BOGO operations
 * while using the unified BogoDataManager internally.
 */
class BogoDataWrapper {

	/**
	 * Create a new BOGO offer.
	 *
	 * @param array $data BOGO offer data.
	 * @return int|WP_Error|void Post ID on success, WP_Error on failure.
	 */
	public function create( $data ) {
		return BogoDataManager::create_global_offer( $data );
	}

	/**
	 * Get a single BOGO offer by ID.
	 *
	 * @param int $id BOGO offer ID.
	 * @return array|WP_Error BOGO offer data or WP_Error on failure.
	 */
	public function get_item( $id ) {
		return BogoDataManager::get_bogo_offer( $id );
	}

	/**
	 * Get BOGO offers with pagination support.
	 *
	 * @param array $args Query arguments.
	 * @return array Array with data, pagination info, etc.
	 */
	public function get_items( $args = array() ) {
		$offers = BogoDataManager::get_global_bogo_offers();
		
		return array(
			'data'         => $offers,
			'total_items'  => count( $offers ),
			'total_pages'  => 1,
			'current_page' => 1,
			'per_page'     => count( $offers ),
		);
	}

	/**
	 * Update an existing BOGO offer.
	 *
	 * @param int   $id   BOGO offer ID.
	 * @param array $data Updated data.
	 * @return bool|WP_Error Success status or WP_Error on failure.
	 */
	public function update( $id, $data ) {
		return BogoDataManager::update_global_offer( $id, $data );
	}

	/**
	 * Delete a BOGO offer.
	 *
	 * @param int $id BOGO offer ID.
	 * @return bool|WP_Error Success status or WP_Error on failure.
	 */
	public function delete( $id ) {
		return BogoDataManager::delete_bogo_offer( $id );
	}

	/**
	 * Set the status of a BOGO offer.
	 *
	 * @param int    $id     BOGO offer ID.
	 * @param string $status Status ('yes' or 'no').
	 * @return bool|WP_Error Success status or WP_Error on failure.
	 */
	public function set_status( $id, $status ) {
		$status_value = filter_var( $status, FILTER_VALIDATE_BOOLEAN ) ? 'active' : 'inactive';
		return BogoDataManager::set_bogo_status( $id, $status_value );
	}
}
