<!-- Modal Structure (example using basic HTML and CSS) -->
<div id="product-selection-modal" style="display:none;">
    <!-- Your modal content goes here -->
    <div class="modal-content">
        <div id="product-list">
            <ul style="margin: 0;">
                <?php
                foreach ( $bogo_settings['get_alternate_products'] as $product_id ) :
                    $product            = wc_get_product( $product_id );
                    $offer_product_cost = 0;
                    if ( $bogo_settings['offer_type'] === 'discount' ) {
                        $offer_product_cost = max( $product->get_price() - ( $product->get_price() * ( $bogo_settings['discount_amount'] / 100 ) ), 0 );
                    }
                    ?>
                    <li>
                        <?php echo $product->get_title(); ?>
                        <a href="#" class="choosen-offer-product"
                            data-product-id="<?php echo esc_attr( $product->get_id() ); ?>"
                            data-offer-product-cost="<?php echo esc_attr( $offer_product_cost ); ?>"
                            data-main-product-id="<?php echo esc_attr( $cart_item['bogo_product_for'] ); ?>"
                            data-product-link-key="<?php echo esc_attr( $cart_item['linked_to_product_key'] )?>">
                            <?php esc_html_e( 'Choose', 'storegrowth-sales-booster' ); ?>
                        </a>
                    </li>
                <?php endforeach; ?>
            </ul>
        </div>
    </div>
</div>
