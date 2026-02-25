<?php

namespace StorePulse\StoreGrowth\Modules\UpsellOrderBump\Providers;

use StorePulse\StoreGrowth\DependencyManagement\BaseServiceProvider;
use StorePulse\StoreGrowth\Modules\UpsellOrderBump\Blocks\BlockRegistry;
use StorePulse\StoreGrowth\Modules\UpsellOrderBump\UpsellOrderBumpModule;

/**
 * ServiceProvider for the module.
 *
 * Registers and boots the module.
 *
 * @since 2.0.0
 *
 * @package StorePulse\StoreGrowth\Modules\UpsellOrderBump\Providers
 */
class ServiceProvider extends BaseServiceProvider {

    /**
     * List of services provided by this provider.
     *
     * @since 2.0.0
     *
     * @var array<class-string>
     */
    protected $services = [
        UpsellOrderBumpModule::class,
	    BlockRegistry::class,
    ];

    /**
     * Boot the service provider.
     *
     * @since 2.0.0
     *
     * @return void
     */
    public function boot(): void {
    }

    /**
     * Register the service provider.
     *
     * @since 2.0.0
     *
     * @return void
     */
    public function register(): void {
        $this->add_with_implements_tags( UpsellOrderBumpModule::get_id(), UpsellOrderBumpModule::class, true );
		$this->add_with_implements_tags( BlockRegistry::class, BlockRegistry::class, true );
    }
}
