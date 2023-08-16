'use strict';

jQuery(document).ready( function($) {

  $('.sgsb-stock-counter-items').each(function() {
    $(this).countdown( $(this).data('end-date') )
        .on('update.countdown', function(event) {
        $(this).find('strong.sgsb-stock-counter-item-days').html(event.strftime('%D'));
        $(this).find('strong.sgsb-stock-counter-item-hours').html(event.strftime('%H'));
        $(this).find('strong.sgsb-stock-counter-item-minutes').html(event.strftime('%M'));
        $(this).find('strong.sgsb-stock-counter-item-seconds').html(event.strftime('%S'));
        });
  });

} );
