<?php
/**
 * LegacyMigration - moves 1.x order bumps into the order bumps table.
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Modules\UpsellOrderBump\Database;

use StorePulse\StoreGrowth\Modules\UpsellOrderBump\OrderBumpDesign;
use StorePulse\StoreGrowth\Modules\UpsellOrderBump\RestApi\OrderBumpController;
use Throwable;
use WP_Upgrader;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * StoreGrowth 1.x kept order bumps as `sgsb_order_bump` posts, the settings
 * serialized in `post_excerpt`. 2.x reads the `{prefix}spsg_order_bumps`
 * table only. This copies the published 1.x bumps into the table once,
 * behind a flag option, and only while the table has no bumps. The 1.x
 * posts are never changed or deleted.
 *
 * @since SPSG_VERSION
 */
class LegacyMigration {

	/**
	 * Post type of 1.x order bumps.
	 *
	 * @since SPSG_VERSION
	 *
	 * @var string
	 */
	const LEGACY_POST_TYPE = 'sgsb_order_bump';

	/**
	 * Flag option: set once the 1.x migration has run (or was not needed).
	 * Holds the run's counts and errors. Not autoloaded.
	 *
	 * @since SPSG_VERSION
	 *
	 * @var string
	 */
	const FLAG_OPTION = 'spsg_order_bump_legacy_migrated';

	/**
	 * Lock held while the migration copies rows, so concurrent requests can't
	 * copy the same bumps twice.
	 *
	 * @since SPSG_VERSION
	 *
	 * @var string
	 */
	const LOCK_NAME = 'spsg_order_bump_migration';

	/**
	 * Migrate the 1.x bumps if that hasn't happened yet. Cheap once done: one
	 * option read. Runs on module activation.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return void
	 */
	public static function maybe_migrate(): void {
		if ( false !== get_option( self::FLAG_OPTION, false ) ) {
			return;
		}

		self::migrate();
	}

	/**
	 * Run the migration: copy the published 1.x bumps, set the flag. Does
	 * nothing once the flag is set or while another request holds the lock,
	 * and copies nothing when the table already has bumps. Expects the table
	 * to exist (`Migration::run_migration()`).
	 *
	 * @since SPSG_VERSION
	 *
	 * @return array Migration results (`success`, `messages`, `errors`).
	 */
	public static function migrate(): array {
		$results = [
			'success'  => true,
			'messages' => [],
			'errors'   => [],
		];

		if ( false !== get_option( self::FLAG_OPTION, false ) ) {
			$results['messages'][] = 'Order bump 1.x migration already done.';
			return $results;
		}

		if ( ! class_exists( 'WP_Upgrader' ) ) {
			require_once ABSPATH . 'wp-admin/includes/class-wp-upgrader.php';
		}

		// An atomic insert, so only one request wins; `add_option()` upserts,
		// so two requests could both "add" it.
		if ( ! WP_Upgrader::create_lock( self::LOCK_NAME, HOUR_IN_SECONDS ) ) {
			$results['messages'][] = 'Order bump 1.x migration is running in another request.';
			return $results;
		}

		try {
			// Another request may have finished while this one waited; an
			// earlier miss is cached in `notoptions`, so clear both.
			wp_cache_delete( self::FLAG_OPTION, 'options' );
			wp_cache_delete( 'notoptions', 'options' );
			if ( false !== get_option( self::FLAG_OPTION, false ) ) {
				$results['messages'][] = 'Order bump 1.x migration already done.';
				return $results;
			}

			if ( ( new OrderBumpData() )->get_count() > 0 ) {
				$results['messages'][] = 'Order bumps table already has bumps; 1.x bumps not migrated.';
				self::set_flag( 0, [], 'skipped' );
				return $results;
			}

			$bumps = self::migrate_posts( $results['errors'] );

			$results['messages'][] = "Migrated {$bumps} order bumps.";
			$results['success']    = empty( $results['errors'] );

			self::set_flag( $bumps, $results['errors'], 'done' );
		} finally {
			WP_Upgrader::release_lock( self::LOCK_NAME );
		}

		return $results;
	}

	/**
	 * Record that the migration ran.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param int      $bumps  Bumps migrated.
	 * @param string[] $errors Skipped posts and why.
	 * @param string   $state  `done` or `skipped`.
	 *
	 * @return void
	 */
	private static function set_flag( int $bumps, array $errors, string $state ): void {
		update_option(
			self::FLAG_OPTION,
			[
				'state'  => $state,
				'time'   => time(),
				'bumps'  => $bumps,
				'errors' => $errors,
			],
			false
		);
	}

	/**
	 * Copy the published 1.x bumps, oldest first. 1.x listed and showed only
	 * published ones (`get_posts()`'s default status).
	 *
	 * @since SPSG_VERSION
	 *
	 * @param string[] $errors Skipped posts are added here.
	 *
	 * @return int Number of migrated bumps.
	 */
	private static function migrate_posts( array &$errors ): int {
		global $wpdb;

		$migrated = 0;
		$data     = new OrderBumpData();

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- One-shot migration.
		$posts = $wpdb->get_results(
			$wpdb->prepare(
				'SELECT ID, post_title, post_excerpt, post_author FROM %i WHERE post_type = %s AND post_status = %s ORDER BY ID ASC',
				$wpdb->posts,
				self::LEGACY_POST_TYPE,
				'publish'
			)
		);

		foreach ( (array) $posts as $post ) {
			$skipped = sprintf( 'Order bump post %d skipped: ', (int) $post->ID );

			try {
				$settings = self::parse_excerpt( (string) $post->post_excerpt );
				if ( null === $settings ) {
					$errors[] = $skipped . 'settings are not an array';
					continue;
				}

				$bump = self::map_legacy_bump( $settings, $post );
				if ( ! $bump['offer_product_id'] ) {
					$errors[] = $skipped . 'no offer product';
					continue;
				}

				if ( ! $data->create( $bump ) ) {
					$errors[] = $skipped . ( $wpdb->last_error ? $wpdb->last_error : 'insert failed' );
					continue;
				}

				++$migrated;
			} catch ( Throwable $e ) {
				$errors[] = $skipped . $e->getMessage();
			}
		}

		return $migrated;
	}

	/**
	 * Map a 1.x bump to the keys `OrderBumpData::create()` saves, cleaned as
	 * a REST save cleans them.
	 *
	 * 1.x's `offer_product_id` is the bump's own post ID, not a product; the
	 * offer product (a simple product or a variation) is `offer_product`.
	 * `bump_schedule` (never checked by the 1.x storefront) and `smart_offer`
	 * stay in the 1.x data only.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array  $settings 1.x bump settings.
	 * @param object $post     1.x post (`ID`, `post_title`, `post_author`).
	 *
	 * @return array
	 */
	private static function map_legacy_bump( array $settings, $post ): array {
		// 1.x encoded the texts as HTML entities; `sanitize_text()` decodes them.
		$name = OrderBumpDesign::sanitize_text( $settings['name_of_order_bump'] ?? '' );
		if ( '' === $name ) {
			$name = OrderBumpDesign::sanitize_text( $post->post_title );
		}

		// The 1.x storefront priced anything but `discount` as a fixed price.
		$offer_type = 'discount' === ( $settings['offer_type'] ?? '' ) ? 'discount' : 'price';
		$amount     = is_scalar( $settings['offer_amount'] ?? null ) ? (float) $settings['offer_amount'] : 0;
		$max        = 'discount' === $offer_type ? 100 : OrderBumpController::MAX_PRICE;

		$design     = self::design_values( $settings );
		$offer_id   = absint( $settings['offer_product'] ?? 0 );
		$product    = $offer_id ? wc_get_product( $offer_id ) : null;
		$design     = OrderBumpDesign::sanitize( $product ? array_merge( $design, OrderBumpDesign::offer_product_copies( $product ) ) : $design );
		$author     = (int) $post->post_author;
		$categories = 'categories' === ( $settings['bump_type'] ?? '' );

		return [
			'name'                 => '' !== $name ? $name : sprintf( 'Order Bump #%d', (int) $post->ID ),
			'status'               => 'active',
			'target_type'          => $categories ? 'categories' : 'products',
			'target_products'      => self::id_list( $settings['target_products'] ?? [] ),
			'target_categories'    => self::id_list( $settings['target_categories'] ?? [] ),
			'offer_product_id'     => $offer_id,
			'offer_type'           => $offer_type,
			'offer_amount'         => min( $max, max( 0, $amount ) ),
			'offer_discount_title' => $design['offer_discount_title'],
			'design_settings'      => $design,
			'created_by'           => $author,
			'updated_by'           => $author,
		];
	}

	/**
	 * The 1.x values of the keys a 2.x bump keeps in `design_settings`, over
	 * the 2.x defaults. The offer product's copies are the 1.x ones, for an
	 * offer product that no longer exists.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array $settings 1.x bump settings.
	 *
	 * @return array
	 */
	private static function design_values( array $settings ): array {
		$design = OrderBumpDesign::get_defaults();
		$keys   = array_merge( array_keys( $design ), [ 'offer_product_title', 'offer_image_url', 'offer_product_regular_price' ] );

		foreach ( $keys as $key ) {
			if ( isset( $settings[ $key ] ) && is_scalar( $settings[ $key ] ) && '' !== (string) $settings[ $key ] ) {
				$design[ $key ] = $settings[ $key ];
			}
		}

		// 1.x's "no image" value.
		if ( 'http://false' === ( $design['offer_image_url'] ?? '' ) ) {
			$design['offer_image_url'] = '';
		}

		return $design;
	}

	/**
	 * A 1.x bump post's settings: serialized (1.x's `bump_create`), or JSON.
	 *
	 * 1.x serialized the still-slashed request and `wp_insert_post()`
	 * unslashed the result, so a text with a quote or backslash (a product
	 * title such as `Men's shirt`) left string lengths that no longer match;
	 * those are recounted.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param string $excerpt Stored `post_excerpt`.
	 *
	 * @return array|null
	 */
	private static function parse_excerpt( string $excerpt ) {
		$excerpt = trim( $excerpt );

		if ( is_serialized( $excerpt ) ) {
			$settings = self::unserialize_array( $excerpt );

			if ( null === $settings ) {
				$settings = self::unserialize_array( self::recount_string_lengths( $excerpt ) );
			}

			return $settings;
		}

		$settings = json_decode( $excerpt, true );

		return is_array( $settings ) ? $settings : null;
	}

	/**
	 * Unserialize an array, never objects.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param string $value Serialized value.
	 *
	 * @return array|null
	 */
	private static function unserialize_array( string $value ) {
		// phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.serialize_unserialize, WordPress.PHP.NoSilencedErrors.Discouraged -- 1.x stored it serialized; a broken one answers false (recounted by the caller).
		$settings = @unserialize( $value, [ 'allowed_classes' => false ] );

		return is_array( $settings ) ? $settings : null;
	}

	/**
	 * Recount the byte length of every serialized string. A string ends at
	 * `";` followed by the next token (`s:`, `i:`, `a:`, `b:`, `d:`, `N;`) or
	 * the array's `}`.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param string $value Serialized value.
	 *
	 * @return string
	 */
	private static function recount_string_lengths( string $value ): string {
		$recounted = preg_replace_callback(
			'/s:\d+:"(.*?)";(?=[sidbaN][:;]|\})/s',
			static function ( $matches ) {
				return 's:' . strlen( $matches[1] ) . ':"' . $matches[1] . '";';
			},
			$value
		);

		return is_string( $recounted ) ? $recounted : $value;
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
}
