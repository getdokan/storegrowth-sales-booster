(function ($) {
  // Check if spsgLocalizedData is defined and not empty

  if (typeof spsg_fsb_data !== "undefined") {
    let banner_device_view = spsg_fsb_data.banner_device_view;
    let bar_position = spsg_fsb_data.bar_position;
    let banner_delay = spsg_fsb_data.banner_delay;
    let scroll_banner_delay = spsg_fsb_data.scroll_banner_delay;
    let banner_trigger = spsg_fsb_data.banner_trigger;
    let banner_height = spsg_fsb_data.banner_height;
    let body_top_padding = parseInt(banner_height) + 10;
    const banner_hidden_time = localStorage.getItem("banner_hidden_time");
    const now = Date.now();
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
      document.body.classList.add("body-padding-transition");
      if("top" ===bar_position){
        return (document.body.style.paddingTop = `${body_top_padding}px`);
      }else{
        return (document.body.style.paddingBottom = `${body_top_padding}px`);
      }
    };

    const bannerShow = () => {
      if (!bannerExists()) {
        return;
      }
      $(".spsg-pd-banner-bar-wrapper").fadeIn(1000);
      paddingAdderBody();
    };

    const bannerHide = () => {
      $(".spsg-pd-banner-bar-wrapper").hide();
      paddingRemoverBody();
    };
    const bannerExists = () => {
      return $(".spsg-pd-banner-bar-wrapper").length > 0;
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
        banner_device_view?.includes("banner-show-mobile") && isMobile;
      const shouldHideDesktop =
        banner_device_view?.includes("banner-show-desktop") && !isMobile;

      if (!shouldHideMobile && !shouldHideDesktop) {
        $(".spsg-pd-banner-bar-wrapper").remove();
        paddingRemoverBody();
      } else {
        if (
          (!banner_hidden_time || parseInt(banner_hidden_time) < now)
        ) {
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
      if (!banner_hidden_time || parseInt(banner_hidden_time) < now) {
        addClassToBodyToHandleBannerVisibility();
      } else {
        removeClassToBodyToHandleBannerVisibility();
      }

      $(document).on("click", ".spsg-pd-banner-bar-remove", function () {
        const slideDirection = bar_position !== 'top' ? 'translateY(500%)' : 'translateY(-500%)',
          offset = document.body.classList.contains( 'admin-bar' ) ? 32 : 0;
        $( '.spsg-pd-banner-bar-wrapper' ).css( 'transform', slideDirection );
        paddingRemoverBody();
        setTimeout(removeClassToBodyToHandleBannerVisibility, 500);
        localStorage.setItem("banner_hidden_time", now + 10 * 60 * 1000);
        $( '.spsg-floating-notification-bar-wrapper' ).css({ top: `${ offset }px` });
      });
    });
  } else {
    console.error("banner_device_view is undefined or empty.");
  }
})(jQuery);
