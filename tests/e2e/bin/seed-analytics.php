<?php
/**
 * Demo data for the Analytics report (ADR-012): orders with offer lines over
 * the last 90 days, imported into WooCommerce Analytics, plus daily view counts.
 *
 * Run against a dev site from the plugin folder:
 *
 *     wp eval-file tests/e2e/bin/seed-analytics.php          # seed
 *     wp eval-file tests/e2e/bin/seed-analytics.php clean    # remove all of it
 *
 * What it creates, all tagged so `clean` removes exactly that:
 *   - 4 private products (`[Seed] …`), owned by the first Dokan vendor when
 *     Dokan is active, so the orders count as vendor orders;
 *   - 2 order bumps and 2 BOGO offers (`[Seed] …`), inactive, so the
 *     storefront doesn't change but the report names them;
 *   - 0–4 orders a day (created via `spsg-seed`) with an order bump, a BOGO
 *     gift and its trigger, or a Countdown Timer line; a few partly refunded;
 *   - bump views / accepts / removes and BOGO offer views per day in
 *     `spsg_analytics_daily`.
 *
 * Needs the StoreGrowth database update run and WooCommerce Analytics on.
 * Seeds once: run `clean` before seeding again. Deterministic (fixed seed).
 *
 * @package StorePulse\StoreGrowth
 */

use Automattic\WooCommerce\Admin\API\Reports\Cache as ReportsCache;
use Automattic\WooCommerce\Internal\Admin\Schedulers\OrdersScheduler;
use StorePulse\StoreGrowth\Analytics\AnalyticsController;
use StorePulse\StoreGrowth\Analytics\Counter;
use StorePulse\StoreGrowth\Analytics\Schema;
use StorePulse\StoreGrowth\Attribution\OfferAttribution;
use StorePulse\StoreGrowth\Modules\BoGo\BogoDataManager;
use StorePulse\StoreGrowth\Modules\BoGo\BoGoModule;
use StorePulse\StoreGrowth\Modules\UpsellOrderBump\Database\OrderBumpData;
use StorePulse\StoreGrowth\Modules\UpsellOrderBump\UpsellOrderBumpModule;

defined( 'ABSPATH' ) || exit;

// phpcs:ignoreFile -- CLI dev script (wp eval-file), prints plain text.

wp_set_current_user( 1 );

const SPSG_SEED_OPTION = 'spsg_analytics_seed';
const SPSG_SEED_VIA    = 'spsg-seed';
const SPSG_SEED_DAYS   = 90;
const SPSG_SEED_PREFIX = '[Seed] ';

/**
 * Print a line.
 *
 * @param string $line Text.
 */
function spsg_seed_say( string $line ): void {
	echo $line . "\n";
}

/**
 * Whether a table exists.
 *
 * @param string $table Table name without the prefix.
 *
 * @return bool
 */
function spsg_seed_has_table( string $table ): bool {
	global $wpdb;

	return (bool) $wpdb->get_var( $wpdb->prepare( 'SHOW TABLES LIKE %s', $wpdb->prefix . $table ) );
}

/**
 * Remove everything a previous seed made.
 */
function spsg_seed_clean(): void {
	global $wpdb;

	$seed = get_option( SPSG_SEED_OPTION );
	if ( ! is_array( $seed ) ) {
		spsg_seed_say( 'Nothing seeded.' );
		return;
	}

	$orders = wc_get_orders(
		[
			'created_via' => SPSG_SEED_VIA,
			'limit'       => -1,
			'status'      => array_keys( wc_get_order_statuses() ),
		]
	);

	$order_ids = [];
	foreach ( $orders as $order ) {
		foreach ( $order->get_refunds() as $refund ) {
			$order_ids[] = $refund->get_id();
			$refund->delete( true );
		}
		$order_ids[] = $order->get_id();
		$order->delete( true );
	}

	// Rows deleting an order can leave behind: notes, refund lines, Dokan's
	// and WooCommerce Analytics' rows.
	if ( $order_ids ) {
		$in = implode( ',', array_map( 'intval', $order_ids ) );
		$wpdb->query( "DELETE cm FROM {$wpdb->commentmeta} cm JOIN {$wpdb->comments} c ON c.comment_ID = cm.comment_id WHERE c.comment_post_ID IN ( {$in} )" );
		$wpdb->query( "DELETE FROM {$wpdb->comments} WHERE comment_post_ID IN ( {$in} )" );
		$wpdb->query( "DELETE im FROM {$wpdb->prefix}woocommerce_order_itemmeta im JOIN {$wpdb->prefix}woocommerce_order_items i ON i.order_item_id = im.order_item_id WHERE i.order_id IN ( {$in} )" );
		$wpdb->query( "DELETE FROM {$wpdb->prefix}woocommerce_order_items WHERE order_id IN ( {$in} )" );
		foreach ( [ 'dokan_orders', 'dokan_order_stats', 'wc_order_stats', 'wc_order_product_lookup', Schema::OFFER_LOOKUP ] as $table ) {
			if ( spsg_seed_has_table( $table ) ) {
				$wpdb->query( "DELETE FROM {$wpdb->prefix}{$table} WHERE order_id IN ( {$in} )" );
			}
		}
		if ( spsg_seed_has_table( 'dokan_vendor_balance' ) ) {
			$wpdb->query( "DELETE FROM {$wpdb->prefix}dokan_vendor_balance WHERE trn_id IN ( {$in} )" );
		}
	}

	$bumps = array_map( 'intval', $seed['bumps'] ?? [] );
	if ( $bumps ) {
		$in = implode( ',', $bumps );
		$wpdb->query( $wpdb->prepare( "DELETE FROM {$wpdb->prefix}" . Schema::DAILY . " WHERE module = %s AND object_id IN ( {$in} )", UpsellOrderBumpModule::get_id() ) );
		foreach ( $bumps as $bump_id ) {
			( new OrderBumpData() )->delete( $bump_id );
		}
	}

	$bogos = array_map( 'intval', $seed['bogos'] ?? [] );
	if ( $bogos ) {
		$in = implode( ',', $bogos );
		$wpdb->query( $wpdb->prepare( "DELETE FROM {$wpdb->prefix}" . Schema::DAILY . " WHERE module = %s AND object_id IN ( {$in} )", BoGoModule::get_id() ) );
		foreach ( $bogos as $bogo_id ) {
			BogoDataManager::delete_bogo_offer( $bogo_id );
		}
	}

	foreach ( $seed['products'] ?? [] as $product_id ) {
		wp_delete_post( (int) $product_id, true );
	}

	delete_option( SPSG_SEED_OPTION );
	ReportsCache::invalidate();

	spsg_seed_say(
		sprintf(
			'Removed %d orders (with their refunds), %d bumps, %d BOGO offers, %d products and their view counts.',
			count( $orders ),
			count( $bumps ),
			count( $seed['bogos'] ?? [] ),
			count( $seed['products'] ?? [] )
		)
	);
}

/**
 * A private seed product.
 *
 * @param string $name      Name.
 * @param float  $price     Regular price.
 * @param int    $vendor_id Owner, 0 for the current user.
 *
 * @return WC_Product_Simple
 */
function spsg_seed_product( string $name, float $price, int $vendor_id ): WC_Product_Simple {
	$product = new WC_Product_Simple();
	$product->set_name( SPSG_SEED_PREFIX . $name );
	$product->set_status( 'private' );
	$product->set_regular_price( (string) $price );
	$product->save();

	if ( $vendor_id ) {
		wp_update_post(
			[
				'ID'          => $product->get_id(),
				'post_author' => $vendor_id,
			]
		);
	}

	return $product;
}

/**
 * Add a line to an order.
 *
 * @param WC_Order   $order   Order.
 * @param WC_Product $product Product.
 * @param int        $qty     Quantity.
 * @param float      $unit    Price charged per unit.
 * @param array      $meta    Line meta.
 */
function spsg_seed_line( WC_Order $order, WC_Product $product, int $qty, float $unit, array $meta = [] ): void {
	$item = new WC_Order_Item_Product();
	$item->set_product( $product );
	$item->set_quantity( $qty );
	$item->set_subtotal( $unit * $qty );
	$item->set_total( $unit * $qty );
	foreach ( $meta as $key => $value ) {
		$item->add_meta_data( $key, $value, true );
	}
	$order->add_item( $item );
}

/**
 * Lines of one order: a target with its bump (maybe taken), a BOGO trigger
 * and its gift, a Countdown Timer sale, or no offer.
 *
 * @param WC_Order $order    Order.
 * @param array    $bump     Bump: id, target, product, pct, rate.
 * @param array    $bogo     BOGO offer: id, trigger, qty, gift.
 * @param array    $products Products by name.
 *
 * @return string The offer the order took: `bump`, `bogo`, or ''.
 */
function spsg_seed_lines( WC_Order $order, array $bump, array $bogo, array $products ): string {
	$roll = mt_rand( 1, 100 );

	if ( $roll <= 40 ) {
		spsg_seed_line( $order, $bump['target'], 1, (float) $bump['target']->get_regular_price() );

		if ( mt_rand( 1, 100 ) > $bump['rate'] ) {
			return '';
		}

		$price = (float) $bump['product']->get_regular_price();
		spsg_seed_line(
			$order,
			$bump['product'],
			mt_rand( 1, 2 ),
			round( $price * ( 100 - $bump['pct'] ) / 100, 2 ),
			[
				OfferAttribution::CAMPAIGN_ID     => "order_bump:{$bump['id']}",
				OfferAttribution::REFERENCE_PRICE => (string) $price,
			]
		);

		return 'bump';
	}

	if ( $roll <= 70 ) {
		spsg_seed_line(
			$order,
			$bogo['trigger'],
			$bogo['qty'],
			(float) $bogo['trigger']->get_regular_price(),
			[ OfferAttribution::TRIGGER_CAMPAIGN_ID => "bogo:{$bogo['id']}" ]
		);
		spsg_seed_line(
			$order,
			$bogo['gift'],
			1,
			0.0,
			[
				OfferAttribution::CAMPAIGN_ID     => "bogo:{$bogo['id']}",
				OfferAttribution::REFERENCE_PRICE => $bogo['gift']->get_regular_price(),
			]
		);

		return 'bogo';
	}

	if ( $roll <= 90 ) {
		$pct   = [ 10, 15, 20 ][ mt_rand( 0, 2 ) ];
		$price = (float) $products['hoodie']->get_regular_price();
		spsg_seed_line(
			$order,
			$products['hoodie'],
			1,
			round( $price * ( 100 - $pct ) / 100, 2 ),
			[ OfferAttribution::COUNTDOWN_PCT => (string) $pct ]
		);
	} else {
		spsg_seed_line( $order, $products['tee'], mt_rand( 1, 3 ), (float) $products['tee']->get_regular_price() );
	}

	return '';
}

/**
 * Refund one unit of an order's last paid line.
 *
 * @param WC_Order $order Order.
 *
 * @return bool Whether a refund was made.
 */
function spsg_seed_refund( WC_Order $order ): bool {
	$items = $order->get_items();
	$item  = end( $items );
	if ( ! $item || $item->get_total() <= 0 ) {
		return false;
	}

	$amount = $item->get_total() / $item->get_quantity();
	$refund = wc_create_refund(
		[
			'order_id'      => $order->get_id(),
			'amount'        => $amount,
			'reason'        => 'Seed refund',
			'line_items'    => [
				$item->get_id() => [
					'qty'          => 1,
					'refund_total' => $amount,
				],
			],
			'restock_items' => false,
		]
	);

	return ! is_wp_error( $refund );
}

/**
 * Add to a campaign's count on a day (`Counter::bump()` only writes today).
 *
 * @param string $day         `Y-m-d`.
 * @param string $module      Module id.
 * @param string $metric      Metric.
 * @param int    $campaign_id Bump or BOGO offer id.
 * @param int    $count       Count.
 */
function spsg_seed_count( string $day, string $module, string $metric, int $campaign_id, int $count ): void {
	global $wpdb;

	if ( $count < 1 ) {
		return;
	}

	$wpdb->query(
		$wpdb->prepare(
			"INSERT INTO {$wpdb->prefix}" . Schema::DAILY . ' ( day, module, metric, object_type, object_id, count ) VALUES ( %s, %s, %s, %s, %d, %d )
			ON DUPLICATE KEY UPDATE count = count + VALUES( count )',
			$day,
			$module,
			$metric,
			Counter::CAMPAIGN,
			$campaign_id,
			$count
		)
	);
}

/**
 * Seed products, campaigns, orders and counts.
 */
function spsg_seed(): void {
	if ( false !== get_option( SPSG_SEED_OPTION ) ) {
		spsg_seed_say( 'Already seeded. Run `wp eval-file tests/e2e/bin/seed-analytics.php clean` first.' );
		return;
	}
	if ( ! Schema::is_installed() ) {
		spsg_seed_say( 'Run the StoreGrowth database update first (the admin notice).' );
		return;
	}
	if ( ! AnalyticsController::analytics_enabled() ) {
		spsg_seed_say( 'Turn on WooCommerce Analytics first (WooCommerce > Settings > Advanced > Features).' );
		return;
	}

	// Seed orders stay on the site: no order emails, and no requests out
	// (plugins that sync each order to a service, tracking pixels).
	add_filter( 'pre_wp_mail', '__return_false' );
	add_filter(
		'pre_http_request',
		function () {
			return new WP_Error( 'spsg_seed', 'Blocked while seeding.' );
		}
	);

	mt_srand( 20261008 );

	$vendors   = function_exists( 'dokan' ) ? get_users( [ 'role' => 'seller', 'number' => 1, 'fields' => 'ID' ] ) : [];
	$vendor_id = (int) ( $vendors[0] ?? 0 );

	$products = [
		'hoodie' => spsg_seed_product( 'Hoodie', 45.0, $vendor_id ),
		'tee'    => spsg_seed_product( 'T-shirt', 20.0, $vendor_id ),
		'socks'  => spsg_seed_product( 'Socks', 8.0, $vendor_id ),
		'cap'    => spsg_seed_product( 'Cap', 18.0, $vendor_id ),
	];

	// Saved as soon as each id exists, so `clean` works if seeding stops half way.
	$seed = [
		'products' => array_map(
			function ( $product ) {
				return $product->get_id();
			},
			array_values( $products )
		),
		'bumps'    => [],
		'bogos'    => [],
	];
	update_option( SPSG_SEED_OPTION, $seed, false );

	// `rate`: percent of target orders that take the bump.
	$bumps = [
		[
			'name'    => 'Socks with every hoodie',
			'target'  => $products['hoodie'],
			'product' => $products['socks'],
			'pct'     => 25,
			'rate'    => 55,
		],
		[
			'name'    => 'Cap add-on',
			'target'  => $products['tee'],
			'product' => $products['cap'],
			'pct'     => 10,
			'rate'    => 30,
		],
	];
	foreach ( $bumps as $index => $bump ) {
		$bumps[ $index ]['id'] = (int) ( new OrderBumpData() )->create(
			[
				'name'             => SPSG_SEED_PREFIX . $bump['name'],
				'status'           => 'inactive',
				'offer_type'       => 'discount',
				'offer_amount'     => $bump['pct'],
				'offer_product_id' => $bump['product']->get_id(),
				'target_products'  => [ $bump['target']->get_id() ],
			]
		);
		$seed['bumps'][] = $bumps[ $index ]['id'];
		update_option( SPSG_SEED_OPTION, $seed, false );
	}

	$bogos = [
		[
			'name'    => 'Buy a hoodie, get socks free',
			'trigger' => $products['hoodie'],
			'qty'     => 1,
			'gift'    => $products['socks'],
		],
		[
			'name'    => 'Two tees, free cap',
			'trigger' => $products['tee'],
			'qty'     => 2,
			'gift'    => $products['cap'],
		],
	];
	foreach ( $bogos as $index => $bogo ) {
		$bogos[ $index ]['id'] = (int) BogoDataManager::create_global_offer(
			[
				'name_of_order_bogo'          => SPSG_SEED_PREFIX . $bogo['name'],
				'status'                      => 'inactive',
				'offered_products'            => [ $bogo['trigger']->get_id() ],
				'get_different_product_field' => $bogo['gift']->get_id(),
			]
		);
		$seed['bogos'][] = $bogos[ $index ]['id'];
		update_option( SPSG_SEED_OPTION, $seed, false );
	}

	$statuses  = [ 'completed', 'completed', 'completed', 'processing' ];
	$now       = current_datetime();
	$order_ids = [];
	$refunds   = 0;

	for ( $days_ago = SPSG_SEED_DAYS - 1; $days_ago >= 0; $days_ago-- ) {
		$day     = $now->setTime( 0, 0 )->modify( "-{$days_ago} days" );
		$accepts = array_fill_keys( $seed['bumps'], 0 );
		$gifts   = array_fill_keys( $seed['bogos'], 0 );
		// Busier lately, so the chart has a shape.
		$orders = mt_rand( 0, $days_ago >= 30 ? 2 : 4 );

		for ( $i = 0; $i < $orders; $i++ ) {
			$bump  = $bumps[ $i % 2 ];
			$bogo  = $bogos[ mt_rand( 0, 1 ) ];
			$order = new WC_Order();
			$order->set_created_via( SPSG_SEED_VIA );
			$order->set_billing_first_name( 'Seed' );
			$order->set_billing_email( 'seed@example.com' );

			$taken = spsg_seed_lines( $order, $bump, $bogo, $products );
			if ( 'bump' === $taken ) {
				++$accepts[ $bump['id'] ];
			} elseif ( 'bogo' === $taken ) {
				++$gifts[ $bogo['id'] ];
			}

			$created = $day->setTime( mt_rand( 8, 22 ), mt_rand( 0, 59 ) );
			if ( $created > $now ) {
				$created = $now->modify( '-' . mt_rand( 1, 60 ) . ' minutes' );
			}

			$order->set_date_created( $created->getTimestamp() );
			$order->calculate_totals( false );
			$order->set_status( $statuses[ mt_rand( 0, 3 ) ] );
			if ( 'completed' === $order->get_status() ) {
				$order->set_date_paid( $created->getTimestamp() );
				$order->set_date_completed( $created->getTimestamp() );
			}
			$order->save();
			$order_ids[] = $order->get_id();

			// Now and then a customer sends one item back.
			if ( 1 === mt_rand( 1, 25 ) && spsg_seed_refund( $order ) ) {
				++$refunds;
			}
		}

		// Views are per visit: a few for each order that took the offer.
		$date = $day->format( 'Y-m-d' );
		$bump_module = UpsellOrderBumpModule::get_id();
		foreach ( $accepts as $bump_id => $taken ) {
			spsg_seed_count( $date, $bump_module, 'view', $bump_id, mt_rand( 0, 2 ) + $taken * 3 );
			spsg_seed_count( $date, $bump_module, 'accept', $bump_id, $taken + mt_rand( 0, 1 ) );
			spsg_seed_count( $date, $bump_module, 'remove', $bump_id, mt_rand( 0, 1 ) );
		}
		foreach ( $gifts as $bogo_id => $taken ) {
			spsg_seed_count( $date, BoGoModule::get_id(), 'view', $bogo_id, mt_rand( 1, 4 ) + $taken * 4 );
		}
	}

	// Into WooCommerce Analytics now (the import also fills spsg_offer_lookup).
	foreach ( $order_ids as $order_id ) {
		OrdersScheduler::import( $order_id );
		foreach ( wc_get_order( $order_id )->get_refunds() as $refund ) {
			OrdersScheduler::import( $refund->get_id() );
		}
	}

	ReportsCache::invalidate();

	spsg_seed_say(
		sprintf(
			'Seeded %d orders over %d days (%d partly refunded), 2 bumps, 2 BOGO offers, 4 products%s. Open StoreGrowth > Analytics.',
			count( $order_ids ),
			SPSG_SEED_DAYS,
			$refunds,
			$vendor_id ? " (vendor {$vendor_id})" : ''
		)
	);
}

if ( 'clean' === ( $args[0] ?? '' ) ) {
	spsg_seed_clean();
} else {
	spsg_seed();
}
