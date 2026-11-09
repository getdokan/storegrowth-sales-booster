<?php
/**
 * File for the Smart Coupons module class.
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Modules\SmartCoupons;

use StorePulse\StoreGrowth\BaseModule;
use StorePulse\StoreGrowth\Helper as PluginHelper;
use StorePulse\StoreGrowth\Modules\SmartCoupons\Providers\BootstrapServiceProvider;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Smart Coupons: automatic, code and link coupons, all real WooCommerce
 * coupons, that compete with StoreGrowth's other deals (ADR-014).
 *
 * @since SPSG_VERSION
 */
class SmartCouponsModule extends BaseModule {

	/**
	 * Module id.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return string
	 */
	public static function get_id(): string {
		return 'smart-coupons';
	}

	/**
	 * Module icon URL.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return string
	 */
	public function get_icon(): string {
		return PluginHelper::get_modules_url( 'smart-coupons/assets/images/smart-coupons.svg' );
	}

	/**
	 * Module banner image URL.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return string
	 */
	public function get_banner(): string {
		return PluginHelper::get_modules_url( 'smart-coupons/assets/images/smart-coupons.svg' );
	}

	/**
	 * Module name.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return string
	 */
	public function get_name(): string {
		return __( 'Smart Coupons', 'storegrowth-sales-booster' );
	}

	/**
	 * Module description.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return string
	 */
	public function get_description(): string {
		return __( 'Automatic, code and link coupons that always leave the shopper with the better deal.', 'storegrowth-sales-booster' );
	}

	/**
	 * Module category.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return string
	 */
	public function get_module_category(): string {
		return __( 'Sales', 'storegrowth-sales-booster' );
	}

	/**
	 * The module's runtime services.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return BootstrapServiceProvider
	 */
	protected function get_bootstrap_service_provider(): BootstrapServiceProvider {
		return new BootstrapServiceProvider();
	}
}
