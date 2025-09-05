<?php

namespace StorePulse\StoreGrowth\Integrations\Dokan\Frontend;

use StorePulse\StoreGrowth\Helper;
use StorePulse\StoreGrowth\Traits\Singleton;
use WC_Product;

/**
 * Frontend Class.
 *
 * @package SBFW
 */
class Frontend {

    use Singleton;

    /**
     * Constructor of Frontend Class.
     *
     * @since 1.12.0
     */
    private function __construct() {
        $this->init_hooks();
    }

    /**
     * Initialize Hooks.
     *
     * @since 1.12.0
     *
     * @return void
     */
    private function init_hooks() {
        add_action( 'spsg_fly_cart_after_single_item_columns', [ $this, 'display_dokan_vendor_info' ] );
    }

    /**
     * Display Dokan vendor info in the fly cart.
     *
     * @since 1.11.1
     *
     * @param WC_Product $product The product object.
     *
     * @return void
     */
    public function display_dokan_vendor_info( WC_Product $product ) {
        $settings              = \StorePulse\StoreGrowth\Helper::get_settings( 'spsg_fly_cart_settings' );
        $is_store_name_visible = Helper::find_option_settings( $settings, 'show_quick_cart_dokan_store_names', true );
        $is_store_link_enabled = Helper::find_option_settings( $settings, 'enable_quick_cart_dokan_store_links', true );

        if ( ! $is_store_name_visible ) {
            return;
        }
        ?>

        <style>
            tr:has(td.dokan-vendor-store-info) {
                position: relative;
                padding-bottom: 35px !important;
            }

            td.dokan-vendor-store-info {
                position: absolute;
                bottom: 0;
                left: 0;
                padding: 0 15px;
                background: transparent !important;
            }

            td.dokan-vendor-store-info span.dokan-vendor-store-name h5 {
                font-size: 14px;
            }

            td.dokan-vendor-store-info span.dokan-vendor-store-name,
            td.dokan-vendor-store-info span.dokan-vendor-store-name a {
                font-weight: 500;
                outline: none;
            }
        </style>

        <td class="dokan-vendor-store-info">
            <?php
            $vendor    = dokan()->vendor->get( get_post( $product->get_id() )->post_author );
            $shop_name = $vendor->get_shop_name();
            $shop_url  = $vendor->get_shop_url();
            ?>
            <h5>
                <?php esc_html_e( 'Vendor: ', 'storegrowth-sales-booster' ); ?>
                <span class="dokan-vendor-store-name">
                    <?php if ( $is_store_link_enabled ) : ?>
                        <a href="<?php echo esc_url( $shop_url ); ?>" target="_blank">
                            <?php echo esc_html( $shop_name ); ?>
                        </a>
                    <?php else : ?>
                        <?php echo esc_html( $shop_name ); ?>
                    <?php endif; ?>
                </span>
            </h5>
        </td>
        <?php
    }
}
