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
 *     `spsg_analytics_daily`;
 *   - 3 Smart Coupons (`seed-…` codes: a code, a link and an automatic one)
 *     applied as real coupon lines to about a third of the orders, so the
 *     coupon list shows uses, discount given and revenue (the automatic one
 *     is switched off at the end, so the storefront doesn't change);
 *   - with StoreGrowth Pro: 4 campaigns (two ended, one running, one
 *     scheduled) with the seeded offers attached; orders inside a campaign's
 *     dates are credited to it (`_spsg_promotion_id`, a source and a
 *     surface), and qualified carts are counted for its acceptance.
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
use StorePulse\StoreGrowth\Modules\SmartCoupons\SmartCouponRepository;
use StorePulse\StoreGrowth\Modules\UpsellOrderBump\Database\OrderBumpData;
use StorePulse\StoreGrowth\Modules\UpsellOrderBump\UpsellOrderBumpModule;
use StorePulse\StoreGrowth\Offers\OfferVersions;
use StorePulse\StoreGrowth\Pricing\SmartCoupon;
use StorePulse\StoreGrowthPro\Campaigns\CampaignRepository;
use StorePulse\StoreGrowthPro\Campaigns\CampaignSurfaces;

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
		foreach ( [ 'dokan_orders', 'dokan_order_stats', 'wc_order_stats', 'wc_order_product_lookup', 'wc_order_coupon_lookup', Schema::OFFER_LOOKUP ] as $table ) {
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

	// Campaigns before the offers they list.
	$campaigns = array_map( 'intval', $seed['campaigns'] ?? [] );
	if ( $campaigns ) {
		$in = implode( ',', $campaigns );
		$wpdb->query( "DELETE FROM {$wpdb->prefix}" . Schema::DAILY . " WHERE module = 'campaigns' AND object_type = 'promotion' AND object_id IN ( {$in} )" );
		if ( class_exists( CampaignRepository::class ) ) {
			foreach ( $campaigns as $campaign_id ) {
				CampaignRepository::delete( $campaign_id );
			}
		}
	}

	foreach ( $seed['coupons'] ?? [] as $coupon_id ) {
		$coupon = new WC_Coupon( (int) $coupon_id );
		if ( $coupon->get_id() ) {
			SmartCouponRepository::delete( $coupon );
		}
	}

	foreach ( $seed['products'] ?? [] as $product_id ) {
		wp_delete_post( (int) $product_id, true );
	}

	delete_option( SPSG_SEED_OPTION );
	ReportsCache::invalidate();

	spsg_seed_say(
		sprintf(
			'Removed %d orders (with their refunds), %d bumps, %d BOGO offers, %d Smart Coupons, %d campaigns, %d products and their counts.',
			count( $orders ),
			count( $bumps ),
			count( $seed['bogos'] ?? [] ),
			count( $seed['coupons'] ?? [] ),
			count( $campaigns ),
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
 * Apply a Smart Coupon to an order as WooCommerce stores it: the paid lines
 * lose the discount and a coupon line carries the code and the total.
 *
 * @param WC_Order $order  Order.
 * @param array    $coupon Coupon: code, type (`percentage` or `fixed`), amount.
 *
 * @return bool Whether it took anything off.
 */
function spsg_seed_coupon( WC_Order $order, array $coupon ): bool {
	$left     = (float) $coupon['amount'];
	$discount = 0.0;

	foreach ( $order->get_items() as $item ) {
		$total = (float) $item->get_total();
		if ( $total <= 0 ) {
			continue;
		}

		$off = SmartCoupon::TYPE_FIXED === $coupon['type'] ? min( $left, $total ) : round( $total * $coupon['amount'] / 100, 2 );
		if ( $off <= 0 ) {
			continue;
		}

		$left     -= $off;
		$discount += $off;
		$item->set_total( $total - $off );
	}

	if ( $discount <= 0 ) {
		return false;
	}

	$line = new WC_Order_Item_Coupon();
	$line->set_code( $coupon['code'] );
	$line->set_discount( $discount );
	$line->set_discount_tax( 0 );
	$order->add_item( $line );

	return true;
}

/**
 * Pro's campaigns, by days ago (negative: ahead), with the seeded offers
 * attached. Ids are saved into the seed as they're made.
 *
 * @param array $seed    Seed record (by reference).
 * @param array $bumps   Seeded bumps.
 * @param array $bogos   Seeded BOGO offers.
 * @param array $coupons Seeded coupons by key.
 *
 * @return array Campaigns: id, from (days ago), to (days ago).
 */
function spsg_seed_campaigns( array &$seed, array $bumps, array $bogos, array $coupons ): array {
	if ( ! class_exists( CampaignRepository::class ) || ! CampaignRepository::is_installed() ) {
		return [];
	}

	$now   = current_datetime();
	$plans = [
		[
			'name'   => 'Back to school',
			'from'   => 75,
			'to'     => 62,
			'offers' => [ [ OfferVersions::ORDER_BUMP, $bumps[1]['id'] ] ],
		],
		[
			'name'   => 'Black Friday',
			'from'   => 40,
			'to'     => 27,
			'offers' => [
				[ OfferVersions::BOGO, $bogos[0]['id'] ],
				[ OfferVersions::SMART_COUPON, $coupons['automatic']['id'] ],
			],
		],
		[
			'name'   => 'Winter sale',
			'from'   => 9,
			'to'     => -12,
			'offers' => [
				[ OfferVersions::BOGO, $bogos[1]['id'] ],
				[ OfferVersions::SMART_COUPON, $coupons['code']['id'] ],
			],
		],
		[
			'name'   => 'New year',
			'from'   => -40,
			'to'     => -50,
			'offers' => [ [ OfferVersions::ORDER_BUMP, $bumps[0]['id'] ] ],
		],
	];

	$campaigns = [];
	foreach ( $plans as $plan ) {
		$id = CampaignRepository::save(
			[
				'name'      => SPSG_SEED_PREFIX . $plan['name'],
				'status'    => CampaignRepository::STATUS_SCHEDULED,
				'starts_at' => $now->modify( ( 0 - $plan['from'] ) . ' days' )->format( 'Y-m-d' ) . ' 00:00',
				'ends_at'   => $now->modify( ( 0 - $plan['to'] ) . ' days' )->format( 'Y-m-d' ) . ' 23:59',
				'settings'  => [
					// Below the seeded orders' value, so campaigns show a lift.
					'baseline' => [
						'revenue_per_day' => 45.0,
						'aov'             => 31.0,
					],
				],
			]
		);
		if ( is_wp_error( $id ) ) {
			spsg_seed_say( "Campaign {$plan['name']}: " . $id->get_error_message() );
			continue;
		}

		$seed['campaigns'][] = $id;
		update_option( SPSG_SEED_OPTION, $seed, false );

		foreach ( $plan['offers'] as [ $kind, $offer_id ] ) {
			$row = CampaignRepository::attach( $id, $kind, (int) $offer_id );
			if ( is_wp_error( $row ) ) {
				spsg_seed_say( "Campaign {$plan['name']}: " . $row->get_error_message() );
			}
		}

		$campaigns[] = [
			'id'   => $id,
			'from' => $plan['from'],
			'to'   => $plan['to'],
		];
	}

	return $campaigns;
}

/**
 * The campaign running on a day, if any.
 *
 * @param array $campaigns Campaigns: id, from, to (days ago).
 * @param int   $days_ago  Day.
 *
 * @return int Campaign id, 0 for none.
 */
function spsg_seed_campaign_on( array $campaigns, int $days_ago ): int {
	foreach ( $campaigns as $campaign ) {
		if ( $days_ago <= $campaign['from'] && $days_ago >= $campaign['to'] ) {
			return $campaign['id'];
		}
	}

	return 0;
}

/**
 * Add to a campaign's count on a day (`Counter::bump()` only writes today).
 *
 * @param string $day         `Y-m-d`.
 * @param string $module      Module id.
 * @param string $metric      Metric.
 * @param int    $campaign_id Bump or BOGO offer id (a campaign's id for `promotion`).
 * @param int    $count       Count.
 * @param string $object_type What the id is.
 */
function spsg_seed_count( string $day, string $module, string $metric, int $campaign_id, int $count, string $object_type = Counter::CAMPAIGN ): void {
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
			$object_type,
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
		'bumps'     => [],
		'bogos'     => [],
		'coupons'   => [],
		'campaigns' => [],
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

	// Active while orders are made: WooCommerce counts a use only for a
	// coupon it can find. `share`: percent of coupon orders using it.
	$coupons = [
		'code'      => [
			'title'  => 'Save 10% sitewide',
			'method' => SmartCoupon::CODE,
			'code'   => 'seed-save10',
			'type'   => SmartCoupon::TYPE_PERCENTAGE,
			'amount' => 10,
			'share'  => 50,
		],
		'link'      => [
			'title'  => 'Newsletter $5 off',
			'method' => SmartCoupon::LINK,
			'code'   => 'seed-welcome5',
			'type'   => SmartCoupon::TYPE_FIXED,
			'amount' => 5,
			'share'  => 25,
		],
		'automatic' => [
			'title'  => 'Hoodie week 15% off',
			'method' => SmartCoupon::AUTOMATIC,
			'code'   => '',
			'type'   => SmartCoupon::TYPE_PERCENTAGE,
			'amount' => 15,
			'share'  => 25,
		],
	];
	foreach ( $coupons as $key => $coupon ) {
		$saved = SmartCouponRepository::save(
			[
				'status'        => 'active',
				'title'         => SPSG_SEED_PREFIX . $coupon['title'],
				'method'        => $coupon['method'],
				'code'          => $coupon['code'],
				'discount_type' => $coupon['type'],
				'amount'        => $coupon['amount'],
			]
		);
		if ( is_wp_error( $saved ) ) {
			spsg_seed_say( "Smart Coupon {$coupon['title']}: " . $saved->get_error_message() );
			unset( $coupons[ $key ] );
			continue;
		}

		$coupons[ $key ]['id']   = $saved->get_id();
		$coupons[ $key ]['code'] = $saved->get_code();
		$seed['coupons'][]       = $saved->get_id();
		update_option( SPSG_SEED_OPTION, $seed, false );
	}

	$campaigns = isset( $coupons['code'], $coupons['automatic'] ) ? spsg_seed_campaigns( $seed, $bumps, $bogos, $coupons ) : [];
	$surfaces  = class_exists( CampaignSurfaces::class ) ? array_merge( [ '' ], array_keys( CampaignSurfaces::modules() ) ) : [ '' ];

	$statuses  = [ 'completed', 'completed', 'completed', 'processing' ];
	$now       = current_datetime();
	$order_ids = [];
	$refunds   = 0;
	$used      = 0;
	$credited  = 0;

	for ( $days_ago = SPSG_SEED_DAYS - 1; $days_ago >= 0; $days_ago-- ) {
		$day     = $now->setTime( 0, 0 )->modify( "-{$days_ago} days" );
		$accepts = array_fill_keys( $seed['bumps'], 0 );
		$gifts   = array_fill_keys( $seed['bogos'], 0 );
		$campaign = spsg_seed_campaign_on( $campaigns, $days_ago );
		$promoted = 0;
		// Busier lately and during campaigns, so the chart has a shape.
		$orders = mt_rand( 0, $days_ago >= 30 ? 2 : 4 ) + ( $campaign ? mt_rand( 1, 3 ) : 0 );

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

			// About a third of the orders use a coupon.
			if ( $coupons && mt_rand( 1, 100 ) <= 33 ) {
				$pick = mt_rand( 1, 100 );
				foreach ( $coupons as $coupon ) {
					$pick -= $coupon['share'];
					if ( $pick <= 0 ) {
						$used += (int) spsg_seed_coupon( $order, $coupon );
						break;
					}
				}
			}

			// Most orders during a campaign credit it.
			if ( $campaign && mt_rand( 1, 100 ) <= 70 ) {
				$order->update_meta_data( OfferAttribution::PROMOTION_ID, $campaign );
				$order->update_meta_data( OfferAttribution::PROMOTION_SOURCE, mt_rand( 1, 100 ) <= 70 ? 'offer' : 'link' );
				$order->update_meta_data( OfferAttribution::PROMOTION_SURFACE, $surfaces[ mt_rand( 0, count( $surfaces ) - 1 ) ] );
				++$promoted;
				++$credited;
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
		// Carts that qualified for the campaign's deal, for its acceptance.
		if ( $campaign ) {
			spsg_seed_count( $date, 'campaigns', 'qualified', $campaign, $promoted * 2 + mt_rand( 1, 3 ), 'promotion' );
		}
	}

	// The automatic coupon would apply to every cart on the storefront.
	if ( isset( $coupons['automatic'] ) ) {
		SmartCouponRepository::save( [ 'status' => 'inactive' ], new WC_Coupon( $coupons['automatic']['id'] ) );
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
			'Seeded %d orders over %d days (%d partly refunded, %d with a coupon, %d credited to a campaign), 2 bumps, 2 BOGO offers, %d Smart Coupons, %d campaigns, 4 products%s. Open StoreGrowth > Analytics.',
			count( $order_ids ),
			SPSG_SEED_DAYS,
			$refunds,
			$used,
			$credited,
			count( $coupons ),
			count( $campaigns ),
			$vendor_id ? " (vendor {$vendor_id})" : ''
		)
	);
}

if ( 'clean' === ( $args[0] ?? '' ) ) {
	spsg_seed_clean();
} else {
	spsg_seed();
}
