<?php

use StorePulse\StoreGrowth\Modules\ProgressiveDiscountBanner\Providers\ServiceProvider;

/**
 * Define The Free Shipping Bar Template Constant
 */

 if ( ! defined( 'FREE_SHIPPING_BAR_TEMPLATES_PATH' ) ) {
	define( 'FREE_SHIPPING_BAR_TEMPLATES_PATH', STOREGROWTH_MODULE_DIR . '/progressive-discount-banner/templates/' );
}

storegrowth_get_container()->addServiceProvider( new ServiceProvider() );
