'use strict';

jQuery(document).ready( function($) {

  $('.sgsb-countdown-timer-items').each(function() {
    $(this).countdown( $(this).data('end-date') )
        .on('update.countdown', function(event) {
        $(this).find('strong.sgsb-countdown-timer-item-days').html(event.strftime('%D'));
        $(this).find('strong.sgsb-countdown-timer-item-hours').html(event.strftime('%H'));
        $(this).find('strong.sgsb-countdown-timer-item-minutes').html(event.strftime('%M'));
        $(this).find('strong.sgsb-countdown-timer-item-seconds').html(event.strftime('%S'));
        });
  });

} );
