<?php

namespace STOREGROWTH\SPSB\DependencyManagement\Providers;

use STOREGROWTH\SPSB\DependencyManagement\BaseServiceProvider;
use STOREGROWTH\SPSB\Modules;

class ModuleServiceProvider extends BaseServiceProvider {
    protected $services = [
        Modules::class,
    ];

    /**
     * Register the classes.
     */
    public function register(): void {
        $this->getContainer()->addShared( Modules::class, Modules::class );
    }
}
