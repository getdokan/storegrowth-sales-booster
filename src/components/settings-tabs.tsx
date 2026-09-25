/**
 * Settings tabs (design `.tabs` / `.tab`): grey pill with white selected tab,
 * a rule, then the selected panel. Keyboard: arrow keys move between tabs.
 *
 * @since SPSG_VERSION
 */
import { cn } from '@wedevs/plugin-ui';
import { useId, useRef, useState } from '@wordpress/element';
import type { KeyboardEvent, ReactNode } from 'react';

export interface SettingsTab {
    id: string;
    label: ReactNode;
    content: ReactNode;
}

export interface SettingsTabsProps {
    tabs: SettingsTab[];
    /** Accessible name of the tab list, e.g. "Stock Bar settings". */
    label: string;
    /** Initially selected tab id (default: the first). */
    defaultTab?: string;
}

/**
 * @since SPSG_VERSION
 *
 * @param props            Props.
 * @param props.tabs       Tabs with their panels.
 * @param props.label      Accessible name of the tab list.
 * @param props.defaultTab Initially selected tab id.
 */
export function SettingsTabs( { tabs, label, defaultTab }: SettingsTabsProps ) {
    const [ selected, setSelected ] = useState( defaultTab ?? tabs[ 0 ]?.id );
    const baseId = useId();
    const buttons = useRef< Array< HTMLButtonElement | null > >( [] );

    const onKeyDown = ( event: KeyboardEvent, index: number ) => {
        const step =
            { ArrowRight: 1, ArrowLeft: -1 }[ event.key as string ] ?? 0;

        if ( ! step ) {
            return;
        }

        event.preventDefault();
        const next = ( index + step + tabs.length ) % tabs.length;
        setSelected( tabs[ next ].id );
        buttons.current[ next ]?.focus();
    };

    const active = tabs.find( ( tab ) => tab.id === selected ) ?? tabs[ 0 ];

    return (
        <>
            <div
                role="tablist"
                aria-label={ label }
                className="inline-flex shrink-0 items-start gap-2 overflow-clip rounded-lg bg-sg-chip p-1"
            >
                { tabs.map( ( tab, index ) => {
                    const isSelected = tab.id === active?.id;

                    return (
                        <button
                            key={ tab.id }
                            ref={ ( node ) => {
                                buttons.current[ index ] = node;
                            } }
                            type="button"
                            role="tab"
                            id={ `${ baseId }-tab-${ tab.id }` }
                            aria-controls={ `${ baseId }-panel-${ tab.id }` }
                            aria-selected={ isSelected }
                            tabIndex={ isSelected ? 0 : -1 }
                            className={ cn(
                                'flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-md border-0 px-4 py-2 text-sm font-medium leading-5',
                                isSelected
                                    ? 'bg-white text-sg-brand shadow-[0_1px_1px_rgba(0,0,0,.05),0_2px_1px_rgba(0,0,0,.05)]'
                                    : 'bg-transparent text-sg-tertiary'
                            ) }
                            onClick={ () => setSelected( tab.id ) }
                            onKeyDown={ ( event ) => onKeyDown( event, index ) }
                        >
                            { tab.label }
                        </button>
                    );
                } ) }
            </div>
            { active && (
                <div
                    role="tabpanel"
                    id={ `${ baseId }-panel-${ active.id }` }
                    aria-labelledby={ `${ baseId }-tab-${ active.id }` }
                    className="flex w-full flex-col items-start gap-3"
                >
                    <div className="h-px w-full bg-sg-line" />
                    { active.content }
                </div>
            ) }
        </>
    );
}
