<?php
/**
 * How Smart Coupons appear in WooCommerce's own screens and the cart.
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Modules\SmartCoupons;

use StorePulse\StoreGrowth\Admin\AdminMenu;
use StorePulse\StoreGrowth\Interfaces\HookRegistry;
use StorePulse\StoreGrowth\Pricing\SmartCoupon;
use WC_Coupon;
use WP_Post;
use WP_Query;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Code and link coupons are labelled in WooCommerce > Coupons and edited only
 * in Smart Coupons; automatic ones are hidden there. In the cart, an automatic
 * coupon reads by its title and can't be removed.
 *
 * @since SPSG_VERSION
 */
class CouponScreens implements HookRegistry {

	/**
	 * Register hooks.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return void
	 */
	public function register_hooks(): void {
		add_filter( 'display_post_states', [ $this, 'add_managed_label' ], 10, 2 );
		add_filter( 'get_edit_post_link', [ $this, 'link_to_smart_coupons' ], 10, 2 );
		add_filter( 'post_row_actions', [ $this, 'remove_quick_edit' ], 10, 2 );
		add_action( 'load-post.php', [ $this, 'redirect_edit_screen' ] );
		add_action( 'pre_get_posts', [ $this, 'hide_automatic_coupons' ] );

		add_filter( 'woocommerce_cart_totals_coupon_label', [ $this, 'label_automatic_coupon' ], 10, 2 );
		add_filter( 'woocommerce_cart_totals_coupon_html', [ $this, 'hide_remove_link' ], 10, 3 );
		add_filter( 'woocommerce_coupon_discount_amount_html', [ $this, 'describe_buy_x_get_y' ], 10, 2 );
	}

	/**
	 * The Smart Coupon behind a post, if it is one.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param int $post_id Post id.
	 *
	 * @return WC_Coupon|null
	 */
	private function smart_coupon( int $post_id ): ?WC_Coupon {
		return SmartCouponRepository::find( $post_id );
	}

	/**
	 * Mark a Smart Coupon in WooCommerce > Coupons.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array   $states Post states.
	 * @param WP_Post $post   Post.
	 *
	 * @return array
	 */
	public function add_managed_label( $states, $post ) {
		if ( $post instanceof WP_Post && 'shop_coupon' === $post->post_type && $this->smart_coupon( $post->ID ) ) {
			$states['spsg_managed'] = __( 'Managed by Smart Coupons', 'storegrowth-sales-booster' );
		}

		return $states;
	}

	/**
	 * Send a Smart Coupon's Edit link to Smart Coupons.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param string $link    Edit link.
	 * @param int    $post_id Post id.
	 *
	 * @return string
	 */
	public function link_to_smart_coupons( $link, $post_id ) {
		return $this->smart_coupon( (int) $post_id ) ? self::editor_url( (int) $post_id ) : $link;
	}

	/**
	 * Keep Quick Edit away from a Smart Coupon: it is edited in one place.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array   $actions Row actions.
	 * @param WP_Post $post    Post.
	 *
	 * @return array
	 */
	public function remove_quick_edit( $actions, $post ) {
		if ( 'shop_coupon' === $post->post_type && $this->smart_coupon( $post->ID ) ) {
			unset( $actions['inline hide-if-no-js'] );
		}

		return $actions;
	}

	/**
	 * Open Smart Coupons from a coupon's WooCommerce edit screen.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return void
	 */
	public function redirect_edit_screen(): void {
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Only redirects; nothing is changed.
		$post_id = isset( $_GET['post'] ) ? absint( wp_unslash( $_GET['post'] ) ) : 0;

		if ( $post_id && 'shop_coupon' === get_post_type( $post_id ) && $this->smart_coupon( $post_id ) && wp_safe_redirect( self::editor_url( $post_id ) ) ) {
			exit;
		}
	}

	/**
	 * Hide automatic coupons from WooCommerce > Coupons.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param WP_Query $query Query.
	 *
	 * @return void
	 */
	public function hide_automatic_coupons( $query ): void {
		if ( ! is_admin() || ! $query->is_main_query() || 'shop_coupon' !== $query->get( 'post_type' ) ) {
			return;
		}

		$not_automatic = [
			'relation' => 'OR',
			[
				'key'     => SmartCoupon::METHOD,
				'compare' => 'NOT EXISTS',
			],
			[
				'key'     => SmartCoupon::METHOD,
				'value'   => SmartCoupon::AUTOMATIC,
				'compare' => '!=',
			],
		];

		// phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query -- The admin's coupon list only.
		$query->set( 'meta_query', array_merge( (array) $query->get( 'meta_query' ), [ $not_automatic ] ) );
	}

	/**
	 * Name an automatic coupon by its title in cart totals.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param string    $label  Label.
	 * @param WC_Coupon $coupon Coupon.
	 *
	 * @return string
	 */
	public function label_automatic_coupon( $label, $coupon ) {
		return SmartCoupon::is_automatic( $coupon ) ? SmartCoupon::name( $coupon ) : $label;
	}

	/**
	 * Leave out `[Remove]` for an automatic coupon: the referee would apply it again.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param string    $html            Totals row HTML.
	 * @param WC_Coupon $coupon          Coupon.
	 * @param string    $discount_html   The discount amount's HTML.
	 *
	 * @return string
	 */
	public function hide_remove_link( $html, $coupon, $discount_html ) {
		return SmartCoupon::is_automatic( $coupon ) ? $discount_html : $html;
	}

	/**
	 * Say what a Buy X get Y coupon gives, instead of "-$0.00".
	 *
	 * @since SPSG_VERSION
	 *
	 * @param string    $html   Discount amount HTML.
	 * @param WC_Coupon $coupon Coupon.
	 *
	 * @return string
	 */
	public function describe_buy_x_get_y( $html, $coupon ) {
		return SmartCoupon::is_buy_x_get_y( $coupon ) ? __( 'Free item added', 'storegrowth-sales-booster' ) : $html;
	}

	/**
	 * A coupon's Smart Coupons editor.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param int $id Coupon id.
	 *
	 * @return string
	 */
	private static function editor_url( int $id ): string {
		return admin_url( 'admin.php?page=' . AdminMenu::PAGE . '#/smart-coupons/' . $id );
	}
}
