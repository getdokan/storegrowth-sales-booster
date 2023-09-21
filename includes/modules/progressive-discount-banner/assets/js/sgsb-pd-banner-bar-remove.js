(function ($) {
  console.log(sgsbLocalizedData);
  const addClassToBodyToHanleBannerVisibility = () => {
    document.body.classList.add("show_discount_banner");
  };
  const removeClassToBodyToHanleBannerVisibility = () => {
    document.body.classList.remove("show_discount_banner");
  };
  $(document).ready(function () {
    const banner_hidden_time = localStorage.getItem("banner_hidden_time");
    const now = Date.now();
    if (!banner_hidden_time || parseInt(banner_hidden_time) < now) {
      addClassToBodyToHanleBannerVisibility();
    } else {
      removeClassToBodyToHanleBannerVisibility();
    }
    $(document).on("click", ".sgsb-pd-banner-bar-remove", function () {
      $(".sgsb-pd-banner-bar-wrapper").css("transform", "translateY(-100%)");
      setTimeout(removeClassToBodyToHanleBannerVisibility, 500); // .5s second timeout used because the transition in css is .5s
      localStorage.setItem("banner_hidden_time", Date.now() + 10 * 60 * 1000);
    });
  });
})(jQuery);
