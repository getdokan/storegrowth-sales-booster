;( function ( $ ){
    let bogoType = $('#bogo_type');
    let bogoProducts = $('.alt-bogo-products');
    let bogoSettings = $('.alt-bogo-categories, .exclude-bogo-products');

    // Function to handle visibility based on selection
    function toggleVisibility() {
        if (bogoType.val() === 'products') {
            bogoProducts.show();
            bogoSettings.hide();
        } else if (bogoType.val() === 'categories') {
            bogoProducts.hide();
            bogoSettings.show();
        }
    }

    // Initial visibility setup based on the default value or user selection
    toggleVisibility();

    // Event listener for changes in the Bogo Type dropdown
    bogoType.on('change', function() {
        toggleVisibility();
    });

    const toggleBogoSettings = () => {
        if ( $( '#bogo_status' ).is( ':checked' ) ) {
            $( '#bogo_settings_fields' ).show();
        } else {
            $( '#bogo_settings_fields' ).hide();
        }
    }

    $( '#bogo_deal_type' ).on( 'change', function ( event ) {
        if ( event.target.value === 'different' ) {
            $( '#different-product-field' ).show();
        } else {
            $( '#different-product-field' ).hide();
        }
    } );

    $( '#offer_type' ).on( 'change', function ( event ) {
        if ( event.target.value === 'discount' ) {
            $( '._sgsb_bogo_product_discount_percentage_field' ).show();
        } else {
            $( '._sgsb_bogo_product_discount_percentage_field' ).hide();
        }
    } );

    // Run on page load
    toggleBogoSettings();

    // Run on change of the BOGO enabled checkbox
    $( '#bogo_status' ).on( 'change', function() {
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
    $( '#_sgsb_get_multiple_product_field, #_sgsb_get_multiple_category_field, #_sgsb_bogo_available_variable_products, #_sgsb_offer_day_schedule, #_sgsb_get_product_exclude_field' )
        .select2({ multiple : true });
})(jQuery);
