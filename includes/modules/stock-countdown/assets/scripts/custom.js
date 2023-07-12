'use strict';

jQuery(document).ready( function($) {
  // Stock progress bar.
  $(".jqmeter-container").each(function () {
    var goal = $(this).parent().attr('total-stock');
    var raised = $(this).parent().attr('total-sale');
    var height = $(this).parent().data('height') + 'px';
    var bgColor = $(this).parent().data('bgcolor');
    var barColor = $(this).parent().data('fgcolor');
    $(this).jQMeter({
        goal: goal,
        raised: raised,
        meterOrientation: 'horizontal',
        width: '100%',
        height: height,
        bgColor: bgColor,
        barColor: barColor,
        displayTotal: false,
    });
});

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