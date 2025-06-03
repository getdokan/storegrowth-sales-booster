<?php

namespace STOREGROWTH\SPSB\Modules\BoGo\Includes;

use WP_Error;

defined( 'ABSPATH' ) || exit;

/**
 * Bogo Class.
 *
 * @package SBFW
 */
class Bogo {

    /**
     * Post Type for Bogo Offers.
     *
     * @since 1.29.0
     *
     * @var string
     */
    private string $post_type = 'sgsb_bogo';

    /**
     * Create a New Bogo Offer.
     *
     * @since 1.29.0
     *
     * @return int|WP_Error|void Post ID on success, WP_Error on failure
     */
    public function create( array $data ) {
        if ( ! $data ) {
            return new WP_Error( 'missing_data', __( 'No data provided', 'storegrowth-sales-booster-pro' ) );
        }

        $bogo_detail = $this->sanitize_create_bogo_data( $data );

        if ( 0 === $bogo_detail['offer_product_id'] ) {
            $bogo_list = $this->get_items();
            if ( is_array( $bogo_list ) && count( $bogo_list ) >= 2 && ! SGSB_PRO_ACTIVE ) {
                // don't allow creating more than 2 bogos.
                return;
            }

            $args = [
                'post_title'   => $bogo_detail['name_of_order_bogo'],
                'post_status'  => 'publish',
                'post_type'    => $this->post_type,
                'post_excerpt' => maybe_serialize( $bogo_detail ),
                'post_content' => 'Not defined',
            ];

            return wp_insert_post( $args, true );
        } elseif ( ! empty( $bogo_detail['offer_product_id'] ) ) {
            return $this->update( $bogo_detail['offer_product_id'], $bogo_detail );
        }
    }

    /**
     * Get a Single Bogo Offer by ID.
     *
     * @since 1.29.0
     *
     * @param int $id
     *
     * @return array|WP_Error
     */
    public function get_item( int $id ) {
        $bogo = get_post( $id );

        if ( ! $bogo || $bogo->post_type !== $this->post_type ) {
            return new WP_Error( 'not_found', 'Bogo not found' );
        }

        $data       = maybe_unserialize( $bogo->post_excerpt );
        $data['id'] = $bogo->ID;

        return $data;
    }

    /**
     * Get Bogo Offers.
     *
     * @since 1.29.0
     *
     * @param array $args
     *
     * @return array
     */
    public function get_items( array $args = [] ) {
        $default = [
            'post_type'      => $this->post_type,
            'posts_per_page' => -1,
        ];

        $args      = wp_parse_args( $args, $default );
        $bogo_list = get_posts( $args );
        $bogos     = [];

        foreach ( $bogo_list as $bogo ) {
            $post_excerpt       = maybe_unserialize($bogo->post_excerpt);
            $post_excerpt['id'] = $bogo->ID;
            $bogos[]            = $post_excerpt;
        }

        return $bogos;
    }

    /**
     * Update an Existing Bogo Offer.
     *
     * @since 1.29.0
     *
     * @param int   $id
     * @param array $data
     *
     * @return int|WP_Error
     */
    public function update( int $id, array $data ) {
        $args = [
            'ID'           => $id,
            'post_title'   => $data['name_of_order_bogo'] ?? '',
            'post_excerpt' => maybe_serialize( $data ),
        ];

        return wp_update_post( $args, true );
    }

    /**
     * Delete a Bogo Offer.
     *
     * @since 1.29.0
     *
     * @param int $id
     *
     * @return bool|WP_Error
     */
    public function delete( int $id ) {
        $result = wp_delete_post( $id, true );

        if ( ! $result ) {
            return new WP_Error( 'delete_failed', 'Failed to delete Bogo' );
        }

        return true;
    }

    /**
     * Set The Status of a Bogo Offer.
     *
     * @since 1.29.0
     *
     * @param int    $id
     * @param string $status 'yes' or 'no'
     *
     * @return bool|WP_Error
     */
    public function set_status( int $id, string $status ) {
        $bogo = get_post( $id );
        if ( ! $bogo || $bogo->post_type !== $this->post_type ) {
            return new WP_Error( 'not_found', 'Bogo not found' );
        }

        $bogo_settings                = ! empty( $bogo->post_excerpt ) ? maybe_unserialize( $bogo->post_excerpt ) : [];
        $bogo_settings['bogo_status'] = filter_var( $status, FILTER_VALIDATE_BOOLEAN ) ? 'yes' : 'no';
        $bogo->post_excerpt           = maybe_serialize( $bogo_settings );
        $result                       = wp_update_post( $bogo, true ) ;

        if ( is_wp_error( $result ) ) {
            return $result;
        }

        return true;
    }

    /**
     * Sanitize Create Order Bogo Data.
     *
     * @since 1.29.0
     *
     * @param array $data Data to sanitize.
     *
     * @return array
     */
    private function sanitize_create_bogo_data( array $data ) {
        $data['name_of_order_bogo']                 = $data['name_of_order_bogo'] ? sanitize_text_field( $data['name_of_order_bogo'] ) : '';
        $data['target_products']                    = $data['target_products'] ? wc_clean( $data['target_products'] ) : [];
        $data['target_categories']                  = $data['target_categories'] ? wc_clean( $data['target_categories'] ) : [];
        $data['bogo_schedule']                      = ! empty( $data['bogo_schedule'] ) ? wc_clean( $data['bogo_schedule'] ) : [];
        $data['smart_offer']                        = $data['smart_offer'] ? sanitize_text_field( $data['smart_offer'] ) : '';
        $data['get_different_product_field']        = $data['get_different_product_field'] ? intval( $data['get_different_product_field'] ) : 0;
        $data['offer_type']                         = $data['offer_type'] ? sanitize_text_field( $data['offer_type'] ) : '';
        $data['discount_amount']                    = $data['discount_amount'] ? sanitize_text_field( $data['discount_amount'] ) : '';
        $data['box_border_style']                   = $data['box_border_style'] ? sanitize_text_field( $data['box_border_style'] ) : '';
        $data['box_border_color']                   = $data['box_border_color'] ? sanitize_text_field( $data['box_border_color'] ) : '';
        $data['box_top_margin']                     = $data['box_top_margin'] ? sanitize_text_field( $data['box_top_margin'] ) : '';
        $data['box_bottom_margin']                  = $data['box_bottom_margin'] ? sanitize_text_field( $data['box_bottom_margin'] ) : '';
        $data['discount_background_color']          = $data['discount_background_color'] ? sanitize_text_field( $data['discount_background_color'] ) : '';
        $data['discount_text_color']                = $data['discount_text_color'] ? sanitize_text_field( $data['discount_text_color'] ) : '';
        $data['discount_font_size']                 = $data['discount_font_size'] ? sanitize_text_field( $data['discount_font_size'] ) : '';
        $data['product_description_text_color']     = $data['product_description_text_color'] ? sanitize_text_field( $data['product_description_text_color'] ) : '';
        $data['product_description_font_size']      = $data['product_description_font_size'] ? sanitize_text_field( $data['product_description_font_size'] ) : '';
        $data['accept_offer_background_color']      = $data['accept_offer_background_color'] ? sanitize_text_field( $data['accept_offer_background_color'] ) : '';
        $data['accept_offer_text_color']            = $data['accept_offer_text_color'] ? sanitize_text_field( $data['accept_offer_text_color'] ) : '';
        $data['accept_offer_font_size']             = $data['accept_offer_font_size'] ? sanitize_text_field( $data['accept_offer_font_size'] ) : '';
        $data['offer_description_background_color'] = $data['offer_description_background_color'] ? sanitize_text_field( $data['offer_description_background_color'] ) : '';
        $data['offer_description_text_color']       = $data['offer_description_text_color'] ? sanitize_text_field( $data['offer_description_text_color'] ) : '';
        $data['offer_description_font_size']        = $data['offer_description_font_size'] ? sanitize_text_field( $data['offer_description_font_size'] ) : '';
        $data['offer_image_url']                    = $data['offer_image_url'] ? esc_url_raw( $data['offer_image_url'] ) : '';
        $data['offer_product_title']                = $data['offer_product_title'] ? sanitize_text_field( $data['offer_product_title'] ) : '';
        $data['offer_product_id']                   = $data['offer_product_id'] ? intval( $data['offer_product_id'] ) : 0;
        $data['offer_discount_title']               = $data['offer_discount_title'] ? sanitize_text_field( $data['offer_discount_title'] ) : '';
        $data['offer_fixed_price_title']            = $data['offer_fixed_price_title'] ? sanitize_text_field( $data['offer_fixed_price_title'] ) : '';
        $data['product_description']                = $data['product_description'] ? sanitize_text_field( $data['product_description'] ) : '';
        $data['selection_title']                    = $data['selection_title'] ? sanitize_text_field( $data['selection_title'] ) : '';
        $data['offer_description']                  = $data['offer_description'] ? sanitize_text_field( $data['offer_description'] ) : '';
        $data['offer_product_regular_price']        = $data['offer_product_regular_price'] ? sanitize_text_field( $data['offer_product_regular_price'] ) : '';

        return $data;
    }
}
