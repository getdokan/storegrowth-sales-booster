/**
 * One compact text-style row (design Text Style card): label, colour swatch,
 * size and weight side by side, and a Pro pill at the end when locked (so
 * the columns stay aligned). `TextStyleHeader` labels the columns once.
 *
 * @since SPSG_VERSION
 */
import {
    Input,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@wedevs/plugin-ui';
import { __, sprintf } from '@wordpress/i18n';

import { ColorPicker } from '../color-picker';
import { FIELD_CONTROL, FIELD_LABEL, ProBadge } from './field-label';
import type { SelectOption } from './select-field';

export interface TextStyleRowProps {
    label: string;
    color: string;
    size: number;
    weight: string;
    onChange: ( part: 'color' | 'size' | 'weight', value: string ) => void;
    weights: SelectOption[];
    /** Pro row without pro. */
    locked?: boolean;
}

const LABEL = `${ FIELD_LABEL } w-[104px] shrink-0 whitespace-nowrap`;

/**
 * Column titles over the rows.
 *
 * @since SPSG_VERSION
 */
export function TextStyleHeader() {
    return (
        <div className="flex w-full items-center gap-3" aria-hidden>
            <span className="w-[104px] shrink-0" />
            <span className="flex flex-1 items-center gap-2 text-[11px] font-medium text-sg-help">
                <span className="w-8 shrink-0 text-center">
                    { __( 'Color', 'storegrowth-sales-booster' ) }
                </span>
                <span className="w-[52px] shrink-0 text-center">
                    { __( 'Size', 'storegrowth-sales-booster' ) }
                </span>
                <span className="flex-1">
                    { __( 'Weight', 'storegrowth-sales-booster' ) }
                </span>
            </span>
        </div>
    );
}

/**
 * @since SPSG_VERSION
 *
 * @param props          Props.
 * @param props.label    Row label, e.g. "Product Name".
 * @param props.color    Hex colour.
 * @param props.size     Font size (px).
 * @param props.weight   Font weight.
 * @param props.onChange Change handler for one part.
 * @param props.weights  Weight options.
 * @param props.locked   Pro row without pro.
 */
export function TextStyleRow( {
    label,
    color,
    size,
    weight,
    onChange,
    weights,
    locked,
}: TextStyleRowProps ) {
    const name = ( part: string ) =>
        /* translators: 1: text row, e.g. "Time"; 2: "color", "size" or "weight". */
        sprintf( __( '%1$s %2$s', 'storegrowth-sales-booster' ), label, part );

    return (
        <div className="flex w-full items-center gap-3">
            <span className={ LABEL }>{ label }</span>
            <span className="flex min-w-0 flex-1 items-center gap-2">
                <ColorPicker
                    value={ color }
                    disabled={ locked }
                    aria-label={ name(
                        __( 'color', 'storegrowth-sales-booster' )
                    ) }
                    onChange={ ( value ) => onChange( 'color', value ) }
                />
                <Input
                    type="number"
                    min={ 0 }
                    className={ `${ FIELD_CONTROL } w-[52px] shrink-0 px-2 text-center` }
                    value={ size }
                    disabled={ locked }
                    aria-label={ name(
                        __( 'size', 'storegrowth-sales-booster' )
                    ) }
                    onChange={ ( event ) =>
                        event.target.value !== '' &&
                        onChange( 'size', event.target.value )
                    }
                />
                <Select
                    items={ weights }
                    value={ weight }
                    disabled={ locked }
                    onValueChange={ ( next ) =>
                        next !== null && onChange( 'weight', next )
                    }
                >
                    <SelectTrigger
                        aria-label={ name(
                            __( 'weight', 'storegrowth-sales-booster' )
                        ) }
                        className={ `${ FIELD_CONTROL } min-w-0 flex-1 border ps-3 pe-3 data-[size=default]:h-10` }
                    >
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        { weights.map( ( option ) => (
                            <SelectItem
                                key={ option.value }
                                value={ option.value }
                                className="cursor-pointer"
                            >
                                { option.label }
                            </SelectItem>
                        ) ) }
                    </SelectContent>
                </Select>
            </span>
            { locked && <ProBadge /> }
        </div>
    );
}
