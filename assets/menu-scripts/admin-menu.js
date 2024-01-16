(function ($) {
  "use strict";

  // *************************************
  // Add target blank for upgrade button
  // *************************************
  $("#toplevel_page_sales-booster-for-woocommerce ul > li > a").each(function (
    e
  ) {
    if ($(this).attr("href").indexOf("?page=go-sgsb-pro") > 0) {
      $(this).attr("target", "_blank");
      // Add hover effect
      $(this).hover(
        function () {
          $(this).css("color", "yellowgreen");
        },
        function () {
          $(this).css("color", ""); // Revert to original color on hover out
        }
      );
    }
    if ($(this).attr("href").indexOf("?page=go-sgsb-docs") > 0) {
      $(this).attr("target", "_blank");
    }
  });

  // *************************************
  // Target the admin menu and remove it
  // *************************************

  let currentPath = window.location.hash;
  console.log(currentPath);
  if ("#/ini-setup" === currentPath || "#ini-setup" === currentPath) {
    console.log("from jquery");
    $("#wpadminbar , #adminmenumain").remove();

    $(".wp-toolbar").css({
      padding: "0", // Replace with your desired background color
    });
    $("#wpcontent, #wpfooter").css({
      marginLeft:"0",
      background: "#fff", // Replace with your desired background color
    });
    $(".notice").remove();
  }
})(jQuery);
