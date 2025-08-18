<?php
/**
 * File for QuickViewModule class.
 *
 * @package SBFW
 */

namespace STOREGROWTH\SPSB\Modules\QuickView;

use STOREGROWTH\SPSB\BaseModule;
use STOREGROWTH\SPSB\Modules\QuickView\Providers\BootstrapServiceProvider;
use STOREGROWTH\SPSB\Helper as PluginHelper;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * `Stock Bar` module initiator class.
 */
class QuickViewModule extends BaseModule {

	protected $icon = 'quickview-icon-blue';

	/**
	 * Unique ID for a module.
	 *
	 * @return string
	 */
	public static function get_id(): string {
		return 'quick-view';
	}

	/**
	 * Icon for a module.
	 *
	 * @return string
	 */
	public function get_icon(): string {
		return PluginHelper::get_modules_url( 'quick-view/assets/images/quickview-icon-blue.svg' );
	}

	/**
	 * Banner for a module.
	 *
	 * @return string
	 */
	public function get_banner(): string {
		return PluginHelper::get_modules_url( 'quick-view/assets/images/quick-view-thumbnail.png' );
	}

	/**
	 * Unique name for a module.
	 *
	 * @return string
	 */
	public function get_name(): string {
		return 'Quick View';
	}

	/**
	 * Description for the module.
	 *
	 * @return string
	 */
	public function get_description(): string {
		return 'Explore product details instantly. Get a sneak peek of product photos, descriptions, and pricing at a glance - all from your shop page.';
	}

	/**
	 * Category for a module.
	 *
	 * @return string
	 */
	public function get_module_category(): string {
		return 'Quick View';
	}

	/**
	 * Module activation method.
	 *
	 * @return bool
	 */
	public function activate(): bool {
		$activated = parent::activate();

		return $activated;
	}

	/**
	 * Module deactivation method.
	 *
	 * @return bool
	 */
	public function deactivate(): bool {
		$deactivated = parent::deactivate();

		return $deactivated;
	}

	/**
	 * Starting point of the module.
	 *
	 * @return void
	 */
	public function boot(): void {
		storegrowth_get_container()->addServiceProvider( new BootstrapServiceProvider() );

		/**
		 * Module initialized.
		 *
		 * @since 1.0.0
		 */
		do_action( 'storegrowth_quick_view_module_init' );
	}
}