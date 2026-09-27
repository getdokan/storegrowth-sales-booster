/**
 * Text field (design `.field` + `.input`): label above a full-width
 * plugin-ui input.
 *
 * @since SPSG_VERSION
 */
import { Input } from '@wedevs/plugin-ui';
import { useId } from '@wordpress/element';

import {
    type BaseFieldProps,
    FIELD_CONTROL,
    FieldLabel,
    FieldNotes,
} from './field-label';

export interface TextFieldProps extends BaseFieldProps {
    value: string;
    onChange: ( value: string ) => void;
    placeholder?: string;
    /** `date` edits a `Y-m-d` value with the browser's date picker. */
    type?: 'text' | 'url' | 'date';
    /**
     * Longest text that can be typed, shown as a `n / max` counter. Only the
     * input limits it: a longer stored value still shows and saves.
     */
    maxLength?: number;
}

/**
 * @since SPSG_VERSION
 *
 * @param props             Props.
 * @param props.label       Label.
 * @param props.value       Value.
 * @param props.onChange    Change handler.
 * @param props.locked      Pro field without pro.
 * @param props.error       Error message.
 * @param props.help        Help line.
 * @param props.id          Input id.
 * @param props.placeholder Placeholder.
 * @param props.type        Input type.
 * @param props.maxLength   Longest text, with a counter.
 */
export function TextField( {
    label,
    value,
    onChange,
    locked,
    error,
    help,
    id,
    placeholder,
    type = 'text',
    maxLength,
}: TextFieldProps ) {
    const fallbackId = useId();
    const inputId = id ?? fallbackId;

    return (
        <div className="flex w-full flex-col items-start gap-2">
            <div className="flex w-full items-center justify-between gap-2">
                <FieldLabel htmlFor={ inputId } locked={ locked }>
                    { label }
                </FieldLabel>
                { maxLength !== undefined && (
                    <span className="text-xs text-sg-help" aria-hidden>
                        { value.length } / { maxLength }
                    </span>
                ) }
            </div>
            <Input
                id={ inputId }
                type={ type }
                className={ FIELD_CONTROL }
                value={ value }
                maxLength={ maxLength }
                placeholder={ placeholder }
                disabled={ locked }
                aria-invalid={ !! error }
                onChange={ ( event ) => onChange( event.target.value ) }
            />
            <FieldNotes help={ help } error={ error } />
        </div>
    );
}
