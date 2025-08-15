<?php
/**
 * File for Progressive Discount Banner Module class.
 *
 * @package SBFW
 */

namespace STOREGROWTH\SPSB\Modules\ProgressiveDiscountBanner;

use STOREGROWTH\SPSB\BaseModule;
use STOREGROWTH\SPSB\Modules\ProgressiveDiscountBanner\Includes\Providers\BootstrapServiceProvider;
use STOREGROWTH\SPSB\Helper as PluginHelper;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Progressive Discount Banner module initiator class.
 */
class ProgressiveDiscountBannerModule extends BaseModule {

	protected $icon = 'free-shipping-bar-icon';

	/**
	 * Unique ID for a module.
	 *
	 * @return string
	 */
	public static function get_id(): string {
		return 'progressive-discount-banner';
	}

	/**
	 * Icon for a module.
	 *
	 * @return string
	 */
	public function get_icon(): string {
		return PluginHelper::get_modules_url( 'progressive-discount-banner/assets/images/free-shipping-bar-icon.svg' );
	}

	/**
	 * Banner for a module.
	 *
	 * @return string
	 */
	public function get_banner(): string {
		return PluginHelper::get_modules_url( 'progressive-discount-banner/assets/images/free-shipping-bar-thumbnail.png' );
	}

	/**
	 * Unique name for a module.
	 *
	 * @return string
	 */
	public function get_name(): string {
		return 'Free Shipping Rules';
	}

	/**
	 * Description for the module.
	 *
	 * @return string
	 */
	public function get_description(): string {
		return 'Entice larger orders. Prominently display progress toward free shipping, encouraging customers to add more.';
	}

	/**
	 * Category for a module.
	 *
	 * @return string
	 */
	public function get_module_category(): string {
		return 'Discount Banner';
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

		do_action( 'storegrowth_free_shipping_bar_module_init' );
	}
}
