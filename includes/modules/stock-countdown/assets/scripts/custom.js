'use strict';

jQuery(document).ready( function($) {
  // Stock progress bar.
  $('.jqmeter-container').jQMeter({
    goal: $('.wpbsc_total_sale').attr('total-stock'),
    raised: $('.wpbsc_total_sale').attr('total-sale'),
    meterOrientation: 'horizontal',
    width: '100%',
    height: $('.wpbsc_total_sale').data('height') + "px",
    bgColor: $('.wpbsc_total_sale').data('bgcolor'),
    barColor: $('.wpbsc_total_sale').attr('fgcolor'),
    displayTotal: false,
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
