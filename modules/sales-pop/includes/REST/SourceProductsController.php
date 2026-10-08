<?php
/**
 * Sales Notification product sources.
 *
 * @package StorePulse\StoreGrowth\Modules\SalesPop
 */

namespace StorePulse\StoreGrowth\Modules\SalesPop\REST;

use StorePulse\StoreGrowth\Modules\SalesPop\EnqueueScript;
use WP_Post;
use WP_REST_Controller;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;

defined( 'ABSPATH' ) || exit;

/**
 * `GET sales-booster/v1/sales-pop/source-products?source=orders|best_sellers&limit=N`:
 * the products the "Recent Orders" and "Best Sellers" sources offer. The admin
 * writes them into `popup_products` on save, as the old admin did for recent
 * orders; the storefront only ever shows `popup_products`.
 *
 * @since SPSG_VERSION
 */
class SourceProductsController extends WP_REST_Controller {

	/**
	 * REST namespace.
	 *
	 * @since SPSG_VERSION
	 *
	 * @var string
	 */
	protected $namespace = 'sales-booster/v1';

	/**
	 * Route base.
	 *
	 * @since SPSG_VERSION
	 *
	 * @var string
	 */
	protected $rest_base = 'sales-pop/source-products';

	/**
	 * Register the route.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return void
	 */
	public function register_routes(): void {
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base,
			[
				[
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => [ $this, 'get_items' ],
					'permission_callback' => [ $this, 'get_items_permissions_check' ],
					'args'                => [
						'source' => [
							'type'     => 'string',
							'enum'     => [ 'orders', 'best_sellers' ],
							'required' => true,
						],
						'limit'  => [
							'type'    => 'integer',
							'default' => 5,
							'minimum' => 1,
							'maximum' => 100,
						],
					],
				],
			]
		);
	}

	/**
	 * Settings managers only.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param WP_REST_Request $request Request.
	 *
	 * @return bool
	 */
	public function get_items_permissions_check( $request ): bool {
		return current_user_can( 'manage_options' );
	}

	/**
	 * The source's products, first `limit`, as `{ id, name, image }`.
	 * External products are left out, as the product picker does, and so
	 * are products hidden from the catalog (e.g. subscription packs).
	 *
	 * @since SPSG_VERSION
	 *
	 * @param WP_REST_Request $request Request.
	 *
	 * @return WP_REST_Response
	 */
	public function get_items( $request ): WP_REST_Response {
		$limit = (int) $request['limit'];

		if ( 'orders' === $request['source'] ) {
			$posts = EnqueueScript::instance()->get_billing_product_list();
		} else {
			$posts = get_posts(
				[
					'post_type'      => 'product',
					'post_status'    => 'publish',
					'posts_per_page' => $limit * 2,
					'meta_key'       => 'total_sales', // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key -- Indexed WooCommerce sales count, bounded query.
					'orderby'        => 'meta_value_num',
					'order'          => 'DESC',
				]
			);
		}

		$items = [];

		foreach ( $posts as $post ) {
			$product = $post instanceof WP_Post ? wc_get_product( $post->ID ) : null;

			if ( ! $product || $product->is_type( 'external' ) || 'hidden' === $product->get_catalog_visibility() ) {
				continue;
			}

			$items[] = [
				'id'    => $product->get_id(),
				'name'  => wp_specialchars_decode( $product->get_name(), ENT_QUOTES ),
				'image' => (string) wp_get_attachment_image_url( $product->get_image_id(), 'thumbnail' ),
			];

			if ( count( $items ) >= $limit ) {
				break;
			}
		}

		return rest_ensure_response( $items );
	}
}
