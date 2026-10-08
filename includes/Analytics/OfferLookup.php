<?php
/**
 * Offer lookup: StoreGrowth keys mirrored next to WooCommerce Analytics (ADR-012).
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Analytics;

use StorePulse\StoreGrowth\Attribution\OfferAttribution;
use StorePulse\StoreGrowth\Interfaces\HookRegistry;
use StorePulse\StoreGrowth\Modules\BoGo\BoGoModule;
use StorePulse\StoreGrowth\Modules\CountdownTimer\CountdownTimerModule;
use StorePulse\StoreGrowth\Modules\UpsellOrderBump\UpsellOrderBumpModule;
use WC_Order_Factory;
use WC_Order_Item_Product;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Keeps `spsg_offer_lookup` in step with WooCommerce's `wc_order_product_lookup`.
 *
 * WooCommerce Analytics imports every order and refund line into its lookup
 * table and fires `woocommerce_analytics_update_product` per row (the way
 * Dokan keeps `dokan_order_stats` in step). For each row whose line carries
 * StoreGrowth keys, this writes a row with the same key holding the module,
 * role, campaign and the discount per unit. A row's discount is then
 * `unit_discount × product_qty`: refund rows have a negative quantity, so
 * refunds net out in a plain SUM (docs/analytics/README.md §2.2).
 *
 * @since SPSG_VERSION
 */
class OfferLookup implements HookRegistry {

	/**
	 * Role of a line given away or added by an offer (BOGO gift, order bump).
	 */
	const ROLE_REWARD = 'reward';

	/**
	 * Role of a line sold at a module price (countdown timer).
	 */
	const ROLE_DISCOUNTED = 'discounted';

	/**
	 * Register hooks.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return void
	 */
	public function register_hooks(): void {
		add_action( 'woocommerce_analytics_update_product', [ $this, 'sync_row' ], 10, 2 );
		add_action( 'woocommerce_analytics_delete_product', [ $this, 'delete_order' ], 10, 2 );
	}

	/**
	 * Mirror one WooCommerce lookup row.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param int $order_item_id Order item id of the row (a refund line for line refunds).
	 * @param int $order_id      Order id of the row (the refund for refund rows).
	 *
	 * @return void
	 */
	public function sync_row( $order_item_id, $order_id ): void {
		global $wpdb;

		// Not until the upgrade has created the table.
		if ( ! Schema::is_installed() ) {
			return;
		}

		// WooCommerce re-imports all of an order's rows at once: clear the
		// order's rows once, at its first row, so a line that lost its keys
		// or left the order leaves nothing behind, and plain lines cost no write.
		static $cleared = [];
		if ( ! isset( $cleared[ (int) $order_id ] ) ) {
			$cleared[ (int) $order_id ] = true;
			$this->delete_order( 0, $order_id );
		}

		$row = self::row_for( (int) $order_item_id, (int) $order_id );
		if ( null === $row ) {
			return;
		}

		$wpdb->replace( $wpdb->prefix . Schema::OFFER_LOOKUP, $row, [ '%d', '%d', '%d', '%s', '%s', '%s', '%s', '%f', '%d' ] ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
	}

	/**
	 * Remove an order's rows when WooCommerce removes its lookup rows.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param int $product_id Unused (WooCommerce passes 0).
	 * @param int $order_id   Order or refund id.
	 *
	 * @return void
	 */
	public function delete_order( $product_id, $order_id ): void {
		global $wpdb;

		if ( ! Schema::is_installed() ) {
			return;
		}

		$wpdb->delete( $wpdb->prefix . Schema::OFFER_LOOKUP, [ 'order_id' => (int) $order_id ] ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
	}

	/**
	 * The lookup row for a WooCommerce lookup row, or null when the line
	 * carries no StoreGrowth keys.
	 *
	 * Refund rows take everything from their original line: line refunds
	 * point at it with `_refunded_item_id`, full-refund rows (WC 10.2+) reuse
	 * its item id under the refund's order id.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param int $order_item_id Order item id of the row.
	 * @param int $order_id      Order id of the row.
	 *
	 * @return array|null
	 */
	public static function row_for( int $order_item_id, int $order_id ): ?array {
		$item = WC_Order_Factory::get_order_item( $order_item_id );
		if ( ! $item instanceof WC_Order_Item_Product ) {
			return null;
		}

		$root_id = (int) $item->get_meta( '_refunded_item_id' );
		$root    = $root_id ? WC_Order_Factory::get_order_item( $root_id ) : $item;
		if ( ! $root instanceof WC_Order_Item_Product ) {
			return null;
		}

		$figures = self::line_figures(
			[
				'qty'                 => $root->get_quantity(),
				'subtotal'            => $root->get_subtotal(),
				'campaign_id'         => $root->get_meta( OfferAttribution::CAMPAIGN_ID ),
				'trigger_campaign_id' => $root->get_meta( OfferAttribution::TRIGGER_CAMPAIGN_ID ),
				'reference'           => $root->get_meta( OfferAttribution::REFERENCE_PRICE ),
				'pct'                 => $root->get_meta( OfferAttribution::COUNTDOWN_PCT ),
				'legacy_discount'     => $root->get_meta( OfferAttribution::DISCOUNT_VALUE ),
			]
		);

		if ( null === $figures ) {
			return null;
		}

		return array_merge(
			[
				'order_item_id' => $order_item_id,
				'order_id'      => $order_id,
				'root_item_id'  => $root->get_id(),
			],
			$figures
		);
	}

	/**
	 * Module, role and discount per unit of an original order line (§2.2).
	 *
	 * The discount per unit is worked out from what the line was charged
	 * before coupons (its subtotal, excluding tax), so a coupon's saving
	 * isn't counted as the offer's.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array $line `qty`, `subtotal` and the line's StoreGrowth keys.
	 *
	 * @return array{module: string, role: string, campaign_id: string, trigger_campaign_id: string, unit_discount: float, approximate: int}|null
	 *         Null when the line has no StoreGrowth keys.
	 */
	public static function line_figures( array $line ): ?array {
		$qty         = max( 1, (int) $line['qty'] );
		$unit_charge = (float) $line['subtotal'] / $qty;
		$campaign_id = (string) $line['campaign_id'];
		$trigger_id  = (string) $line['trigger_campaign_id'];
		$reference   = (string) $line['reference'];
		$pct         = (int) $line['pct'];

		$figures = [
			'module'              => '',
			'role'                => '',
			'campaign_id'         => $campaign_id,
			'trigger_campaign_id' => $trigger_id,
			'unit_discount'       => 0.0,
			'approximate'         => 0,
		];

		if ( '' !== $campaign_id ) {
			$figures['role']   = self::ROLE_REWARD;
			$figures['module'] = self::module_of( $campaign_id );

			if ( '' !== $reference ) {
				$figures['unit_discount'] = max( 0.0, (float) $reference - $unit_charge );
			} else {
				// Lines from before the reference price was written (2.2.0).
				$figures['unit_discount'] = max( 0.0, (float) $line['legacy_discount'] );
				$figures['approximate']   = 1;
			}
		} elseif ( $pct > 0 && $pct <= 100 ) {
			$figures['role']          = self::ROLE_DISCOUNTED;
			$figures['module']        = CountdownTimerModule::get_id();
			$figures['unit_discount'] = 100 === $pct
				? (float) $reference
				: $unit_charge * $pct / ( 100 - $pct );
		} elseif ( '' === $trigger_id ) {
			return null;
		}

		$figures['unit_discount'] = round( $figures['unit_discount'], 6 );

		return $figures;
	}

	/**
	 * Module id of a campaign id (`bogo:12`, `order_bump:3`).
	 *
	 * @since SPSG_VERSION
	 *
	 * @param string $campaign_id Campaign id.
	 *
	 * @return string Module id, or the campaign type when unknown.
	 */
	public static function module_of( string $campaign_id ): string {
		$type    = strtok( $campaign_id, ':' );
		$modules = [
			'bogo'       => BoGoModule::get_id(),
			'order_bump' => UpsellOrderBumpModule::get_id(),
		];

		return $modules[ $type ] ?? (string) $type;
	}
}
