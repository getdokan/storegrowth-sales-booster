<?php
/**
 * BogoMigration - moves 1.x BOGO offers into the BOGO table.
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Modules\BoGo;

use StorePulse\StoreGrowth\Helper as PluginHelper;
use Throwable;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class BogoMigration.
 *
 * StoreGrowth 1.x kept global offers as `sgsb_bogo` posts (the settings
 * serialized in `post_excerpt`) and product offers in the product (or, with
 * pro, variation) meta `sgsb_product_bogo_settings`. 2.x reads the
 * `{prefix}spsg_bogo_settings` table only. This copies the 1.x offers into the
 * table once, behind a flag option, and only while the table has no global
 * offers. The 1.x data is never changed or deleted.
 */
class BogoMigration {

	/**
	 * Post type of 1.x global offers.
	 *
	 * @since SPSG_VERSION
	 *
	 * @var string
	 */
	const LEGACY_POST_TYPE = 'sgsb_bogo';

	/**
	 * Product / variation meta key of 1.x product offers.
	 *
	 * @since SPSG_VERSION
	 *
	 * @var string
	 */
	const LEGACY_META_KEY = 'sgsb_product_bogo_settings';

	/**
	 * Flag option: set once the 1.x migration has run (or was not needed).
	 * Holds the run's counts and errors. Not autoloaded.
	 *
	 * @since SPSG_VERSION
	 *
	 * @var string
	 */
	const FLAG_OPTION = 'spsg_bogo_legacy_migrated';

	/**
	 * Design keys a 1.x offer shares with the table's `design_settings`.
	 *
	 * @since SPSG_VERSION
	 *
	 * @var string[]
	 */
	const DESIGN_KEYS = [
		'box_border_style',
		'box_border_color',
		'box_top_margin',
		'box_bottom_margin',
		'discount_background_color',
		'discount_text_color',
		'discount_font_size',
		'product_description_text_color',
		'product_description_font_size',
	];

	/**
	 * Lock held while the migration copies rows, so concurrent admin requests
	 * (admin-ajax, heartbeat) can't copy the same offers twice.
	 *
	 * @since SPSG_VERSION
	 *
	 * @var string
	 */
	const LOCK_NAME = 'spsg_bogo_migration';

	/**
	 * Border styles the storefront draws (`no_border` is "None").
	 *
	 * @since SPSG_VERSION
	 *
	 * @var string[]
	 */
	const BORDER_STYLES = [ 'solid', 'dashed', 'dotted', 'no_border' ];

	/**
	 * Migrate the 1.x offers if that hasn't happened yet. Cheap once done:
	 * one option read. Runs on admin requests.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return void
	 */
	public static function maybe_migrate(): void {
		if ( false !== get_option( self::FLAG_OPTION, false ) ) {
			return;
		}

		self::migrate_to_single_table();
	}

	/**
	 * Run the migration: create the table when missing, copy the 1.x product
	 * and global offers, set the flag. Does nothing once the flag is set or
	 * while another request holds the lock, and copies nothing when the table
	 * already has global offers.
	 *
	 * @return array Migration results (`success`, `messages`, `errors`).
	 */
	public static function migrate_to_single_table() {
		$results = [
			'success'  => true,
			'messages' => [],
			'errors'   => [],
		];

		self::create_bogo_table();

		if ( false !== get_option( self::FLAG_OPTION, false ) ) {
			$results['messages'][] = 'BOGO 1.x migration already done.';
			return $results;
		}

		if ( ! class_exists( 'WP_Upgrader' ) ) {
			require_once ABSPATH . 'wp-admin/includes/class-wp-upgrader.php';
		}

		// An atomic insert, so only one request wins; `add_option()` upserts,
		// so two requests could both "add" it.
		if ( ! \WP_Upgrader::create_lock( self::LOCK_NAME, HOUR_IN_SECONDS ) ) {
			$results['messages'][] = 'BOGO 1.x migration is running in another request.';
			return $results;
		}

		try {
			// Another request may have finished while this one waited; an
			// earlier miss is cached in `notoptions`, so clear both.
			wp_cache_delete( self::FLAG_OPTION, 'options' );
			wp_cache_delete( 'notoptions', 'options' );
			if ( false !== get_option( self::FLAG_OPTION, false ) ) {
				$results['messages'][] = 'BOGO 1.x migration already done.';
				return $results;
			}

			if ( BogoDataManager::get_bogo_offers_count( [ 'type' => 'global' ] ) > 0 ) {
				$results['messages'][] = 'BOGO table already has global offers; 1.x offers not migrated.';
				self::set_flag( 0, 0, [], 'skipped' );
				return $results;
			}

			// Products first: copying them is repeat-safe (a product with a row
			// is skipped), so a run cut short here still finds no global offers
			// next time and finishes.
			$products = self::migrate_product_meta( $results['errors'] );
			$globals  = self::migrate_global_posts( $results['errors'] );

			$results['messages'][] = "Migrated {$globals} global BOGO offers.";
			$results['messages'][] = "Migrated {$products} product BOGO settings.";
			$results['success']    = empty( $results['errors'] );

			self::set_flag( $globals, $products, $results['errors'], 'done' );
		} finally {
			\WP_Upgrader::release_lock( self::LOCK_NAME );
		}

		return $results;
	}

	/**
	 * Create the BOGO settings table when it doesn't exist.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return void
	 */
	private static function create_bogo_table() {
		global $wpdb;

		if ( ! PluginHelper::table_exists( $wpdb->prefix . BogoDataManager::TABLE_NAME ) ) {
			BogoDataManager::create_table();
		}
	}

	/**
	 * Record that the migration ran.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param int      $globals  Global offers migrated.
	 * @param int      $products Product offers migrated.
	 * @param string[] $errors   Skipped rows and why.
	 * @param string   $state    `done` or `skipped`.
	 *
	 * @return void
	 */
	private static function set_flag( int $globals, int $products, array $errors, string $state ) {
		update_option(
			self::FLAG_OPTION,
			[
				'state'    => $state,
				'time'     => time(),
				'globals'  => $globals,
				'products' => $products,
				'errors'   => $errors,
			],
			false
		);
	}

	/**
	 * Copy the 1.x product and variation offers (meta
	 * `sgsb_product_bogo_settings`). A product or variation that already has a
	 * row keeps it, and meta that holds no configured offer (1.x wrote it on
	 * every product save) is left out.
	 *
	 * @param string[] $errors Skipped rows are added here.
	 *
	 * @return int Number of migrated records.
	 */
	private static function migrate_product_meta( array &$errors ) {
		global $wpdb;

		$migrated = 0;

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- One-shot migration.
		$rows = $wpdb->get_results(
			$wpdb->prepare(
				'SELECT m.post_id, m.meta_value, p.post_type, p.post_parent FROM %i m INNER JOIN %i p ON p.ID = m.post_id WHERE m.meta_key = %s ORDER BY m.meta_id ASC',
				$wpdb->postmeta,
				$wpdb->posts,
				self::LEGACY_META_KEY
			)
		);

		foreach ( (array) $rows as $row ) {
			$skipped = sprintf( 'Product BOGO meta on post %d skipped: ', (int) $row->post_id );

			try {
				$settings = maybe_unserialize( $row->meta_value );
				if ( ! is_array( $settings ) ) {
					$errors[] = $skipped . 'settings are not an array';
					continue;
				}

				$is_variation = 'product_variation' === $row->post_type;
				$product_id   = $is_variation ? (int) $row->post_parent : (int) $row->post_id;
				$variation_id = $is_variation ? (int) $row->post_id : 0;

				// A variable product's own meta only holds the switch; its
				// variations carry the offer.
				$needs_offer = $is_variation || has_term( 'variable', 'product_type', $product_id );

				if ( ! $product_id || ! self::is_configured_product_offer( $settings, $needs_offer ) ) {
					continue;
				}

				$existing = BogoDataManager::get_bogo_offers_count(
					[
						'type'         => 'product',
						'product_id'   => $product_id,
						'variation_id' => $variation_id,
					]
				);
				if ( $existing > 0 ) {
					continue;
				}

				$data                     = self::map_legacy_offer( $settings );
				$data['offered_products'] = [ $product_id ];

				// A variation's 1.x settings carry no status (the parent's
				// governs); leave it to the table's default, as pro saves it.
				if ( $is_variation ) {
					unset( $data['status'] );
				}

				if ( ! BogoDataManager::save_product_bogo_settings( $product_id, $variation_id, $data ) ) {
					$errors[] = $skipped . ( $wpdb->last_error ? $wpdb->last_error : 'insert failed' );
					continue;
				}

				// The save credits the current user; the offer belongs to the
				// product's author (a Dokan vendor sees only their own).
				// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- One-shot migration.
				$wpdb->update(
					$wpdb->prefix . BogoDataManager::TABLE_NAME,
					[ 'created_by' => (int) get_post_field( 'post_author', $product_id ) ],
					[
						'type'         => 'product',
						'product_id'   => $product_id,
						'variation_id' => $variation_id,
					]
				);

				++$migrated;
			} catch ( Throwable $e ) {
				$errors[] = $skipped . $e->getMessage();
			}
		}

		return $migrated;
	}

	/**
	 * Copy the 1.x global offers (`sgsb_bogo` posts).
	 *
	 * @param string[] $errors Skipped rows are added here.
	 *
	 * @return int Number of migrated records.
	 */
	private static function migrate_global_posts( array &$errors ) {
		global $wpdb;

		$migrated = 0;

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- One-shot migration.
		$posts = $wpdb->get_results(
			$wpdb->prepare(
				'SELECT ID, post_title, post_excerpt, post_author FROM %i WHERE post_type = %s ORDER BY ID ASC',
				$wpdb->posts,
				self::LEGACY_POST_TYPE
			)
		);

		foreach ( (array) $posts as $post ) {
			$skipped = sprintf( 'BOGO offer post %d skipped: ', (int) $post->ID );

			try {
				$settings = self::parse_excerpt( $post->post_excerpt );
				if ( ! is_array( $settings ) ) {
					$errors[] = $skipped . 'settings are not an array';
					continue;
				}

				$data = self::map_legacy_offer( $settings );

				// 1.x encoded the name as HTML entities before saving it.
				$name = self::decode_text( $settings['name_of_order_bogo'] ?? '' );
				if ( '' === $name ) {
					$name = self::decode_text( $post->post_title );
				}

				$data['name_of_order_bogo'] = '' !== $name ? $name : sprintf( 'BOGO #%d', (int) $post->ID );
				$data['offered_categories'] = self::id_list( $settings['offered_categories'] ?? ( $settings['target_categories'] ?? [] ) );
				$data['created_by']         = (int) $post->post_author;

				BogoDataManager::create_global_offer( $data );

				++$migrated;
			} catch ( Throwable $e ) {
				// `create_global_offer()` throws when the insert fails.
				$errors[] = $skipped . $e->getMessage();
			}
		}

		return $migrated;
	}

	/**
	 * Map a 1.x offer to the keys `BogoDataManager` saves.
	 *
	 * 1.x's `offer_product_id` is the offer's own post ID, not a product, so
	 * it is not carried over; the offer product is `get_different_product_field`.
	 * `get_alternate_categories`, `bogo_type`, `exclude_products` and the old
	 * design keys have no column and stay in the 1.x data only.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array $settings 1.x offer settings.
	 *
	 * @return array
	 */
	private static function map_legacy_offer( array $settings ): array {
		$offer_product = absint( $settings['get_different_product_field'] ?? 0 );
		$schedule      = array_values( array_filter( array_map( 'sanitize_key', (array) ( $settings['offer_schedule'] ?? [] ) ) ) );
		$discount      = is_scalar( $settings['discount_amount'] ?? null ) ? floatval( $settings['discount_amount'] ) : 0;

		$data = [
			'status'                      => 'yes' === ( $settings['bogo_status'] ?? 'yes' ) ? 'active' : 'inactive',
			'offered_products'            => self::id_list( $settings['offered_products'] ?? ( $settings['target_products'] ?? [] ) ),
			'bogo_deal_type'              => 'same' === ( $settings['bogo_deal_type'] ?? '' ) ? 'same' : 'different',
			'offer_type'                  => 'discount' === ( $settings['offer_type'] ?? '' ) ? 'discount' : 'free',
			// A percentage; `floatval()` reads "50%" as 50.
			'discount_amount'             => min( 100, max( 0, $discount ) ),
			'get_different_product_field' => $offer_product ? $offer_product : null,
			'get_alternate_products'      => self::id_list( $settings['get_alternate_products'] ?? [] ),
			'minimum_quantity_required'   => max( 1, absint( $settings['minimum_quantity_required'] ?? 1 ) ),
			'offer_start'                 => self::date_value( $settings['offer_start'] ?? ( $settings['offer_start_date'] ?? '' ) ),
			'offer_end'                   => self::date_value( $settings['offer_end'] ?? ( $settings['offer_end_date'] ?? '' ) ),
			'offer_schedule'              => $schedule ? $schedule : [ 'daily' ],
			'product_page_message'        => sanitize_text_field( (string) ( $settings['product_page_message'] ?? '' ) ),
			'shop_page_message'           => sanitize_text_field( (string) ( $settings['shop_page_message'] ?? '' ) ),
			'bogo_badge_image'            => esc_url_raw( (string) ( $settings['bogo_badge_image'] ?? '' ) ),
		];

		return array_merge( $data, self::design_values( $settings ) );
	}

	/**
	 * The 1.x design and badge values that are valid, sanitized as the
	 * storefront expects them; an invalid or empty one is left out so the
	 * default applies.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array $settings 1.x offer settings.
	 *
	 * @return array
	 */
	private static function design_values( array $settings ): array {
		$values = [];

		foreach ( array_merge( self::DESIGN_KEYS, BogoDataManager::BADGE_KEYS ) as $key ) {
			if ( ! isset( $settings[ $key ] ) || ! is_scalar( $settings[ $key ] ) || '' === (string) $settings[ $key ] ) {
				continue;
			}

			$raw = $settings[ $key ];

			if ( 'box_border_style' === $key ) {
				$value = in_array( $raw, self::BORDER_STYLES, true ) ? $raw : '';
			} elseif ( '_color' === substr( $key, -6 ) ) {
				$value = PluginHelper::sanitize_css_color( $raw );
			} elseif ( '_margin' === substr( $key, -7 ) || '_font_size' === substr( $key, -10 ) ) {
				$value = is_numeric( $raw ) ? absint( $raw ) : '';
			} elseif ( 'enable_custom_badge_image' === $key ) {
				$value = absint( $raw ) ? 1 : 0;
			} elseif ( 'default_custom_badge_icon' === $key ) {
				$value = esc_url_raw( (string) $raw );
			} else {
				$value = sanitize_key( $raw );
			}

			if ( '' !== $value ) {
				$values[ $key ] = $value;
			}
		}

		return $values;
	}

	/**
	 * A 1.x offer post's settings: serialized, or JSON (1.x read both).
	 *
	 * @since SPSG_VERSION
	 *
	 * @param string $excerpt Stored `post_excerpt`.
	 *
	 * @return array|null
	 */
	private static function parse_excerpt( $excerpt ) {
		$settings = maybe_unserialize( $excerpt );

		if ( is_string( $settings ) ) {
			$settings = json_decode( $settings, true );
		}

		return is_array( $settings ) ? $settings : null;
	}

	/**
	 * Whether 1.x product meta holds an offer worth a row: enabled, or with an
	 * offer product or alternates chosen. A variation or a variable product
	 * needs the offer product or alternates.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array $settings    1.x settings.
	 * @param bool  $needs_offer Whether only an offer product or alternates count.
	 *
	 * @return bool
	 */
	private static function is_configured_product_offer( array $settings, bool $needs_offer ): bool {
		if ( ! $needs_offer && 'yes' === ( $settings['bogo_status'] ?? '' ) ) {
			return true;
		}

		return absint( $settings['get_different_product_field'] ?? 0 ) > 0
			|| ! empty( self::id_list( $settings['get_alternate_products'] ?? [] ) );
	}

	/**
	 * A list of positive IDs from a 1.x value: one ID, a comma list or an array.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param mixed $value Stored value.
	 *
	 * @return int[]
	 */
	private static function id_list( $value ): array {
		if ( is_string( $value ) ) {
			$value = explode( ',', $value );
		}

		return array_values( array_unique( array_filter( array_map( 'absint', (array) $value ) ) ) );
	}

	/**
	 * A 1.x date as `Y-m-d`, or null when empty or unreadable.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param mixed $value Stored date.
	 *
	 * @return string|null
	 */
	private static function date_value( $value ) {
		if ( ! is_string( $value ) || '' === trim( $value ) ) {
			return null;
		}

		$time = strtotime( $value );

		return false === $time ? null : gmdate( 'Y-m-d', $time );
	}

	/**
	 * Decode 1.x's entity-encoded text into plain text.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param mixed $value Stored text.
	 *
	 * @return string
	 */
	private static function decode_text( $value ): string {
		return is_scalar( $value ) ? sanitize_text_field( html_entity_decode( (string) $value, ENT_QUOTES, 'UTF-8' ) ) : '';
	}

	/**
	 * Rollback migration.
	 *
	 * It dropped the whole table, 2.x offers included. The migration never
	 * touches the 1.x data, so there is nothing to roll back to.
	 *
	 * @deprecated SPSG_VERSION The 1.x BOGO data is kept; this does nothing.
	 *
	 * @return array Rollback results.
	 */
	public static function rollback_migration() {
		_deprecated_function( __METHOD__, 'SPSG_VERSION' );

		return [
			'success'  => false,
			'messages' => [],
			'errors'   => [ 'Rollback is not supported: the 1.x BOGO data is kept as it was.' ],
		];
	}

	/**
	 * Check if migration is needed.
	 *
	 * @return bool True if migration is needed.
	 */
	public static function is_migration_needed() {
		global $wpdb;

		if ( ! PluginHelper::table_exists( $wpdb->prefix . BogoDataManager::TABLE_NAME ) ) {
			return true;
		}

		return false === get_option( self::FLAG_OPTION, false )
			&& 0 === BogoDataManager::get_bogo_offers_count( [ 'type' => 'global' ] )
			&& self::count_legacy_global_offers() + self::count_legacy_product_offers() > 0;
	}

	/**
	 * Get migration status.
	 *
	 * @return array Migration status information.
	 */
	public static function get_migration_status() {
		global $wpdb;

		$table_exists = PluginHelper::table_exists( $wpdb->prefix . BogoDataManager::TABLE_NAME );

		return [
			'new_table_exists'       => $table_exists,
			'old_product_data_count' => self::count_legacy_product_offers(),
			'old_global_data_count'  => self::count_legacy_global_offers(),
			'new_data_count'         => $table_exists ? BogoDataManager::get_bogo_offers_count() : 0,
			'migration_needed'       => self::is_migration_needed(),
			'backup_exists'          => (bool) get_option( 'spsg_bogo_migration_backup' ),
		];
	}

	/**
	 * Number of 1.x global offer posts.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return int
	 */
	private static function count_legacy_global_offers(): int {
		global $wpdb;

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- Migration status.
		return (int) $wpdb->get_var(
			$wpdb->prepare( 'SELECT COUNT(*) FROM %i WHERE post_type = %s', $wpdb->posts, self::LEGACY_POST_TYPE )
		);
	}

	/**
	 * Number of 1.x product / variation meta rows.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return int
	 */
	private static function count_legacy_product_offers(): int {
		global $wpdb;

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- Migration status.
		return (int) $wpdb->get_var(
			$wpdb->prepare( 'SELECT COUNT(*) FROM %i WHERE meta_key = %s', $wpdb->postmeta, self::LEGACY_META_KEY )
		);
	}

	/**
	 * Clean up old data after migration.
	 *
	 * @deprecated SPSG_VERSION The 1.x BOGO data is never deleted; this does nothing.
	 *
	 * @return array Cleanup results.
	 */
	public static function cleanup_old_data() {
		_deprecated_function( __METHOD__, 'SPSG_VERSION' );

		return [
			'success'  => false,
			'messages' => [],
			'errors'   => [ 'The 1.x BOGO data is kept; nothing was deleted.' ],
		];
	}
}
