/**
 * Alignment field (design `.tabs` with `.tab--icon` radios): label on the
 * left, left / center / right icon toggle (plugin-ui ToggleGroup) on the right.
 *
 * @since SPSG_VERSION
 */
import { ToggleGroup, ToggleGroupItem } from '@wedevs/plugin-ui';
import { __ } from '@wordpress/i18n';
import { AlignCenter, AlignLeft, AlignRight } from 'lucide-react';

import { type BaseFieldProps, ProBadge } from './field-label';

export type Alignment = 'left' | 'center' | 'right';

export interface AlignmentFieldProps extends BaseFieldProps {
    value: Alignment;
    onChange: ( value: Alignment ) => void;
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
 */
export function AlignmentField( {
    label,
    value,
    onChange,
    locked,
}: AlignmentFieldProps ) {
    return (
        <div className="flex w-full items-center justify-between gap-4">
            <span className="flex items-center gap-2 text-sm font-medium text-sg-text">
                { label }
                { locked && <ProBadge /> }
            </span>
            <ToggleGroup
                aria-label={ typeof label === 'string' ? label : undefined }
                value={ [ value ] }
                // Clicking the pressed item empties the group; keep the value.
                onValueChange={ ( next ) =>
                    next[ 0 ] && onChange( next[ 0 ] as Alignment )
                }
                disabled={ locked }
                spacing={ 2 }
                className="shrink-0 rounded-lg bg-sg-chip p-1"
            >
                { OPTIONS.map( ( { value: option, label: name, Icon } ) => (
                    <ToggleGroupItem
                        key={ option }
                        value={ option }
                        aria-label={ name }
                        className="size-9 p-2 text-sg-tertiary hover:bg-white/60 aria-pressed:bg-white aria-pressed:text-sg-brand aria-pressed:shadow-[0_1px_1px_rgba(0,0,0,.05),0_2px_1px_rgba(0,0,0,.05)]"
                    >
                        <Icon className="size-5" strokeWidth={ 1.5 } />
                    </ToggleGroupItem>
                ) ) }
            </ToggleGroup>
        </div>
    );
}
