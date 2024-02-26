<?php
/**
 * Displays a modal for choosing alternative products in a Buy One Get One (BOGO) offer.
 *
 * This template is part of the StoreGrowth Sales Booster plugin.
 *
 * @package   StoreGrowth Sales Booster
 * @since     1.1.2
 */

use STOREGROWTH\SPSB\Modules\BoGo\Includes\Helper;

$item_id = $cart_item['product_id'];
if ( ! empty( $cart_item['changed_product_id'] ) ) {
    $product = wc_get_product( $cart_item['bogo_product_for'] );
    $item_id = $product->is_type( 'variable' ) ? wp_get_post_parent_id( $cart_item['bogo_product_for'] ) : $item_id;
}

$offer_products = Helper::sgsb_get_alternate_offer_products( $cart_item['bogo_product_for'], $item_id );

if ( ! empty( $offer_products ) ) : ?>
	<p>
        <a href="#" class="custom-choose-product">
            <?php esc_html_e( 'Choose Product', 'storegrowth-sales-booster' ); ?>
        </a>
    </p>
	<div id="overlay"></div>
	<!-- Modal Structure (example using basic HTML and CSS) -->
	<div id="product-selection-modal" style="display:none;">
		<div class="modal-container-heading">
            <span><?php esc_html_e( 'Choose Product', 'storegrowth-sales-booster' ); ?></span>
        </div>
		<!-- Your modal content goes here -->
		<div class="modal-content">
			<div id="product-list">
				<ul style="margin: 0;">
					<?php
					foreach ( $offer_products as $product_id ) :
						$product            = wc_get_product( $product_id );
						$image_id           = $product->get_image_id();
						$image_url          = wp_get_attachment_image_src( $image_id, 'full' );
						$offer_product_cost = 0;
						if ( ! empty( $bogo_settings['offer_type'] ) && $bogo_settings['offer_type'] === 'discount' ) {
							$offer_product_cost = max( $product->get_price() - ( $product->get_price() * ( $bogo_settings['discount_amount'] / 100 ) ), 0 );
						}
						?>
						<li>
							<div class="alternate-product-container">
							<img src="<?php echo esc_url( $image_url[0] ); ?>" alt="product">
							<div class="altenate-product-heading"><h3><?php echo $product->get_title(); ?></h3>
							<span class="choosen-offer-product"
								data-product-id="<?php echo esc_attr( $product->get_id() ); ?>"
                                data-item-key="<?php echo esc_attr( $cart_item['parent_key'] ); ?>"
                                data-offer-product-cost="<?php echo esc_attr( $offer_product_cost ); ?>"
								data-main-product-id="<?php echo esc_attr( $cart_item['bogo_product_for'] ); ?>"
								data-product-link-key="<?php echo esc_attr( $cart_item['linked_to_product_key'] ); ?>">
								<?php esc_html_e( 'Choose', 'storegrowth-sales-booster' ); ?>
							</span></div>
							</div>
						</li>
					<?php endforeach; ?>
				</ul>
			</div>	
		</div>
		<button class="custom-close-modal">X</button>
	</div>
<?php endif; ?>
