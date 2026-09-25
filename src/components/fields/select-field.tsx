/**
 * Select field (design `.field` + `.select`): label above a native select.
 *
 * @since SPSG_VERSION
 */
import { cn } from '@wedevs/plugin-ui';
import { useId } from '@wordpress/element';
import { ChevronDown } from 'lucide-react';

import {
    type BaseFieldProps,
    FIELD_CONTROL,
    FieldLabel,
    FieldNotes,
} from './field-label';

export interface SelectOption {
    value: string;
    label: string;
}

export interface SelectFieldProps extends BaseFieldProps {
    value: string;
    onChange: ( value: string ) => void;
    options: SelectOption[];
}

/**
 * @since SPSG_VERSION
 *
 * @param props          Props.
 * @param props.label    Label.
 * @param props.value    Selected value.
 * @param props.onChange Change handler.
 * @param props.options  Options.
 * @param props.locked   Pro field without pro.
 * @param props.error    Error message.
 * @param props.help     Help line.
 * @param props.id       Select id.
 */
export function SelectField( {
    label,
    value,
    onChange,
    options,
    locked,
    error,
    help,
    id,
}: SelectFieldProps ) {
    const fallbackId = useId();
    const selectId = id ?? fallbackId;

    return (
        <div className="flex w-full flex-col items-start gap-2">
            <FieldLabel htmlFor={ selectId } locked={ locked }>
                { label }
            </FieldLabel>
            <div className="relative w-full">
                <select
                    id={ selectId }
                    // wp-admin gives selects its own arrow and a 25rem max-width.
                    className={ cn(
                        FIELD_CONTROL,
                        'max-w-none appearance-none border bg-none pr-10 outline-none'
                    ) }
                    value={ value }
                    disabled={ locked }
                    onChange={ ( event ) => onChange( event.target.value ) }
                >
                    { options.map( ( option ) => (
                        <option key={ option.value } value={ option.value }>
                            { option.label }
                        </option>
                    ) ) }
                </select>
                <ChevronDown
                    className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-sg-text"
                    strokeWidth={ 1.5 }
                    aria-hidden
                />
            </div>
            <FieldNotes help={ help } error={ error } />
        </div>
    );
}
