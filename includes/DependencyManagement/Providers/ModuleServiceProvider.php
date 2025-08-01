<?php

namespace STOREGROWTH\SPSB\DependencyManagement\Providers;

use STOREGROWTH\SPSB\DependencyManagement\BaseServiceProvider;
use STOREGROWTH\SPSB\ModuleManager;
use STOREGROWTH\SPSB\Interfaces\ModuleSkeleton;

// Import module classes
use STOREGROWTH\SPSB\Modules\BoGo\BoGoModule;
use STOREGROWTH\SPSB\Modules\CountdownTimer\CountdownTimerModule;
use STOREGROWTH\SPSB\Modules\DirectCheckout\DirectCheckoutModule;
use STOREGROWTH\SPSB\Modules\FloatingNotificationBar\FloatingNotificationBarModule;
use STOREGROWTH\SPSB\Modules\FlyCart\FlyCartModule;
use STOREGROWTH\SPSB\Modules\ProgressiveDiscountBanner\ProgressiveDiscountBannerModule;
use STOREGROWTH\SPSB\Modules\QuickView\QuickViewModule;
use STOREGROWTH\SPSB\Modules\SalesPop\SalesPopModule;
use STOREGROWTH\SPSB\Modules\StockBar\StockBarModule;
use STOREGROWTH\SPSB\Modules\UpsellOrderBump\UpsellOrderBumpModule;

class ModuleServiceProvider extends BaseServiceProvider {
	/**
	 * Service classes to be registered in the container.
	 *
	 * @var array<class-string>
	 */
	protected $services = [
		ModuleManager::class,
		BoGoModule::class,
		CountdownTimerModule::class,
		DirectCheckoutModule::class,
		FloatingNotificationBarModule::class,
		FlyCartModule::class,
		ProgressiveDiscountBannerModule::class,
		QuickViewModule::class,
		SalesPopModule::class,
		StockBarModule::class,
		UpsellOrderBumpModule::class,
	];

	/**
	 * Register the services.
	 */
	public function register(): void {
		$container = $this->getContainer();

		// Register ModuleManager as a shared service
		$container->addShared(ModuleManager::class, ModuleManager::class);

		// Register all modules (manually or from a map)
		$modules = [
			BoGoModule::class,
			CountdownTimerModule::class,
			DirectCheckoutModule::class,
			FloatingNotificationBarModule::class,
			FlyCartModule::class,
			ProgressiveDiscountBannerModule::class,
			QuickViewModule::class,
			SalesPopModule::class,
			StockBarModule::class,
			UpsellOrderBumpModule::class,
		];

		foreach ( $modules as $module_class ) {
			if ( class_exists( $module_class ) ) {
				$container->addShared($module_class, $module_class)
				          ->addTag(ModuleSkeleton::class);
			}
		}
	}
}
