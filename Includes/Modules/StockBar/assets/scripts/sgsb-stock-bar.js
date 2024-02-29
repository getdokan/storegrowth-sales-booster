"use strict";

jQuery(document).ready(function ($) {
  // Stock progress bar.
  sgsb_stockbar_jqmeter();
  showStockProgress();
  sgsb_stockbar_variations();
});

function sgsb_stockbar_jqmeter() {
  jQuery(".jqmeter-container").each(function (event) {
    var goal = jQuery(this).parent().attr("total-stock");
    var raised = jQuery(this).parent().attr("total-sale");
    var height = jQuery(this).parent().data("height") + "px";
    var bgColor = jQuery(this).parent().data("bgcolor");
    var barColor = jQuery(this).parent().data("fgcolor");
    jQuery(this).jQMeter({
      goal: goal,
      raised: raised,
      meterOrientation: "horizontal",
      width: "100%",
      height: height,
      bgColor: bgColor,
      displayTotal: false,
    });
    jQuery(this).find(".inner-therm").css({ background: barColor });
  });
}

function sgsb_stockbar_variations() {
  jQuery("form.variations_form").on(
    "show_variation",
    function (event, variation) {
      showStockProgress();
    },
  );
}

function showStockProgress() {
  let order_progress = jQuery(".sgsb-stock-progress").attr(
    "data-order-progress",
  );
  jQuery(".sgsb-stock-progress").animate({ width: `${order_progress}%` }, 1300);
}
