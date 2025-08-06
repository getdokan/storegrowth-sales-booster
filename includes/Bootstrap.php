<?php
/**
 * Bootstrap class.
 *
 * @package SBFW
 */

namespace STOREGROWTH\SPSB;

use STOREGROWTH\SPSB\Admin\AdminMenu;
use STOREGROWTH\SPSB\Traits\Singleton;
use STOREGROWTH\SPSB\Admin\AdminHooks;
use STOREGROWTH\SPSB\DependencyManagement\Container;
use STOREGROWTH\SPSB\Interfaces\HookRegistry;
use WP_REST_Controller;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Load core functionality inside this class.
 */
class Bootstrap {

	use Singleton;

	/**
	 * Constructor of Bootstrap class.
	 */
	private function __construct() {
		// Include module classes.
		$this->load_module_classes();

		// Include asset method.
		$this->load_scripts();

		// Include ajax classes.
		$this->load_ajax_classes();

		// Include admin classes.
		$this->load_admin_classes();

		// Register hooks.
		$this->register_hooks();
	}

	/**
	 * Register hooks.
	 *
	 * @return void
	 */
	public function register_hooks(): void {
        add_action( 'rest_api_init', [ $this, 'register_rest_routes' ] );

		$hook_registry_list = $this->get_container()->get( HookRegistry::class );

		foreach ( $hook_registry_list as $hook_registry ) {
			if ( method_exists( $hook_registry, 'register_hooks' ) ) {
				$hook_registry->register_hooks();
			}
		}
    }

    /**
     * Register REST API routes.
     *
     * @return void
     */
    public function register_rest_routes(): void {
        if ( ! $this->get_container()->has( WP_REST_Controller::class ) ) {
            return;
        }

        $controller_list = $this->get_container()->get( WP_REST_Controller::class );

        foreach ( $controller_list as $controller ) {
            if ( method_exists( $controller, 'register_routes' ) ) {
                $controller->register_routes();
            }
        }
    }

	/**
	 * Magic getter to bypass referencing objects
	 *
	 * @since 1.29.0
	 *
	 * @param string $prop
	 *
	 * @return object Class Instance
	 */
	public function __get( $prop ) {
		if ( $this->get_container()->has( $prop ) ) {
			return $this->get_container()->get( $prop );
		}
	}

	/**
	 * Retrieve the container instance.
	 *
	 * @since 1.29.0
	 *
	 * @return Container
	 */
	public function get_container(): Container {
		return storegrowth_get_container();
	}

	/**
	 * Load scripts and styles.
	 */
	private function load_scripts() {
		Assets::instance();
	}

	/**
	 * Load ajax classes
	 */
	private function load_ajax_classes() {
		if ( defined( 'DOING_AJAX' ) && DOING_AJAX ) {
			$this->get_container()->get( 'ajax-service' );
		}
	}

	/**
	 * Load admin classes
	 */
	private function load_admin_classes() {
		AdminMenu::instance();
		AdminHooks::instance();
	}

	/**
	 * Load module classes
	 */
	private function load_module_classes() {
		$this->get_container()->get( ModuleManager::class )->load();
	}
}
