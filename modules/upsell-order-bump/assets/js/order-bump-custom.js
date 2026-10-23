/**
 * Classic checkout Order Bump box: the cart follows the box's last state.
 *
 * One request at a time per bump. Clicks while one runs only change what the
 * shopper wants; when it ends, that is sent again if the cart doesn't match
 * it yet, and the page reloads once it does (quick clicks used to send one
 * request each, all with the state the page was drawn with, adding the bump
 * several times).
 *
 * The state is kept here, by offer, not on the box: the box sits in the
 * checkout's payment section, which WooCommerce redraws on every
 * `update_checkout` (one runs right after the page loads), drawing the box
 * as the cart was then. A redrawn box is ticked as the shopper last left it.
 *
 * @since SPSG_VERSION
 */
( function ( $ ) {
    // Offer key => { wanted, inCart, busy }.
    var offers = {};

    function keyOf( $box ) {
        return $box.data( 'productId' ) + ':' + $box.data( 'variationId' );
    }

    function boxOf( key ) {
        return $( '.spsg-order-bump-checkbox' ).filter( function () {
            return keyOf( $( this ) ) === key;
        } );
    }

    function sync( key ) {
        var offer = offers[ key ];

        if ( offer.busy ) {
            return;
        }

        var wanted = offer.wanted;

        if ( wanted === offer.inCart ) {
            location.reload();
            return;
        }

        var ids = key.split( ':' );

        offer.busy = true;
        $.post( bump_save_url.ajax_url_for_front, {
            action: 'upsell_offer_product_add_to_cart',
            data: {
                offer_product_id: ids[ 0 ],
                offer_variation_id: ids[ 1 ],
                // The handler reads `checked` as "was ticked": remove.
                checked: wanted ? '' : 'checked',
            },
            _ajax_nonce: bump_save_url.ajd_nonce,
        } ).always( function () {
            offer.inCart = wanted;
            offer.busy = false;
            sync( key );
        } );
    }

    $( document ).on( 'change', '.spsg-order-bump-checkbox', function () {
        var $box = $( this );
        var key = keyOf( $box );
        var wanted = $box.is( ':checked' );

        if ( ! offers[ key ] ) {
            // As the page drew it: ticked when the bump is in the cart.
            offers[ key ] = { inCart: ! wanted, busy: false };
        }

        offers[ key ].wanted = wanted;
        sync( key );
    } );

    $( document.body ).on( 'updated_checkout', function () {
        $.each( offers, function ( key, offer ) {
            boxOf( key ).prop( 'checked', offer.wanted );
        } );
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
