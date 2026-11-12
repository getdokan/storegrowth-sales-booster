<?php
/**
 * Bootstrap class.
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth;

use StorePulse\StoreGrowth\Admin\AdminMenu;
use StorePulse\StoreGrowth\Traits\Singleton;
use StorePulse\StoreGrowth\Admin\AdminHooks;
use StorePulse\StoreGrowth\DependencyManagement\Container;
use StorePulse\StoreGrowth\Interfaces\HookRegistry;
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

	public ?Tracker $tracker = null;

	/**
	 * Minimum WooCommerce version the plugin supports.
	 *
	 * @since 2.1.2
	 *
	 * @var string
	 */
	const MIN_WC_VERSION = '8.8';

	/**
	 * Oldest Pro that supports this version's features. The release script
	 * sets it to the released version; until then every version passes,
	 * because version_compare() ranks a word below any number.
	 *
	 * @since 3.1.0
	 *
	 * @var string
	 */
	const MIN_PRO_VERSION = '3.1.0';

	/**
	 * Constructor of Bootstrap class.
	 */
	private function __construct() {
		$this->tracker = new Tracker();
		add_action( 'woocommerce_loaded', [ $this, 'on_wc_loaded' ] );
		add_action( 'admin_notices', [ $this, 'show_notice_if_wc_is_not_active' ] );
		add_action( 'admin_notices', [ $this, 'show_notice_if_wc_below_minimum' ] );
		add_action( 'admin_notices', [ $this, 'show_notice_if_pro_outdated' ] );
	}

	/**
	 * Ask to update Pro when it's older than this version supports. Everything
	 * else keeps working.
	 *
	 * @since 3.1.0
	 *
	 * @return void
	 */
	public function show_notice_if_pro_outdated(): void {
		if ( ! defined( 'STOREGROWTH_PRO_FILE' ) || ! current_user_can( 'update_plugins' ) ) {
			return;
		}

		$data = get_file_data( STOREGROWTH_PRO_FILE, [ 'version' => 'Version' ] );

		if ( version_compare( (string) $data['version'], self::MIN_PRO_VERSION, '>=' ) ) {
			return;
		}

		printf(
			'<div class="notice notice-warning"><p>%1$s <a href="%2$s">%3$s</a></p></div>',
			esc_html(
				sprintf(
					// translators: 1: required StoreGrowth Pro version, 2: installed StoreGrowth Pro version.
					__( 'This version of StoreGrowth needs StoreGrowth Pro %1$s or newer for its newest features. You are running %2$s.', 'storegrowth-sales-booster' ),
					self::MIN_PRO_VERSION,
					$data['version']
				)
			),
			esc_url( admin_url( 'plugins.php' ) ),
			esc_html__( 'Update StoreGrowth Pro', 'storegrowth-sales-booster' )
		);
	}

	public function show_notice_if_wc_is_not_active(): void {
		if ( function_exists( 'WC' ) ) {
			return;
		}

		$message = sprintf(
			// translators: %s is a placeholder for the WooCommerce plugin link.
			__( 'StoreGrowth requires %s to be installed and active.', 'storegrowth-sales-booster' ),
			'<a href="https://wordpress.org/plugins/woocommerce/">WooCommerce</a>'
		);

		printf( '<div class="%1$s"><p><strong>%2$s</strong></p></div>', esc_attr( 'notice notice-error' ), wp_kses_post( $message ) );
	}

	/**
	 * Warn, without disabling anything, when WooCommerce is older than the
	 * supported floor.
	 *
	 * @since 2.1.2
	 *
	 * @return void
	 */
	public function show_notice_if_wc_below_minimum(): void {
		if ( ! defined( 'WC_VERSION' ) || version_compare( WC_VERSION, self::MIN_WC_VERSION, '>=' ) ) {
			return;
		}

		$message = sprintf(
			// translators: 1: required WooCommerce version, 2: active WooCommerce version.
			__( 'StoreGrowth is built for WooCommerce %1$s or newer. You are running %2$s; please update WooCommerce for full compatibility.', 'storegrowth-sales-booster' ),
			esc_html( self::MIN_WC_VERSION ),
			esc_html( WC_VERSION )
		);

		printf( '<div class="%1$s"><p><strong>%2$s</strong></p></div>', esc_attr( 'notice notice-warning' ), wp_kses_post( $message ) );
	}

	public function on_wc_loaded(): void {

		do_action( 'storegrowth_before_load' );

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

		// Include integration classes.
		$this->load_integration_classes();

		do_action( 'storegrowth_loaded' );
	}

	/**
	 * Register hooks.
	 *
	 * @return void
	 */
	public function register_hooks(): void {
        add_action( 'rest_api_init', [ $this, 'register_rest_routes' ] );

		if ( $this->get_container()->has( HookRegistry::class ) ) {

			$hook_registry_list = $this->get_container()->get( HookRegistry::class );

			foreach ( $hook_registry_list as $hook_registry ) {
				if ( method_exists( $hook_registry, 'register_hooks' ) ) {
					$hook_registry->register_hooks();
				}
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
	 * @since 2.0.0
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
	 * @since 2.0.0
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

	/**
	 * Load integration classes.
	 *
	 * @since 1.12.0
	 */
	private function load_integration_classes() {
	}

	/**
	 * Check if the pro plugin is active.
	 *
	 * @return boolean
	 */
	public function has_pro(): bool {
		return apply_filters( 'storegrowth_pro_is_active', false );
	}
}
