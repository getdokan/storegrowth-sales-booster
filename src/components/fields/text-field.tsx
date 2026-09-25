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
}: TextFieldProps ) {
    const fallbackId = useId();
    const inputId = id ?? fallbackId;

    return (
        <div className="flex w-full flex-col items-start gap-2">
            <FieldLabel htmlFor={ inputId } locked={ locked }>
                { label }
            </FieldLabel>
            <Input
                id={ inputId }
                className={ FIELD_CONTROL }
                value={ value }
                placeholder={ placeholder }
                disabled={ locked }
                aria-invalid={ !! error }
                onChange={ ( event ) => onChange( event.target.value ) }
            />
            <FieldNotes help={ help } error={ error } />
        </div>
    );
}
