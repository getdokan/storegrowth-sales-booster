(function ($) {
  "use strict";

  // *************************************
  // Add target blank for upgrade button
  // *************************************
  $("#toplevel_page_sales-booster-for-woocommerce ul > li > a").each(function (e) {
    if ($(this).attr("href").indexOf("?page=go-sgsb-pro") > 0) {
      $(this).attr("target", "_blank");
      // Add hover effect
      $(this).hover(
        function() {
          $(this).css('color', 'yellowgreen');
        },
        function() {
          $(this).css('color', ''); // Revert to original color on hover out
        }
      );
    }
    if ($(this).attr("href").indexOf("?page=go-sgsb-docs") > 0) {
      $(this).attr("target", "_blank");
    }
  });

})(jQuery);
