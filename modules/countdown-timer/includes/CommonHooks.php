<?php
/**
 * Common_Hooks class for `Countdown Timer` module.
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Modules\CountdownTimer;

use StorePulse\StoreGrowth\Campaigns\CampaignPrice;
use StorePulse\StoreGrowth\Interfaces\HookRegistry;
use StorePulse\StoreGrowth\Pricing\DealList;
use WC_Product;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Miscellaneous hooks implementation.
 */
class CommonHooks implements HookRegistry {

	/**
	 * Register Hooks.
	 *
	 * @since 2.0.0
	 *
	 * @return void
	 */
	public function register_hooks(): void {
		// return;
		add_action( 'woocommerce_before_add_to_cart_form', array( $this, 'show_countdown_timer_template' ) );

		add_filter( 'woocommerce_product_data_tabs', array( $this, 'woocommerce_product_data_tabs' ), 10, 1 );
		add_action( 'woocommerce_product_data_panels', array( $this, 'woocommerce_product_data_panels' ) );
		add_action( 'woocommerce_admin_process_product_object', array( $this, 'woocommerce_admin_process_product_object' ) );

		add_filter( 'woocommerce_product_get_price', array( $this, 'get_product_price' ), 10, 2 );
		add_filter( 'woocommerce_product_variation_get_price', array( $this, 'get_product_price' ), 10, 2 );
		add_filter( 'woocommerce_product_is_on_sale', array( $this, 'woocommerce_product_is_on_sale' ), 10, 2 );
		add_filter( 'spsg_cart_deals', [ $this, 'report_cart_deals' ], 10, 2 );
	}

	/**
	 * Report Countdown prices as the base of their lines. The discount
	 * itself stays in `get_product_price()`; a base price never competes.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array[]  $deals Deals.
	 * @param \WC_Cart $cart  Cart.
	 *
	 * @return array[]
	 */
	public function report_cart_deals( $deals, $cart ) {
		foreach ( $cart->get_cart() as $key => $item ) {
			$product = wc_get_product( $item['data']->get_id() );

			if ( ! $product ) {
				continue;
			}

			$campaign = CampaignPrice::for_product( $product->get_id() );

			if ( ! $campaign && ! Helper::is_product_discountable( $product->get_id() ) ) {
				continue;
			}

			$percent = $campaign ? $campaign['percent'] : (int) get_post_meta( $product->get_id(), '_spsg_countdown_timer_discount_amount', true );
			$from    = (float) $product->get_price( 'edit' );
			$price   = (float) $product->get_price();

			$deals[] = [
				'line'         => $key,
				'kind'         => DealList::BASE,
				/* translators: %d: discount percent. */
				'name'         => sprintf( __( 'Countdown %d%%', 'storegrowth-sales-booster' ), $percent ),
				'amount'       => ( $from - $price ) * (int) $item['quantity'],
				'price'        => $price,
				'from'         => $from,
				'promotion_id' => $campaign ? $campaign['promotion_id'] : 0,
			];
		}

		return $deals;
	}

	/**
	 * Hook for WooCommerce before add-to-cart form.
	 */
	public function show_countdown_timer_template() {
		/** @var WC_Product $product */
		global $product;
		$stock_status = $product->get_stock_status();

		$is_allow = apply_filters( 'spsg_allow_countdown_timer_render', true, $product );

		if ( $is_allow && 'outofstock' !== $stock_status ) {
			include __DIR__ . '/../templates/countdown-timer.php';
		}
	}


	/**
	 * Add a custom product data tab.
	 *
	 * @param array $tabs WooCommerce product data tabs.
	 */
	public function woocommerce_product_data_tabs( $tabs ) {
		if ( ! $this->is_external_product() ) {
			// Adds the new tab.
			$tabs['countdown_timer_tab'] = array(
				'label'  => __( 'Countdown Timer', 'storegrowth-sales-booster' ),
				'target' => 'spsg-countdown-timer-tab',
			);
		}
		return $tabs;
	}

	/**
	 * Output HTML of tab content.
	 */
	public function woocommerce_product_data_panels() {
		if ( ! $this->is_external_product() ) {
			include __DIR__ . '/../templates/wc-product-data-panels.php';
		}
	}

	/**
	 * Save `Countdown Timer` tab data.
	 *
	 * @param \WC_Product $product WooCommerce product object.
	 */
	public function woocommerce_admin_process_product_object( $product ) {
		$discount_start_date = '';
		$discount_end_date   = '';

		// phpcs:disable WordPress.Security.NonceVerification.Missing
		if ( isset( $_POST['_spsg_countdown_timer_discount_start'] ) ) {
			$discount_start_date = Helper::discount_date( wc_clean( wp_unslash( $_POST['_spsg_countdown_timer_discount_start'] ) ) ); //phpcs:ignore
		}

		if ( isset( $_POST['_spsg_countdown_timer_discount_end'] ) ) {
			$discount_end_date = Helper::discount_date( wc_clean( wp_unslash( $_POST['_spsg_countdown_timer_discount_end'] ) ), true ); // phpcs:ignore
		}

		$stock_discount_amount = isset( $_POST['_spsg_countdown_timer_discount_amount'] ) ? wc_clean( wp_unslash( $_POST['_spsg_countdown_timer_discount_amount'] ) ) : null; // phpcs:ignore

		$product_ids = array_merge( [ $product->get_id() ], $product->get_children() );
		// phpcs:enable WordPress.Security.NonceVerification.Missing
		foreach( $product_ids as $product_id ) {
			update_post_meta( $product_id, '_spsg_countdown_timer_discount_start', $discount_start_date );
			update_post_meta( $product_id, '_spsg_countdown_timer_discount_end', $discount_end_date );
			update_post_meta( $product_id, '_spsg_countdown_timer_discount_amount', $stock_discount_amount );
		}
	}

	/**
	 * Update product price according to stock discount.
	 *
	 * @param float       $price Product price.
	 * @param \WC_Product $product WooCommerce product object.
	 */
	public function get_product_price( $price, $product ) {
		// A price set at runtime (`set_price()`: an order bump or BOGO cart
		// line) was worked out from the discounted price; don't discount it
		// again.
		if ( array_key_exists( 'price', $product->get_changes() ) ) {
			return $price;
		}

		// A campaign's price replaces the product's own Countdown while it runs.
		$campaign = CampaignPrice::for_product( $product->get_id() );

		if ( $campaign ) {
			return ( floatval( $price ) * ( 100 - $campaign['percent'] ) ) / 100;
		}

		// Check countdown discount is set.
		if ( Helper::is_product_discountable( $product->get_id() ) ) {
			$current_price = floatval( $price );
			$discount_amount = get_post_meta( $product->get_id(), '_spsg_countdown_timer_discount_amount', true );
			$discount_amount = 100 - intval( $discount_amount );

			return ( $current_price * $discount_amount ) / 100;
		}

		return $price;
	}

	/**
	 * Set product is on sale.
	 *
	 * @param bool        $is_on_sale Check product is on sale.
	 * @param \WC_Product $product WooCommerce product object.
	 */
	public function woocommerce_product_is_on_sale( $is_on_sale, $product ) {
		// Check countdown discount is set, or a campaign price is on it.
		if ( CampaignPrice::for_product( $product->get_id() ) || Helper::is_product_discountable( $product->get_id() ) ) {
			return true;
		}

		return $is_on_sale;
	}

	/**
	 * Check if the product is an external type.
	 *
	 * @return bool Whether the product is an external type.
	 */
	public function is_external_product() {
		global $post;
		$product = wc_get_product( $post->ID );

		if ( $product && $product->is_type( 'external' ) ) {
			return true;
		}

		return false;
	}
}
