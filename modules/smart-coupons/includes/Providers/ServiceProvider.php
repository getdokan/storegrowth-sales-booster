<?php
/**
 * File for the Smart Coupons module ServiceProvider class.
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Modules\SmartCoupons\Providers;

use StorePulse\StoreGrowth\DependencyManagement\BaseServiceProvider;
use StorePulse\StoreGrowth\Modules\SmartCoupons\AdminPage;
use StorePulse\StoreGrowth\Modules\SmartCoupons\CouponGuard;
use StorePulse\StoreGrowth\Modules\SmartCoupons\CouponScreens;
use StorePulse\StoreGrowth\Modules\SmartCoupons\SmartCouponsModule;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registers the module, and what must work while it's off: a real WooCommerce
 * coupon stays usable unless something keeps rejecting it (`CouponGuard`).
 *
 * @since 3.1.0
 */
class ServiceProvider extends BaseServiceProvider {

	/**
	 * Services this provider offers.
	 *
	 * @since 3.1.0
	 *
	 * @var array<class-string>
	 */
	protected $services = [
		SmartCouponsModule::class,
		AdminPage::class,
		CouponGuard::class,
		CouponScreens::class,
	];

	/**
	 * Boot the service provider.
	 *
	 * @since 3.1.0
	 *
	 * @return void
	 */
	public function boot(): void {
	}

	/**
	 * Register the service provider.
	 *
	 * @since 3.1.0
	 *
	 * @return void
	 */
	public function register(): void {
		$this->add_with_implements_tags( SmartCouponsModule::get_id(), SmartCouponsModule::class, true );
		$this->add_with_implements_tags( AdminPage::class, AdminPage::class, true );
		$this->add_with_implements_tags( CouponGuard::class, CouponGuard::class, true );
		$this->add_with_implements_tags( CouponScreens::class, CouponScreens::class, true );
	}
}
