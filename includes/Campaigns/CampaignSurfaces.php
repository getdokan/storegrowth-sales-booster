<?php
/**
 * What running campaigns show on the storefront (ADR-016).
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Campaigns;

use StorePulse\StoreGrowth\Helper;
use StorePulse\StoreGrowth\Interfaces\HookRegistry;
use StorePulse\StoreGrowth\Modules\CountdownTimer\CountdownTimerModule;
use StorePulse\StoreGrowth\Modules\FloatingNotificationBar\FloatingNotificationBarModule;
use StorePulse\StoreGrowth\Modules\FlyCart\FlyCartModule;
use StorePulse\StoreGrowth\Modules\ProgressiveDiscountBanner\ProgressiveDiscountBannerModule;
use StorePulse\StoreGrowth\Modules\SalesPop\SalesPopModule;
use StorePulse\StoreGrowth\Modules\StockBar\StockBarModule;
use StorePulse\StoreGrowth\Offers\CampaignRepository;
use StorePulse\StoreGrowth\Storefront\DisplayRules;
use WC_Product;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Finds the running campaign behind a surface and draws the two things that
 * have no module of their own: the Product Badge and the Fly Cart message.
 *
 * Every surface goes through `DisplayRules::should_show()`, so it follows the
 * promotion audience and device rules a bar or popup follows.
 *
 * @since SPSG_VERSION
 */
class CampaignSurfaces implements HookRegistry {

	/**
	 * Surface id: Countdown Timer.
	 *
	 * @since SPSG_VERSION
	 */
	const COUNTDOWN = 'countdown';

	/**
	 * Surface id: Floating Notification Bar.
	 *
	 * @since SPSG_VERSION
	 */
	const FLOATING_BAR = 'floating_bar';

	/**
	 * Surface id: Stock Count Bar.
	 *
	 * @since SPSG_VERSION
	 */
	const STOCK_BAR = 'stock_bar';

	/**
	 * Surface id: Live Sales Notification.
	 *
	 * @since SPSG_VERSION
	 */
	const SALES_POP = 'sales_pop';

	/**
	 * Surface id: Fly Cart message.
	 *
	 * @since SPSG_VERSION
	 */
	const FLY_CART = 'fly_cart';

	/**
	 * Surface id: Cart Rewards bar.
	 *
	 * @since SPSG_VERSION
	 */
	const CART_REWARDS = 'cart_rewards';

	/**
	 * Surface id: Product Badge (owned by Campaigns).
	 *
	 * @since SPSG_VERSION
	 */
	const BADGE = 'badge';

	/**
	 * Register hooks.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return void
	 */
	public function register_hooks(): void {
		add_action( 'woocommerce_before_shop_loop_item_title', [ $this, 'render_badge' ], 9 );
		add_action( 'woocommerce_before_single_product_summary', [ $this, 'render_badge' ], 9 );
		add_action( 'woocommerce_before_add_to_cart_form', [ $this, 'render_stock_note' ], 9 );
		add_action( 'spsg_woocommerce_before_cart_collaterals', [ $this, 'render_fly_cart_message' ], 5 );
		add_action( 'wp_enqueue_scripts', [ $this, 'enqueue' ] );
	}

	/**
	 * The module id of a surface, for showing it off when its module is off.
	 * The Product Badge belongs to Campaigns and has none.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return array<string, string>
	 */
	public static function modules(): array {
		return [
			self::COUNTDOWN    => CountdownTimerModule::get_id(),
			self::FLOATING_BAR => FloatingNotificationBarModule::get_id(),
			self::STOCK_BAR    => StockBarModule::get_id(),
			self::SALES_POP    => SalesPopModule::get_id(),
			self::FLY_CART     => FlyCartModule::get_id(),
			self::CART_REWARDS => ProgressiveDiscountBannerModule::get_id(),
			self::BADGE        => '',
		];
	}

	/**
	 * The running campaign showing a surface, for a product when one is given.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param string $surface    Surface id.
	 * @param array  $settings   The module's settings, for its display rules.
	 * @param int    $product_id Product the surface is about; 0 for a store-wide one.
	 *
	 * @return array|null `campaign` and `copy`; null when no campaign shows it.
	 */
	public static function active( string $surface, array $settings = [], int $product_id = 0 ): ?array {
		foreach ( CampaignRepository::running() as $campaign ) {
			$config = (array) ( $campaign['settings']['surfaces'][ $surface ] ?? [] );

			if ( empty( $config['enabled'] ) ) {
				continue;
			}

			if ( $product_id && ! CampaignProducts::contains( CampaignProducts::scope( $campaign ), $product_id ) ) {
				continue;
			}

			// A surface with no device setting of its own shows on every device.
			if ( ! DisplayRules::should_show( $settings, self::modules()[ $surface ], [ 'banner_device_view' => [ 'banner-show-desktop' ] ] ) ) {
				continue;
			}

			return [
				'campaign' => $campaign,
				'copy'     => (string) ( $config['copy'] ?? '' ),
			];
		}

		return null;
	}

	/**
	 * A surface's campaign copy.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param string $surface  Surface id.
	 * @param array  $settings The module's settings.
	 *
	 * @return string Empty when no campaign shows it or it has no copy.
	 */
	public static function copy( string $surface, array $settings = [] ): string {
		$active = self::active( $surface, $settings );

		return $active ? $active['copy'] : '';
	}

	/**
	 * The campaign's end for a product's Countdown timer, while one runs it.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param int $product_id Product id.
	 *
	 * @return string|null Stored end date; null to keep the product's own.
	 */
	public static function countdown_end( int $product_id ): ?string {
		$active = self::active( self::COUNTDOWN, [], $product_id );

		return $active && ! empty( $active['campaign']['ends_at'] ) ? (string) $active['campaign']['ends_at'] : null;
	}

	/**
	 * Limit the live sales popup to the running campaign's products.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array $product_ids Products the popup can show.
	 * @param array $settings    The module's settings.
	 *
	 * @return array
	 */
	public static function narrow_sales_pop( array $product_ids, array $settings ): array {
		$active = self::active( self::SALES_POP, $settings );

		if ( ! $active ) {
			return $product_ids;
		}

		$scope = CampaignProducts::scope( $active['campaign'] );

		return array_values(
			array_filter(
				$product_ids,
				static function ( $id ) use ( $scope ): bool {
					return CampaignProducts::contains( $scope, (int) $id );
				}
			)
		);
	}

	/**
	 * Load the badge's stylesheet and the tracker, for the campaign link.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return void
	 */
	public function enqueue(): void {
		if ( ! sp_store_growth()->has_pro() || ! CampaignRepository::is_installed() ) {
			return;
		}

		wp_enqueue_script( 'spsg-storefront-tracker' );

		if ( self::active( self::BADGE ) ) {
			wp_enqueue_style( 'spsg-campaign-badge', Helper::get_plugin_url( 'assets/css/campaign-badge.css' ), [], (string) filemtime( Helper::get_plugin_path( 'assets/css/campaign-badge.css' ) ) );
		}
	}

	/**
	 * Print the Product Badge on exactly the campaign products.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return void
	 */
	public function render_badge(): void {
		global $product;

		if ( ! $product instanceof WC_Product ) {
			return;
		}

		$active = self::active( self::BADGE, [], $product->get_id() );

		if ( ! $active ) {
			return;
		}

		$text = '' !== $active['copy'] ? $active['copy'] : (string) $active['campaign']['name'];

		printf(
			'<span class="spsg-campaign-badge" data-spsg-surface="%1$s">%2$s</span>',
			esc_attr( self::BADGE ),
			esc_html( $text )
		);
	}

	/**
	 * Print the campaign's note above a product's stock bar.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return void
	 */
	public function render_stock_note(): void {
		global $product;

		if ( ! $product instanceof WC_Product ) {
			return;
		}

		$active = self::active( self::STOCK_BAR, Helper::get_settings( 'spsg_stock_bar_settings' ), $product->get_id() );

		if ( $active && '' !== $active['copy'] ) {
			printf( '<p class="spsg-campaign-note" data-spsg-surface="%1$s">%2$s</p>', esc_attr( self::STOCK_BAR ), esc_html( $active['copy'] ) );
		}
	}

	/**
	 * Print the campaign's message in the fly cart.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return void
	 */
	public function render_fly_cart_message(): void {
		$copy = self::copy( self::FLY_CART, Helper::get_settings( 'spsg_fly_cart_settings' ) );

		if ( '' !== $copy ) {
			printf( '<p class="spsg-campaign-note" data-spsg-surface="%1$s">%2$s</p>', esc_attr( self::FLY_CART ), esc_html( $copy ) );
		}
	}
}
