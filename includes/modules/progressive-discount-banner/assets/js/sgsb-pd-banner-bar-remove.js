(function ($) {
  // Check if sgsbLocalizedData is defined and not empty

  if (typeof sgsbLocalizedData !== "undefined") {
    const banner_device_view = sgsbLocalizedData.banner_device_view;

    const addClassToBodyToHandleBannerVisibility = () => {
      document.body.classList.add("show_discount_banner");
    };

    const removeClassToBodyToHandleBannerVisibility = () => {
      document.body.classList.remove("show_discount_banner");
    };

    function isMobileDevice() {
      // You can define your own criteria here, such as screen width
      // For example, consider devices with a screen width less than 768px as "mobile"
      return window.innerWidth <= 768;
    }

    // Banner device Visibility Controlling.
    $(document).ready(function () {
      
      const isMobile = isMobileDevice();
      const shouldHideMobile = banner_device_view.includes("banner-show-mobile") && isMobile;
      const shouldHideDesktop = banner_device_view.includes("banner-show-desktop") && !isMobile;
      
      if (!shouldHideMobile && !shouldHideDesktop) {
        $(".sgsb-pd-banner-bar-wrapper").remove();
        document.body.style.paddingTop = "0px";
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
