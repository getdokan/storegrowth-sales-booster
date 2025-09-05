<?php

namespace StorePulse\StoreGrowth\DependencyManagement\Providers;

use StorePulse\StoreGrowth\DependencyManagement\BaseServiceProvider;
use StorePulse\StoreGrowth\Ajax;

/**
 * Class AjaxServiceProvider
 *
 * Registers the Ajax service with the dependency container and adds
 * appropriate tags to the service definition.
 */
class AjaxServiceProvider extends BaseServiceProvider {
    /**
     * Tags used to identify the service in the container.
     *
     * @var array
     */
    protected $tags = [ 'ajax-service' ];

    /**
     * List of services provided by this provider.
     *
     * @var array
     */
    protected $services = [
        Ajax::class,
    ];


    /**
     * Register the Ajax class in the container and add the corresponding tags.
     *
     * @return void
     */
    public function register(): void {
        $this->add_tags(
            $this->getContainer()->addShared( Ajax::class ),
            $this->tags
        );
    }
}
