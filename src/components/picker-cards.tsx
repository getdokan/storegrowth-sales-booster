/**
 * Picker cards (design `.pick-grid` / `.pick`): a grid of choices, each a
 * miniature (`art`) over its label, as a plugin-ui ToggleGroup. A pro choice
 * without pro stays visible, disabled with the Pro badge.
 *
 * @since SPSG_VERSION
 */
import { ToggleGroup, ToggleGroupItem, cn } from '@wedevs/plugin-ui';
import type { ReactNode } from 'react';

import { ProBadge } from './fields/field-label';

export interface PickerCardOption {
    value: string;
    label: string;
    /** Miniature drawn above the label. */
    art: ReactNode;
    /** Not selectable (a pro choice without pro). */
    locked?: boolean;
}

export interface PickerCardsProps {
    /** Accessible name of the group. */
    label: string;
    options: PickerCardOption[];
    value: string;
    onChange: ( value: string ) => void;
    columns?: 2 | 3;
    /** The whole field is pro and pro isn't active. */
    locked?: boolean;
}

/**
 * @since SPSG_VERSION
 *
 * @param props          Props.
 * @param props.label    Group name.
 * @param props.options  Choices.
 * @param props.value    Current value.
 * @param props.onChange Change handler.
 * @param props.columns  Grid columns.
 * @param props.locked   Not editable.
 */
export function PickerCards( {
    label,
    options,
    value,
    onChange,
    columns = 2,
    locked = false,
}: PickerCardsProps ) {
    return (
        <ToggleGroup
            aria-label={ label }
            value={ [ value ] }
            // Clicking the selected card empties the group; keep it.
            onValueChange={ ( next ) => next[ 0 ] && onChange( next[ 0 ] ) }
            disabled={ locked }
            spacing={ 3 }
            className={ cn(
                'grid w-full gap-3',
                columns === 3
                    ? 'grid-cols-3 max-[620px]:grid-cols-2'
                    : 'grid-cols-2'
            ) }
        >
            { options.map( ( option ) => (
                <ToggleGroupItem
                    key={ option.value }
                    value={ option.value }
                    disabled={ option.locked }
                    className="relative h-auto w-full min-w-0 flex-col items-stretch gap-2 whitespace-normal rounded-lg border border-solid border-[#E9E9E9] bg-white p-2 text-center font-normal hover:border-[#C9D8EE] hover:bg-white disabled:opacity-100 aria-pressed:border-sg-brand aria-pressed:bg-white aria-pressed:shadow-[0_0_0_3px_rgba(8,117,255,.18)]"
                >
                    { /* A locked card fades; its Pro badge stays readable. */ }
                    <span
                        className={ cn(
                            'flex flex-col gap-2',
                            ( option.locked || locked ) && 'opacity-60'
                        ) }
                    >
                        { option.art }
                        <span className="text-xs font-medium text-sg-text">
                            { option.label }
                        </span>
                    </span>
                    { option.locked && (
                        <span className="absolute right-1.5 top-1.5">
                            <ProBadge />
                        </span>
                    ) }
                </ToggleGroupItem>
            ) ) }
        </ToggleGroup>
    );
}
