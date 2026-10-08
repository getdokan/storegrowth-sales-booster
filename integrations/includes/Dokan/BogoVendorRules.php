<?php
/**
 * What a Dokan vendor's BOGO offer may hold (bug 7).
 *
 * @package StorePulse\StoreGrowth\Integrations\Dokan
 */

namespace StorePulse\StoreGrowth\Integrations\Dokan;

use WP_Error;
use WP_REST_Request;

defined( 'ABSPATH' ) || exit;

/**
 * Server-side rules for offers a vendor saves through the BOGO REST routes
 * (`bogo/offers` and `bogo/offers/vendor`), docs/redesign/modules/bogo.md §2
 * bug 7:
 *
 * - every product of the offer (targets, offer product, alternates) is the
 *   vendor's own;
 * - no category targets: a category holds other vendors' products;
 * - a Buy X Get X (`same`) offer needs the admin's
 *   `vendors_can_create_buy_x_get_x` (`spsg_bogo_dokan_vendors_settings`,
 *   off until the admin turns it on, as the vendor dashboard reads it);
 * - turning an offer on checks its products again (an offer saved before
 *   these rules may hold another vendor's product). Turning it off and
 *   deleting it only need the vendor to own the offer
 *   (`Dashboard\Bogo::check_bogo_single_item_permission()`);
 * - a product-tab offer (wp-admin) is saved only when its products are the
 *   vendor's.
 *
 * Administrators (`manage_options`) are not restricted. Needs nothing from
 * Dokan but its vendor helpers, when they exist.
 *
 * @since SPSG_VERSION
 */
class BogoVendorRules {

	/**
	 * Option with the admin's vendor settings.
	 *
	 * @since SPSG_VERSION
	 *
	 * @var string
	 */
	const OPTION = 'spsg_bogo_dokan_vendors_settings';

	/**
	 * Register the filters.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return void
	 */
	public function register_hooks(): void {
		add_filter( 'spsg_bogo_offer_rules', [ $this, 'check_offer' ], 10, 3 );
		// After `Dashboard\Bogo`'s ownership check (priority 10).
		add_filter( 'spsg_bogo_single_item_permission', [ $this, 'check_status_change' ], 20, 3 );
		// The product's BOGO tab (wp-admin, for vendors allowed there).
		add_filter( 'spsg_should_save_product_bogo', [ $this, 'check_product_tab' ], 10, 3 );
	}

	/**
	 * `spsg_should_save_product_bogo`: a vendor's product-tab offer isn't
	 * saved unless its products are theirs. Not the Buy X Get X flag: the
	 * tab's default deal is Buy X Get X.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param bool  $should_save Whether to save it.
	 * @param int   $post_id     Product.
	 * @param array $data        Offer data being saved.
	 *
	 * @return bool
	 */
	public function check_product_tab( $should_save, $post_id, $data ) {
		if ( ! $should_save || current_user_can( 'manage_options' ) ) {
			return $should_save;
		}

		return ! is_wp_error( $this->check_products( (array) $data, self::vendor_id() ) );
	}

	/**
	 * `spsg_bogo_offer_rules`: a vendor's create or update.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param true|WP_Error $result Result so far.
	 * @param array         $data   Offer data, as it will be saved.
	 * @param array         $stored Stored offer in request shape (empty when new).
	 *
	 * @return true|WP_Error
	 */
	public function check_offer( $result, $data, $stored ) {
		if ( is_wp_error( $result ) || current_user_can( 'manage_options' ) ) {
			return $result;
		}

		$data   = (array) $data;
		$stored = (array) $stored;

		// Buy X Get X: a new one (or an offer turned into one) needs the
		// admin's flag; a vendor's existing one stays editable.
		if ( 'same' === ( $data['bogo_deal_type'] ?? '' ) && 'same' !== ( $stored['bogo_deal_type'] ?? '' ) && ! self::can_create_buy_x_get_x() ) {
			return new WP_Error(
				'spsg_bogo_vendor_buy_x_get_x',
				__( 'Buy X Get X offers are not enabled for vendors.', 'storegrowth-sales-booster' ),
				[ 'status' => 403 ]
			);
		}

		return $this->check_products( $data, self::vendor_id() );
	}

	/**
	 * `spsg_bogo_single_item_permission`: turning a vendor's offer on checks
	 * its products.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param bool|WP_Error   $permission Permission so far.
	 * @param array           $item       The offer (`BogoDataManager::get_bogo_offer()`).
	 * @param WP_REST_Request $request    REST request.
	 *
	 * @return bool|WP_Error
	 */
	public function check_status_change( $permission, $item, $request ) {
		// Only the status routes (`…/offers/{id}/status` and
		// `…/offers/vendor/{id}/status`) turning an offer on: the route ends
		// in `/status`, the item routes in the id.
		if (
			is_wp_error( $permission )
			|| current_user_can( 'manage_options' )
			|| ! $request instanceof WP_REST_Request
			|| '/status' !== substr( $request->get_route(), -7 )
			|| 'yes' !== $request->get_param( 'status' )
		) {
			return $permission;
		}

		$item   = (array) $item;
		$result = $this->check_products(
			[
				'offered_products'            => $item['offered_products'] ?? [],
				'offered_categories'          => $item['offered_categories'] ?? [],
				'bogo_deal_type'              => $item['bogo_deal_type'] ?? 'different',
				'get_different_product_field' => $item['offer_product_id'] ?? 0,
				'get_alternate_products'      => $item['alternate_products'] ?? [],
			],
			self::vendor_id()
		);

		return is_wp_error( $result ) ? $result : $permission;
	}

	/**
	 * Whether every product of an offer belongs to the vendor, and it has no
	 * category targets.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array $data      Offer data (request shape).
	 * @param int   $vendor_id Vendor.
	 *
	 * @return true|WP_Error
	 */
	public function check_products( array $data, int $vendor_id ) {
		if ( ! empty( self::ids( $data['offered_categories'] ?? [] ) ) ) {
			return new WP_Error(
				'spsg_bogo_vendor_categories',
				__( 'Vendors can target products only, not categories.', 'storegrowth-sales-booster' ),
				[ 'status' => 403 ]
			);
		}

		// The keys that are saved (`BogoDataManager::map_bogo_data()`). Not
		// `offer_product_id`: the old editor sends the offer's own id there.
		// The offer product is checked for Buy X Get X too: it isn't used
		// there, but it is stored.
		$products = array_merge(
			self::ids( $data['offered_products'] ?? [] ),
			self::ids( $data['get_different_product_field'] ?? [] ),
			self::ids( $data['get_alternate_products'] ?? [] )
		);

		foreach ( array_unique( $products ) as $product_id ) {
			if ( ! $vendor_id || self::product_vendor( $product_id ) !== $vendor_id ) {
				return new WP_Error(
					'spsg_bogo_vendor_product',
					__( 'You can only use your own products in an offer.', 'storegrowth-sales-booster' ),
					[ 'status' => 403 ]
				);
			}
		}

		return true;
	}

	/**
	 * Whether the admin lets vendors create Buy X Get X offers. Off until
	 * the admin turns it on (the vendor dashboard reads it the same way).
	 *
	 * @since SPSG_VERSION
	 *
	 * @return bool
	 */
	public static function can_create_buy_x_get_x(): bool {
		$settings = get_option( self::OPTION, [] );

		return is_array( $settings ) && rest_sanitize_boolean( $settings['vendors_can_create_buy_x_get_x'] ?? false );
	}

	/**
	 * The current vendor (a vendor staff member's vendor).
	 *
	 * @since SPSG_VERSION
	 *
	 * @return int
	 */
	public static function vendor_id(): int {
		if ( function_exists( 'dokan_get_current_user_id' ) ) {
			return (int) dokan_get_current_user_id();
		}

		return get_current_user_id();
	}

	/**
	 * The vendor a product (or a variation's product) belongs to; 0 when it
	 * doesn't exist.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param int $product_id Product or variation.
	 *
	 * @return int
	 */
	public static function product_vendor( int $product_id ): int {
		$product = wc_get_product( $product_id );

		if ( ! $product ) {
			return 0;
		}

		if ( function_exists( 'dokan_get_vendor_by_product' ) ) {
			return (int) dokan_get_vendor_by_product( $product, true );
		}

		$author = (int) get_post_field( 'post_author', $product->get_id() );

		// A variation without an author: its product's.
		if ( ! $author && $product->get_parent_id() ) {
			$author = (int) get_post_field( 'post_author', $product->get_parent_id() );
		}

		return $author;
	}

	/**
	 * Positive integer ids from a list, a comma-separated string or one id.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param mixed $value Ids.
	 *
	 * @return int[]
	 */
	private static function ids( $value ): array {
		if ( is_string( $value ) ) {
			$value = explode( ',', $value );
		}

		return array_values( array_filter( array_map( 'absint', is_array( $value ) ? $value : [ $value ] ) ) );
	}
}
