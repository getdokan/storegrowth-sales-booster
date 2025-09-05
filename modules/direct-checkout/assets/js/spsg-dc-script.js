(function ($) {
  "use strict";

  const directCheckOut = {
    init: function () {
      jQuery( '.product' ).on( 'click', '.spsg_buy_now_button, .spsg_buy_now_button_product_page', this.handleProductDirectCheckout );
    },
  
    handleProductDirectCheckout: function( event ) {
      event.stopPropagation();
      event.preventDefault();

        if ( event?.target?.classList.contains('spsg_buy_now_button_disabled') ) {
            return;
        }

      // Check quick cart checkout availability first.
      if ( spsgDcFrontend?.isPro && spsgDcFrontend?.isQuickCartCheckout ) return;
      let productId = jQuery( event?.target ).data( 'id' ),
        checkOutUrl = event?.target?.href;
  
      // Collect data id from product id.
      productId = typeof productId === 'undefined' ? jQuery( event?.target ).data( 'product_id' ) : productId;
  
      jQuery.ajax({
        url     : spsgDcFrontend?.ajax_url,
        type    : 'POST',
        data    : {
          'action'     : 'woocommerce_add_to_cart',
          'product_id' : productId,
        },
        success : ( response ) => {
            console.log( response?.cart_hash );
          // if ( response?.cart_hash ) {
            window.location.href = checkOutUrl;
          // }
        },
        error   : ( error ) => console.log( error )
      });
    },
  };
  
  // For sidebar.
  jQuery(document).ready(function () {
    directCheckOut.init();
  });
})(jQuery);


const spsgDirectChecoutQuick = {
  init: function () {
    jQuery( '.product' ).on( 'click', '.spsg_buy_now_button, .spsg_buy_now_button_product_page', this.handleProductDirectCheckout );
  },

  handleProductDirectCheckout: function( event ) {
    event.stopPropagation();
    event.preventDefault();

    if ( event?.target?.classList.contains('spsg_buy_now_button_disabled') ) {
      return;
    }

    // Check quick cart checkout availability first.
    let productId = jQuery( event?.target ).data( 'id' ),
      checkOutUrl = event?.target?.href;

    // Collect data id from product id.
    productId = typeof productId === 'undefined' ? jQuery( event?.target ).data( 'product_id' ) : productId;

    jQuery.ajax({
      url     : spsgDcFrontend?.ajax_url,
      type    : 'POST',
      data    : {
        'action'     : 'woocommerce_add_to_cart',
        'product_id' : productId,
      },
      success : ( response ) => {
          console.log( response?.cart_hash );
        // if ( response?.cart_hash ) {
          window.location.href = checkOutUrl;
        // }
      },
      error   : ( error ) => console.log( error )
    });
  },
};
