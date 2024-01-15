(function ($) {
  // Check if sgsbLocalizedData is defined and not empty

  if (typeof sgsb_fnb_data !== "undefined") {
    let banner_device_view = sgsb_fnb_data.banner_device_view;
    let bar_position = sgsb_fnb_data.bar_position;
    let banner_delay = sgsb_fnb_data.banner_delay;
    let scroll_banner_delay = sgsb_fnb_data.scroll_banner_delay;
    let banner_trigger = sgsb_fnb_data.banner_trigger;
    let banner_height = sgsb_fnb_data.banner_height;
    let button_view = sgsb_fnb_data.button_view;
    let countdown_start_date = sgsb_fnb_data.countdown_start_date;
    let countdown_end_date = sgsb_fnb_data.countdown_end_date;
    let coupon_code = sgsb_fnb_data?.cupon_code?.toUpperCase();
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
          let offsetHeight = $('.sgsb-floating-notification-bar-wrapper').height();
          return (document.body.style.paddingTop = `${offsetHeight+10}px`);
        }
        return (document.body.style.paddingTop = `${body_top_padding}px`);
      }
    };

    const bannerShow = () => {
      $(".sgsb-floating-notification-bar-wrapper").fadeIn(1000);
      paddingAdderBody();
    };

    const bannerHide = () => {
      $(".sgsb-floating-notification-bar-wrapper").hide();
      paddingRemoverBody();
    };
    const bannerExists = () => {
      $(".sgsb-floating-notification-bar-wrapper").length === 0;
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
        $(".sgsb-floating-notification-bar-wrapper").remove();
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
        ".sgsb-floating-notification-bar-remove",
        function () {
          $(".sgsb-floating-notification-bar-wrapper").css(
            "transform",
            "translateY(-200%)"
          );
          paddingRemoverBody();
          setTimeout(removeClassToBodyToHandleBannerVisibility, 500);
          localStorage.setItem("fn_banner_hidden_time", now + 10 * 60 * 1000);
        }
      );
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

      $(".sgsb-coupon-code")
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
      $(".sgsb-coupon-code").click(function () {
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
        $(".sgsb-fn-bar-countdown").remove();
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

        $(".sgsb-countdown-value.days").text(days.toString().padStart(2, "0"));
        $(".sgsb-countdown-value.hours").text(
          hours.toString().padStart(2, "0")
        );
        $(".sgsb-countdown-value.minutes").text(
          minutes.toString().padStart(2, "0")
        );
        $(".sgsb-countdown-value.seconds").text(
          seconds.toString().padStart(2, "0")
        );
      }
    });
  } else {
    console.lo("banner_device_view is undefined or empty.");
  }
})(jQuery);
