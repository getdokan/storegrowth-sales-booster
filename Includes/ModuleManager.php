<?php

namespace STOREGROWTH\SPSB;

use STOREGROWTH\SPSB\Interfaces\ModuleSkeleton;

class ModuleManager {
	/**
	 * Loaded module instances.
	 *
	 * @var array<string, ModuleSkeleton>
	 */
	protected $module_list = [];

	/**
	 * Mapping of module IDs to their implementing classes.
	 *
	 * @var array<string, class-string<ModuleSkeleton>>
	 */
	protected array $module_map = [
		'bogo'                        => \STOREGROWTH\SPSB\Modules\BoGo\BoGoModule::class,
		'countdown-timer'             => \STOREGROWTH\SPSB\Modules\CountdownTimer\CountdownTimerModule::class,
		'direct-checkout'             => \STOREGROWTH\SPSB\Modules\DirectCheckout\DirectCheckoutModule::class,
		'floating-notification-bar'   => \STOREGROWTH\SPSB\Modules\FloatingNotificationBar\FloatingNotificationBarModule::class,
		'fly-cart'                    => \STOREGROWTH\SPSB\Modules\FlyCart\FlyCartModule::class,
		'progressive-discount-banner' => \STOREGROWTH\SPSB\Modules\ProgressiveDiscountBanner\ProgressiveDiscountBannerModule::class,
		'quick-view'                  => \STOREGROWTH\SPSB\Modules\QuickView\QuickViewModule::class,
		'sales-pop'                   => \STOREGROWTH\SPSB\Modules\SalesPop\SalesPopModule::class,
		'stock-bar'                   => \STOREGROWTH\SPSB\Modules\StockBar\StockBarModule::class,
		'upsell-order-bump'           => \STOREGROWTH\SPSB\Modules\UpsellOrderBump\UpsellOrderBumpModule::class,
	];

	/**
	 * Get all modules implementing ModuleSkeleton.
	 *
	 * @param bool $force_load
	 * @return array<string, ModuleSkeleton>
	 */
	public function get_all( bool $force_load = false ): array {
		if ( empty( $this->module_list ) || $force_load ) {
			$container = storegrowth_get_container();
			$modules   = [];

			foreach ( $this->module_map as $slug => $class ) {
				if ( class_exists( $class ) && $container->has( $class ) ) {
					$modules[ $slug ] = $container->get( $class );
				} else {
					error_log("[SGSB] Module class for slug '$slug' not found or not registered: $class");
				}
			}

			$this->module_list = apply_filters( 'sgsb_modules', $modules );
		}

		return $this->module_list;
	}

	/**
	 * List Modules for frontend.
	 *
	 * @return array
	 */
	public function list_all_modules() {
		$modules = $this->get_all();

		$all_modules = array();
		$active_ids  = $this->get_active_modules();

		foreach ( $modules as $module ) {
			$module_id = $module->get_id();

			$all_modules[] = array(
				'id'          => $module_id,
				'name'        => $module->get_name(),
				'icon'        => $module->get_icon(),
				'banner'      => $module->get_banner(),
				'description' => $module->get_description(),
				'category'    => $module->get_module_category(),
				'status'      => isset( $active_ids[ $module_id ] ),
			);
		}

		return $all_modules;
	}

	/**
	 * Get all active modules.
	 *
	 * @return array<string, ModuleSkeleton>
	 */
	public function get_active_modules(): array {
		return array_filter(
			$this->get_all(),
			fn( ModuleSkeleton $module ) => $module->is_active()
		);
	}

	/**
	 * Boot all active modules.
	 *
	 * @return void
	 */
	public function load(): void {
		foreach ( $this->get_active_modules() as $module ) {
			$module->boot();
		}
	}

	/**
	 * Activate a module by ID.
	 *
	 * @param string $module_id
	 * @return bool
	 */
	public function activate( string $module_id ): bool {
		$module = $this->get( $module_id );
		return $module ? $module->activate() : false;
	}

	/**
	 * Deactivate a module by ID.
	 *
	 * @param string $module_id
	 * @return bool
	 */
	public function deactivate( string $module_id ): bool {
		$module = $this->get( $module_id );
		return $module ? $module->deactivate() : false;
	}

	/**
	 * Check if a module is active by ID.
	 *
	 * @param string $module_id
	 * @return bool
	 */
	public function is_active_module( string $module_id ): bool {
		$module = $this->get( $module_id );
		return $module ? $module->is_active() : false;
	}

	/**
	 * Get a module instance by slug.
	 *
	 * @param string $module_id
	 * @return ModuleSkeleton|null
	 */
	public function get( string $module_id ): ?ModuleSkeleton {
		$class = $this->module_map[ $module_id ] ?? null;

		if ( ! $class ) {
			error_log("[SGSB] Unknown module ID: $module_id");
			return null;
		}

		$container = storegrowth_get_container();

		if ( $container->has( $class ) ) {
			return $container->get( $class );
		}

		error_log("[SGSB] Module class not registered in container: $class");
		return null;
	}
}
