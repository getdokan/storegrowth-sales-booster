(function ($) {
  // Check if spsgLocalizedData is defined and not empty

  if (typeof spsg_fnb_data !== "undefined") {
    let banner_device_view = spsg_fnb_data.banner_device_view;
    let bar_position = spsg_fnb_data.bar_position;
    let banner_delay = spsg_fnb_data.banner_delay;
    let scroll_banner_delay = spsg_fnb_data.scroll_banner_delay;
    let banner_trigger = spsg_fnb_data.banner_trigger;
    let banner_height = spsg_fnb_data.banner_height;
    let button_view = spsg_fnb_data.button_view;
    let countdown_start_date = spsg_fnb_data.countdown_start_date;
    let countdown_end_date = spsg_fnb_data.countdown_end_date;
    let coupon_code = spsg_fnb_data?.cupon_code?.toUpperCase();
    let body_top_padding = parseInt(banner_height) + 10;
    const fn_banner_hidden_time = localStorage.getItem("fn_banner_hidden_time");

    const now = Date.now();
    const scrollThreshold = banner_height;

    const addClassToBodyToHandleBannerVisibility = () => {
      document.body.classList.add("show_floating_notification_bar");
    };

    const removeClassToBodyToHandleBannerVisibility = () => {
      document.body.classList.remove("show_floating_notification_bar");
    };

    // Remove the padding
    const paddingRemoverBody = () => {
      return (document.body.style.paddingTop = "0px");
    };

    // Add the padding
    const paddingAdderBody = () => {
      document.body.classList.add("body-padding-transition");
      if('top'===bar_position){
        if(isMobileDevice){
          let offsetHeight = $('.spsg-floating-notification-bar-wrapper').height();
          return (document.body.style.paddingTop = `${offsetHeight+10}px`);
        }
        return (document.body.style.paddingTop = `${body_top_padding}px`);
      }
    };

    const bannerShow = () => {
      if (!bannerExists()) {
        return;
      }
      $(".spsg-floating-notification-bar-wrapper").fadeIn(1000);
      paddingAdderBody();
      updateBannerPosition();
    };

    const updateBannerPosition = () => {
      let enableShippingBanner = spsg_fnb_data?.enable_shipping_banner,
        shippingBannerPosition = spsg_fnb_data?.shipping_banner_position,
        pdBannerHiddenTime = localStorage.getItem( 'banner_hidden_time' ),
        isPDBannerVisible = ! pdBannerHiddenTime || parseInt( pdBannerHiddenTime ) < now;

      if ( enableShippingBanner && isPDBannerVisible && 'top' === shippingBannerPosition ) {
        let shippingBannerHeight = spsg_fnb_data?.shipping_banner_height,
          offset = document.body.classList.contains( 'admin-bar' ) ? 32 : 0;
        $( '.spsg-floating-notification-bar-wrapper' ).css({
          top: `${ parseInt( shippingBannerHeight ) + offset }px`,
        });
      }
    }

    const bannerHide = () => {
      $(".spsg-floating-notification-bar-wrapper").hide();
      paddingRemoverBody();
    };
    const bannerExists = () => {
      return $(".spsg-floating-notification-bar-wrapper").length > 0;
    };

    function isMobileDevice() {
      // You can define your own criteria here, such as screen width
      // For example, consider devices with a screen width less than 768px as "mobile"
      return window.innerWidth <= 768;
    }

    $(document).ready(function () {
      // Check if the class exists in the DOM
      if (!bannerExists()) {
        paddingRemoverBody();
      }
    });

    // Banner device Visibility Controlling.
    $(document).ready(function () {
      const isMobile = isMobileDevice();
      const shouldHideMobile =
        banner_device_view.includes("banner-show-mobile") && isMobile;
      const shouldHideDesktop =
        banner_device_view.includes("banner-show-desktop") && !isMobile;

      if (!shouldHideMobile && !shouldHideDesktop) {
        $(".spsg-floating-notification-bar-wrapper").remove();
        paddingRemoverBody();
      } else {
        if (!fn_banner_hidden_time || parseInt(fn_banner_hidden_time) < now) {
          // Banner Triggering delayer.
          if (banner_trigger === "after-few-seconds") {
            bannerHide();
            setTimeout(function () {
              bannerShow();
            }, banner_delay * 1000);
          } else {
            bannerHide();
            $(window).on("scroll", function () {
              if ($(window).scrollTop() > scrollThreshold) {
                $(window).off("scroll");
                setTimeout(function () {
                  bannerShow();
                }, scroll_banner_delay * 1000);
              }
            });
          }
        }
      }
    });

    // Banner Remove with the
    $(document).ready(function () {
      if (!fn_banner_hidden_time || parseInt(fn_banner_hidden_time) < now) {
        addClassToBodyToHandleBannerVisibility();
      } else {
        removeClassToBodyToHandleBannerVisibility();
      }

      $(document).on(
        "click",
        ".spsg-floating-notification-bar-remove",
        function () {
          const slideDirection = bar_position !== 'top' ? 'translateY(500%)' : 'translateY(-500%)';
          $('.spsg-floating-notification-bar-wrapper').css('transform', slideDirection);
          paddingRemoverBody();
          setTimeout(removeClassToBodyToHandleBannerVisibility, 500);
          localStorage.setItem("fn_banner_hidden_time", now + 10 * 60 * 1000);
        }
      );

      // Handle WooCommerce AJAX add to cart
      $( document.body ).on( 'added_to_cart', function() {
        const offset = document.body.classList.contains( 'admin-bar' ) ? 32 : 0;
        $( '.spsg-floating-notification-bar-wrapper' ).css( { top: `${offset}px` } );
      });
    });

    // Cupon Code Functionality
    $(document).ready(function () {
      // Function to handle copying to clipboard
      function copyToClipboard(text) {
        if (navigator.clipboard) {
          navigator.clipboard
            .writeText(text)
            .then(function () {
              console.log("Text successfully copied to clipboard");
            })
            .catch(function (err) {
              console.error("Unable to copy text to clipboard: ", err);
            });
        } else {
          // Fallback to document.execCommand("copy") if Clipboard API is not supported
          var input = document.createElement("input");
          input.value = text;
          document.body.appendChild(input);
          input.select();
          document.execCommand("copy");
          document.body.removeChild(input);
        }
      }

      $(".spsg-coupon-code")
        .on("mouseenter", function () {
          var couponText = $(this).text();
          var tempInput = $("<input>");
          $("body").append(tempInput);
          tempInput.val(couponText).select();
          copyToClipboard(coupon_code);
          tempInput.remove();
          $(this).text("Click to Copy");
        })
        .on("mouseleave", function () {
          // Restore the coupon code text
          $(this).text(coupon_code);
        });

      // Click event to copy to clipboard
      $(".spsg-coupon-code").click(function () {
        // var couponText = $(this).text(); // Get the coupon code text
        copyToClipboard(coupon_code);
        $(this).text("Copied");
      });
    });

    // Button hidden functionality
    $(document).ready(function () {
      const isMobile = isMobileDevice();
      const shouldHideMobile =
        button_view.includes("button-mobile-enable") && isMobile;
      const shouldHideDesktop =
        button_view.includes("button-desktop-enable") && !isMobile;

      if (!shouldHideMobile && !shouldHideDesktop) {
        $(".fn-bar-action-button").remove();
        paddingRemoverBody();
      }
    });

    //Countdown timer
    $(document).ready(function () {
      const startDateString = countdown_start_date + " 00:00:00"; // Replace with your start date string
      const endDateString = countdown_end_date + " 23:59:59"; // Replace with your end date string

      const startDate = new Date(startDateString);
      const endDate = new Date(endDateString);

      const now = new Date();

      if (now >= startDate && now <= endDate) {
        updateCountdown(endDate);

        const countdownInterval = setInterval(function () {
          updateCountdown(endDate);
        }, 1000);
      } else if (now < startDate) {
        //countdown not started yet and the template removed.
        $(".spsg-fn-bar-countdown").remove();
      } else {
        return;
      }

      function updateCountdown(endDate) {
        const timeLeft = endDate - new Date();

        if (timeLeft <= 0) {
          clearInterval(countdownInterval);
          return;
        }

        const seconds = Math.floor((timeLeft / 1000) % 60);
        const minutes = Math.floor((timeLeft / 1000 / 60) % 60);
        const hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));

        $(".spsg-countdown-value.days").text(days.toString().padStart(2, "0"));
        $(".spsg-countdown-value.hours").text(
          hours.toString().padStart(2, "0")
        );
        $(".spsg-countdown-value.minutes").text(
          minutes.toString().padStart(2, "0")
        );
        $(".spsg-countdown-value.seconds").text(
          seconds.toString().padStart(2, "0")
        );
      }
    });
  } else {
    console.lo("banner_device_view is undefined or empty.");
  }
})(jQuery);
