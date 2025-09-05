<?php
/**
 * BogoMigration - Migration utilities for BOGO data unification.
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Modules\BoGo;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class BogoMigration.
 * 
 * Handles migration from dual data sources (product meta + custom post type)
 * to unified single table approach.
 */
class BogoMigration {

	/**
	 * Run the complete migration process.
	 *
	 * @return array Migration results.
	 */
	public static function migrate_to_single_table() {
		$results = array(
			'success' => true,
			'messages' => array(),
			'errors' => array(),
		);

		try {
			// Step 1: Create new table
			self::create_bogo_table();
			$results['messages'][] = 'BOGO table created successfully.';

			// Step 2: Migrate product meta
			$product_migration = self::migrate_product_meta();
			$results['messages'][] = "Migrated {$product_migration} product BOGO settings.";

			// Step 3: Migrate global posts
			$global_migration = self::migrate_global_posts();
			$results['messages'][] = "Migrated {$global_migration} global BOGO offers.";

			// Step 4: Create backup of old data
			self::create_migration_backup();
			$results['messages'][] = 'Migration backup created.';

		} catch ( \Exception $e ) {
			$results['success'] = false;
			$results['errors'][] = $e->getMessage();
		}

		return $results;
	}

	/**
	 * Create the BOGO settings table.
	 *
	 * @return void
	 */
	private static function create_bogo_table() {
		BogoDataManager::create_table();
	}

	/**
	 * Migrate product meta BOGO settings.
	 *
	 * @return int Number of migrated records.
	 */
	private static function migrate_product_meta() {
		global $wpdb;

		$migrated_count = 0;

		// Get all products with BOGO meta.
		$products = $wpdb->get_results(
			"SELECT post_id, meta_value FROM {$wpdb->postmeta} 
			 WHERE meta_key = 'spsg_product_bogo_settings'"
		);

		foreach ( $products as $product ) {
			$settings = maybe_unserialize( $product->meta_value );
			if ( $settings && is_array( $settings ) ) {
				// Get the user who created the product (post author)
				$post_author = $wpdb->get_var( $wpdb->prepare(
					"SELECT post_author FROM {$wpdb->posts} WHERE ID = %d",
					$product->post_id
				) );
				
				// Add user tracking to settings
				$settings['_migrated_user_id'] = $post_author ? intval( $post_author ) : 1;
				
				$result = BogoDataManager::save_product_bogo_settings(
					$product->post_id,
					0, // variation_id
					$settings
				);
				if ( $result ) {
					$migrated_count++;
				}
			}
		}

		return $migrated_count;
	}

	/**
	 * Migrate global BOGO posts.
	 *
	 * @return int Number of migrated records.
	 */
	private static function migrate_global_posts() {
		global $wpdb;

		$migrated_count = 0;

		// Get all BOGO posts.
		$posts = $wpdb->get_results(
			"SELECT ID, post_title, post_excerpt, post_author FROM {$wpdb->posts} 
			 WHERE post_type = 'spsg_bogo'"
		);

		foreach ( $posts as $post ) {
			$settings = maybe_unserialize( $post->post_excerpt );
			if ( $settings && is_array( $settings ) ) {
				$settings['name_of_order_bogo'] = $post->post_title;
				
				// Add user tracking to settings
				$settings['_migrated_user_id'] = $post->post_author ? intval( $post->post_author ) : 1;
				
				$result = BogoDataManager::create_global_offer( $settings );
				if ( $result ) {
					$migrated_count++;
				}
			}
		}

		return $migrated_count;
	}

	/**
	 * Create backup of old data.
	 *
	 * @return void
	 */
	private static function create_migration_backup() {
		global $wpdb;

		// Backup product meta.
		$product_meta_backup = $wpdb->get_results(
			"SELECT post_id, meta_value FROM {$wpdb->postmeta} 
			 WHERE meta_key = 'spsg_product_bogo_settings'"
		);

		// Backup global posts.
		$global_posts_backup = $wpdb->get_results(
			"SELECT ID, post_title, post_excerpt FROM {$wpdb->posts} 
			 WHERE post_type = 'spsg_bogo'"
		);

		$backup_data = array(
			'timestamp' => current_time( 'mysql' ),
			'product_meta' => $product_meta_backup,
			'global_posts' => $global_posts_backup,
		);

		update_option( 'spsg_bogo_migration_backup', $backup_data );
	}

	/**
	 * Rollback migration.
	 *
	 * @return array Rollback results.
	 */
	public static function rollback_migration() {
		$results = array(
			'success' => true,
			'messages' => array(),
			'errors' => array(),
		);

		try {
			// Get backup data.
			$backup_data = get_option( 'spsg_bogo_migration_backup' );
			if ( ! $backup_data ) {
				throw new \Exception( 'No backup data found for rollback.' );
			}

					// Drop the new table.
		global $wpdb;
		$table = $wpdb->prefix . 'spsg_bogo_settings';
		$wpdb->query( "DROP TABLE IF EXISTS {$table}" );

			$results['messages'][] = 'Migration rolled back successfully.';

		} catch ( \Exception $e ) {
			$results['success'] = false;
			$results['errors'][] = $e->getMessage();
		}

		return $results;
	}

	/**
	 * Check if migration is needed.
	 *
	 * @return bool True if migration is needed.
	 */
	public static function is_migration_needed() {
		global $wpdb;

		// Check if new table exists.
		$table = $wpdb->prefix . 'spsg_bogo_settings';
		$table_exists = $wpdb->get_var( "SHOW TABLES LIKE '{$table}'" );

		if ( ! $table_exists ) {
			return true;
		}

		// Check if there's data in the new table.
		$new_data_count = $wpdb->get_var( "SELECT COUNT(*) FROM {$table}" );

		// Check if there's old data to migrate.
		$old_product_data = $wpdb->get_var(
			"SELECT COUNT(*) FROM {$wpdb->postmeta} WHERE meta_key = 'spsg_product_bogo_settings'"
		);

		$old_global_data = $wpdb->get_var(
			"SELECT COUNT(*) FROM {$wpdb->posts} WHERE post_type = 'spsg_bogo'"
		);

		$total_old_data = intval( $old_product_data ) + intval( $old_global_data );

		return $total_old_data > 0 && $new_data_count == 0;
	}

	/**
	 * Get migration status.
	 *
	 * @return array Migration status information.
	 */
	public static function get_migration_status() {
		global $wpdb;

		$status = array(
			'new_table_exists' => false,
			'old_product_data_count' => 0,
			'old_global_data_count' => 0,
			'new_data_count' => 0,
			'migration_needed' => false,
			'backup_exists' => false,
		);

		// Check new table.
		$table = $wpdb->prefix . 'spsg_bogo_settings';
		$status['new_table_exists'] = $wpdb->get_var( "SHOW TABLES LIKE '{$table}'" ) ? true : false;

		if ( $status['new_table_exists'] ) {
			$status['new_data_count'] = intval( $wpdb->get_var( "SELECT COUNT(*) FROM {$table}" ) );
		}

		// Check old data.
		$status['old_product_data_count'] = intval( $wpdb->get_var(
			"SELECT COUNT(*) FROM {$wpdb->postmeta} WHERE meta_key = 'spsg_product_bogo_settings'"
		) );

		$status['old_global_data_count'] = intval( $wpdb->get_var(
			"SELECT COUNT(*) FROM {$wpdb->posts} WHERE post_type = 'spsg_bogo'"
		) );

		// Check if migration is needed.
		$status['migration_needed'] = self::is_migration_needed();

		// Check if backup exists.
		$status['backup_exists'] = get_option( 'spsg_bogo_migration_backup' ) ? true : false;

		return $status;
	}

	/**
	 * Clean up old data after successful migration.
	 *
	 * @return array Cleanup results.
	 */
	public static function cleanup_old_data() {
		global $wpdb;

		$results = array(
			'success' => true,
			'messages' => array(),
			'errors' => array(),
		);

		try {
			// Delete old product meta.
			$deleted_product_meta = $wpdb->delete(
				$wpdb->postmeta,
				array( 'meta_key' => 'spsg_product_bogo_settings' )
			);

			// Delete old global posts.
			$deleted_global_posts = $wpdb->delete(
				$wpdb->posts,
				array( 'post_type' => 'spsg_bogo' )
			);

			$results['messages'][] = "Deleted {$deleted_product_meta} product meta records.";
			$results['messages'][] = "Deleted {$deleted_global_posts} global post records.";

		} catch ( \Exception $e ) {
			$results['success'] = false;
			$results['errors'][] = $e->getMessage();
		}

		return $results;
	}
}
