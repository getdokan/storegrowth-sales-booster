;(function($){
	var popup_all_properties  = popup_info.popup_all_properties;
	var popup_position        = popup_all_properties.popup_position;
	var message_popup         = popup_all_properties.message_popup;
	var display_time				  = popup_all_properties.dispaly_time;
	var next_time_display     = popup_all_properties.next_time_display;
	var initial_time_delay    = popup_all_properties.initial_time_delay;
	var notification_per_page = popup_all_properties.notification_per_page;
	var mobile_view						= popup_all_properties.mobile_view;
	var product_random				= popup_all_properties.product_random;
	var link_new_tab					= popup_all_properties.open_product_link_in_new_tab;
	var visibility_behaviour	= popup_all_properties.enble_visibility;
	var notification_count 	  = 0;
	
	message_popup             = message_popup?message_popup:'please prepare you message';

    // for city
    const cityColor       = popup_all_properties.city_text_color;
    const cityFontSize    = popup_all_properties.city_text_font_size+"px";
    const cityFontWeight  = popup_all_properties.city_text_font_weight;
    const cityStyle       = "color:" + cityColor+ ";font-size:" + cityFontSize +";font-weight:" + cityFontWeight;
    // for state
    const stateColor      = popup_all_properties.state_text_color;
    const stateFontSize   = popup_all_properties.state_text_font_size+"px";
    const stateFontWeight = popup_all_properties.state_text_font_weight;
    const stateStyle      = "color:" + stateColor+ ";font-size:" + stateFontSize +";font-weight:" + stateFontWeight;
    // for country
    const countryColor      = popup_all_properties.country_text_color;
    const countryFontSize   = popup_all_properties.country_text_font_size+"px";
    const countryFontWeight = popup_all_properties.country_text_font_weight;
    const countryStyle      = "color:" + countryColor+ ";font-size:" + countryFontSize +";font-weight:" + countryFontWeight;

	let countryArray     = Array.isArray(popup_info.virtual_locations) ? popup_info.virtual_locations : [];
	countryArray = countryArray.map((item,i)=>{
			const countryStringToArray = (typeof item === 'string' ? item : "").split(',');
            const city    = countryStringToArray[0] ? `<span style="${cityStyle}" >${countryStringToArray[0]}</span>` : "";
            const state   = countryStringToArray[1] ? `<span style="${stateStyle}" >${city ? ',' : ''} ${countryStringToArray[1]}</span>` : "";
            const country = countryStringToArray[2] ? `<span style="${countryStyle}" >${city || state ? ',' : ''} ${countryStringToArray[2]}</span>` : "";
            return `${city}${state}${country}`;
	})
	var product_image = popup_info.product_image_url;
	var product_url   = popup_info.product_url;
	var products      = popup_info.product_list;
	var virtual_name  = popup_info.virtual_name;
	var productAndImage;



	function getRandomProductImage() {
			if (product_random) {
				return Math.floor(product_image.length * Math.random());
			} else {
				return notification_count % product_image.length;
			}
		}

	function popupContentGenerator() {
		var nameRandom            = Math.floor( virtual_name.length*Math.random() );
		var countryRandom         = Math.floor( countryArray.length*Math.random() );
		productAndImage = getRandomProductImage();

		$('#virtual_name').text( virtual_name[ nameRandom ] );
		$('#country').html( countryArray[countryRandom] );
		$("#product_url").attr( "href", product_url[ productAndImage ] );
        $("#image_of_product").attr( "src", product_image[ productAndImage ] || popup_info.fallback_image_url );
        $('#product').text( products[ productAndImage ] );
        $('#product').css({ fontWeight: popup_all_properties.product_title_font_weight });
		$("#product_url_title").attr( "href", product_url[ productAndImage ] );
		var timeVal = Math.floor(Math.random() * 59);
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

		notification_count++;
        // Handle popup rendering if recurring disabled.
        if ( !popup_all_properties?.loop && notification_count === ( popup_all_properties?.popup_products?.length + 1 ) ) {
            $(".custom-social-proof").remove();
            return;
        }

        setTimeout( popDownContentGenerator, display_time*1000 );
	}


    function popDownContentGenerator() {
		if ( popup_position == 'right_top' || popup_position == 'left_top') {
			$(".custom-social-proof").css('top', '-150px');
		}

		if ( popup_position == 'right_bottom' || popup_position == 'left_bottom') {
			$(".custom-social-proof").css('bottom', '-150px');
			$(".custom-social-proof").css('transition', 'bottom 1.2s ease');
		}

		if ( notification_count > notification_per_page) {
			return;
		}

        setTimeout( popupContentGenerator, next_time_display*1000 );
	}

    var testMessage = message_popup.replaceAll(/\s+/g,' ').trim();
	var testMessage = testMessage.replace('{product_title}', $("#popup_title").html());
	var testMessage = testMessage.replace('{virtual_name}', $("#popup_virtual_name").html());
	var testMessage = testMessage.replace('{location}',$("#popup_location").html());
	var testMessage = testMessage.replace('{time}', $("#popup_time").html());
	var testMessage = testMessage.replaceAll(/\s+/g,' ').trim();
	var testMessage = testMessage.replaceAll('<>', '');
	$('.custom-notification-content').html(testMessage);
	if(link_new_tab){
		$("#product_url_title").attr( "target", '_blank' );
	}
	

	if (notification_per_page !== '0' && notification_per_page !== '') {
		setTimeout(popupContentGenerator, initial_time_delay * 1000);
	}
	

	$(".custom-close").click(function() {
			if (visibility_behaviour) {
					$(".custom-social-proof").remove();
			} else {
					$(".custom-social-proof").stop().slideToggle('slow');
			}
	});

	function handlePopupVisibility() {
		var windowWidth = $(window).width();
		var popupWidth						=popup_all_properties.popup_width;

		if (windowWidth <= 320) {
			popupWidth = 300;
		} else if (windowWidth <= 425) {
			popupWidth = 350;
		}

    if (!mobile_view && windowWidth <= 767) {
      $(".custom-notification").css('display', 'none');
    } else {
      $(".custom-notification").css('display', 'block').css('width',popupWidth+'px');
    }
  }

  $(window).on('load resize', function() {
    handlePopupVisibility();
  });

} )(jQuery);


// Initial check when the page loads
