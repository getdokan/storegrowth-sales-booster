<?php

use StorePulse\StoreGrowth\Modules\CountdownTimer\Providers\ServiceProvider;

/**
 * Define The Stock Count Down Template Constant
 */

 if ( ! defined( 'STOREGROWTH_STOCK_COUNTDOWN_TEMPLATES_PATH' ) ) {
	define( 'STOREGROWTH_STOCK_COUNTDOWN_TEMPLATES_PATH', STOREGROWTH_MODULE_DIR . '/countdown-timer/templates/' );
}

storegrowth_get_container()->addServiceProvider( new ServiceProvider() );
