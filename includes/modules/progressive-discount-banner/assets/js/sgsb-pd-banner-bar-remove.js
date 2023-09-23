(function ($) {
  // Check if sgsbLocalizedData is defined and not empty

  if (typeof sgsb_fsb_data !== "undefined") {
    let banner_device_view = sgsb_fsb_data.banner_device_view;
    let banner_delay = sgsb_fsb_data.banner_delay;
    let scroll_banner_delay = sgsb_fsb_data.scroll_banner_delay;
    let banner_trigger = sgsb_fsb_data.banner_trigger;
    let banner_height = sgsb_fsb_data.banner_height;
    let body_top_padding = parseInt(banner_height) + 10;
    const scrollThreshold = banner_height;

    const addClassToBodyToHandleBannerVisibility = () => {
      document.body.classList.add("show_discount_banner");
    };

    const removeClassToBodyToHandleBannerVisibility = () => {
      document.body.classList.remove("show_discount_banner");
    };

    // Remove the padding
    const paddingRemoverBody = () => {
      return (document.body.style.paddingTop = "0px");
    };

    // Add the padding
    const paddingAdderBody = () => {
      return (document.body.style.paddingTop = `${body_top_padding}px`);
    };

    const bannerShow = () => {
      paddingAdderBody();
      $(".sgsb-pd-banner-bar-wrapper").fadeIn(1000);
    };

    const bannerHide = () => {
      $(".sgsb-pd-banner-bar-wrapper").hide();
      paddingRemoverBody();
    };

    function isMobileDevice() {
      // You can define your own criteria here, such as screen width
      // For example, consider devices with a screen width less than 768px as "mobile"
      return window.innerWidth <= 768;
    }

    // Banner device Visibility Controlling.
    $(document).ready(function () {
      const isMobile = isMobileDevice();
      const shouldHideMobile =
        banner_device_view.includes("banner-show-mobile") && isMobile;
      const shouldHideDesktop =
        banner_device_view.includes("banner-show-desktop") && !isMobile;

      if (!shouldHideMobile && !shouldHideDesktop) {
        $(".sgsb-pd-banner-bar-wrapper").remove();
        paddingRemoverBody();
      } else {
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
    });

    // Banner Remove with the
    $(document).ready(function () {
      const banner_hidden_time = localStorage.getItem("banner_hidden_time");
      const now = Date.now();

      if (!banner_hidden_time || parseInt(banner_hidden_time) < now) {
        addClassToBodyToHandleBannerVisibility();
      } else {
        removeClassToBodyToHandleBannerVisibility();
      }

      $(document).on("click", ".sgsb-pd-banner-bar-remove", function () {
        $(".sgsb-pd-banner-bar-wrapper").css("transform", "translateY(-100%)");
        setTimeout(removeClassToBodyToHandleBannerVisibility, 500);
        localStorage.setItem("banner_hidden_time", now + 10 * 60 * 1000);
      });
    });
  } else {
    console.log("banner_device_view is undefined or empty.");
  }
})(jQuery);
