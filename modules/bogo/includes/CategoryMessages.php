<?php
/**
 * BOGO category messages (pro's category page messages).
 *
 * @package StorePulse\StoreGrowth\Modules\BoGo
 */

namespace StorePulse\StoreGrowth\Modules\BoGo;

use StorePulse\StoreGrowth\Modules\BoGo\Settings\BogoSettings;
use WP_Error;

defined( 'ABSPATH' ) || exit;

/**
 * The category messages stored in the BOGO settings option
 * (`bogo_category_messages`), for the REST routes (step 10e, R2).
 *
 * Rows keep the shape the ajax actions and pro 2.2.0 use:
 * `{ id: <term id>, message: string, categoryStatus: 'true' | 'false' }`.
 * Pro's storefront shows a message only when `categoryStatus` is the string
 * `'true'`. A category's message is its first row (the ajax action could
 * store a category twice): it's the one listed and changed; a delete
 * removes every row of the category. Writes keep the option's other keys
 * and rows as stored, and leave an option of the wrong shape alone.
 *
 * @since SPSG_VERSION
 */
class CategoryMessages {

	/**
	 * Key of the messages in the option.
	 *
	 * @since SPSG_VERSION
	 *
	 * @var string
	 */
	const KEY = 'bogo_category_messages';

	/**
	 * Messages, one per category (its first row).
	 *
	 * @since SPSG_VERSION
	 *
	 * @return array[] Rows as stored.
	 */
	public static function all(): array {
		$rows = self::rows();

		if ( is_wp_error( $rows ) ) {
			return [];
		}

		$messages = [];

		foreach ( $rows as $row ) {
			$id = is_array( $row ) ? absint( $row['id'] ?? 0 ) : 0;

			if ( $id && ! isset( $messages[ $id ] ) ) {
				$messages[ $id ] = $row;
			}
		}

		return array_values( $messages );
	}

	/**
	 * A category's message.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param int $id Category (term) id.
	 *
	 * @return array|null Row as stored.
	 */
	public static function find( int $id ): ?array {
		foreach ( self::all() as $row ) {
			if ( absint( $row['id'] ) === $id ) {
				return $row;
			}
		}

		return null;
	}

	/**
	 * Whether a message shows on the storefront (pro reads `'true'`).
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array $row Row as stored.
	 *
	 * @return bool
	 */
	public static function is_active( array $row ): bool {
		return 'true' === ( $row['categoryStatus'] ?? null );
	}

	/**
	 * Add a category's message.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param int    $id      Category (term) id.
	 * @param string $message Message.
	 * @param bool   $active  Shown on the storefront.
	 *
	 * @return array|WP_Error Row as stored.
	 */
	public static function create( int $id, string $message, bool $active ) {
		$rows = self::rows();

		if ( is_wp_error( $rows ) ) {
			return $rows;
		}

		$error = self::check_category( $id );
		if ( $error ) {
			return $error;
		}

		/**
		 * Maximum number of stored BOGO category messages (as the ajax
		 * action `bogo_category_msg_create`).
		 *
		 * @since 2.1.2
		 *
		 * @param int $max Maximum category messages.
		 */
		$max = (int) apply_filters( 'spsg_bogo_max_category_messages', 100 );

		if ( count( $rows ) >= $max ) {
			return new WP_Error(
				'bogo_category_messages_limit',
				sprintf(
					/* translators: %d: maximum number of category messages. */
					__( 'You can store at most %d category messages.', 'storegrowth-sales-booster' ),
					$max
				),
				[ 'status' => 400 ]
			);
		}

		$row = [
			'id'             => $id,
			'message'        => $message,
			'categoryStatus' => $active ? 'true' : 'false',
		];

		$rows[] = $row;
		self::save( $rows );

		return $row;
	}

	/**
	 * Change a category's message (its first row): its category, text or
	 * status, only the keys given.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param int   $id      Category (term) id.
	 * @param array $changes `category` (int), `message` (string), `status` (bool).
	 *
	 * @return array|WP_Error Row as stored.
	 */
	public static function update( int $id, array $changes ) {
		$rows = self::rows();

		if ( is_wp_error( $rows ) ) {
			return $rows;
		}

		$index = self::first_index( $rows, $id );

		if ( null === $index ) {
			return self::not_found();
		}

		if ( isset( $changes['category'] ) && (int) $changes['category'] !== $id ) {
			$error = self::check_category( (int) $changes['category'] );
			if ( $error ) {
				return $error;
			}

			$rows[ $index ]['id'] = (int) $changes['category'];
		}

		if ( isset( $changes['message'] ) ) {
			$rows[ $index ]['message'] = $changes['message'];
		}

		if ( isset( $changes['status'] ) ) {
			$rows[ $index ]['categoryStatus'] = $changes['status'] ? 'true' : 'false';
		}

		self::save( $rows );

		return $rows[ $index ];
	}

	/**
	 * Delete a category's message (every row of the category).
	 *
	 * @since SPSG_VERSION
	 *
	 * @param int $id Category (term) id.
	 *
	 * @return true|WP_Error
	 */
	public static function delete( int $id ) {
		$rows = self::rows();

		if ( is_wp_error( $rows ) ) {
			return $rows;
		}

		if ( null === self::first_index( $rows, $id ) ) {
			return self::not_found();
		}

		$rows = array_filter(
			$rows,
			static function ( $row ) use ( $id ) {
				return ! is_array( $row ) || absint( $row['id'] ?? 0 ) !== $id;
			}
		);

		self::save( array_values( $rows ) );

		return true;
	}

	/**
	 * Name of the option (the BOGO settings).
	 *
	 * @since SPSG_VERSION
	 *
	 * @return string
	 */
	private static function option(): string {
		return ( new BogoSettings() )->get_option_name();
	}

	/**
	 * Stored rows, as stored (non-array rows included).
	 *
	 * @since SPSG_VERSION
	 *
	 * @return array|WP_Error Rows, or an error when the option or the
	 *                        messages aren't arrays.
	 */
	private static function rows() {
		$settings = get_option( self::option(), [] );
		$rows     = is_array( $settings ) ? ( $settings[ self::KEY ] ?? [] ) : null;

		if ( ! is_array( $rows ) ) {
			return new WP_Error(
				'bogo_invalid_option',
				__( 'The stored BOGO settings are not in the expected format, so they were left unchanged.', 'storegrowth-sales-booster' ),
				[ 'status' => 409 ]
			);
		}

		return $rows;
	}

	/**
	 * Index of a category's first row.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array $rows Rows.
	 * @param int   $id   Category (term) id.
	 *
	 * @return int|string|null
	 */
	private static function first_index( array $rows, int $id ) {
		foreach ( $rows as $index => $row ) {
			if ( is_array( $row ) && absint( $row['id'] ?? 0 ) === $id ) {
				return $index;
			}
		}

		return null;
	}

	/**
	 * Store the rows, keeping the option's other keys (`rows()` checked the
	 * option is an array).
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array $rows Rows.
	 *
	 * @return void
	 */
	private static function save( array $rows ): void {
		$settings = get_option( self::option(), [] );

		$settings[ self::KEY ] = $rows;

		// The storefront reads the option: autoload stays WordPress's default.
		update_option( self::option(), $settings );
	}

	/**
	 * A category can take a new message: it exists and has none.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param int $id Category (term) id.
	 *
	 * @return WP_Error|null
	 */
	private static function check_category( int $id ): ?WP_Error {
		$term = $id > 0 ? get_term( $id, 'product_cat' ) : null;

		if ( ! $term || is_wp_error( $term ) ) {
			return new WP_Error(
				'bogo_invalid_category',
				__( 'Choose a product category.', 'storegrowth-sales-booster' ),
				[ 'status' => 400 ]
			);
		}

		if ( self::find( $id ) ) {
			return new WP_Error(
				'bogo_category_message_exists',
				__( 'This category already has a message.', 'storegrowth-sales-booster' ),
				[ 'status' => 400 ]
			);
		}

		return null;
	}

	/**
	 * No message for the category.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return WP_Error
	 */
	private static function not_found(): WP_Error {
		return new WP_Error(
			'bogo_category_message_not_found',
			__( 'This category has no message.', 'storegrowth-sales-booster' ),
			[ 'status' => 404 ]
		);
	}
}
