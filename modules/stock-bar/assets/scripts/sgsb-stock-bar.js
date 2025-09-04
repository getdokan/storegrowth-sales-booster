"use strict";

jQuery(document).ready(function ($) {
  // Stock progress bar.
  spsg_stockbar_jqmeter();
  showStockProgress();
  spsg_stockbar_variations();
});

function spsg_stockbar_jqmeter() {
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

function spsg_stockbar_variations() {
  jQuery("form.variations_form").on(
    "show_variation",
    function (event, variation) {
      showStockProgress();
    },
  );
}

function showStockProgress() {
  let order_progress = jQuery(".spsg-stock-progress").attr(
    "data-order-progress",
  );
  jQuery(".spsg-stock-progress").animate({ width: `${order_progress}%` }, 1300);
}
