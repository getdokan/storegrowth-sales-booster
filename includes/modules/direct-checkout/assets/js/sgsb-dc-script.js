(function ($) {
  "use strict";

  const directCheckOut = {
    init: function () {
      $( '.product' ).on( 'click', '.sgsb_buy_now_button, .sgsb_buy_now_button_product_page', this.handleProductDirectCheckout );
    },

    handleProductDirectCheckout: function( event ) {
      event.stopPropagation();
      event.preventDefault();

      // Check quick cart checkout availability first.
      if ( sgsbDcFrontend?.isPro && sgsbDcFrontend?.isQuickCartCheckout ) return;

      const productId = $( event?.target ).data( 'id' ),
        checkOutUrl = event?.target?.href;

      jQuery.ajax({
        url     : wc_add_to_cart_params.ajax_url,
        type    : 'POST',
        data    : {
          'action'     : 'woocommerce_add_to_cart',
          'product_id' : productId,
        },
        success : ( response ) => {
          if ( response?.cart_hash ) {
            window.location = checkOutUrl;
          }
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
