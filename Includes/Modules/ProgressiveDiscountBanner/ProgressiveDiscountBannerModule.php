<?php
/**
 * File for Progressive Discount Banner Module class.
 *
 * @package SBFW
 */

namespace STOREGROWTH\SPSB\Modules\ProgressiveDiscountBanner;

use STOREGROWTH\SPSB\Interfaces\ModuleSkeleton;
use STOREGROWTH\SPSB\Traits\Singleton;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Progressive Discount Banner module initiator class.
 */
class ProgressiveDiscountBannerModule implements ModuleSkeleton {

	use Singleton;

	/**
	 * Unique ID for a module.
	 *
	 * @return string
	 */
	public function get_id() {
		return 'progressive-discount-banner';
	}

	/**
	 * Icon for a module.
	 *
	 * @return string
	 */
	public function get_icon() {
		return sgsb_modules_url( 'ProgressiveDiscountBanner/assets/images/free-shipping-bar-icon.svg' );
	}

	/**
	 * Banner for a module.
	 *
	 * @return string
	 */
	public function get_banner() {
		return sgsb_modules_url( 'ProgressiveDiscountBanner/assets/images/free-shipping-bar-module-img.webp' );
	}

	/**
	 * Unique name for a module.
	 *
	 * @return string
	 */
	public function get_name() {
		return 'Free Shipping Rules';
	}

	/**
	 * Description for the module.
	 *
	 * @return string
	 */
	public function get_description() {
		return 'Entice larger orders. Prominently display progress toward free shipping, encouraging customers to add more.';
	}

	/**
	 * Category for a module.
	 *
	 * @return string
	 */
	public function get_module_category() {
		return 'Discount Banner';
	}

	/**
	 * Module activation function.
	 *
	 * @return void
	 */
	public function activate() {
		// TODO: Implement activate() method.
	}

	/**
	 * Module deactivation function.
	 *
	 * @return void
	 */
	public function deactivate() {
		// TODO: Implement deactivate() method.
	}

	/**
	 * Setting Initial Banner Data.
	 *
	 * @return void
	 */
	public function set_initial_banner_data() {
		$flags = get_option( 'sgsb_discount_banner_flags', array() );
		if ( isset( $flags['done_setting_initial_banner_data'] ) ) {
			return;
		}
		$default_data = array(
			'default_banner_text'     => 'Shop more than $100 to get free shipping.',
			'progressive_banner_text' => 'Add more [amount] to get free shipping.',
			'goal_completion_text'    => 'You have successfully acquired free shipping.',
		);
		delete_option( 'sgsb_progressive_discount_banner_settings' );
		$result = update_option( 'sgsb_progressive_discount_banner_settings', $default_data );
		if ( $result ) {
			update_option( 'sgsb_discount_banner_flags', array( 'done_setting_initial_banner_data' => true ) );
		}
	}

	/**
	 * Starting point of the module.
	 *
	 * @return void
	 */
	public function init() {
		$this->set_initial_banner_data();

		Includes\Ajax::instance();
		Includes\CommonHooks::instance();
		Includes\EnqueueScript::instance();
		Includes\WoocommerceDiscount::instance();

		do_action( 'storegrowth_free_shipping_bar_module_init' );
	}
}

// Create object and return.
return ProgressiveDiscountBannerModule::instance();
