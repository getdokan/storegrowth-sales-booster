<?php

namespace STOREGROWTH\SPSB\DependencyManagement\Providers;

use STOREGROWTH\SPSB\DependencyManagement\BaseServiceProvider;
use STOREGROWTH\SPSB\ModuleManager;

class ModuleServiceProvider extends BaseServiceProvider {
	/**
	 * Service classes to be registered in the container.
	 *
	 * @var array<class-string>
	 */
	protected $services = [
		ModuleManager::class
	];

	/**
	 * Register the services.
	 */
	public function register(): void {
		$container = $this->getContainer();

		// Register ModuleManager as a shared service
		$container->addShared(ModuleManager::class, ModuleManager::class);
	}
}
