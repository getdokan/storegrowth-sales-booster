<?php

namespace StorePulse\StoreGrowth\Modules\QuickView\Providers;

use StorePulse\StoreGrowth\DependencyManagement\BaseServiceProvider;
use StorePulse\StoreGrowth\Modules\QuickView\AdminPage;
use StorePulse\StoreGrowth\Modules\QuickView\QuickViewModule;
use StorePulse\StoreGrowth\Modules\QuickView\Settings\QuickViewSettings;

/**
 * ServiceProvider for the module.
 *
 * Registers and boots the module.
 *
 * @since 2.0.0
 *
 * @package StorePulse\StoreGrowth\Modules\QuickView\Providers
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
	    QuickViewModule::class,
	    QuickViewSettings::class,
	    AdminPage::class,
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
        $this->add_with_implements_tags( QuickViewModule::get_id(), QuickViewModule::class, true );
        // Always registered: the settings page and route work while the module is off.
        $this->add_with_implements_tags( QuickViewSettings::class, QuickViewSettings::class, true );
        $this->add_with_implements_tags( AdminPage::class, AdminPage::class, true );
    }
}
