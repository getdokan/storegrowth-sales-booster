(function ($) {
  const addClassToBodyToHanleBannerVisibility = () => {
    document.body.classList.add("show_floating_notification_bar");
  };
  const removeClassToBodyToHanleBannerVisibility = () => {
    document.body.classList.remove("show_floating_notification_bar");
  };
  $(document).ready(function () {
    const fn_banner_hidden_time = localStorage.getItem("fn_banner_hidden_time");
    const now = Date.now();
    if (!fn_banner_hidden_time || parseInt(fn_banner_hidden_time) < now) {
      addClassToBodyToHanleBannerVisibility();
    } else {
      removeClassToBodyToHanleBannerVisibility();
    }
    $(document).on("click", ".sgsb-floating-notification-bar-remove", function () {
      $(".sgsb-floating-notification-bar-wrapper").css("transform", "translateY(-100%)");
      setTimeout(removeClassToBodyToHanleBannerVisibility, 500); // .5s second timeout used because the transition in css is .5s
      localStorage.setItem("fn_banner_hidden_time", Date.now() + 10 * 60 * 1000);
    });
  });
})(jQuery);
