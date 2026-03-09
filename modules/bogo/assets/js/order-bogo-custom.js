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
        $( '.spsg-bogo-offer-applied' ).each( function() {
            $( this ).find( 'input.qty' ).prop( 'disabled', true ).prop( 'readonly', true );
        });

        // Make disabled the offered product remove option.
        $( '.spsg-disable-bogo-offer-removed-option' ).each( function() {
            $( this ).find( '.remove' ).remove();
        });
    }

    // Disable offer product quantity & remove options as per settings.
    disableOfferProductActions();

    // Re-apply when any AJAX request completes.
    $(document).ajaxComplete(function() {
        disableOfferProductActions();
    });

    // BOGO Gift Variation Selector
    function findMatchingVariation(variations, selectedAttributes) {
        for (var i = 0; i < variations.length; i++) {
            var variation = variations[i];
            var match = true;

            for (var attrName in selectedAttributes) {
                if (!selectedAttributes.hasOwnProperty(attrName)) continue;
                var variationAttr = variation.attributes[attrName];
                // Empty string in variation attributes means "any value"
                if (variationAttr !== '' && variationAttr !== selectedAttributes[attrName]) {
                    match = false;
                    break;
                }
            }

            if (match && variation.is_purchasable && variation.is_in_stock) {
                return variation;
            }
        }
        return null;
    }

    $('.bogo-gift-variations').on('change', '.bogo-gift-attribute', function () {
        var $container = $(this).closest('.bogo-gift-variations');
        var productId = $container.data('product-id');
        var variationsData = [];

        try {
            variationsData = JSON.parse($container.find('.bogo-gift-variations-data').text());
        } catch (e) {
            return;
        }

        var selectedAttributes = {};
        var allSelected = true;

        $container.find('.bogo-gift-attribute').each(function () {
            var attrName = $(this).data('attribute');
            var attrValue = $(this).val();
            selectedAttributes[attrName] = attrValue;
            if (!attrValue) {
                allSelected = false;
            }
        });

        // Remove old hidden fields from the add-to-cart form
        $('form.cart').find('.bogo-gift-hidden-field').remove();

        if (allSelected) {
            var matchingVariation = findMatchingVariation(variationsData, selectedAttributes);
            if (matchingVariation) {
                $container.find('.bogo-gift-variation-id').val(matchingVariation.variation_id);

                // Inject hidden fields into the WooCommerce add-to-cart form
                var $form = $('form.cart');
                $form.append('<input type="hidden" name="bogo_gift_variation_id" class="bogo-gift-hidden-field" value="' + matchingVariation.variation_id + '" />');
                $form.append('<input type="hidden" name="bogo_gift_product_id" class="bogo-gift-hidden-field" value="' + productId + '" />');

                $.each(selectedAttributes, function (key, value) {
                    $form.append('<input type="hidden" name="bogo_gift_variation[' + key + ']" class="bogo-gift-hidden-field" value="' + value + '" />');
                });

                // Update price display if variation has a different price
                var $priceContainer = $container.closest('.offer-main-wrap').find('.offer-price');
                if ($priceContainer.length && matchingVariation.display_price !== undefined) {
                    var currencySymbol = $priceContainer.find('span:last').text().replace(/[0-9.,]/g, '').trim();
                    if (!currencySymbol) {
                        currencySymbol = '';
                    }
                    // Only update the offer price span (last span)
                    var formattedPrice = parseFloat(0).toFixed(2);
                    var $offerSpan = $priceContainer.find('span:last');

                    // Check if bogo is free or discounted
                    if ($offerSpan.length) {
                        var currentText = $offerSpan.text();
                        // Extract currency symbol from existing text
                        var sym = currentText.replace(/[0-9.,\s]/g, '');
                        $offerSpan.text(sym + formattedPrice);
                    }
                }
            } else {
                $container.find('.bogo-gift-variation-id').val('');
            }
        } else {
            $container.find('.bogo-gift-variation-id').val('');
        }
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
