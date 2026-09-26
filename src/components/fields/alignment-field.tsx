/**
 * Alignment field (design `.tabs` with `.tab--icon` radios): label on the
 * left, left / center / right icon toggle (plugin-ui ToggleGroup) on the right.
 *
 * @since SPSG_VERSION
 */
import { ToggleGroup, ToggleGroupItem } from '@wedevs/plugin-ui';
import { __ } from '@wordpress/i18n';
import { AlignCenter, AlignLeft, AlignRight } from 'lucide-react';

import { type BaseFieldProps, FieldNotes, ProBadge } from './field-label';

export type Alignment = 'left' | 'center' | 'right';

/**
 * An alignment as a flex alignment (`align-items` / `align-self`), as the
 * storefront prints it.
 *
 * @since SPSG_VERSION
 */
export const ALIGNMENT_FLEX: Record< Alignment, string > = {
    left: 'flex-start',
    center: 'center',
    right: 'flex-end',
};

export interface AlignmentFieldProps extends BaseFieldProps {
    value: Alignment;
    onChange: ( value: Alignment ) => void;
    /** Accessible name when the visible label repeats on the page, e.g. "Counter alignment". */
    name?: string;
}

const OPTIONS = [
    {
        value: 'left' as const,
        label: __( 'Align left', 'storegrowth-sales-booster' ),
        Icon: AlignLeft,
    },
    {
        value: 'center' as const,
        label: __( 'Align center', 'storegrowth-sales-booster' ),
        Icon: AlignCenter,
    },
    {
        value: 'right' as const,
        label: __( 'Align right', 'storegrowth-sales-booster' ),
        Icon: AlignRight,
    },
];

/**
 * @since SPSG_VERSION
 *
 * @param props          Props.
 * @param props.label    Label.
 * @param props.value    Alignment.
 * @param props.onChange Change handler.
 * @param props.locked   Pro field without pro.
 * @param props.name     Accessible name.
 * @param props.error    Error message.
 * @param props.help     Help line.
 */
export function AlignmentField( {
    label,
    value,
    onChange,
    locked,
    name,
    error,
    help,
}: AlignmentFieldProps ) {
    return (
        <div className="flex w-full flex-col gap-1">
            <div className="flex w-full items-center justify-between gap-4">
                <span className="flex items-center gap-2 text-sm font-medium text-sg-text">
                    { label }
                    { locked && <ProBadge /> }
                </span>
                <ToggleGroup
                    aria-label={ name ?? String( label ) }
                    value={ [ value ] }
                    // Clicking the pressed item empties the group; keep the value.
                    onValueChange={ ( next ) =>
                        next[ 0 ] && onChange( next[ 0 ] as Alignment )
                    }
                    disabled={ locked }
                    spacing={ 2 }
                    className="shrink-0 rounded-lg bg-sg-chip p-1"
                >
                    { OPTIONS.map( ( option ) => (
                        <ToggleGroupItem
                            key={ option.value }
                            value={ option.value }
                            aria-label={ option.label }
                            className="size-9 p-2 text-sg-tertiary hover:bg-white/60 aria-pressed:bg-white aria-pressed:text-sg-brand aria-pressed:shadow-[0_1px_1px_rgba(0,0,0,.05),0_2px_1px_rgba(0,0,0,.05)]"
                        >
                            <option.Icon
                                className="size-5"
                                strokeWidth={ 1.5 }
                            />
                        </ToggleGroupItem>
                    ) ) }
                </ToggleGroup>
            </div>
            <FieldNotes help={ help } error={ error } />
        </div>
    );
}
