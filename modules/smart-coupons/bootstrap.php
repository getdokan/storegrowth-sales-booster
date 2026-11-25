<?php
/**
 * Bootstrap file for the Smart Coupons module.
 *
 * @package SBFW
 */

use StorePulse\StoreGrowth\Modules\SmartCoupons\Providers\ServiceProvider;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

storegrowth_get_container()->addServiceProvider( new ServiceProvider() );
