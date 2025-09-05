<?php

namespace StorePulse\StoreGrowth\Modules\ProgressiveDiscountBanner\Providers;

use StorePulse\StoreGrowth\DependencyManagement\BootableServiceProvider;
use StorePulse\StoreGrowth\Modules\ProgressiveDiscountBanner\Ajax;
use StorePulse\StoreGrowth\Modules\ProgressiveDiscountBanner\CommonHooks;
use StorePulse\StoreGrowth\Modules\ProgressiveDiscountBanner\EnqueueScript;
use StorePulse\StoreGrowth\Modules\ProgressiveDiscountBanner\WoocommerceDiscount;

/**
 * BootstrapServiceProvider for the module.
 *
 * Registers and boots supporting services for the module.
 *
 * @since 2.0.0
 *
 * @package StorePulse\StoreGrowth\Modules\CountdownTimer\Providers
 */
class BootstrapServiceProvider extends BootableServiceProvider {

    /**
     * List of services provided by this provider.
     *
     * @since 2.0.0
     *
     * @var array<class-string>
     */
    protected $services = [
        EnqueueScript::class,
        CommonHooks::class,
        Ajax::class,
        WoocommerceDiscount::class,
    ];

    /**
     * Boot the service provider and supporting services.
     *
     * @since 2.0.0
     *
     * @return void
     */
    public function boot(): void {
	    $this->set_initial_banner_data();

        foreach ( $this->services as $service ) {
            $this->share_with_implements_tags( $service );
        }
    }

    /**
     * Register the service provider.
     *
     * @since 2.0.0
     *
     * @return void
     */
    public function register(): void {

    }

	/**
	 * Setting Initial Banner Data.
	 *
	 * @return void
	 */
	public function set_initial_banner_data() {
		$flags = \StorePulse\StoreGrowth\Helper::get_settings( 'spsg_discount_banner_flags', array() );
		if ( isset( $flags['done_setting_initial_banner_data'] ) ) {
			return;
		}
		$default_data = array(
			'default_banner_text'     => 'Shop more than $100 to get free shipping.',
			'progressive_banner_text' => 'Add more [amount] to get free shipping.',
			'goal_completion_text'    => 'You have successfully acquired free shipping.',
		);
		delete_option( 'spsg_progressive_discount_banner_settings' );
		$result = update_option( 'spsg_progressive_discount_banner_settings', $default_data );
		if ( $result ) {
			update_option( 'spsg_discount_banner_flags', array( 'done_setting_initial_banner_data' => true ) );
		}
	}
}
