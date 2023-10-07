import { __ } from '@wordpress/i18n';

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
