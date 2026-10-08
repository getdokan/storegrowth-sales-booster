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

interface NumberFieldBaseProps extends BaseFieldProps {
    /** Unit shown in a box after the input, e.g. `px`. */
    suffix?: string;
    /** Unit shown in a box before the input, e.g. a currency symbol. */
    prefix?: string;
    min?: number;
    max?: number;
    step?: number;
}

export type NumberFieldProps = NumberFieldBaseProps &
    (
        | {
              allowEmpty?: false;
              value: number;
              onChange: ( value: number ) => void;
          }
        | {
              /** Emptying the input emits `''` (`allow_empty` settings). */
              allowEmpty: true;
              value: number | '';
              onChange: ( value: number | '' ) => void;
          }
    );

/**
 * @since SPSG_VERSION
 *
 * @param props            Props.
 * @param props.label      Label.
 * @param props.value      Value.
 * @param props.onChange   Change handler.
 * @param props.suffix     Unit after.
 * @param props.prefix     Unit before.
 * @param props.min        Minimum.
 * @param props.max        Maximum.
 * @param props.step       Step.
 * @param props.allowEmpty Emptying emits `''`.
 * @param props.locked     Pro field without pro.
 * @param props.error      Error message.
 * @param props.help       Help line.
 * @param props.id         Input id.
 */
export function NumberField( {
    label,
    value,
    onChange,
    suffix,
    prefix,
    min,
    max,
    step,
    allowEmpty = false,
    locked,
    error,
    help,
    id,
}: NumberFieldProps ) {
    const fallbackId = useId();
    const inputId = id ?? fallbackId;
    const emit = onChange as ( next: number | '' ) => void;

    // The typed text, so the field can be empty while editing.
    const [ text, setText ] = useState( String( value ) );
    useEffect( () => setText( String( value ) ), [ value ] );

    const inputProps = {
        id: inputId,
        type: 'number',
        value: text,
        min,
        max,
        step,
        disabled: locked,
        'aria-invalid': !! error,
        onChange: ( event: { target: { value: string } } ) => {
            setText( event.target.value );
            if ( event.target.value !== '' ) {
                emit( Number( event.target.value ) );
            } else if ( allowEmpty ) {
                emit( '' );
            }
        },
        // Left empty: show the current value again.
        onBlur: () => setText( String( value ) ),
    };

    const addon = ( unit: string, align: 'inline-start' | 'inline-end' ) => (
        <InputGroupAddon
            align={ align }
            className={
                align === 'inline-end'
                    ? 'h-full self-stretch rounded-r-[5px] border-l border-sg-stroke bg-sg-suffix px-4 py-0'
                    : 'h-full self-stretch rounded-l-[5px] border-r border-sg-stroke bg-sg-suffix px-4 py-0'
            }
        >
            <InputGroupText className="text-sm text-sg-text">
                { unit }
            </InputGroupText>
        </InputGroupAddon>
    );

    return (
        <div className="flex w-full flex-col items-start gap-2">
            <FieldLabel htmlFor={ inputId } locked={ locked }>
                { label }
            </FieldLabel>
            { suffix || prefix ? (
                <InputGroup className="h-10 rounded-[5px] border-sg-stroke bg-white shadow-none has-[[data-slot=input-group-control]:focus-visible]:border-sg-brand has-[[data-slot=input-group-control]:focus-visible]:ring-sg-brand/25">
                    { prefix && addon( prefix, 'inline-start' ) }
                    <InputGroupInput
                        { ...inputProps }
                        className="h-full px-4 text-sm text-sg-text"
                    />
                    { suffix && addon( suffix, 'inline-end' ) }
                </InputGroup>
            ) : (
                <Input { ...inputProps } className={ FIELD_CONTROL } />
            ) }
            <FieldNotes help={ help } error={ error } />
        </div>
    );
}
