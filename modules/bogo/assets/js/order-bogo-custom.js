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
            offerProductCost = $( this ).data( 'offer-product-cost' ),
            cartItemKey = $( this ).data( 'item-key' );

        $.post(
            bogo_save_url.ajax_url_for_front,
            {
                action      : 'update_offer_product',
                _ajax_nonce : bogo_save_url.ajd_nonce,
                data        : {
                    cart_item_key       : cartItemKey,
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

    const disableOfferProductActions = () => {
        // Make disabled the offered product from cart page.
        $( '.sgsb-bogo-offer-applied' ).each( function() {
            $( this ).find( 'input.qty' ).prop( 'disabled', true ).prop( 'readonly', true );
        });

        // Make disabled the offered product remove option.
        $( '.sgsb-disable-bogo-offer-removed-option' ).each( function() {
            $( this ).find( '.remove' ).remove();
        });
    }

    // Disable offer product quantity & remove options as per settings.
    disableOfferProductActions();

    // Re-apply when any AJAX request completes.
    $(document).ajaxComplete(function() {
        disableOfferProductActions();
    });

    //Modal Controller
    $(document).ready(function () {
        var showModalButton = $(".custom-choose-product");
        var closeModalButton = $(".custom-close-modal, #overlay");
        var modal = "#product-selection-modal, #overlay";

        showModalButton.click(function (event) {
            event.preventDefault();
            var modalContent = $(this).closest('.product-name').find(modal);
            modalContent.addClass("fade-in").show();
        });
    
        closeModalButton.click(function (event) {
            event.preventDefault();
            var modalContent = $(this).closest('.product-name').find(modal);
            modalContent.removeClass("fade-in").addClass("fade-out");
            setTimeout(function () {
                modalContent.hide().removeClass("fade-out");
            }, 300);
        });
    });
    
    

})(jQuery);
