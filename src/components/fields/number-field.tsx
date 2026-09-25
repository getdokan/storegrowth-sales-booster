/**
 * Number field (design `.field` + `.input`, or `.suffix-input` with a unit
 * such as `px`), on plugin-ui's Input / InputGroup. Emits a `number`, the
 * settings API type.
 *
 * @since SPSG_VERSION
 */
import {
    Input,
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
    InputGroupText,
} from '@wedevs/plugin-ui';
import { useEffect, useId, useState } from '@wordpress/element';

import {
    type BaseFieldProps,
    FIELD_CONTROL,
    FieldLabel,
    FieldNotes,
} from './field-label';

export interface NumberFieldProps extends BaseFieldProps {
    value: number;
    onChange: ( value: number ) => void;
    /** Unit shown in a box after the input, e.g. `px`. */
    suffix?: string;
    min?: number;
    max?: number;
}

/**
 * @since SPSG_VERSION
 *
 * @param props          Props.
 * @param props.label    Label.
 * @param props.value    Value.
 * @param props.onChange Change handler.
 * @param props.suffix   Unit.
 * @param props.min      Minimum.
 * @param props.max      Maximum.
 * @param props.locked   Pro field without pro.
 * @param props.error    Error message.
 * @param props.help     Help line.
 * @param props.id       Input id.
 */
export function NumberField( {
    label,
    value,
    onChange,
    suffix,
    min,
    max,
    locked,
    error,
    help,
    id,
}: NumberFieldProps ) {
    const fallbackId = useId();
    const inputId = id ?? fallbackId;

    // The typed text, so the field can be empty while editing.
    const [ text, setText ] = useState( String( value ) );
    useEffect( () => setText( String( value ) ), [ value ] );

    const inputProps = {
        id: inputId,
        type: 'number',
        value: text,
        min,
        max,
        disabled: locked,
        'aria-invalid': !! error,
        onChange: ( event: { target: { value: string } } ) => {
            setText( event.target.value );
            if ( event.target.value !== '' ) {
                onChange( Number( event.target.value ) );
            }
        },
        // Left empty: show the current value again.
        onBlur: () => setText( String( value ) ),
    };

    return (
        <div className="flex w-full flex-col items-start gap-2">
            <FieldLabel htmlFor={ inputId } locked={ locked }>
                { label }
            </FieldLabel>
            { suffix ? (
                <InputGroup className="h-10 rounded-[5px] border-sg-stroke bg-white shadow-none has-[[data-slot=input-group-control]:focus-visible]:border-sg-brand has-[[data-slot=input-group-control]:focus-visible]:ring-sg-brand/25">
                    <InputGroupInput
                        { ...inputProps }
                        className="h-full px-4 text-sm text-sg-text"
                    />
                    <InputGroupAddon
                        align="inline-end"
                        className="h-full self-stretch rounded-r-[5px] border-l border-sg-stroke bg-sg-suffix px-4 py-0"
                    >
                        <InputGroupText className="text-sm text-sg-text">
                            { suffix }
                        </InputGroupText>
                    </InputGroupAddon>
                </InputGroup>
            ) : (
                <Input { ...inputProps } className={ FIELD_CONTROL } />
            ) }
            <FieldNotes help={ help } error={ error } />
        </div>
    );
}
