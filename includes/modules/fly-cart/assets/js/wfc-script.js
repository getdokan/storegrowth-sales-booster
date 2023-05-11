(function ($) {
  "use strict";

  // For flyout.
  $(".products").flyto({
    item: "li.product",
    target: ".wfc-cart-icon .wfc-icon",
    button: ".product_type_simple.add_to_cart_button",
    shake: true
  });

  /**
   * Set Fly Cart Contents.
   */
  function setCartContents(htmlResponse) {
    $('.storepulse_sales_booster-widget-shopping-cart-content').html(htmlResponse);

    setTimeout( function() {
      $('.storepulse_sales_booster-fly-cart-loader').addClass('wfc-hide');
    }, 500 );

    jQuery(document.body).trigger('wc_fragment_refresh');
  }

  /**
   * Get Cart Contents.
   */
  function getCartContents() {
    $('.storepulse_sales_booster-fly-cart-loader').removeClass('wfc-hide');

    $.ajax({
      url: storepulse_sales_boosterFrontend.ajaxUrl,
      method: "POST",
      data: {
        action: "storepulse_sales_booster_fly_cart_frontend",
        _ajax_nonce: storepulse_sales_boosterFrontend.nonce,
        method: "get_cart_contents",
      },
      success: setCartContents
    });
  }

  /**
   * Update product quantity.
   */
  function updateProductQuantity(operator) {
    var inputElm = $(this).parent().find('input.qty');
    var inputVal = Number(inputElm.val());
    var newVal = operator === 'plus' ? inputVal + 1 : inputVal - 1;

    if (newVal < 1) {
      return;
    }

    // Update input value.
    inputElm.val(newVal);

    // Submit the form.
    $('form.storepulse_sales_booster-woocommerce-cart-form').submit();
  }

  // For sidebar.
  jQuery(document).ready(function () {
    jQuery('.wfc-open-btn').on('click', function () {
      jQuery('.wfc-overlay').removeClass('wfc-hide');
      jQuery('.wfc-widget-sidebar').removeClass('wfc-slide');
      getCartContents();
    });
    jQuery('.wfc-overlay').on('click', function () {
      jQuery(this).addClass('wfc-hide');
      jQuery('.wfc-widget-sidebar').addClass('wfc-slide');
    });
    jQuery(document).on('click', '.storepulse_sales_booster-cart-widget-close', function (event) {
      event.preventDefault();
      jQuery('.wfc-overlay').addClass('wfc-hide');
      jQuery('.wfc-widget-sidebar').addClass('wfc-slide');
    });

    // Handle cart form submit.
    $(document).on(
      'submit',
      'form.storepulse_sales_booster-woocommerce-cart-form',
      function (event) {
        event.preventDefault();
        $('.storepulse_sales_booster-fly-cart-loader').removeClass('wfc-hide');

        $.ajax({
          url: event.target.action,
          method: "POST",
          data: $(this).serialize(),
          success: setCartContents
        });
      }
    );

    // On plus icon click.
    $(document).on(
      'click',
      '.storepulse_sales_booster-fly-cart-table .product-quantity button.storepulse_sales_booster-plus-icon',
      function () {
        updateProductQuantity.bind(this, 'plus').call();
      }
    );

    // On minus icon click.
    $(document).on(
      'click',
      '.storepulse_sales_booster-fly-cart-table .product-quantity button.storepulse_sales_booster-minus-icon',
      function () {
        updateProductQuantity.bind(this, 'minus').call();
      }
    );

    // Remove product from cart.
    $(document).on(
      'click',
      'form.storepulse_sales_booster-woocommerce-cart-form a.storepulse_sales_booster-fly-cart-remove',
      function (event) {
        event.preventDefault();
        $('.storepulse_sales_booster-fly-cart-loader').removeClass('wfc-hide');

        $.ajax({
          url: $(this).attr('href'),
          method: "GET",
          success: setCartContents
        });
      }
    );

    function openCheckoutPageCallback(href) {
      // Show loader.
      $('.storepulse_sales_booster-fly-cart-loader').removeClass('wfc-hide');
      $('.storepulse_sales_booster-widget-shopping-cart-content').html("");

      let checkoutFrame = document.createElement('iframe');
      checkoutFrame.classList.add('storepulse_sales_booster-fast-cart-checkout-frame');
      checkoutFrame.setAttribute('scrolling', 'no');

      window.storepulse_sales_boosterFastCart = {
        updateIframeHeight: function (iframeHeight) {
          checkoutFrame.style.height = ( iframeHeight ) + 'px';
          if ( checkoutFrame.isAttached ) {
              checkoutFrame.style.opacity = 1;
          }
        }
      };

      let url = new URL(href);
      url.searchParams.set('storepulse_sales_booster-checkout', 'true');

      checkoutFrame.src = url;
      checkoutFrame.style.opacity = 0;
      checkoutFrame.onload = () => {
        checkoutFrame.isLoaded = true;
        if (checkoutFrame.isAttached) {
          checkoutFrame.style.opacity = 1;
          // Hide loader.
          $('.storepulse_sales_booster-fly-cart-loader').addClass('wfc-hide');
        }
      };

      checkoutFrame.isAttached = true;

      if (checkoutFrame.isLoaded) {
        checkoutFrame.style.opacity = 1;
        // Hide loader.
        $('.storepulse_sales_booster-fly-cart-loader').addClass('wfc-hide');
      }

      $('.storepulse_sales_booster-widget-shopping-cart-content').html(checkoutFrame);
    }

    // Open checkout page.
    $(document).on(
      'click',
      '.wfc-widget-sidebar a.storepulse_sales_booster-cart-widget-checkout-button',
      function (event) {
        event.preventDefault();

        openCheckoutPageCallback(event.target.href);
      }
    );
  });
})(jQuery);
