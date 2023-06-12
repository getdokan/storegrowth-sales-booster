(function ($) {
  "use strict";

  //Variable to set Timeout
  var timeoutId;

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
    $('.sgsb-widget-shopping-cart-content').html(htmlResponse);

    setTimeout( function() {
      $('.sgsb-fly-cart-loader').addClass('wfc-hide');
    }, 500 );

    jQuery(document.body).trigger('wc_fragment_refresh');
  }

  /**
   * Get Cart Contents.
   */
  function getCartContents() {
    $('.sgsb-fly-cart-loader').removeClass('wfc-hide');
    $.ajax({
      url: sgsbFrontend.ajaxUrl,
      method: "POST",
      data: {
        action: "sgsb_fly_cart_frontend",
        _ajax_nonce: sgsbFrontend.nonce,
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

    //Clear the time out
    clearTimeout(timeoutId)

    // Submit the form.
    timeoutId = setTimeout(function(){
      $('form.sgsb-woocommerce-cart-form').submit();
    },800)
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
    jQuery(document).on('click', '.sgsb-cart-widget-close', function (event) {
      event.preventDefault();
      jQuery('.wfc-overlay').addClass('wfc-hide');
      jQuery('.wfc-widget-sidebar').addClass('wfc-slide');
    });

    // Handle cart form submit.
    $(document).on(
      'submit',
      'form.sgsb-woocommerce-cart-form',
      function (event) {
        event.preventDefault();
        $('.sgsb-fly-cart-loader').removeClass('wfc-hide');

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
      '.sgsb-fly-cart-table .product-quantity button.sgsb-plus-icon',
      function () {
        updateProductQuantity.bind(this, 'plus').call();
      }
    );

    // On minus icon click.
    $(document).on(
      'click',
      '.sgsb-fly-cart-table .product-quantity button.sgsb-minus-icon',
      function () {
        updateProductQuantity.bind(this, 'minus').call();
      }
    );

    // Restrict the input of other than numeric amd leading zero
    $(document).on('input', 'input.qty', function () {
      $(this).val(function (_, value) {
        return value.replace(/^0*(?!$)/, ''); // Remove leading zeros if not the only character
      });
    }).on('keypress', 'input.qty', function (e) {
      if (e.which === 48 && this.value === '0') {
        return false; // Prevent input of additional leading zeros
      }
      if (String.fromCharCode(e.keyCode).match(/[^0-9]/g)) {
        return false; // Prevent input of non-numeric characters
      }
    });
    
     
    
    // On input change fire up the submit 
    $(document).on('input', 'input.qty', function() {
        var inputValue = $(this).val();
        clearTimeout(timeoutId);
    
        // Set a new timeout to submit the form after 800 milliseconds
        timeoutId = setTimeout(function() {
    
        if (inputValue >= 1) {
          $('form.sgsb-woocommerce-cart-form').submit();
        }else{
          return;
        }
      }.bind(this), 800);
    });

    // Remove product from cart.
    $(document).on(
      'click',
      'form.sgsb-woocommerce-cart-form a.sgsb-fly-cart-remove',
      function (event) {
        event.preventDefault();
        $('.sgsb-fly-cart-loader').removeClass('wfc-hide');

        $.ajax({
          url: $(this).attr('href'),
          method: "GET",
          success: setCartContents
        });
      }
    );

    function openCheckoutPageCallback(href) {
      // Show loader.
      $('.sgsb-fly-cart-loader').removeClass('wfc-hide');
      $('.sgsb-widget-shopping-cart-content').html("");

      let checkoutFrame = document.createElement('iframe');
      checkoutFrame.classList.add('sgsb-fast-cart-checkout-frame');
      checkoutFrame.setAttribute('scrolling', 'no');

      window.sgsbFastCart = {
        updateIframeHeight: function (iframeHeight) {
          checkoutFrame.style.height = ( iframeHeight ) + 'px';
          if ( checkoutFrame.isAttached ) {
              checkoutFrame.style.opacity = 1;
          }
        }
      };

      let url = new URL(href);
      url.searchParams.set('sgsb-checkout', 'true');

      checkoutFrame.src = url;
      checkoutFrame.style.opacity = 0;
      checkoutFrame.onload = () => {
        checkoutFrame.isLoaded = true;
        if (checkoutFrame.isAttached) {
          checkoutFrame.style.opacity = 1;
          // Hide loader.
          $('.sgsb-fly-cart-loader').addClass('wfc-hide');
        }
      };

      checkoutFrame.isAttached = true;

      if (checkoutFrame.isLoaded) {
        checkoutFrame.style.opacity = 1;
        // Hide loader.
        $('.sgsb-fly-cart-loader').addClass('wfc-hide');
      }

      $('.sgsb-widget-shopping-cart-content').html(checkoutFrame);
    }

    // Open checkout page.
    $(document).on(
      'click',
      '.wfc-widget-sidebar a.sgsb-cart-widget-checkout-button',
      function (event) {
        event.preventDefault();

        openCheckoutPageCallback(event.target.href);
      }
    );
  });
})(jQuery);
