<?php

namespace StorePulse\StoreGrowth;

use StorePulse\StoreGrowth\Interfaces\ModuleSkeleton;

class ModuleManager {
	/**
	 * Loaded module instances.
	 *
	 * @var array<string, ModuleSkeleton>
	 */
	protected $module_list = [];

	/**
	 * Get all modules implementing ModuleSkeleton.
	 *
	 * @param bool $force_load
	 * @return array<string, ModuleSkeleton>
	 */
	public function get_all( bool $force_load = false ): array {
		$container = storegrowth_get_container();
		
		if ( (empty( $this->module_list ) || $force_load) && $container->has(ModuleSkeleton::class) ) {
			$modules   = $container->get(ModuleSkeleton::class);
			$this->module_list = apply_filters( 'spsg_modules', $modules );
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

		foreach ( $modules as $module ) {
			$module_id = $module->get_id();

			$all_modules[] = array(
				'id'          => $module_id,
				'name'        => $module->get_name(),
				'icon'        => $module->get_icon(),
				'banner'      => $module->get_banner(),
				'description' => $module->get_description(),
				'category'    => $module->get_module_category(),
				'status'      => $module->is_active(),
				'doc_link'    => $module->get_doc_link(),
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
		$module =  array_find( $this->get_all(), function ( ModuleSkeleton $module ) use ( $module_id ) {
			return $module->get_id() === $module_id;
		} );

		return $module;
	}
}
