;( function ( $ ){
    const toggleBogoSettings = () => {
        if ( $( '#_sgsb_bogo_enabled' ).is( ':checked' ) ) {
            $( '#bogo_settings_fields' ).show();
        } else {
            $( '#bogo_settings_fields' ).hide();
        }
    }

    $( '#_sgsb_bogo_deal_type' ).on( 'change', function ( event ) {
        if ( event.target.value === 'different' ) {
            $( '#different-product-field' ).show();
        } else {
            $( '#different-product-field' ).hide();
        }
    } );

    $( '#_sgsb_bogo_product_offer_type' ).on( 'change', function ( event ) {
        if ( event.target.value === 'discount' ) {
            $( '._sgsb_bogo_product_discount_percentage_field' ).show();
        } else {
            $( '._sgsb_bogo_product_discount_percentage_field' ).hide();
        }
    } );

    // Run on page load
    toggleBogoSettings();

    // Run on change of the BOGO enabled checkbox
    $( '#_sgsb_bogo_enabled' ).on( 'change', function() {
        toggleBogoSettings();
    } );

    $('#_bogo_badge_image').on( 'click', function(e) {
        e.preventDefault();

        var imageUploader = wp.media({
            'title': 'Upload Image',
            'button': {
                'text': 'Use this image'
            },
            'multiple': false
        }).on('select', function() {
            var image = imageUploader.state().get('selection').first().toJSON();
            $('#_bogo_badge_image').val(image.url);
        }).open();
    });

    $( '#_sgsb_get_product_field' ).select2({ allowClear : true });
    $( '#_sgsb_get_multiple_product_field, #_sgsb_get_multiple_category_field, #_sgsb_bogo_available_variable_products, #_sgsb_offer_day_schedule' )
        .select2({ multiple : true });
})(jQuery);
