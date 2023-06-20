;(function($) {
  $('.sgsb-pd-banner-bar-remove').click(function() {
    $('body').css('padding-top', '0');
    $('.sgsb-pd-banner-bar-wrapper').css('transition', 'transform 0.5s linear');
    $('.sgsb-pd-banner-bar-wrapper').css('transform', 'translateY(-100%)');

    setTimeout(function() {
      $('.sgsb-pd-banner-bar-wrapper').hide();
      $('html, body').animate({ scrollTop: 0 }, 'slow'); // Smooth scrolling to the top of the page
    }, 500); // Adjust the duration (in milliseconds) for the transition and scrolling delay

    localStorage.setItem('hideBannerUntil', Date.now() + 600000); // Store the current timestamp + 10 minutes (in milliseconds)
  });

  var hideBannerUntil = localStorage.getItem('hideBannerUntil');
  if (hideBannerUntil && Date.now() < hideBannerUntil) {
    $('.sgsb-pd-banner-bar-wrapper').hide();
    $('body').css('padding-top', '0');
  }
})(jQuery);

