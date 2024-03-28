(function ($) {
  "use strict";

  //Variable to set Timeout
  var timeoutId;
  // For flyout.
  let flyToSelector = ".products-block-post-template, .products";
  $(flyToSelector).flyto({
    item: "li.product",
    target: ".wfc-cart-icon .wfc-icon",
    button: ".add_to_cart_button.product_type_simple",
    shake: true,
  });

  function showNotification(message) {
    var $notificationPopup = $(".sgsb-cart-notification-popup");
    $notificationPopup.find(".sgsb-cart-notification-message").text(message);
    $notificationPopup.fadeIn().delay(2500).fadeOut();
  }

  /**
   * Get Cart Contents.
   */
  function getCartContents() {
    $(".sgsb-fly-cart-loader").removeClass("wfc-hide");
    $.ajax({
      url: sgsbFrontend.ajaxUrl,
      method: "POST",
      data: {
        action: "sgsb_fly_cart_frontend",
        _ajax_nonce: sgsbFrontend.nonce,
        method: "get_cart_contents",
      },
      success: sgsbFlyCartSetContents,
    });
  }

  /**
   * Update product quantity.
   */
  function updateProductQuantity(operator) {
    var inputElm = $(this).parent().find("input.qty");
    var inputVal = Number(inputElm.val());
    var newVal = operator === "plus" ? inputVal + 1 : inputVal - 1;

    if (newVal < 1) {
      return;
    }

    // Update input value & trigger the 'input' event.
    inputElm.val(newVal).trigger("input");
  }

  const triggerQuickCartPopup = (targetDom) => {
    jQuery(targetDom).on("click", function (event) {
      event.preventDefault();
      jQuery(".wfc-overlay").removeClass("wfc-hide");
      jQuery(".wfc-widget-sidebar").removeClass("wfc-slide");
      getCartContents();
      setDynamicHeight();
    });
  };

  const triggerAddToQuickCart = () => {
    jQuery(".product").on("click", ".add_to_cart_button", () => {
      setTimeout(() => $(".wfc-open-btn").click(), 2000);
    });
  };

  /**
   * Dynamic Height Width.
   */
  function setDynamicHeight() {
    let wpadminbar = $("#wpadminbar");
    let adminBarHeight = wpadminbar.length ? wpadminbar.height() : 0;
    let elements = $(".theme-twentytwentythree");
    let windowHeight = $(window).innerHeight();
    let windowWidth = $(window).innerWidth();
    let isMobileHeight = windowHeight < 769 ? 80 : 150;
    let isSmallScreen = windowWidth < 426;
    let themeChecker = elements.length > 0 ? 41 : 0;

    let extraHeight =
      sgsbFrontend?.cartLayoutType === "center" ? isMobileHeight : 0;
    let smallScreenDeduction = isSmallScreen? 10 : 31;
    let deductableHeight =
      $(".qc-cart-heading").height() + adminBarHeight + smallScreenDeduction + extraHeight;

    $(".sgsb-widget-shopping-cart-content-wrapper").css(
      "height",
      windowHeight - deductableHeight
    );

    if (isSmallScreen) {
      $(".sgsb-widget-shopping-cart-content-wrapper").css(
        "width",
        windowWidth - themeChecker
      );
    }

    $(".wfc-widget-sidebar").css("margin-top", adminBarHeight);
  }
  $(document).ready(function () {});

  // For sidebar.
  jQuery(document).ready(function () {
    $(window).resize(function () {
      setDynamicHeight();
    });

    triggerQuickCartPopup(".wfc-open-btn");
    jQuery(".wfc-overlay").on("click", function () {
      jQuery(this).addClass("wfc-hide");
      jQuery(".wfc-widget-sidebar").addClass("wfc-slide");
    });
    jQuery(document).on(
      "click",
      ".sgsb-cart-widget-close, .qc-close-nav",
      function (event) {
        event.preventDefault();
        jQuery(".wfc-overlay").addClass("wfc-hide");
        jQuery(".wfc-widget-sidebar").addClass("wfc-slide");
      }
    );
    const { checkoutRedirect, quickCartRedirect, isPro } = sgsbFrontend;
    // If quick cart redirection selected from direct checkout then trigger quick cart for checkout/buy-now button.
    if (isPro && Boolean(checkoutRedirect)) {
      jQuery(".sgsb_buy_now_button, .sgsb_buy_now_button_product_page").on(
        "click",
        function (event) {
          event.preventDefault();
          const productId = jQuery(event?.target).data("id");
          jQuery.ajax({
            url: sgsbFrontend.ajaxUrl,
            type: "POST",
            data: {
              action: "woocommerce_add_to_cart",
              product_id: productId,
            },
            success: (response) => {
              jQuery(".wfc-overlay").removeClass("wfc-hide");
              jQuery(".wfc-widget-sidebar").removeClass("wfc-slide");
              setDynamicHeight();
              openCheckoutPageCallback(sgsbFrontend?.checkoutUrl);
            },
            error: (error) => console.log(error),
          });
        }
      );
    }

    if (document.getElementById("wpadminbar")) {
      jQuery(".wfc-widget-sidebar").css("margin-top", "20px");
    }

    // Handle cart form submit.
    $(document).on("submit", "form.sgsb-woocommerce-cart-form", function(event) {
      event.preventDefault();
      $(".sgsb-fly-cart-loader").removeClass("wfc-hide");
      var formAction = event.target.action;
      var formData = $(this).serialize();
      $.ajax({
          url: formAction,
          method: "POST",
          data: formData,
          success: getCartContents,
          error: function(xhr, status, error) {
              console.error("Error updating cart: " + error);
          }
      });
  });
  
  

    // On plus icon click.
    $(document).on(
      "click",
      ".sgsb-fly-cart-table .product-quantity button.sgsb-plus-icon",
      function () {
        var quantityInput = $(this).siblings(".quantity").find(".qty");
        var maxValue = quantityInput.attr("max");
        var currentValue = parseInt(quantityInput.val());
        if (
          maxValue !== "" &&
          !isNaN(currentValue) &&
          !isNaN(maxValue) &&
          currentValue >= maxValue
        ) {
          showNotification("Stock limit reached");
          return; // Stop further execution if the limit is reached
        }

        updateProductQuantity.bind(this, "plus").call();
      }
    );

    // On minus icon click.
    $(document).on(
      "click",
      ".sgsb-fly-cart-table .product-quantity button.sgsb-minus-icon",
      function () {
        updateProductQuantity.bind(this, "minus").call();
      }
    );

    // Restrict the input of other than numeric amd leading zero
    $(document)
      .on("input", "input.qty", function () {
        $(this).val(function (_, value) {
          return value.replace(/^0*(?!$)/, ""); // Remove leading zeros if not the only character
        });
      })
      .on("keypress", "input.qty", function (e) {
        if (e.which === 48 && this.value === "0") {
          return false; // Prevent input of additional leading zeros
        }
        if (String.fromCharCode(e.keyCode).match(/[^0-9]/g)) {
          return false; // Prevent input of non-numeric characters
        }
      });

    // On input change fire up the submit
    $(document).on("input", "input.qty", function () {
      var inputValue = $(this).val();
      clearTimeout(timeoutId);
      // Set a new timeout to submit the form after 800 milliseconds
      timeoutId = setTimeout(
        function () {
          if (
            inputValue >= 1 &&
            $(this)[0].getAttribute("value") !== inputValue
          ) {
            $("form.sgsb-woocommerce-cart-form").submit();
          } else {
            return;
          }
        }.bind(this),
        100
      );
    });

    // Remove product from cart.
    $(document).on(
      "click",
      "form.sgsb-woocommerce-cart-form a.sgsb-fly-cart-remove",
      function (event) {
        event.preventDefault();
        $(".sgsb-fly-cart-loader").removeClass("wfc-hide");

        $.ajax({
          url: $(this).attr("href"),
          method: "GET",
          success: sgsbFlyCartSetContents,
        });
      }
    );

    function openCheckoutPageCallback(href) {
      // Show loader.
      $(".sgsb-fly-cart-loader").removeClass("wfc-hide");
      $(".sgsb-widget-shopping-cart-content").html("");

      let checkoutFrame = document.createElement("iframe");
      checkoutFrame.classList.add("sgsb-fast-cart-checkout-frame");
      checkoutFrame.style.height = "80vh";

      let url = new URL(href);
      url.searchParams.set("sgsb-checkout", "true");

      checkoutFrame.src = url;
      $(checkoutFrame).on("load", function () {
        const iframeDocument = checkoutFrame?.contentWindow?.document;
        const iframeBody = iframeDocument?.body;
        const ifrmaeStyle = iframeDocument.createElement("style");
        ifrmaeStyle.innerHTML = `
        #wpadminbar,header,.custom-social-proof,footer{
            display:none !important;
        }
        `;
        iframeBody.style.backgroundColor = $(".wfc-widget-sidebar").css(
          "background-color"
        );
        iframeDocument.head.appendChild(ifrmaeStyle);
      });

      checkoutFrame.style.opacity = 0;
      checkoutFrame.onload = () => {
        checkoutFrame.isLoaded = true;
        if (checkoutFrame.isAttached) {
          checkoutFrame.style.opacity = 1;
          // Hide loader.
          $(".sgsb-fly-cart-loader").addClass("wfc-hide");
        }
      };

      checkoutFrame.isAttached = true;

      if (checkoutFrame.isLoaded) {
        checkoutFrame.style.opacity = 1;
        // Hide loader.
        $(".sgsb-fly-cart-loader").addClass("wfc-hide");
      }

      $(".sgsb-widget-shopping-cart-content").html(checkoutFrame);
    }

    // Open checkout page.
    $(document).on(
      "click",
      ".wfc-widget-sidebar a.sgsb-cart-widget-checkout-button",
      function (event) {
        event.preventDefault();

        openCheckoutPageCallback(event.target.href);
      }
    );

    if (Boolean(isPro)) {
      // Pass quick cart data to pro.
      window.qcart = {
        checkoutRedirect,
        quickCartRedirect,
        addToQuickCart: triggerAddToQuickCart,
      };
    }
  });
})(jQuery);

 /**
   * Set Fly Cart Contents.
   */
 function sgsbFlyCartSetContents(response) {
  let parentElement = jQuery(".sgsb-widget-shopping-cart-content");
  parentElement.html(response?.data?.htmlResponse);
  jQuery(".wfc-cart-icon .wfc-cart-countlocation, .wfc-widget-sidebar .wfc-cart-countlocation").html(
    response?.data?.cartCountLocation
  );
  sgsbFlyCartElementClassRemover();
  setTimeout(function () {
    jQuery(".sgsb-fly-cart-loader").addClass("wfc-hide");
  }, 500);

  jQuery(document.body).trigger("wc_fragment_refresh");
}

function sgsbFlyCartElementClassRemover() {
  let parentElement = jQuery(".sgsb-widget-shopping-cart-content");
  let cartCollatoralClass = jQuery(".sgsb-cart-collaterals");
  let cartFormElement = jQuery("form.sgsb-woocommerce-cart-form");

  if (parentElement.length > 0) {
    parentElement
      .find("div.kadence-woo-cart-form-wrap")
      .removeClass("kadence-woo-cart-form-wrap");
  }
  if (cartFormElement.length > 0) {
    cartFormElement.find("div.cart-summary").remove();
    cartFormElement
      .find(".woocommerce-content-box")
      .find("h2")
      .remove()
      .end()
      .removeClass("woocommerce-content-box full-width clearfix");
  }

  if (cartCollatoralClass.length > 0) {
    cartCollatoralClass.find(".shipping-coupon").remove();
    cartCollatoralClass
      .find(".cart_totals")
      .find(".wc-proceed-to-checkout a:not(.sgsb-cart-widget-buttons a)")
      .remove();
  }
}
