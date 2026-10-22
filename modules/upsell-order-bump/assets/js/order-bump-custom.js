/**
 * Classic checkout Order Bump box: the cart follows the box's last state.
 *
 * One request at a time. Clicks while one runs only change the box; when it
 * ends, the box's state is sent again if the cart doesn't match it yet, and
 * the page reloads once it does (quick clicks used to send one request each,
 * all with the state the page was drawn with, adding the bump several times).
 *
 * @since SPSG_VERSION
 */
( function ( $ ) {
    var busy = false;

    function sync( $box ) {
        if ( busy ) {
            return;
        }

        var wanted = $box.is( ':checked' );
        var inCart = $box.data( 'spsgInCart' );

        if ( undefined === inCart ) {
            // As the page drew it: ticked when the bump is in the cart.
            inCart = ! wanted;
        }

        if ( wanted === inCart ) {
            location.reload();
            return;
        }

        busy = true;
        $.post( bump_save_url.ajax_url_for_front, {
            action: 'upsell_offer_product_add_to_cart',
            data: {
                offer_product_id: $box.data( 'productId' ),
                offer_variation_id: $box.data( 'variationId' ),
                // The handler reads `checked` as "was ticked": remove.
                checked: wanted ? '' : 'checked',
            },
            _ajax_nonce: bump_save_url.ajd_nonce,
        } ).always( function () {
            $box.data( 'spsgInCart', wanted );
            busy = false;
            sync( $box );
        } );
    }

    $( document ).on( 'change', '.spsg-order-bump-checkbox', function () {
        sync( $( this ) );
    } );
} )( jQuery );

/**
 * Add or remove a bump, as the box's inline handler did before 3.0.0.
 * Kept for theme copies of the bump template that still call it.
 *
 * @param {number} product_id   Offer product (a variation's parent).
 * @param {number} variation_id Offer variation, or 0.
 * @param {string} check_status `checked` to remove, else add.
 * @param {string} offer_price  Unused (the server prices the bump).
 */
function extraProducts( product_id, variation_id, check_status, offer_price ) {
    var $ = jQuery;
    var passData = {
        offer_product_id: product_id,
        offer_variation_id: variation_id,
        checked: check_status,
        bump_price: offer_price,
    };
    $.post( bump_save_url.ajax_url_for_front, {
        action: 'upsell_offer_product_add_to_cart',
        data: passData,
        _ajax_nonce: bump_save_url.ajd_nonce,
    }, function () {
        location.reload();
    } );
}
