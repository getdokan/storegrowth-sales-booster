<?php

namespace StorePulse\StoreGrowth;

use StorePulse\StoreGrowth\DependencyManagement\BaseServiceProvider;
use StorePulse\StoreGrowth\Interfaces\ModuleSkeleton;
use StorePulse\StoreGrowth\DependencyManagement\Container;
use StorePulse\StoreGrowth\Traits\Singleton;

/**
 * Base module class that provides common functionality for all modules.
 * 
 * This abstract class implements the ModuleSkeleton interface and provides
 * basic module management functionality including activation, deactivation,
 * and status checking.
 * 
 * @since 1.0.0
 */
abstract class BaseModule implements ModuleSkeleton {

	use Singleton;

    /**
     * Option key for storing active module IDs.
     * 
     * @var string
     */
    protected $active_modules_option_key = 'spsg_active_module_ids';

    /**
     * Get the bootstrap service provider for this module.
     * 
     * This method should return a service provider instance that handles
     * the module's dependency injection and bootstrapping.
     * 
     * @since 1.0.0
     * @return BaseServiceProvider The service provider instance for this module.
     */
    abstract protected function get_bootstrap_service_provider(): BaseServiceProvider;

    /**
     * Get the dependency injection container.
     * 
     * @since 1.0.0
     * @return Container The dependency injection container instance.
     */
    protected function get_container(): Container {
        return storegrowth_get_container();
    }

    /**
     * Check if the module is currently active.
     * 
     * @since 1.0.0
     * @return bool True if the module is active, false otherwise.
     */
    public function is_active(): bool {
        $data = $this->get_active_modules_option_data();

        return in_array( $this->get_id(), $data, true );
    }

    /**
     * Activate the module.
     * 
     * This method adds the module ID to the active modules list and
     * boots the module. It also fires the 'spsg_module_activated' action.
     * 
     * @since 1.0.0
     * @return bool True if activation was successful, false otherwise.
     */
    public function activate(): bool {
        $data = $this->get_active_modules_option_data();

        $data[] = $this->get_id();

        $activated = $this->update_active_modules_option_data( $data );

        $this->boot();

        // WordPress function
        do_action( 'spsg_module_activated', $this->get_id() );

        return $activated;
    }

    /**
     * Deactivate the module.
     * 
     * This method removes the module ID from the active modules list.
     * It also fires the 'spsg_module_deactivated' action.
     * 
     * @since 1.0.0
     * @return bool True if deactivation was successful, false otherwise.
     */
    public function deactivate(): bool {
        $data = $this->get_active_modules_option_data();

        $filter_data = array_filter(
            $data, function ( $module_id ) {
				return $module_id !== $this->get_id();
            }
        );

        // WordPress function
        do_action( 'spsg_module_deactivated', $this->get_id() );

        return $this->update_active_modules_option_data( $filter_data );
    }

    /**
     * Get the list of active module IDs from the database.
     * 
     * @since 1.0.0
     * @return array Array of active module IDs.
     */
    protected function get_active_modules_option_data(): array {
        // WordPress function
        return (array) get_option( $this->active_modules_option_key, [] );
    }

    /**
     * Update the list of active module IDs in the database.
     * 
     * This method ensures that the module IDs are unique and filters out
     * any empty values before saving.
     * 
     * @since 1.0.0
     * @param array $module_ids Array of module IDs to save.
     * @return bool True if the update was successful, false otherwise.
     */
    protected function update_active_modules_option_data( array $module_ids ): bool {
        $module_ids = array_unique( $module_ids );

        // WordPress function
        return update_option( $this->active_modules_option_key, array_filter( $module_ids ) );
    }

	/**
	 * Starting point of the module.
	 * 
	 * This method is called when the module is active and handles
	 * the initial setup and bootstrapping of the module.
	 * 
	 * @since 1.0.0
	 * @return void
	 */
	public function boot(): void {
        do_action( 'storegrowth_module_before_boot', $this->get_id() );

		$this->get_container()->addServiceProvider( $this->get_bootstrap_service_provider() );
        
		/**
		 * Module initialized.
		 *
		 * @since 1.0.2
		 */
		// WordPress function
        do_action( 'storegrowth_module_after_boot', $this->get_id() );

	}

    public function get_doc_link(): string {
        return 'https://storegrowth.io/docs/storegrowth-helpcenter/modules/' . $this->get_id() . '/';
    }
}
