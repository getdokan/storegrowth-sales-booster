<?php
/**
 * File for the Smart Coupons module BootstrapServiceProvider class.
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Modules\SmartCoupons\Providers;

use StorePulse\StoreGrowth\DependencyManagement\BootableServiceProvider;
use StorePulse\StoreGrowth\Modules\SmartCoupons\LinkCoupons;
use StorePulse\StoreGrowth\Modules\SmartCoupons\REST\SmartCouponsController;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * The services that run only while Smart Coupons is on.
 *
 * @since 3.1.0
 */
class BootstrapServiceProvider extends BootableServiceProvider {

	/**
	 * Services this provider offers.
	 *
	 * @since 3.1.0
	 *
	 * @var array<class-string>
	 */
	protected $services = [
		SmartCouponsController::class,
		LinkCoupons::class,
	];

	/**
	 * Boot the service provider.
	 *
	 * @since 3.1.0
	 *
	 * @return void
	 */
	public function boot(): void {
		foreach ( $this->services as $service ) {
			$this->share_with_implements_tags( $service );
		}
	}

	/**
	 * Register the service provider.
	 *
	 * @since 3.1.0
	 *
	 * @return void
	 */
	public function register(): void {
	}
}
