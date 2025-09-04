"use strict";

jQuery(document).ready(function ($) {
  spsg_countdown_timer_methods();
});

function spsg_countdown_timer_methods() {
  jQuery(".spsg-countdown-timer-items").each(function () {
    jQuery(this)
      .countdown(jQuery(this).data("end-date"))
      .on("update.countdown", function (event) {
        jQuery(this)
          .find("strong.spsg-countdown-timer-item-days")
          .html(event.strftime("%D"));
          jQuery(this)
          .find("strong.spsg-countdown-timer-item-hours")
          .html(event.strftime("%H"));
          jQuery(this)
          .find("strong.spsg-countdown-timer-item-minutes")
          .html(event.strftime("%M"));
          jQuery(this)
          .find("strong.spsg-countdown-timer-item-seconds")
          .html(event.strftime("%S"));
      });
  });
}
