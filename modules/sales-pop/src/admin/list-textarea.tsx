/**
 * A `list` setting edited as text (names separated by commas, locations one
 * per line). Keeps the typed text, so a trailing separator isn't removed
 * while typing; the list is what the text holds.
 *
 * @since SPSG_VERSION
 */
import { useEffect, useState } from '@wordpress/element';
import {
    TextareaField,
    type TextareaFieldProps,
} from '@storegrowth/components';

export interface ListTextareaProps
    extends Omit< TextareaFieldProps, 'value' | 'onChange' > {
    value: string[];
    onChange: ( value: string[] ) => void;
    /** `,` or a new line. */
    separator: string;
}

const toList = ( text: string, separator: string ) =>
    text
        .split( separator )
        .map( ( item ) => item.trim() )
        .filter( Boolean );

/**
 * @since SPSG_VERSION
 *
 * @param props           Props.
 * @param props.value     Items.
 * @param props.onChange  Change handler.
 * @param props.separator Separator.
 */
export function ListTextarea( {
    value,
    onChange,
    separator,
    ...props
}: ListTextareaProps ) {
    const join = ( items: string[] ) =>
        items.join( separator === ',' ? ', ' : separator );
    const [ text, setText ] = useState( join( value ) );

    // Reset or a new load: show the new items.
    useEffect( () => {
        if (
            toList( text, separator ).join( '\u0000' ) !==
            value.join( '\u0000' )
        ) {
            setText( join( value ) );
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ value ] );

    return (
        <TextareaField
            { ...props }
            value={ text }
            onChange={ ( next ) => {
                setText( next );
                onChange( toList( next, separator ) );
            } }
        />
    );
}
