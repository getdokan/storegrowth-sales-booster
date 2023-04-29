;(function($){
	var popup_all_properties = popup_info.popup_all_properties;
	var popup_position       = popup_all_properties.popup_position;
	var message_popup        = popup_all_properties.message_popup;
	var next_time_display    = popup_all_properties.next_time_display;
	var initial_time_delay   = popup_all_properties.initial_time_delay;
	message_popup            = message_popup?message_popup:'please prepare you message';

	var country = new Array ();
	country     = popup_info.random_popup_country;
	var finalCountry = country.map((item,i)=>{

			var countryStringToArray =  item.split(',');
			// for city
			var cityColor       = popup_all_properties.city_text_color;
			var cityFontSize    = popup_all_properties.city_text_font_size+"px";
			var cityFontWeight  = popup_all_properties.city_text_font_weight;
			var cityStyle       = "color:" + cityColor+ ";font-size:" + cityFontSize +";font-weight:" + cityFontWeight;
			// for state
			var stateColor      = popup_all_properties.state_text_color;
			var stateFontSize   = popup_all_properties.state_text_font_size+"px";
			var stateFontWeight = popup_all_properties.state_text_font_weight;
			var stateStyle      = "color:" + stateColor+ ";font-size:" + stateFontSize +";font-weight:" + stateFontWeight;
			// for country
			var countryColor      = popup_all_properties.country_text_color;
			var countryFontSize   = popup_all_properties.country_text_font_size+"px";
			var countryFontWeight = popup_all_properties.country_text_font_weight;
			var countryStyle      = "color:" + countryColor+ ";font-size:" + countryFontSize +";font-weight:" + countryFontWeight;


			if ( countryStringToArray.length == 3 ) {
				var city    = "<span style=" + cityStyle    + ">" + countryStringToArray[0] + "</span>, ";
				var state   = "<span style=" + stateStyle   + ">" + countryStringToArray[1] + "</span>, ";
				var country = "<span style=" + countryStyle + ">" + countryStringToArray[2] + "</span>";
				return city + state + country;
			} else {
				var state   = "<span style=" + stateStyle   + ">" + countryStringToArray[0] + "</span>, ";
				var country = "<span style=" + countryStyle + ">" + countryStringToArray[1] + "</span>";
				return state + country;
			}

					
	})

	country = finalCountry
 
	var product_image = popup_info.product_image_url;
	var product_url   = popup_info.product_url;
	var products      = popup_info.product_list;
	var virtual_name  = popup_info.virtual_name;
	
	function popupContentGenerator() {
		var nameRandom            = Math.floor( virtual_name.length*Math.random() );
		var countryRandom         = Math.floor( country.length*Math.random() );
		var productAndImageRandom = Math.floor( product_image.length*Math.random() );

		$('#virtual_name').text( virtual_name[ nameRandom ] );
		$('#country').html( country[countryRandom] );
		$("#product_url").attr( "href", product_url[ productAndImageRandom ] );
		$("#image_of_product").attr( "src", product_image[ productAndImageRandom ] );
		$('#product').text( products[ productAndImageRandom ] );
		var timeVal = Math.floor( 11*Math.random() );
		$('#time').text( timeVal );

		$(".custom-social-proof").css('display', 'block');

		if ( popup_position == 'right_top' ) {
			$(".custom-social-proof").css('top', '20px');
			$(".custom-social-proof").css('right', '20px');
		}

		if ( popup_position == 'left_top' ) {
			$(".custom-social-proof").css('top', '20px');
			$(".custom-social-proof").css('left', '20px');
		}

		if ( popup_position == 'right_bottom' ) {
			$(".custom-social-proof").css('bottom', '20px');
			$(".custom-social-proof").css('right', '20px');
		}

		if ( popup_position == 'left_bottom' ) {
			$(".custom-social-proof").css('bottom', '20px');
			$(".custom-social-proof").css('left', '20px');
			$(".custom-social-proof").css('transition', 'bottom 1.2s ease');
		}
		setTimeout( popDownContentGenerator, next_time_display*1000 );
	}
	
	function popDownContentGenerator() {
		if ( popup_position == 'right_top' || popup_position == 'left_top') {
			$(".custom-social-proof").css('top', '-150px');
		}

		if ( popup_position == 'right_bottom' || popup_position == 'left_bottom') {
			$(".custom-social-proof").css('bottom', '-150px');
			$(".custom-social-proof").css('transition', 'bottom 1.2s ease');
		}
		setTimeout( popupContentGenerator, 3000 );
	}

	var testMessage = message_popup.replaceAll(/\s+/g,' ').trim();
	var testMessage = testMessage.replace('{product_title}', $("#popup_title").html());
	var testMessage = testMessage.replace('{virtual_name}', $("#popup_virtual_name").html());
	var testMessage = testMessage.replace('{location}',$("#popup_location").html());
	var testMessage = testMessage.replace('{time}', $("#popup_time").html());
	var testMessage = testMessage.replaceAll(/\s+/g,' ').trim();
	var testMessage = testMessage.replaceAll('<>', '');


	$('.custom-notification-content').html(testMessage);

	setTimeout(popupContentGenerator, initial_time_delay*1000);
	$( ".custom-close").click( function() {
			$(".custom-social-proof").stop().slideToggle('slow');
	} );

} )(jQuery);