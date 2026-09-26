/**
 * Margin / padding field (design `.box-input` + `.box-link`): label on the
 * left; on the right, two inputs (vertical, horizontal) or, after the link
 * toggle, four (top, right, bottom, left). plugin-ui Input and Toggle.
 *
 * @since SPSG_VERSION
 */
import { Input, Toggle, cn } from '@wedevs/plugin-ui';
import { useEffect, useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { Dice2 } from 'lucide-react';
import type { BoxValue } from '@storegrowth/utilities';

import {
    type BaseFieldProps,
    FIELD_CONTROL,
    FieldNotes,
    ProBadge,
} from './field-label';

export interface BoxModelFieldProps extends Omit< BaseFieldProps, 'label' > {
    /** Visible label, also used in the inputs' accessible names. */
    label: string;
    value: BoxValue;
    onChange: ( value: BoxValue ) => void;
    /** Accessible name when the label repeats on the page, e.g. "Counter margin". */
    name?: string;
}

type Side = keyof BoxValue;

const SIDES: Side[] = [ 'top', 'right', 'bottom', 'left' ];

const SIDE_NAMES: Record< Side, string > = {
    top: __( 'top', 'storegrowth-sales-booster' ),
    right: __( 'right', 'storegrowth-sales-booster' ),
    bottom: __( 'bottom', 'storegrowth-sales-booster' ),
    left: __( 'left', 'storegrowth-sales-booster' ),
};

const VERTICAL = __( 'vertical', 'storegrowth-sales-booster' );
const HORIZONTAL = __( 'horizontal', 'storegrowth-sales-booster' );

interface SideInputProps {
    value: number;
    onChange: ( value: number ) => void;
    disabled?: boolean;
    'aria-label': string;
}

/**
 * One number input; keeps the typed text so it can be empty while editing.
 *
 * @param props            Props.
 * @param props.value      Pixels.
 * @param props.onChange   Change handler.
 * @param props.disabled   Not editable.
 * @param props.aria-label Accessible name.
 */
function SideInput( { value, onChange, ...props }: SideInputProps ) {
    const [ text, setText ] = useState( String( value ) );
    useEffect( () => setText( String( value ) ), [ value ] );

    return (
        <Input
            { ...props }
            type="number"
            min={ 0 }
            className={ cn( FIELD_CONTROL, 'w-[68px]' ) }
            value={ text }
            onChange={ ( event ) => {
                setText( event.target.value );
                if ( event.target.value !== '' ) {
                    onChange( Number( event.target.value ) );
                }
            } }
            // Left empty: show the current value again.
            onBlur={ () => setText( String( value ) ) }
        />
    );
}

/**
 * @since SPSG_VERSION
 *
 * @param props          Props.
 * @param props.label    Label, e.g. "Margin".
 * @param props.value    Sides.
 * @param props.onChange Change handler.
 * @param props.locked   Pro field without pro.
 * @param props.error    Error message.
 * @param props.help     Help line.
 * @param props.name     Accessible name (default: the label).
 */
export function BoxModelField( {
    label,
    value,
    onChange,
    locked,
    error,
    help,
    name = label,
}: BoxModelFieldProps ) {
    // Per-side mode when the sides differ; otherwise the pair.
    const [ perSide, setPerSide ] = useState(
        value.top !== value.bottom || value.left !== value.right
    );

    const set = ( sides: Side[], input: number ) => {
        const next = { ...value };
        sides.forEach( ( side ) => {
            next[ side ] = input;
        } );
        onChange( next );
    };

    const inputs: Array< { sides: Side[]; part: string } > = perSide
        ? SIDES.map( ( side ) => ( {
              sides: [ side ],
              part: SIDE_NAMES[ side ],
          } ) )
        : [
              { sides: [ 'top', 'bottom' ], part: VERTICAL },
              { sides: [ 'left', 'right' ], part: HORIZONTAL },
          ];

    return (
        <div className="flex w-full flex-col gap-1">
            <div className="flex w-full items-start justify-between gap-4">
                <span className="flex items-center gap-2 pt-2.5 text-sm font-medium text-sg-text">
                    { label }
                    { locked && <ProBadge /> }
                </span>
                <div className="flex shrink-0 items-start gap-2">
                    <div className="grid grid-cols-2 gap-2">
                        { inputs.map( ( { sides, part } ) => (
                            <SideInput
                                key={ part }
                                value={ value[ sides[ 0 ] ] }
                                disabled={ locked }
                                aria-label={ `${ name } ${ part }` }
                                onChange={ ( input ) => set( sides, input ) }
                            />
                        ) ) }
                    </div>
                    <Toggle
                        pressed={ perSide }
                        onPressedChange={ setPerSide }
                        disabled={ locked }
                        aria-label={ sprintf(
                            /* translators: %s: field name, e.g. "Margin" or "Counter margin". */
                            __(
                                'Set %s per side',
                                'storegrowth-sales-booster'
                            ),
                            name.toLowerCase()
                        ) }
                        className="h-10 w-8 min-w-8 px-0 text-sg-help hover:bg-sg-chip hover:text-sg-text aria-pressed:bg-transparent aria-pressed:text-sg-brand"
                    >
                        <Dice2 className="size-5" strokeWidth={ 1.5 } />
                    </Toggle>
                </div>
            </div>
            <FieldNotes help={ help } error={ error } />
        </div>
    );
}
