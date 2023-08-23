"use strict";

jQuery(document).ready(function ($) {
  // Stock progress bar.
  $(".jqmeter-container").each(function () {
    var goal = $(this).parent().attr("total-stock");
    var raised = $(this).parent().attr("total-sale");
    var height = $(this).parent().data("height") + "px";
    var bgColor = $(this).parent().data("bgcolor");
    var barColor = $(this).parent().data("fgcolor");
    $(this).jQMeter({
      goal: goal,
      raised: raised,
      meterOrientation: "horizontal",
      width: "100%",
      height: height,
      bgColor: bgColor,
      barColor: barColor,
      displayTotal: false,
    });
  });
  
  showStockProgress();
  $("form.variations_form").on("show_variation", function (event, variation) {
    showStockProgress();
  });

  function showStockProgress() {
    let order_progress = $(".sgsb-stock-progress").attr("data-order-progress");
    $(".sgsb-stock-progress").animate({ width: `${order_progress}%` }, 1300);
  }
});
