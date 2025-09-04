<?php
/**
 * Database migration for Order Bump custom table.
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Modules\UpsellOrderBump\Database;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Handles database migration for Order Bump custom table.
 */
class Migration {

	/**
	 * Table name for order bumps.
	 *
	 * @var string
	 */
	const TABLE_NAME = 'sgsb_order_bumps';

	/**
	 * Current database version.
	 *
	 * @var string
	 */
	const DB_VERSION = '1.0.0';

	/**
	 * Option name for storing database version.
	 *
	 * @var string
	 */
	const DB_VERSION_OPTION = 'sgsb_order_bumps_db_version';

	/**
	 * Create the custom table for order bumps.
	 *
	 * @since 1.0.0
	 * @return void
	 */
	public static function create_table() {
		global $wpdb;

		$table_name = $wpdb->prefix . self::TABLE_NAME;
		$charset_collate = $wpdb->get_charset_collate();

		$sql = "CREATE TABLE $table_name (
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
		) $charset_collate;";

		require_once ABSPATH . 'wp-admin/includes/upgrade.php';
		dbDelta( $sql );

		// Update database version
		update_option( self::DB_VERSION_OPTION, self::DB_VERSION );
	}

	/**
	 * Migrate existing order bumps from post type to custom table.
	 *
	 * @since 1.0.0
	 * @return void
	 */
	public static function migrate_existing_data() {
		global $wpdb;

		// Get all existing order bumps from post type
		$args = array(
			'post_type'      => 'sgsb_order_bump',
			'posts_per_page' => -1,
			'post_status'    => 'publish',
		);

		$bumps = get_posts( $args );

		if ( empty( $bumps ) ) {
			return;
		}

		$table_name = $wpdb->prefix . self::TABLE_NAME;

		foreach ( $bumps as $bump ) {
			$bump_data = maybe_unserialize( $bump->post_excerpt );
			
			if ( ! is_array( $bump_data ) ) {
				continue;
			}

			// Prepare design settings as JSON
			$design_settings = array(
				'box_border_style'                   => $bump_data['box_border_style'] ?? 'solid',
				'box_border_color'                   => $bump_data['box_border_color'] ?? '#000000',
				'box_top_margin'                     => $bump_data['box_top_margin'] ?? '20',
				'box_bottom_margin'                  => $bump_data['box_bottom_margin'] ?? '20',
				'discount_background_color'          => $bump_data['discount_background_color'] ?? '#ff6b6b',
				'discount_text_color'                => $bump_data['discount_text_color'] ?? '#ffffff',
				'discount_font_size'                 => $bump_data['discount_font_size'] ?? '14',
				'product_description_text_color'     => $bump_data['product_description_text_color'] ?? '#333333',
				'product_description_font_size'      => $bump_data['product_description_font_size'] ?? '14',
				'accept_offer_background_color'      => $bump_data['accept_offer_background_color'] ?? '#4CAF50',
				'accept_offer_text_color'            => $bump_data['accept_offer_text_color'] ?? '#ffffff',
				'accept_offer_font_size'             => $bump_data['accept_offer_font_size'] ?? '14',
				'offer_description_background_color' => $bump_data['offer_description_background_color'] ?? '#f0f0f0',
				'offer_description_text_color'       => $bump_data['offer_description_text_color'] ?? '#333333',
				'offer_description_font_size'        => $bump_data['offer_description_font_size'] ?? '14',
				'offer_image_url'                    => $bump_data['offer_image_url'] ?? '',
				'offer_product_title'                => $bump_data['offer_product_title'] ?? '',
				'offer_discount_title'               => $bump_data['offer_discount_title'] ?? '% OFF',
				'offer_fixed_price_title'            => $bump_data['offer_fixed_price_title'] ?? '',
				'product_description'                => $bump_data['product_description'] ?? '',
				'selection_title'                    => $bump_data['selection_title'] ?? 'Select',
				'offer_description'                  => $bump_data['offer_description'] ?? '',
				'offer_product_regular_price'        => $bump_data['offer_product_regular_price'] ?? '',
			);

			// Insert into custom table
			$wpdb->insert(
				$table_name,
				array(
					'name'              => $bump->post_title,
					'status'            => 'active',
					'target_type'       => $bump_data['bump_type'] ?? 'products',
					'target_products'   => wp_json_encode( $bump_data['target_products'] ?? array() ),
					'target_categories' => wp_json_encode( $bump_data['target_categories'] ?? array() ),
					'offer_product_id'  => $bump_data['offer_product'] ?? 0,
					'offer_type'        => $bump_data['offer_type'] ?? 'discount',
					'offer_amount'      => $bump_data['offer_amount'] ?? 0,
					'design_settings'   => wp_json_encode( $design_settings ),
					'created_at'        => $bump->post_date,
					'updated_at'        => $bump->post_modified,
				),
				array(
					'%s', // name
					'%s', // status
					'%s', // target_type
					'%s', // target_products
					'%s', // target_categories
					'%d', // offer_product_id
					'%s', // offer_type
					'%f', // offer_amount
					'%s', // design_settings
					'%s', // created_at
					'%s', // updated_at
				)
			);
		}
	}

	/**
	 * Check if migration is needed.
	 *
	 * @since 1.0.0
	 * @return bool
	 */
	public static function needs_migration() {
		$current_version = get_option( self::DB_VERSION_OPTION, '0.0.0' );
		return version_compare( $current_version, self::DB_VERSION, '<' );
	}

	/**
	 * Run the migration.
	 *
	 * @since 1.0.0
	 * @return void
	 */
	public static function run_migration() {
		if ( self::needs_migration() ) {
			self::create_table();
			self::migrate_existing_data();
		}
	}

	/**
	 * Drop the custom table (for uninstall).
	 *
	 * @since 1.0.0
	 * @return void
	 */
	public static function drop_table() {
		global $wpdb;
		
		$table_name = $wpdb->prefix . self::TABLE_NAME;
		$wpdb->query( "DROP TABLE IF EXISTS $table_name" );
		
		delete_option( self::DB_VERSION_OPTION );
	}
}
