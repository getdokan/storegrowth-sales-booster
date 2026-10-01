/**
 * Collapsible settings group (design `.acc`): bordered box with a title, help
 * line and chevron; open by default. With `toggle` the header carries a
 * switch instead (design: Button / Countdown cards) and the body shows while
 * it's on.
 *
 * @since SPSG_VERSION
 */
import { Button, cn } from '@wedevs/plugin-ui';
import { useId, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { ChevronUp } from 'lucide-react';
import type { ReactNode } from 'react';

import { ProBadge } from './fields/field-label';
import { ToggleSwitch } from './toggle-switch';

export interface AccordionToggle {
    checked: boolean;
    onChange: ( checked: boolean ) => void;
    /** The switch needs pro. */
    locked?: boolean;
    /** Text beside the switch (default "Show"). */
    label?: string;
}

export interface AccordionProps {
    title: ReactNode;
    /** Grey line under the title. */
    help?: ReactNode;
    /** Start collapsed. */
    defaultOpen?: boolean;
    /** A switch in the header instead of the chevron. */
    toggle?: AccordionToggle;
    children: ReactNode;
    className?: string;
}

/**
 * @since SPSG_VERSION
 *
 * @param props             Props.
 * @param props.title       Group title.
 * @param props.help        Line under the title.
 * @param props.defaultOpen Open on first render (default true).
 * @param props.toggle      Header switch.
 * @param props.children    Fields.
 * @param props.className   Extra classes.
 */
export function Accordion( {
    title,
    help,
    defaultOpen = true,
    toggle,
    children,
    className,
}: AccordionProps ) {
    const [ open, setOpen ] = useState( defaultOpen );
    const bodyId = useId();
    const switchId = useId();
    const classes = cn(
        'flex w-full flex-col items-start gap-3 rounded-[5px] border border-sg-stroke bg-white p-4',
        className
    );

    if ( toggle ) {
        return (
            <section className={ classes }>
                <div className="flex w-full items-center justify-between gap-3">
                    <span className="flex min-w-px flex-1 flex-col items-start gap-2">
                        <label
                            htmlFor={ switchId }
                            className="flex items-center gap-2 text-base font-bold text-sg-text"
                        >
                            { title }
                            { toggle.locked && <ProBadge /> }
                        </label>
                        { help && (
                            <span className="text-xs leading-[1.4] text-sg-help">
                                { help }
                            </span>
                        ) }
                    </span>
                    <span className="flex shrink-0 items-center gap-2 text-sm text-sg-text">
                        <ToggleSwitch
                            id={ switchId }
                            checked={ toggle.checked }
                            disabled={ toggle.locked }
                            onCheckedChange={ toggle.onChange }
                        />
                        { toggle.label ??
                            __( 'Show', 'storegrowth-sales-booster' ) }
                    </span>
                </div>
                { toggle.checked && (
                    <>
                        <div className="h-px w-full bg-sg-line" />
                        <div className="flex w-full flex-col items-start gap-4">
                            { children }
                        </div>
                    </>
                ) }
            </section>
        );
    }

    return (
        <section className={ classes }>
            <Button
                variant="ghost"
                className="h-auto w-full justify-start gap-3 whitespace-normal rounded-none border-0 p-0 text-left font-normal hover:bg-transparent aria-expanded:bg-transparent"
                aria-expanded={ open }
                aria-controls={ open ? bodyId : undefined }
                onClick={ () => setOpen( ( value ) => ! value ) }
            >
                <span className="flex min-w-px flex-1 flex-col items-start gap-2">
                    <span className="text-base font-bold text-sg-text">
                        { title }
                    </span>
                    { help && (
                        <span className="text-xs leading-[1.4] text-sg-help">
                            { help }
                        </span>
                    ) }
                </span>
                <ChevronUp
                    className={ cn(
                        'size-6 shrink-0 transition-transform duration-150',
                        open ? 'text-sg-brand' : 'rotate-180 text-sg-help'
                    ) }
                    strokeWidth={ 1.5 }
                    aria-hidden
                />
            </Button>
            { open && (
                <>
                    <div className="h-px w-full bg-sg-line" />
                    <div
                        id={ bodyId }
                        className="flex w-full flex-col items-start gap-4"
                    >
                        { children }
                    </div>
                </>
            ) }
        </section>
    );
}
