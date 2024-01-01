function extraProducts(product_id, check_status, offer_price) {
  var $ = jQuery;
  var passData = {
    offer_product_id: product_id,
    checked: check_status,
    bogo_price: offer_price,
  };
  $.post(
    bogo_save_url.ajax_url_for_front,
    {
      action: "offer_product_add_to_cart",
      data: passData,
      _ajax_nonce: bogo_save_url.ajd_nonce,
    },
    function (data) {
      location.reload();
    }
  );
}

(function ($) {
    $('.choosen-offer-product').on('click', function() {
        const selectedProductId = $( this ).data( 'product-id' ),
            productLinkKey = $( this ).data( 'product-link-key' ),
            mainProductId = $( this ).data( 'main-product-id' ),
            offerProductCost = $( this ).data( 'offer-product-cost' );

        $.post(
            bogo_save_url.ajax_url_for_front,
            {
                action      : 'update_offer_product',
                _ajax_nonce : bogo_save_url.ajd_nonce,
                data        : {
                    main_product_id     : mainProductId,
                    product_link_key    : productLinkKey,
                    offer_product_cost  : offerProductCost,
                    selected_product_id : selectedProductId,
                }
            },
            function ( response ) {
                if ( response.success ) {
                    // Optionally, refresh the page to update the cart
                    location.reload();
                } else {
                    alert('Failed to update the product.');
                }
            }
        );
    });
})(jQuery);
