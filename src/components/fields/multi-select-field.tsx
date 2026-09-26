/**
 * Multi-select field: label above plugin-ui's Combobox with chips. Takes a
 * static list (`options`) or searches as the user types (`onSearch`, e.g.
 * products), with an optional cap (`max`, e.g. the lite limit).
 *
 * @since SPSG_VERSION
 */
import {
    Combobox,
    ComboboxChip,
    ComboboxChips,
    ComboboxChipsInput,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxItem,
    ComboboxList,
    useComboboxAnchor,
} from '@wedevs/plugin-ui';
import { useEffect, useId, useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';

import { type BaseFieldProps, FieldLabel, FieldNotes } from './field-label';

export interface MultiSelectOption {
    value: string | number;
    label: string;
}

export interface MultiSelectFieldProps extends BaseFieldProps {
    value: Array< string | number >;
    onChange: ( value: Array< string | number > ) => void;
    /** Fixed choices; filtered as the user types. */
    options?: MultiSelectOption[];
    /** Choices for a search text, e.g. from REST. */
    onSearch?: ( search: string ) => Promise< MultiSelectOption[] >;
    /** Labels for saved values the options don't hold, e.g. product names by id. */
    resolve?: (
        values: Array< string | number >
    ) => Promise< MultiSelectOption[] >;
    /** Most values; more can't be added. */
    max?: number;
    placeholder?: string;
}

/**
 * @since SPSG_VERSION
 *
 * @param props             Props.
 * @param props.label       Label.
 * @param props.value       Selected values.
 * @param props.onChange    Change handler.
 * @param props.options     Fixed choices.
 * @param props.onSearch    Search handler.
 * @param props.resolve     Labels for saved values.
 * @param props.max         Most values.
 * @param props.placeholder Placeholder.
 * @param props.locked      Pro field without pro.
 * @param props.error       Error message.
 * @param props.help        Help line.
 * @param props.id          Input id.
 */
export function MultiSelectField( {
    label,
    value,
    onChange,
    options,
    onSearch,
    resolve,
    max,
    placeholder,
    locked,
    error,
    help,
    id,
}: MultiSelectFieldProps ) {
    const fallbackId = useId();
    const inputId = id ?? fallbackId;
    const anchor = useComboboxAnchor();
    const [ query, setQuery ] = useState( '' );
    const [ results, setResults ] = useState< MultiSelectOption[] >( [] );
    // Labels seen so far, so chips keep their names between searches.
    const [ known, setKnown ] = useState< Map< string | number, string > >(
        () => new Map( ( options ?? [] ).map( ( o ) => [ o.value, o.label ] ) )
    );

    const remember = ( found: MultiSelectOption[] ) =>
        setKnown( ( current ) => {
            const next = new Map( current );
            found.forEach( ( option ) =>
                next.set( option.value, option.label )
            );
            return next;
        } );

    // Names of saved values (once).
    useEffect( () => {
        const missing = value.filter( ( item ) => ! known.has( item ) );

        if ( resolve && missing.length ) {
            resolve( missing )
                .then( remember )
                .catch( () => undefined );
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [] );

    // Search as the user types (debounced).
    useEffect( () => {
        if ( ! onSearch ) {
            return;
        }

        const timer = window.setTimeout( () => {
            onSearch( query )
                .then( ( found ) => {
                    remember( found );
                    setResults( found );
                } )
                .catch( () => setResults( [] ) );
        }, 250 );

        return () => window.clearTimeout( timer );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ query ] );

    const selected = value.map( ( item ) => ( {
        value: item,
        label: known.get( item ) ?? String( item ),
    } ) );
    const full = max !== undefined && value.length >= max;

    return (
        <div className="flex w-full flex-col items-start gap-2">
            <FieldLabel htmlFor={ inputId } locked={ locked }>
                { label }
            </FieldLabel>
            <Combobox
                items={ onSearch ? results : options ?? [] }
                multiple
                value={ selected }
                onValueChange={ ( next: MultiSelectOption[] ) => {
                    if ( max === undefined || next.length <= max ) {
                        onChange( next.map( ( option ) => option.value ) );
                    }
                } }
                onInputValueChange={ ( text: string ) => setQuery( text ) }
                itemToStringLabel={ ( option: MultiSelectOption ) =>
                    option.label
                }
                isItemEqualToValue={ (
                    a: MultiSelectOption,
                    b: MultiSelectOption
                ) => a.value === b.value }
                // Search results come filtered from the server.
                filter={ onSearch ? null : undefined }
                disabled={ locked }
            >
                <ComboboxChips
                    ref={ anchor }
                    className="min-h-10 w-full rounded-[5px] border-sg-stroke bg-white shadow-none focus-within:border-sg-brand focus-within:ring-sg-brand/25"
                >
                    { selected.map( ( option ) => (
                        <ComboboxChip key={ option.value }>
                            { option.label }
                        </ComboboxChip>
                    ) ) }
                    <ComboboxChipsInput
                        id={ inputId }
                        aria-invalid={ !! error }
                        placeholder={ selected.length ? '' : placeholder }
                        // wp-admin styles bare text inputs (border, padding).
                        className="m-0 h-7 border-0 bg-transparent p-0 text-sm text-sg-text shadow-none placeholder:text-sg-field focus:shadow-none"
                    />
                </ComboboxChips>
                <ComboboxContent anchor={ anchor }>
                    <ComboboxList>
                        { ( option: MultiSelectOption ) => (
                            <ComboboxItem
                                key={ option.value }
                                value={ option }
                                disabled={
                                    full && ! value.includes( option.value )
                                }
                            >
                                { option.label }
                            </ComboboxItem>
                        ) }
                    </ComboboxList>
                    <ComboboxEmpty>
                        { __( 'Nothing found.', 'storegrowth-sales-booster' ) }
                    </ComboboxEmpty>
                </ComboboxContent>
            </Combobox>
            <FieldNotes
                help={
                    help ??
                    ( max !== undefined
                        ? sprintf(
                              /* translators: %d: most items allowed. */
                              __( 'Up to %d.', 'storegrowth-sales-booster' ),
                              max
                          )
                        : undefined )
                }
                error={ error }
            />
        </div>
    );
}
