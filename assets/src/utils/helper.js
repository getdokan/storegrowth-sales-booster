import { __ } from '@wordpress/i18n';

export const menuFix = ( slug ) => {
    const $ = jQuery;

    const location = window.location,
        hash = location.hash,
        menuRoot = $( '#toplevel_page_' + slug );

    const dashboardHashRoutes = [ '#/dashboard/overview', '#/dashboard/pricing', '#/dashboard/faq' ];

    // Handle dashboard activation slug for first time load.
    if ( dashboardHashRoutes.includes( hash ) ) {
        $( 'ul.wp-submenu li', menuRoot ).removeClass( 'current' );
        menuRoot.find( `li.wp-first-item` ).addClass( 'current' );
    }

    const currentUrl = location.href;
    // Handle activation slug for overall submenus.
    menuRoot.on( 'click', 'a', function () {
        const self = $( this );

        $( 'ul.wp-submenu li', menuRoot ).removeClass( 'current' );

        // Check if submenu class then active.
        if ( self.hasClass( 'wp-has-submenu' ) ) {
            $( 'li.wp-first-item', menuRoot ).addClass( 'current' );
        } else {
            self.parents( 'li' ).addClass( 'current' );
        }
    } );

    // Handle menu activation by submenu hyper ref checking.
    $( 'ul.wp-submenu a', menuRoot ).each( function ( index, el ) {
        if ( $( el ).attr( 'href' ) === currentUrl ) {
            $( el ).parent().addClass( 'current' );
        }
    } );
}

export const extractedTitle = ( title, length = 60 ) => {
    const extractedString = title?.substr( 0, length );
    return extractedString?.length >= length
        ? `${ extractedString }...`
        : extractedString;
}

export const wpMedia = ( {
    callback,
    title = __( 'Select or upload media.', 'storegrowth-sales-booster' ),
    selectMultiple = false,
    selectText = __( 'Select', 'storegrowth-sales-booster' ),
    fileType = 'image',
    dimension = {},
} ) => {
    const frame = wp.media( {
        title,
        button: {
            text: selectText,
        },
        library: {
            type: fileType,
        },
        multiple: selectMultiple, // Set to true to allow multiple files to be selected
    } );

    frame.open();

    // When an file is selected, run a callback.
    frame.on( 'select', () => {
        const attachment = frame.state().get( 'selection' ).first().toJSON();

        callback( attachment );
    } );
}
