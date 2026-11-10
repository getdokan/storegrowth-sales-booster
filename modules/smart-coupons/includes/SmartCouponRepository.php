<?php
/**
 * Reads and saves Smart Coupons.
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Modules\SmartCoupons;

use Exception;
use StorePulse\StoreGrowth\Modules\BoGo\BogoDataManager;
use StorePulse\StoreGrowth\Modules\SmartCoupons\Settings\SmartCouponFields;
use StorePulse\StoreGrowth\Campaigns\OfferTimeline;
use StorePulse\StoreGrowth\Offers\CampaignRepository;
use StorePulse\StoreGrowth\Offers\OfferLimits;
use StorePulse\StoreGrowth\Offers\OfferVersions;
use StorePulse\StoreGrowth\Pricing\SmartCoupon;
use StorePulse\StoreGrowth\Support\SiteTime;
use WC_Coupon;
use WC_Data_Exception;
use WC_Data_Store;
use WP_Error;
use WP_Query;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Every Smart Coupon is a real `shop_coupon` post, saved through WooCommerce's
 * CRUD: its native fields where they exist, the contract's meta for the gaps
 * (ADR-014). A coupon that is off is a draft, which WooCommerce can't find by
 * its code.
 *
 * @since SPSG_VERSION
 */
class SmartCouponRepository {

	/**
	 * Active everyday coupons on the Free plan.
	 *
	 * @since SPSG_VERSION
	 */
	const FREE_LIMIT = 1;

	/**
	 * WooCommerce's discount type for each coupon type.
	 *
	 * @since SPSG_VERSION
	 */
	const WC_TYPES = [
		SmartCoupon::TYPE_PERCENTAGE  => 'percent',
		SmartCoupon::TYPE_FIXED       => 'fixed_cart',
		SmartCoupon::TYPE_TIERS       => 'percent',
		SmartCoupon::TYPE_BUY_X_GET_Y => 'percent',
	];

	/**
	 * The Smart Coupon with an id.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param int $id Post id.
	 *
	 * @return WC_Coupon|null
	 */
	public static function find( int $id ): ?WC_Coupon {
		if ( ! $id || 'shop_coupon' !== get_post_type( $id ) ) {
			return null;
		}

		$coupon = new WC_Coupon( $id );

		return SmartCoupon::is_smart( $coupon ) ? $coupon : null;
	}

	/**
	 * A page of Smart Coupons, newest first.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param int    $page     Page.
	 * @param int    $per_page Coupons per page.
	 * @param string $search   Text the code or title contains.
	 *
	 * @return array{coupons: WC_Coupon[], total: int}
	 */
	public static function page( int $page, int $per_page, string $search = '' ): array {
		$query = new WP_Query(
			[
				'post_type'      => 'shop_coupon',
				'post_status'    => [ 'publish', 'draft' ],
				'posts_per_page' => $per_page,
				'paged'          => $page,
				's'              => $search,
				'orderby'        => 'ID',
				'order'          => 'DESC',
				'fields'         => 'ids',
				// phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key, WordPress.DB.SlowDBQuery.slow_db_query_meta_value -- Admin screen, one page at a time.
				'meta_key'       => SmartCoupon::MANAGED,
				'meta_value'     => 'yes', // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_value -- As above.
			]
		);

		return [
			'coupons' => array_map(
				static function ( $id ): WC_Coupon {
					return new WC_Coupon( (int) $id );
				},
				$query->posts
			),
			'total'   => (int) $query->found_posts,
		];
	}

	/**
	 * The active everyday coupons, oldest first, for the Free limit.
	 * `OfferLimits` calls this: it must not ask whether a coupon is paused.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return array[] Rows of `id` and `name`.
	 */
	public static function active_everyday(): array {
		$ids = get_posts(
			[
				'post_type'   => 'shop_coupon',
				'post_status' => 'publish',
				'numberposts' => -1,
				'fields'      => 'ids',
				'orderby'     => 'ID',
				'order'       => 'ASC',
				// phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key, WordPress.DB.SlowDBQuery.slow_db_query_meta_value -- Coupons have no other index; read once per request.
				'meta_key'    => SmartCoupon::MANAGED,
				'meta_value'  => 'yes', // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_value -- As above.
			]
		);

		$active = [];

		foreach ( $ids as $id ) {
			$coupon = new WC_Coupon( $id );

			if ( $coupon->get_meta( SmartCoupon::CAMPAIGN_OFFER ) || ( SmartCoupon::needs_pro( $coupon ) && ! sp_store_growth()->has_pro() ) ) {
				continue;
			}

			$dates = self::dates( $coupon );

			if ( ( '' !== $dates['start'] || '' !== $dates['end'] ) && SiteTime::is_within( $dates['start'], $dates['end'] ) ) {
				$active[] = [
					'id'   => $coupon->get_id(),
					'name' => SmartCoupon::name( $coupon ),
				];
			}
		}

		return $active;
	}

	/**
	 * Whether another coupon may be created. The Free limit stops a new one;
	 * turning one back on isn't stopped, the newest over the limit pauses.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return bool
	 */
	public static function can_create(): bool {
		return sp_store_growth()->has_pro() || count( self::active_everyday() ) < self::FREE_LIMIT;
	}

	/**
	 * A coupon's start and end as stored, `Y-m-d H:i:s` in the site timezone.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param WC_Coupon $coupon Coupon.
	 *
	 * @return array{start: string, end: string}
	 */
	private static function dates( WC_Coupon $coupon ): array {
		$expires = $coupon->get_date_expires( 'edit' );

		return [
			'start' => (string) $coupon->get_meta( SmartCoupon::STARTS_AT ),
			'end'   => $expires ? wp_date( 'Y-m-d H:i:s', $expires->getTimestamp() ) : '',
		];
	}

	/**
	 * Save a coupon: what is sent over what is stored (or the defaults).
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array          $sent     Values, as the editor's keys.
	 * @param WC_Coupon|null $existing Coupon to change; null for a new one.
	 *
	 * @return WC_Coupon|WP_Error
	 */
	public static function save( array $sent, ?WC_Coupon $existing = null ) {
		$values = self::sanitize( array_merge( $existing ? self::values( $existing ) : self::defaults(), $sent ) );
		$check  = self::check_rules( $values, $existing );

		if ( is_wp_error( $check ) ) {
			return $check;
		}

		$old_rule = $existing ? (int) $existing->get_meta( SmartCoupon::BOGO_RULE ) : 0;
		$coupon   = $existing ?? new WC_Coupon();

		try {
			self::write( $coupon, $values, $existing );
			$coupon->save();
		} catch ( WC_Data_Exception $e ) {
			return new WP_Error( 'smart_coupon_invalid', $e->getMessage(), [ 'status' => 400 ] );
		}

		self::sync_bogo_flag( $coupon, $old_rule );
		OfferLimits::flush();

		return $coupon;
	}

	/**
	 * Validate a campaign's version of a coupon and return what it changes.
	 * Only the amount and the tiers can differ: the saved coupon, with its
	 * code and limits, stays one coupon (ADR-013).
	 *
	 * @since SPSG_VERSION
	 *
	 * @param WC_Coupon $coupon    Everyday coupon.
	 * @param array     $overrides The version's current changes.
	 * @param array     $sent      What the editor sent.
	 *
	 * @return array|WP_Error `amount` and `tiers`, the ones that differ.
	 */
	public static function campaign_values( WC_Coupon $coupon, array $overrides, array $sent ) {
		$values = self::sanitize( array_merge( self::values( $coupon ), $overrides, $sent ) );
		$check  = self::check_rules( $values, $coupon );

		if ( is_wp_error( $check ) ) {
			return $check;
		}

		$changes = [];

		if ( abs( $values['amount'] - (float) $coupon->get_amount( 'edit' ) ) > 0.000001 ) {
			$changes['amount'] = $values['amount'];
		}

		if ( self::parse_tiers( array_filter( (array) $coupon->get_meta( SmartCoupon::TIERS ), 'is_array' ) ) !== $values['tiers'] ) {
			$changes['tiers'] = $values['tiers'];
		}

		return $changes;
	}

	/**
	 * A coupon as the editor reads it, with a campaign's changes.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param WC_Coupon $coupon    Coupon.
	 * @param array     $overrides The version's changes.
	 *
	 * @return array
	 */
	public static function campaign_record( WC_Coupon $coupon, array $overrides ): array {
		$record = array_merge( self::to_response( $coupon ), array_intersect_key( $overrides, [ 'amount' => true ] ) );

		unset( $record['timeline'] );

		if ( isset( $overrides['tiers'] ) ) {
			$record['tiers'] = array_map(
				static function ( array $tier ): string {
					return $tier['qty'] . ':' . $tier['percent'];
				},
				$overrides['tiers']
			);
		}

		return $record;
	}

	/**
	 * Turn a coupon on or off.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param WC_Coupon $coupon Coupon.
	 * @param bool      $active Whether it is on.
	 *
	 * @return void
	 */
	public static function set_active( WC_Coupon $coupon, bool $active ): void {
		$coupon->set_status( $active ? 'publish' : 'draft' );
		$coupon->save();

		OfferLimits::flush();
	}

	/**
	 * Delete a coupon and release its BOGO rule.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param WC_Coupon $coupon Coupon.
	 *
	 * @return bool
	 */
	public static function delete( WC_Coupon $coupon ): bool {
		$rule    = (int) $coupon->get_meta( SmartCoupon::BOGO_RULE );
		$deleted = (bool) $coupon->delete( true );

		if ( $deleted && $rule ) {
			self::release_bogo_rule( $rule, 0 );
		}

		OfferLimits::flush();

		return $deleted;
	}

	/**
	 * The editor's default values.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return array
	 */
	private static function defaults(): array {
		return array_merge( wp_list_pluck( ( new SmartCouponFields() )->get_fields(), 'default' ), [ 'status' => 'active' ] );
	}

	/**
	 * Clean every value the editor sends.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array $values Values.
	 *
	 * @return array
	 */
	private static function sanitize( array $values ): array {
		return [
			'status'           => 'inactive' === ( $values['status'] ?? '' ) ? 'inactive' : 'active',
			'method'           => in_array( $values['method'] ?? '', [ SmartCoupon::AUTOMATIC, SmartCoupon::CODE, SmartCoupon::LINK ], true ) ? $values['method'] : SmartCoupon::AUTOMATIC,
			'code'             => sanitize_text_field( (string) ( $values['code'] ?? '' ) ),
			'title'            => sanitize_text_field( (string) ( $values['title'] ?? '' ) ),
			'discount_type'    => isset( self::WC_TYPES[ $values['discount_type'] ?? '' ] ) ? $values['discount_type'] : SmartCoupon::TYPE_PERCENTAGE,
			'amount'           => (float) ( $values['amount'] ?? 0 ),
			'tiers'            => self::parse_tiers( (array) ( $values['tiers'] ?? [] ) ),
			'bogo_rule'        => absint( $values['bogo_rule'] ?? 0 ),
			'apply_to'         => in_array( $values['apply_to'] ?? '', [ 'store', 'products', 'categories' ], true ) ? $values['apply_to'] : 'store',
			'product_ids'      => array_values( array_filter( array_map( 'absint', (array) ( $values['product_ids'] ?? [] ) ) ) ),
			'category_ids'     => array_values( array_filter( array_map( 'absint', (array) ( $values['category_ids'] ?? [] ) ) ) ),
			'minimum_type'     => in_array( $values['minimum_type'] ?? '', [ 'none', 'subtotal', 'quantity' ], true ) ? $values['minimum_type'] : 'none',
			'minimum_amount'   => (float) ( $values['minimum_amount'] ?? 0 ),
			'minimum_quantity' => absint( $values['minimum_quantity'] ?? 0 ),
			'eligibility'      => in_array( $values['eligibility'] ?? '', [ 'all', 'first_time', 'returning', 'roles' ], true ) ? $values['eligibility'] : 'all',
			'roles'            => array_values( array_map( 'sanitize_key', (array) ( $values['roles'] ?? [] ) ) ),
			'one_per_customer' => rest_sanitize_boolean( $values['one_per_customer'] ?? false ),
			'skip_sale'        => rest_sanitize_boolean( $values['skip_sale'] ?? false ),
			'combines'         => rest_sanitize_boolean( $values['combines'] ?? false ),
			'allow_others'     => rest_sanitize_boolean( $values['allow_others'] ?? false ),
			'date_start'       => self::parse_date( $values['date_start'] ?? '' ),
			'date_end'         => self::parse_date( $values['date_end'] ?? '' ),
		];
	}

	/**
	 * A sent date (`Y-m-d H:i`, a `T` between them from the browser) as the
	 * stored `Y-m-d H:i:s` in the site timezone. Empty when it can't be read.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param mixed $value Sent value.
	 *
	 * @return string
	 */
	private static function parse_date( $value ): string {
		$value = is_string( $value ) ? str_replace( 'T', ' ', trim( $value ) ) : '';
		$date  = '' !== $value ? SiteTime::parse( $value ) : null;

		return $date ? $date->format( 'Y-m-d H:i:s' ) : '';
	}

	/**
	 * Quantity tiers sent as `qty:percent` strings (or rows), sorted, one per
	 * quantity.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array $tiers Sent tiers.
	 *
	 * @return array[] Rows of `qty` and `percent`.
	 */
	private static function parse_tiers( array $tiers ): array {
		$rows = [];

		foreach ( $tiers as $tier ) {
			$parts   = is_array( $tier ) ? [ $tier['qty'] ?? 0, $tier['percent'] ?? 0 ] : array_pad( explode( ':', (string) $tier ), 2, 0 );
			$qty     = absint( $parts[0] );
			$percent = min( 100.0, (float) $parts[1] );

			if ( $qty && $percent > 0 ) {
				$rows[ $qty ] = [
					'qty'     => $qty,
					'percent' => $percent,
				];
			}
		}

		ksort( $rows );

		return array_values( $rows );
	}

	/**
	 * What every saved coupon must be. Pro's options are refused only when
	 * newly chosen, so an existing Pro coupon can be renamed after the
	 * licence ends.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array          $values   Clean values.
	 * @param WC_Coupon|null $existing Coupon being changed.
	 *
	 * @return true|WP_Error
	 */
	private static function check_rules( array $values, ?WC_Coupon $existing ) {
		if ( '' === $values['title'] ) {
			return self::rule_error( 'smart_coupon_missing_title', __( 'Give the coupon a title.', 'storegrowth-sales-booster' ) );
		}

		$takes_code = SmartCoupon::AUTOMATIC !== $values['method'];

		if ( $takes_code && '' === $values['code'] ) {
			return self::rule_error( 'smart_coupon_missing_code', __( 'Enter a discount code.', 'storegrowth-sales-booster' ) );
		}

		if ( $takes_code && self::is_code_taken( $values['code'], $existing ? $existing->get_id() : 0 ) ) {
			return self::rule_error( 'smart_coupon_code_taken', __( 'Another coupon already uses this code.', 'storegrowth-sales-booster' ) );
		}

		$amount_error = self::check_amount( $values );

		if ( is_wp_error( $amount_error ) ) {
			return $amount_error;
		}

		if ( SmartCoupon::TYPE_BUY_X_GET_Y === $values['discount_type'] && ! BogoDataManager::get_bogo_offer( $values['bogo_rule'] ) ) {
			return self::rule_error( 'smart_coupon_missing_rule', __( 'Choose a BOGO rule for the Buy X get Y deal.', 'storegrowth-sales-booster' ) );
		}

		if ( 'products' === $values['apply_to'] && empty( $values['product_ids'] ) ) {
			return self::rule_error( 'smart_coupon_missing_products', __( 'Choose at least one product.', 'storegrowth-sales-booster' ) );
		}

		if ( 'categories' === $values['apply_to'] && empty( $values['category_ids'] ) ) {
			return self::rule_error( 'smart_coupon_missing_categories', __( 'Choose at least one category.', 'storegrowth-sales-booster' ) );
		}

		if ( 'subtotal' === $values['minimum_type'] && $values['minimum_amount'] <= 0 ) {
			return self::rule_error( 'smart_coupon_invalid_minimum_amount', __( 'Enter a minimum subtotal greater than 0.', 'storegrowth-sales-booster' ) );
		}

		if ( 'quantity' === $values['minimum_type'] && $values['minimum_quantity'] < 1 ) {
			return self::rule_error( 'smart_coupon_invalid_minimum_quantity', __( 'Enter a minimum quantity of at least 1.', 'storegrowth-sales-booster' ) );
		}

		if ( '' !== $values['date_start'] && '' !== $values['date_end'] && $values['date_end'] <= $values['date_start'] ) {
			return self::rule_error( 'smart_coupon_invalid_dates', __( 'The end must be after the start.', 'storegrowth-sales-booster' ) );
		}

		if ( self::values_need_pro( $values ) && ! sp_store_growth()->has_pro() && ! ( $existing && SmartCoupon::needs_pro( $existing ) ) ) {
			return new WP_Error( 'smart_coupon_needs_pro', __( 'This option needs StoreGrowth Pro.', 'storegrowth-sales-booster' ), [ 'status' => 403 ] );
		}

		return true;
	}

	/**
	 * Check the amount a coupon's type needs.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array $values Clean values.
	 *
	 * @return true|WP_Error
	 */
	private static function check_amount( array $values ) {
		$amount = $values['amount'];

		if ( SmartCoupon::TYPE_PERCENTAGE === $values['discount_type'] && ( $amount <= 0 || $amount > 100 ) ) {
			return self::rule_error( 'smart_coupon_invalid_amount', __( 'Enter a discount of more than 0 and at most 100%.', 'storegrowth-sales-booster' ) );
		}

		if ( SmartCoupon::TYPE_FIXED === $values['discount_type'] && $amount <= 0 ) {
			return self::rule_error( 'smart_coupon_invalid_amount', __( 'Enter an amount greater than 0.', 'storegrowth-sales-booster' ) );
		}

		if ( SmartCoupon::TYPE_TIERS === $values['discount_type'] && empty( $values['tiers'] ) ) {
			return self::rule_error( 'smart_coupon_missing_tiers', __( 'Add at least one quantity tier.', 'storegrowth-sales-booster' ) );
		}

		return true;
	}

	/**
	 * A 400 error about a value.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param string $code    Error code, mapped to its field by the editor.
	 * @param string $message Message.
	 *
	 * @return WP_Error
	 */
	private static function rule_error( string $code, string $message ): WP_Error {
		return new WP_Error( $code, $message, [ 'status' => 400 ] );
	}

	/**
	 * Whether a code is used by another coupon, a draft included: WooCommerce
	 * only checks published ones, and a draft is published when switched on.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param string $code       Code.
	 * @param int    $exclude_id Coupon to leave out.
	 *
	 * @return bool
	 */
	private static function is_code_taken( string $code, int $exclude_id ): bool {
		global $wpdb;

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery -- No WooCommerce lookup covers drafts; a save-time check.
		return (bool) $wpdb->get_var( $wpdb->prepare( "SELECT ID FROM {$wpdb->posts} WHERE post_type = 'shop_coupon' AND post_status IN ('publish', 'draft') AND LOWER(post_title) = LOWER(%s) AND ID <> %d LIMIT 1", wc_format_coupon_code( $code ), $exclude_id ) );
	}

	/**
	 * Whether sent values use something only Pro can do.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array $values Clean values.
	 *
	 * @return bool
	 */
	private static function values_need_pro( array $values ): bool {
		return SmartCoupon::LINK === $values['method'] || SmartCoupon::TYPE_TIERS === $values['discount_type'] || 'all' !== $values['eligibility'];
	}

	/**
	 * Copy clean values onto a coupon: WooCommerce's fields, then the
	 * contract's meta. Never Individual use; the referee decides.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param WC_Coupon      $coupon   Coupon.
	 * @param array          $values   Clean values.
	 * @param WC_Coupon|null $existing The coupon before this save.
	 *
	 * @return void
	 *
	 * @throws WC_Data_Exception A value WooCommerce rejects.
	 */
	private static function write( WC_Coupon $coupon, array $values, ?WC_Coupon $existing ): void {
		$type = $values['discount_type'];

		$coupon->set_code( self::code_for( $values, $existing ) );
		$coupon->set_description( $values['title'] );
		$coupon->set_status( 'active' === $values['status'] ? 'publish' : 'draft' );
		$coupon->set_discount_type( self::WC_TYPES[ $type ] );
		$coupon->set_amount( (string) self::stored_amount( $values ) );
		$coupon->set_individual_use( false );
		$coupon->set_product_ids( 'products' === $values['apply_to'] ? $values['product_ids'] : [] );
		$coupon->set_product_categories( 'categories' === $values['apply_to'] ? $values['category_ids'] : [] );
		$coupon->set_minimum_amount( 'subtotal' === $values['minimum_type'] ? (string) $values['minimum_amount'] : '' );
		$coupon->set_exclude_sale_items( $values['skip_sale'] );
		$coupon->set_usage_limit_per_user( $values['one_per_customer'] ? 1 : 0 );
		$coupon->set_date_expires( '' !== $values['date_end'] ? SiteTime::parse( $values['date_end'] )->getTimestamp() : null );

		$meta = [
			SmartCoupon::MANAGED      => 'yes',
			SmartCoupon::METHOD       => $values['method'],
			SmartCoupon::TITLE        => $values['title'],
			SmartCoupon::COMBINES     => $values['combines'] ? 'yes' : 'no',
			SmartCoupon::ALLOW_OTHERS => $values['allow_others'] ? 'yes' : 'no',
			SmartCoupon::TYPE         => $type,
			SmartCoupon::STARTS_AT    => $values['date_start'],
			SmartCoupon::MIN_QUANTITY => 'quantity' === $values['minimum_type'] ? $values['minimum_quantity'] : 0,
			SmartCoupon::ELIGIBILITY  => $values['eligibility'],
			SmartCoupon::ROLES        => 'roles' === $values['eligibility'] ? $values['roles'] : [],
			SmartCoupon::TIERS        => SmartCoupon::TYPE_TIERS === $type ? $values['tiers'] : [],
			SmartCoupon::BOGO_RULE    => SmartCoupon::TYPE_BUY_X_GET_Y === $type ? $values['bogo_rule'] : 0,
		];

		foreach ( $meta as $key => $value ) {
			$coupon->update_meta_data( $key, $value );
		}

		// Written whether Dokan is active or not, so an activation later needs
		// no re-save: without the first, Dokan refuses an admin coupon on a
		// vendor's product; without the second, the vendor funds it. A choice
		// made in Dokan's coupon panel stays.
		$coupon->update_meta_data( 'admin_coupons_enabled_for_vendor', $coupon->get_meta( 'admin_coupons_enabled_for_vendor' ) ? $coupon->get_meta( 'admin_coupons_enabled_for_vendor' ) : 'yes' );
		$coupon->update_meta_data( 'coupon_commissions_type', $coupon->get_meta( 'coupon_commissions_type' ) ? $coupon->get_meta( 'coupon_commissions_type' ) : 'from_admin' );
	}

	/**
	 * The code to save: the one the merchant set, or for an automatic coupon
	 * (which shoppers never type) a generated one that stays with the coupon.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array          $values   Clean values.
	 * @param WC_Coupon|null $existing The coupon before this save.
	 *
	 * @return string
	 */
	private static function code_for( array $values, ?WC_Coupon $existing ): string {
		if ( SmartCoupon::AUTOMATIC !== $values['method'] ) {
			return $values['code'];
		}

		if ( $existing && $values['method'] === $existing->get_meta( SmartCoupon::METHOD ) ) {
			return $existing->get_code();
		}

		return strtolower( 'sg-' . $values['method'] . '-' . wp_generate_password( 12, false ) );
	}

	/**
	 * What a coupon's saved amount is: a tiers coupon keeps its first percent
	 * and a Buy X get Y coupon has none (its BOGO rule is the deal).
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array $values Clean values.
	 *
	 * @return float
	 */
	private static function stored_amount( array $values ): float {
		if ( SmartCoupon::TYPE_BUY_X_GET_Y === $values['discount_type'] ) {
			return 0.0;
		}

		return SmartCoupon::TYPE_TIERS === $values['discount_type'] ? (float) $values['tiers'][0]['percent'] : $values['amount'];
	}

	/**
	 * Keep BOGO's "only with coupon" flag in step: on for a code or link
	 * coupon's rule, off for a rule no coupon holds any more.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param WC_Coupon $coupon   Saved coupon.
	 * @param int       $old_rule Rule it held before this save.
	 *
	 * @return void
	 */
	private static function sync_bogo_flag( WC_Coupon $coupon, int $old_rule ): void {
		$rule = (int) $coupon->get_meta( SmartCoupon::BOGO_RULE );

		if ( $old_rule && $old_rule !== $rule ) {
			self::release_bogo_rule( $old_rule, $coupon->get_id() );
		}

		if ( $rule ) {
			BogoDataManager::set_only_with_coupon( $rule, ! SmartCoupon::is_automatic( $coupon ) );
		}
	}

	/**
	 * Clear a rule's flag unless another coupon still holds it.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param int $rule       Rule id.
	 * @param int $exclude_id Coupon to leave out.
	 *
	 * @return void
	 */
	private static function release_bogo_rule( int $rule, int $exclude_id ): void {
		$others = get_posts(
			[
				'post_type'    => 'shop_coupon',
				'post_status'  => [ 'publish', 'draft' ],
				'numberposts'  => 1,
				'fields'       => 'ids',
				'post__not_in' => $exclude_id ? [ $exclude_id ] : [], // phpcs:ignore WordPressVIPMinimum.Performance.WPQueryParams.PostNotIn_post__not_in -- One coupon, on save.
				// phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key, WordPress.DB.SlowDBQuery.slow_db_query_meta_value -- On save only.
				'meta_key'     => SmartCoupon::BOGO_RULE,
				'meta_value'   => $rule, // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_value -- As above.
			]
		);

		if ( empty( $others ) ) {
			BogoDataManager::set_only_with_coupon( $rule, false );
		}
	}

	/**
	 * A coupon as the editor's keys read it.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param WC_Coupon $coupon Coupon.
	 *
	 * @return array
	 */
	public static function values( WC_Coupon $coupon ): array {
		$dates        = self::dates( $coupon );
		$product_ids  = $coupon->get_product_ids( 'edit' );
		$category_ids = $coupon->get_product_categories( 'edit' );
		$min_quantity = (int) $coupon->get_meta( SmartCoupon::MIN_QUANTITY );
		$min_amount   = (float) $coupon->get_minimum_amount( 'edit' );
		$apply_to     = $product_ids ? 'products' : ( $category_ids ? 'categories' : 'store' );
		$minimum      = $min_quantity ? 'quantity' : ( $min_amount > 0 ? 'subtotal' : 'none' );
		$tiers        = array_map(
			static function ( array $tier ): string {
				return $tier['qty'] . ':' . $tier['percent'];
			},
			array_filter( (array) $coupon->get_meta( SmartCoupon::TIERS ), 'is_array' )
		);

		return [
			'status'           => 'publish' === $coupon->get_status( 'edit' ) ? 'active' : 'inactive',
			'method'           => (string) $coupon->get_meta( SmartCoupon::METHOD ),
			'code'             => $coupon->get_code( 'edit' ),
			'title'            => (string) $coupon->get_meta( SmartCoupon::TITLE ),
			'discount_type'    => (string) $coupon->get_meta( SmartCoupon::TYPE ),
			'amount'           => (float) $coupon->get_amount( 'edit' ),
			'tiers'            => $tiers,
			'bogo_rule'        => (int) $coupon->get_meta( SmartCoupon::BOGO_RULE ),
			'apply_to'         => $apply_to,
			'product_ids'      => array_map( 'intval', $product_ids ),
			'category_ids'     => array_map( 'intval', $category_ids ),
			'minimum_type'     => $minimum,
			'minimum_amount'   => $min_amount,
			'minimum_quantity' => $min_quantity,
			'eligibility'      => $coupon->get_meta( SmartCoupon::ELIGIBILITY ) ? (string) $coupon->get_meta( SmartCoupon::ELIGIBILITY ) : 'all',
			'roles'            => array_values( (array) $coupon->get_meta( SmartCoupon::ROLES ) ),
			'one_per_customer' => (int) $coupon->get_usage_limit_per_user( 'edit' ) > 0,
			'skip_sale'        => (bool) $coupon->get_exclude_sale_items( 'edit' ),
			'combines'         => SmartCoupon::combines( $coupon ),
			'allow_others'     => SmartCoupon::allows_others( $coupon ),
			'date_start'       => '' !== $dates['start'] ? str_replace( ' ', 'T', substr( $dates['start'], 0, 16 ) ) : '',
			'date_end'         => '' !== $dates['end'] ? str_replace( ' ', 'T', substr( $dates['end'], 0, 16 ) ) : '',
		];
	}

	/**
	 * A coupon as the routes return it: its values and what the list shows.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param WC_Coupon $coupon Coupon.
	 *
	 * @return array
	 */
	public static function to_response( WC_Coupon $coupon ): array {
		$campaigns = CampaignRepository::campaigns_of_offer( OfferVersions::SMART_COUPON, $coupon->get_id() );
		$campaign  = self::campaign_of( $coupon, $campaigns );

		return array_merge(
			self::values( $coupon ),
			[
				'id'            => $coupon->get_id(),
				'name'          => SmartCoupon::name( $coupon ),
				'chip'          => self::chip( $coupon ),
				'timeline'      => OfferTimeline::for_offer( OfferVersions::SMART_COUPON, $coupon->get_id(), 'publish' === $coupon->get_status( 'edit' ), SmartCoupon::name( $coupon ) ),
				'used_in'       => self::used_in( $coupon, $campaigns ),
				'uses'          => (int) $coupon->get_usage_count( 'edit' ),
				'campaign'      => $campaign,
				'campaign_only' => (bool) $coupon->get_meta( SmartCoupon::CAMPAIGN_OFFER ),
				'link'          => SmartCoupon::LINK === $coupon->get_meta( SmartCoupon::METHOD ) ? LinkCoupons::url( $coupon ) : '',
			]
		);
	}

	/**
	 * The campaign that sets a coupon's dates, for the editor's locked panel.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param WC_Coupon $coupon    Coupon.
	 * @param array[]   $campaigns Campaigns the coupon is attached to.
	 *
	 * @return array|null `id`, `name`, `starts_at`, `ends_at`.
	 */
	private static function campaign_of( WC_Coupon $coupon, array $campaigns ): ?array {
		$row_id = (int) $coupon->get_meta( SmartCoupon::CAMPAIGN_OFFER );

		if ( $row_id ) {
			$row      = CampaignRepository::find_offer_row( $row_id );
			$campaign = $row ? CampaignRepository::get( (int) $row['promotion_id'] ) : null;

			return $campaign ? array_intersect_key( $campaign, array_flip( [ 'id', 'name', 'starts_at', 'ends_at' ] ) ) : null;
		}

		return $campaigns ? array_intersect_key( $campaigns[0], array_flip( [ 'id', 'name', 'starts_at', 'ends_at' ] ) ) : null;
	}

	/**
	 * Where a coupon is used, as the list says it.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param WC_Coupon $coupon    Coupon.
	 * @param array[]   $campaigns Campaigns the coupon is attached to.
	 *
	 * @return string
	 */
	private static function used_in( WC_Coupon $coupon, array $campaigns ): string {
		$campaign = self::campaign_of( $coupon, $campaigns );

		if ( $coupon->get_meta( SmartCoupon::CAMPAIGN_OFFER ) ) {
			/* translators: %s: campaign name. */
			return sprintf( __( 'Campaign-only: %s', 'storegrowth-sales-booster' ), $campaign['name'] ?? '' );
		}

		if ( ! $campaign ) {
			return __( 'Everyday', 'storegrowth-sales-booster' );
		}

		/* translators: %s: campaign name. */
		return sprintf( __( 'Everyday + %s', 'storegrowth-sales-booster' ), $campaign['name'] );
	}

	/**
	 * Why a coupon that is switched on isn't running now, if it isn't.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param WC_Coupon $coupon Coupon.
	 *
	 * @return string Empty when it is running.
	 */
	private static function chip( WC_Coupon $coupon ): string {
		if ( 'publish' !== $coupon->get_status( 'edit' ) ) {
			return '';
		}

		if ( SmartCoupon::needs_pro( $coupon ) && ! sp_store_growth()->has_pro() ) {
			return __( 'Paused: needs Pro', 'storegrowth-sales-booster' );
		}

		$effective = SmartCoupon::effective( $coupon );

		if ( '' !== $effective['chip'] || $effective['live'] ) {
			return $effective['chip'];
		}

		$dates = self::dates( $coupon );

		if ( '' === $dates['start'] && '' === $dates['end'] ) {
			return OfferVersions::CAMPAIGN === $effective['version'] ? __( 'Offline', 'storegrowth-sales-booster' ) : __( 'Set dates to activate', 'storegrowth-sales-booster' );
		}

		return SiteTime::is_within( $dates['start'], '' ) ? __( 'Expired', 'storegrowth-sales-booster' ) : __( 'Scheduled', 'storegrowth-sales-booster' );
	}

	/**
	 * Total discount given, by coupon id, from WooCommerce Analytics' coupons
	 * report (ADR-012), so Dokan's query filters and its order statuses apply.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param int[] $ids Coupon ids.
	 *
	 * @return array<int, float>
	 */
	public static function discount_given( array $ids ): array {
		if ( empty( $ids ) ) {
			return [];
		}

		try {
			$report = WC_Data_Store::load( 'report-coupons' )->get_data(
				[
					'coupons'  => $ids,
					'per_page' => count( $ids ),
					'after'    => '2000-01-01T00:00:00',
					'before'   => gmdate( 'Y-m-d\T23:59:59' ),
				]
			);
		} catch ( Exception $e ) {
			return [];
		}

		$totals = [];

		foreach ( (array) ( $report->data ?? [] ) as $row ) {
			$row = (array) $row;

			$totals[ (int) $row['coupon_id'] ] = (float) $row['amount'];
		}

		return $totals;
	}
}
