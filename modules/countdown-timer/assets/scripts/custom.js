"use strict";

jQuery(document).ready(function ($) {
  sgsb_countdown_timer_methods();
});

function sgsb_countdown_timer_methods() {
  jQuery(".sgsb-countdown-timer-items").each(function () {
    jQuery(this)
      .countdown(jQuery(this).data("end-date"))
      .on("update.countdown", function (event) {
        jQuery(this)
          .find("strong.sgsb-countdown-timer-item-days")
          .html(event.strftime("%D"));
          jQuery(this)
          .find("strong.sgsb-countdown-timer-item-hours")
          .html(event.strftime("%H"));
          jQuery(this)
          .find("strong.sgsb-countdown-timer-item-minutes")
          .html(event.strftime("%M"));
          jQuery(this)
          .find("strong.sgsb-countdown-timer-item-seconds")
          .html(event.strftime("%S"));
      });
  });
}
