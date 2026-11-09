/**
 * Redraw the number inside a wc_price() element in the store's format; the
 * currency symbol and its position stay as WooCommerce printed them.
 *
 * @since SPSG_VERSION
 *
 * @param {jQuery} $container Element holding the wc_price() markup.
 * @param {number} amount     New amount.
 */
function setPriceAmount($container, amount) {
  var format = bogo_save_url.price_format;
  var parts = amount.toFixed(format.decimals).split(".");

  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, format.thousand_separator);

  var number = parts.join(format.decimal_separator);

  $container
    .find("bdi")
    .contents()
    .filter(function () {
      return this.nodeType === 3 && /\d/.test(this.nodeValue);
    })
    .each(function () {
      this.nodeValue = this.nodeValue.replace(/\S.*\S|\S/, number);
    });
}

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

        // Collect variation data if the gift product has variation selectors.
        var postData = {
            cart_item_key       : cartItemKey,
            main_product_id     : mainProductId,
            product_link_key    : productLinkKey,
            offer_product_cost  : offerProductCost,
            selected_product_id : selectedProductId,
        };

        var $variationContainer = $( this ).closest('.offer-main-wrap').find('.bogo-gift-variations');
        if ( $variationContainer.length ) {
            var variationId = $variationContainer.find('.bogo-gift-variation-id').val();
            if ( variationId ) {
                postData.variation_id = variationId;
            }

            var variationAttributes = {};
            $variationContainer.find('.bogo-gift-attribute').each(function() {
                var attrName = $( this ).data('attribute');
                var attrValue = $( this ).val();
                if ( attrName && attrValue ) {
                    variationAttributes[ attrName ] = attrValue;
                }
            });

            if ( Object.keys( variationAttributes ).length ) {
                postData.variation_attributes = variationAttributes;
            }
        }

        $.post(
            bogo_save_url.ajax_url_for_front,
            {
                action      : 'update_offer_product',
                _ajax_nonce : bogo_save_url.ajd_nonce,
                data        : postData
            },
            function ( response ) {
                if ( response.success ) {
                    // Optionally, refresh the page to update the cart
                    location.reload();
                } else {
                    var msg = ( response.data && typeof response.data === 'string' )
                        ? response.data
                        : 'Failed to update the product.';
                    alert( msg );
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
                $form.append($('<input>', {
                    type: 'hidden',
                    name: 'bogo_gift_variation_id',
                    class: 'bogo-gift-hidden-field',
                    value: matchingVariation.variation_id
                }));
                $form.append($('<input>', {
                    type: 'hidden',
                    name: 'bogo_gift_product_id',
                    class: 'bogo-gift-hidden-field',
                    value: productId
                }));

                $.each(selectedAttributes, function (key, value) {
                    $form.append($('<input>', {
                        type: 'hidden',
                        name: 'bogo_gift_variation[' + key + ']',
                        class: 'bogo-gift-hidden-field',
                        value: value
                    }));
                });

                // Update price display if variation has a different price
                var $priceContainer = $container.closest('.offer-main-wrap').find('.offer-price');
                if ($priceContainer.length && matchingVariation.display_price !== undefined) {
                    var $offerSpan = $priceContainer.children('span').last();

                    if ($offerSpan.length) {
                        // Calculate offer price based on offer type
                        var variationPrice = parseFloat(matchingVariation.display_price);
                        var $offerWrap = $container.closest('.offer-main-wrap');
                        var discountPercent = $offerWrap.data('discount-amount');
                        var offerType = $offerWrap.data('offer-type');
                        var formattedPrice;

                        if (offerType === 'discount' && discountPercent) {
                            formattedPrice = Math.max(variationPrice - (variationPrice * (parseFloat(discountPercent) / 100)), 0);
                        } else {
                            formattedPrice = 0;
                        }

                        setPriceAmount($offerSpan, formattedPrice);

                        // Also update the regular/strikethrough price
                        var $regularSpan = $priceContainer.children('span').first();
                        if ($regularSpan.length && $regularSpan.css('text-decoration').indexOf('line-through') !== -1) {
                            setPriceAmount($regularSpan, variationPrice);
                        }
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
