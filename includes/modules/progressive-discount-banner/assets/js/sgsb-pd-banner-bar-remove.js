;(function($) {
  $('.sgsb-pd-banner-bar-remove').click(function() {
    $('.sgsb-pd-banner-bar-wrapper').hide();
    localStorage.setItem('hideBannerUntil', Date.now() + 600000); // Store the current timestamp + 10 minutes (in milliseconds)
  });

  var hideBannerUntil = localStorage.getItem('hideBannerUntil');
  if (hideBannerUntil && Date.now() < hideBannerUntil) {
    $('.sgsb-pd-banner-bar-wrapper').hide();
  }
})(jQuery);
